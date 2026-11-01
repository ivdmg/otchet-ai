from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "ai_gostdoc",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    result_expires=86400,
)

celery_app.autodiscover_tasks(["app.tasks"])
