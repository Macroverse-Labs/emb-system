# emb-system backend

FastAPI backend with async SQLAlchemy, Alembic, Celery, Redis, JWT auth, and Mailtrap email.

## Run locally

```bash
uv sync --all-groups
cp .env.example .env
uv run alembic upgrade head
uv run serve
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
