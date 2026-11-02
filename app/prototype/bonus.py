from sqlalchemy import select
from .models import (Attribution, BonusAccount, BonusEntry, Order, Reward, now)


class InsufficientBonus(Exception):
    pass


def account(db, user_id):
    return db.scalar(select(BonusAccount).where(BonusAccount.user_id == user_id).with_for_update())


def change(db, user_id, operation_id, kind, amount, order_id=None):
    a = account(db, user_id)
    if db.get(BonusEntry, operation_id):
        return
    before = (a.available, a.reserved, a.debt)
    if kind == 'reserve':
        if a.debt or a.available < amount:
            raise InsufficientBonus()
        a.available -= amount
        a.reserved += amount
    elif kind == 'capture':
        if a.reserved < amount:
            raise ValueError('missing_reserve')
        a.reserved -= amount
    elif kind in ('release', 'mature', 'cashback'):
        if kind == 'release':
            if a.reserved < amount:
                raise ValueError('missing_reserve')
            a.reserved -= amount
        pay_debt = min(a.debt, amount)
        a.debt -= pay_debt
        a.available += amount - pay_debt
    elif kind == 'reversal':
        take = min(a.available, amount)
        a.available -= take
        a.debt += amount - take
    else:
        raise ValueError('invalid_bonus_operation')
    db.add(BonusEntry(operation_id=operation_id, user_id=user_id, order_id=order_id,
                      kind=kind, amount=amount, available_delta=a.available-before[0],
                      reserved_delta=a.reserved-before[1], debt_delta=a.debt-before[2]))
    db.flush()


def qualify(db, order, clock=None):
    """Call in same transaction as completed verified DOCX, never at payment alone."""
    if order.method != 'cash' or order.state not in ('completed','partially_refunded') or order.refunded == order.amount:
        return
    attr = db.scalar(select(Attribution).where(Attribution.invited == order.user_id).with_for_update())
    if not attr:
        return
    r = db.get(Reward, order.user_id)
    if r and r.amount > 0:
        return
    amount = min(attr.standard_price // 5, (order.amount-order.refunded)//5)
    if not r:
        r = Reward(invited=order.user_id, inviter=attr.inviter, order_id=order.id,
                   amount=amount, matures=(now() if clock is None else clock)+14*86400)
        db.add(r)
    else:
        r.order_id, r.amount, r.state = order.id, amount, 'pending'
        r.matures = (now() if clock is None else clock)+14*86400
    # Pending rewards also have immutable audit entries, without changing balances.
    op = 'pending:'+order.id
    if not db.get(BonusEntry, op):
        db.add(BonusEntry(operation_id=op, user_id=attr.inviter, order_id=order.id,
                          kind='pending', amount=amount, available_delta=0, reserved_delta=0, debt_delta=0))


def mature(db, clock=None, inviter=None):
    ts = now() if clock is None else clock
    query = select(Reward).where(Reward.state == 'pending', Reward.matures <= ts)
    if inviter is not None:
        query = query.where(Reward.inviter == inviter)
    rewards = db.scalars(query.order_by(Reward.inviter, Reward.invited).with_for_update(skip_locked=True)).all()
    for r in rewards:
        change(db, r.inviter, 'mature:'+r.order_id, 'mature', r.amount, r.order_id)
        r.state = 'available'


def reverse_reward(db, order, refund_id):
    reverse_cashback(db,order,refund_id)
    attr = db.scalar(select(Attribution).where(Attribution.invited == order.user_id).with_for_update())
    if not attr:
        return
    r = db.get(Reward, order.user_id)
    if not r or r.order_id != order.id:
        return
    target = min(attr.standard_price//5, (order.amount-order.refunded)//5)
    reduction = r.amount - target
    if reduction <= 0:
        return
    if r.state == 'available':
        change(db, r.inviter, 'reversal:'+refund_id, 'reversal', reduction, order.id)
    else:
        db.add(BonusEntry(operation_id='pending-reversal:'+refund_id, user_id=r.inviter,
                          order_id=order.id, kind='pending_reversal', amount=reduction,
                          available_delta=0, reserved_delta=0, debt_delta=0))
    r.amount = target
    if not target:
        r.state = 'cancelled'


def cashback(db, order):
    from .config import cfg
    if order.method != 'cash' or order.state not in ('completed','partially_refunded'):
        return
    amount = (order.amount-order.refunded)*cfg.CASHBACK_BPS//10000
    change(db,order.user_id,'cashback:'+cfg.CASHBACK_VERSION+':'+order.id,'cashback',amount,order.id)


def reverse_cashback(db,order,refund_id):
    from .config import cfg
    grant = db.get(BonusEntry,'cashback:'+cfg.CASHBACK_VERSION+':'+order.id)
    if not grant: return
    from sqlalchemy import func
    reversed_amount = db.scalar(select(func.coalesce(func.sum(BonusEntry.amount),0)).where(
        BonusEntry.order_id==order.id,BonusEntry.operation_id.like('cashback-reversal:%')))
    target = (order.amount-order.refunded)*cfg.CASHBACK_BPS//10000
    reduction = grant.amount-target-reversed_amount
    if reduction > 0:
        change(db,order.user_id,'cashback-reversal:'+refund_id,'reversal',reduction,order.id)
