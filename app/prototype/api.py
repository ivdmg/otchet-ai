import hmac
import hashlib
import json
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
from .catalog import CATALOG, VERSION, budget,quote_price,MATERIALS_BPS
from .db import counter, limit
from .models import (Attribution, AuthToken, BonusAccount, BonusEntry, DB, Document,
                     Job, Order, Refund, Reward, Session, User, now)
from .schemas import Buy, Credentials, Draft, EmailInput, Plan, Register, Reset, TokenInput, ProfileInput,MaterialOptions
from . import bonus, documents, payments
from .providers import ProviderError, YooKassa, ai_provider


app = FastAPI(title='AI GostDoc вЂ” closed personal sandbox',version='0.1.0',
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
    return {'id':user.id,'email':user.email,'verified':user.verified,'referral_code':user.referral_code, **(user.profile_data or {})}


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
    user = User(email=email,password=password_hash(body.password),profile_data={"name":body.name.strip()},
                verified=cfg.MOCK_EMAIL and cfg.APP_ENV == "development")
    db.add(user)
    db.flush()
    db.add(BonusAccount(user_id=user.id))
    if inviter:
        db.add(Attribution(invited=user.id,inviter=inviter.id,standard_price=cfg.REFERRAL_STANDARD_PRICE,terms=cfg.REFERRAL_VERSION))
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


@app.put('/api/v1/auth/profile')
def update_profile(body: ProfileInput, user=Depends(current_user), db=Depends(get_db)):
    user.profile_data = body.model_dump()
    db.commit()
    return {'user':profile(user)}


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
    return {'mode':'sandbox','version':VERSION,'types':CATALOG,'chapters':[2,3], 'minimum_pages_by_chapters':{'2':7,'3':8}, 'retention_hours':24,
            'front_matter_included':True,'cashback_bps':cfg.CASHBACK_BPS,
            'mock_email':cfg.MOCK_EMAIL and cfg.APP_ENV == 'development',
            'materials_surcharge_bps':MATERIALS_BPS,
            'payment_mode':'mock' if cfg.MOCK_PAYMENTS else 'disabled'}


@app.post('/api/v1/quote')
def quote(body: Draft):
    result=quote_price(body.doc_type,body.model_dump())
    return {'version':VERSION,**result,'bonus_hundredths':result['price_kopecks'],'settings':body.model_dump()}



def reserve_budget(db,amount):
    if not cfg.ai_key:
        raise HTTPException(503,'openrouter_key_missing' if cfg.AI_PROVIDER == 'openrouter' else 'groq_key_missing')
    if not limit(db,f'admission:{now()//86400}',cfg.DAILY_TOKENS,amount):
        raise HTTPException(429,'daily_ai_budget_reserved')


def job_view(job,doc,order=None):
    from .recovery import view
    recovery=view(job,doc,order)
    return {'id':job.id,'document_id':job.document_id,'order_id':job.order_id,'kind':job.kind,'provider':'openrouter' if job.model.startswith('openrouter:') else 'groq','model':job.model.removeprefix('openrouter:'),
            'status':job.state,**documents.progress(job,doc),'heartbeat':job.heartbeat,
            'retry_at':job.retry_at or None,'error':job.error,'attempts':job.attempts,
            'recovery':recovery,'manual_retries':job.manual_retries,
            'metrics':job.metrics,'tokens':{'reported':job.usage,'charged_conservative':job.charged,'budget':job.budget}}


def doc_view(db,doc):
    order = db.scalar(select(Order).where(Order.document_id == doc.id))
    jobs = db.scalars(select(Job).where(Job.document_id == doc.id).order_by(Job.created)).all()
    return {'id':doc.id,'topic':doc.topic,'doc_type':doc.doc_type,'state':doc.state,'plan':doc.plan,
            'plan_revision':doc.plan_revision,'plan_regenerations':doc.plan_regenerations,
            'can_regenerate_plan':bool(doc.plan and doc.state in ('plan_ready','approved') and not order and doc.plan_regenerations<1),
            'quote':quote_price(doc.doc_type,doc.settings),
            'approved_plan':doc.approved_plan,'settings':doc.settings,'approval_hash':doc.approval_hash,
            'actual_pages':doc.actual_pages,'created':doc.created,'expires':doc.expires,
            'order':order_view(db,order) if order else None,'jobs':[job_view(j,doc,order) for j in jobs],
            'delivery_id':doc.delivery_id if doc.state=='completed' and doc.file_hash and doc.pdf_hash and doc.expires and doc.expires > now() else None}


@app.post('/api/v1/drafts',status_code=201)
def save_draft(body: Draft,user=Depends(current_user),db=Depends(get_db)):
    doc = Document(user_id=user.id,topic=body.topic,doc_type=body.doc_type,settings=body.model_dump(),state='draft')
    db.add(doc)
    db.commit()
    return {'document_id':doc.id}


@app.post('/api/v1/documents/{id}/generate-plan',status_code=202)
def generate_saved(id: str,request: Request,user=Depends(current_user),db=Depends(get_db)):
    doc = owned(db,Document,id,user)
    db.refresh(doc,with_for_update=True)
    if doc.state != 'draft':
        raise HTTPException(409,'initial_plan_only')
    Draft.model_validate(doc.settings)
    counter(db,'draft-admission')
    if not limit(db,f'plans-hour:{user.id}:{now()//3600}',cfg.PLAN_HOURLY):
        raise HTTPException(429,'plan_hourly_limit')
    if not limit(db,f'plans:{user.id}:{now()//86400}',cfg.PLAN_DAILY):
        raise HTTPException(429,'plan_daily_limit')
    reserve_budget(db,7000)
    doc.state = 'planning'
    job = Job(document_id=id,kind='plan',budget=7000)
    db.add(job)
    db.commit()
    return {'document_id':id,'job_id':job.id}


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
    if not limit(db,f'plans-hour:{user.id}:{now()//3600}',cfg.PLAN_HOURLY):
        raise HTTPException(429,'plan_hourly_limit')
    if not limit(db,f'plans:{user.id}:{now()//86400}',cfg.PLAN_DAILY):
        raise HTTPException(429,'plan_daily_limit')
    reserve_budget(db,7000)
    doc = Document(user_id=user.id,topic=body.topic,doc_type=body.doc_type,settings=body.model_dump())
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
    if doc.state not in ('plan_ready','approved'):
        raise HTTPException(409,'plan_not_editable')
    settings = {**doc.settings,'chapters':len(body.chapters)}
    try:
        Draft.model_validate(settings)
    except ValueError:
        raise HTTPException(422,'volume_too_small_for_structure') from None
    doc.settings = settings
    doc.state,doc.approved_plan,doc.approval_hash = 'plan_ready',None,None
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
    doc.expires = now()+86400
    doc.delivery_id = doc.delivery_id or secrets.token_urlsafe(24)
    db.commit()
    return {'archived':True,'ai_budget_not_refunded':True}


@app.post('/api/v1/documents/{id}/approve')
def approve(id: str,user=Depends(current_user),db=Depends(get_db)):
    doc = owned(db,Document,id,user)
    db.refresh(doc,with_for_update=True)
    if doc.state == 'approved':
        return {'approved_plan':doc.approved_plan,'approval_hash':doc.approval_hash,**quote_price(doc.doc_type,doc.settings)}
    if doc.state != 'plan_ready':
        raise HTTPException(409,'plan_not_ready')
    doc.approved_plan = Plan.model_validate(doc.plan).model_dump()
    from datetime import datetime
    doc.title_data = {**(user.profile_data or {}), 'year':datetime.now().year}
    doc.approval_hash = hashlib.sha256(json.dumps({'settings':doc.settings,'plan':doc.approved_plan,'catalog':VERSION},sort_keys=True,ensure_ascii=False).encode()).hexdigest()
    doc.state = 'approved'
    db.commit()
    return {'approved_plan':doc.approved_plan,'approval_hash':doc.approval_hash,**quote_price(doc.doc_type,doc.settings)}


def order_view(db,o):
    job = db.scalar(select(Job).where(Job.order_id == o.id))
    refunds = db.scalars(select(Refund).where(Refund.order_id == o.id)).all()
    return {'id':o.id,'document_id':o.document_id,'method':o.method,'state':o.state,'amount_kopecks':o.amount,
            'sandbox':True,'cash_charged':False if o.receipt_status == 'simulated_no_charge' else None,'payment_mode':'personal_mock' if o.receipt_status == 'simulated_no_charge' else 'yukassa_test','checkout_url':o.checkout_url,'job_id':job.id if job else None,
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
    if body.approval_hash != doc.approval_hash:
        raise HTTPException(409,'stale_approval')
    if body.method == 'cash' and not cfg.MOCK_PAYMENTS and (not cfg.YUKASSA_SHOP_ID or not cfg.YUKASSA_SECRET_KEY.startswith('test_')):
        raise HTTPException(503,'yukassa_test_credentials_required')
    settings = Draft.model_validate(doc.settings)
    tokens = budget(doc.doc_type,settings.pages,settings.include_materials)
    # Pure local token preflight: reject oversized inputs before payment/reserve.
    for key,heading,_ in documents.pipeline(doc.approved_plan,doc.settings)[:-3]:
        ai_provider().generate(doc.topic,doc.approved_plan['chapters'],heading,
                        settings=documents.generation_settings(doc.settings,doc.approved_plan,key),preflight=True)
    reserve_budget(db,tokens)
    order = Order(document_id=id,user_id=user.id,method=body.method,amount=quote_price(doc.doc_type,doc.settings)['price_kopecks'],ai_budget=tokens)
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
    return job_view(j,doc,db.get(Order,j.order_id) if j.order_id else None)


@app.put('/api/v1/documents/{id}/options')
def change_options(id:str,body:MaterialOptions,user=Depends(current_user),db=Depends(get_db)):
    doc=owned(db,Document,id,user);db.refresh(doc,with_for_update=True)
    if doc.state not in ('plan_ready','approved') or db.scalar(select(Order.id).where(Order.document_id==id)):
        raise HTTPException(409,'ordered_document_locked')
    settings={**doc.settings,'include_materials':body.include_materials}
    Draft.model_validate(settings)
    doc.settings,doc.state,doc.approval_hash,doc.approved_plan=settings,'plan_ready',None,None
    db.commit()
    return doc_view(db,doc)


@app.post('/api/v1/documents/{id}/regenerate-plan',status_code=202)
def regenerate_plan(id:str,user=Depends(current_user),db=Depends(get_db)):
    doc=owned(db,Document,id,user);db.refresh(doc,with_for_update=True)
    if doc.state not in ('plan_ready','approved') or not doc.plan or db.scalar(select(Order.id).where(Order.document_id==id)):
        raise HTTPException(409,'plan_not_editable')
    if doc.plan_regenerations>=1: raise HTTPException(409,'plan_regeneration_used')
    counter(db,'draft-admission')
    if not limit(db,f'plans-hour:{user.id}:{now()//3600}',cfg.PLAN_HOURLY): raise HTTPException(429,'plan_hourly_limit')
    if not limit(db,f'plans:{user.id}:{now()//86400}',cfg.PLAN_DAILY): raise HTTPException(429,'plan_daily_limit')
    reserve_budget(db,7000)
    job=db.scalar(select(Job).where(Job.document_id==id,Job.kind=='plan').with_for_update())
    if not job:
        job=Job(document_id=id,kind='plan',budget=7000);db.add(job)
    else:
        job.budget+=7000
        job.steps,job.attempts,job.manual_retries={},0,0
        job.state,job.stage,job.error,job.retry_at,job.lease_until,job.attempt_token='queued','queued',None,0,0,None
        job.model=cfg.ai_model
    doc.plan_regenerations+=1
    doc.state,doc.approved_plan,doc.approval_hash='planning',None,None
    db.commit()
    return doc_view(db,doc)


@app.post('/api/v1/documents/{id}/retry',status_code=202)
def retry_document(id:str,user=Depends(current_user),db=Depends(get_db)):
    doc=owned(db,Document,id,user)
    job=db.scalar(select(Job).where(Job.document_id==id).order_by(Job.kind,Job.created.desc()).with_for_update())
    if not job: raise HTTPException(409,'nothing_to_retry')
    db.refresh(doc,with_for_update=True)
    order=db.scalar(select(Order).where(Order.id==job.order_id).with_for_update()) if job.order_id else None
    from .recovery import view
    if not view(job,doc,order)['can_retry']: raise HTTPException(409,'retry_unavailable')
    if job.state=='paused' and job.retry_at>now(): raise HTTPException(429,'retry_not_due')
    if job.kind=='plan':
        reserve_budget(db,7000);job.budget+=7000;job.model=cfg.ai_model
    job.manual_retries+=1
    job.attempts,job.state,job.error,job.retry_at,job.lease_until,job.attempt_token=0,'queued',None,0,0,None
    job.heartbeat=now()
    doc.state='planning' if job.kind=='plan' else 'generating'
    doc.expires=None
    if order: order.state='queued'
    db.commit()
    return doc_view(db,doc)


@app.post('/api/v1/documents/{id}/cancel')
def cancel_document(id:str,user=Depends(current_user),db=Depends(get_db)):
    doc=owned(db,Document,id,user)
    job=db.scalar(select(Job).where(Job.document_id==id).order_by(Job.kind,Job.created.desc()).with_for_update())
    if not job: raise HTTPException(409,'nothing_to_cancel')
    db.refresh(doc,with_for_update=True)
    if job.state=='cancelled': return doc_view(db,doc)
    if job.state not in ('queued','running','retry','paused'): raise HTTPException(409,'cancel_unavailable')
    from .recovery import settle_failure
    settle_failure(db,job,doc,'cancelled_by_user')
    if job.kind=='plan' and doc.plan: doc.state,doc.expires='plan_ready',None
    db.commit()
    return doc_view(db,doc)


@app.post('/api/v1/documents/{id}/restart',status_code=201)
def restart_from_plan(id:str,user=Depends(current_user),db=Depends(get_db)):
    doc=owned(db,Document,id,user);db.refresh(doc,with_for_update=True)
    if doc.state not in ('failed','cancelled') or not (doc.plan or doc.approved_plan) or (doc.expires and doc.expires<=now()):
        raise HTTPException(409,'saved_plan_unavailable')
    job=db.scalar(select(Job).where(Job.document_id==id).order_by(Job.kind).with_for_update())
    previous=(job.metrics or {}).get('restart_document_id') if job else None
    if previous:
        copy=db.get(Document,previous)
        if copy and copy.state!='archived': return doc_view(db,copy)
    counter(db,'draft-admission')
    if db.scalar(select(func.count()).select_from(Document))>=cfg.MAX_DOCS:
        raise HTTPException(409,'personal_storage_limit')
    unpaid=db.scalar(select(func.count()).select_from(Document).where(Document.user_id==user.id,Document.state.in_(['draft','planning','plan_ready','approved'])))
    if unpaid>=2: raise HTTPException(409,'too_many_unpaid_drafts')
    Draft.model_validate(doc.settings)
    copy=Document(user_id=user.id,topic=doc.topic,doc_type=doc.doc_type,settings=dict(doc.settings),
                  state='plan_ready',plan=doc.approved_plan or doc.plan,plan_revision=1,plan_regenerations=doc.plan_regenerations)
    db.add(copy);db.flush()
    if job: job.metrics={**job.metrics,'restart_document_id':copy.id}
    db.commit()
    return doc_view(db,copy)


@app.get('/api/v1/documents')
def library(user=Depends(current_user),db=Depends(get_db)):
    items = db.scalars(select(Document).where(Document.user_id == user.id).order_by(Document.created.desc())).all()
    return {'items':[{'id':d.id,'topic':d.topic,'doc_type':d.doc_type,'state':d.state,
                     'created':d.created,'requested_pages':d.settings.get('pages'), 'actual_pages':d.actual_pages,
                     **({'settings':d.settings,'plan':d.plan} if d.state in ('draft','planning','plan_ready','approved') else {})}
                    for d in items]}


@app.get('/api/v1/documents/{id}')
def get_document(id: str,user=Depends(current_user),db=Depends(get_db)):
    return doc_view(db,owned(db,Document,id,user))


@app.get('/api/v1/deliveries/{id}/{format}')
def delivery(id: str,format: str,inline: bool=False,user=Depends(current_user),db=Depends(get_db)):
    doc = db.scalar(select(Document).where(Document.delivery_id == id,Document.user_id == user.id))
    if not doc:
        raise HTTPException(404,'not_found')
    if not doc.expires or doc.expires <= now():
        documents.expire(db)
        db.commit()
        raise HTTPException(410,'delivery_expired')
    if doc.state != 'completed' or not doc.file_hash or not doc.pdf_hash:
        raise HTTPException(409,'delivery_not_ready')
    if format not in ('pdf','docx'):
        raise HTTPException(404,'unknown_format')
    try:
        data = documents.read_pdf(doc) if format == 'pdf' else documents.read(doc)
    except (FileNotFoundError,ValueError):
        raise HTTPException(503,'artifact_integrity_error') from None
    return Response(data,media_type='application/pdf' if format=='pdf' else
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    headers={'Content-Disposition':f'{"inline" if inline and format=="pdf" else "attachment"}; filename="gostdoc.{format}"'})



@app.get('/api/v1/referrals')
def referrals(user=Depends(current_user),db=Depends(get_db)):
    # Maturation is a worker operation, never a client-controlled test clock.
    a = db.get(BonusAccount,user.id)
    rewards = db.scalars(select(Reward).where(Reward.inviter == user.id)).all()
    entries = db.scalars(select(BonusEntry).where(BonusEntry.user_id == user.id).order_by(BonusEntry.created)).all()
    return {'code':user.referral_code,'link':'/?ref='+user.referral_code,'terms':cfg.REFERRAL_VERSION,
            'standard_price_hundredths':cfg.REFERRAL_STANDARD_PRICE,'registered':db.scalar(select(func.count()).select_from(Attribution).where(Attribution.inviter == user.id)),
            'qualified':sum(r.amount > 0 for r in rewards), 'maturation_days':14,
            'available':a.available,'reserved':a.reserved,'debt':a.debt,
            'pending':sum(r.amount for r in rewards if r.state in ('pending','held')),
            'held':sum(r.amount for r in rewards if r.state == 'held'),
            'remaining_to_standard':max(0,cfg.REFERRAL_STANDARD_PRICE-a.available), 'units':'credit_hundredths',
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
