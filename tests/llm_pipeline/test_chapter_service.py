import pytest
import json
from unittest.mock import AsyncMock

from app.schemas.ast import SectionAST, NodeType
from app.services.llm.client import LLMClient
from app.services.llm.chapter_service import ChapterGeneratorService


@pytest.mark.asyncio
async def test_generate_section_with_table_list_footnotes():
    sample_section = {
        "section_title": "1.1. Понятие и классификация товарно-материальных запасов",
        "nodes": [
            {
                "id": "node_1",
                "type": "paragraph",
                "text": "Товарно-материальные запасы представляют собой важнейшую часть оборотных активов..."
            },
            {
                "id": "node_2",
                "type": "table",
                "caption": "Таблица 1.1 — Структура запасов предприятия",
                "headers": ["Категория", "2023 г.", "2024 г."],
                "rows": [
                    ["Сырье и материалы", "45%", "40%"],
                    ["Готовая продукция", "55%", "60%"]
                ]
            },
            {
                "id": "node_3",
                "type": "list",
                "list_type": "bullet",
                "list_items": [
                    "Текущие запасы",
                    "Страховые (гарантийные) запасы",
                    "Сезонные запасы"
                ]
            },
            {
                "id": "node_4",
                "type": "footnote",
                "footnote_text": "Положение по бухгалтерскому учету ПБУ 5/01."
            }
        ]
    }

    mock_llm_client = AsyncMock(spec=LLMClient)
    mock_llm_client.generate.return_value = json.dumps(sample_section)

    service = ChapterGeneratorService(llm_client=mock_llm_client)
    section = await service.generate_section(
        section_title="1.1. Понятие и классификация товарно-материальных запасов",
        chapter_title="Глава 1. Теоретические основы управления запасами",
        topic="Управление запасами предприятия",
        doc_type="coursework",
        include_table=True
    )

    assert isinstance(section, SectionAST)
    assert section.section_title == "1.1. Понятие и классификация товарно-материальных запасов"
    assert len(section.nodes) == 4

    types = [n.type for n in section.nodes]
    assert NodeType.PARAGRAPH in types
    assert NodeType.TABLE in types
    assert NodeType.LIST in types
    assert NodeType.FOOTNOTE in types

    table_node = next(n for n in section.nodes if n.type == NodeType.TABLE)
    assert table_node.caption.startswith("Таблица 1.1")
    assert len(table_node.headers) == 3
    assert len(table_node.rows) == 2


@pytest.mark.asyncio
async def test_generate_section_auto_assigns_missing_node_ids():
    sample_section_no_ids = {
        "section_title": "1.2. Методы управления запасами",
        "nodes": [
            {
                "type": "paragraph",
                "text": "Для оптимизации объема запасов применяются математические модели..."
            }
        ]
    }

    mock_llm_client = AsyncMock(spec=LLMClient)
    mock_llm_client.generate.return_value = json.dumps(sample_section_no_ids)

    service = ChapterGeneratorService(llm_client=mock_llm_client)
    section = await service.generate_section(
        section_title="1.2. Методы управления запасами",
        chapter_title="Глава 1. Теоретические основы",
        topic="Управление запасами"
    )

    assert len(section.nodes) == 1
    assert section.nodes[0].id is not None
    assert len(section.nodes[0].id) > 0
