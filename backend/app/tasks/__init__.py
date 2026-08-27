"""Celery tasks."""

from app.tasks.email import send_welcome_email

__all__ = ["send_welcome_email"]
