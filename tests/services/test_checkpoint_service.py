import uuid
import pytest
import pytest_asyncio
from unittest.mock import MagicMock, AsyncMock

from app.services.checkpoint_service import CheckpointService
from app.models.document import Document
from app.models.user import User
from app.models.enums import DocType, DocStatus
from app.schemas.ast import DocumentASTGraph, IntroductionAST, ChapterAST


class MockRedisSync:
    def __init__(self):
        self.store = {}

    def set(self, key, value, ex=None):
        self.store[key] = value
        return True

    def get(self, key):
        return self.store.get(key)

    def delete(self, key):
        if key in self.store:
            del self.store[key]
            return 1
        return 0


class MockRedisAsync:
    def __init__(self):
        self.store = {}

    async def set(self, key, value, ex=None):
        self.store[key] = value
        return True

    async def get(self, key):
        return self.store.get(key)

    async def delete(self, key):
        if key in self.store:
            del self.store[key]
            return 1
        return 0


@pytest.mark.asyncio
async def test_checkpoint_save_and_get_redis(db_session):
    """Test saving checkpoint to Redis and retrieving it."""
    doc_id = uuid.uuid4()
    redis_mock = MockRedisAsync()
    ast_graph = DocumentASTGraph(
        doc_type="coursework",
        title="Тестовая работа по ИИ",
        introduction=IntroductionAST(
            relevance_paragraphs=["Paragraph 1"],
            object="Object",
            subject="Subject",
            goal="Goal",
            tasks=["Task 1"],
            methods=["Method 1"],
        ),
    )

    # Save to Redis async
    saved = await CheckpointService.save_checkpoint_async(
        doc_id=doc_id,
        ast_data=ast_graph,
        redis_client=redis_mock,
        step="INTRO",
    )
    assert saved["title"] == "Тестовая работа по ИИ"
    assert saved["introduction"]["goal"] == "Goal"

    # Get from Redis async
    retrieved = await CheckpointService.get_checkpoint_async(
        doc_id=doc_id,
        redis_client=redis_mock,
    )
    assert retrieved is not None
    assert retrieved["title"] == "Тестовая работа по ИИ"
    assert retrieved["introduction"]["goal"] == "Goal"


@pytest.mark.asyncio
async def test_checkpoint_db_saving_and_fallback(db_session):
    """Test DB update and Redis fallback to DB when Redis key is absent."""
    # Create test user and document in DB
    user = User(
        email="test_checkpoint@example.com",
        password_hash="hash",
    )
    db_session.add(user)
    await db_session.flush()

    doc = Document(
        user_id=user.id,
        title="Документ для чекпоинта",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.GENERATING,
        ast_graph_json={},
    )
    db_session.add(doc)
    await db_session.commit()

    empty_redis = MockRedisAsync()
    sample_ast = {"title": "Документ для чекпоинта", "chapters": [{"title": "Глава 1", "sections": []}]}

    # Save to DB and empty redis
    await CheckpointService.save_checkpoint_async(
        doc_id=doc.id,
        ast_data=sample_ast,
        db_session=db_session,
        redis_client=empty_redis,
        step="CHAPTERS",
    )

    # Re-fetch from DB directly to verify Persistence
    await db_session.refresh(doc)
    assert doc.ast_graph_json["title"] == "Документ для чекпоинта"
    assert len(doc.ast_graph_json["chapters"]) == 1

    # Verify fallback: clear Redis store and get checkpoint from DB session
    empty_redis.store.clear()
    fallback_res = await CheckpointService.get_checkpoint_async(
        doc_id=doc.id,
        db_session=db_session,
        redis_client=empty_redis,
    )
    assert fallback_res is not None
    assert fallback_res["title"] == "Документ для чекпоинта"


@pytest.mark.asyncio
async def test_clear_checkpoint():
    """Test clearing checkpoint from Redis."""
    doc_id = uuid.uuid4()
    redis_mock = MockRedisAsync()

    await CheckpointService.save_checkpoint_async(
        doc_id=doc_id,
        ast_data={"title": "Temp Work"},
        redis_client=redis_mock,
    )

    key = f"doc:{doc_id}:checkpoint"
    assert key in redis_mock.store

    cleared = await CheckpointService.clear_checkpoint_async(
        doc_id=doc_id,
        redis_client=redis_mock,
    )
    assert cleared is True
    assert key not in redis_mock.store


def test_sync_checkpoint():
    """Test synchronous save and get methods for Celery tasks."""
    doc_id = uuid.uuid4()
    redis_mock = MockRedisSync()

    saved = CheckpointService.save_checkpoint_sync(
        doc_id=doc_id,
        ast_data={"title": "Sync Title", "doc_type": "vkr"},
        redis_client=redis_mock,
        step="OUTLINE",
    )
    assert saved["title"] == "Sync Title"

    retrieved = CheckpointService.get_checkpoint_sync(
        doc_id=doc_id,
        redis_client=redis_mock,
    )
    assert retrieved["title"] == "Sync Title"

    cleared = CheckpointService.clear_checkpoint_sync(doc_id=doc_id, redis_client=redis_mock)
    assert cleared is True
