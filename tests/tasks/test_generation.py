import uuid
import json
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.tasks.generation import publish_progress, run_document_generation, generate_document_task
from app.schemas.ast import (
    OutlineAST,
    OutlineChapterItem,
    OutlineSectionItem,
    IntroductionAST,
    SectionAST,
    ASTNode,
    NodeType,
    ConclusionAST,
    TaskResultItem,
    BibliographyAST,
    BibliographyItem,
    SourceType,
)
from app.models.document import Document
from app.models.user import User
from app.models.enums import DocType, DocStatus
from app.core.celery_app import celery_app


class MockRedisPubSub:
    def __init__(self):
        self.published = []

    def publish(self, channel, message):
        self.published.append((channel, json.loads(message)))
        return 1

    def set(self, key, value, ex=None):
        return True

    def get(self, key):
        return None


def test_publish_progress():
    """Test publish_progress publishing formatted JSON payload to Redis Pub/Sub."""
    redis_mock = MockRedisPubSub()
    doc_id = str(uuid.uuid4())

    payload = publish_progress(
        redis_client=redis_mock,
        doc_id=doc_id,
        step="OUTLINE",
        progress_percent=20,
        status="processing",
        message="Outline completed",
    )

    assert payload["doc_id"] == doc_id
    assert payload["step"] == "OUTLINE"
    assert payload["progress_percent"] == 20
    assert len(redis_mock.published) == 1
    assert redis_mock.published[0][0] == f"doc:{doc_id}:progress"
    assert redis_mock.published[0][1]["message"] == "Outline completed"


@pytest.mark.asyncio
async def test_run_document_generation_success(db_session):
    """Test full document generation pipeline with mocked LLM responses."""
    user = User(email="gen_test@example.com", password_hash="hash")
    db_session.add(user)
    await db_session.flush()

    doc = Document(
        user_id=user.id,
        title="Исследование нейронных сетей",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.DRAFT,
        ast_graph_json={},
    )
    db_session.add(doc)
    await db_session.commit()

    redis_mock = MockRedisPubSub()

    # Mock LLM responses for each step
    mock_llm = AsyncMock()

    outline_resp = json.dumps({
        "doc_type": "coursework",
        "title": "Исследование нейронных сетей",
        "chapters": [
            {
                "title": "Глава 1. Теоретические основы",
                "sections": [
                    {"title": "1.1 Обзор архитектур", "target_paragraphs": 3, "include_table": False}
                ]
            }
        ]
    })

    intro_resp = json.dumps({
        "type": "INTRODUCTION",
        "title": "Введение",
        "relevance_paragraphs": ["Актуальность работы..."],
        "object": "Объект",
        "subject": "Предмет",
        "goal": "Цель",
        "tasks": ["Задача 1"],
        "methods": ["Метод 1"]
    })

    section_resp = json.dumps({
        "title": "1.1 Обзор архитектур",
        "nodes": [
            {"id": "n1", "type": "paragraph", "text": "Текст параграфа о нейросетях"}
        ]
    })

    conclusion_resp = json.dumps({
        "type": "CONCLUSION",
        "title": "Заключение",
        "task_results": [{"task_name": "Задача 1", "finding_text": "Вывод по задаче 1"}],
        "final_summary_paragraphs": ["Итоговый вывод"]
    })

    bib_resp = json.dumps({
        "type": "BIBLIOGRAPHY",
        "title": "Список литературы",
        "items": [
            {
                "id": "src_1",
                "authors": ["Иванов И.И."],
                "title": "Глубокое обучение",
                "source_type": "monograph",
                "year": 2024
            }
        ]
    })

    mock_llm.generate.side_effect = [
        outline_resp,
        intro_resp,
        section_resp,
        conclusion_resp,
        bib_resp,
    ]

    final_ast = await run_document_generation(
        doc_id=str(doc.id),
        topic="Исследование нейронных сетей",
        doc_type="coursework",
        target_pages=25,
        llm_client=mock_llm,
        redis_client=redis_mock,
        db_session=db_session,
    )

    assert final_ast["title"] == "Исследование нейронных сетей"
    assert final_ast["introduction"]["goal"] == "Цель"
    assert len(final_ast["chapters"]) == 1
    assert final_ast["conclusion"]["title"] == "Заключение"
    assert len(final_ast["bibliography"]["items"]) == 1

    # Verify DB state updated to COMPLETED
    await db_session.refresh(doc)
    assert doc.status == DocStatus.COMPLETED
    assert doc.ast_graph_json["title"] == "Исследование нейронных сетей"

    # Verify PubSub notifications were sent for all 5 steps + start + completed
    assert len(redis_mock.published) >= 6


@pytest.mark.asyncio
async def test_run_document_generation_error_handling(db_session):
    """Test that pipeline handles LLM errors, updates DB status to FAILED, and sends error progress."""
    user = User(email="gen_err@example.com", password_hash="hash")
    db_session.add(user)
    await db_session.flush()

    doc = Document(
        user_id=user.id,
        title="Ошибочный документ",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.DRAFT,
        ast_graph_json={},
    )
    db_session.add(doc)
    await db_session.commit()

    redis_mock = MockRedisPubSub()
    mock_llm = AsyncMock()
    mock_llm.generate.side_effect = Exception("LLM API Timeout Error")

    with pytest.raises(Exception, match="LLM API Timeout Error"):
        await run_document_generation(
            doc_id=str(doc.id),
            topic="Ошибочный документ",
            llm_client=mock_llm,
            redis_client=redis_mock,
            db_session=db_session,
        )

    await db_session.refresh(doc)
    assert doc.status == DocStatus.FAILED

    # Check error published to Redis
    last_pub = redis_mock.published[-1][1]
    assert last_pub["status"] == "failed"
    assert "LLM API Timeout Error" in last_pub["message"]
