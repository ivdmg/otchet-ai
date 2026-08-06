import pytest
import json
from unittest.mock import AsyncMock

from app.schemas.ast import BibliographyAST, SourceType
from app.services.llm.client import LLMClient
from app.services.llm.bibliography_service import BibliographyGeneratorService


@pytest.mark.asyncio
async def test_generate_bibliography_success():
    sample_biblio = {
        "type": "BIBLIOGRAPHY",
        "title": "Список использованных источников",
        "items": [
            {
                "id": "src_1",
                "authors": ["Иванов И. И.", "Петров П. П."],
                "title": "Управление запасами на современном предприятии",
                "source_type": "monograph",
                "publisher_or_journal": "М.: Наука",
                "year": 2023,
                "pages_or_url": "210 с."
            },
            {
                "id": "src_2",
                "authors": ["Сергеев С. С."],
                "title": "Моделирование логистических потоков",
                "source_type": "article",
                "publisher_or_journal": "Журнал 'Логистика', № 2",
                "year": 2024,
                "pages_or_url": "С. 45-52"
            }
        ]
    }

    mock_llm_client = AsyncMock(spec=LLMClient)
    mock_llm_client.generate.return_value = json.dumps(sample_biblio)

    service = BibliographyGeneratorService(llm_client=mock_llm_client)
    biblio = await service.generate_bibliography(
        topic="Управление запасами",
        doc_type="coursework",
        target_items=15
    )

    assert isinstance(biblio, BibliographyAST)
    assert biblio.title == "Список использованных источников"
    assert len(biblio.items) == 2
    assert biblio.items[0].source_type == SourceType.MONOGRAPH
    assert biblio.items[1].source_type == SourceType.ARTICLE
    assert biblio.items[0].year == 2023


@pytest.mark.asyncio
async def test_generate_bibliography_handles_markdown():
    sample_biblio = {
        "type": "BIBLIOGRAPHY",
        "title": "Список использованных источников",
        "items": [
            {
                "id": "src_1",
                "authors": ["Автор А. А."],
                "title": "Закон о торговле",
                "source_type": "law",
                "publisher_or_journal": "Собрание законодательства РФ",
                "year": 2022,
                "pages_or_url": "Ст. 1234"
            }
        ]
    }
    raw_llm_output = f"```json\n{json.dumps(sample_biblio)}\n```"

    mock_llm_client = AsyncMock(spec=LLMClient)
    mock_llm_client.generate.return_value = raw_llm_output

    service = BibliographyGeneratorService(llm_client=mock_llm_client)
    biblio = await service.generate_bibliography(topic="Правовое регулирование")

    assert isinstance(biblio, BibliographyAST)
    assert len(biblio.items) == 1
    assert biblio.items[0].source_type == SourceType.LAW
