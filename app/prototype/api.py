import hmac
import secrets
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func, select, delete
from sqlalchemy.exc import IntegrityError
from .auth import (current_user, digest, get_db, issue_token, owned,
                   password_hash, password_ok)
from .config import cfg
from .db import counter, limit
from .models import (Attribution, AuthToken, BonusAccount, BonusEntry, DB, Document,
                     Job, Order, Refund, Reward, Session, User, now)
from .schemas import Buy, Credentials, Draft, EmailInput, Plan, Register, Reset, TokenInput
from . import bonus, documents, payments
from .providers import ProviderError, YooKassa


app = FastAPI(title='AI GostDoc — closed personal sandbox',version='0.1.0',
              openapi_url='/api/v1/openapi.json')


@app.middleware('http')
async def private_gate(request: Request, call_next):
    if request.url.path == '/health':
        return await call_next(request)
    origin = request.headers.get('origin')
    if origin and origin not in cfg.ORIGINS.split(','):
        return JSONResponse({'detail':'origin_rejected'},403)
    # Webhook has no cookie privileges: it only triggers authenticated server-side verification.
    if request.method != 'OPTIONS' and request.url.path != '/api/v1/payments/webhook':
        if not hmac.compare_digest(request.headers.get('X-Prototype-Key',''),cfg.PROTOTYPE_KEY):
            return JSONResponse({'detail':'closed_prototype'},403)
    try:
        length = int(request.headers.get('content-length','0'))
    except ValueError:
        return JSONResponse({'detail':'invalid_content_length'},400)
    if length > 32768:
        return JSONResponse({'detail':'request_too_large'},413)
    result = await call_next(request)
    result.headers['Cache-Control'] = 'no-store'
    result.headers['X-Content-Type-Options'] = 'nosniff'
    return result


app.add_middleware(CORSMiddleware,allow_origins=cfg.ORIGINS.split(','),allow_credentials=True,
                   allow_methods=['GET','POST','PUT','DELETE','OPTIONS'],
                   allow_headers=['Content-Type','X-CSRF-Token','X-Prototype-Key'])


@app.exception_handler(ProviderError)
async def provider_error(request, exc):
    return JSONResponse({'detail':exc.code,'retryable':exc.retryable,'retry_after':exc.retry_after},503)


@app.exception_handler(IntegrityError)
async def conflict(request, exc):
    return JSONResponse({'detail':'conflict_retry'},409)


@app.get('/health')
def health():
    return {'status':'ok','mode':'personal_sandbox','production':False}


def rate(db, request, kind, maximum=20):
    ip = digest(request.client.host if request.client else 'local')
    if not limit(db,f'rate:{kind}:{ip}:{now()//3600}',maximum):
        db.commit()
        raise HTTPException(429,'rate_limit')


def profile(user):
    return {'id':user.id,'email':user.email,'verified':user.verified,'referral_code':user.referral_code}


@app.post('/api/v1/auth/register',status_code=201)
def register(body: Register, request: Request, db=Depends(get_db)):
    rate(db,request,'register',20)
    email = str(body.email).lower()
    if db.scalar(select(User).where(User.email == email)):
        db.commit()
        raise HTTPException(409,'email_exists')
    inviter = None
    code = request.cookies.get('gd_ref') or body.referral_code
    if code:
        inviter = db.scalar(select(User).where(User.referral_code == code,User.verified.is_(True)))
        if not inviter or inviter.email == email:
            raise HTTPException(422,'invalid_referral')
    user = User(email=email,password=password_hash(body.password))
    db.add(user)
    db.flush()
    db.add(BonusAccount(user_id=user.id))
    if inviter:
        db.add(Attribution(invited=user.id,inviter=inviter.id))
    issue_token(db,user,'verify')
    db.commit()
    return {**profile(user),'mail_mode':'private_local_sink'}


@app.post('/api/v1/auth/verify')
def verify_email(body: TokenInput, request: Request, db=Depends(get_db)):
    rate(db,request,'token')
    t = db.scalar(select(AuthToken).where(AuthToken.id == digest(body.token)).with_for_update())
    if not t or t.kind != 'verify' or t.used or t.expires <= now():
        db.commit()
        raise HTTPException(400,'invalid_or_expired_token')
    t.used = True
    db.get(User,t.user_id).verified = True
    db.commit()
    return {'verified':True}


@app.post('/api/v1/auth/login')
def login(body: Credentials, request: Request, response: Response, db=Depends(get_db)):
    rate(db,request,'login')
    user = db.scalar(select(User).where(User.email == str(body.email).lower()))
    ok = password_ok(body.password,user.password if user else password_hash('dummy-password-value'))
    if not user or not ok:
        db.commit()
        raise HTTPException(401,'invalid_credentials')
    if not user.verified:
        db.commit()
        raise HTTPException(403,'email_verification_required')
    token,csrf = secrets.token_urlsafe(32),secrets.token_urlsafe(32)
    db.add(Session(id=digest(token),user_id=user.id,csrf=csrf,expires=now()+7*86400))
    db.commit()
    response.set_cookie('gd_session',token,max_age=7*86400,httponly=True,
                        secure=cfg.COOKIE_SECURE,samesite='strict',path='/')
    return {'user':profile(user),'csrf_token':csrf}


@app.get('/api/v1/auth/me')
def me(request: Request, user=Depends(current_user)):
    return {'user':profile(user),'csrf_token':request.state.session.csrf}


@app.post('/api/v1/auth/logout')
def logout(request: Request,response: Response,user=Depends(current_user),db=Depends(get_db)):
    db.delete(request.state.session)
    db.commit()
    response.delete_cookie('gd_session',path='/')
    return {'logged_out':True}


@app.post('/api/v1/auth/reset-request')
def reset_request(body: EmailInput,request: Request,db=Depends(get_db)):
    rate(db,request,'reset',10)
    user = db.scalar(select(User).where(User.email == str(body.email).lower()))
    if user:
        issue_token(db,user,'reset')
    db.commit()
    return {'accepted':True,'mail_mode':'private_local_sink'}


@app.post('/api/v1/auth/reset')
def reset_password(body: Reset,request: Request,db=Depends(get_db)):
    rate(db,request,'token')
    t = db.scalar(select(AuthToken).where(AuthToken.id == digest(body.token)).with_for_update())
    if not t or t.used or t.kind != 'reset' or t.expires <= now():
        db.commit()
        raise HTTPException(400,'invalid_or_expired_token')
    t.used = True
    db.get(User,t.user_id).password = password_hash(body.password)
    db.execute(delete(Session).where(Session.user_id == t.user_id))
    db.execute(delete(AuthToken).where(AuthToken.user_id == t.user_id,AuthToken.id != t.id))
    db.commit()
    return {'reset':True,'login_required':True}


@app.get('/api/v1/referrals/capture/{code}')
def referral_cookie(code: str,request: Request,response: Response,db=Depends(get_db)):
    if not db.scalar(select(User.id).where(User.referral_code == code,User.verified.is_(True))):
        raise HTTPException(404,'referral_not_found')
    if not request.cookies.get('gd_ref'):
        response.set_cookie('gd_ref',code,max_age=30*86400,httponly=True,secure=cfg.COOKIE_SECURE,samesite='lax')
    return {'captured':True}


@app.get('/api/v1/catalog')
def catalog():
    return {'mode':'sandbox','price_kopecks':30000,'bonus_hundredths':30000,'currency':'RUB',
            'retention_days':90,'types':['abstract','coursework','vkr'],'max_sections':6,
            'scope':'short_personal_test','sources_automatically_verified':False,'mail_mode':'private_local_sink', 'payment_mode':'personal_mock' if cfg.MOCK_PAYMENTS else 'yukassa_test'}


@app.post('/api/v1/quote')
def quote(body: Draft):
    return {'price_kopecks':30000,'bonus_hundredths':30000,'campaign':'sandbox-v1','storage_days':90}


def reserve_budget(db,amount):
    if not cfg.GROQ_API_KEY:
        raise HTTPException(503,'groq_key_missing')
    if not limit(db,f'admission:{now()//86400}',cfg.DAILY_TOKENS,amount):
        raise HTTPException(429,'daily_ai_budget_reserved')


def job_view(job,doc):
    return {'id':job.id,'document_id':job.document_id,'order_id':job.order_id,'kind':job.kind,'provider':'groq','model':job.model,
            'status':job.state,**documents.progress(job,doc),'heartbeat':job.heartbeat,
            'retry_at':job.retry_at or None,'error':job.error,'attempts':job.attempts,
            'tokens':{'reported':job.usage,'charged_conservative':job.charged,'budget':job.budget}}


def doc_view(db,doc):
    order = db.scalar(select(Order).where(Order.document_id == doc.id))
    jobs = db.scalars(select(Job).where(Job.document_id == doc.id).order_by(Job.created)).all()
    return {'id':doc.id,'topic':doc.topic,'doc_type':doc.doc_type,'state':doc.state,'plan':doc.plan,
            'approved_plan':doc.approved_plan,'created':doc.created,'expires':doc.expires,
            'order':order_view(db,order) if order else None,'jobs':[job_view(j,doc) for j in jobs],
            'download_url':f'/api/v1/documents/{doc.id}/download' if doc.file_hash and doc.expires > now() else None}


@app.post('/api/v1/documents',status_code=202)
def create_draft(body: Draft,request: Request,user=Depends(current_user),db=Depends(get_db)):
    # Serialize per-user and global admission; limit unpaid work before spending API quota.
    counter(db,'draft-admission')
    unpaid = db.scalar(select(func.count()).select_from(Document).where(Document.user_id == user.id,
                             Document.state.in_(['planning','plan_ready','approved'])))
    if unpaid >= 2:
        raise HTTPException(409,'too_many_unpaid_drafts')
    if db.scalar(select(func.count()).select_from(Document)) >= cfg.MAX_DOCS:
        raise HTTPException(409,'personal_storage_limit')
    rate(db,request,'plan',10)
    if not limit(db,f'plans:{user.id}:{now()//86400}',5):
        raise HTTPException(429,'plan_daily_limit')
    reserve_budget(db,7000)
    doc = Document(user_id=user.id,topic=body.topic,doc_type=body.doc_type)
    db.add(doc)
    db.flush()
    job = Job(document_id=doc.id,kind='plan',budget=7000)
    db.add(job)
    db.commit()
    return {'document_id':doc.id,'job_id':job.id,'status':'planning'}


@app.put('/api/v1/documents/{id}/plan')
def edit_plan(id: str,body: Plan,user=Depends(current_user),db=Depends(get_db)):
    doc = owned(db,Document,id,user)
    db.refresh(doc,with_for_update=True)
    if doc.state != 'plan_ready':
        raise HTTPException(409,'plan_not_editable')
    doc.plan = body.model_dump()
    db.commit()
    return {'plan':doc.plan}


@app.delete('/api/v1/documents/{id}')
def archive_draft(id: str,user=Depends(current_user),db=Depends(get_db)):
    doc = owned(db,Document,id,user)
    jobs = db.scalars(select(Job).where(Job.document_id == id).with_for_update()).all()
    db.refresh(doc,with_for_update=True)
    if db.scalar(select(Order.id).where(Order.document_id == id)):
        raise HTTPException(409,'ordered_document_locked')
    for j in jobs:
        j.state,j.stage,j.attempt_token,j.lease_until = 'cancelled','cancelled',None,0
    doc.state = 'archived'
    db.commit()
    return {'archived':True,'ai_budget_not_refunded':True}


@app.post('/api/v1/documents/{id}/approve')
def approve(id: str,user=Depends(current_user),db=Depends(get_db)):
    doc = owned(db,Document,id,user)
    db.refresh(doc,with_for_update=True)
    if doc.state == 'approved':
        return {'approved_plan':doc.approved_plan}
    if doc.state != 'plan_ready':
        raise HTTPException(409,'plan_not_ready')
    doc.approved_plan = Plan.model_validate(doc.plan).model_dump()
    doc.state = 'approved'
    db.commit()
    return {'approved_plan':doc.approved_plan}


def order_view(db,o):
    job = db.scalar(select(Job).where(Job.order_id == o.id))
    refunds = db.scalars(select(Refund).where(Refund.order_id == o.id)).all()
    return {'id':o.id,'document_id':o.document_id,'method':o.method,'state':o.state,'amount_kopecks':o.amount,
            'sandbox':True,'payment_mode':'personal_mock' if o.receipt_status == 'simulated_no_charge' else 'yukassa_test','checkout_url':o.checkout_url,'job_id':job.id if job else None,
            'refunded_kopecks':o.refunded,'receipt_status':o.receipt_status,
            'refunds':[{'id':r.id,'state':r.state,'amount_kopecks':r.amount,'error':r.error,'retry_at':r.retry_at} for r in refunds]}


@app.post('/api/v1/documents/{id}/orders',status_code=202)
def buy(id: str,body: Buy,user=Depends(current_user),db=Depends(get_db)):
    doc = owned(db,Document,id,user)
    db.refresh(doc,with_for_update=True)
    existing = db.scalar(select(Order).where(Order.document_id == id))
    if existing:
        if existing.method != body.method:
            raise HTTPException(409,'order_payment_method_locked')
        return order_view(db,existing)
    if doc.state != 'approved':
        raise HTTPException(409,'approval_required')
    if body.method == 'cash' and not cfg.MOCK_PAYMENTS and (not cfg.YUKASSA_SHOP_ID or not cfg.YUKASSA_SECRET_KEY.startswith('test_')):
        raise HTTPException(503,'yukassa_test_credentials_required')
    reserve_budget(db,cfg.JOB_BUDGET)
    order = Order(document_id=id,user_id=user.id,method=body.method)
    db.add(order)
    db.flush()
    if body.method == 'cash' and cfg.MOCK_PAYMENTS:
        # Explicit owner-only local simulation, never a verified cash purchase.
        order.receipt_status = 'simulated_no_charge'
        payments.enqueue(db,order)
    if body.method == 'bonus':
        try:
            bonus.change(db,user.id,'reserve:'+order.id,'reserve',order.amount,order.id)
        except bonus.InsufficientBonus:
            raise HTTPException(409,'insufficient_bonus_or_debt') from None
        payments.enqueue(db,order)
    doc.state = 'ordered'
    db.commit()
    return order_view(db,order)


@app.get('/api/v1/orders/{id}')
def get_order(id: str,user=Depends(current_user),db=Depends(get_db)):
    return order_view(db,owned(db,Order,id,user))


@app.get('/api/v1/jobs/{id}')
def get_job(id: str,user=Depends(current_user),db=Depends(get_db)):
    j = db.get(Job,id)
    if not j:
        raise HTTPException(404,'not_found')
    doc = owned(db,Document,j.document_id,user)
    return job_view(j,doc)


@app.get('/api/v1/documents')
def library(user=Depends(current_user),db=Depends(get_db)):
    return {'items':[doc_view(db,d) for d in db.scalars(select(Document).where(Document.user_id == user.id)
                                                     .order_by(Document.created.desc()))]}


@app.get('/api/v1/documents/{id}')
def get_document(id: str,user=Depends(current_user),db=Depends(get_db)):
    return doc_view(db,owned(db,Document,id,user))


@app.get('/api/v1/documents/{id}/download')
def download(id: str,user=Depends(current_user),db=Depends(get_db)):
    doc = owned(db,Document,id,user)
    try:
        data = documents.read(doc)
    except FileNotFoundError:
        raise HTTPException(404,'file_missing_or_expired') from None
    except ValueError:
        raise HTTPException(503,'file_integrity_error') from None
    return Response(data,media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    headers={'Content-Disposition':f'attachment; filename="gostdoc-{doc.id}.docx"'})


@app.get('/api/v1/documents/{id}/preview')
def preview_document(id: str,user=Depends(current_user),db=Depends(get_db)):
    import io
    import docx as word
    document = owned(db,Document,id,user)
    try:
        data = documents.read(document)
    except FileNotFoundError:
        raise HTTPException(404,'file_missing_or_expired') from None
    except ValueError:
        raise HTTPException(503,'file_integrity_error') from None
    output = word.Document(io.BytesIO(data))
    return {'paragraphs':[{'text':p.text,'style':p.style.name} for p in output.paragraphs]}


@app.get('/api/v1/referrals')
def referrals(user=Depends(current_user),db=Depends(get_db)):
    # Maturation is a worker operation, never a client-controlled test clock.
    a = db.get(BonusAccount,user.id)
    rewards = db.scalars(select(Reward).where(Reward.inviter == user.id)).all()
    entries = db.scalars(select(BonusEntry).where(BonusEntry.user_id == user.id).order_by(BonusEntry.created)).all()
    return {'code':user.referral_code,'link':'/?ref='+user.referral_code,'terms':'sandbox-v1',
            'standard_price_hundredths':30000,'registered':db.scalar(select(func.count()).select_from(Attribution).where(Attribution.inviter == user.id)),
            'qualified':sum(r.amount > 0 for r in rewards), 'maturation_days':14,
            'available':a.available,'reserved':a.reserved,'debt':a.debt,
            'pending':sum(r.amount for r in rewards if r.state in ('pending','held')),
            'held':sum(r.amount for r in rewards if r.state == 'held'),
            'remaining_to_standard':max(0,30000-a.available), 'units':'credit_hundredths',
            'history':[{'operation_id':e.operation_id,'kind':e.kind,'amount':e.amount,'created':e.created,
                        'available_delta':e.available_delta,'reserved_delta':e.reserved_delta,'debt_delta':e.debt_delta} for e in entries]}


@app.post('/api/v1/payments/webhook')
def webhook(payload: dict,request: Request,db=Depends(get_db)):
    rate(db,request,'webhook',120)
    db.commit()
    obj = payload.get('object')
    id = obj.get('id') if isinstance(obj,dict) else None
    if not isinstance(id,str):
        raise HTTPException(422,'payment_id_required')
    gateway = YooKassa()
    if str(payload.get('event','')).startswith('refund.'):
        payments.refund_notification(db,id,gateway)
        db.commit()
        return {'accepted':True}
    # Ignore supplied amount/status: only authenticated provider GET can change state.
    p = gateway.payment(id)
    order = db.scalar(select(Order).where(Order.payment_id == id).with_for_update())
    if not order:
        return {'accepted':True}
    payments.verify(db,order,p,gateway)
    db.commit()
    return {'accepted':True}
