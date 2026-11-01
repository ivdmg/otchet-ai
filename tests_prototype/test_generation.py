import io
from pathlib import Path
import subprocess
import sys
from docx import Document as WordDocument
from sqlalchemy import select
from app.prototype.config import cfg
from app.prototype.models import DB, Document, Job, Order, now
from app.prototype import payments, documents
from app.prototype.providers import ProviderError
from app.prototype.worker import run_one, claim, fenced
from .helpers import signup, create_cash, generate_all, TestAI, TestGateway, PARAGRAPH, approved
import pytest


def paid(client):
    doc,order = create_cash(client)
    gateway = TestGateway()
    gateway.status = 'succeeded'
    payments.reconcile_order(order,gateway)
    return doc,order,gateway


@pytest.mark.parametrize('storage',['disk','bytea'])
def test_saved_progress_docx_restart_and_download(client,monkeypatch,storage):
    monkeypatch.setattr(cfg,'STORAGE',storage)
    signup(client)
    id,oid,gateway = paid(client)
    with DB() as db:
        job_id = db.scalar(select(Job.id).where(Job.order_id == oid))
    before = client.get(f'/api/v1/jobs/{job_id}').json()
    assert before['percent'] == 0
    ai = TestAI()
    run_one(ai)
    first = client.get(f'/api/v1/jobs/{job_id}').json()
    assert first['percent'] == 5
    # Separate process reads committed checkpoint, no in-memory continuation state.
    code = "from app.prototype.models import DB,Job; from sqlalchemy import select;\nwith DB() as d:\n j=d.get(Job,'"+job_id+"'); assert 'intro' in j.steps"
    subprocess.run([sys.executable,'-c',code],check=True)
    assert client.get(f'/api/v1/jobs/{job_id}').json()['percent'] == 5
    generate_all(ai)
    assert ai.calls.count('Введение') == 1
    assert 'plan' not in ai.calls
    result = client.get(f'/api/v1/jobs/{job_id}').json()
    assert result['status'] == 'completed'
    assert result['percent'] == 100
    data = client.get(f'/api/v1/documents/{id}/download')
    assert data.status_code == 200
    text = '\n'.join(p.text for p in WordDocument(io.BytesIO(data.content)).paragraphs)
    assert PARAGRAPH in text and 'Теоретические основы' in text
    assert len(client.get('/api/v1/documents').json()['items']) == 1
    calls = len(ai.calls)
    assert client.get(f'/api/v1/documents/{id}/download').content == data.content
    assert len(ai.calls) == calls
    with DB() as db:
        doc = db.get(Document,id)
        assert documents.read(doc) == data.content


def test_expired_worker_fenced_and_checkpoint_recovers(client):
    signup(client)
    id,oid,_ = paid(client)
    old_id,old_token = claim()
    with DB.begin() as db:
        db.get(Job,old_id).lease_until = now()-1
    new_id,new_token = claim()
    assert old_id == new_id and old_token != new_token
    with DB.begin() as db:
        with pytest.raises(ProviderError,match='lease_lost'):
            fenced(db,old_id,old_token)
        j = db.get(Job,new_id)
        j.lease_until = now()-1
    generate_all()
    assert client.get(f'/api/v1/documents/{id}').json()['state'] == 'completed'


def test_worker_process_restart_resumes_saved_section(client):
    import os
    signup(client)
    id,oid,_ = paid(client)
    env = {**os.environ,'DATA_DIR':str(cfg.DATA_DIR),'TPM':'1000000','DAILY_TOKENS':'1000000'}
    subprocess.run([sys.executable,'-c',
        'from app.prototype.worker import run_one; from tests_prototype.helpers import TestAI; assert run_one(TestAI())'],check=True,env=env)
    with DB() as db:
        j = db.scalar(select(Job).where(Job.order_id == oid))
        assert 'intro' in j.steps
    script = '''
from app.prototype.worker import run_one
from tests_prototype.helpers import TestAI
class ResumedAI(TestAI):
    def generate(self, topic, headings, step):
        assert step not in ('plan','Введение'), 'saved content was regenerated'
        return super().generate(topic, headings, step)
ai=ResumedAI()
for _ in range(10):
    if not run_one(ai): break
'''
    subprocess.run([sys.executable,'-c',script],check=True,env=env)
    assert client.get(f'/api/v1/documents/{id}/download').status_code == 200


def test_expired_document_text_is_removed(client):
    signup(client)
    id,oid,_ = paid(client)
    generate_all()
    with DB.begin() as db:
        doc = db.get(Document,id)
        path = Path(doc.file_path)
        doc.expires = now()-1
    with DB.begin() as db:
        documents.expire(db)
    assert not path.exists()
    assert client.get(f'/api/v1/documents/{id}/download').status_code == 404
    with DB() as db:
        doc = db.get(Document,id)
        assert doc.state == 'expired'
        j = db.scalar(select(Job).where(Job.order_id == oid))
        assert all('paragraphs' not in item for item in j.steps.values())


def test_timeout_preserves_progress_and_terminal_refund(client):
    signup(client)
    id,oid,gateway = paid(client)
    run_one(TestAI())
    class Timeout:
        def generate(self,*args):
            raise ProviderError('ai_timeout',True,30)
    run_one(Timeout())
    with DB() as db:
        j = db.scalar(select(Job).where(Job.order_id == oid))
        jid = j.id
        assert j.state == 'retry' and 'intro' in j.steps and j.charged >= 4100
    status = client.get(f'/api/v1/jobs/{jid}').json()
    assert status['percent'] == 5 and status['retry_at'] and status['error'] == 'ai_timeout'
    for _ in range(6):
        with DB.begin() as db:
            j = db.get(Job,jid)
            j.retry_at = 0
        run_one(Timeout())
    with DB() as db:
        assert db.get(Job,jid).state == 'failed'
        assert db.get(Order,oid).state == 'refund_pending'
    payments.reconcile(gateway)
    assert client.get(f'/api/v1/orders/{oid}').json()['state'] == 'refunded'
    assert client.get(f'/api/v1/jobs/{jid}').json()['percent'] == 5
    assert client.get(f'/api/v1/documents/{id}/download').status_code == 404


def test_budget_and_no_ai_fallback(client,monkeypatch):
    signup(client)
    monkeypatch.setattr(cfg,'GROQ_API_KEY','')
    r = client.post('/api/v1/documents',json={'topic':'Учебная тема без контактов','anonymized':True})
    assert r.status_code == 503 and r.json()['detail'] == 'groq_key_missing'
    monkeypatch.setattr(cfg,'GROQ_API_KEY','test')
    monkeypatch.setattr(cfg,'DAILY_TOKENS',6000)
    assert client.post('/api/v1/documents',json={'topic':'Учебная тема без контактов','anonymized':True}).status_code == 429


def test_docx_contains_table_and_content_not_title_only(client):
    signup(client)
    id,_,_ = paid(client)
    class TableAI(TestAI):
        def generate(self,*args):
            c,u = super().generate(*args)
            c['table'] = {'headers':['Показатель','Описание'],'rows':[['Тест','Кириллица']], 'caption':'Учебная таблица'}
            return c,u
    generate_all(TableAI())
    data = client.get(f'/api/v1/documents/{id}/download').content
    output = WordDocument(io.BytesIO(data))
    assert len(output.tables) == 5
    assert output.tables[0].cell(1,1).text == 'Кириллица'
    assert round(output.sections[0].left_margin.mm) == 30
