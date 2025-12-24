"""
User model for job seekers.
"""

from datetime import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """Job seeker user model."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Authentication
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    # Profile
    full_name = Column(String(255))
    phone = Column(String(20))
    location = Column(String(255))
    province = Column(String(2))

    # Resume and links
    resume_url = Column(String(500))
    linkedin_url = Column(String(500))

    # Role
    role = Column(
        Enum("user", "employer", "admin", name="user_role"),
        default="user",
        nullable=False,
    )

    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Dates
    last_login_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    saved_jobs = relationship("SavedJob", back_populates="user")
    applications = relationship("Application", back_populates="user")
    job_alerts = relationship("JobAlert", back_populates="user")

    def __repr__(self):
        return f"<User {self.email}>"


class JobAlert(Base):
    """Job alert subscription model."""

    __tablename__ = "job_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)

    # Alert settings
    name = Column(String(100), nullable=False)
    keywords = Column(String(500))
    industries = Column(String(255))  # Comma-separated list
    provinces = Column(String(50))  # Comma-separated list
    is_remote = Column(Boolean)
    salary_min = Column(String(20))

    # Delivery
    frequency = Column(
        Enum("daily", "weekly", name="alert_frequency"),
        default="daily",
    )
    is_active = Column(Boolean, default=True)
    last_sent_at = Column(DateTime)

    # Dates
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="job_alerts", foreign_keys=[user_id])

    def __repr__(self):
        return f"<JobAlert {self.name}>"
