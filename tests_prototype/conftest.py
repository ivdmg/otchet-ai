"""PostgreSQL-only verification, isolated from obsolete SQLite/demo API tests."""
import os
import subprocess
import sys
from pathlib import Path
import pytest

TEST_URL = os.environ.get('TEST_DATABASE_URL','postgresql+psycopg://gostdoc@127.0.0.1:55432/gostdoc_proto_test')
if not TEST_URL.rsplit('/',1)[-1].endswith('_test'):
    raise RuntimeError('TEST_DATABASE_URL database name must end in _test')
os.environ['DATABASE_URL'] = TEST_URL
os.environ['APP_ENV'] = 'test'
os.environ['PROTOTYPE_KEY'] = 'private-prototype-test-key-0000000000'

from app.prototype.models import Base, DB, engine
from app.prototype.config import cfg


@pytest.fixture(scope='session',autouse=True)
def migrated():
    subprocess.run([sys.executable,'-m','alembic','upgrade','head'],check=True)


@pytest.fixture(autouse=True)
def clean(monkeypatch,tmp_path,migrated):
    from sqlalchemy import text
    with engine.begin() as conn:
        tables = ','.join('"'+t.name+'"' for t in Base.metadata.sorted_tables)
        conn.execute(text('TRUNCATE '+tables+' CASCADE'))
    monkeypatch.setattr(cfg,'MOCK_PAYMENTS',False)
    monkeypatch.setattr(cfg,'GROQ_API_KEY','unit-test-not-a-real-key')
    monkeypatch.setattr(cfg,'YUKASSA_SHOP_ID','unit-test-shop')
    monkeypatch.setattr(cfg,'YUKASSA_SECRET_KEY','test_unit_only')
    monkeypatch.setattr(cfg,'TPM',10000000)
    monkeypatch.setattr(cfg,'DAILY_TOKENS',10000000)
    monkeypatch.setattr(cfg,'DATA_DIR',tmp_path)
    yield


@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    from app.prototype.api import app
    with TestClient(app,base_url='http://localhost:8000',headers={'X-Prototype-Key':cfg.PROTOTYPE_KEY}) as c:
        yield c
