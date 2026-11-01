"""Real HTTP adapters. Never fall back to sample text or a fake payment."""
import json
import math
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import httpx
from .config import cfg


class ProviderError(Exception):
    def __init__(self, code, retryable=False, retry_after=0):
        self.code, self.retryable, self.retry_after = code, retryable, retry_after
        super().__init__(code)


def retry_after(value):
    try:
        return max(1, math.ceil(float(value)))
    except (ValueError, TypeError):
        try:
            return max(1, math.ceil((parsedate_to_datetime(value)-datetime.now(timezone.utc)).total_seconds()))
        except (ValueError, TypeError, OverflowError):
            return 60


class Groq:
    def __init__(self, transport=None, model=None):
        self.transport = transport
        self.model = model or cfg.GROQ_MODEL

    def generate(self, topic, headings, step):
        if not cfg.GROQ_API_KEY:
            raise ProviderError('groq_key_missing')
        # No email, name, account, title-page or payment fields cross this boundary.
        if step == 'plan':
            instruction = 'Составь план учебного текста. Верни JSON {"sections":["заголовок",...]}, от 2 до 4 разделов.'
            output = 700
        else:
            instruction = ('Напиши содержательный раздел на русском, 3–5 абзацев, без Markdown. '
                           'Не придумывай статистику, источники, DOI и цитаты. '
                           'Верни JSON {"paragraphs":["текст",...],"table":null}. '
                           'При необходимости table={"headers":[...],"rows":[[...]],"caption":"..."}. '
                           'Для списка литературы указывай только известные реальные источники и явно отметь, '
                           'что библиографические сведения требуют ручной проверки; не утверждай проверку URL. '
                           f'Текущий раздел: {step}. Утверждённый план: {json.dumps(headings, ensure_ascii=False)}')
            output = 1200
        try:
            with httpx.Client(timeout=httpx.Timeout(55, connect=10), transport=self.transport) as c:
                r = c.post('https://api.groq.com/openai/v1/chat/completions',
                           headers={'Authorization': 'Bearer '+cfg.GROQ_API_KEY},
                           json={'model': self.model, 'temperature': 0.2, 'max_completion_tokens': output,
                                 'response_format': {'type':'json_object'},
                                 'messages':[{'role':'system','content':instruction},
                                             {'role':'user','content':json.dumps({'topic':topic}, ensure_ascii=False)}]})
        except httpx.RequestError:
            raise ProviderError('ai_timeout', True, 30) from None
        if r.status_code == 429:
            raise ProviderError('ai_rate_limit', True, retry_after(r.headers.get('retry-after')))
        if r.status_code >= 500:
            raise ProviderError('ai_unavailable', True, 30)
        if r.status_code != 200:
            raise ProviderError('ai_auth' if r.status_code in (401,403) else 'ai_request_rejected')
        try:
            data = r.json()
            if data['choices'][0].get('finish_reason') != 'stop':
                raise ValueError('truncated')
            result = json.loads(data['choices'][0]['message']['content'])
            usage = int(data['usage']['total_tokens'])
            if not 0 < usage <= 3500:
                raise ValueError('usage')
            return result, usage
        except (KeyError, ValueError, TypeError, IndexError):
            raise ProviderError('ai_invalid_response', True, 15) from None


def amount_string(cents):
    return f'{cents//100}.{cents%100:02}'


class YooKassa:
    def __init__(self, transport=None):
        self.transport = transport

    def call(self, method, path, body=None, key=None):
        if not cfg.YUKASSA_SHOP_ID or not cfg.YUKASSA_SECRET_KEY.startswith('test_'):
            raise ProviderError('yukassa_test_credentials_required')
        try:
            with httpx.Client(timeout=20, transport=self.transport,
                              auth=(cfg.YUKASSA_SHOP_ID, cfg.YUKASSA_SECRET_KEY)) as c:
                r = c.request(method, 'https://api.yookassa.ru/v3/'+path, json=body,
                              headers={'Idempotence-Key': key} if key else {})
        except httpx.RequestError:
            raise ProviderError('payment_unknown', True, 30) from None
        if r.status_code == 429 or r.status_code >= 500:
            raise ProviderError('payment_unavailable', True, retry_after(r.headers.get('retry-after')))
        if r.status_code not in (200,201):
            raise ProviderError('payment_rejected')
        try:
            return r.json()
        except ValueError:
            raise ProviderError('payment_invalid_response', True, 30) from None

    def create(self, order):
        return self.call('POST','payments', {
            'amount':{'value':amount_string(order.amount),'currency':'RUB'}, 'capture':True,
            'confirmation':{'type':'redirect','return_url':cfg.RETURN_URL},
            'description':'AI GostDoc personal sandbox', 'metadata':{'order_id':order.id}}, order.id)

    def payment(self, payment_id):
        if not re.fullmatch(r'[a-zA-Z0-9-]{1,64}', payment_id):
            raise ProviderError('invalid_payment_id')
        return self.call('GET','payments/'+payment_id)

    def refund(self, refund, order):
        if refund.provider_id:
            return self.call('GET','refunds/'+refund.provider_id)
        return self.call('POST','refunds', {'payment_id':order.payment_id,
                         'amount':{'value':amount_string(refund.amount),'currency':'RUB'}}, refund.id)

    def get_refund(self, id):
        if not re.fullmatch(r'[a-zA-Z0-9-]{1,64}', id):
            raise ProviderError('invalid_refund_id')
        return self.call('GET','refunds/'+id)

    def validate_payment(self, p, order):
        if (p.get('id') != order.payment_id or p.get('test') is not True
            or p.get('recipient',{}).get('account_id') != cfg.YUKASSA_SHOP_ID
            or p.get('metadata',{}).get('order_id') != order.id
            or p.get('amount') != {'value':amount_string(order.amount),'currency':'RUB'}):
            raise ProviderError('payment_verification_failed')
