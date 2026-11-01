from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.enums import TransactionType, TransactionStatus
from app.schemas.api import PaymentCreate, PaymentSessionRead, TransactionRead
from app.services.payment_service import payment_service
from app.services.billing_service import billing_service

router = APIRouter()


@router.post(
    "/create",
    response_model=PaymentSessionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Создание сессии оплаты пополнения баланса",
)
async def create_payment(
    payment_in: PaymentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Создает транзакцию пополнения баланса со статусом PENDING и возвращает URL сессии оплаты.
    """
    expected_rub = payment_service.calculate_rub(payment_in.amount_credits)
    if abs(payment_in.amount_rub - expected_rub) > 0.01:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Некорректная сумма в рублях. За {payment_in.amount_credits} кредитов требуется {expected_rub} руб.",
        )

    session_data = payment_service.create_payment_session(
        user_id=current_user.id,
        amount_rub=payment_in.amount_rub,
        amount_credits=payment_in.amount_credits,
        return_url=payment_in.return_url,
    )

    transaction = Transaction(
        user_id=current_user.id,
        amount_credits=payment_in.amount_credits,
        amount_rub=payment_in.amount_rub,
        type=TransactionType.TOPUP,
        payment_provider_id=session_data["payment_id"],
        status=TransactionStatus.PENDING,
    )
    db.add(transaction)
    await db.commit()

    return PaymentSessionRead(
        payment_id=session_data["payment_id"],
        confirmation_url=session_data["confirmation_url"],
        status=session_data["status"],
    )


@router.post(
    "/webhook",
    summary="Обработка подписанных уведомлений эквайринга (Webhook)",
)
async def payment_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_signature: Optional[str] = Header(None, alias="X-Signature"),
):
    """
    Принимает и проверяет подпись вебхука от платежного провайдера.
    При успехе зачисляет кредиты пользователю.
    """
    body_bytes = await request.body()
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Некорректный JSON в теле запроса вебхука",
        )

    # Валидация HMAC подписи если заголовок передан
    if x_signature:
        is_valid = payment_service.verify_webhook_signature(
            payload_bytes=body_bytes,
            signature=x_signature,
        )
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Недействительная подпись вебхука",
            )

    payment_id, status_str, _, _ = payment_service.parse_webhook_payload(payload)

    if not payment_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Идентификатор платежа не указан в вебхуке",
        )

    if status_str == "succeeded":
        await billing_service.topup_credits_by_payment(
            db=db, payment_provider_id=payment_id
        )
    elif status_str == "canceled":
        await billing_service.cancel_payment_transaction(
            db=db, payment_provider_id=payment_id
        )

    return {"status": "ok", "payment_id": payment_id}


@router.get(
    "/history",
    response_model=List[TransactionRead],
    summary="Получение истории транзакций текущего пользователя",
)
async def get_transaction_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Возвращает историю списываний и пополнений текущего пользователя."""
    return await billing_service.get_user_transactions(db, current_user.id)
