"""Background report tasks for the GC console."""

import csv
import tempfile
from typing import Any

from app.celery_app import celery_app

WORKER_COLUMNS = ("worker_ref", "name", "company", "job_role", "status", "zones_permitted")


@celery_app.task(bind=True, max_retries=3)  # type: ignore[untyped-decorator]
def export_workers_csv(self: Any, rows: list[dict[str, str]]) -> str:
    """Write a CSV of worker records and log where it landed.

    The design's toast promises the CSV is "emailed when ready"; this POC stops at
    the file, which is the part a delivery integration would attach.
    """
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".csv", prefix="gc-workers-", delete=False, newline=""
    ) as handle:
        writer = csv.DictWriter(handle, fieldnames=WORKER_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)
        path = handle.name
    print(f"[REPORT] Worker export of {len(rows)} records written to {path}")
    return path
