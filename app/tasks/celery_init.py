from typing import Dict, Any
from app.core.celery_app import celery_app


@celery_app.task(name="app.tasks.celery_init.ping_celery_task")
def ping_celery_task() -> Dict[str, Any]:
    """Health check task for Celery worker verification."""
    return {"status": "ok", "message": "Celery worker is operational"}


def check_celery_broker_connection() -> bool:
    """Utility to test connection to Celery broker/Redis."""
    try:
        with celery_app.connection_or_acquire() as conn:
            conn.default_channel.connection.ping()
        return True
    except Exception:
        return False
