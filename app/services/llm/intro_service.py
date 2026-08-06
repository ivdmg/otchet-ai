import json
from typing import Optional

from app.schemas.ast import IntroductionAST
from app.services.llm.client import LLMClient
from app.services.llm.retry import with_llm_retry
from app.services.llm.sanitizer import sanitize_and_parse_json


INTRO_SYSTEM_PROMPT = """You are a Senior Academic Researcher specializing in GOST 7.32-2017 standards.
Generate a formal, highly academic Introduction (Введение) for a {doc_type} titled: "{topic}".

MANDATORY 6 STRUCTURAL BLOCKS:
1. relevance_paragraphs (array of strings): Current state of research, systemic problem, and rationale for relevance (2-3 detailed paragraphs).
2. object (string): The system, process, or phenomenon being analyzed.
3. subject (string): Specific characteristics, properties, or relations analyzed within the object.
4. goal (string): Clear, singular goal that the work aims to achieve.
5. tasks (array of 3-4 strings): Exactly 3-4 sequential tasks required to fulfill the goal.
6. methods (array of strings): Specific scientific techniques used (e.g. analysis, synthesis, modeling, comparative method).

GLOBAL BLACKLIST (DO NOT USE THESE PHRASES OR CLICHÉS):
- "В данном исследовании...", "В этой работе...", "В рамках данной статьи..."
- "Важно отметить...", "Необходимо подчеркнуть...", "Следует обратить внимание..."
- "Таким образом, подводя итоги...", "Как видно из всего вышесказанного..."
- "Безусловно...", "Несомненно...", "Является актуальной темой..."
- "В современном мире...", "С каждым днем все больше..."
- Do NOT use 1st person pronouns ("я", "мы", "наш"). Use formal impersonal Russian academic style.

REQUIRED JSON OUTPUT FORMAT:
{{
  "type": "INTRODUCTION",
  "title": "Введение",
  "relevance_paragraphs": [
    "Первый параграф актуальности...",
    "Второй параграф актуальности..."
  ],
  "object": "Объектом исследования является...",
  "subject": "Предметом исследования выступает...",
  "goal": "Целью работы является...",
  "tasks": [
    "Изучить теоретические основы...",
    "Проанализировать существующие подходы...",
    "Разработать модель...",
    "Оценить эффективность..."
  ],
  "methods": [
    "метод системного анализа",
    "сравнительный анализ",
    "математическое моделирование"
  ]
}}
"""


class IntroductionGeneratorService:
    """
    Service responsible for generating GOST-compliant IntroductionAST (6 structural blocks).
    """

    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()

    @with_llm_retry
    async def generate_introduction(
        self,
        topic: str,
        doc_type: str = "coursework",
    ) -> IntroductionAST:
        """
        Generates 6 mandatory structural blocks for Introduction.
        """
        system_prompt = INTRO_SYSTEM_PROMPT.format(
            doc_type=doc_type,
            topic=topic,
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate introduction for {doc_type}: '{topic}'"}
        ]

        raw_response = await self.llm_client.generate(
            messages=messages,
            json_mode=True,
        )

        data = sanitize_and_parse_json(raw_response)
        return IntroductionAST.model_validate(data)

