from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient
from sqlalchemy import select
from app.prototype.api import app
from app.prototype.config import cfg
from app.prototype.models import DB, Job, Order, BonusAccount, Refund, Reward, now
from app.prototype import payments, bonus
from app.prototype.worker import run_one
from app.prototype.providers import ProviderError
from .helpers import signup, create_cash, approved, generate_all, TestGateway, TestAI, PASSWORD
from .test_payments_bonus import qualifying


def test_concurrent_cash_checkout_and_confirm_one_job(client):
    signup(client)
    id = approved(client)
    cookies = dict(client.cookies)
    headers = dict(client.headers)
    def buy(_):
        with TestClient(app,base_url='http://localhost:8000',cookies=cookies,headers=headers) as c:
            r = c.post(f'/api/v1/documents/{id}/orders',json={'method':'cash'})
            assert r.status_code == 202,r.text
            return r.json()['id']
    with ThreadPoolExecutor(2) as pool:
        ids = list(pool.map(buy,range(2)))
    assert ids[0] == ids[1]
    g = TestGateway()
    g.status = 'succeeded'
    with ThreadPoolExecutor(2) as pool:
        list(pool.map(lambda _: payments.reconcile_order(ids[0],g),range(2)))
    with DB() as db:
        assert len(db.scalars(select(Job).where(Job.order_id == ids[0])).all()) == 1


def test_bonus_terminal_failure_releases_full_reserve(client):
    owner = signup(client)
    g = TestGateway()
    for i in range(5):
        qualifying(client,f'friend{i}@example.org',owner['referral_code'],g)
    with DB.begin() as db:
        bonus.mature(db,clock=now()+15*86400)
    r = client.post('/api/v1/auth/login',json={'email':owner['email'],'password':PASSWORD})
    client.headers['X-CSRF-Token'] = r.json()['csrf_token']
    id = approved(client)
    r = client.post(f'/api/v1/documents/{id}/orders',json={'method':'bonus'})
    oid = r.json()['id']
    class Fail:
        def generate(self,*args):
            raise ProviderError('ai_auth')
    run_one(Fail())
    o = client.get(f'/api/v1/orders/{oid}').json()
    assert o['state'] == 'bonus_released' and o['refunds'] == []
    a = client.get('/api/v1/referrals').json()
    assert a['available'] == 30000 and a['reserved'] == 0


def test_external_refund_verified_and_idempotent(client):
    owner = signup(client)
    g = TestGateway()
    buyer,doc,oid = qualifying(client,'friend@example.org',owner['referral_code'],g)
    with DB() as db:
        payment_id = db.get(Order,oid).payment_id
    def get_refund(id):
        return {'id':id,'payment_id':payment_id,'amount':{'value':'150.00','currency':'RUB'},'status':'succeeded'}
    g.get_refund = get_refund
    with DB.begin() as db:
        payments.refund_notification(db,'external-refund-123',g)
        payments.refund_notification(db,'external-refund-123',g)
    with DB() as db:
        assert db.get(Order,oid).refunded == 15000
        assert db.get(Reward,buyer['id']).amount == 3000


def test_refund_webhook_after_unknown_create_does_not_duplicate(client):
    owner = signup(client)
    g = TestGateway()
    buyer,doc,oid = qualifying(client,'friend@example.org',owner['referral_code'],g)
    with DB.begin() as db:
        order = db.scalar(select(Order).where(Order.id == oid).with_for_update())
        r = payments.request_refund(db,order,30000,'stable-technical-refund')
        db.flush()
        refund_id = r.id
        actual = g.refund(r,order)  # Provider processed it; local response/transaction was lost.
    g.get_refund = lambda id: actual
    with DB.begin() as db:
        payments.refund_notification(db,actual['id'],g)
    payments.reconcile(g)
    with DB() as db:
        records = db.scalars(select(Refund).where(Refund.order_id == oid)).all()
        assert len(records) == 1 and records[0].id == refund_id
        assert records[0].state == 'succeeded'
        assert db.get(Order,oid).refunded == 30000
