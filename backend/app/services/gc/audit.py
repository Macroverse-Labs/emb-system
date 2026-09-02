"""The audit trail behind every change made in the console."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gc.records import AuditEntry
from app.models.user import User


async def record_audit(
    db: AsyncSession,
    *,
    project_id: str,
    actor: User | None,
    action: str,
    obj: str,
    before: str = "—",
    after: str = "—",
) -> AuditEntry:
    """Write one row to the system-change audit.

    Every mutating endpoint calls this. The design's promise on each write is that
    the change is "recorded against your account", and the System-change audit screen
    reads exactly these rows — so this is not optional logging, it is the feature.

    The caller commits; this only stages the row, so the change and its audit entry
    land in the same transaction.
    """
    entry = AuditEntry(
        project_id=project_id,
        who=actor.full_name or actor.email if actor else "System",
        role=actor.role if actor else "Automatic",
        action=action,
        obj=obj,
        value_before=before,
        value_after=after,
    )
    db.add(entry)
    return entry
