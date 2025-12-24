"""
Canada Job Bank API Spider.

The Job Bank is the Government of Canada's job board.
API documentation: https://www.jobbank.gc.ca/api

This spider scrapes natural resources jobs from the Job Bank.
"""

import scrapy
import json
from typing import Generator
from datetime import datetime

from jobs_scraper.spiders.base import APISpider
from jobs_scraper.items import JobItem


class JobBankSpider(APISpider):
    """
    Spider for Canada Job Bank API.
    """

    name = "jobbank"
    source_name = "jobbank"
    allowed_domains = ["jobbank.gc.ca"]

    # Job Bank API base URL
    api_base_url = "https://www.jobbank.gc.ca/api/jobsearch"

    # Natural resources NOC codes (National Occupational Classification)
    # See: https://noc.esdc.gc.ca/
    NATURAL_RESOURCES_NOC = [
        # Mining
        "0811",  # Managers in natural resources production
        "8221",  # Supervisors, mining and quarrying
        "8231",  # Underground production and development miners
        "8411",  # Underground mine service and support workers
        "7372",  # Drillers and blasters
        "2113",  # Geoscientists and oceanographers
        "2143",  # Mining engineers

        # Oil & Gas
        "0811",  # Managers in natural resources production
        "8232",  # Oil and gas well drillers, servicers
        "8412",  # Oil and gas well drilling workers
        "2145",  # Petroleum engineers
        "2212",  # Geological and mineral technologists

        # Forestry
        "0811",  # Managers in natural resources production
        "8211",  # Supervisors, logging and forestry
        "8241",  # Logging machinery operators
        "8422",  # Silviculture and forestry workers
        "2122",  # Forestry professionals

        # Fishing
        "0811",  # Managers in natural resources production
        "8261",  # Fishing masters and officers
        "8262",  # Fishers
        "8431",  # General farm workers
        "2121",  # Biologists and related scientists

        # Agriculture
        "0821",  # Managers in agriculture
        "8252",  # Agricultural service contractors
        "8431",  # General farm workers
        "8432",  # Nursery and greenhouse workers
        "2123",  # Agricultural representatives

        # Environmental
        "2121",  # Biologists and related scientists
        "2115",  # Other professional engineers
        "2231",  # Civil engineering technologists
        "4161",  # Natural and applied science policy researchers
    ]

    # Search keywords for natural resources
    SEARCH_KEYWORDS = [
        "mining",
        "oil gas",
        "petroleum",
        "forestry",
        "logging",
        "agriculture",
        "farm",
        "fishing",
        "aquaculture",
        "environmental",
        "renewable energy",
        "solar",
        "wind energy",
    ]

    def start_requests(self) -> Generator[scrapy.Request, None, None]:
        """Generate initial search requests."""
        # Search by keywords
        for keyword in self.SEARCH_KEYWORDS:
            url = f"{self.api_base_url}?searchstring={keyword}&page=1&sort=M"
            yield scrapy.Request(
                url=url,
                callback=self.parse_search_results,
                meta={"keyword": keyword, "page": 1},
            )

    def parse_search_results(self, response) -> Generator:
        """Parse search results page."""
        try:
            data = json.loads(response.text)
        except json.JSONDecodeError:
            self.logger.error(f"Failed to parse JSON from {response.url}")
            return

        jobs = data.get("jobs", [])
        total = data.get("total", 0)
        page = response.meta.get("page", 1)
        keyword = response.meta.get("keyword", "")

        self.logger.info(f"Found {len(jobs)} jobs for '{keyword}' (page {page}, total {total})")

        # Parse each job
        for job in jobs:
            job_id = job.get("jobId")
            if job_id:
                # Fetch full job details
                detail_url = f"https://www.jobbank.gc.ca/api/job/{job_id}"
                yield scrapy.Request(
                    url=detail_url,
                    callback=self.parse_job_detail,
                    meta={"job_id": job_id, "summary": job},
                )

        # Pagination
        per_page = 25
        if len(jobs) == per_page and page * per_page < total:
            next_page = page + 1
            next_url = f"{self.api_base_url}?searchstring={keyword}&page={next_page}&sort=M"
            yield scrapy.Request(
                url=next_url,
                callback=self.parse_search_results,
                meta={"keyword": keyword, "page": next_page},
            )

    def parse_job_detail(self, response) -> Generator[JobItem, None, None]:
        """Parse individual job details."""
        try:
            data = json.loads(response.text)
        except json.JSONDecodeError:
            self.logger.error(f"Failed to parse job detail from {response.url}")
            return

        summary = response.meta.get("summary", {})
        job_id = response.meta.get("job_id")

        # Extract job data
        item = self.create_job_item(
            title=data.get("title", summary.get("title", "")),
            company_name=data.get("employer", {}).get("name", summary.get("employer", "")),
            location=data.get("location", {}).get("city", summary.get("location", "")),
            province=data.get("location", {}).get("province"),
            description=data.get("description", ""),
            requirements=data.get("requirements", ""),
            job_type=self._map_job_type(data.get("employmentType")),
            salary_raw=data.get("salary", {}).get("value"),
            salary_min=data.get("salary", {}).get("min"),
            salary_max=data.get("salary", {}).get("max"),
            posted_at=data.get("datePosted"),
            expires_at=data.get("dateExpires"),
            source_url=f"https://www.jobbank.gc.ca/jobsearch/jobposting/{job_id}",
            source_id=str(job_id),
        )

        self.jobs_scraped += 1
        yield item

    def _map_job_type(self, employment_type: str) -> str:
        """Map Job Bank employment type to our job type."""
        if not employment_type:
            return "full_time"

        employment_type = employment_type.lower()
        if "part" in employment_type:
            return "part_time"
        elif "contract" in employment_type or "term" in employment_type:
            return "contract"
        elif "seasonal" in employment_type or "temporary" in employment_type:
            return "temporary"
        else:
            return "full_time"

    def parse(self, response):
        """Default parse method (not used directly)."""
        pass
