"""
Greenhouse ATS Spider.

Greenhouse is a popular ATS used by many companies.
Their job boards have a consistent API structure that's easy to scrape.

Greenhouse URLs follow the pattern:
- Job board: https://boards.greenhouse.io/{company}
- API: https://boards-api.greenhouse.io/v1/boards/{company}/jobs
"""

import json
from typing import Generator, Dict, Any

import scrapy
from scrapy import Request

from jobs_scraper.spiders.base import APISpider
from jobs_scraper.items import JobItem


class GreenhouseSpider(APISpider):
    """
    Spider for Greenhouse-powered career sites.

    Greenhouse provides a public JSON API for job listings,
    making it one of the easiest ATS platforms to scrape.
    """

    name = "greenhouse"
    source_name = "greenhouse"
    api_base_url = "https://boards-api.greenhouse.io/v1/boards"

    # Companies using Greenhouse in natural resources sector
    # Format: (board_token, company_name, industry)
    GREENHOUSE_COMPANIES = [
        # Mining
        ("hudbay", "Hudbay Minerals", "mining"),
        ("eldoradogold", "Eldorado Gold", "mining"),
        ("ssrmining", "SSR Mining", "mining"),
        ("centrragold", "Centerra Gold", "mining"),

        # Oil & Gas
        ("arcresources", "ARC Resources", "oil_gas"),
        ("tourmalineoil", "Tourmaline Oil", "oil_gas"),
        ("whitecapresources", "Whitecap Resources", "oil_gas"),
        ("crescentpointenergy", "Crescent Point Energy", "oil_gas"),

        # Renewable Energy
        ("innergex", "Innergex Renewable Energy", "renewable_energy"),
        ("boralex", "Boralex", "renewable_energy"),
        ("northlandpower", "Northland Power", "renewable_energy"),
        ("algonquinpower", "Algonquin Power", "renewable_energy"),

        # Environmental
        ("ghd", "GHD", "environmental"),
        ("jacobs", "Jacobs Engineering", "environmental"),
        ("tetratech", "Tetra Tech", "environmental"),

        # Forestry
        ("interfor", "Interfor Corporation", "forestry"),
        ("tolko", "Tolko Industries", "forestry"),
    ]

    def __init__(self, companies: str = None, *args, **kwargs):
        """
        Initialize the spider.

        Args:
            companies: Comma-separated list of company board tokens.
        """
        super().__init__(*args, **kwargs)

        if companies:
            company_tokens = [c.strip() for c in companies.split(",")]
            self.companies = [
                c for c in self.GREENHOUSE_COMPANIES
                if c[0] in company_tokens
            ]
        else:
            self.companies = self.GREENHOUSE_COMPANIES

    def start_requests(self) -> Generator[Request, None, None]:
        """Generate API requests for each company."""
        for board_token, company_name, industry in self.companies:
            url = f"{self.api_base_url}/{board_token}/jobs?content=true"

            yield scrapy.Request(
                url=url,
                callback=self.parse_jobs,
                meta={
                    "board_token": board_token,
                    "company_name": company_name,
                    "industry": industry,
                },
                headers={
                    "Accept": "application/json",
                },
            )

    def parse_jobs(self, response) -> Generator[JobItem, None, None]:
        """Parse the jobs API response."""
        meta = response.meta

        try:
            data = json.loads(response.text)
        except json.JSONDecodeError:
            self.logger.error(f"Failed to parse JSON for {meta['company_name']}")
            return

        jobs = data.get("jobs", [])
        self.logger.info(f"Found {len(jobs)} jobs for {meta['company_name']}")

        for job in jobs:
            yield from self._parse_job(job, meta)

    def _parse_job(self, job_data: Dict[str, Any], meta: Dict) -> Generator[JobItem, None, None]:
        """Parse a single job from the API response."""
        job_id = job_data.get("id", "")

        # Extract location
        location_data = job_data.get("location", {})
        location = location_data.get("name", "") if isinstance(location_data, dict) else str(location_data)

        # Extract departments/categories
        departments = job_data.get("departments", [])
        department_names = [d.get("name", "") for d in departments if isinstance(d, dict)]

        # Get job content (description)
        content = job_data.get("content", "")

        # Build job URL
        board_token = meta["board_token"]
        job_url = f"https://boards.greenhouse.io/{board_token}/jobs/{job_id}"

        item = self.create_job_item(
            title=job_data.get("title", ""),
            company_name=meta["company_name"],
            location=location,
            industry=meta["industry"],
            description=self._clean_html(content),
            requirements=", ".join(department_names),
            posted_at=job_data.get("updated_at", job_data.get("created_at", "")),
            source_url=job_url,
            source_id=f"greenhouse_{board_token}_{job_id}",
        )

        self.jobs_scraped += 1
        yield item

    def _clean_html(self, html_content: str) -> str:
        """Remove HTML tags from content."""
        if not html_content:
            return ""

        import re
        # Remove HTML tags
        clean = re.sub(r'<[^>]+>', ' ', html_content)
        # Clean up whitespace
        clean = ' '.join(clean.split())
        return clean

    def parse(self, response):
        """Default parse method."""
        return self.parse_jobs(response)
