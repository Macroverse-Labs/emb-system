# emb-system

A full-stack scaffold with a **Next.js** frontend, **FastAPI** backend, **PostgreSQL** database, **Redis** cache/broker, **Celery** background workers, JWT authentication, and **Mailtrap** email testing.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, pnpm
- **Backend:** FastAPI, Python 3.13+, SQLAlchemy 2.0 (async), Alembic, Pydantic v2, uv
- **Task Queue:** Celery with Redis broker/backend
- **Database:** PostgreSQL 16
- **Cache/Broker:** Redis 7
- **Email:** Mailtrap Email Testing via SMTP
- **Auth:** JWT access tokens
- **DevOps:** Docker Compose for local development

## Quick start

1. Copy the example environment file and fill in your Mailtrap credentials:

   ```bash
   cp .env.example .env
   ```

2. Start the local stack:

   ```bash
   docker compose up --build
   ```

3. Open the app:
   - Frontend: http://localhost:3000
   - Backend docs: http://localhost:8000/docs

The backend container automatically runs Alembic migrations on startup.

## Background jobs

A welcome email is queued as a Celery task when a user registers. The worker container processes the task and sends the email via Mailtrap.

To trigger a task manually from a running backend container:

```bash
docker compose exec backend python - <<'PY'
from app.tasks.email import send_welcome_email
send_welcome_email.delay("test@example.com")
PY
```

## Development without Docker

### Backend

```bash
cd backend
uv sync --all-groups
cp .env.example .env
# Update DATABASE_URL to point to your local Postgres, or use the Docker services
uv run alembic upgrade head
uv run serve
```

Run tests:

```bash
uv run pytest -v
```

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

## Project structure

```
emb-system/
├── backend/          # FastAPI app
├── frontend/         # Next.js app
├── docker-compose.yml
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml
```

## CI

GitHub Actions runs backend linting, type checking, and tests, plus frontend linting and build on every push and pull request to `main`.

## License

MIT
