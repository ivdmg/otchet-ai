"""PostgreSQL acceptance for the current Studio contract. AI doubles are explicit."""
from concurrent.futures import ThreadPoolExecutor
import hashlib
import pytest
from sqlalchemy import select,func
from app.prototype.models import DB,Document,Job,Order,BonusAccount,BonusEntry,User,Attribution,Reward,now,uid
from app.prototype.config import cfg
from app.prototype.schemas import Draft,Plan
from app.prototype.catalog import CATALOG,VERSION
from app.prototype import bonus,documents
from app.prototype.worker import run_one
from .helpers import signup,PARAGRAPH

OUTLINE={'chapters':[{'title':'Теоретические основы','sections':['Основные понятия']},{'title':'Практический анализ','sections':['Методы проверки']}]}
INPUT={'topic':'Сохранение учебных данных','anonymized':True,'pages':3,'chapters':2,'subject':'Информатика','notes':'Резервное копирование'}

class ExplicitAI:
    def generate(self,topic,headings,step,settings=None):
        if step=='plan': return OUTLINE,400
        return {'paragraphs':[PARAGRAPH],'table':None},500

def approved(client):
    r=client.post('/api/v1/documents',json=INPUT)
    assert r.status_code==202,r.text
    id=r.json()['document_id']
    assert run_one(ExplicitAI())
    assert client.put('/api/v1/documents/'+id+'/plan',json=OUTLINE).status_code==200
    q=client.post('/api/v1/documents/'+id+'/approve')
    assert q.status_code==200,q.text
    return id,q.json()['approval_hash']

@pytest.mark.parametrize('kind,cap',[('abstract',10),('coursework',25),('vkr',80)])
def test_catalog_bounds(kind,cap):
    assert Draft(**{**INPUT,'doc_type':kind,'pages':cap}).pages==cap
    for bad in (cap+1,-1,0,1.5,'5',True):
        with pytest.raises(ValueError): Draft(**{**INPUT,'doc_type':kind,'pages':bad})
    assert sum(w for _,_,w in documents.pipeline(OUTLINE))==100
    assert Plan.model_validate(OUTLINE)

def test_checkout_snapshot_idempotency_and_metadata(client,monkeypatch):
    signup(client);monkeypatch.setattr(cfg,'MOCK_PAYMENTS',True)
    id,signature=approved(client)
    stale=client.post('/api/v1/documents/'+id+'/orders',json={'method':'cash','approval_hash':'0'*64})
    assert stale.status_code==409
    def buy(): return client.post('/api/v1/documents/'+id+'/orders',json={'method':'cash','approval_hash':signature})
    with ThreadPoolExecutor(2) as pool: results=list(pool.map(lambda _:buy(),range(2)))
    assert all(r.status_code==202 for r in results),[r.text for r in results]
    assert len({r.json()['id'] for r in results})==1
    with DB() as db:
        assert db.scalar(select(func.count()).select_from(Order))==1
        assert db.scalar(select(func.count()).select_from(Job).where(Job.kind=='document'))==1
        o=db.scalar(select(Order));assert o.amount==19900 and o.payment_id is None
    assert results[0].json()['cash_charged'] is False
    assert client.put('/api/v1/documents/'+id+'/plan',json=OUTLINE).status_code==409
    # Owner checks, no job step/body in library, legacy content routes removed.
    items=client.get('/api/v1/documents').json()['items']
    assert 'jobs' not in items[0] and 'download_url' not in items[0]
    assert client.get('/api/v1/documents/'+id+'/preview').status_code==404

def test_account_plan_limit_race_and_independent_accounts(client):
    signup(client)
    def create(): return client.post('/api/v1/drafts',json=INPUT).json()['document_id']
    ids=[create() for _ in range(4)]
    with ThreadPoolExecutor(4) as pool:
        results=list(pool.map(lambda id:client.post('/api/v1/documents/'+id+'/generate-plan'),ids))
    assert sorted(r.status_code for r in results)==[202,202,202,429]
    signup(client,'second@example.org')
    assert client.post('/api/v1/documents',json=INPUT).status_code==202
    assert client.post('/api/v1/documents',json={**INPUT,'pages':100}).status_code==422

def test_rewards_five_buyers_spend_reversal_release(client):
    owner=signup(client)
    with DB.begin() as db:
        for i in range(5):
            u=User(email=f'friend{i}@example.org',password='test-only',verified=True)
            db.add(u);db.flush();db.add(BonusAccount(user_id=u.id));db.add(Attribution(invited=u.id,inviter=owner['id'],standard_price=19900));db.flush()
            d=Document(user_id=u.id,topic='Тестовый заказ',doc_type='abstract',state='completed',settings=INPUT)
            db.add(d);db.flush()
            o=Order(user_id=u.id,document_id=d.id,amount=19900,method='cash',state='completed',receipt_status='simulated_no_charge')
            db.add(o);db.flush();bonus.cashback(db,o);bonus.cashback(db,o);bonus.qualify(db,o);bonus.qualify(db,o)
            assert db.get(BonusAccount,u.id).available==995
        bonus.mature(db,clock=now()+15*86400)
        a=db.get(BonusAccount,owner['id']);assert a.available==19900
        d=Document(user_id=owner['id'],topic='Бонусная работа',doc_type='abstract',settings=INPUT)
        db.add(d);db.flush();o=Order(user_id=owner['id'],document_id=d.id,amount=19900,method='bonus',state='completed');db.add(o);db.flush()
        bonus.change(db,owner['id'],'reserve:'+o.id,'reserve',19900,o.id)
        bonus.cashback(db,o);bonus.qualify(db,o)
        reward=db.scalar(select(Reward));cash=db.get(Order,reward.order_id)
        cash.refunded=9950;bonus.reverse_reward(db,cash,'half');bonus.reverse_reward(db,cash,'half')
        buyer=db.get(BonusAccount,cash.user_id);assert buyer.available==497
        cash.refunded=19900;bonus.reverse_reward(db,cash,'full')
        assert buyer.available==0
        assert a.debt==3980
        bonus.change(db,owner['id'],'release:'+o.id,'release',19900,o.id)
        assert a.debt==0 and a.available==15920 and a.reserved==0
        assert db.scalar(select(func.count()).select_from(BonusEntry).where(BonusEntry.kind=='cashback'))==5

def test_delivery_owner_expiry_cleanup_backup(client,tmp_path):
    owner=signup(client)
    with DB.begin() as db:
        d=Document(user_id=owner['id'],topic='Временная работа',doc_type='abstract',state='completed',settings=INPUT,
                   delivery_id=uid(),expires=now()+60,plan=OUTLINE,approved_plan=OUTLINE)
        db.add(d);db.flush();did=d.id;delivery=d.delivery_id
        root=cfg.DATA_DIR/'documents';root.mkdir()
        f=root/(d.id+'-test.docx');f.write_bytes(b'private-body')
        pdf=f.with_suffix('.pdf');pdf.write_bytes(b'%PDF-private-body')
        d.file_path=str(f);d.pdf_path=str(pdf);d.file_hash=hashlib.sha256(f.read_bytes()).hexdigest();d.pdf_hash=hashlib.sha256(pdf.read_bytes()).hexdigest()
        db.add(Job(document_id=d.id,kind='document',state='completed',steps={'intro':{'paragraphs':['private-body']}}))
    assert client.get('/api/v1/deliveries/'+delivery+'/pdf?inline=true').status_code==200
    signup(client,'other@example.org')
    assert client.get('/api/v1/deliveries/'+delivery+'/pdf').status_code==404
    with DB.begin() as db: db.get(Document,did).expires=now()-1
    # Authenticate original again via existing test password.
    from .helpers import PASSWORD
    r=client.post('/api/v1/auth/login',json={'email':owner['email'],'password':PASSWORD});client.headers['X-CSRF-Token']=r.json()['csrf_token']
    assert client.get('/api/v1/deliveries/'+delivery+'/pdf').status_code==410
    assert not f.exists() and not pdf.exists()
    with DB.begin() as db:
        documents.expire(db);d=db.get(Document,did)
        assert d.plan is None and d.approved_plan is None
        assert db.scalar(select(func.count()).select_from(BonusAccount))==2
    from app.prototype.retention import metadata_backup
    backup=tmp_path/'backup';backup.mkdir();metadata_backup(backup)
    text=(backup/'metadata.json').read_text(encoding='utf-8')
    assert 'private-body' not in text


def test_bonus_terminal_failure_releases_without_cashback(client,monkeypatch):
    owner=signup(client)
    # Earn through completed cash orders; no registration/grant balance.
    with DB.begin() as db:
        for i in range(20):
            d=Document(user_id=owner['id'],topic='Покупка для теста',doc_type='abstract',settings=INPUT,state='completed');db.add(d);db.flush()
            o=Order(user_id=owner['id'],document_id=d.id,amount=19900,method='cash',state='completed');db.add(o);db.flush();bonus.cashback(db,o)
    id,signature=approved(client)
    r=client.post('/api/v1/documents/'+id+'/orders',json={'method':'bonus','approval_hash':signature});assert r.status_code==202,r.text
    class Fails:
        def generate(self,*args,**kwargs):
            from app.prototype.providers import ProviderError
            raise ProviderError('explicit_test_failure')
    run_one(Fails())
    with DB() as db:
        o=db.get(Order,r.json()['id']);a=db.get(BonusAccount,owner['id'])
        assert o.state=='bonus_released' and a.available==19900 and a.reserved==0
        assert db.scalar(select(func.count()).select_from(BonusEntry).where(BonusEntry.kind=='cashback'))==20


def test_concurrent_earned_spend_and_mock_refund(client):
    owner=signup(client)
    from app.prototype import payments
    with DB.begin() as db:
        for _ in range(20):
            d=Document(user_id=owner['id'],topic='Тестовая покупка',doc_type='abstract',settings=INPUT,state='completed');db.add(d);db.flush()
            o=Order(user_id=owner['id'],document_id=d.id,amount=19900,method='cash',state='completed',receipt_status='simulated_no_charge');db.add(o);db.flush();bonus.cashback(db,o)
        cash_id=o.id
    def spend(op):
        with DB.begin() as db:
            try: bonus.change(db,owner['id'],op,'reserve',19900);return True
            except bonus.InsufficientBonus: return False
    with ThreadPoolExecutor(2) as pool: assert sorted(pool.map(spend,['race-1','race-2']))==[False,True]
    with DB.begin() as db:
        o=db.get(Order,cash_id)
        r=payments.request_refund(db,o,9950,'partial')
        same=payments.request_refund(db,o,9950,'partial');assert r.id==same.id
        assert r.state=='simulated' and o.refunded==9950 and o.state=='simulated_partial_refund'
        payments.request_refund(db,o,9950,'full')
        a=db.get(BonusAccount,owner['id']);assert a.debt==995
        bonus.change(db,owner['id'],'release-race','release',19900)
        assert a.debt==0 and a.available==18905 and a.reserved==0
        assert db.scalar(select(func.count()).select_from(BonusEntry).where(BonusEntry.operation_id.like('cashback-reversal:%')))==2


def test_budget_admission_before_order_and_daily_plans(client,monkeypatch):
    signup(client);monkeypatch.setattr(cfg,'MOCK_PAYMENTS',True)
    id,signature=approved(client)
    monkeypatch.setattr(cfg,'DAILY_TOKENS',7000)
    r=client.post('/api/v1/documents/'+id+'/orders',json={'method':'cash','approval_hash':signature})
    assert r.status_code==429
    with DB() as db: assert db.scalar(select(func.count()).select_from(Order))==0
    monkeypatch.setattr(cfg,'DAILY_TOKENS',1000000);monkeypatch.setattr(cfg,'PLAN_HOURLY',100)
    for _ in range(4):
        d=client.post('/api/v1/drafts',json=INPUT).json()['document_id']
        assert client.post('/api/v1/documents/'+d+'/generate-plan').status_code==202
    d=client.post('/api/v1/drafts',json=INPUT).json()['document_id']
    assert client.post('/api/v1/documents/'+d+'/generate-plan').status_code==429


def test_frozen_units_and_budget_do_not_multiply_with_chapters():
    three={'chapters':OUTLINE['chapters']+[{'title':'Рекомендации по теме','sections':['Проверка предложений']}]}
    a=documents.freeze_units({**INPUT,'pages':25},OUTLINE)
    b=documents.freeze_units({**INPUT,'pages':25,'chapters':3},three)
    assert sum(u['weight'] for u in a)==pytest.approx(100)
    assert sum(u['weight'] for u in b)==pytest.approx(100)
    total=lambda units:sum(u['target_words'] for u in units if u['key'].startswith('section_'))
    assert 0.95<total(a)/total(b)<1.05
    # Frozen per-job targets are reused even if a caller changes runtime settings.
    result=documents.generation_settings({**INPUT,'pages':80},three,b[1]['key'],b)
    assert result['target_words']==b[1]['target_words']


def test_input_cap_before_llm():
    from app.prototype.providers import Groq,ProviderError
    import httpx
    def forbidden(request): raise AssertionError('No external call permitted')
    groq=Groq(httpx.MockTransport(forbidden))
    groq.generate('Тестовая тема',OUTLINE['chapters'],'Введение',settings=INPUT,preflight=True)
    with pytest.raises(ProviderError,match='input_token_limit'):
        groq.generate('Тестовая тема',OUTLINE['chapters'],'Введение',settings={**INPUT,'notes':'Слишком большой вход '*2000},preflight=True)
