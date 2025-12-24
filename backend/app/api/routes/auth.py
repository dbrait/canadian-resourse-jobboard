"""
Authentication routes.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.api.deps import CurrentUser, DatabaseSession
from app.core.security import (
    TokenPair,
    create_token_pair,
    get_password_hash,
    verify_password,
    verify_token,
)

router = APIRouter()


class RegisterRequest(BaseModel):
    """User registration request."""

    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    """User login request."""

    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Token refresh request."""

    refresh_token: str


class AuthResponse(BaseModel):
    """Authentication response with tokens."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: DatabaseSession):
    """Register a new user account."""
    # TODO: Implement user creation in database
    # For now, return a placeholder response
    tokens = create_token_pair(subject="temp-user-id", role="user")
    return AuthResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        user={
            "id": "temp-user-id",
            "email": request.email,
            "full_name": request.full_name,
            "role": "user",
        },
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: DatabaseSession):
    """Login with email and password."""
    # TODO: Implement actual authentication
    # For now, return a placeholder response
    tokens = create_token_pair(subject="temp-user-id", role="user")
    return AuthResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        user={
            "id": "temp-user-id",
            "email": request.email,
            "full_name": "Test User",
            "role": "user",
        },
    )


@router.post("/refresh", response_model=TokenPair)
async def refresh_tokens(request: RefreshRequest):
    """Refresh access token using refresh token."""
    payload = verify_token(request.refresh_token, token_type="refresh")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    return create_token_pair(subject=payload.sub, role=payload.role)


@router.get("/me")
async def get_current_user_info(current_user: CurrentUser):
    """Get current authenticated user information."""
    return {
        "id": current_user.sub,
        "role": current_user.role,
    }


@router.post("/logout")
async def logout(current_user: CurrentUser):
    """Logout current user (invalidate tokens)."""
    # TODO: Implement token blacklisting if needed
    return {"message": "Successfully logged out"}
