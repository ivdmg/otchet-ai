from sqlalchemy import select
from app.prototype.models import DB, BonusAccount, Session, User
from app.prototype.config import cfg
from .helpers import signup, PASSWORD, approved


def test_private_auth_csrf_reset_owner(client):
    assert client.get('/api/v1/catalog',headers={'X-Prototype-Key':'wrong'}).status_code == 403
    assert client.get('/api/v1/catalog').json()['mode'] == 'sandbox'
    assert client.post('/api/v1/quote',json={'topic':'Обезличенная учебная тема','doc_type':'abstract','anonymized':True}).json()['price_kopecks'] == 19900
    assert client.get('/api/v1/documents').status_code == 401
    assert client.get('/api/v1/referrals').status_code == 401
    assert client.post('/api/v1/quote',headers={'Origin':'https://evil.example'},json={'topic':'Обезличенная учебная тема','doc_type':'abstract','anonymized':True}).status_code == 403
    a = signup(client)
    assert client.get('/api/v1/auth/me').json()['user']['id'] == a['id']
    assert client.post('/api/v1/auth/logout',headers={'X-CSRF-Token':'bad'}).status_code == 403
    assert client.post('/api/v1/auth/logout',headers={'Origin':'https://evil.example'}).status_code == 403
    id = approved(client)
    b = signup(client,'second@example.org')
    assert client.get(f'/api/v1/documents/{id}').status_code == 404
    assert client.get(f'/api/v1/documents/{id}/download').status_code == 404
    assert client.post(f'/api/v1/documents/{id}/approve').status_code == 404
    assert client.get('/api/v1/documents').json()['items'] == []
    with DB() as db:
        account = db.get(BonusAccount,b['id'])
        assert (account.available,account.reserved,account.debt) == (0,0,0)
    assert client.post('/api/v1/auth/reset-request',json={'email':b['email']}).status_code == 200
    token = (cfg.DATA_DIR/'mail'/f"{b['id']}-reset.txt").read_text()
    new_password = PASSWORD+'new'
    assert client.post('/api/v1/auth/reset',json={'token':token,'password':new_password}).status_code == 200
    assert client.get('/api/v1/auth/me').status_code == 401
    assert client.post('/api/v1/auth/reset',json={'token':token,'password':new_password}).status_code == 400
    assert client.post('/api/v1/auth/login',json={'email':b['email'],'password':PASSWORD}).status_code == 401
    r = client.post('/api/v1/auth/login',json={'email':b['email'],'password':new_password})
    assert r.status_code == 200
    client.headers['X-CSRF-Token'] = r.json()['csrf_token']
    assert client.post('/api/v1/auth/logout').status_code == 200
    assert client.get('/api/v1/auth/me').status_code == 401


def test_mail_verification_and_rate_limit(client):
    r = client.post('/api/v1/auth/register',json={'email':'unverified@example.org','password':PASSWORD})
    assert r.status_code == 201
    assert 'token' not in r.json()
    assert client.post('/api/v1/auth/login',json={'email':'unverified@example.org','password':PASSWORD}).status_code == 403
    for _ in range(21):
        r = client.post('/api/v1/auth/login',json={'email':'unknown@example.org','password':PASSWORD})
    assert r.status_code == 429


def test_legacy_paths_not_exposed(client):
    signup(client)
    for path in ['/api/v1/payments/topup','/api/v1/documents/example/regenerate','/api/v1/ws/example','/api/v1/documents/example/events']:
        assert client.get(path).status_code in (404,405)


def test_first_referral_cookie_and_draft_archive(client):
    a = signup(client)
    b = signup(client,'inviter-b@example.org')
    assert client.get('/api/v1/referrals/capture/'+a['referral_code']).status_code == 200
    assert client.get('/api/v1/referrals/capture/'+b['referral_code']).status_code == 200
    new_user = signup(client,'invited@example.org',b['referral_code'])
    from app.prototype.models import Attribution
    with DB() as db:
        assert db.get(Attribution,new_user['id']).inviter == a['id']
    id = approved(client)
    assert client.delete('/api/v1/documents/'+id).status_code == 200
    assert client.post(f'/api/v1/documents/{id}/approve').status_code == 409
    assert client.get('/api/v1/documents/'+id).json()['state'] == 'archived'
