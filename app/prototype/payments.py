from sqlalchemy import select
from decimal import Decimal, InvalidOperation
from .models import DB, Job, Order, PaymentEvent, Refund, now
from .providers import YooKassa, ProviderError, amount_string
from . import bonus


def enqueue(db, order):
    existing = db.scalar(select(Job).where(Job.order_id == order.id))
    if existing:
        return existing
    from . import documents
    from .models import Document
    doc = db.get(Document,order.document_id)
    job = Job(units=documents.freeze_units(doc.settings,doc.approved_plan),document_id=order.document_id, order_id=order.id, kind='document',
              budget=order.ai_budget, model=order.model)
    db.add(job)
    order.state = 'queued'
    return job


def verify(db, order, p, gateway):
    gateway.validate_payment(p, order)
    event_id = f"{p['id']}:{p['status']}"
    if db.get(PaymentEvent, event_id):
        return
    if p['status'] == 'succeeded' and p.get('paid') is True:
        db.add(PaymentEvent(id=event_id, order_id=order.id))
        order.receipt_status = p.get('receipt_registration', 'not_requested_sandbox')
        if order.state == 'checking_payment':
            enqueue(db, order)
    elif p['status'] == 'canceled' and order.state == 'checking_payment':
        db.add(PaymentEvent(id=event_id, order_id=order.id))
        order.state = 'cancelled'


def reconcile_order(order_id, gateway=None):
    gateway = gateway or YooKassa()
    with DB.begin() as db:
        order = db.scalar(select(Order).where(Order.id == order_id).with_for_update())
        if not order or order.method != 'cash' or order.state != 'checking_payment':
            return
        if not order.payment_id:
            # Provider keys expire after 24h: stop before creating a potentially duplicate charge.
            if now()-order.created >= 23*3600:
                order.state = 'payment_attention'
                return
            p = gateway.create(order)
            order.payment_id = p['id']
            gateway.validate_payment(p, order)
            order.checkout_url = p.get('confirmation',{}).get('confirmation_url')
        else:
            p = gateway.payment(order.payment_id)
        verify(db, order, p, gateway)


def request_refund(db, order, amount, operation_id):
    existing = db.scalar(select(Refund).where(Refund.operation_id == operation_id))
    if existing:
        return existing
    pending = db.scalars(select(Refund).where(Refund.order_id == order.id,
                          Refund.state.notin_(['succeeded','simulated']))).all()
    if pending or amount <= 0 or order.refunded+amount > order.amount:
        raise ValueError('refund_conflict')
    refund = Refund(order_id=order.id, amount=amount, operation_id=operation_id)
    db.add(refund)
    if order.receipt_status == 'simulated_no_charge':
        refund.state = 'simulated'
        db.flush()
        order.refunded += amount
        order.state = 'simulated_refund' if order.refunded == order.amount else 'simulated_partial_refund'
        bonus.reverse_reward(db,order,refund.id)
    else:
        order.state = 'refund_pending'
    return refund


def reconcile_refund(refund_id, gateway=None):
    gateway = gateway or YooKassa()
    with DB.begin() as db:
        # Uniform order -> refund -> attribution -> account lock ordering.
        r = db.get(Refund, refund_id)
        if not r or r.state in ('succeeded','simulated') or r.retry_at > now():
            return
        order = db.scalar(select(Order).where(Order.id == r.order_id).with_for_update())
        db.refresh(r, with_for_update=True)
        if r.state in ('succeeded','simulated'):
            return
        if not r.provider_id and now()-r.created >= 23*3600:
            order.state = 'refund_attention'
            r.error = 'refund_idempotency_window_expired'
            r.retry_at = now()+86400
            return
        try:
            p = gateway.refund(r, order)
            if (p.get('payment_id') != order.payment_id or
                p.get('amount') != {'value':amount_string(r.amount),'currency':'RUB'}
                or (r.provider_id and r.provider_id != p.get('id'))):
                raise ProviderError('refund_verification_failed')
            r.provider_id = p['id']
            r.state = p['status']
            r.error = None
            if r.state == 'succeeded':
                order.refunded += r.amount
                order.state = 'refunded' if order.refunded == order.amount else 'partially_refunded'
                bonus.reverse_reward(db, order, r.id)
            elif r.state == 'canceled':
                order.state = 'refund_attention'
                r.error = 'refund_canceled'
                r.retry_at = now()+3600
            else:
                r.retry_at = now()+30
        except ProviderError as exc:
            r.error = exc.code
            r.retry_at = now()+max(30, exc.retry_after)
            order.state = 'refund_pending' if exc.retryable else 'refund_attention'


def reconcile(gateway=None):
    with DB() as db:
        ids = list(db.scalars(select(Order.id).where(Order.state == 'checking_payment', Order.method == 'cash')))
        refunds = list(db.scalars(select(Refund.id).where(Refund.state.notin_(['succeeded','simulated']), Refund.retry_at <= now())))
    for id in ids:
        try:
            reconcile_order(id, gateway)
        except ProviderError:
            pass  # Remains uncertain; retry identical idempotency key, never infer paid.
    for id in refunds:
        reconcile_refund(id, gateway)


def refund_notification(db, id, gateway):
    """Import a verified merchant-dashboard refund too; payload is never trusted."""
    p = gateway.get_refund(id)
    order = db.scalar(select(Order).where(Order.payment_id == p.get('payment_id')).with_for_update())
    if not order:
        return
    payment = gateway.payment(order.payment_id)
    gateway.validate_payment(payment, order)
    if payment.get('status') != 'succeeded' or not payment.get('paid'):
        raise ProviderError('refund_payment_unverified')
    if p.get('id') != id or p.get('amount',{}).get('currency') != 'RUB':
        raise ProviderError('refund_verification_failed')
    try:
        decimal = Decimal(p['amount']['value'])*100
        amount = int(decimal)
        if decimal != amount or amount <= 0 or amount > order.amount:
            raise ValueError()
    except (KeyError, InvalidOperation, ValueError, OverflowError):
        raise ProviderError('refund_verification_failed') from None
    r = db.scalar(select(Refund).where(Refund.provider_id == id))
    if not r:
        uncertain = db.scalar(select(Refund).where(Refund.order_id == order.id,
                              Refund.provider_id.is_(None),Refund.state.notin_(['succeeded','simulated'])))
        if uncertain:
            if now()-uncertain.created >= 23*3600:
                raise ProviderError('refund_idempotency_window_expired')
            resolved = gateway.refund(uncertain,order)
            if resolved.get('id') == id:
                r = uncertain
                r.provider_id = id
    if r and r.state == 'succeeded':
        return
    if r and r.amount != amount:
        raise ProviderError('refund_verification_failed')
    if not r:
        r = Refund(order_id=order.id,operation_id='external:'+id,amount=amount,provider_id=id)
        db.add(r)
        db.flush()
    if p.get('status') == 'succeeded':
        if order.refunded+amount > order.amount:
            raise ProviderError('refund_total_conflict')
        r.state = 'succeeded'
        order.refunded += amount
        order.state = 'refunded' if order.refunded == order.amount else 'partially_refunded'
        bonus.reverse_reward(db,order,r.id)
    else:
        r.state = p.get('status','pending')
