import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Union
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.celery_app import celery_app
from app.core.redis import get_redis_client, get_async_redis_client
from app.db.session import AsyncSessionLocal
from app.models.document import Document
from app.models.generation_task import GenerationTask
from app.models.enums import DocStatus, TaskStatus
from app.schemas.ast import (
    DocumentASTGraph,
    ChapterAST,
    SectionAST,
)
from app.services.checkpoint_service import CheckpointService
from app.services.llm.client import LLMClient
from app.services.llm.outline_service import OutlineGeneratorService
from app.services.llm.intro_service import IntroductionGeneratorService
from app.services.llm.chapter_service import ChapterGeneratorService
from app.services.llm.conclusion_service import ConclusionGeneratorService
from app.services.llm.bibliography_service import BibliographyGeneratorService

logger = logging.getLogger(__name__)

PROGRESS_CHANNEL_TEMPLATE = "doc:{doc_id}:progress"


def publish_progress(
    redis_client: Any,
    doc_id: str,
    step: str,
    progress_percent: int,
    status: str = "processing",
    message: str = "",
    ast_graph: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Publishes progress event to Redis Pub/Sub channel."""
    channel = PROGRESS_CHANNEL_TEMPLATE.format(doc_id=doc_id)
    payload = {
        "doc_id": doc_id,
        "step": step,
        "progress_percent": progress_percent,
        "status": status,
        "message": message,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if ast_graph is not None:
        payload["ast_graph"] = ast_graph

    try:
        redis_client.publish(channel, json.dumps(payload, ensure_ascii=False))
    except Exception as e:
        logger.warning(f"Failed to publish progress to Redis channel {channel}: {e}")

    return payload


async def run_document_generation(
    doc_id: str,
    topic: str,
    doc_type: str = "coursework",
    target_pages: int = 25,
    author_name: Optional[str] = None,
    institution: Optional[str] = None,
    llm_client: Optional[LLMClient] = None,
    redis_client: Optional[Any] = None,
    db_session: Optional[AsyncSession] = None,
) -> Dict[str, Any]:
    """
    Async orchestrator for step-by-step document generation pipeline.
    Outline -> Introduction -> Body Chapters -> Conclusion -> Bibliography.
    """
    r_client = redis_client or get_redis_client()
    client = llm_client or LLMClient()
    doc_uuid = UUID(doc_id)

    # 1. Try loading existing checkpoint for resumption
    existing_ckpt = await CheckpointService.get_checkpoint_async(doc_id=doc_id, db_session=db_session, redis_client=r_client)
    if existing_ckpt:
        try:
            ast_graph = DocumentASTGraph.model_validate(existing_ckpt)
            logger.info(f"[{doc_id}] Resuming generation from existing checkpoint")
        except Exception as ckpt_err:
            logger.warning(f"[{doc_id}] Failed to parse checkpoint: {ckpt_err}. Starting fresh.")
            ast_graph = DocumentASTGraph(
                doc_type=doc_type,
                title=topic,
                author_name=author_name,
                institution=institution,
                year=datetime.now(timezone.utc).year,
            )
    else:
        ast_graph = DocumentASTGraph(
            doc_type=doc_type,
            title=topic,
            author_name=author_name,
            institution=institution,
            year=datetime.now(timezone.utc).year,
        )

    async def _update_db_status(doc_status: DocStatus, task_status: TaskStatus, step: str, progress: int, err: Optional[str] = None):
        if db_session is not None:
            # Update Document status
            await db_session.execute(
                update(Document)
                .where(Document.id == doc_uuid)
                .values(status=doc_status, updated_at=datetime.now(timezone.utc))
            )
            # Update or create GenerationTask record
            res = await db_session.execute(
                select(GenerationTask).where(GenerationTask.document_id == doc_uuid)
            )
            gen_task = res.scalar_one_or_none()
            if gen_task:
                gen_task.status = task_status
                gen_task.step_name = step
                gen_task.progress_percent = progress
                gen_task.error_log = err
            else:
                gen_task = GenerationTask(
                    document_id=doc_uuid,
                    step_name=step,
                    status=task_status,
                    progress_percent=progress,
                    error_log=err,
                )
                db_session.add(gen_task)
            await db_session.commit()

    try:
        await _update_db_status(DocStatus.GENERATING, TaskStatus.PROCESSING, "OUTLINE", 0)
        publish_progress(r_client, doc_id, "OUTLINE", 5, "processing", "Начало генерации плана...")

        # STEP 1: Outline Generation
        outline_service = OutlineGeneratorService(llm_client=client)
        logger.info(f"[{doc_id}] Step 1: Generating Outline...")
        outline = await outline_service.generate_outline(
            topic=topic,
            doc_type=doc_type,
            target_pages=target_pages,
        )

        saved_ast = await CheckpointService.save_checkpoint_async(
            doc_id=doc_id,
            ast_data=ast_graph,
            db_session=db_session,
            redis_client=r_client,
            step="OUTLINE",
        )
        publish_progress(r_client, doc_id, "OUTLINE", 20, "processing", "План документа сформирован", saved_ast)

        # STEP 2: Introduction Generation
        if not ast_graph.introduction:
            logger.info(f"[{doc_id}] Step 2: Generating Introduction...")
            intro_service = IntroductionGeneratorService(llm_client=client)
            intro_ast = await intro_service.generate_introduction(
                topic=topic,
                doc_type=doc_type,
            )
            ast_graph.introduction = intro_ast

            saved_ast = await CheckpointService.save_checkpoint_async(
                doc_id=doc_id,
                ast_data=ast_graph,
                db_session=db_session,
                redis_client=r_client,
                step="INTRODUCTION",
            )
            publish_progress(r_client, doc_id, "INTRODUCTION", 40, "processing", "Введение сгенерировано", saved_ast)

        # STEP 3: Body Chapters Generation
        if len(ast_graph.chapters) < len(outline.chapters):
            logger.info(f"[{doc_id}] Step 3: Generating Body Chapters...")
            chapter_service = ChapterGeneratorService(llm_client=client)
            num_chapters = len(outline.chapters)
            prev_summary = "Старт работы"

            # Skip chapters that were already completed
            completed_chap_count = len(ast_graph.chapters)

            for idx in range(completed_chap_count, num_chapters):
                outline_chap = outline.chapters[idx]
                sections_ast = []
                for sec_item in outline_chap.sections:
                    sec_ast = await chapter_service.generate_section(
                        section_title=sec_item.title,
                        chapter_title=outline_chap.title,
                        topic=topic,
                        doc_type=doc_type,
                        include_table=sec_item.include_table,
                        research_goal=ast_graph.introduction.goal if ast_graph.introduction else "",
                        previous_section_summary=prev_summary,
                    )
                    sections_ast.append(sec_ast)
                    para_texts = [n.text for n in sec_ast.nodes if n.text]
                    if para_texts:
                        prev_summary = para_texts[-1][:200]

                chap_ast = ChapterAST(title=outline_chap.title, sections=sections_ast)
                ast_graph.chapters.append(chap_ast)

                chap_progress = 40 + int(30 * (idx + 1) / max(num_chapters, 1))
                saved_ast = await CheckpointService.save_checkpoint_async(
                    doc_id=doc_id,
                    ast_data=ast_graph,
                    db_session=db_session,
                    redis_client=r_client,
                    step=f"CHAPTER_{idx+1}",
                )
                publish_progress(r_client, doc_id, "BODY_CHAPTERS", chap_progress, "processing", f"Глава {idx+1} сгенерирована", saved_ast)

        # STEP 4: Conclusion Generation
        if not ast_graph.conclusion:
            logger.info(f"[{doc_id}] Step 4: Generating Conclusion...")
            conclusion_service = ConclusionGeneratorService(llm_client=client)
            tasks_list = ast_graph.introduction.tasks if ast_graph.introduction else ["Исследовать предмет работы"]
            conclusion_ast = await conclusion_service.generate_conclusion(
                topic=topic,
                tasks=tasks_list,
                chapters_summary="Обобщение основных глав",
                doc_type=doc_type,
            )
            ast_graph.conclusion = conclusion_ast

            saved_ast = await CheckpointService.save_checkpoint_async(
                doc_id=doc_id,
                ast_data=ast_graph,
                db_session=db_session,
                redis_client=r_client,
                step="CONCLUSION",
            )
            publish_progress(r_client, doc_id, "CONCLUSION", 85, "processing", "Заключение сгенерировано", saved_ast)

        # STEP 5: Bibliography Generation
        if not ast_graph.bibliography:
            logger.info(f"[{doc_id}] Step 5: Generating Bibliography...")
            bib_service = BibliographyGeneratorService(llm_client=client)
            bib_ast = await bib_service.generate_bibliography(
                topic=topic,
                doc_type=doc_type,
                target_items=15,
            )
            ast_graph.bibliography = bib_ast


        # Finalize Generation
        final_ast = await CheckpointService.save_checkpoint_async(
            doc_id=doc_id,
            ast_data=ast_graph,
            db_session=db_session,
            redis_client=r_client,
            step="COMPLETED",
        )
        await _update_db_status(DocStatus.COMPLETED, TaskStatus.COMPLETED, "COMPLETED", 100)
        publish_progress(r_client, doc_id, "COMPLETED", 100, "completed", "Генерация документа успешно завершена", final_ast)

        return final_ast

    except Exception as e:
        logger.error(f"[{doc_id}] Generation failed with error: {e}", exc_info=True)
        await _update_db_status(DocStatus.FAILED, TaskStatus.FAILED, "FAILED", 0, str(e))
        publish_progress(r_client, doc_id, "FAILED", 0, "failed", f"Ошибка генерации: {str(e)}")
        raise e


@celery_app.task(bind=True, name="app.tasks.generation.generate_document_task")
def generate_document_task(
    self,
    doc_id: str,
    topic: str,
    doc_type: str = "coursework",
    target_pages: int = 25,
    author_name: Optional[str] = None,
    institution: Optional[str] = None,
) -> Dict[str, Any]:
    """Celery entrypoint task for step-by-step document generation."""
    logger.info(f"Starting Celery document generation task for doc {doc_id}")

    async def _async_runner():
        async with AsyncSessionLocal() as session:
            return await run_document_generation(
                doc_id=doc_id,
                topic=topic,
                doc_type=doc_type,
                target_pages=target_pages,
                author_name=author_name,
                institution=institution,
                db_session=session,
            )

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import nest_asyncio
        # If in active event loop, run in task
        return asyncio.ensure_future(_async_runner())
    else:
        return asyncio.run(_async_runner())

