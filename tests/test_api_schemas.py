import uuid
from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
from app.schemas.api import (
    UserRegister,
    UserLogin,
    UserRead,
    Token,
    DocumentCreate,
    DocumentRead,
    SpotRegenerateRequest,
    TaskRead,
    PaymentCreate,
    TransactionRead,
)
from app.models.user import User
from app.models.document import Document
from app.models.enums import UserRole, DocType, DocStatus

def test_user_register_validation():
    req = UserRegister(email="user@example.com", password="secretpassword")
    assert req.email == "user@example.com"
    assert req.password == "secretpassword"

    with pytest.raises(ValidationError):
        UserRegister(email="invalid-email", password="123")

def test_user_read_from_orm():
    now = datetime.now(timezone.utc)
    user_orm = User(
        id=uuid.uuid4(),
        email="test@domain.com",
        password_hash="hashed",
        balance_credits=15,
        role=UserRole.USER,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    user_dto = UserRead.model_validate(user_orm)
    assert user_dto.id == user_orm.id
    assert user_dto.email == "test@domain.com"
    assert user_dto.balance_credits == 15

def test_document_create_and_read():
    doc_create = DocumentCreate(title="Курсовая по экономике", doc_type="coursework")
    assert doc_create.title == "Курсовая по экономике"

    now = datetime.now(timezone.utc)
    user_id = uuid.uuid4()
    doc_orm = Document(
        id=uuid.uuid4(),
        user_id=user_id,
        title="Курсовая по экономике",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.DRAFT,
        ast_graph_json={"version": "1.0.0"},
        created_at=now,
        updated_at=now,
    )
    doc_dto = DocumentRead.model_validate(doc_orm)
    assert doc_dto.title == "Курсовая по экономике"
    assert doc_dto.user_id == user_id
    assert doc_dto.ast_graph_json == {"version": "1.0.0"}

def test_spot_regenerate_request():
    doc_id = uuid.uuid4()
    req = SpotRegenerateRequest(
        document_id=doc_id,
        node_id="sec_1_paragraph_2",
        user_instruction="Добавь статистику 2024 года"
    )
    assert req.node_id == "sec_1_paragraph_2"
    assert req.user_instruction == "Добавь статистику 2024 года"
