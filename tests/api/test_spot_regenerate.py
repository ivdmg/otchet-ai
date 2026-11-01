import uuid
import json
import pytest
from unittest.mock import AsyncMock, patch

from app.models.document import Document
from app.models.user import User
from app.models.enums import DocType, DocStatus
from app.services.spot_regeneration_service import SpotRegenerationService


def test_spot_regen_find_neighbors():
    """Test spot regeneration node and neighbor context extraction."""
    ast_dict = {
        "chapters": [
            {
                "title": "Глава 1",
                "sections": [
                    {
                        "title": "1.1 Раздел",
                        "nodes": [
                            {"id": "node_1", "type": "paragraph", "text": "Первый абзац"},
                            {"id": "node_2", "type": "paragraph", "text": "Второй абзац для перегенерации"},
                            {"id": "node_3", "type": "paragraph", "text": "Третий абзац"},
                        ]
                    }
                ]
            }
        ]
    }

    found = SpotRegenerationService.find_node_and_neighbors(ast_dict, "node_2")
    assert found is not None
    target, prev_n, next_n, container, idx = found

    assert target["id"] == "node_2"
    assert prev_n["id"] == "node_1"
    assert next_n["id"] == "node_3"
    assert idx == 1


@pytest.mark.asyncio
async def test_spot_regenerate_endpoint_success(client, db_session):
    """Test spot regeneration endpoint with authentication and credit deduction."""
    # 1. Register & Login User
    await client.post(
        "/api/v1/auth/register",
        json={"email": "spotuser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "spotuser@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch created user to create a Document owned by user
    user_res = await client.get("/api/v1/auth/me", headers=headers)
    user_id = user_res.json()["id"]

    sample_ast = {
        "title": "Тестовая курсовая",
        "doc_type": "coursework",
        "chapters": [
            {
                "title": "Глава 1",
                "sections": [
                    {
                        "title": "1.1 Раздел",
                        "nodes": [
                            {"id": "node_100", "type": "paragraph", "text": "Старый текст"}
                        ]
                    }
                ]
            }
        ]
    }

    doc = Document(
        user_id=uuid.UUID(user_id),
        title="Тестовая курсовая",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.COMPLETED,
        ast_graph_json=sample_ast,
    )
    db_session.add(doc)
    await db_session.commit()

    # Mock LLM response for spot regen
    mock_llm_resp = json.dumps({
        "id": "node_100",
        "type": "paragraph",
        "text": "Перегенерированный академический текст"
    })

    with patch("app.services.spot_regeneration_service.LLMClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_llm_resp

        res = await client.post(
            f"/api/v1/documents/{doc.id}/spot-regenerate",
            json={
                "document_id": str(doc.id),
                "node_id": "node_100",
                "user_instruction": "Сделать текст более научным",
            },
            headers=headers,
        )

        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["node_id"] == "node_100"
        assert data["regenerated_node"]["text"] == "Перегенерированный академический текст"

        # Verify balance deducted (Initial 10 credits - 1 = 9 credits)
        me_res = await client.get("/api/v1/auth/me", headers=headers)
        assert me_res.json()["balance_credits"] == 9


@pytest.mark.asyncio
async def test_spot_regenerate_insufficient_credits(client, db_session):
    """Test 402 error when balance is zero."""
    await client.post(
        "/api/v1/auth/register",
        json={"email": "pooruser@example.com", "password": "password123"},
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "pooruser@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    user_id = (await client.get("/api/v1/auth/me", headers=headers)).json()["id"]

    # Set user balance to 0 in DB
    user_db = await db_session.get(User, uuid.UUID(user_id))
    user_db.balance_credits = 0
    await db_session.commit()

    doc = Document(
        user_id=uuid.UUID(user_id),
        title="Без баланса",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.COMPLETED,
        ast_graph_json={"chapters": [{"sections": [{"nodes": [{"id": "n1", "type": "paragraph"}]}]}]},
    )
    db_session.add(doc)
    await db_session.commit()

    res = await client.post(
        f"/api/v1/documents/{doc.id}/spot-regenerate",
        json={"document_id": str(doc.id), "node_id": "n1"},
        headers=headers,
    )
    assert res.status_code == 402
    assert "Недостаточно кредитов" in res.json()["detail"]
