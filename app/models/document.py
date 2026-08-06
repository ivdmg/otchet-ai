import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import DocType, DocStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.generation_task import GenerationTask
    from app.models.prompt_history import PromptHistory


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    doc_type: Mapped[DocType] = mapped_column(
        SQLEnum(DocType), default=DocType.COURSEWORK, nullable=False
    )
    status: Mapped[DocStatus] = mapped_column(
        SQLEnum(DocStatus), default=DocStatus.DRAFT, nullable=False, index=True
    )
    ast_graph_json: Mapped[Dict[str, Any]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"), default=dict, nullable=False
    )

    file_s3_url: Mapped[Optional[str]] = mapped_column(
        String(1000), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="documents")
    tasks: Mapped[List["GenerationTask"]] = relationship(
        "GenerationTask", back_populates="document", cascade="all, delete-orphan"
    )
    prompts: Mapped[List["PromptHistory"]] = relationship(
        "PromptHistory", back_populates="document", cascade="all, delete-orphan"
    )
