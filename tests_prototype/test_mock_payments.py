"""Explicit local payment simulation cannot mint referral credit or call an acquirer."""
import pytest
from sqlalchemy import select,func
from app.prototype.config import cfg
from app.prototype.models import DB,Order,Job,Refund,Reward
from app.prototype import payments
from app.prototype.providers import ProviderError
from app.prototype.worker import run_one
from .helpers import signup,approved,generate_all,PARAGRAPH


def test_mock_order_idempotent_no_referral_and_owner_preview(client,monkeypatch):
    inviter=signup(client)
    buyer=signup(client,'simulated-buyer@example.org',inviter['referral_code'])
    doc=approved(client)
    monkeypatch.setattr(cfg,'MOCK_PAYMENTS',True)
    monkeypatch.setattr(cfg,'YUKASSA_SHOP_ID','')
    monkeypatch.setattr(cfg,'YUKASSA_SECRET_KEY','')
    assert client.get('/api/v1/catalog').json()['payment_mode']=='personal_mock'
    first=client.post(f'/api/v1/documents/{doc}/orders',json={'method':'cash'})
    assert first.status_code==202
    order=first.json()
    assert order['payment_mode']=='personal_mock' and order['checkout_url'] is None
    assert client.post(f'/api/v1/documents/{doc}/orders',json={'method':'cash'}).json()['id']==order['id']
    generate_all()
    assert client.get(f'/api/v1/documents/{doc}').json()['state']=='completed'
    preview=client.get(f'/api/v1/documents/{doc}/preview')
    assert preview.status_code==200 and PARAGRAPH in str(preview.json())
    with DB() as db:
        o=db.get(Order,order['id'])
        assert o.receipt_status=='simulated_no_charge' and o.payment_id is None
        assert db.scalar(select(func.count()).select_from(Job).where(Job.order_id==o.id))==1
        assert db.scalar(select(func.count()).select_from(Reward))==0
        with pytest.raises(ValueError,match='simulated_payment'):
            payments.request_refund(db,o,o.amount,'should-refuse')
    signup(client,'other-preview@example.org')
    assert client.get(f'/api/v1/documents/{doc}/preview').status_code==404
    assert client.get(f'/api/v1/documents/{doc}/download').status_code==404


def test_mock_failure_never_queues_cash_refund(client,monkeypatch):
    signup(client)
    doc=approved(client)
    monkeypatch.setattr(cfg,'MOCK_PAYMENTS',True)
    order=client.post(f'/api/v1/documents/{doc}/orders',json={'method':'cash'}).json()
    class Failure:
        def generate(self,*args):raise ProviderError('explicit_terminal_test_failure')
    assert run_one(Failure())
    with DB() as db:
        o=db.get(Order,order['id'])
        assert o.state=='test_failed'
        assert db.scalar(select(func.count()).select_from(Refund))==0
