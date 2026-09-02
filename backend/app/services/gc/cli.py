"""Command-line entry points for the GC console."""

import asyncio
import sys

from app.database import AsyncSessionLocal, engine
from app.services.gc.seed import seed_gc


async def _run(force: bool) -> None:
    async with AsyncSessionLocal() as db:
        loaded = await seed_gc(db, force=force)
    await engine.dispose()
    print("GC seed loaded." if loaded else "GC data already present — nothing to do.")


def main() -> None:
    """Load the GC console's reference dataset.

    Run with `uv run python -m app.services.gc.cli`; add `--force` to reload.
    """
    asyncio.run(_run(force="--force" in sys.argv))


if __name__ == "__main__":
    main()
