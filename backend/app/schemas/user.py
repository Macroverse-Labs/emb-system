"""User Pydantic schemas."""

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr


class UserCreate(UserBase):
    """Schema for user registration."""

    password: str = Field(..., min_length=8)


class UserLogin(UserBase):
    """Schema for user login."""

    password: str


class UserResponse(UserBase):
    """Schema for user response."""

    id: str
    is_active: bool

    model_config = {"from_attributes": True}
