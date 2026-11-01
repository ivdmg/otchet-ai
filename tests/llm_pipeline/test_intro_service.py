import pytest
import json
from unittest.mock import AsyncMock

from app.schemas.ast import IntroductionAST
from app.services.llm.client import LLMClient
from app.services.llm.intro_service import IntroductionGeneratorService


@pytest.mark.asyncio
async def test_generate_introduction_success():
    sample_intro = {
        "type": "INTRODUCTION",
        "title": "Введение",
        "relevance_paragraphs": [
            "Эффективное управление запасами является ключевым элементом...",
            "В условиях цифровизации предприятий требуется оптимизация процессов..."
        ],
        "object": "Процесс управления товарными запасами торгового предприятия",
        "subject": "Методы и алгоритмы автоматизации учетных операций",
        "goal": "Разработка информационной системы автоматизированного учета запасов",
        "tasks": [
            "Исследовать теоретические аспекты логистики запасов",
            "Провести анализ бизнес-процессов предприятия",
            "Спроектировать архитектуру сервиса",
            "Реализовать и протестировать программный продукт"
        ],
        "methods": [
            "системный анализ",
            "моделирование бизнес-процессов",
            "объектно-ориентированное проектирование"
        ]
    }

    mock_llm_client = AsyncMock(spec=LLMClient)
    mock_llm_client.generate.return_value = json.dumps(sample_intro)

    service = IntroductionGeneratorService(llm_client=mock_llm_client)
    intro = await service.generate_introduction(
        topic="Автоматизация учета запасов",
        doc_type="coursework"
    )

    assert isinstance(intro, IntroductionAST)
    assert intro.title == "Введение"
    assert len(intro.relevance_paragraphs) == 2
    assert intro.object.startswith("Процесс")
    assert intro.goal.startswith("Разработка")
    assert len(intro.tasks) == 4
    assert len(intro.methods) == 3


@pytest.mark.asyncio
async def test_generate_introduction_handles_markdown():
    sample_intro = {
        "type": "INTRODUCTION",
        "title": "Введение",
        "relevance_paragraphs": ["Параграф 1"],
        "object": "Объект",
        "subject": "Предмет",
        "goal": "Цель",
        "tasks": ["Задача 1", "Задача 2", "Задача 3"],
        "methods": ["Метод 1"]
    }
    raw_llm_output = f"```json\n{json.dumps(sample_intro)}\n```"

    mock_llm_client = AsyncMock(spec=LLMClient)
    mock_llm_client.generate.return_value = raw_llm_output

    service = IntroductionGeneratorService(llm_client=mock_llm_client)
    intro = await service.generate_introduction(topic="Тестовая тема")

    assert isinstance(intro, IntroductionAST)
    assert intro.object == "Объект"
    assert intro.tasks == ["Задача 1", "Задача 2", "Задача 3"]
