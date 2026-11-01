"""Local operator commands. No HTTP admin/credit grant endpoint exists."""
import argparse
import json
import secrets
import shutil
import subprocess
from pathlib import Path
from sqlalchemy import select, func, text
from .config import cfg
from .models import DB, Base, User, BonusAccount, Job, Order, Reward, Refund, now
from .auth import password_hash
from . import bonus, payments


def seed_file():
    return cfg.DATA_DIR / 'seed-accounts.json'


def seed():
    if seed_file().exists():
        print('Existing private seed fixture: '+str(seed_file().resolve()))
        return
    password = secrets.token_urlsafe(24)
    from .models import Attribution
    accounts = []
    with DB.begin() as db:
        owner = None
        for i in range(6):
            user = User(email=f'proto-{now()}-{i}@example.org',password=password_hash(password),verified=True)
            db.add(user)
            db.flush()
            db.add(BonusAccount(user_id=user.id))
            if owner:
                db.add(Attribution(invited=user.id,inviter=owner))
            else:
                owner = user.id
            accounts.append({'id':user.id,'email':user.email,'role':'inviter' if i==0 else 'buyer'})
    seed_file().parent.mkdir(parents=True,exist_ok=True)
    seed_file().write_text(json.dumps({'password':password,'accounts':accounts},indent=2),encoding='utf-8')
    print('Private fixture saved: '+str(seed_file().resolve())+' (6 verified accounts, ZERO credits).')


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='command',required=True)
    sub.add_parser('status')
    sub.add_parser('seed')
    sub.add_parser('mature-seed')
    sub.add_parser('reset-test-db')
    export = sub.add_parser('openapi')
    export.add_argument('--output',default='docs/backend/openapi.json')
    refund = sub.add_parser('refund')
    refund.add_argument('--order',required=True)
    refund.add_argument('--amount-kopecks',type=int,required=True)
    refund.add_argument('--operation-id',required=True)
    review = sub.add_parser('reward-review')
    review.add_argument('--invited-user',required=True)
    review.add_argument('--decision',choices=['hold','release'],required=True)
    review.add_argument('--operation-id',required=True)
    token = sub.add_parser('mail-path')
    token.add_argument('--email',required=True)
    token.add_argument('--kind',choices=['verify','reset'],default='verify')
    backup = sub.add_parser('backup')
    backup.add_argument('--directory',required=True)
    backup.add_argument('--pg-bin',default='C:/Program Files/PostgreSQL/16/bin')
    restore = sub.add_parser('restore-test')
    restore.add_argument('--directory',required=True)
    restore.add_argument('--target-database',required=True)
    restore.add_argument('--pg-bin',default='C:/Program Files/PostgreSQL/16/bin')
    args = parser.parse_args()
    if args.command == 'seed':
        seed()
    elif args.command == 'status':
        with DB() as db:
            print(json.dumps({'mode':cfg.APP_ENV,'db':'PostgreSQL','storage':cfg.STORAGE,
                  'groq_key_set':bool(cfg.GROQ_API_KEY),'yukassa_test_key_set':bool(cfg.YUKASSA_SHOP_ID and cfg.YUKASSA_SECRET_KEY.startswith('test_')),
                  'jobs':dict(db.execute(select(Job.state,func.count()).group_by(Job.state)).all()),
                  'orders':dict(db.execute(select(Order.state,func.count()).group_by(Order.state)).all())},indent=2))
    elif args.command == 'mature-seed':
        fixture = json.loads(seed_file().read_text(encoding='utf-8'))
        owner = fixture['accounts'][0]
        if not owner['email'].startswith('proto-') or not owner['email'].endswith('@example.org'):
            raise SystemExit('Only the private seed fixture may use the test clock')
        with DB.begin() as db:
            user = db.get(User,owner['id'])
            if not user or user.email != owner['email']:
                raise SystemExit('Seed fixture mismatch')
            bonus.mature(db,clock=now()+15*86400,inviter=user.id)
        print('Test clock applied ONLY to earned pending rewards of the private seed inviter.')
    elif args.command == 'reset-test-db':
        if not cfg.DATABASE_URL.rsplit('/',1)[-1].endswith('_test'):
            raise SystemExit('Refused: database name must end in _test')
        with DB.begin() as db:
            db.execute(text('TRUNCATE '+','.join('"'+t.name+'"' for t in Base.metadata.sorted_tables)+' CASCADE'))
        print('Only gd_* rows in the explicitly selected _test DB were reset.')
    elif args.command == 'openapi':
        from .api import app
        path = Path(args.output)
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(json.dumps(app.openapi(),ensure_ascii=False,indent=2),encoding='utf-8')
        print('OpenAPI: '+str(path.resolve()))
    elif args.command == 'refund':
        with DB.begin() as db:
            o = db.scalar(select(Order).where(Order.id == args.order).with_for_update())
            if not o or o.method != 'cash' or not o.payment_id or o.state not in ('completed','partially_refunded','refund_pending','refund_attention','failed'):
                raise SystemExit('Verified cash order in refundable state required')
            r = payments.request_refund(db,o,args.amount_kopecks,args.operation_id)
            db.flush()
            print('Sandbox refund queued: '+r.id+'; run worker and check status, not confirmed yet.')
    elif args.command == 'mail-path':
        with DB() as db:
            user = db.scalar(select(User).where(User.email == args.email.lower()))
            if not user:
                raise SystemExit('Unknown account')
            print(str((cfg.DATA_DIR/'mail'/f'{user.id}-{args.kind}.txt').resolve()))
    elif args.command == 'reward-review':
        from .models import BonusEntry
        with DB.begin() as db:
            r = db.scalar(select(Reward).where(Reward.invited == args.invited_user).with_for_update())
            if not r or r.state not in ('pending','held'):
                raise SystemExit('Only an unmatured reward can be held/released for manual review')
            op = 'review:'+args.operation_id
            if not db.get(BonusEntry,op):
                r.state = 'held' if args.decision == 'hold' else 'pending'
                db.add(BonusEntry(operation_id=op,user_id=r.inviter,order_id=r.order_id,
                       kind='review_'+args.decision,amount=0,available_delta=0,reserved_delta=0,debt_delta=0))
        print('Pending reward review saved; refunds remain independent and are never blocked.')
    elif args.command == 'backup':
        destination = Path(args.directory).resolve()
        if destination.exists():
            raise SystemExit('Use a NEW backup directory; existing data is never overwritten')
        destination.mkdir(parents=True)
        url = __import__('sqlalchemy').engine.make_url(cfg.DATABASE_URL)
        # libpq reads password from child environment, never from argv or logs.
        import os
        env = {**os.environ,'PGPASSWORD':url.password or ''}
        subprocess.run([str(Path(args.pg_bin)/'pg_dump.exe'),'-h',url.host,'-p',str(url.port or 5432),
                        '-U',url.username,'-d',url.database,'-Fc','-f',str(destination/'database.dump')],env=env,check=True)
        source = cfg.DATA_DIR/'documents'
        if source.exists():
            shutil.copytree(source,destination/'documents')
        (destination/'manifest.json').write_text(json.dumps({'created':now(),'storage':cfg.STORAGE,
             'restore_original_document_dir':str(source.resolve()),'note':'Private local snapshot, not encrypted/offsite production backup'}),encoding='utf-8')
        print('Private local backup complete: '+str(destination))
    elif args.command == 'restore-test':
        import os
        import re
        import psycopg
        from psycopg import sql
        from sqlalchemy import create_engine
        from sqlalchemy.orm import Session
        from .models import Document
        from .documents import read
        target = args.target_database
        if not re.fullmatch(r'[a-z][a-z0-9_]{1,45}_restore_test',target):
            raise SystemExit('Target must be a NEW name ending in _restore_test')
        source = Path(args.directory).resolve()
        if not (source/'database.dump').is_file() or not (source/'manifest.json').is_file():
            raise SystemExit('Backup manifest/database.dump required')
        url = __import__('sqlalchemy').engine.make_url(cfg.DATABASE_URL)
        connection = dict(host=url.host,port=url.port or 5432,user=url.username,password=url.password or '',dbname='postgres')
        with psycopg.connect(**connection,autocommit=True) as admin:
            if admin.execute('SELECT 1 FROM pg_database WHERE datname=%s',(target,)).fetchone():
                raise SystemExit('Target already exists; refusing to overwrite any database')
            admin.execute(sql.SQL('CREATE DATABASE {}').format(sql.Identifier(target)))
        env = {**os.environ,'PGPASSWORD':url.password or ''}
        subprocess.run([str(Path(args.pg_bin)/'pg_restore.exe'),'-h',url.host,'-p',str(url.port or 5432),
                        '-U',url.username,'-d',target,'--no-owner','--exit-on-error',str(source/'database.dump')],env=env,check=True)
        folder = cfg.DATA_DIR/'restores'/target/'documents'
        if (source/'documents').exists():
            shutil.copytree(source/'documents',folder)
        restored = create_engine(url.set(database=target))
        count = 0
        with Session(restored) as db:
            for doc in db.scalars(select(Document).where(Document.file_hash.is_not(None))):
                if doc.file_path:
                    doc.file_path = str((folder/Path(doc.file_path).name).resolve())
                # Reopen/check hash even if the 90-day download deadline passed.
                old_expiry = doc.expires
                doc.expires = max(doc.expires or 0,now()+60)
                read(doc)
                doc.expires = old_expiry
                count += 1
            db.commit()
        restored.dispose()
        print(f'Restored into new isolated DB {target}; {count} DOCX hashes/OpenXML verified. Source DB unchanged.')


if __name__ == '__main__':
    main()
