import uuid
import pytest
from app.models.document import Document
from app.models.enums import DocType, DocStatus


@pytest.mark.asyncio
async def test_download_document_success(client, db_session):
    """Test downloading compiled DOCX file for an authorized user."""
    # 1. Register & Login User
    await client.post(
        "/api/v1/auth/register",
        json={"email": "downloaduser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "downloaduser@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]

    # 2. Create document with AST graph
    sample_ast = {
        "title": "Курсовая работа по экономике",
        "doc_type": "coursework",
        "chapters": [
            {
                "title": "Глава 1. Теория",
                "sections": [
                    {
                        "title": "1.1 Основы",
                        "nodes": [
                            {"id": "n1", "type": "paragraph", "text": "Текст первой главы"}
                        ]
                    }
                ]
            }
        ]
    }

    doc = Document(
        user_id=uuid.UUID(user_id),
        title="Курсовая работа по экономике",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.COMPLETED,
        ast_graph_json=sample_ast,
    )
    db_session.add(doc)
    await db_session.commit()

    # 3. Request download
    res = await client.get(
        f"/api/v1/documents/{doc.id}/download",
        headers=headers,
    )
    assert res.status_code == 200
    assert "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in res.headers.get("content-type", "")
    assert "attachment;" in res.headers.get("content-disposition", "")
    # Check DOCX binary zip magic bytes (PK\x03\x04)
    assert res.content.startswith(b"PK\x03\x04")


@pytest.mark.asyncio
async def test_download_document_forbidden(client, db_session):
    """Test 403 error when trying to download another user's document."""
    # User 1 (Owner)
    await client.post(
        "/api/v1/auth/register",
        json={"email": "owner@example.com", "password": "password123"},
    )
    login1 = await client.post(
        "/api/v1/auth/login",
        json={"email": "owner@example.com", "password": "password123"},
    )
    user1_id = (await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {login1.json()['access_token']}"})).json()["id"]

    # User 2 (Attacker)
    await client.post(
        "/api/v1/auth/register",
        json={"email": "attacker@example.com", "password": "password123"},
    )
    login2 = await client.post(
        "/api/v1/auth/login",
        json={"email": "attacker@example.com", "password": "password123"},
    )
    user2_token = login2.json()["access_token"]

    doc = Document(
        user_id=uuid.UUID(user1_id),
        title="Чужой документ",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.COMPLETED,
        ast_graph_json={"title": "Чужой документ"},
    )
    db_session.add(doc)
    await db_session.commit()

    res = await client.get(
        f"/api/v1/documents/{doc.id}/download",
        headers={"Authorization": f"Bearer {user2_token}"},
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_download_empty_ast(client, db_session):
    """Test 400 error when document has no AST graph."""
    await client.post(
        "/api/v1/auth/register",
        json={"email": "emptyuser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "emptyuser@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]

    doc = Document(
        user_id=uuid.UUID(user_id),
        title="Пустой документ",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.DRAFT,
        ast_graph_json={},
    )
    db_session.add(doc)
    await db_session.commit()

    res = await client.get(
        f"/api/v1/documents/{doc.id}/download",
        headers=headers,
    )
    assert res.status_code == 400
