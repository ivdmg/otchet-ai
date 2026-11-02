"""Backups contain financial history and metadata, never generated bodies/files."""
import json
from sqlalchemy import select
from .models import DB, Base, now


def metadata_backup(destination):
    tables = {}
    with DB() as db:
        db.connection(execution_options={"isolation_level":"REPEATABLE READ"})
        for table in Base.metadata.sorted_tables:
            rows = []
            for row in db.execute(select(table)).mappings():
                data = dict(row)
                if table.name == 'gd_documents':
                    for key in ('file_bytes','file_path','file_hash','pdf_path','pdf_hash','delivery_id'):
                        data[key] = None
                    if data['state'] not in ('draft','planning','plan_ready','approved'):
                        data['plan'] = data['approved_plan'] = None
                        data['settings'] = {k:v for k,v in data['settings'].items() if k not in ('notes','subject')}
                if table.name == 'gd_jobs':
                    data['units'] = [{k:v for k,v in unit.items() if k != 'heading'} for unit in data['units']]
                    data['steps'] = {k:{'backup_omitted':True} for k in data['steps']}
                    if data['state'] in ('queued','running','retry'):
                        data['state'],data['error'] = 'failed','restore_requires_reconciliation'
                rows.append(data)
            tables[table.name] = rows
    (destination/'metadata.json').write_text(json.dumps({'version':2,'created':now(),'tables':tables},ensure_ascii=False),encoding='utf-8')
    (destination/'manifest.json').write_text(json.dumps({'version':2,'created':now(),'temporary_content':False}),encoding='utf-8')
