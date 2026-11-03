"""Failure/recovery contracts, PostgreSQL and explicit AI failures; no network AI."""
import pytest
from sqlalchemy import select,func
from app.prototype.models import DB,Document,Job,Order,now
from app.prototype.config import cfg
from app.prototype.providers import ProviderError
from app.prototype.worker import run_one,claim,fail
from app.prototype import recovery,documents
from .helpers import signup,TestAI
from .test_studio_v2 import approved,INPUT,OUTLINE


class Denied:
    def generate(self,*args,**kwargs):
        raise ProviderError('ai_access_denied',diagnostics={'http_status':403,'category':'permission'})


def paid(client,monkeypatch):
    signup(client);monkeypatch.setattr(cfg,'MOCK_PAYMENTS',True)
    did,signature=approved(client)
    response=client.post(f'/api/v1/documents/{did}/orders',json={'method':'cash','approval_hash':signature})
    assert response.status_code==202,response.text
    return did


def body(db,did):
    return db.scalar(select(Job).where(Job.document_id==did,Job.kind=='document'))


def snapshot(client,did):
    d=client.get(f'/api/v1/documents/{did}').json()
    return d,next(j for j in d['jobs'] if j['kind']=='document')


def test_403_pauses_once_preserves_checkpoint_and_resumes_same_order(client,monkeypatch):
    did=paid(client,monkeypatch)
    assert run_one(TestAI())
    with DB() as db: intro=body(db,did).steps['intro'];oid=body(db,did).order_id
    assert run_one(Denied())
    d,j=snapshot(client,did)
    assert d['state']=='paused' and j['recovery']['can_retry']
    assert not run_one(Denied())  # No endless hidden retries after a 403.
    with DB() as db:
        job=body(db,did);order=db.get(Order,oid)
        assert job.steps['intro']==intro and order.refunded==0 and order.state=='paused'
        assert job.metrics['last_error']=={'http_status':403,'category':'permission'}
    assert client.post(f'/api/v1/documents/{did}/retry').status_code==202
    assert run_one(TestAI())
    with DB() as db:
        job=body(db,did)
        assert job.steps['intro']==intro and 'section_0' in job.steps
        assert job.order_id==oid and job.manual_retries==1
        assert db.scalar(select(func.count()).select_from(Order))==1
    for _ in range(20):
        if not run_one(TestAI()): break
    d,j=snapshot(client,did)
    assert d['state']=='completed' and d['actual_pages']==7 and j['percent']==100
    assert client.get('/api/v1/referrals').json()['available']==995
    assert client.post(f'/api/v1/documents/{did}/retry').status_code==409


def test_retry_is_bounded_and_cancel_idempotent(client,monkeypatch):
    did=paid(client,monkeypatch)
    for attempt in range(3):
        assert run_one(Denied())
        d,j=snapshot(client,did)
        assert j['recovery']['can_retry']==(attempt<2)
        if attempt<2: assert client.post(f'/api/v1/documents/{did}/retry').status_code==202
    assert client.post(f'/api/v1/documents/{did}/retry').status_code==409
    assert client.post(f'/api/v1/documents/{did}/cancel').status_code==200
    assert client.post(f'/api/v1/documents/{did}/cancel').status_code==200
    with DB() as db:
        job=body(db,did);order=db.get(Order,job.order_id)
        assert job.state=='cancelled' and order.refunded==order.amount
    assert client.post(f'/api/v1/documents/{did}/retry').status_code==409
    a=client.post(f'/api/v1/documents/{did}/restart');b=client.post(f'/api/v1/documents/{did}/restart')
    assert a.status_code==201 and b.status_code==201
    assert a.json()['id']==b.json()['id'] and a.json()['state']=='plan_ready'
    assert a.json()['order'] is None


def test_plan_failure_retry_and_one_regeneration_preserve_old_plan(client):
    signup(client)
    did=client.post('/api/v1/documents',json=INPUT).json()['document_id']
    run_one(Denied())
    d=client.get(f'/api/v1/documents/{did}').json()
    assert d['state']=='failed' and d['jobs'][0]['recovery']['can_retry']
    assert client.post(f'/api/v1/documents/{did}/retry').status_code==202
    run_one(TestAI())
    old=client.get(f'/api/v1/documents/{did}').json()['plan']
    assert client.post(f'/api/v1/documents/{did}/regenerate-plan').status_code==202
    run_one(Denied())
    d=client.get(f'/api/v1/documents/{did}').json()
    assert d['state']=='plan_ready' and d['plan']==old
    assert d['plan_regenerations']==1 and not d['can_regenerate_plan']
    assert client.post(f'/api/v1/documents/{did}/regenerate-plan').status_code==409
    assert client.post(f'/api/v1/documents/{did}/approve').status_code==200


def test_cancel_fences_late_worker_and_owner_checks(client,monkeypatch):
    did=paid(client,monkeypatch)
    jid,token=claim()
    assert client.post(f'/api/v1/documents/{did}/cancel').status_code==200
    fail(jid,token,ProviderError('ai_access_denied'))
    with DB() as db: assert body(db,did).state=='cancelled'
    signup(client,'other@example.org')
    for action in ('retry','cancel','restart','regenerate-plan'):
        assert client.post(f'/api/v1/documents/{did}/{action}').status_code==404
    assert client.put(f'/api/v1/documents/{did}/options',json={'include_materials':True}).status_code==404


def test_pause_expiration_releases_order_and_no_resume_during_refund(client,monkeypatch):
    did=paid(client,monkeypatch);run_one(Denied())
    with DB.begin() as db:
        job=body(db,did);order=db.get(Order,job.order_id)
        order.state='refund_pending'
    assert client.post(f'/api/v1/documents/{did}/retry').status_code==409
    with DB.begin() as db:
        job=body(db,did);db.get(Order,job.order_id).state='paused';job.heartbeat=now()-86401
        recovery.expire_pauses(db)
    with DB() as db:
        job=body(db,did);assert job.state=='cancelled' and job.error=='pause_expired'
        order=db.get(Order,job.order_id);assert order.refunded==order.amount


def test_stalled_worker_recovery_and_formatting_does_not_require_ai_budget(client,monkeypatch):
    did=paid(client,monkeypatch)
    with DB.begin() as db:
        job=body(db,did);job.state='running';job.heartbeat=now()-181;job.lease_until=now()-1
    assert snapshot(client,did)[1]['recovery']['stalled']
    assert client.post(f'/api/v1/documents/{did}/retry').status_code==202
    with DB.begin() as db:
        job=body(db,did);doc=db.get(Document,did)
        job.steps={key:{'test_checkpoint':True} for key,_,_ in documents.job_pipeline(job,doc) if key not in ('validation','docx','pdf')}
        job.charged=job.budget;job.state=doc.state='paused';db.get(Order,job.order_id).state='paused'
    assert snapshot(client,did)[1]['recovery']['can_retry']


@pytest.mark.parametrize('code',['ai_daily_limit','ai_auth','ai_credits_required'])
def test_non_transient_provider_errors_offer_safe_pause(client,monkeypatch,code):
    did=paid(client,monkeypatch)
    class Failure:
        def generate(self,*args,**kwargs): raise ProviderError(code)
    run_one(Failure())
    d,j=snapshot(client,did)
    assert d['state']=='paused' and j['recovery']['can_cancel'] and j['recovery']['can_retry']
    assert not run_one(Failure())


@pytest.mark.parametrize('code',['ai_timeout','ai_rate_limit','ai_unavailable'])
def test_transient_retry_is_automatic_then_bounded_pause(client,monkeypatch,code):
    did=paid(client,monkeypatch)
    class Failure:
        def generate(self,*args,**kwargs): raise ProviderError(code,True,30)
    for _ in range(6):
        assert run_one(Failure())
        d,j=snapshot(client,did)
        if j['status']=='paused': break
        assert j['status']=='retry'
        with DB.begin() as db: body(db,did).retry_at=0
    assert j['status']=='paused' and j['recovery']['retry_available_at']>now()
    assert client.post(f'/api/v1/documents/{did}/retry').status_code==429
    assert not run_one(Failure())


def test_bonus_cancellation_releases_once(client):
    from app.prototype.models import BonusAccount,BonusEntry
    from app.prototype import bonus
    owner=signup(client)
    with DB.begin() as db: bonus.change(db,owner['id'],'explicit-test-funding','mature',19900)
    did,sig=approved(client)
    assert client.post(f'/api/v1/documents/{did}/orders',json={'method':'bonus','approval_hash':sig}).status_code==202
    run_one(Denied())
    with DB() as db: assert db.get(BonusAccount,owner['id']).reserved==19900
    assert client.post(f'/api/v1/documents/{did}/cancel').status_code==200
    assert client.post(f'/api/v1/documents/{did}/cancel').status_code==200
    with DB() as db:
        account=db.get(BonusAccount,owner['id'])
        assert account.available==19900 and account.reserved==0
        assert db.scalar(select(func.count()).select_from(BonusEntry).where(BonusEntry.kind=='release'))==1
