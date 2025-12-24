"""
PostgreSQL pipeline for storing jobs.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json


class PostgresPipeline:
    """
    Stores job items in PostgreSQL database.
    """

    def __init__(self):
        self.engine = None
        self.Session = None

    def open_spider(self, spider):
        """Connect to database."""
        from scrapy.utils.project import get_project_settings
        settings = get_project_settings()

        database_url = settings.get("DATABASE_URL")
        # Convert async URL to sync for SQLAlchemy
        database_url = database_url.replace("+asyncpg", "")

        self.engine = create_engine(database_url)
        self.Session = sessionmaker(bind=self.engine)

    def close_spider(self, spider):
        """Close database connection."""
        if self.engine:
            self.engine.dispose()

    def process_item(self, item, spider):
        """Store job in database."""
        session = self.Session()
        try:
            # Prepare data
            data = {
                "title": item.get("title"),
                "company_name": item.get("company_name"),
                "location": item.get("location"),
                "city": item.get("city"),
                "province": item.get("province"),
                "country": item.get("country", "CA"),
                "latitude": item.get("latitude"),
                "longitude": item.get("longitude"),
                "industry": item.get("industry"),
                "job_type": item.get("job_type", "full_time"),
                "salary_min": item.get("salary_min"),
                "salary_max": item.get("salary_max"),
                "salary_currency": item.get("salary_currency", "CAD"),
                "salary_period": item.get("salary_period"),
                "description": item.get("description"),
                "requirements": item.get("requirements"),
                "is_remote": item.get("is_remote", False),
                "is_fly_in_fly_out": item.get("is_fly_in_fly_out", False),
                "source": item.get("source"),
                "source_url": item.get("source_url"),
                "source_id": item.get("source_id"),
                "fingerprint": item.get("fingerprint"),
                "posted_at": item.get("posted_at"),
                "expires_at": item.get("expires_at"),
                "scraped_at": item.get("scraped_at"),
            }

            # Upsert job (insert or update)
            sql = text("""
                INSERT INTO jobs (
                    title, company_name, location, city, province, country,
                    latitude, longitude, industry, job_type,
                    salary_min, salary_max, salary_currency, salary_period,
                    description, requirements, is_remote, is_fly_in_fly_out,
                    source, source_url, source_id, fingerprint,
                    posted_at, expires_at, scraped_at, updated_at
                ) VALUES (
                    :title, :company_name, :location, :city, :province, :country,
                    :latitude, :longitude, :industry, :job_type,
                    :salary_min, :salary_max, :salary_currency, :salary_period,
                    :description, :requirements, :is_remote, :is_fly_in_fly_out,
                    :source, :source_url, :source_id, :fingerprint,
                    :posted_at, :expires_at, :scraped_at, NOW()
                )
                ON CONFLICT (source, source_id)
                DO UPDATE SET
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    salary_min = EXCLUDED.salary_min,
                    salary_max = EXCLUDED.salary_max,
                    scraped_at = EXCLUDED.scraped_at,
                    updated_at = NOW()
            """)

            session.execute(sql, data)
            session.commit()
            spider.logger.debug(f"Stored job: {item.get('title')} at {item.get('company_name')}")

        except Exception as e:
            session.rollback()
            spider.logger.error(f"Failed to store job: {e}")
        finally:
            session.close()

        return item
