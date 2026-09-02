# emb-system backend

FastAPI backend with async SQLAlchemy, Alembic, Celery, Redis, JWT auth, and Mailtrap email.

## Run locally

```bash
uv sync --all-groups
cp .env.example .env
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

## Run tests

```bash
uv run pytest -v
```

## Useful commands

```bash
# Create a new Alembic migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head

# Start Celery worker
uv run celery -A app.celery_app.celery_app worker -l info
```

## API endpoints

- `POST /api/v1/auth/register` — Register a new user
- `POST /api/v1/auth/login` — Login and receive a JWT
- `GET /api/v1/auth/me` — Get current user
- `GET /api/v1/health` — Health check
- `GET /api/v1/health/db` — Database health check

## GC console data

`app/services/gc/seed_data.json` is generated from the frontend's
`src/lib/gc/data.ts`, which holds the design prototype's own dataset. One source, so the
seeded database and the console's offline fallback cannot disagree. To regenerate it
after the fixtures change:

```bash
cd ../frontend && node --experimental-strip-types scripts/dump-seed-data.mjs \
  ../backend/app/services/gc/seed_data.json
```

Load it with `uv run python -m app.services.gc.cli` (add `--force` to reload). It is
idempotent, so the Docker entrypoint runs it on every start.
