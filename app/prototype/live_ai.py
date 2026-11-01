"""Owner-only real AI acceptance. No HTTP route, payments, credits or DB writes.

Run: venv/Scripts/python.exe -m app.prototype.live_ai --run-id first
A rerun resumes validated private checkpoints. Never reports paid E2E success.
"""
import argparse
from collections import deque
import hashlib
import json
import os
from pathlib import Path
import re
import time
from types import SimpleNamespace
from .config import cfg
from .providers import Groq, ProviderError
from .schemas import Draft, Plan
from .documents import Content, build, pipeline, verify_docx


def atomic_json(path, value):
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')
    os.replace(temporary, path)


def run(topic, doc_type, run_id, provider=None, sleep=time.sleep):
    Draft(topic=topic, doc_type=doc_type, anonymized=True)
    if not re.fullmatch(r'[A-Za-z0-9_-]{1,48}', run_id):
        raise ValueError('invalid_run_id')
    if not cfg.GROQ_API_KEY:
        raise ProviderError('groq_key_missing')
    folder = cfg.DATA_DIR / 'live-ai' / run_id
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / 'manifest.json'
    state = json.loads(target.read_text(encoding='utf-8')) if target.exists() else {
        'scope':'owner_live_ai_only_not_paid_e2e', 'provider':'groq', 'model':cfg.GROQ_MODEL,
        'topic':topic, 'doc_type':doc_type, 'steps':{}, 'usage_reported':0,
        'charged_conservative':0, 'attempts':[], 'status':'prepared',
        'sources_automatically_verified':False,
    }
    if (state['topic'], state['doc_type'], state['model']) != (topic, doc_type, cfg.GROQ_MODEL):
        raise ValueError('run_input_changed_use_new_run_id')
    provider = provider or Groq(model=state['model'])
    recent = deque()
    def save(): atomic_json(target, state)
    def generate(step, headings, validator):
        for attempt in range(3):
            if state['charged_conservative'] + 3500 > cfg.JOB_BUDGET:
                raise ProviderError('live_ai_budget_exhausted')
            if cfg.TPM < 3500:
                raise ProviderError('live_ai_tpm_too_low')
            # Reserve conservative per-call maximum, including unknown external spend.
            while True:
                clock = time.monotonic()
                while recent and recent[0] <= clock - 60: recent.popleft()
                if (len(recent)+1)*3500 <= cfg.TPM: break
                sleep(max(1, 61-(clock-recent[0])))
            recent.append(time.monotonic())
            started = time.monotonic()
            state['charged_conservative'] += 3500
            state['status'] = 'running'
            state['stage'] = step
            save()
            try:
                result, usage = provider.generate(topic, headings, step)
                state['usage_reported'] += usage
                state['charged_conservative'] -= 3500-usage
                try: result = validator(result)
                except (ValueError, TypeError):
                    raise ProviderError('ai_content_invalid', True, 15) from None
                state['attempts'].append({'stage':step,'seconds':round(time.monotonic()-started,3),'reported_tokens':usage,'result':'validated'})
                save()
                return result
            except ProviderError as exc:
                state['attempts'].append({'stage':step,'seconds':round(time.monotonic()-started,3),'error':exc.code,'retry_after':exc.retry_after})
                save()
                if not exc.retryable or attempt==2: raise
                sleep(max(1, exc.retry_after))
    # Wait a full rate window on resume, since a previous process may have called AI.
    if target.exists() and state['attempts'] and state['status'] != 'completed': sleep(61)
    try:
        if 'plan' not in state:
            state['plan'] = generate('plan', [], lambda value: Plan.model_validate(value).model_dump())
            save()
        for step, heading, _ in pipeline(state['plan'])[:-2]:
            if step in state['steps']: continue
            state['steps'][step] = generate(heading, state['plan']['sections'], lambda value: Content.model_validate(value).checked().model_dump())
            save()
        document = SimpleNamespace(topic=topic,doc_type=doc_type,approved_plan=state['plan'])
        data = build(document, state['steps'])
        verify_docx(data, state['steps'])
        file = folder / 'result.docx'
        temporary = folder / 'result.tmp'
        temporary.write_bytes(data)
        os.replace(temporary, file)
        state.update(status='completed',stage='docx_verified',file=str(file.resolve()),sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))
        save()
        return file, target
    except (ProviderError, ValueError) as exc:
        state['status'] = 'failed'
        state['error'] = exc.code if isinstance(exc,ProviderError) else 'validation_failed'
        save()
        raise


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run-id', default='first')
    parser.add_argument('--topic', default='Сохранение данных в учебных информационных системах')
    parser.add_argument('--type', choices=['abstract','coursework','vkr'], default='abstract')
    args=parser.parse_args()
    try:
        file, manifest=run(args.topic,args.type,args.run_id)
    except ProviderError as exc:
        print('BLOCKED: '+exc.code+'; no sample text or payment success is substituted.')
        raise SystemExit(2) from None
    except ValueError:
        print('FAILED: invalid input/checkpoint/content. Check the private manifest; use a new run-id for changed input.')
        raise SystemExit(2) from None
    print('PASS: real provider DOCX verified. This is owner AI acceptance, NOT payment/referral E2E.')
    print('DOCX: '+str(file.resolve()))
    print('Manifest: '+str(manifest.resolve()))


if __name__ == '__main__': main()
