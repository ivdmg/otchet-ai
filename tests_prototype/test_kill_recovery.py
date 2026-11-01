"""Kill an actual worker OS process at the two transaction boundaries."""
import os
import subprocess
import sys
import time
from sqlalchemy import select
import pytest
from app.prototype.config import cfg
from app.prototype.models import DB, Job, Document, now
from app.prototype import payments
from app.prototype.worker import run_one
from .helpers import signup, create_cash, TestGateway, TestAI, generate_all


@pytest.mark.parametrize('boundary',['before_checkpoint','before_publish_commit'])
def test_kill_worker_then_resume_once(client,tmp_path,boundary):
    signup(client)
    doc_id,order_id = create_cash(client)
    gateway = TestGateway()
    gateway.status = 'succeeded'
    payments.reconcile_order(order_id,gateway)
    if boundary == 'before_publish_commit':
        for _ in range(6):
            assert run_one(TestAI())
    marker = tmp_path/'boundary-reached'
    common = '''
import time
from pathlib import Path
from app.prototype.worker import run_one
from tests_prototype.helpers import TestAI
from app.prototype import documents
'''
    if boundary == 'before_checkpoint':
        script = common+f'''
class InterruptedAI(TestAI):
    def generate(self,*args):
        Path({str(marker)!r}).write_text('external-call-entered')
        while True: time.sleep(0.1)
run_one(InterruptedAI())
'''
    else:
        script = common+f'''
original=documents.store
def interrupted_store(*args):
    original(*args)
    Path({str(marker)!r}).write_text('file-written-not-committed')
    while True: time.sleep(0.1)
documents.store=interrupted_store
run_one(TestAI())
'''
    env = {**os.environ,'DATA_DIR':str(cfg.DATA_DIR),'TPM':'1000000','DAILY_TOKENS':'1000000'}
    process = subprocess.Popen([sys.executable,'-c',script],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        deadline = time.monotonic()+10
        while not marker.exists() and process.poll() is None and time.monotonic()<deadline:
            time.sleep(0.05)
        assert marker.exists(), 'worker did not reach the requested boundary'
    finally:
        if process.poll() is None:
            process.kill()
        process.wait(timeout=5)
    with DB.begin() as db:
        j = db.scalar(select(Job).where(Job.order_id == order_id))
        d = db.get(Document,doc_id)
        assert j.state == 'running' and d.file_hash is None
        assert ('validation' in j.steps) == (boundary == 'before_publish_commit')
        assert 'docx' not in j.steps
        j.lease_until = now()-1  # Closed test fixture advances lease expiry; no public reset.
    generate_all()
    result = client.get(f'/api/v1/documents/{doc_id}').json()
    job = next(j for j in result['jobs'] if j['kind']=='document')
    assert job['status'] == 'completed' and job['percent'] == 100
    assert client.get(result['download_url']).status_code == 200
    with DB() as db:
        assert len(db.scalars(select(Job).where(Job.order_id == order_id)).all()) == 1
