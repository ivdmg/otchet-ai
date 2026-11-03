from app.prototype.ai_budget import reconcile_idle
from app.prototype.db import counter
from app.prototype.models import DB, Document, Job, Order, now
from .helpers import signup


def test_idle_releases_unused_reservations_keeps_unknown_usage(client):
    user=signup(client)
    day=now()//86400
    with DB.begin() as db:
        doc=Document(user_id=user['id'],topic='Проверка учёта AI',doc_type='abstract',state='failed')
        db.add(doc);db.flush()
        plan=Job(document_id=doc.id,kind='plan',state='completed',budget=7000,charged=400,usage=400,heartbeat=now())
        order=Order(document_id=doc.id,user_id=user['id'],method='cash',ai_budget=22400,amount=19900,state='simulated_refund')
        db.add_all([plan,order]);db.flush()
        # 3500 unknown tokens must remain charged; only spare reserves are freed.
        body=Job(document_id=doc.id,order_id=order.id,kind='document',state='failed',budget=22400,
                 charged=4100,usage=600,heartbeat=now())
        db.add(body);db.flush()
        counter(db,f'admission:{day}').value=29400
        counter(db,f'execution:{day}').value=10500
        changes=reconcile_idle(db)
        assert changes['admission']['after']==4500
        assert changes['execution']['after']==4500
        assert body.charged==4100 and body.usage==600
        assert reconcile_idle(db)=={}
        assert counter(db,f'ai-unused-released:admission:{day}').value==24900


def test_active_queue_is_not_reconciled(client):
    user=signup(client);day=now()//86400
    with DB.begin() as db:
        doc=Document(user_id=user['id'],topic='Проверка активной очереди',doc_type='abstract')
        db.add(doc);db.flush()
        db.add(Job(document_id=doc.id,kind='plan',state='queued',budget=7000));db.flush()
        counter(db,f'admission:{day}').value=7000
        assert reconcile_idle(db)=={}
        assert counter(db,f'admission:{day}').value==7000


def test_waiting_order_keeps_full_reserve(client):
    user=signup(client);day=now()//86400
    with DB.begin() as db:
        doc=Document(user_id=user['id'],topic='Проверка ожидающего заказа',doc_type='abstract',state='ordered')
        db.add(doc);db.flush()
        db.add(Order(document_id=doc.id,user_id=user['id'],method='cash',ai_budget=22400,amount=19900,state='checking_payment'))
        db.flush();counter(db,f'admission:{day}').value=22400
        reconcile_idle(db)
        assert counter(db,f'admission:{day}').value==22400
