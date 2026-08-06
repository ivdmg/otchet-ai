import os
from alembic.config import Config
from app.db.base_class import Base
from app.db.session import engine, AsyncSessionLocal

def test_alembic_config_exists():
    config_path = "alembic.ini"
    assert os.path.exists(config_path), "alembic.ini must exist"
    alembic_cfg = Config(config_path)
    assert alembic_cfg.get_main_option("script_location") == "alembic"

def test_base_metadata():
    assert Base.metadata is not None

def test_db_session_instantiation():
    assert engine is not None
    assert AsyncSessionLocal is not None
