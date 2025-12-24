"""
Job model for scraped and posted job listings.
"""

from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Job(Base):
    """Job listing model."""

    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Core fields
    title = Column(String(500), nullable=False, index=True)
    company_name = Column(String(255), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True)

    # Location
    location = Column(String(255))
    city = Column(String(100))
    province = Column(String(2), index=True)  # AB, BC, ON, etc.
    country = Column(String(2), default="CA")
    latitude = Column(Float)
    longitude = Column(Float)
    is_remote = Column(Boolean, default=False, index=True)
    is_fly_in_fly_out = Column(Boolean, default=False)

    # Classification
    industry = Column(
        Enum(
            "mining",
            "oil_gas",
            "forestry",
            "fishing",
            "agriculture",
            "renewable_energy",
            "environmental",
            name="industry_type",
        ),
        nullable=True,
        index=True,
    )
    job_type = Column(
        Enum(
            "full_time",
            "part_time",
            "contract",
            "temporary",
            "internship",
            name="job_type",
        ),
        default="full_time",
        index=True,
    )

    # Salary
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    salary_currency = Column(String(3), default="CAD")
    salary_period = Column(String(20))  # hourly, yearly, etc.

    # Content
    description = Column(Text)
    requirements = Column(Text)
    benefits = Column(Text)

    # Source tracking
    source = Column(String(50), nullable=False, index=True)  # jobbank, indeed, company_teck
    source_url = Column(String(2000), nullable=False)
    source_id = Column(String(255))
    fingerprint = Column(String(64))  # SimHash for deduplication

    # Status
    is_active = Column(Boolean, default=True, index=True)
    is_featured = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    application_count = Column(Integer, default=0)

    # Dates
    posted_at = Column(DateTime)
    expires_at = Column(DateTime)
    scraped_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="jobs")
    saved_by = relationship("SavedJob", back_populates="job")
    applications = relationship("Application", back_populates="job")

    __table_args__ = (
        UniqueConstraint("source", "source_id", name="uq_job_source"),
        Index("ix_jobs_search", "title", "company_name", "industry", "province"),
        Index("ix_jobs_location", "latitude", "longitude"),
        Index("ix_jobs_salary", "salary_min", "salary_max"),
    )

    def __repr__(self):
        return f"<Job {self.title} at {self.company_name}>"


class SavedJob(Base):
    """User's saved jobs."""

    __tablename__ = "saved_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")

    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="uq_saved_job"),
    )


class Application(Base):
    """Job applications."""

    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)

    # Application details
    resume_url = Column(String(500))
    cover_letter = Column(Text)
    status = Column(
        Enum(
            "pending",
            "reviewed",
            "interviewed",
            "hired",
            "rejected",
            name="application_status",
        ),
        default="pending",
    )

    # Dates
    applied_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)

    # Relationships
    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")

    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="uq_application"),
    )
