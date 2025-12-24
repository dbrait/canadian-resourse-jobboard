"""
Lever ATS Spider.

Lever is a popular ATS with a clean API structure.

Lever URLs follow the pattern:
- Job board: https://jobs.lever.co/{company}
- API: https://api.lever.co/v0/postings/{company}
"""

import json
from typing import Generator, Dict, Any, List

import scrapy
from scrapy import Request

from jobs_scraper.spiders.base import APISpider
from jobs_scraper.items import JobItem


class LeverSpider(APISpider):
    """
    Spider for Lever-powered career sites.

    Lever provides a public JSON API for job listings.
    """

    name = "lever"
    source_name = "lever"
    api_base_url = "https://api.lever.co/v0/postings"

    # Companies using Lever in natural resources sector
    # Format: (company_slug, company_name, industry)
    LEVER_COMPANIES = [
        # Mining
        ("b2gold", "B2Gold", "mining"),
        ("iamgold", "IAMGOLD", "mining"),
        ("torexgold", "Torex Gold", "mining"),
        ("pretiumresources", "Pretium Resources", "mining"),

        # Oil & Gas
        ("vermilionenergy", "Vermilion Energy", "oil_gas"),
        ("paramountresources", "Paramount Resources", "oil_gas"),
        ("sevengen", "Seven Generations Energy", "oil_gas"),
        ("megenergy", "MEG Energy", "oil_gas"),

        # Renewable Energy
        ("brookfieldrenewable", "Brookfield Renewable", "renewable_energy"),
        ("patternenergy", "Pattern Energy", "renewable_energy"),
        ("bluearthrenewables", "BluEarth Renewables", "renewable_energy"),

        # Agriculture
        ("agtfoods", "AGT Food and Ingredients", "agriculture"),
        ("richardsoninternational", "Richardson International", "agriculture"),

        # Environmental
        ("matrix-solutions", "Matrix Solutions", "environmental"),
        ("dillon-consulting", "Dillon Consulting", "environmental"),

        # Fishing/Aquaculture
        ("cookeaqua", "Cooke Aquaculture", "fishing"),
        ("mikifoods", "High Liner Foods", "fishing"),
    ]

    def __init__(self, companies: str = None, *args, **kwargs):
        """
        Initialize the spider.

        Args:
            companies: Comma-separated list of company slugs.
        """
        super().__init__(*args, **kwargs)

        if companies:
            company_slugs = [c.strip() for c in companies.split(",")]
            self.companies = [
                c for c in self.LEVER_COMPANIES
                if c[0] in company_slugs
            ]
        else:
            self.companies = self.LEVER_COMPANIES

    def start_requests(self) -> Generator[Request, None, None]:
        """Generate API requests for each company."""
        for company_slug, company_name, industry in self.companies:
            url = f"{self.api_base_url}/{company_slug}?mode=json"

            yield scrapy.Request(
                url=url,
                callback=self.parse_jobs,
                meta={
                    "company_slug": company_slug,
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
            jobs = json.loads(response.text)
        except json.JSONDecodeError:
            self.logger.error(f"Failed to parse JSON for {meta['company_name']}")
            return

        if not isinstance(jobs, list):
            self.logger.warning(f"Unexpected response format for {meta['company_name']}")
            return

        self.logger.info(f"Found {len(jobs)} jobs for {meta['company_name']}")

        for job in jobs:
            yield from self._parse_job(job, meta)

    def _parse_job(self, job_data: Dict[str, Any], meta: Dict) -> Generator[JobItem, None, None]:
        """Parse a single job from the API response."""
        job_id = job_data.get("id", "")

        # Extract location
        location = job_data.get("categories", {}).get("location", "")

        # Extract team/department
        team = job_data.get("categories", {}).get("team", "")
        commitment = job_data.get("categories", {}).get("commitment", "")  # Full-time, Part-time, etc.

        # Get description from lists
        description_parts = []
        lists = job_data.get("lists", [])
        for list_item in lists:
            list_text = list_item.get("text", "")
            list_content = list_item.get("content", "")
            if list_text:
                description_parts.append(f"{list_text}:")
            if list_content:
                description_parts.append(self._clean_html(list_content))

        # Also get main description
        main_desc = job_data.get("descriptionPlain", "") or job_data.get("description", "")
        if main_desc:
            description_parts.insert(0, self._clean_html(main_desc))

        description = "\n\n".join(description_parts)

        # Determine job type from commitment
        job_type = self._map_job_type(commitment)

        item = self.create_job_item(
            title=job_data.get("text", ""),
            company_name=meta["company_name"],
            location=location,
            industry=meta["industry"],
            job_type=job_type,
            description=description,
            requirements=team,
            posted_at=self._parse_timestamp(job_data.get("createdAt")),
            source_url=job_data.get("hostedUrl", f"https://jobs.lever.co/{meta['company_slug']}/{job_id}"),
            source_id=f"lever_{meta['company_slug']}_{job_id}",
        )

        self.jobs_scraped += 1
        yield item

    def _clean_html(self, html_content: str) -> str:
        """Remove HTML tags from content."""
        if not html_content:
            return ""

        import re
        clean = re.sub(r'<[^>]+>', ' ', html_content)
        clean = ' '.join(clean.split())
        return clean

    def _map_job_type(self, commitment: str) -> str:
        """Map Lever commitment to job type."""
        if not commitment:
            return "full_time"

        commitment_lower = commitment.lower()
        if "part" in commitment_lower:
            return "part_time"
        elif "contract" in commitment_lower:
            return "contract"
        elif "intern" in commitment_lower:
            return "internship"
        elif "temp" in commitment_lower:
            return "temporary"
        return "full_time"

    def _parse_timestamp(self, timestamp: int) -> str:
        """Convert Unix timestamp to ISO format."""
        if not timestamp:
            return ""

        from datetime import datetime
        try:
            # Lever uses milliseconds
            dt = datetime.fromtimestamp(timestamp / 1000)
            return dt.isoformat()
        except (ValueError, TypeError):
            return ""

    def parse(self, response):
        """Default parse method."""
        return self.parse_jobs(response)
