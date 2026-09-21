"""TC (trade contractor) console API.

Every module here depends on `tc.deps.get_contractor`, which is the tenancy boundary:
a TC token only ever reaches its own company's rows. `bootstrap` is mounted first so
its fixed `/tc/bootstrap` path cannot be shadowed by a sibling's `/tc/{id}` match.
"""

from fastapi import APIRouter

from app.routers.tc.bootstrap import router as bootstrap_router
from app.routers.tc.documents import router as documents_router
from app.routers.tc.hours import router as hours_router
from app.routers.tc.inductions import router as inductions_router
from app.routers.tc.leavers import router as leavers_router
from app.routers.tc.visits import router as visits_router
from app.routers.tc.workers import router as workers_router

tc_router = APIRouter()
for _sub in (
    bootstrap_router,
    workers_router,
    documents_router,
    inductions_router,
    hours_router,
    leavers_router,
    visits_router,
):
    tc_router.include_router(_sub)

__all__ = ["tc_router"]
