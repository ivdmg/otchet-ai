import pytest
import json
from unittest.mock import AsyncMock

from app.schemas.ast import OutlineAST
from app.services.llm.client import LLMClient, LLMRateLimitError
from app.services.llm.outline_service import OutlineGeneratorService


@pytest.mark.asyncio
async def test_generate_outline_success():
    sample_outline = {
        "doc_type": "coursework",
        "title": "Разработка информационной системы управления запасами",
        "chapters": [
            {
                "title": "Глава 1. Теоретические основы управления запасами",
                "sections": [
                    {
                        "title": "1.1. Понятие и классификация товарно-материальных запасов",
                        "target_paragraphs": 4,
                        "include_table": True
                    },
                    {
                        "title": "1.2. Методы оптимизации запасов на предприятии",
                        "target_paragraphs": 5,
                        "include_table": False
                    }
                ]
            },
            {
                "title": "Глава 2. Проектирование информационной системы",
                "sections": [
                    {
                        "title": "2.1. Требования к веб-сервису",
                        "target_paragraphs": 4,
                        "include_table": True
                    }
                ]
            }
        ]
    }

    mock_llm_client = AsyncMock(spec=LLMClient)
    mock_llm_client.generate.return_value = json.dumps(sample_outline)

    service = OutlineGeneratorService(llm_client=mock_llm_client)
    outline = await service.generate_outline(
        topic="Разработка информационной системы управления запасами",
        doc_type="coursework",
        target_pages=25
    )

    assert isinstance(outline, OutlineAST)
    assert outline.doc_type == "coursework"
    assert outline.title == "Разработка информационной системы управления запасами"
    assert len(outline.chapters) == 2
    assert outline.chapters[0].sections[0].include_table is True


@pytest.mark.asyncio
async def test_generate_outline_handles_markdown_codeblocks():
    json_text = json.dumps({
        "doc_type": "abstract",
        "title": "Искусственный интеллект в медицине",
        "chapters": [
            {
                "title": "Глава 1. Обзор технологий ИИ",
                "sections": [
                    {
                        "title": "1.1. История применения нейросетей",
                        "target_paragraphs": 3,
                        "include_table": False
                    }
                ]
            }
        ]
    })
    raw_llm_output = f"```json\n{json_text}\n```"

    mock_llm_client = AsyncMock(spec=LLMClient)
    mock_llm_client.generate.return_value = raw_llm_output

    service = OutlineGeneratorService(llm_client=mock_llm_client)
    outline = await service.generate_outline(topic="Искусственный интеллект в медицине", doc_type="abstract")

    assert outline.doc_type == "abstract"
    assert outline.title == "Искусственный интеллект в медицине"
    assert len(outline.chapters) == 1
