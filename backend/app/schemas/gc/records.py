"""Payload shapes for the reports and export endpoints."""

from pydantic import BaseModel


class ReportScheduleCreate(BaseModel):
    """A new standing report: what it is, when it runs, and who receives it."""

    name: str
    cadence: str
    formats: str = "CSV"
    recipients: str = ""
