import time
import uuid
from sqlalchemy import (BigInteger, Boolean, CheckConstraint, ForeignKey, Integer,
                        JSON, LargeBinary, String, Text, UniqueConstraint, create_engine)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from .config import cfg


def uid():
    return str(uuid.uuid4())


def now():
    return int(time.time())


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "gd_users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    profile_data: Mapped[dict] = mapped_column(JSON, default=dict)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    password: Mapped[str] = mapped_column(Text)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    referral_code: Mapped[str] = mapped_column(String(64), unique=True, default=uid)
    created: Mapped[int] = mapped_column(BigInteger, default=now)


class Session(Base):
    __tablename__ = "gd_sessions"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)  # SHA256 token
    user_id: Mapped[str] = mapped_column(ForeignKey("gd_users.id"), index=True)
    csrf: Mapped[str] = mapped_column(String(64))
    expires: Mapped[int] = mapped_column(BigInteger)


class AuthToken(Base):
    __tablename__ = "gd_auth_tokens"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("gd_users.id"))
    kind: Mapped[str] = mapped_column(String(16))
    expires: Mapped[int] = mapped_column(BigInteger)
    used: Mapped[bool] = mapped_column(Boolean, default=False)


class Document(Base):
    __tablename__ = "gd_documents"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey("gd_users.id"), index=True)
    topic: Mapped[str] = mapped_column(String(400))
    doc_type: Mapped[str] = mapped_column(String(20))
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    title_data: Mapped[dict] = mapped_column(JSON, default=dict)
    plan_regenerations: Mapped[int] = mapped_column(Integer, default=0)
    plan_revision: Mapped[int] = mapped_column(Integer, default=0)
    approval_hash: Mapped[str | None] = mapped_column(String(64))
    actual_pages: Mapped[int | None] = mapped_column(Integer)
    delivery_id: Mapped[str | None] = mapped_column(String(36), unique=True)
    pdf_path: Mapped[str | None] = mapped_column(Text)
    pdf_hash: Mapped[str | None] = mapped_column(String(64))
    state: Mapped[str] = mapped_column(String(32), default="planning")
    plan: Mapped[dict | None] = mapped_column(JSON)
    approved_plan: Mapped[dict | None] = mapped_column(JSON)
    created: Mapped[int] = mapped_column(BigInteger, default=now)
    expires: Mapped[int | None] = mapped_column(BigInteger)
    file_path: Mapped[str | None] = mapped_column(Text)
    file_bytes: Mapped[bytes | None] = mapped_column(LargeBinary)
    file_hash: Mapped[str | None] = mapped_column(String(64))


class Order(Base):
    __tablename__ = "gd_orders"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    document_id: Mapped[str] = mapped_column(ForeignKey("gd_documents.id"), unique=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("gd_users.id"), index=True)
    method: Mapped[str] = mapped_column(String(8))
    ai_budget: Mapped[int] = mapped_column(Integer, default=lambda: cfg.JOB_BUDGET)
    model: Mapped[str] = mapped_column(String(80), default=lambda: cfg.ai_model)
    amount: Mapped[int] = mapped_column(Integer, default=30000)
    state: Mapped[str] = mapped_column(String(32), default="checking_payment")
    payment_id: Mapped[str | None] = mapped_column(String(64), unique=True)
    checkout_url: Mapped[str | None] = mapped_column(Text)
    refunded: Mapped[int] = mapped_column(Integer, default=0)
    receipt_status: Mapped[str | None] = mapped_column(String(32))
    created: Mapped[int] = mapped_column(BigInteger, default=now)
    __table_args__ = (CheckConstraint("amount > 0 AND refunded >= 0 AND refunded <= amount", name="gd_orders_check"),
                      CheckConstraint("method IN ('cash','bonus')", name="gd_orders_method_check"),)


class Job(Base):
    __tablename__ = "gd_jobs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    document_id: Mapped[str] = mapped_column(ForeignKey("gd_documents.id"), index=True)
    order_id: Mapped[str | None] = mapped_column(ForeignKey("gd_orders.id"), unique=True)
    kind: Mapped[str] = mapped_column(String(12))
    model: Mapped[str] = mapped_column(String(80), default=lambda: cfg.ai_model)
    state: Mapped[str] = mapped_column(String(24), default="queued")
    stage: Mapped[str] = mapped_column(String(80), default="queued")
    steps: Mapped[dict] = mapped_column(JSON, default=dict)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    units: Mapped[list] = mapped_column(JSON, default=list)
    heartbeat: Mapped[int | None] = mapped_column(BigInteger)
    retry_at: Mapped[int] = mapped_column(BigInteger, default=0)
    lease_until: Mapped[int] = mapped_column(BigInteger, default=0)
    attempt_token: Mapped[str | None] = mapped_column(String(36))
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    manual_retries: Mapped[int] = mapped_column(Integer, default=0)
    error: Mapped[str | None] = mapped_column(String(64))
    budget: Mapped[int] = mapped_column(Integer, default=24000)
    charged: Mapped[int] = mapped_column(Integer, default=0)
    usage: Mapped[int] = mapped_column(Integer, default=0)
    created: Mapped[int] = mapped_column(BigInteger, default=now)
    __table_args__ = (UniqueConstraint("document_id", "kind"),
                     CheckConstraint("charged >= 0 AND charged <= budget", name="gd_jobs_check"),)


class Attribution(Base):
    __tablename__ = "gd_referral_attributions"
    invited: Mapped[str] = mapped_column(ForeignKey("gd_users.id"), primary_key=True)
    inviter: Mapped[str] = mapped_column(ForeignKey("gd_users.id"), index=True)
    standard_price: Mapped[int] = mapped_column(Integer, default=30000)
    terms: Mapped[str] = mapped_column(String(32), default="sandbox-v1")
    __table_args__ = (CheckConstraint("invited <> inviter", name="gd_referral_attributions_check"),)


class Reward(Base):
    __tablename__ = "gd_referral_rewards"
    invited: Mapped[str] = mapped_column(ForeignKey("gd_users.id"), primary_key=True)
    inviter: Mapped[str] = mapped_column(ForeignKey("gd_users.id"), index=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("gd_orders.id"))
    amount: Mapped[int] = mapped_column(Integer)
    state: Mapped[str] = mapped_column(String(16), default="pending")
    matures: Mapped[int] = mapped_column(BigInteger)
    __table_args__ = (CheckConstraint("amount >= 0", name="gd_referral_rewards_amount_check"),)


class BonusAccount(Base):
    __tablename__ = "gd_bonus_accounts"
    user_id: Mapped[str] = mapped_column(ForeignKey("gd_users.id"), primary_key=True)
    available: Mapped[int] = mapped_column(Integer, default=0)
    reserved: Mapped[int] = mapped_column(Integer, default=0)
    debt: Mapped[int] = mapped_column(Integer, default=0)
    __table_args__ = (CheckConstraint("available >= 0 AND reserved >= 0 AND debt >= 0", name="gd_bonus_accounts_check"),)


class BonusEntry(Base):
    __tablename__ = "gd_bonus_entries"
    operation_id: Mapped[str] = mapped_column(String(160), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("gd_users.id"), index=True)
    order_id: Mapped[str | None] = mapped_column(ForeignKey("gd_orders.id"))
    kind: Mapped[str] = mapped_column(String(24))
    amount: Mapped[int] = mapped_column(Integer)
    available_delta: Mapped[int] = mapped_column(Integer)
    reserved_delta: Mapped[int] = mapped_column(Integer)
    debt_delta: Mapped[int] = mapped_column(Integer)
    created: Mapped[int] = mapped_column(BigInteger, default=now)


class PaymentEvent(Base):
    __tablename__ = "gd_payment_events"
    id: Mapped[str] = mapped_column(String(160), primary_key=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("gd_orders.id"))
    created: Mapped[int] = mapped_column(BigInteger, default=now)


class Refund(Base):
    __tablename__ = "gd_refunds"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    operation_id: Mapped[str] = mapped_column(String(160), unique=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("gd_orders.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    provider_id: Mapped[str | None] = mapped_column(String(64), unique=True)
    state: Mapped[str] = mapped_column(String(32), default="pending")
    retry_at: Mapped[int] = mapped_column(BigInteger, default=0)
    error: Mapped[str | None] = mapped_column(String(64))
    created: Mapped[int] = mapped_column(BigInteger, default=now)


class Counter(Base):
    __tablename__ = "gd_counters"
    key: Mapped[str] = mapped_column(String(160), primary_key=True)
    value: Mapped[int] = mapped_column(Integer, default=0)


engine = create_engine(cfg.DATABASE_URL, pool_pre_ping=True)
DB = sessionmaker(engine, expire_on_commit=False)
