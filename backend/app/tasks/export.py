"""Background CSV exports for the GC console."""

import csv
import os
import tempfile
from typing import Any

from app.celery_app import celery_app


@celery_app.task()  # type: ignore[untyped-decorator]
def export_csv(name: str, header: list[str], rows: list[list[Any]]) -> str:
    """Write an extract to a CSV file and log where it landed.

    The router does the filtering and hands the finished rows over, so the worker
    needs no database session of its own.

    Args:
        name: Filename stem, used as the temp file's prefix.
        header: Column headings, written as the first row.
        rows: The already-filtered rows to write.

    Returns:
        The path the CSV was written to.

    ponytail: POC — the file is written and logged, not delivered. Hand the path to
    the email or object-storage service when delivery becomes real.
    """
    fd, path = tempfile.mkstemp(prefix=f"{name}-", suffix=".csv", text=True)
    with os.fdopen(fd, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(header)
        writer.writerows(rows)
    print(f"[EXPORT] {name}: {len(rows)} rows written to {path}")
    return path
