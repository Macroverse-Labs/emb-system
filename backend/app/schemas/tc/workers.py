"""Request and response shapes for the TC worker register and the Add-a-worker wizard."""

from pydantic import BaseModel, Field


class DraftIn(BaseModel):
    """One save of the Add-a-worker wizard.

    The design's sidebar promises "Every step saves as a draft … resume any time", so
    the wizard posts whichever step it is on and whatever the fields hold right now —
    nothing here is required, because a draft is by definition incomplete.
    """

    step: int = Field(default=1, ge=1, le=5)
    fields: dict[str, str] = Field(default_factory=dict)


class DraftOut(BaseModel):
    """A resumable draft, as the wizard reloads it."""

    id: str
    step: int
    fields: dict[str, str]


class WorkerIn(BaseModel):
    """The wizard's final submit — steps 1, 2 and 5 flattened.

    `draft_id` is the draft this came from; it is deleted once the worker exists, so a
    submitted wizard stops offering itself for resumption.
    """

    name: str = Field(min_length=1, max_length=200)
    draft_id: str | None = None
    job_role: str = ""
    date_of_birth: str = "—"
    sex: str = "—"
    nationality: str = ""
    telephone: str = "—"
    address_local: str = "—"
    address_home: str = "—"
    next_of_kin: str = "—"
    direct_employer: str = ""


class WithdrawIn(BaseModel):
    """Why the contractor is pulling a worker's access."""

    reason: str = Field(min_length=1, max_length=400)
