"""
ATS (Applicant Tracking System) spiders.

These spiders handle common job board platforms used by large companies:
- Workday (~40% of Fortune 500)
- Greenhouse
- Lever
- Taleo
- iCIMS
"""

from jobs_scraper.spiders.ats.workday import WorkdaySpider
from jobs_scraper.spiders.ats.greenhouse import GreenhouseSpider
from jobs_scraper.spiders.ats.lever import LeverSpider

__all__ = ["WorkdaySpider", "GreenhouseSpider", "LeverSpider"]
