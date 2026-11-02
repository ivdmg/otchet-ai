"""One PostgreSQL-backed worker: python -m app.prototype.worker.

External calls happen outside transactions. Each commit checks a fencing token.
Unknown usage/timeouts are conservatively charged; checkpoints survive restart.
"""
import argparse
import time
from pydantic import ValidationError
from sqlalchemy import or_, select, text
from .config import cfg
from .db import counter
from .models import DB, Document, Job, Order, now, uid
from .providers import Groq, ProviderError
from .schemas import Plan
from . import bonus, documents, payments


CALL_RESERVE = 3500
MAX_ATTEMPTS = cfg.AI_MAX_ATTEMPTS


def claim():
    with DB.begin() as db:
        job = db.scalar(select(Job).where(Job.state.in_(['queued','running','retry']),
                       Job.retry_at <= now(), Job.lease_until <= now())
                       .order_by(Job.created, Job.id).with_for_update(skip_locked=True).limit(1))
        if not job:
            return None
        job.state = 'running'
        job.attempt_token = uid()
        job.lease_until = now()+180
        job.heartbeat = now()
        return job.id, job.attempt_token


def fenced(db, id, token):
    job = db.scalar(select(Job).where(Job.id == id).with_for_update())
    if not job or job.attempt_token != token or job.lease_until <= now() or job.state != 'running':
        raise ProviderError('lease_lost')
    return job


def reserve_call(db, job):
    if job.charged+CALL_RESERVE > job.budget:
        raise ProviderError('job_token_budget_exhausted')
    minute = counter(db, f'tpm:{now()//60}')
    if minute.value+CALL_RESERVE > cfg.TPM:
        raise ProviderError('local_token_rate_limit', True, 61-now()%60)
    minute.value += CALL_RESERVE
    daily = counter(db, f'execution:{now()//86400}')
    if daily.value+CALL_RESERVE > cfg.DAILY_TOKENS:
        raise ProviderError('local_token_rate_limit', True, 86401-now()%86400)
    daily.value += CALL_RESERVE
    job.charged += CALL_RESERVE
    job.heartbeat = now()
    job.lease_until = now()+180


def fail(id, token, exc):
    with DB.begin() as db:
        job = db.scalar(select(Job).where(Job.id == id).with_for_update())
        if not job or job.attempt_token != token or job.state != 'running':
            return
        if exc.code == 'lease_lost':
            return
        job.error = exc.code
        job.heartbeat = now()
        job.lease_until = 0
        if exc.code == 'local_token_rate_limit':
            job.state = 'retry'
            job.retry_at = now()+exc.retry_after
            return
        job.attempts += 1
        from .catalog import CATALOG
        doc_type = db.get(Document,job.document_id).doc_type
        attempts = min(MAX_ATTEMPTS,1+CATALOG[doc_type]['repair_attempts'])
        if exc.retryable and job.attempts < attempts and job.charged+CALL_RESERVE <= job.budget:
            job.state = 'retry'
            job.retry_at = now()+max(exc.retry_after, min(300, 15*2**job.attempts))
            return
        job.state = 'failed'
        doc = db.get(Document, job.document_id)
        doc.state = 'failed'
        doc.expires = now()+86400
        doc.delivery_id = doc.delivery_id or uid()
        if job.order_id:
            order = db.scalar(select(Order).where(Order.id == job.order_id).with_for_update())
            order.state = 'failed'
            if order.method == 'bonus':
                bonus.change(db, order.user_id, 'release:'+order.id, 'release', order.amount, order.id)
                order.state = 'bonus_released'
            elif order.receipt_status == 'simulated_no_charge':
                payments.request_refund(db,order,order.amount-order.refunded,'technical:'+order.id)
            else:
                payments.request_refund(db, order, order.amount-order.refunded, 'technical:'+order.id)


def run_one(provider=None):
    claimed = claim()
    if not claimed:
        return False
    id, token = claimed
    try:
        with DB.begin() as db:
            job = fenced(db,id,token)
            doc = db.get(Document,job.document_id)
            if job.kind == 'plan':
                key, heading = 'plan', 'plan'
            else:
                key, heading, _ = next((s for s in documents.job_pipeline(job,doc) if s[0] not in job.steps), (None,None,None))
                if key is None:
                    raise ProviderError('checkpoint_inconsistent')
            job.stage = key
            if key not in ('validation','docx','pdf'):
                reserve_call(db,job)
            topic, plan = doc.topic, doc.approved_plan or {}
            active_provider = provider or Groq(model=job.model)
            steps = dict(job.steps)
            settings = dict(doc.settings)
        # No SQL transaction spans the AI request.
        if key not in ('validation','docx','pdf'):
            if job.kind != 'plan':
                settings = documents.generation_settings(settings,plan,key,job.units or None)
            started = time.monotonic()
            result, usage = active_provider.generate(topic,plan.get('chapters',[]),heading,settings=settings)
            if key == 'plan':
                result = Plan.model_validate(result).model_dump()
                if len(result['chapters']) != settings.get('chapters',2):
                    raise ProviderError('chapter_count_mismatch',True,15)
            else:
                result = documents.Content.model_validate(result).checked().model_dump()
            with DB.begin() as db:
                job = fenced(db,id,token)
                doc = db.get(Document,job.document_id)
                job.charged -= max(0, CALL_RESERVE-usage)
                job.usage += usage
                job.metrics = {**job.metrics,key:{'tokens':usage,'seconds':round(time.monotonic()-started,3)}}
                job.steps = {**job.steps,key:result}
                # Latency is operational metadata; never copy generated text into logs.
                job.heartbeat = now()
                if key == 'plan':
                    doc.plan = result
                    doc.state = 'plan_ready'
                    job.state,job.stage = 'completed','plan_ready'
                else:
                    doc.state = 'generating'
                    job.state = 'queued'
                job.error = None
                job.attempts = 0
                job.retry_at,job.lease_until,job.heartbeat = 0,0,now()
        elif key == 'validation':
            # Parse every saved section, then assemble and reopen an actual DOCX.
            documents.build(doc,steps,job.units or None)
            with DB.begin() as db:
                job = fenced(db,id,token)
                job.steps = {**job.steps,'validation':{'checked':True,'sources_verified':False}}
                job.state,job.stage,job.lease_until = 'queued','formatting',0
                job.error = None
        elif key == 'docx':
            data = documents.build(doc,steps,job.units or None)
            with DB.begin() as db:
                job = fenced(db,id,token)
                doc = db.get(Document,job.document_id)
                documents.store(doc,data,token)
                documents.read(doc)
                job.steps = {**job.steps,'docx':{'sha256':doc.file_hash,'bytes':len(data)}}
                job.state,job.stage,job.lease_until = 'queued','pdf',0
        else:
            documents.convert_pdf(doc)
            with DB.begin() as db:
                job = fenced(db,id,token)
                saved = db.scalar(select(Document).where(Document.id == job.document_id).with_for_update())
                saved.pdf_path,saved.pdf_hash,saved.actual_pages = doc.pdf_path,doc.pdf_hash,doc.actual_pages
                saved.delivery_id,saved.expires = uid(),now()+86400
                documents.read(saved)
                documents.read_pdf(saved)
                order = db.scalar(select(Order).where(Order.id == job.order_id).with_for_update())
                job.steps = {k:{'verified':True} for k in job.steps}
                job.units = [{k:v for k,v in unit.items() if k != 'heading'} for unit in job.units]
                job.steps = {**job.steps,'pdf':{'sha256':saved.pdf_hash,'actual_pages':saved.actual_pages}}
                job.state,job.stage,job.lease_until,job.error = 'completed','completed',0,None
                job.heartbeat = now()
                saved.state = 'completed'
                # Full outline/body are temporary; completed library is metadata only.
                saved.plan = saved.approved_plan = None
                prefix = 'simulated_' if order.receipt_status == 'simulated_no_charge' else ''
                order.state = (prefix+'refund' if prefix and order.refunded == order.amount else
                               prefix+'partial_refund' if prefix and order.refunded else
                               'refunded' if order.refunded == order.amount else
                               'partially_refunded' if order.refunded else 'completed')
                if order.method == 'bonus':
                    bonus.change(db,order.user_id,'capture:'+order.id,'capture',order.amount,order.id)
                else:
                    bonus.cashback(db,order)
                    bonus.qualify(db,order)
    except ProviderError as exc:
        fail(id,token,exc)
    except (ValueError, ValidationError, StopIteration):
        fail(id,token,ProviderError('invalid_document_content',True,15))
    except Exception:
        # Do not log provider payloads, user text, tokens, or database URLs.
        fail(id,token,ProviderError('worker_internal_error',True,30))
    return True


def tick(provider=None,gateway=None):
    payments.reconcile(gateway)
    with DB.begin() as db:
        bonus.mature(db)
        documents.expire(db)
    return run_one(provider)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--once',action='store_true')
    args = parser.parse_args()
    # Single coordinator, with DB leases as an additional fencing layer.
    with DB() as lock_db:
        if not lock_db.scalar(text('SELECT pg_try_advisory_lock(7140321)')):
            raise SystemExit('Another worker is active')
        print('AI GostDoc sandbox worker active; no secrets or generated text are logged.',flush=True)
        while True:
            try:
                worked = tick()
            except Exception:
                print('Worker tick failed; state preserved, retrying.',flush=True)
                worked = False
            if args.once:
                break
            time.sleep(1 if worked else 3)


if __name__ == '__main__':
    main()
