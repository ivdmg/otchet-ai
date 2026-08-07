import pytest
from app.core.celery_app import celery_app
from app.tasks.celery_init import ping_celery_task, check_celery_broker_connection
from app.core.config import settings


def test_celery_app_configuration():
    """Verify Celery app configuration settings."""
    assert celery_app.main == "ai_gostdoc"
    assert celery_app.conf.broker_url == settings.CELERY_BROKER_URL
    assert celery_app.conf.result_backend == settings.CELERY_RESULT_BACKEND
    assert celery_app.conf.task_serializer == "json"
    assert celery_app.conf.result_serializer == "json"


def test_ping_celery_task_eager():
    """Verify execution of ping_celery_task in task_always_eager mode."""
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True

    try:
        result = ping_celery_task.delay()
        assert result.successful()
        val = result.get()
        assert val["status"] == "ok"
        assert val["message"] == "Celery worker is operational"
    finally:
        celery_app.conf.task_always_eager = False
        celery_app.conf.task_eager_propagates = False
