"""Current checkout-to-download contract: explicit AI double, real Word/PDF converter."""
from app.prototype.config import cfg
from app.prototype.worker import run_one
from .helpers import signup, TestAI
from .test_studio_v2 import approved


def test_mock_checkout_real_word_pdf_and_owner_download(client, monkeypatch):
    signup(client)
    monkeypatch.setattr(cfg, 'MOCK_PAYMENTS', True)
    document_id, signature = approved(client)
    order = client.post(f'/api/v1/documents/{document_id}/orders', json={'method':'cash','approval_hash':signature})
    assert order.status_code == 202 and order.json()['cash_charged'] is False
    for _ in range(20):
        if not run_one(TestAI()): break
    snapshot = client.get(f'/api/v1/documents/{document_id}').json()
    assert snapshot['state'] == 'completed', snapshot
    job = next(j for j in snapshot['jobs'] if j['kind'] == 'document')
    assert job['percent'] == 100
    delivery_id = snapshot['delivery_id']
    word = client.get(f'/api/v1/deliveries/{delivery_id}/docx')
    pdf = client.get(f'/api/v1/deliveries/{delivery_id}/pdf')
    assert word.status_code == 200 and word.content.startswith(b'PK')
    assert pdf.status_code == 200 and pdf.content.startswith(b'%PDF')
    assert snapshot['actual_pages'] > 0
    assert client.get('/api/v1/referrals').json()['available'] == 995
    signup(client, 'other-delivery@example.org')
    assert client.get(f'/api/v1/deliveries/{delivery_id}/pdf').status_code == 404
