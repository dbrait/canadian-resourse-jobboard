"""
Employer model for company representatives.
"""

from datetime import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Employer(Base):
    """Employer (company representative) model."""

    __tablename__ = "employers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Link to user account
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    # Link to company
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)

    # Role within company
    job_title = Column(String(100))
    is_primary_contact = Column(Boolean, default=False)

    # Permissions
    can_post_jobs = Column(Boolean, default=True)
    can_view_applications = Column(Boolean, default=True)
    can_manage_company = Column(Boolean, default=False)

    # Status
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Dates
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="employer_profile")
    company = relationship("Company", back_populates="employers")

    def __repr__(self):
        return f"<Employer {self.user_id} at {self.company_id}>"


class ScrapeSource(Base):
    """Track scraping sources and their status."""

    __tablename__ = "scrape_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Source info
    name = Column(String(100), unique=True, nullable=False)  # jobbank, indeed, teck
    source_type = Column(String(50))  # api, website, ats
    base_url = Column(String(500))

    # Status
    is_active = Column(Boolean, default=True)
    last_success_at = Column(DateTime)
    last_failure_at = Column(DateTime)
    failure_count = Column(Boolean, default=0)

    # Scraping config
    scrape_frequency = Column(String(20), default="daily")  # hourly, daily, weekly
    priority = Column(Boolean, default=1)  # Higher = more important

    # Stats
    total_jobs_scraped = Column(Boolean, default=0)

    # Dates
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<ScrapeSource {self.name}>"


class ScrapeLog(Base):
    """Log of scraping runs."""

    __tablename__ = "scrape_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Source
    source_id = Column(UUID(as_uuid=True), ForeignKey("scrape_sources.id"))
    spider_name = Column(String(100), nullable=False)

    # Results
    status = Column(String(20))  # success, failed, partial
    jobs_found = Column(Boolean, default=0)
    jobs_new = Column(Boolean, default=0)
    jobs_updated = Column(Boolean, default=0)
    errors = Column(Boolean, default=0)
    error_message = Column(String(1000))

    # Timing
    started_at = Column(DateTime, nullable=False)
    finished_at = Column(DateTime)
    duration_seconds = Column(Boolean)

    def __repr__(self):
        return f"<ScrapeLog {self.spider_name} at {self.started_at}>"
