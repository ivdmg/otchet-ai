import uuid
import os
from typing import Dict, Any
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.document import Document
from fastapi.responses import FileResponse, Response
from urllib.parse import quote
from app.models.enums import TransactionType, DocStatus
from app.schemas.api import SpotRegenerateRequest, DocumentCreate, DocumentRead
from app.services.billing_service import BillingService
from app.services.checkpoint_service import CheckpointService
from app.services.spot_regeneration_service import SpotRegenerationService
from app.docx_engine.compiler import DocxCompiler
from app.tasks.generation import generate_document_task

router = APIRouter()
billing_service = BillingService()
spot_regen_service = SpotRegenerationService()

STORAGE_DIR = Path("uploads/documents")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED, summary="Create and Start Document Generation")
async def create_document(
    body: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Creates a new Document, deducts 5 credits, and starts async generation task.
    """
    # Spend generation credits
    await billing_service.spend_credits(
        db=db,
        user_id=current_user.id,
        amount_credits=5,
        transaction_type=TransactionType.SPEND_GENERATION,
    )

    doc = Document(
        user_id=current_user.id,
        title=body.title,
        doc_type=body.doc_type,
        status=DocStatus.DRAFT,
        ast_graph_json={"title": body.title, "doc_type": body.doc_type},
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    celery_task = generate_document_task.delay(
        doc_id=str(doc.id),
        topic=doc.title,
        doc_type=str(doc.doc_type),
    )

    return {
        "status": "started",
        "document": {
            "id": str(doc.id),
            "title": doc.title,
            "doc_type": str(doc.doc_type),
            "status": str(doc.status.value if hasattr(doc.status, "value") else doc.status),
        },
        "celery_task_id": celery_task.id,
    }


@router.get("/", response_model=list[DocumentRead], summary="List User Documents")
async def list_documents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Returns list of documents belonging to the authenticated user."""
    res = await db.execute(
        select(Document).where(Document.user_id == current_user.id).order_by(Document.created_at.desc())
    )
    return res.scalars().all()


@router.get("/{doc_id}", response_model=DocumentRead, summary="Get Document Details")
async def get_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Returns document details by ID."""
    res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Документ не найден",
        )
    if doc.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ к данному документу запрещен",
        )
    return doc


@router.post("/{doc_id}/spot-regenerate", summary="Spot Regenerate Single AST Node")
async def spot_regenerate_node(
    doc_id: uuid.UUID,
    body: SpotRegenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Spot regeneration endpoint for targeted AST node re-generation by node_id.
    Validates document ownership, deducts 1 credit, regenerates node using LLM,
    saves AST checkpoint, and updates DOCX compilation file.
    """
    # 1. Fetch document & check ownership
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Документ не найден",
        )
    if doc.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ к данному документу запрещен",
        )

    # 2. Retrieve current AST Graph (from Redis checkpoint or DB)
    ast_graph = await CheckpointService.get_checkpoint_async(doc_id=doc_id, db_session=db)
    if not ast_graph:
        ast_graph = doc.ast_graph_json or {}

    if not ast_graph:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Документ не содержит валидного AST графа для точечной перегенерации",
        )

    # 3. Deduct credit (1 credit for spot regeneration)
    await billing_service.spend_credits(
        db=db,
        user_id=current_user.id,
        amount_credits=1,
        transaction_type=TransactionType.SPEND_SPOT_REGEN,
    )

    # 4. Regenerate target node via LLM
    try:
        updated_ast, new_node = await spot_regen_service.regenerate_node(
            ast_dict=ast_graph,
            target_id=body.node_id,
            user_instruction=body.user_instruction,
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка точечной перегенерации узла: {str(exc)}",
        )

    # 5. Save updated AST checkpoint in Redis and DB
    await CheckpointService.save_checkpoint_async(
        doc_id=doc_id,
        ast_data=updated_ast,
        db_session=db,
        step="SPOT_REGENERATE",
    )

    # 6. Re-compile DOCX file instantly
    docx_filename = f"{doc_id}.docx"
    file_path = STORAGE_DIR / docx_filename
    compiler = DocxCompiler(ast=updated_ast)
    compiler.save(str(file_path))

    doc.file_s3_url = str(file_path)
    await db.commit()
    await db.refresh(doc)

    return {
        "status": "success",
        "doc_id": doc_id,
        "node_id": body.node_id,
        "regenerated_node": new_node,
        "ast_graph": updated_ast,
        "file_url": doc.file_s3_url,
    }


@router.post("/{doc_id}/resume", summary="Resume Interrupted Document Generation")
async def resume_document_generation_endpoint(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Resumes interrupted/failed document generation from the last saved checkpoint in Redis/PostgreSQL.
    """
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Документ не найден",
        )
    if doc.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ к данному документу запрещен",
        )

    if doc.status == DocStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Генерация документа уже успешно завершена",
        )

    ckpt = await CheckpointService.get_checkpoint_async(doc_id=doc_id, db_session=db)
    if not ckpt and not doc.ast_graph_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нет сохраненных чекпоинтов для возобновления генерации",
        )

    doc.status = DocStatus.GENERATING
    await db.commit()

    celery_task = generate_document_task.delay(
        doc_id=str(doc_id),
        topic=doc.title,
        doc_type=doc.doc_type.value if hasattr(doc.doc_type, "value") else str(doc.doc_type),
    )

    return {
        "status": "resuming",
        "doc_id": doc_id,
        "celery_task_id": celery_task.id,
        "message": "Генерация успешно возобновлена с последнего чекпоинта",
    }


@router.get("/{doc_id}/download", summary="Compile and Download DOCX Document")
async def download_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Compiles Document AST into GOST compliant .docx file and returns as downloadable attachment.
    """
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Документ не найден",
        )
    if doc.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ к данному документу запрещен",
        )

    # 1. Retrieve AST Graph
    ast_graph = await CheckpointService.get_checkpoint_async(doc_id=doc_id, db_session=db)
    if not ast_graph:
        ast_graph = doc.ast_graph_json or {}

    if not ast_graph:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Граф AST документа пуст. Сначала выполните генерацию документа.",
        )

    # 2. Compile DOCX via DocxCompiler
    compiler = DocxCompiler(ast=ast_graph)
    docx_bytes = compiler.get_bytes()

    # 3. Ensure local file is saved for caching/S3 reference
    file_path = STORAGE_DIR / f"{doc_id}.docx"
    with open(file_path, "wb") as f:
        f.write(docx_bytes)

    if not doc.file_s3_url:
        doc.file_s3_url = str(file_path)
        await db.commit()

    safe_filename = quote(f"{doc.title}.docx")
    headers = {
        "Content-Disposition": f"attachment; filename*=UTF-8''{safe_filename}"
    }

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers=headers,
    )

