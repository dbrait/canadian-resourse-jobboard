"""
User routes for job seekers.
"""

from typing import List, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, EmailStr

from app.api.deps import CurrentUser, DatabaseSession

router = APIRouter()


class UserProfile(BaseModel):
    """User profile model."""

    id: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    location: Optional[str] = None
    province: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """User profile update request."""

    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    province: Optional[str] = None
    linkedin_url: Optional[str] = None


class SavedJob(BaseModel):
    """Saved job model."""

    id: str
    job_id: str
    job_title: str
    company_name: str
    saved_at: str


class JobAlert(BaseModel):
    """Job alert subscription model."""

    id: str
    name: str
    keywords: Optional[str] = None
    industries: Optional[List[str]] = None
    provinces: Optional[List[str]] = None
    is_remote: Optional[bool] = None
    frequency: str = "daily"  # daily, weekly
    is_active: bool = True


class JobAlertCreate(BaseModel):
    """Create job alert request."""

    name: str
    keywords: Optional[str] = None
    industries: Optional[List[str]] = None
    provinces: Optional[List[str]] = None
    is_remote: Optional[bool] = None
    frequency: str = "daily"


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: CurrentUser, db: DatabaseSession):
    """Get current user's profile."""
    # TODO: Implement actual database query
    return UserProfile(
        id=current_user.sub,
        email="user@example.com",
        full_name="Test User",
    )


@router.patch("/profile", response_model=UserProfile)
async def update_profile(
    updates: UserProfileUpdate,
    current_user: CurrentUser,
    db: DatabaseSession,
):
    """Update current user's profile."""
    # TODO: Implement actual database update
    return UserProfile(
        id=current_user.sub,
        email="user@example.com",
        full_name=updates.full_name or "Test User",
        phone=updates.phone,
        location=updates.location,
        province=updates.province,
        linkedin_url=updates.linkedin_url,
    )


# Saved Jobs
@router.get("/saved-jobs", response_model=List[SavedJob])
async def get_saved_jobs(current_user: CurrentUser, db: DatabaseSession):
    """Get user's saved jobs."""
    # TODO: Implement actual database query
    return []


@router.post("/saved-jobs/{job_id}", response_model=SavedJob)
async def save_job(job_id: str, current_user: CurrentUser, db: DatabaseSession):
    """Save a job to user's list."""
    # TODO: Implement actual database insert
    from datetime import datetime

    return SavedJob(
        id="saved-job-id",
        job_id=job_id,
        job_title="Sample Job",
        company_name="Sample Company",
        saved_at=datetime.utcnow().isoformat(),
    )


@router.delete("/saved-jobs/{job_id}")
async def unsave_job(job_id: str, current_user: CurrentUser, db: DatabaseSession):
    """Remove a job from user's saved list."""
    # TODO: Implement actual database delete
    return {"message": "Job removed from saved list"}


# Job Alerts
@router.get("/alerts", response_model=List[JobAlert])
async def get_job_alerts(current_user: CurrentUser, db: DatabaseSession):
    """Get user's job alert subscriptions."""
    # TODO: Implement actual database query
    return []


@router.post("/alerts", response_model=JobAlert)
async def create_job_alert(
    alert: JobAlertCreate,
    current_user: CurrentUser,
    db: DatabaseSession,
):
    """Create a new job alert subscription."""
    # TODO: Implement actual database insert
    return JobAlert(
        id="alert-id",
        name=alert.name,
        keywords=alert.keywords,
        industries=alert.industries,
        provinces=alert.provinces,
        is_remote=alert.is_remote,
        frequency=alert.frequency,
    )


@router.patch("/alerts/{alert_id}", response_model=JobAlert)
async def update_job_alert(
    alert_id: str,
    alert: JobAlertCreate,
    current_user: CurrentUser,
    db: DatabaseSession,
):
    """Update a job alert subscription."""
    # TODO: Implement actual database update
    return JobAlert(
        id=alert_id,
        name=alert.name,
        keywords=alert.keywords,
        industries=alert.industries,
        provinces=alert.provinces,
        is_remote=alert.is_remote,
        frequency=alert.frequency,
    )


@router.delete("/alerts/{alert_id}")
async def delete_job_alert(alert_id: str, current_user: CurrentUser, db: DatabaseSession):
    """Delete a job alert subscription."""
    # TODO: Implement actual database delete
    return {"message": "Job alert deleted"}
