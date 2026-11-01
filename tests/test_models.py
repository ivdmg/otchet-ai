import uuid
from app.db.base import Base
from app.models import (
    User, Document, GenerationTask, PromptHistory, Transaction,
    UserRole, DocType, DocStatus, TaskStatus, TransactionType, TransactionStatus
)

def test_models_registered_in_metadata():
    table_names = list(Base.metadata.tables.keys())
    assert "users" in table_names
    assert "documents" in table_names
    assert "generation_tasks" in table_names
    assert "prompts_history" in table_names
    assert "transactions" in table_names

def test_user_model_attributes():
    user = User(
        email="test@example.com",
        password_hash="hashed_pw",
        balance_credits=10,
        role=UserRole.USER,
        is_active=True
    )
    assert user.email == "test@example.com"
    assert user.balance_credits == 10
    assert user.role == UserRole.USER

def test_document_model_attributes():
    user_id = uuid.uuid4()
    doc = Document(
        user_id=user_id,
        title="Тестовая Курсовая",
        doc_type=DocType.COURSEWORK,
        status=DocStatus.DRAFT,
        ast_graph_json={"version": "1.0.0"}
    )
    assert doc.title == "Тестовая Курсовая"
    assert doc.doc_type == DocType.COURSEWORK
    assert doc.status == DocStatus.DRAFT
    assert doc.ast_graph_json == {"version": "1.0.0"}

def test_generation_task_model_attributes():
    doc_id = uuid.uuid4()
    task = GenerationTask(
        document_id=doc_id,
        step_name="outline_generation",
        status=TaskStatus.PENDING,
        progress_percent=0
    )
    assert task.step_name == "outline_generation"
    assert task.status == TaskStatus.PENDING

def test_prompt_history_model_attributes():
    doc_id = uuid.uuid4()
    ph = PromptHistory(
        document_id=doc_id,
        node_id="ch_1",
        prompt_name="outline_generator",
        prompt_used="System prompt...",
        tokens_used=150,
        cost_rub=0.05
    )
    assert ph.node_id == "ch_1"
    assert ph.tokens_used == 150

def test_transaction_model_attributes():
    user_id = uuid.uuid4()
    tx = Transaction(
        user_id=user_id,
        amount_credits=10,
        amount_rub=100.0,
        type=TransactionType.TOPUP,
        status=TransactionStatus.SUCCEEDED
    )
    assert tx.amount_credits == 10
    assert tx.type == TransactionType.TOPUP
    assert tx.status == TransactionStatus.SUCCEEDED
