"""Customer-safe failure states. No provider payloads or credentials cross the UI."""
from sqlalchemy import select
from .models import Order, Job, Document, now, uid
from . import bonus, payments

PAUSABLE = {'ai_access_denied','ai_auth','ai_credits_required','ai_rate_limit','ai_daily_limit',
            'ai_timeout','ai_unavailable','ai_invalid_response','ai_section_too_long',
            'ai_section_empty','invalid_document_content','worker_internal_error'}
MESSAGES = {
    'ai_access_denied':'AI-сервис отклонил доступ. Это не означает, что ваш план или тема потеряны. Можно повторить позже или отменить заказ.',
    'ai_auth':'AI-сервис не принял ключ доступа. Настройки и уже подготовленные разделы сохранены.',
    'ai_credits_required':'AI-сервис сообщил о недостаточном балансе. Заказ сохранён, продолжение не требует повторной оплаты.',
    'ai_rate_limit':'AI-сервис временно ограничил частоту запросов. Уже подготовленные разделы сохранены.',
    'ai_daily_limit':'Дневная квота AI-сервиса исчерпана. Можно вернуться позже или отменить заказ.',
    'local_token_rate_limit':'Приложение ожидает освобождения лимита запросов. Продолжим автоматически.',
    'ai_timeout':'AI-сервис не ответил вовремя. Уже подготовленные разделы сохранены.',
    'ai_unavailable':'AI-сервис временно недоступен. Уже подготовленные разделы сохранены.',
    'ai_invalid_response':'AI-сервис вернул неполный ответ. План и успешно подготовленные разделы сохранены.',
    'ai_section_too_long':'Не удалось подобрать объём одного раздела. Успешные разделы сохранены.',
    'invalid_document_content':'Один из разделов не прошёл проверку. Можно повторить его подготовку.',
    'page_count_mismatch':'Количество страниц PDF не совпало с заказом. Работа не выдана как готовая.',
    'job_token_budget_exhausted':'Достигнут безопасный бюджет генерации. Заказ остановлен; оформляется возврат или освобождение кредитов.',
    'cancelled_by_user':'Генерация отменена. Сохранённый план можно использовать для нового заказа.',
    'pause_expired':'Время сохранения приостановленного заказа истекло. Заказ отменён.',
}


def view(job, doc, order=None):
    clock = now()
    stalled = job.state in ('queued','running','retry') and job.lease_until <= clock and clock-(job.heartbeat or job.created)>180 and job.retry_at<=clock
    stopped = job.state in ('failed','paused','cancelled')
    can_retry = (job.manual_retries < 2 and (job.state in ('failed','paused') or stalled)
                 and doc.state not in ('archived','completed','expired','cancelled')
                 and (not doc.expires or doc.expires>clock))
    if job.kind=='document':
        can_retry = can_retry and (job.state=='paused' or stalled) and bool(order and not order.refunded and order.state in ('paused','queued','running'))
        if can_retry:
            from .documents import job_pipeline
            pending = next((s[0] for s in job_pipeline(job,doc) if s[0] not in job.steps),None)
            can_retry = pending in ('validation','docx','pdf') or job.budget-job.charged>=3500
    message=MESSAGES.get(job.error,'Подготовка остановлена. Ваши настройки сохранены; выберите дальнейшее действие.') if stopped or job.error else (
        'Нет обновлений от сервиса обработки. Заказ сохранён. Можно проверить статус или отменить его.' if stalled else '')
    if job.kind=='plan' and stopped:
        reason={'ai_access_denied':'AI-сервис отклонил запрос плана.', 'ai_daily_limit':'Дневная квота AI-сервиса исчерпана.',
                'ai_timeout':'AI-сервис не ответил вовремя.'}.get(job.error,'Не удалось получить план от AI-сервиса.')
        message=reason+' Параметры сохранены. Повторите попытку или вернитесь к задаче.'
    return {'kind':job.kind,'stopped':stopped,'stalled':stalled,'automatic':job.state=='retry',
            'can_retry':bool(can_retry),'retry_available_at':job.retry_at if job.state=='paused' else 0,
            'retries_left':max(0,2-job.manual_retries),
            'can_cancel':job.state in ('queued','running','retry','paused'),
            'can_restart':bool(doc.state in ('failed','cancelled') and (doc.plan or doc.approved_plan) and (not doc.expires or doc.expires>clock)),
            'message':message}


def settle_failure(db, job, doc, code):
    job.state = 'cancelled' if code in ('cancelled_by_user','pause_expired') else 'failed'
    job.error,job.heartbeat,job.lease_until,job.retry_at,job.attempt_token = code,now(),0,0,None
    doc.state = 'cancelled' if job.state=='cancelled' else 'failed'
    doc.expires,doc.delivery_id = now()+86400,doc.delivery_id or uid()
    if not job.order_id: return
    order = db.scalar(select(Order).where(Order.id==job.order_id).with_for_update())
    if order.method=='bonus':
        bonus.change(db,order.user_id,'release:'+order.id,'release',order.amount,order.id)
        order.state='bonus_released'
    elif order.amount>order.refunded:
        payments.request_refund(db,order,order.amount-order.refunded,'technical:'+order.id)


def expire_pauses(db):
    jobs=db.scalars(select(Job).where(Job.state=='paused',Job.heartbeat<=now()-86400).with_for_update(skip_locked=True)).all()
    for job in jobs:
        doc=db.scalar(select(Document).where(Document.id==job.document_id).with_for_update())
        settle_failure(db,job,doc,'pause_expired')
