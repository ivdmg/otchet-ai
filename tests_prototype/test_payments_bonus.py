from concurrent.futures import ThreadPoolExecutor
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError, DBAPIError
import pytest
from app.prototype.models import (DB, User, Document, Order, Job, BonusAccount,
                                  BonusEntry, Attribution, Reward, Refund, now)
from app.prototype import bonus, payments
from app.prototype.providers import ProviderError
from .helpers import (signup, approved, create_cash, generate_all, TestAI, TestGateway,
                      PASSWORD)


def test_duplicate_click_webhook_and_lost_webhook(client):
    signup(client)
    id,oid = create_cash(client)
    second = client.post(f'/api/v1/documents/{id}/orders',json={'method':'cash'})
    assert second.json()['id'] == oid
    assert client.post(f'/api/v1/documents/{id}/orders',json={'method':'bonus'}).status_code == 409
    g = TestGateway()
    payments.reconcile_order(oid,g)
    assert client.get(f'/api/v1/orders/{oid}').json()['state'] == 'checking_payment'
    g.status = 'succeeded'
    # Reconciliation, without client return or webhook, discovers payment.
    payments.reconcile_order(oid,g)
    with DB.begin() as db:
        o = db.scalar(select(Order).where(Order.id == oid).with_for_update())
        p = g.payment(o.payment_id)
        for _ in range(3):
            payments.verify(db,o,p,g)
        assert len(db.scalars(select(Job).where(Job.order_id == oid)).all()) == 1
        for field,value in [('amount',{'value':'1.00','currency':'RUB'}),('recipient',{'account_id':'wrong'}),('test',False),('metadata',{'order_id':'wrong'})]:
            with pytest.raises(ProviderError,match='verification_failed'):
                g.validate_payment({**p,field:value},o)
    generate_all()
    assert client.get(f'/api/v1/orders/{oid}').json()['state'] == 'completed'


def test_cash_cancel_and_uncertain_create_same_order(client):
    signup(client)
    id,oid = create_cash(client)
    g = TestGateway()
    g.status = 'canceled'
    payments.reconcile_order(oid,g)
    assert client.get(f'/api/v1/orders/{oid}').json()['state'] == 'cancelled'
    with DB() as db:
        assert db.scalar(select(Job).where(Job.order_id == oid)) is None


def test_refund_before_generation_finishes_is_not_overwritten(client):
    owner = signup(client)
    g = TestGateway()
    signup(client,'friend@example.org',owner['referral_code'])
    doc,oid = create_cash(client)
    g.status = 'succeeded'
    payments.reconcile_order(oid,g)
    with DB.begin() as db:
        order = db.scalar(select(Order).where(Order.id == oid).with_for_update())
        payments.request_refund(db,order,15000,'early-partial')
    payments.reconcile(g)
    generate_all()
    with DB() as db:
        order = db.get(Order,oid)
        assert order.state == 'partially_refunded' and order.refunded == 15000
        reward = db.scalar(select(Reward).where(Reward.order_id == oid))
        assert reward.amount == 3000


def qualifying(client,email,ref,gateway):
    u = signup(client,email,ref)
    id,oid = create_cash(client)
    gateway.status = 'succeeded'
    payments.reconcile_order(oid,gateway)
    generate_all()
    return u,id,oid


def test_five_qualifying_referrals_then_bonus_job_and_late_reversal(client):
    owner = signup(client)
    g = TestGateway()
    buyers = [qualifying(client,f'buyer{i}@example.org',owner['referral_code'],g) for i in range(5)]
    with DB.begin() as db:
        a = db.get(BonusAccount,owner['id'])
        rewards = db.scalars(select(Reward)).all()
        assert a.available == 0 and len(rewards) == 5
        assert sum(r.amount for r in rewards) == 30000
        assert all(r.matures >= now()+14*86400-10 for r in rewards)
        bonus.mature(db)
        assert a.available == 0
        bonus.mature(db,clock=now()+15*86400)  # test clock only; not exposed by HTTP
        bonus.mature(db,clock=now()+15*86400)
        db.refresh(a)
        assert a.available == 30000
    r = client.post('/api/v1/auth/login',json={'email':owner['email'],'password':PASSWORD})
    client.headers['X-CSRF-Token'] = r.json()['csrf_token']
    id = approved(client)
    r = client.post(f'/api/v1/documents/{id}/orders',json={'method':'bonus'})
    assert r.status_code == 202,r.text
    oid = r.json()['id']
    assert client.post(f'/api/v1/documents/{id}/orders',json={'method':'bonus'}).json()['id'] == oid
    bal = client.get('/api/v1/referrals').json()
    assert bal['reserved'] == 30000 and bal['available'] == 0
    generate_all()
    assert client.get(f'/api/v1/orders/{oid}').json()['state'] == 'completed'
    assert client.get('/api/v1/referrals').json()['reserved'] == 0
    with DB.begin() as db:
        assert len(db.scalars(select(Reward)).all()) == 5  # bonus-funded job earns none
        first = db.scalar(select(Order).where(Order.id == buyers[0][2]).with_for_update())
        refund = payments.request_refund(db,first,first.amount,'owner-refund-1')
        rid = refund.id
    payments.reconcile(g)
    payments.reconcile(g)
    with DB() as db:
        a = db.get(BonusAccount,owner['id'])
        assert a.available == 0 and a.debt == 6000
        assert db.get(Order,buyers[0][2]).state == 'refunded'
        assert db.scalar(select(Reward).where(Reward.invited == buyers[0][0]['id'])).amount == 0
    id2 = approved(client)
    assert client.post(f'/api/v1/documents/{id2}/orders',json={'method':'bonus'}).status_code == 409


def test_concurrent_spend_atomic_release_debt_and_ledger_immutable(client):
    owner = signup(client)
    g = TestGateway()
    qualifying(client,'friend@example.org',owner['referral_code'],g)
    with DB.begin() as db:
        bonus.mature(db,clock=now()+15*86400)
        # 60 earned credits, two 60-credit reserves race: exactly one can win.
    def spend(op):
        try:
            with DB.begin() as db:
                bonus.change(db,owner['id'],op,'reserve',6000)
            return True
        except bonus.InsufficientBonus:
            return False
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(spend,['race-a','race-b']))
    assert sum(results) == 1
    with DB.begin() as db:
        bonus.change(db,owner['id'],'late-reversal','reversal',6000)
        a = db.get(BonusAccount,owner['id'])
        assert a.debt == 6000 and a.reserved == 6000
        bonus.change(db,owner['id'],'release-race','release',6000)
        bonus.change(db,owner['id'],'release-race','release',6000)
        assert (a.available,a.reserved,a.debt) == (0,0,0)
    with pytest.raises(DBAPIError):
        with DB.begin() as db:
            db.execute(text("UPDATE gd_bonus_entries SET amount=999 WHERE operation_id='release-race'"))
    with pytest.raises(IntegrityError):
        with DB.begin() as db:
            a = db.get(BonusAccount,owner['id'])
            a.available = -1
    with pytest.raises(IntegrityError):
        with DB.begin() as db:
            db.add(Attribution(invited=owner['id'],inviter=owner['id']))


@pytest.mark.parametrize('amount,expected',[(15000,3000),(50000,6000)])
def test_reward_cap_partial_full_refund_and_next_qualifying(client,amount,expected):
    owner = signup(client)
    g = TestGateway()
    buyer = signup(client,'friend@example.org',owner['referral_code'])
    id,oid = create_cash(client)
    # Explicit DB fixture for alternative sandbox prices, never a client-controlled price.
    with DB.begin() as db:
        db.get(Order,oid).amount = amount
    g.status = 'succeeded'
    payments.reconcile_order(oid,g)
    generate_all()
    with DB.begin() as db:
        r = db.get(Reward,buyer['id'])
        assert r.amount == expected
        o = db.scalar(select(Order).where(Order.id == oid).with_for_update())
        payments.request_refund(db,o,amount//2,'partial')
    payments.reconcile(g)
    with DB.begin() as db:
        r = db.get(Reward,buyer['id'])
        assert r.amount == min(6000,(amount-amount//2)//5)
        o = db.scalar(select(Order).where(Order.id == oid).with_for_update())
        payments.request_refund(db,o,amount-amount//2,'rest')
    payments.reconcile(g)
    with DB() as db:
        assert db.get(Reward,buyer['id']).amount == 0
    # Full reversal allows next completed cash purchase, preserving the unique invited row.
    id2,oid2 = create_cash(client)
    payments.reconcile_order(oid2,g)
    generate_all()
    with DB() as db:
        r = db.get(Reward,buyer['id'])
        assert r.order_id == oid2 and r.amount == 6000
        assert len(db.scalars(select(Reward)).all()) == 1


def test_failed_bonus_job_releases_and_failed_refund_stays_pending(client):
    owner = signup(client)
    g = TestGateway()
    qualifying(client,'friend@example.org',owner['referral_code'],g)
    with DB.begin() as db:
        bonus.mature(db,clock=now()+15*86400)
    # Actual order price stays 300; earned 60 insufficient: no order/job/reserve is committed.
    r = client.post('/api/v1/auth/login',json={'email':owner['email'],'password':PASSWORD})
    client.headers['X-CSRF-Token'] = r.json()['csrf_token']
    id = approved(client)
    assert client.post(f'/api/v1/documents/{id}/orders',json={'method':'bonus'}).status_code == 409
    with DB() as db:
        assert db.scalar(select(Order).where(Order.document_id == id)) is None
        assert db.get(BonusAccount,owner['id']).available == 6000
    # Cash refund unknown must remain pending and retry the exact same refund object.
    r = client.post(f'/api/v1/documents/{id}/orders',json={'method':'cash'})
    oid = r.json()['id']
    g.status = 'succeeded'
    payments.reconcile_order(oid,g)
    from app.prototype.worker import run_one
    class FailAI:
        def generate(self,*args):
            raise ProviderError('ai_auth')
    run_one(FailAI())
    g.fail_refund = True
    payments.reconcile(g)
    o = client.get(f'/api/v1/orders/{oid}').json()
    assert o['state'] == 'refund_pending' and o['refunded_kopecks'] == 0
    assert len(o['refunds']) == 1
