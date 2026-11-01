from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
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
    _safe = field_validator('topic')(safe_text)


class Plan(Input):
    sections: list[str] = Field(min_length=2, max_length=6)

    @field_validator('sections')
    @classmethod
    def check(cls, sections):
        if len(set(sections)) != len(sections):
            raise ValueError('Duplicate headings')
        if any(not 3 <= len(x.strip()) <= 160 for x in sections):
            raise ValueError('Heading length: 3..160')
        return [safe_text(x) for x in sections]


class Buy(Input):
    method: Literal['cash', 'bonus']
