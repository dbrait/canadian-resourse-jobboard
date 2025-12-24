"""
Job listing routes.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.api.deps import CurrentUserOptional, DatabaseSession

router = APIRouter()


class Industry(str, Enum):
    """Natural resources industry categories."""

    MINING = "mining"
    OIL_GAS = "oil_gas"
    FORESTRY = "forestry"
    FISHING = "fishing"
    AGRICULTURE = "agriculture"
    RENEWABLE_ENERGY = "renewable_energy"
    ENVIRONMENTAL = "environmental"


class JobType(str, Enum):
    """Job employment types."""

    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    TEMPORARY = "temporary"
    INTERNSHIP = "internship"


class JobBase(BaseModel):
    """Base job model."""

    title: str
    company_name: str
    location: str
    province: Optional[str] = None
    industry: Industry
    job_type: JobType = JobType.FULL_TIME
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: str
    requirements: Optional[str] = None
    is_remote: bool = False
    is_fly_in_fly_out: bool = False


class JobResponse(JobBase):
    """Job response model."""

    id: str
    company_id: Optional[str] = None
    source: str  # Where the job was scraped from
    source_url: str
    posted_at: datetime
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class JobListResponse(BaseModel):
    """Paginated job list response."""

    jobs: List[JobResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class JobSearchParams(BaseModel):
    """Job search parameters."""

    q: Optional[str] = None
    industry: Optional[List[Industry]] = None
    location: Optional[str] = None
    province: Optional[str] = None
    job_type: Optional[List[JobType]] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    is_remote: Optional[bool] = None
    posted_within_days: Optional[int] = None


@router.get("", response_model=JobListResponse)
async def list_jobs(
    db: DatabaseSession,
    current_user: CurrentUserOptional,
    q: Optional[str] = Query(None, description="Search query"),
    industry: Optional[List[Industry]] = Query(None, description="Filter by industry"),
    province: Optional[str] = Query(None, description="Filter by province"),
    job_type: Optional[List[JobType]] = Query(None, description="Filter by job type"),
    salary_min: Optional[int] = Query(None, description="Minimum salary"),
    salary_max: Optional[int] = Query(None, description="Maximum salary"),
    is_remote: Optional[bool] = Query(None, description="Remote jobs only"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    List jobs with optional filters.

    - **q**: Full-text search in title and description
    - **industry**: Filter by one or more industries
    - **province**: Filter by Canadian province
    - **job_type**: Filter by employment type
    - **salary_min/max**: Filter by salary range
    - **is_remote**: Show only remote jobs
    """
    # TODO: Implement actual database/Elasticsearch query
    # Return placeholder data for now
    return JobListResponse(
        jobs=[],
        total=0,
        page=page,
        per_page=per_page,
        total_pages=0,
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: DatabaseSession, current_user: CurrentUserOptional):
    """Get a specific job by ID."""
    # TODO: Implement actual database query
    # Return placeholder for now
    from fastapi import HTTPException

    raise HTTPException(status_code=404, detail="Job not found")


@router.get("/company/{company_id}", response_model=JobListResponse)
async def get_jobs_by_company(
    company_id: str,
    db: DatabaseSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """Get all jobs for a specific company."""
    # TODO: Implement actual database query
    return JobListResponse(
        jobs=[],
        total=0,
        page=page,
        per_page=per_page,
        total_pages=0,
    )


@router.get("/industry/{industry}", response_model=JobListResponse)
async def get_jobs_by_industry(
    industry: Industry,
    db: DatabaseSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """Get all jobs in a specific industry."""
    # TODO: Implement actual database query
    return JobListResponse(
        jobs=[],
        total=0,
        page=page,
        per_page=per_page,
        total_pages=0,
    )
