"""HTTP smoke against the real local application, no provider mocks.

--auth-only is independent of provider credentials. Full mode pauses for the
owner's real sandbox checkout and resumes from a private manifest on rerun.
"""
import argparse
import io
import json
import time
from pathlib import Path
import httpx
from docx import Document as WordDocument
from .config import cfg


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url',default='http://127.0.0.1:8000')
    parser.add_argument('--account',type=int,choices=range(6),default=1)
    parser.add_argument('--method',choices=['cash','bonus'],default='cash')
    parser.add_argument('--auth-only',action='store_true')
    parser.add_argument('--wait-seconds',type=int,default=900)
    parser.add_argument('--run-id',default='first')
    args = parser.parse_args()
    if not args.run_id.isalnum():
        raise SystemExit('--run-id must be alphanumeric')
    from urllib.parse import urlparse
    if urlparse(args.base_url).hostname not in ('localhost','127.0.0.1'):
        raise SystemExit('This smoke runner is restricted to local personal testing')
    fixture = json.loads((cfg.DATA_DIR/'seed-accounts.json').read_text(encoding='utf-8'))
    account = fixture['accounts'][args.account]
    manifest_path = cfg.DATA_DIR/f'smoke-{args.account}-{args.run_id}.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
    start = time.monotonic()
    deadline = start+args.wait_seconds
    def save():
        manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    with httpx.Client(base_url=args.base_url,headers={'X-Prototype-Key':cfg.PROTOTYPE_KEY},timeout=30) as c:
        def call(method,path,body=None):
            response = c.request(method,path,json=body)
            if response.status_code >= 400:
                try:
                    code = response.json().get('detail','request_failed')
                except ValueError:
                    code = 'request_failed'
                if not isinstance(code,str):
                    code = 'input_validation_error'
                raise SystemExit(f'HTTP {response.status_code}: {code}')
            return response.json()
        login = call('POST','/api/v1/auth/login',{'email':account['email'],'password':fixture['password']})
        c.headers['X-CSRF-Token'] = login['csrf_token']
        assert call('GET','/api/v1/auth/me')['user']['id'] == account['id']
        assert call('GET','/api/v1/catalog')['mode'] == 'sandbox'
        assert call('GET','/api/v1/referrals')['units'] == 'credit_hundredths'
        if args.auth_only:
            call('POST','/api/v1/auth/logout')
            print('PASS: real HTTP login/me/catalog/referrals/logout; PostgreSQL, no LLM/payment called.')
            return
        if not cfg.GROQ_API_KEY:
            raise SystemExit('BLOCKED: set GROQ_API_KEY locally; no sample text is generated.')
        if args.method == 'cash' and not (cfg.YUKASSA_SHOP_ID and cfg.YUKASSA_SECRET_KEY.startswith('test_')):
            raise SystemExit('BLOCKED: set YUKASSA_SHOP_ID and test_* YUKASSA_SECRET_KEY locally.')
        if not manifest:
            draft = call('POST','/api/v1/documents',{'topic':'Методы организации и проверки качества учебных данных','doc_type':'abstract','anonymized':True})
            manifest = {'document_id':draft['document_id'],'account_id':account['id'],'method':args.method,
                        'model':cfg.GROQ_MODEL,'provider':'groq','sandbox':True}
            save()
        if manifest['account_id'] != account['id'] or manifest['method'] != args.method:
            raise SystemExit('Manifest belongs to another account/method; choose another --run-id')
        previous = None
        while time.monotonic() < deadline:
            doc = call('GET','/api/v1/documents/'+manifest['document_id'])
            if doc['state'] == 'plan_ready':
                call('POST',f"/api/v1/documents/{doc['id']}/approve")
            elif doc['state'] == 'approved':
                order = call('POST',f"/api/v1/documents/{doc['id']}/orders",{'method':args.method})
                manifest['order_id'] = order['id']
                save()
            order = doc['order']
            if order:
                manifest['order_id'] = order['id']
                if order['checkout_url']:
                    manifest['checkout_url'] = order['checkout_url']
                save()
            state = {'document':doc['state'],'order':order['state'] if order else None,
                     'jobs':[{k:j[k] for k in ('kind','status','stage','percent','retry_at','error')} for j in doc['jobs']]}
            if state != previous:
                print(json.dumps(state,ensure_ascii=False),flush=True)
                if order and order['checkout_url'] and order['state'] == 'checking_payment':
                    print('Open checkout_url from private manifest: '+str(manifest_path.resolve()),flush=True)
                previous = state
            if doc['download_url'] and doc['state'] == 'completed':
                r = c.get(doc['download_url'])
                r.raise_for_status()
                paragraphs = WordDocument(io.BytesIO(r.content)).paragraphs
                assert sum(len(p.text) for p in paragraphs) > 400
                assert doc['approved_plan']['sections'][0] in [p.text for p in paragraphs]
                target = manifest_path.with_suffix('.docx')
                target.write_bytes(r.content)
                manifest.update({'completed':True,'elapsed_this_run_seconds':round(time.monotonic()-start,2),
                                 'jobs':doc['jobs'],'docx':str(target.resolve()),'bytes':len(r.content),
                                 'quality_review':'manual review pending; sources not automatically verified'})
                save()
                print('PASS: real provider pipeline and persisted DOCX. Private evidence: '+str(manifest_path.resolve()))
                return
            if doc['state'] == 'failed':
                save()
                raise SystemExit('FAILED: see persisted job error/refund status; no replacement sample was used.')
            time.sleep(3)
        save()
        raise SystemExit('PENDING: time limit reached; same command resumes this manifest without another order.')


if __name__ == '__main__':
    main()
