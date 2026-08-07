import json
import logging
from typing import Dict, Any, Optional, Union
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.redis import get_redis_client, get_async_redis_client
from app.models.document import Document

logger = logging.getLogger(__name__)

CHECKPOINT_KEY_TEMPLATE = "doc:{doc_id}:checkpoint"
DEFAULT_CHECKPOINT_TTL = 86400 * 7  # 7 days retention for checkpoints


class CheckpointService:
    @staticmethod
    def _format_key(doc_id: Union[str, UUID]) -> str:
        return CHECKPOINT_KEY_TEMPLATE.format(doc_id=str(doc_id))

    @staticmethod
    def _serialize_ast(ast_data: Union[Dict[str, Any], BaseModel]) -> Dict[str, Any]:
        if isinstance(ast_data, BaseModel):
            return ast_data.model_dump(mode="json", exclude_none=True)
        elif isinstance(ast_data, dict):
            return ast_data
        else:
            raise ValueError(f"Unsupported AST data type: {type(ast_data)}")

    # ------------------------------------------------------------------
    # Synchronous Methods (for Celery workers & sync pipelines)
    # ------------------------------------------------------------------

    @classmethod
    def save_checkpoint_sync(
        cls,
        doc_id: Union[str, UUID],
        ast_data: Union[Dict[str, Any], BaseModel],
        db_session: Optional[Session] = None,
        redis_client: Optional[Any] = None,
        step: Optional[str] = None,
        ttl: int = DEFAULT_CHECKPOINT_TTL,
    ) -> Dict[str, Any]:
        """Saves intermediate AST state to Redis and PostgreSQL (sync)."""
        serialized_ast = cls._serialize_ast(ast_data)
        doc_id_str = str(doc_id)
        key = cls._format_key(doc_id_str)

        # 1. Save to Redis
        try:
            r = redis_client or get_redis_client()
            payload = {
                "doc_id": doc_id_str,
                "step": step,
                "ast_graph": serialized_ast,
            }
            r.set(key, json.dumps(payload, ensure_ascii=False), ex=ttl)
        except Exception as e:
            logger.warning(f"Failed to save AST checkpoint to Redis for doc {doc_id_str}: {e}")

        # 2. Save to PostgreSQL if DB session provided
        if db_session is not None:
            try:
                db_session.execute(
                    update(Document)
                    .where(Document.id == UUID(doc_id_str))
                    .values(ast_graph_json=serialized_ast)
                )
                db_session.commit()
            except Exception as e:
                db_session.rollback()
                logger.error(f"Failed to update AST in Postgres for doc {doc_id_str}: {e}")
                raise e

        return serialized_ast

    @classmethod
    def get_checkpoint_sync(
        cls,
        doc_id: Union[str, UUID],
        db_session: Optional[Session] = None,
        redis_client: Optional[Any] = None,
    ) -> Optional[Dict[str, Any]]:
        """Retrieves AST checkpoint from Redis first, falling back to PostgreSQL."""
        doc_id_str = str(doc_id)
        key = cls._format_key(doc_id_str)

        # 1. Try Redis
        try:
            r = redis_client or get_redis_client()
            data = r.get(key)
            if data:
                payload = json.loads(data)
                return payload.get("ast_graph")
        except Exception as e:
            logger.warning(f"Failed to get AST checkpoint from Redis for doc {doc_id_str}: {e}")

        # 2. Fallback to PostgreSQL
        if db_session is not None:
            doc = db_session.execute(
                select(Document).where(Document.id == UUID(doc_id_str))
            ).scalar_one_or_none()

            if doc and doc.ast_graph_json:
                return doc.ast_graph_json

        return None

    @classmethod
    def clear_checkpoint_sync(
        cls,
        doc_id: Union[str, UUID],
        redis_client: Optional[Any] = None,
    ) -> bool:
        """Removes AST checkpoint from Redis."""
        doc_id_str = str(doc_id)
        key = cls._format_key(doc_id_str)
        try:
            r = redis_client or get_redis_client()
            return bool(r.delete(key))
        except Exception as e:
            logger.warning(f"Failed to delete AST checkpoint from Redis for doc {doc_id_str}: {e}")
            return False

    # ------------------------------------------------------------------
    # Asynchronous Methods (for FastAPI async endpoints)
    # ------------------------------------------------------------------

    @classmethod
    async def save_checkpoint_async(
        cls,
        doc_id: Union[str, UUID],
        ast_data: Union[Dict[str, Any], BaseModel],
        db_session: Optional[AsyncSession] = None,
        redis_client: Optional[Any] = None,
        step: Optional[str] = None,
        ttl: int = DEFAULT_CHECKPOINT_TTL,
    ) -> Dict[str, Any]:
        """Saves intermediate AST state to Redis and PostgreSQL (async)."""
        serialized_ast = cls._serialize_ast(ast_data)
        doc_id_str = str(doc_id)
        key = cls._format_key(doc_id_str)

        # 1. Save to Redis
        try:
            r = redis_client or get_async_redis_client()
            payload = {
                "doc_id": doc_id_str,
                "step": step,
                "ast_graph": serialized_ast,
            }
            await r.set(key, json.dumps(payload, ensure_ascii=False), ex=ttl)
        except Exception as e:
            logger.warning(f"Failed to save AST checkpoint to Redis (async) for doc {doc_id_str}: {e}")

        # 2. Save to PostgreSQL if AsyncSession provided
        if db_session is not None:
            try:
                await db_session.execute(
                    update(Document)
                    .where(Document.id == UUID(doc_id_str))
                    .values(ast_graph_json=serialized_ast)
                )
                await db_session.commit()
            except Exception as e:
                await db_session.rollback()
                logger.error(f"Failed to update AST in Postgres (async) for doc {doc_id_str}: {e}")
                raise e

        return serialized_ast

    @classmethod
    async def get_checkpoint_async(
        cls,
        doc_id: Union[str, UUID],
        db_session: Optional[AsyncSession] = None,
        redis_client: Optional[Any] = None,
    ) -> Optional[Dict[str, Any]]:
        """Retrieves AST checkpoint (async) from Redis first, falling back to PostgreSQL."""
        doc_id_str = str(doc_id)
        key = cls._format_key(doc_id_str)

        # 1. Try Redis
        try:
            r = redis_client or get_async_redis_client()
            data = await r.get(key)
            if data:
                payload = json.loads(data)
                return payload.get("ast_graph")
        except Exception as e:
            logger.warning(f"Failed to get AST checkpoint from Redis (async) for doc {doc_id_str}: {e}")

        # 2. Fallback to PostgreSQL
        if db_session is not None:
            result = await db_session.execute(
                select(Document).where(Document.id == UUID(doc_id_str))
            )
            doc = result.scalar_one_or_none()
            if doc and doc.ast_graph_json:
                return doc.ast_graph_json

        return None

    @classmethod
    async def clear_checkpoint_async(
        cls,
        doc_id: Union[str, UUID],
        redis_client: Optional[Any] = None,
    ) -> bool:
        """Removes AST checkpoint from Redis (async)."""
        doc_id_str = str(doc_id)
        key = cls._format_key(doc_id_str)
        try:
            r = redis_client or get_async_redis_client()
            res = await r.delete(key)
            return bool(res)
        except Exception as e:
            logger.warning(f"Failed to delete AST checkpoint from Redis (async) for doc {doc_id_str}: {e}")
            return False
