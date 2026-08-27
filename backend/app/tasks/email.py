"""Background email tasks."""

from typing import Any

from app.celery_app import celery_app
from app.services.email import send_email


@celery_app.task(bind=True, max_retries=3)  # type: ignore[untyped-decorator]
def send_welcome_email(self: Any, to_email: str) -> str:
    """Send a welcome email to a newly registered user."""
    try:
        send_email(
            to_email=to_email,
            subject="Welcome to emb-system!",
            body=(
                "Thanks for signing up. We're excited to have you on board.\n\n"
                "- The emb-system team"
            ),
            html_body=(
                "<html><body>"
                "<h1>Welcome to emb-system!</h1>"
                "<p>Thanks for signing up. We're excited to have you on board.</p>"
                "<p>- The emb-system team</p>"
                "</body></html>"
            ),
        )
    except Exception as exc:
        # Retry with exponential backoff.
        raise self.retry(exc=exc, countdown=2 ** self.request.retries * 60) from exc
    return f"Welcome email sent to {to_email}"
