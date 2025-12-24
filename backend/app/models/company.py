"""
Company model for employers and scraped companies.
"""

from datetime import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Company(Base):
    """Company profile model."""

    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic info
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    website = Column(String(500))
    careers_url = Column(String(500))
    logo_url = Column(String(500))

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

    # Location
    headquarters = Column(String(255))
    province = Column(String(2))

    # Company size
    employee_count = Column(String(50))  # "1-50", "51-200", "1000+"
    founded_year = Column(Integer)

    # Scraping info
    is_scraped = Column(Boolean, default=True)  # False if registered by employer
    scrape_source = Column(String(50))
    last_scraped_at = Column(DateTime)

    # Status
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Dates
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    jobs = relationship("Job", back_populates="company")
    employers = relationship("Employer", back_populates="company")

    def __repr__(self):
        return f"<Company {self.name}>"
