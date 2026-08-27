"""Synchronous email service using smtplib."""

from email.message import EmailMessage
from smtplib import SMTP

from app.config import settings


def send_email(to_email: str, subject: str, body: str, html_body: str | None = None) -> None:
    """Send an email via SMTP (Mailtrap in dev)."""
    if not settings.smtp_username or not settings.smtp_password:
        # Log and skip if SMTP is not configured (e.g. local dev without Mailtrap).
        print(f"[EMAIL] SMTP not configured. Would send to {to_email}: {subject}\n{body}")
        return

    message = EmailMessage()
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

    with SMTP(settings.smtp_host, settings.smtp_port) as server:
        if settings.smtp_starttls:
            server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(message)
