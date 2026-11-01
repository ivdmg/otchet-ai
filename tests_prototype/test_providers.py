import json
import httpx
import pytest
from app.prototype.providers import Groq, YooKassa, ProviderError, retry_after


def test_groq_wire_and_json_no_personal_fields():
    def respond(request):
        assert request.url == 'https://api.groq.com/openai/v1/chat/completions'
        body = json.loads(request.content)
        assert body['max_completion_tokens'] <= 1200
        assert 'email' not in request.content.decode()
        assert 'author_name' not in request.content.decode()
        return httpx.Response(200,json={'choices':[{'finish_reason':'stop','message':{'content':json.dumps({'sections':['Теория','Практика']})}}], 'usage':{'total_tokens':200}})
    result,usage = Groq(httpx.MockTransport(respond)).generate('Учебная тема',[],'plan')
    assert usage == 200 and len(result['sections']) == 2


@pytest.mark.parametrize('status,code,retryable',[(429,'ai_rate_limit',True),(503,'ai_unavailable',True),(401,'ai_auth',False),(400,'ai_request_rejected',False)])
def test_groq_safe_errors(status,code,retryable):
    def respond(r):
        return httpx.Response(status,headers={'retry-after':'90'},text='private-provider-body')
    with pytest.raises(ProviderError) as e:
        Groq(httpx.MockTransport(respond)).generate('Тема',[],'plan')
    assert e.value.code == code and e.value.retryable == retryable
    assert 'private-provider-body' not in str(e.value)
    if status == 429:
        assert e.value.retry_after == 90


def test_timeout_invalid_truncation_and_retry_header():
    def timeout(r):
        raise httpx.ReadTimeout('private request body')
    with pytest.raises(ProviderError,match='ai_timeout'):
        Groq(httpx.MockTransport(timeout)).generate('Тема',[],'plan')
    def truncated(r):
        return httpx.Response(200,json={'choices':[{'finish_reason':'length','message':{'content':'{}'}}],'usage':{'total_tokens':100}})
    with pytest.raises(ProviderError,match='ai_invalid_response'):
        Groq(httpx.MockTransport(truncated)).generate('Тема',[],'plan')
    assert retry_after('not-a-date') == 60
    assert retry_after('1.2') == 2


def test_yukassa_real_protocol_and_block_live_credentials(monkeypatch):
    from app.prototype.config import cfg
    from app.prototype.models import Order
    seen = []
    def respond(request):
        seen.append(request)
        assert request.headers['authorization'].startswith('Basic ')
        assert request.headers['idempotence-key'] == 'stable-order-id'
        b = json.loads(request.content)
        assert b['amount'] == {'value':'300.00','currency':'RUB'}
        assert b['capture'] is True
        return httpx.Response(200,json={'id':'provider-id'})
    gateway = YooKassa(httpx.MockTransport(respond))
    o = Order(id='stable-order-id',amount=30000)
    gateway.create(o)
    gateway.create(o)
    assert len(seen) == 2
    monkeypatch.setattr(cfg,'YUKASSA_SECRET_KEY','live_forbidden')
    with pytest.raises(ProviderError,match='test_credentials_required'):
        gateway.create(o)
