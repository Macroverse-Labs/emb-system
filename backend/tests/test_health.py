"""Health endpoint tests."""

import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """Test the basic health endpoint."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_db_health_check(client):
    """Test the database health endpoint."""
    response = await client.get("/api/v1/health/db")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["database"] == "connected"
