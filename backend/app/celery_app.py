"""Celery application configuration."""

from celery import Celery

from app.config import settings

celery_app = Celery(
    "emb_system",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.email", "app.tasks.reports", "app.tasks.export"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    result_expires=3600,
)
