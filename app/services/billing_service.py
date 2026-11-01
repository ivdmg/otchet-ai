import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.transaction import Transaction
from app.models.enums import TransactionType, TransactionStatus


class BillingService:
    """
    Сервисный слой управления балансом пользователя и проведения транзакций.
    Использует блокировку `SELECT FOR UPDATE` для исключения race conditions.
    """

    async def topup_credits_by_payment(
        self,
        db: AsyncSession,
        payment_provider_id: str,
    ) -> Transaction:
        """
        Атомарное пополнение баланса пользователя по завершенному платежу.
        Идемпотентная операция: при повторном вызове на зачисленный платеж повторного начисления не происходит.
        """
        result = await db.execute(
            select(Transaction)
            .where(Transaction.payment_provider_id == payment_provider_id)
            .with_for_update()
        )
        tx = result.scalar_one_or_none()

        if not tx:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Транзакция с ID {payment_provider_id} не найдена",
            )

        if tx.status == TransactionStatus.SUCCEEDED:
            # Идемпотентность — баланс уже пополнен
            return tx

        user_result = await db.execute(
            select(User).where(User.id == tx.user_id).with_for_update()
        )
        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь для транзакции не найден",
            )

        # Пополнение баланса и обновление статуса
        user.balance_credits += tx.amount_credits
        tx.status = TransactionStatus.SUCCEEDED

        await db.commit()
        await db.refresh(tx)
        await db.refresh(user)
        return tx

    async def spend_credits(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        amount_credits: int,
        transaction_type: TransactionType = TransactionType.SPEND_GENERATION,
    ) -> Transaction:
        """
        Атомарное списание кредитов с баланса пользователя с транзакционной блокировкой `SELECT FOR UPDATE`.
        """
        if amount_credits <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Количество списываемых кредитов должно быть больше нуля",
            )

        user_result = await db.execute(
            select(User).where(User.id == user_id).with_for_update()
        )
        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не найден",
            )

        if user.balance_credits < amount_credits:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Недостаточно кредитов. Требуется: {amount_credits}, доступно: {user.balance_credits}",
            )

        user.balance_credits -= amount_credits

        tx = Transaction(
            user_id=user_id,
            amount_credits=amount_credits,
            amount_rub=0.0,
            type=transaction_type,
            status=TransactionStatus.SUCCEEDED,
        )
        db.add(tx)
        await db.commit()
        await db.refresh(tx)
        await db.refresh(user)
        return tx

    async def cancel_payment_transaction(
        self,
        db: AsyncSession,
        payment_provider_id: str,
    ) -> Transaction:
        """Отмена транзакции платежа."""
        result = await db.execute(
            select(Transaction)
            .where(Transaction.payment_provider_id == payment_provider_id)
            .with_for_update()
        )
        tx = result.scalar_one_or_none()
        if not tx:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Транзакция с ID {payment_provider_id} не найдена",
            )

        if tx.status != TransactionStatus.SUCCEEDED:
            tx.status = TransactionStatus.CANCELED
            await db.commit()
            await db.refresh(tx)

        return tx

    async def get_user_transactions(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[Transaction]:
        """Получение списка транзакций пользователя."""
        result = await db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
        )
        return list(result.scalars().all())


billing_service = BillingService()
