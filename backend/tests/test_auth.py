"""Auth endpoint tests."""

import pytest


@pytest.mark.asyncio
async def test_register_user(client):
    """Test user registration."""
    payload = {"email": "test@example.com", "password": "securepass123"}
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert "id" in data
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    """Test duplicate email rejection."""
    payload = {"email": "dup@example.com", "password": "securepass123"}
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


@pytest.mark.asyncio
async def test_login_and_me(client):
    """Test login and current user retrieval."""
    payload = {"email": "login@example.com", "password": "securepass123"}
    await client.post("/api/v1/auth/register", json=payload)

    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == payload["email"]


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    payload = {"email": "bad@example.com", "password": "wrongpassword"}
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
