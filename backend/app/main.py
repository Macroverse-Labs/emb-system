"""FastAPI application factory."""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import AsyncSessionLocal, engine
from app.routers import auth_router, gc_router, health_router
from app.services.gc.seed import seed_gc

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan events."""
    # Load the GC console's reference dataset. It lives here rather than in a start
    # command so every environment behaves the same — Railway's start command is set
    # in its dashboard, out of this repo's reach. The seed is a no-op once data
    # exists, and a failure must not stop the API from serving.
    if settings.gc_seed_on_startup:
        try:
            async with AsyncSessionLocal() as db:
                if await seed_gc(db):
                    logger.info("GC reference dataset loaded.")
        except Exception:
            logger.exception("GC seed skipped — the API is starting without it.")
    yield
    # Shutdown
    await engine.dispose()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins.split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(gc_router, prefix="/api/v1")

    return app


app = create_app()
