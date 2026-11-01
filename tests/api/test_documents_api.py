import uuid
import json
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.models.document import Document
from app.models.user import User
from app.models.enums import DocType, DocStatus
from app.core.celery_app import celery_app


@pytest.mark.asyncio
async def test_create_document_success(client, db_session):
    """Test POST /api/v1/documents/ creating document and deducting 5 credits."""
    # Register & Login
    await client.post(
        "/api/v1/auth/register",
        json={"email": "doccreate@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "doccreate@example.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    celery_app.conf.task_always_eager = True
    try:
        res = await client.post(
            "/api/v1/documents/",
            json={"title": "Информационные системы в экономике", "doc_type": "coursework"},
            headers=headers,
        )
        assert res.status_code == 201
        data = res.json()
        assert data["status"] == "started"
        assert data["document"]["title"] == "Информационные системы в экономике"

        # Verify credit balance deducted (10 - 5 = 5)
        me_res = await client.get("/api/v1/auth/me", headers=headers)
        assert me_res.json()["balance_credits"] == 5
    finally:
        celery_app.conf.task_always_eager = False


@pytest.mark.asyncio
async def test_create_document_insufficient_credits(client, db_session):
    """Test 402 error when creating document without enough credits."""
    await client.post(
        "/api/v1/auth/register",
        json={"email": "nocreds@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nocreds@example.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}
    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]

    # Set user balance to 2 credits (less than required 5)
    user = await db_session.get(User, uuid.UUID(user_id))
    user.balance_credits = 2
    await db_session.commit()

    res = await client.post(
        "/api/v1/documents/",
        json={"title": "Тема без баланса", "doc_type": "coursework"},
        headers=headers,
    )
    assert res.status_code == 402
    assert "Недостаточно кредитов" in res.json()["detail"]


@pytest.mark.asyncio
async def test_list_and_get_documents(client, db_session):
    """Test listing user documents and getting document by ID."""
    await client.post(
        "/api/v1/auth/register",
        json={"email": "listuser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "listuser@example.com", "password": "password123"},
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}
    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]

    # Add 2 documents
    d1 = Document(
        user_id=uuid.UUID(user_id),
        title="Документ 1",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.DRAFT,
        ast_graph_json={},
    )
    d2 = Document(
        user_id=uuid.UUID(user_id),
        title="Документ 2",
        doc_type=DocType.VKR,
        status=DocStatus.COMPLETED,
        ast_graph_json={},
    )
    db_session.add_all([d1, d2])
    await db_session.commit()

    # List documents
    list_res = await client.get("/api/v1/documents/", headers=headers)
    assert list_res.status_code == 200
    docs_list = list_res.json()
    assert len(docs_list) == 2

    # Get single document
    get_res = await client.get(f"/api/v1/documents/{d1.id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Документ 1"


@pytest.mark.asyncio
async def test_document_api_unauthorized_and_forbidden(client, db_session):
    """Test 401 Unauthorized and 403 Forbidden access checks."""
    # 401 without auth header
    res_no_auth = await client.get("/api/v1/documents/")
    assert res_no_auth.status_code == 401

    # Register 2 users
    await client.post(
        "/api/v1/auth/register",
        json={"email": "userA@example.com", "password": "password123"},
    )
    loginA = await client.post(
        "/api/v1/auth/login",
        json={"email": "userA@example.com", "password": "password123"},
    )
    tokenA = loginA.json()["access_token"]
    userA_id = (await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tokenA}"})).json()["id"]

    await client.post(
        "/api/v1/auth/register",
        json={"email": "userB@example.com", "password": "password123"},
    )
    loginB = await client.post(
        "/api/v1/auth/login",
        json={"email": "userB@example.com", "password": "password123"},
    )
    tokenB = loginB.json()["access_token"]

    # User A document
    docA = Document(
        user_id=uuid.UUID(userA_id),
        title="Документ Пользователя А",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.COMPLETED,
        ast_graph_json={},
    )
    db_session.add(docA)
    await db_session.commit()

    # User B tries to access User A's document -> 403 Forbidden
    res_forb = await client.get(
        f"/api/v1/documents/{docA.id}",
        headers={"Authorization": f"Bearer {tokenB}"},
    )
    assert res_forb.status_code == 403
