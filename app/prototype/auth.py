import hashlib
import hmac
import secrets
from fastapi import Depends, HTTPException, Request
from .config import cfg
from .models import DB, Session, User, AuthToken, now


def digest(s):
    return hashlib.sha256(s.encode()).hexdigest()


def password_hash(password):
    salt = secrets.token_hex(16)
    return salt + ':' + hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1).hex()


def password_ok(password, encoded):
    salt, expected = encoded.split(':')
    return hmac.compare_digest(hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1).hex(), expected)


def get_db():
    with DB() as db:
        yield db


def current_user(request: Request, db=Depends(get_db)):
    token = request.cookies.get('gd_session', '')
    session = db.get(Session, digest(token))
    if not session or session.expires <= now():
        raise HTTPException(401, 'authentication_required')
    if request.method not in ('GET', 'HEAD', 'OPTIONS'):
        if not hmac.compare_digest(request.headers.get('X-CSRF-Token', ''), session.csrf):
            raise HTTPException(403, 'csrf_required')
    user = db.get(User, session.user_id)
    if not user or not user.verified:
        raise HTTPException(403, 'email_verification_required')
    request.state.session = session
    return user


def issue_token(db, user, kind):
    token = secrets.token_urlsafe(32)
    db.add(AuthToken(id=digest(token), user_id=user.id, kind=kind, expires=now()+3600))
    folder = cfg.DATA_DIR / 'mail'
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f'{user.id}-{kind}.txt').write_text(token, encoding='utf-8')


def owned(db, model, id, user):
    obj = db.get(model, id)
    if not obj or obj.user_id != user.id:
        raise HTTPException(404, 'not_found')
    return obj
