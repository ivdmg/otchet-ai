import hashlib
import hmac
import pytest
from app.services.payment_service import payment_service, PaymentService


@pytest.mark.asyncio
async def test_payment_service_calculations():
    assert PaymentService.calculate_credits(100.0) == 10
    assert PaymentService.calculate_credits(150.0) == 15
    assert PaymentService.calculate_rub(10) == 100.0
    assert PaymentService.calculate_rub(5) == 50.0


@pytest.mark.asyncio
async def test_payment_service_signature_verification():
    payload_bytes = b'{"payment_id": "pay_123", "status": "succeeded"}'
    secret = "secret_payment_webhook_key_2026"
    expected_sig = hmac.new(
        secret.encode("utf-8"), payload_bytes, hashlib.sha256
    ).hexdigest()

    assert (
        payment_service.verify_webhook_signature(
            payload_bytes=payload_bytes, signature=expected_sig
        )
        is True
    )
    assert (
        payment_service.verify_webhook_signature(
            payload_bytes=payload_bytes, signature="invalid_signature"
        )
        is False
    )


@pytest.mark.asyncio
async def test_create_payment_endpoint(client):
    # Register & Login
    await client.post(
        "/api/v1/auth/register",
        json={"email": "payuser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "payuser@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create payment session
    create_res = await client.post(
        "/api/v1/payments/create",
        json={"amount_credits": 20, "amount_rub": 200.0},
        headers=headers,
    )
    assert create_res.status_code == 201
    data = create_res.json()
    assert "payment_id" in data
    assert "confirmation_url" in data
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_payment_webhook_succeeded(client):
    # Register & Login
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={"email": "webhookuser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "webhookuser@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create payment session (buy 30 credits for 300 RUB)
    create_res = await client.post(
        "/api/v1/payments/create",
        json={"amount_credits": 30, "amount_rub": 300.0},
        headers=headers,
    )
    payment_id = create_res.json()["payment_id"]

    # Webhook payload & signature
    payload = {
        "payment_id": payment_id,
        "status": "succeeded",
        "amount_rub": 300.0,
        "amount_credits": 30,
    }
    import json
    payload_bytes = json.dumps(payload).encode("utf-8")
    secret = "secret_payment_webhook_key_2026"
    sig = hmac.new(
        secret.encode("utf-8"), payload_bytes, hashlib.sha256
    ).hexdigest()

    # Call webhook
    wh_res = await client.post(
        "/api/v1/payments/webhook",
        content=payload_bytes,
        headers={"X-Signature": sig, "Content-Type": "application/json"},
    )
    assert wh_res.status_code == 200
    assert wh_res.json()["status"] == "ok"

    # Verify user balance updated (10 initial + 30 topup = 40)
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.json()["balance_credits"] == 40


@pytest.mark.asyncio
async def test_payment_webhook_invalid_signature(client):
    payload_bytes = b'{"payment_id": "pay_xyz", "status": "succeeded"}'
    wh_res = await client.post(
        "/api/v1/payments/webhook",
        content=payload_bytes,
        headers={"X-Signature": "invalid_sig", "Content-Type": "application/json"},
    )
    assert wh_res.status_code == 401


@pytest.mark.asyncio
async def test_transaction_history(client):
    # Register & Login
    await client.post(
        "/api/v1/auth/register",
        json={"email": "histuser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "histuser@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create payment session
    await client.post(
        "/api/v1/payments/create",
        json={"amount_credits": 10, "amount_rub": 100.0},
        headers=headers,
    )

    history_res = await client.get("/api/v1/payments/history", headers=headers)
    assert history_res.status_code == 200
    txs = history_res.json()
    assert len(txs) == 1
    assert txs[0]["amount_credits"] == 10
    assert txs[0]["type"] == "topup"
