"""GC console API.

Registration order matters: `resources` declares the parameterised list routes under
`/gc`, so the fixed paths (`/gc/bootstrap`, `/gc/rules/...`, `/gc/plan/...`) are mounted
first and cannot be shadowed by a `/gc/{something}` match.
"""

from fastapi import APIRouter

from app.routers.gc.access import router as access_router
from app.routers.gc.admin import router as admin_router
from app.routers.gc.bootstrap import router as bootstrap_router
from app.routers.gc.records import router as records_router
from app.routers.gc.resources import router as resources_router
from app.routers.gc.validation import router as validation_router
from app.routers.gc.visitors import router as visits_router
from app.routers.gc.visitors import visitors_router
from app.routers.gc.workers import router as workers_router

gc_router = APIRouter()
for _sub in (
    bootstrap_router,
    validation_router,
    workers_router,
    access_router,
    visits_router,
    visitors_router,
    admin_router,
    records_router,
    resources_router,
):
    gc_router.include_router(_sub)

__all__ = ["gc_router"]
