"""The `/tc/bootstrap` payload, typed exactly as `frontend/src/lib/tc/types.ts` reads it.

The tuple rows are aliases rather than models, the way the design's own arrays are
positional — the frontend view-models in `src/components/tc/vm/*` index them from the
front, so naming the positions here (in the alias comment) is the whole contract.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class _Camel(BaseModel):
    """The console reads camelCase (`docQueue`, `onRegister`); Python writes snake_case.

    FastAPI serialises by alias, so the wire stays exactly what `tc/types.ts` declares
    without a single hand-written alias.
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# Rows whose screen fires a mutation carry their database id as a TRAILING element, the
# way `/gc/bootstrap` does: the frontend indexes positionally from the front, so an
# append is free and a reorder is not. Never insert one in the middle.
# [code, name, badge, meta]
TcProjectRow = tuple[str, str, str, str]
# [name, ref, role, employer, access, doc, lastSeen, workerId]
TcWorkerRow = tuple[str, str, str, str, str, str, str, str]
# [name, role, cells, workerId]
TcTrainingRow = tuple[str, str, list[str], str]
# [name, role, pct, hours, days, warned, flag, workerId]
TcHoursRow = tuple[str, str, int, str, str, int, str, str]
# [name, lastSeen, days, blockDue, warnings, level, workerId]
TcInactiveRow = tuple[str, str, int, str, str, int, str]
# [name, lastDay, reason, card, hours, status, level, meta, leaverId, workerId]
TcLeaverRow = tuple[str, str, str, str, str, str, int, str, str, str]
# [kind, company, purpose, window, host, status, colour, note, mine, requestId]
TcVisitorRow = tuple[str, str, str, str, str, str, str, str, int, str]


class TcDocRow(_Camel):
    """One card in the Documents queue. Named fields in the design, not a tuple."""

    # React key only. It is a DocumentSubmission.id on `grp="rej"` rows but a
    # WorkerDocument.id on `grp="exp"`/`"gone"` ones, so it is NOT addressable —
    # `POST /tc/documents/{id}/resubmit` takes a submission and would 404 on the others.
    # Use `submission_id` to resubmit and `worker_id` to upload a fresh document.
    id: str
    # The worker the card is about; always set, so the expiring/expired cards have a
    # route (`POST /tc/documents`, a fresh upload) even with no submission to resubmit.
    worker_id: str
    # Set only when the card really is a DocumentSubmission, i.e. `grp="rej"`.
    submission_id: str | None
    n: str
    doc: str
    d: str
    when: str
    grp: Literal["rej", "exp", "gone"]
    no: str
    exp: str
    file: str
    reason: str
    head: str
    st: str
    days: str
    pct: str


class TcInductionAttendee(_Camel):
    """One seat this contractor already holds on a session."""

    id: str
    worker: str
    status: str
    colour: str


class TcInductionSession(_Camel):
    """One slot on the Induction booking screen — a real row, not the design's mock grid.

    `id` is the `InductionSession.id`, which is exactly what `POST /tc/inductions/book`
    takes as `session_id`; without it the screen has nothing to send. `remaining` and
    `state` are what grey out a slot the console must not offer.
    """

    id: str
    ref: str
    when: str
    where: str
    run_by: str
    capacity: int
    booked: int
    remaining: int
    state: str
    attendance: list[TcInductionAttendee]


class TcMeta(_Camel):
    """Extras the console reads that are not part of the design's own data shapes."""

    company: str
    project: str
    notifications: int
    on_register: int
    on_site: int
    permissions: dict[str, bool]


class TcBootstrap(_Camel):
    """`TcData & {meta: TcMeta}` — everything the console needs for one contractor."""

    projects: list[TcProjectRow]
    workers: list[TcWorkerRow]
    doc_queue: list[TcDocRow]
    training_columns: list[str]
    training: list[TcTrainingRow]
    induction_sessions: list[TcInductionSession]
    hours: list[TcHoursRow]
    inactive: list[TcInactiveRow]
    leavers: list[TcLeaverRow]
    visitor_requests: list[TcVisitorRow]
    meta: TcMeta
