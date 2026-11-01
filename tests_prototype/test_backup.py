import os
import json
import subprocess
import sys
import uuid
import psycopg
from psycopg import sql
from sqlalchemy import select
from app.prototype.config import cfg
from app.prototype.models import DB, Document, engine
from .helpers import signup, create_cash, TestGateway, generate_all
from app.prototype import payments


def test_dump_restore_new_postgres_database_with_docx(client,tmp_path):
    signup(client)
    id,oid = create_cash(client)
    g = TestGateway()
    g.status = 'succeeded'
    payments.reconcile_order(oid,g)
    generate_all()
    with DB() as db:
        original_hash = db.get(Document,id).file_hash
        assert original_hash
    backup = tmp_path/'backup'
    env = {**os.environ,'DATA_DIR':str(cfg.DATA_DIR)}
    subprocess.run([sys.executable,'-m','app.prototype.manage','backup','--directory',str(backup)],check=True,env=env)
    target = 'gd_'+uuid.uuid4().hex[:10]+'_restore_test'
    try:
        subprocess.run([sys.executable,'-m','app.prototype.manage','restore-test','--directory',str(backup),
                        '--target-database',target],check=True,env=env)
        from sqlalchemy import create_engine
        from sqlalchemy.orm import Session
        restored = create_engine(engine.url.set(database=target))
        with Session(restored) as db:
            doc = db.get(Document,id)
            assert doc.file_hash == original_hash
            from app.prototype.documents import read
            assert read(doc)
        restored.dispose()
    finally:
        url = engine.url
        with psycopg.connect(host=url.host,port=url.port,user=url.username,password=url.password or '',
                             dbname='postgres',autocommit=True) as conn:
            conn.execute(sql.SQL('DROP DATABASE IF EXISTS {}').format(sql.Identifier(target)))
