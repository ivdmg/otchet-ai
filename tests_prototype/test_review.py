import subprocess
import sys
from app.prototype.models import DB, BonusAccount, Reward, now
from app.prototype import bonus
from .helpers import signup, TestGateway
from .test_payments_bonus import qualifying


def test_pending_manual_review_prevents_maturation(client):
    owner = signup(client)
    invited,_,_ = qualifying(client,'review@example.org',owner['referral_code'],TestGateway())
    command = [sys.executable,'-m','app.prototype.manage','reward-review','--invited-user',invited['id']]
    subprocess.run(command+['--decision','hold','--operation-id','hold-1'],check=True)
    with DB.begin() as db:
        bonus.mature(db,clock=now()+15*86400)
        assert db.get(BonusAccount,owner['id']).available == 0
        assert db.get(Reward,invited['id']).state == 'held'
    subprocess.run(command+['--decision','release','--operation-id','release-1'],check=True)
    with DB.begin() as db:
        bonus.mature(db,clock=now()+15*86400)
        assert db.get(BonusAccount,owner['id']).available == 6000
