"""
Scrapy items for job data.
"""

import scrapy
from typing import Optional
from datetime import datetime


class JobItem(scrapy.Item):
    """
    Represents a scraped job listing.
    """
    # Core fields
    title = scrapy.Field()
    company_name = scrapy.Field()
    company_id = scrapy.Field()  # Internal company ID if matched

    # Location
    location = scrapy.Field()  # Raw location string
    city = scrapy.Field()
    province = scrapy.Field()
    country = scrapy.Field()
    latitude = scrapy.Field()
    longitude = scrapy.Field()
    is_remote = scrapy.Field()
    is_fly_in_fly_out = scrapy.Field()

    # Classification
    industry = scrapy.Field()  # mining, oil_gas, forestry, etc.
    job_type = scrapy.Field()  # full_time, part_time, contract, etc.

    # Salary
    salary_min = scrapy.Field()
    salary_max = scrapy.Field()
    salary_currency = scrapy.Field()
    salary_period = scrapy.Field()  # hourly, yearly, etc.
    salary_raw = scrapy.Field()  # Original salary text

    # Content
    description = scrapy.Field()
    description_html = scrapy.Field()
    requirements = scrapy.Field()
    benefits = scrapy.Field()

    # Source information
    source = scrapy.Field()  # Source name (jobbank, indeed, company_teck, etc.)
    source_url = scrapy.Field()  # Original job URL
    source_id = scrapy.Field()  # Original job ID from source

    # Dates
    posted_at = scrapy.Field()
    expires_at = scrapy.Field()
    scraped_at = scrapy.Field()

    # Deduplication
    fingerprint = scrapy.Field()  # SimHash fingerprint

    # Metadata
    raw_data = scrapy.Field()  # Original scraped data for debugging


class CompanyItem(scrapy.Item):
    """
    Represents a company discovered during scraping.
    """
    name = scrapy.Field()
    slug = scrapy.Field()
    website = scrapy.Field()
    careers_url = scrapy.Field()
    industry = scrapy.Field()
    headquarters = scrapy.Field()
    description = scrapy.Field()
    logo_url = scrapy.Field()
    source = scrapy.Field()
