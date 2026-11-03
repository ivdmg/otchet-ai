"""Local current-contract smoke: real AI, mock payment, both real file formats."""
import io
import json
import time
import sys
import argparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import httpx
from docx import Document
from app.prototype.config import cfg

assert cfg.MOCK_PAYMENTS, 'Enable explicit local MOCK_PAYMENTS first'
fixture = json.loads((cfg.DATA_DIR / 'seed-accounts.json').read_text())
parser = argparse.ArgumentParser()
parser.add_argument('--run-id', default='review-small-20261103')
parser.add_argument('--account', type=int, choices=range(6), default=1)
args = parser.parse_args()
assert args.run_id.replace('-', '').isalnum(), 'Use an alphanumeric run ID'
target = cfg.DATA_DIR / (args.run_id + '.json')
state = json.loads(target.read_text()) if target.exists() else {}
def save():
    target.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding='utf-8')
with httpx.Client(base_url='http://127.0.0.1:8000/api/v1', headers={'X-Prototype-Key':cfg.PROTOTYPE_KEY}, timeout=30) as client:
    def call(method, path, body=None):
        r = client.request(method, path, json=body)
        if r.is_error:
            raise RuntimeError(f'HTTP {r.status_code}: {r.json().get("detail")}')
        return r.json()
    login = call('POST', '/auth/login', {'email':fixture['accounts'][args.account]['email'], 'password':fixture['password']})
    client.headers['X-CSRF-Token'] = login['csrf_token']
    if not state:
        draft = call('POST', '/documents', {'topic':'Резервное копирование учебных данных', 'doc_type':'abstract', 'pages':3, 'chapters':2, 'subject':'Информатика', 'notes':'Краткий обзор принципов резервного копирования.', 'anonymized':True})
        state.update(document_id=draft['document_id'], requested_pages=3, provider=cfg.AI_PROVIDER, model=cfg.ai_model)
        save()
    last = None
    for _ in range(300):
        d = call('GET', '/documents/' + state['document_id'])
        if d['state'] == 'plan_ready':
            approval = call('POST', '/documents/' + d['id'] + '/approve')
            state['approval_hash'] = approval['approval_hash']
            save()
        elif d['state'] == 'approved':
            call('POST', '/documents/' + d['id'] + '/orders', {'method':'cash', 'approval_hash':state['approval_hash']})
        summary = {'state':d['state'], 'jobs':[{k:j.get(k) for k in ('kind','status','stage','percent','error','retry_at')} for j in d['jobs']]}
        if summary != last:
            print(json.dumps(summary, ensure_ascii=False), flush=True)
            state['result'] = summary
            save()
            last = summary
        if d['state'] == 'failed':
            state['order'] = d.get('order')
            save()
            raise SystemExit(2)
        if d['state'] == 'completed':
            state['actual_pages'] = d['actual_pages']
            state['files'] = {}
            for ext, prefix in [('docx',b'PK'),('pdf',b'%PDF')]:
                r = client.get('/deliveries/' + d['delivery_id'] + '/' + ext)
                assert r.status_code == 200 and r.content.startswith(prefix)
                state['files'][ext] = {'bytes':len(r.content)}
                if ext == 'docx':
                    paragraphs = [p.text for p in Document(io.BytesIO(r.content)).paragraphs]
                    state['text_characters'] = sum(map(len,paragraphs))
                    assert state['text_characters'] > 400
            save()
            print('PASS: real AI, mock checkout, DOCX/PDF; requested=3 actual='+str(d['actual_pages']), flush=True)
            break
        time.sleep(3)
    else:
        print('PENDING: resume same command; no duplicate order')
