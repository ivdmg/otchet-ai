from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr = Field(..., description="Email пользователя")
    password: str = Field(..., min_length=6, max_length=128, description="Пароль пользователя")


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Email пользователя")
    password: str = Field(..., description="Пароль пользователя")


class Token(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Тип токена")


class TokenPayload(BaseModel):
    sub: Optional[str] = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    balance_credits: int
    role: str
    is_active: bool
    created_at: datetime


# Document Schemas
class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=500, description="Тема документа")
    doc_type: str = Field("coursework", description="Тип документа: coursework | abstract | vkr")


class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=500)
    doc_type: Optional[str] = None
    status: Optional[str] = None
    ast_graph_json: Optional[Dict[str, Any]] = None
    file_s3_url: Optional[str] = None


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    doc_type: str
    status: str
    ast_graph_json: Dict[str, Any]
    file_s3_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# Spot Regeneration Schema
class SpotRegenerateRequest(BaseModel):
    document_id: UUID
    node_id: str = Field(..., description="ID узла AST для перегенерации")
    user_instruction: Optional[str] = Field(None, description="Уточнение пользователя для перегенерации")


# Task Schemas
class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    document_id: UUID
    step_name: str
    status: str
    progress_percent: int
    error_log: Optional[str] = None
    created_at: datetime


# Payment & Transaction Schemas
class PaymentCreate(BaseModel):
    amount_rub: float = Field(..., gt=0, description="Сумма в рублях")
    amount_credits: int = Field(..., gt=0, description="Количество покупаемых кредитов")
    return_url: Optional[str] = Field(None, description="URL возврата после успешной оплаты")


class PaymentSessionRead(BaseModel):
    payment_id: str
    confirmation_url: str
    status: str


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    amount_credits: int
    amount_rub: float
    type: str
    payment_provider_id: Optional[str] = None
    status: str
    created_at: datetime
