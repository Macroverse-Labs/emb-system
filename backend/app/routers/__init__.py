"""API routers."""

from app.routers.auth import router as auth_router
from app.routers.gc import gc_router
from app.routers.health import router as health_router

__all__ = ["auth_router", "gc_router", "health_router"]
