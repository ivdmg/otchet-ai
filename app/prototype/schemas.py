from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator
import re


class Input(BaseModel):
    model_config = ConfigDict(extra='forbid')


class Credentials(Input):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class Register(Credentials):
    referral_code: str | None = Field(None, max_length=64)


class TokenInput(Input):
    token: str = Field(min_length=20, max_length=128)


class Reset(TokenInput):
    password: str = Field(min_length=12, max_length=128)


class EmailInput(Input):
    email: EmailStr


def safe_text(v):
    if any(ord(x) < 32 for x in v) or re.search(r'@|https?://|\+?\d[\d ()-]{8,}\d', v):
        raise ValueError('Only anonymized educational topics; no contacts, URLs or control characters')
    return v.strip()


class Draft(Input):
    topic: str = Field(min_length=8, max_length=400)
    doc_type: Literal['abstract', 'coursework', 'vkr'] = 'abstract'
    anonymized: Literal[True]
    pages: int = Field(default=10, ge=1, strict=True)
    chapters: int = Field(default=2, ge=2, le=3, strict=True)
    subject: str = Field(default='', max_length=200)
    notes: str = Field(default='', max_length=4000)
    input_version: str = 'personal-2026-11-v2'
    _safe = field_validator('topic')(safe_text)

    @model_validator(mode='after')
    def valid_volume(self):
        from .catalog import CATALOG, VERSION
        if self.pages > CATALOG[self.doc_type]['max_pages'] or self.input_version != VERSION:
            raise ValueError('invalid_catalog_volume_or_version')
        return self


class Chapter(Input):
    title: str = Field(min_length=3, max_length=160)
    sections: list[str] = Field(min_length=1, max_length=4)
    _safe = field_validator('title')(safe_text)


class Plan(Input):
    chapters: list[Chapter] = Field(min_length=2, max_length=3)

    @model_validator(mode='after')
    def check(self):
        headings = [s for c in self.chapters for s in c.sections]
        if any(not 3 <= len(s.strip()) <= 160 for s in headings) or len(set(headings)) != len(headings):
            raise ValueError('invalid_or_duplicate_headings')
        for s in headings: safe_text(s)
        return self


class Buy(Input):
    method: Literal['cash', 'bonus']
    approval_hash: str = Field(min_length=64, max_length=64)
