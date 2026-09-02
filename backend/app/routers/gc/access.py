"""Zones, plan layers, access rules and devices — what a card is allowed to open."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.access import (
    AccessThreshold,
    Device,
    PlanShape,
    Zone,
    ZoneCriterion,
    ZoneRequirement,
)
from app.models.gc.org import Project
from app.models.user import User
from app.routers.gc.bootstrap import site_now
from app.routers.gc.deps import get_project, require
from app.schemas.gc.access import (
    MatrixUpdate,
    PlanUpdate,
    ThresholdUpdate,
    ZoneCreate,
    ZoneUpdate,
)
from app.schemas.gc.common import ActionResult
from app.services.gc.audit import record_audit

router = APIRouter(prefix="/gc", tags=["gc"])

FACTOR_LABEL = {"1FA": "Card only", "2FA": "Card + face"}
CELL_LABEL = {"req": "Required", "opt": "Advisory", "na": "Not required"}


async def _zone(db: AsyncSession, project_id: str, zone_id: str) -> Zone:
    zone = (
        await db.execute(select(Zone).where(Zone.id == zone_id, Zone.project_id == project_id))
    ).scalar_one_or_none()
    if zone is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    return zone


@router.put("/zones/{zone_id}", response_model=ActionResult)
async def save_zone(
    zone_id: str,
    payload: ZoneUpdate,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Create zones")),
) -> ActionResult:
    """Save the zone builder's panel: factor, capacity, escort rule and criteria."""
    zone = await _zone(db, project.id, zone_id)
    was_factor, was_reqs = zone.factor, sorted(c.requirement for c in zone.criteria)

    zone.factor = payload.factor
    zone.capacity = payload.capacity
    zone.escort_required = payload.escort_required
    await db.execute(delete(ZoneCriterion).where(ZoneCriterion.zone_id == zone.id))
    for requirement in payload.requirements:
        db.add(ZoneCriterion(project_id=project.id, zone_id=zone.id, requirement=requirement))

    if was_factor != payload.factor:
        action = "Zone identity changed"
        before, after = FACTOR_LABEL[was_factor], FACTOR_LABEL[payload.factor]
    else:
        action = "Zone criteria changed"
        before = ", ".join(was_reqs) or "—"
        after = ", ".join(sorted(payload.requirements)) or "—"
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action=action,
        obj=zone.name,
        before=before,
        after=after,
    )
    await db.commit()
    return ActionResult(message=f"{zone.name} saved — change recorded in the system audit")


@router.post("/zones", response_model=ActionResult)
async def add_zone(
    payload: ZoneCreate,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Create zones")),
) -> ActionResult:
    """Add a sub-sub zone under the selected zone, inheriting its factor."""
    parent = await _zone(db, project.id, payload.parent_id)
    child = Zone(
        project_id=project.id,
        parent_id=parent.id,
        zone_ref=f"{parent.zone_ref}-{len(parent.children) + 1}",
        name=payload.name,
        kind="Sub-sub zone",
        depth=parent.depth + 1,
        factor=parent.factor,
    )
    db.add(child)
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Zone added",
        obj=payload.name,
        after=f"Sub-sub zone under {parent.name}",
    )
    await db.commit()
    return ActionResult(
        message=f"New sub-sub zone added under {parent.name} — name it, then set its criteria"
    )


@router.put("/plan/{level}", response_model=ActionResult)
async def save_plan(
    level: str,
    payload: PlanUpdate,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Create zones")),
) -> ActionResult:
    """Replace one level's plan layer with the shapes now drawn on it."""
    was = (
        (
            await db.execute(
                select(PlanShape).where(
                    PlanShape.project_id == project.id, PlanShape.level == level
                )
            )
        )
        .scalars()
        .all()
    )
    await db.execute(
        delete(PlanShape).where(PlanShape.project_id == project.id, PlanShape.level == level)
    )
    for shape in payload.shapes:
        db.add(
            PlanShape(
                project_id=project.id,
                level=level,
                x=shape.x,
                y=shape.y,
                w=shape.w,
                h=shape.h,
                name=shape.n,
                colour=shape.c,
            )
        )
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Plan layer changed",
        obj=f"Level {level}",
        before=f"{len(was)} shapes",
        after=f"{len(payload.shapes)} shapes",
    )
    await db.commit()
    return ActionResult(message=f"Plan layer saved for level {level}")


@router.put("/rules/matrix", response_model=ActionResult)
async def save_matrix(
    payload: MatrixUpdate,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Change access rules")),
) -> ActionResult:
    """Publish the zone x requirement matrix, auditing every cell that moved."""
    rows = (
        (await db.execute(select(ZoneRequirement).where(ZoneRequirement.project_id == project.id)))
        .scalars()
        .all()
    )
    existing = {(r.zone_name, r.requirement): r for r in rows}

    for key, value in payload.cells.items():
        zone_name, _, requirement = key.partition("|")
        row = existing.get((zone_name, requirement))
        was = row.value if row else "na"
        if was == value:
            continue
        if row is None:
            db.add(
                ZoneRequirement(
                    project_id=project.id,
                    zone_name=zone_name,
                    requirement=requirement,
                    value=value,
                )
            )
        else:
            row.value = value
        await record_audit(
            db,
            project_id=project.id,
            actor=user,
            action="Access rule changed",
            obj=f"{zone_name} · {requirement}",
            before=CELL_LABEL[was],
            after=CELL_LABEL[value],
        )
    await db.commit()
    return ActionResult(message="Access rules published — gates pick them up on the next sync")


@router.put("/rules/thresholds", response_model=ActionResult)
async def save_thresholds(
    payload: ThresholdUpdate,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Change access rules")),
) -> ActionResult:
    """Replace the auto-block thresholds, auditing each one whose value changed."""
    rows = (
        (await db.execute(select(AccessThreshold).where(AccessThreshold.project_id == project.id)))
        .scalars()
        .all()
    )
    was = {r.key_label: r.value_label for r in rows}

    await db.execute(delete(AccessThreshold).where(AccessThreshold.project_id == project.id))
    for position, threshold in enumerate(payload.thresholds):
        db.add(
            AccessThreshold(
                project_id=project.id,
                key_label=threshold.key_label,
                value_label=threshold.value_label,
                sub_label=threshold.sub_label,
                position=position,
            )
        )
        before = was.get(threshold.key_label, "—")
        if before == threshold.value_label:
            continue
        await record_audit(
            db,
            project_id=project.id,
            actor=user,
            action="Threshold changed",
            obj=threshold.key_label,
            before=before,
            after=threshold.value_label,
        )
    await db.commit()
    return ActionResult(message="Access rules published — gates pick them up on the next sync")


@router.post("/devices/{device_id}/sync", response_model=ActionResult)
async def force_sync(
    device_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Change system settings")),
) -> ActionResult:
    """Force a device to upload its buffered events now."""
    device = (
        await db.execute(
            select(Device).where(Device.id == device_id, Device.project_id == project.id)
        )
    ).scalar_one_or_none()
    if device is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    buffered, was_sync = device.buffered_events, device.last_sync
    device.buffered_events = 0
    device.last_sync = f"{site_now():%H:%M}"
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Device sync forced",
        obj=f"{device.device_ref} · {device.location}",
        before=was_sync,
        after=device.last_sync,
    )
    await db.commit()
    return ActionResult(
        message=f"{device.device_ref} — forced sync requested, {buffered} buffered events uploading"
    )
