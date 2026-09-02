"""Payloads for the zone builder, the plan layer, the access rules and devices."""

from typing import Literal

from pydantic import BaseModel


class ZoneUpdate(BaseModel):
    """The zone builder's right-hand panel, as the Save button sends it."""

    factor: Literal["1FA", "2FA"]
    capacity: str
    escort_required: bool
    requirements: list[str]


class ZoneCreate(BaseModel):
    """A new sub-sub zone, added under the zone selected in the tree."""

    parent_id: str
    name: str


class PlanShapeIn(BaseModel):
    """One rectangle on a level's plan, in the design's own field names."""

    x: float
    y: float
    w: float
    h: float
    n: str
    c: str


class PlanUpdate(BaseModel):
    """Every shape on one level; saving replaces that level's layer wholesale."""

    shapes: list[PlanShapeIn]


class MatrixUpdate(BaseModel):
    """Matrix cells keyed `"<zone>|<requirement>"`, exactly as `ruleKey()` writes them."""

    cells: dict[str, Literal["req", "opt", "na"]]


class ThresholdIn(BaseModel):
    """One auto-block threshold listed down the Access rules screen."""

    key_label: str
    value_label: str
    sub_label: str = ""


class ThresholdUpdate(BaseModel):
    """The whole threshold list, in the order the screen shows it."""

    thresholds: list[ThresholdIn]
