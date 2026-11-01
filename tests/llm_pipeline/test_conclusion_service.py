import pytest
import json
from unittest.mock import AsyncMock

from app.schemas.ast import ConclusionAST
from app.services.llm.client import LLMClient
from app.services.llm.conclusion_service import ConclusionGeneratorService


@pytest.mark.asyncio
async def test_generate_conclusion_success():
    sample_conclusion = {
        "type": "CONCLUSION",
        "title": "Заключение",
        "task_results": [
            {
                "task_name": "Исследовать теоретические аспекты логистики запасов",
                "finding_text": "В ходе выполнения первой задачи были обобщены основные научные подходы..."
            },
            {
                "task_name": "Провести анализ бизнес-процессов предприятия",
                "finding_text": "Анализ показал высокую долю издержек на хранение неликвидных запасов..."
            }
        ],
        "final_summary_paragraphs": [
            "Внедрение разработанной информационной системы позволит сократить издержки на 15%...",
            "Результаты работы могут быть применены на предприятиях торговой отрасли."
        ]
    }

    mock_llm_client = AsyncMock(spec=LLMClient)
    mock_llm_client.generate.return_value = json.dumps(sample_conclusion)

    service = ConclusionGeneratorService(llm_client=mock_llm_client)
    tasks = [
        "Исследовать теоретические аспекты логистики запасов",
        "Провести анализ бизнес-процессов предприятия"
    ]
    conclusion = await service.generate_conclusion(
        topic="Оптимизация запасов",
        tasks=tasks,
        chapters_summary="Глава 1 про теорию, Глава 2 про проект",
        doc_type="coursework"
    )

    assert isinstance(conclusion, ConclusionAST)
    assert conclusion.title == "Заключение"
    assert len(conclusion.task_results) == 2
    assert conclusion.task_results[0].task_name == tasks[0]
    assert len(conclusion.final_summary_paragraphs) == 2


@pytest.mark.asyncio
async def test_generate_conclusion_handles_markdown():
    sample_conclusion = {
        "type": "CONCLUSION",
        "title": "Заключение",
        "task_results": [
            {
                "task_name": "Задача 1",
                "finding_text": "Вывод 1"
            }
        ],
        "final_summary_paragraphs": ["Итоговый вывод"]
    }
    raw_llm_output = f"```json\n{json.dumps(sample_conclusion)}\n```"

    mock_llm_client = AsyncMock(spec=LLMClient)
    mock_llm_client.generate.return_value = raw_llm_output

    service = ConclusionGeneratorService(llm_client=mock_llm_client)
    conclusion = await service.generate_conclusion(
        topic="Тема",
        tasks=["Задача 1"]
    )

    assert isinstance(conclusion, ConclusionAST)
    assert len(conclusion.task_results) == 1
    assert conclusion.task_results[0].finding_text == "Вывод 1"
