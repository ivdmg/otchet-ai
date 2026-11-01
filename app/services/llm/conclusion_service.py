from typing import List, Optional

from app.schemas.ast import ConclusionAST
from app.services.llm.client import LLMClient
from app.services.llm.retry import with_llm_retry
from app.services.llm.sanitizer import sanitize_and_parse_json


CONCLUSION_SYSTEM_PROMPT = """You are an Academic Evaluator specializing in Russian GOST 7.32-2017 standards.
Generate the Conclusion (Заключение) for a {doc_type} titled: "{topic}".

INPUT CONTEXT:
- Tasks defined in Introduction:
{tasks_list}
- Summaries of main chapters/sections:
"{chapters_summary}"

REQUIREMENTS:
1. Provide a clear, structured summary of findings in 'task_results' corresponding sequentially to each Task defined in the Introduction.
2. Formulate 2-3 major practical recommendations or theoretical generalizations in 'final_summary_paragraphs'.
3. Output MUST be valid JSON matching the schema below.

GLOBAL BLACKLIST (DO NOT USE THESE PHRASES OR CLICHÉS):
- "В данном исследовании...", "В этой работе...", "В рамках данной статьи..."
- "Важно отметить...", "Необходимо подчеркнуть...", "Следует обратить внимание..."
- "Таким образом, подводя итоги...", "Как видно из всего вышесказанного..."
- "Безусловно...", "Несомненно...", "Является актуальной темой..."
- "В современном мире...", "С каждым днем все больше..."
- Do NOT use 1st person pronouns ("я", "мы", "наш"). Use formal impersonal Russian academic style.

REQUIRED JSON OUTPUT FORMAT:
{{
  "type": "CONCLUSION",
  "title": "Заключение",
  "task_results": [
    {{
      "task_name": "Название первой задачи из Введения",
      "finding_text": "Сформулированный глубокий научный вывод по первой задаче..."
    }},
    {{
      "task_name": "Название второй задачи из Введения",
      "finding_text": "Сформулированный глубокий научный вывод по второй задаче..."
    }}
  ],
  "final_summary_paragraphs": [
    "Первый итоговый обобщающий практический вывод...",
    "Второй итоговый обобщающий практический вывод..."
  ]
}}
"""


class ConclusionGeneratorService:
    """
    Service responsible for generating GOST-compliant ConclusionAST based on Introduction tasks and Chapter summaries.
    """

    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()

    @with_llm_retry
    async def generate_conclusion(
        self,
        topic: str,
        tasks: List[str],
        chapters_summary: str = "",
        doc_type: str = "coursework",
    ) -> ConclusionAST:
        """
        Generates ConclusionAST with sequential findings for each task and final summary paragraphs.
        """
        formatted_tasks = "\n".join(f"- {task}" for task in tasks)
        system_prompt = CONCLUSION_SYSTEM_PROMPT.format(
            doc_type=doc_type,
            topic=topic,
            tasks_list=formatted_tasks,
            chapters_summary=chapters_summary or "Обобщение основных глав работы",
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate conclusion for {doc_type}: '{topic}'"}
        ]

        raw_response = await self.llm_client.generate(
            messages=messages,
            json_mode=True,
        )

        data = sanitize_and_parse_json(raw_response)
        return ConclusionAST.model_validate(data)

