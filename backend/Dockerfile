# syntax=docker/dockerfile:1
FROM python:3.13-slim AS builder

WORKDIR /app

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency definitions and install dependencies.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# Production image.
FROM python:3.13-slim

WORKDIR /app

# Create a non-root user.
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy the virtual environment from the builder stage.
COPY --from=builder /app/.venv /app/.venv

# Copy application code.
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./

# Ensure the non-root user owns the app directory.
RUN chown -R appuser:appgroup /app
USER appuser

# Activate the virtual environment.
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
