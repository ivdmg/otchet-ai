"""Explicit doubles verify runner mechanics, never live provider acceptance."""
import json
import pytest
from app.prototype import live_ai
from app.prototype.config import cfg
from app.prototype.providers import ProviderError
from .helpers import TestAI


def test_live_ai_checkpoint_resume_and_no_payment_dependency(monkeypatch):
    monkeypatch.setattr(cfg,'YUKASSA_SHOP_ID','')
    monkeypatch.setattr(cfg,'YUKASSA_SECRET_KEY','')
    ai=TestAI()
    original=ai.generate
    failed=[False]
    def interrupted(topic,headings,step):
        if step=='Практическое применение' and not failed[0]:
            failed[0]=True
            raise ProviderError('explicit_test_interruption')
        return original(topic,headings,step)
    ai.generate=interrupted
    with pytest.raises(ProviderError):
        live_ai.run('Обезличенная учебная тема','abstract','resume',ai,sleep=lambda _:None)
    calls_before=list(ai.calls)
    file,manifest=live_ai.run('Обезличенная учебная тема','abstract','resume',ai,sleep=lambda _:None)
    state=json.loads(manifest.read_text(encoding='utf-8'))
    assert state['status']=='completed'
    assert state['scope']=='owner_live_ai_only_not_paid_e2e'
    assert ai.calls.count('plan')==1
    assert ai.calls.count('Теоретические основы')==1
    assert state['usage_reported']>0
    live_ai.verify_docx(file.read_bytes(),state['steps'])
    before=list(ai.calls)
    live_ai.run('Обезличенная учебная тема','abstract','resume',ai,sleep=lambda _:None)
    assert ai.calls==before
    with pytest.raises(ValueError,match='run_input_changed'):
        live_ai.run('Другая обезличенная тема','abstract','resume',ai,sleep=lambda _:None)


def test_live_ai_missing_key_never_calls_provider(monkeypatch):
    monkeypatch.setattr(cfg,'GROQ_API_KEY','')
    ai=TestAI()
    with pytest.raises(ProviderError,match='groq_key_missing'):
        live_ai.run('Обезличенная учебная тема','abstract','missing',ai)
    assert ai.calls==[]
    assert not (cfg.DATA_DIR/'live-ai'/'missing').exists()
