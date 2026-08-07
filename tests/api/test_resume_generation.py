import uuid
import pytest
from app.models.document import Document
from app.models.user import User
from app.models.enums import DocType, DocStatus
from app.core.celery_app import celery_app


@pytest.mark.asyncio
async def test_resume_generation_success(client, db_session):
    """Test resuming generation from a valid checkpoint."""
    # 1. Register & Login User
    await client.post(
        "/api/v1/auth/register",
        json={"email": "resumeuser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "resumeuser@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]

    # 2. Create document in FAILED state with checkpoint
    doc = Document(
        user_id=uuid.UUID(user_id),
        title="Упавший документ",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.FAILED,
        ast_graph_json={"title": "Упавший документ", "introduction": {"goal": "Цель"}},
    )
    db_session.add(doc)
    await db_session.commit()

    celery_app.conf.task_always_eager = True
    try:
        res = await client.post(
            f"/api/v1/documents/{doc.id}/resume",
            headers=headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "resuming"
        assert "celery_task_id" in data

        # Check DB status changed to GENERATING
        await db_session.refresh(doc)
        assert doc.status in [DocStatus.GENERATING, DocStatus.COMPLETED]
    finally:
        celery_app.conf.task_always_eager = False


@pytest.mark.asyncio
async def test_resume_generation_already_completed(client, db_session):
    """Test 400 error when trying to resume an already completed document."""
    await client.post(
        "/api/v1/auth/register",
        json={"email": "completeduser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "completeduser@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]

    doc = Document(
        user_id=uuid.UUID(user_id),
        title="Завершенный документ",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.COMPLETED,
        ast_graph_json={"title": "Завершенный документ"},
    )
    db_session.add(doc)
    await db_session.commit()

    res = await client.post(
        f"/api/v1/documents/{doc.id}/resume",
        headers=headers,
    )
    assert res.status_code == 400
    assert "уже успешно завершена" in res.json()["detail"]


@pytest.mark.asyncio
async def test_resume_generation_no_checkpoint(client, db_session):
    """Test 400 error when trying to resume a document with no AST graph or checkpoint."""
    await client.post(
        "/api/v1/auth/register",
        json={"email": "nockptuser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nockptuser@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]

    doc = Document(
        user_id=uuid.UUID(user_id),
        title="Документ без чекпоинта",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.DRAFT,
        ast_graph_json={},
    )
    db_session.add(doc)
    await db_session.commit()

    res = await client.post(
        f"/api/v1/documents/{doc.id}/resume",
        headers=headers,
    )
    assert res.status_code == 400
    assert "Нет сохраненных чекпоинтов" in res.json()["detail"]
