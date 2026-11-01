import uuid
import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.services.checkpoint_service import CheckpointService

client = TestClient(app)


def test_websocket_initial_checkpoint_stream():
    """Test connecting to WebSocket and receiving initial checkpoint state if available."""
    doc_id = str(uuid.uuid4())
    mock_ast = {"title": "Test WS Document", "doc_type": "coursework"}

    with patch.object(CheckpointService, "get_checkpoint_async", new_callable=AsyncMock) as mock_get_ckpt:
        mock_get_ckpt.return_value = mock_ast

        with client.websocket_connect(f"/api/v1/ws/generation/{doc_id}") as websocket:
            data = websocket.receive_json()
            assert data["doc_id"] == doc_id
            assert data["step"] == "INITIAL_STATE"
            assert data["ast_graph"]["title"] == "Test WS Document"


@pytest.mark.asyncio
async def test_sse_generation_progress(client):
    """Test SSE streaming endpoint."""
    doc_id = str(uuid.uuid4())
    mock_ast = {"title": "Test SSE Document"}

    with patch.object(CheckpointService, "get_checkpoint_async", new_callable=AsyncMock) as mock_get_ckpt:
        mock_get_ckpt.return_value = mock_ast

        response = await client.get(f"/api/v1/documents/{doc_id}/events")
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")
        content = response.text
        assert "INITIAL_STATE" in content
        assert "Test SSE Document" in content
