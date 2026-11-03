"""Release unused local AI reservations from the persisted job usage ledger.

Only an idle queue is reconciled. Unknown usage stays conservatively charged.
No provider requests, financial mutations, or account plan-limit resets occur.
"""
from sqlalchemy import select
from .db import counter
from .models import Job, Order, now


def reconcile_idle(db):
    clock = now()
    day = clock // 86400
    start = day * 86400
    # Same admission lock as new plan creation. Orders also acquire admission.
    counter(db, 'draft-admission')
    admission = counter(db, f'admission:{day}')
    execution = counter(db, f'execution:{day}')
    active = ('queued', 'running', 'retry', 'paused')
    if db.scalar(select(Job.id).where(Job.state.in_(active)).limit(1)):
        return {}
    jobs = db.execute(select(Job.kind, Job.created, Job.heartbeat, Job.charged, Job.order_id)).all()
    orders = db.execute(select(Order.id, Order.created, Order.ai_budget)).all()
    by_order = {j.order_id:j for j in jobs if j.order_id}
    # Admission originally reserved 7000 per plan and ai_budget per order.
    reserved = sum(j.charged for j in jobs if j.kind == 'plan' and j.created >= start)
    reserved += sum(by_order[o.id].charged if o.id in by_order else o.ai_budget
                    for o in orders if o.created >= start)
    # Include the entire charge of jobs touched today, even across midnight:
    # this can overestimate today's spend, but cannot erase unknown usage.
    spent = sum(j.charged for j in jobs if j.heartbeat and j.heartbeat >= start)
    result = {}
    for name, bucket, bound in [('admission', admission, reserved), ('execution', execution, spent)]:
        previous = bucket.value
        bucket.value = min(previous, bound)
        if previous != bucket.value:
            counter(db, f'ai-unused-released:{name}:{day}').value += previous-bucket.value
            result[name] = {'before':previous, 'after':bucket.value}
    return result
