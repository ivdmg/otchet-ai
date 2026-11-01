import uuid
import pytest
from fastapi import HTTPException
from app.models.user import User
from app.models.transaction import Transaction
from app.models.enums import TransactionType, TransactionStatus, UserRole
from app.services.billing_service import billing_service
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_spend_credits_success(db_session):
    user = User(
        email="spend_test@example.com",
        password_hash=get_password_hash("pass"),
        balance_credits=20,
        role=UserRole.USER,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    tx = await billing_service.spend_credits(
        db=db_session,
        user_id=user.id,
        amount_credits=5,
        transaction_type=TransactionType.SPEND_GENERATION,
    )

    assert tx.amount_credits == 5
    assert tx.status == TransactionStatus.SUCCEEDED
    assert tx.type == TransactionType.SPEND_GENERATION

    await db_session.refresh(user)
    assert user.balance_credits == 15


@pytest.mark.asyncio
async def test_spend_credits_insufficient_balance(db_session):
    user = User(
        email="insufficient_test@example.com",
        password_hash=get_password_hash("pass"),
        balance_credits=3,
        role=UserRole.USER,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    with pytest.raises(HTTPException) as exc_info:
        await billing_service.spend_credits(
            db=db_session,
            user_id=user.id,
            amount_credits=10,
            transaction_type=TransactionType.SPEND_GENERATION,
        )

    assert exc_info.value.status_code == 402
    assert "Недостаточно кредитов" in exc_info.value.detail

    await db_session.refresh(user)
    assert user.balance_credits == 3  # Balance untouched


@pytest.mark.asyncio
async def test_topup_credits_idempotency(db_session):
    user = User(
        email="idempotent_test@example.com",
        password_hash=get_password_hash("pass"),
        balance_credits=10,
        role=UserRole.USER,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    tx = Transaction(
        user_id=user.id,
        amount_credits=15,
        amount_rub=150.0,
        type=TransactionType.TOPUP,
        payment_provider_id="pay_idempotent_001",
        status=TransactionStatus.PENDING,
    )
    db_session.add(tx)
    await db_session.commit()

    # First topup call
    res_tx1 = await billing_service.topup_credits_by_payment(
        db=db_session, payment_provider_id="pay_idempotent_001"
    )
    assert res_tx1.status == TransactionStatus.SUCCEEDED

    await db_session.refresh(user)
    assert user.balance_credits == 25  # 10 + 15

    # Second topup call (Idempotency check)
    res_tx2 = await billing_service.topup_credits_by_payment(
        db=db_session, payment_provider_id="pay_idempotent_001"
    )
    assert res_tx2.status == TransactionStatus.SUCCEEDED

    await db_session.refresh(user)
    assert user.balance_credits == 25  # Still 25, no double topup!


@pytest.mark.asyncio
async def test_get_user_transactions(db_session):
    user = User(
        email="tx_history@example.com",
        password_hash=get_password_hash("pass"),
        balance_credits=50,
        role=UserRole.USER,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    await billing_service.spend_credits(
        db=db_session,
        user_id=user.id,
        amount_credits=5,
        transaction_type=TransactionType.SPEND_GENERATION,
    )
    await billing_service.spend_credits(
        db=db_session,
        user_id=user.id,
        amount_credits=2,
        transaction_type=TransactionType.SPEND_SPOT_REGEN,
    )

    txs = await billing_service.get_user_transactions(db_session, user.id)
    assert len(txs) == 2
    assert txs[0].amount_credits == 2
    assert txs[1].amount_credits == 5
