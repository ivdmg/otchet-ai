"""Explicit test doubles. These are never imported by application code."""
import io
import secrets
from docx import Document as WordDocument
from sqlalchemy import select
from app.prototype.config import cfg
from app.prototype.models import DB, User, Document, Order, Job, BonusAccount, now
from app.prototype.auth import password_hash
from app.prototype.providers import ProviderError, amount_string

PASSWORD = 'local-test-'+secrets.token_urlsafe(16)
PARAGRAPH = ('Это явно тестовый текст HTTP-заглушки, а не результат живой генерации. '
             'Он проверяет сохранение кириллицы, checkpoints и соответствие содержимого DOCX исходному разделу.')


class TestAI:
    __test__ = False
    def __init__(self):
        self.calls = []
    def generate(self,topic,headings,step):
        self.calls.append(step)
        if step == 'plan':
            return {'sections':['Теоретические основы','Практическое применение']},400
        return {'paragraphs':[step+': '+PARAGRAPH],'table':None},600


class TestGateway:
    __test__ = False
    def __init__(self):
        self.creates,self.refunds = {},{}
        self.status = 'pending'
        self.fail_refund = False
    def create(self,order):
        p = self.creates.setdefault(order.id, {'id':'test-'+order.id,'test':True,
             'amount':{'value':amount_string(order.amount),'currency':'RUB'},
             'metadata':{'order_id':order.id},'recipient':{'account_id':cfg.YUKASSA_SHOP_ID},
             'confirmation':{'confirmation_url':'https://example.invalid/explicit-test-double'}})
        return {**p,'status':self.status,'paid':self.status == 'succeeded'}
    def payment(self,id):
        p = next(p for p in self.creates.values() if p['id'] == id)
        return {**p,'status':self.status,'paid':self.status == 'succeeded'}
    def validate_payment(self,p,order):
        from app.prototype.providers import YooKassa
        YooKassa().validate_payment(p,order)
    def refund(self,r,order):
        if self.fail_refund:
            raise ProviderError('payment_unknown',True,30)
        return self.refunds.setdefault(r.id, {'id':'refund-'+r.id,'payment_id':order.payment_id,
            'amount':{'value':amount_string(r.amount),'currency':'RUB'},'status':'succeeded'})


def signup(client,email='owner@example.org',ref=None):
    r = client.post('/api/v1/auth/register',json={'email':email,'password':PASSWORD,**({'referral_code':ref} if ref else {})})
    assert r.status_code == 201,r.text
    u = r.json()
    token = (cfg.DATA_DIR/'mail'/f"{u['id']}-verify.txt").read_text()
    assert client.post('/api/v1/auth/verify',json={'token':token}).status_code == 200
    r = client.post('/api/v1/auth/login',json={'email':email,'password':PASSWORD})
    assert r.status_code == 200,r.text
    client.headers['X-CSRF-Token'] = r.json()['csrf_token']
    return u


def approved(client):
    from app.prototype.worker import run_one
    r = client.post('/api/v1/documents',json={'topic':'Обезличенная учебная тема','anonymized':True})
    assert r.status_code == 202,r.text
    id = r.json()['document_id']
    assert run_one(TestAI())
    assert client.post(f'/api/v1/documents/{id}/approve').status_code == 200
    return id


def create_cash(client):
    id = approved(client)
    r = client.post(f'/api/v1/documents/{id}/orders',json={'method':'cash'})
    assert r.status_code == 202,r.text
    return id,r.json()['id']


def generate_all(ai=None):
    from app.prototype.worker import run_one
    ai = ai or TestAI()
    for _ in range(30):
        if not run_one(ai):
            break
    return ai
