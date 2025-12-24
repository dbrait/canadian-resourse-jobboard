"""
Workday ATS Spider.

Workday is used by ~40% of Fortune 500 companies including many in natural resources:
- Suncor Energy
- Teck Resources
- Nutrien
- TC Energy
- Cenovus
- And many more...

Workday sites are heavily JavaScript-rendered, requiring browser automation.
With Zyte API, we use their browser mode for automatic JS rendering.
"""

import json
import re
from typing import Generator, List, Dict, Any
from urllib.parse import urljoin, urlparse

import scrapy
from scrapy import Request

from jobs_scraper.spiders.base import BaseJobSpider
from jobs_scraper.items import JobItem


class WorkdaySpider(BaseJobSpider):
    """
    Spider for Workday-powered career sites.

    Workday career sites follow a consistent URL pattern:
    https://{company}.wd{1-5}.myworkdayjobs.com/{tenant}/jobs

    The job data is loaded via JavaScript and can be extracted from
    the page's embedded JSON or via Zyte's automatic extraction.
    """

    name = "workday"
    source_name = "workday"

    # Companies using Workday in natural resources sector
    # Format: (company_slug, workday_tenant, company_name, industry)
    WORKDAY_COMPANIES = [
        # Mining
        ("teck", "Teck", "Teck Resources", "mining"),
        ("baraborto", "Barrick", "Barrick Gold", "mining"),
        ("kinross", "Kinross", "Kinross Gold", "mining"),
        ("agnicoeagle", "External", "Agnico Eagle Mines", "mining"),
        ("fqm", "FQM", "First Quantum Minerals", "mining"),
        ("lundinmining", "External", "Lundin Mining", "mining"),
        ("cameco", "Cameco", "Cameco Corporation", "mining"),
        ("nutrien", "Nutrien", "Nutrien", "mining"),

        # Oil & Gas
        ("saborncor", "Suncor", "Suncor Energy", "oil_gas"),
        ("cabornovus", "Cenovus", "Cenovus Energy", "oil_gas"),
        ("tcaborenergy", "TCEnergy", "TC Energy", "oil_gas"),
        ("enbridge", "Enbridge", "Enbridge", "oil_gas"),
        ("imperialoil", "Imperial", "Imperial Oil", "oil_gas"),
        ("pembina", "Pembina", "Pembina Pipeline", "oil_gas"),

        # Forestry
        ("westfraser", "WestFraser", "West Fraser Timber", "forestry"),
        ("canfor", "Canfor", "Canfor Corporation", "forestry"),

        # Agriculture
        ("nutrien", "Nutrien", "Nutrien", "agriculture"),
        ("cargill", "Cargill", "Cargill Canada", "agriculture"),

        # Renewable Energy
        ("transalta", "TransAlta", "TransAlta Corporation", "renewable_energy"),
        ("capitalpower", "CapitalPower", "Capital Power", "renewable_energy"),

        # Environmental
        ("stantec", "Stantec", "Stantec", "environmental"),
        ("wsp", "WSP", "WSP Canada", "environmental"),
        ("aecom", "AECOM", "AECOM Canada", "environmental"),
    ]

    custom_settings = {
        "DOWNLOAD_DELAY": 2,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 2,
        # Zyte API settings for JavaScript rendering
        "ZYTE_API_BROWSER_HTML": True,
    }

    def __init__(self, companies: str = None, *args, **kwargs):
        """
        Initialize the spider.

        Args:
            companies: Comma-separated list of company slugs to scrape.
                      If not provided, scrapes all companies.
        """
        super().__init__(*args, **kwargs)

        if companies:
            company_slugs = [c.strip() for c in companies.split(",")]
            self.companies = [
                c for c in self.WORKDAY_COMPANIES
                if c[0] in company_slugs
            ]
        else:
            self.companies = self.WORKDAY_COMPANIES

    def start_requests(self) -> Generator[Request, None, None]:
        """Generate requests for each Workday company."""
        for company_slug, tenant, company_name, industry in self.companies:
            # Workday career sites typically use wd1-wd5 subdomains
            for wd_num in [1, 3, 5]:
                url = f"https://{company_slug}.wd{wd_num}.myworkdayjobs.com/{tenant}/jobs"

                yield scrapy.Request(
                    url=url,
                    callback=self.parse_job_listing,
                    meta={
                        "company_slug": company_slug,
                        "company_name": company_name,
                        "industry": industry,
                        "tenant": tenant,
                        "zyte_api_automap": {
                            "browserHtml": True,
                            "javascript": True,
                        },
                    },
                    errback=self.handle_error,
                    dont_filter=True,
                )
                break  # Try first URL, if it fails errback will handle

    def parse_job_listing(self, response) -> Generator:
        """Parse the job listing page."""
        company_name = response.meta["company_name"]
        company_slug = response.meta["company_slug"]
        industry = response.meta["industry"]

        self.logger.info(f"Parsing jobs for {company_name}")

        # Try to extract job data from embedded JSON
        jobs_data = self._extract_jobs_json(response)

        if jobs_data:
            for job in jobs_data:
                yield from self._parse_job_from_json(job, response.meta)
        else:
            # Fallback: Parse from HTML
            yield from self._parse_jobs_from_html(response)

        # Handle pagination
        next_page = response.css('button[data-automation-id="paginationNextBtn"]::attr(href)').get()
        if not next_page:
            # Try alternate pagination patterns
            next_page = response.css('a[aria-label="next page"]::attr(href)').get()

        if next_page:
            yield response.follow(
                next_page,
                callback=self.parse_job_listing,
                meta=response.meta,
            )

    def _extract_jobs_json(self, response) -> List[Dict[str, Any]]:
        """Extract job data from embedded JSON in the page."""
        # Workday embeds job data in script tags
        scripts = response.css('script::text').getall()

        for script in scripts:
            # Look for job listing data
            if 'jobPostings' in script or 'jobResults' in script:
                try:
                    # Extract JSON object
                    match = re.search(r'\{.*"jobPostings".*\}', script, re.DOTALL)
                    if match:
                        data = json.loads(match.group())
                        return data.get('jobPostings', [])
                except json.JSONDecodeError:
                    continue

        return []

    def _parse_job_from_json(self, job_data: Dict, meta: Dict) -> Generator[JobItem, None, None]:
        """Parse a job from JSON data."""
        job_id = job_data.get('bulletFields', [{}])[0].get('value', '') or job_data.get('id', '')

        item = self.create_job_item(
            title=job_data.get('title', ''),
            company_name=meta['company_name'],
            location=job_data.get('locationsText', ''),
            industry=meta['industry'],
            description=job_data.get('description', ''),
            posted_at=job_data.get('postedOn', ''),
            source_url=job_data.get('externalPath', ''),
            source_id=f"workday_{meta['company_slug']}_{job_id}",
        )

        self.jobs_scraped += 1
        yield item

    def _parse_jobs_from_html(self, response) -> Generator[JobItem, None, None]:
        """Parse jobs from HTML as fallback."""
        meta = response.meta

        # Common Workday job card selectors
        job_cards = response.css('li[data-automation-id="jobItem"], div.job-result')

        for card in job_cards:
            title = card.css('a[data-automation-id="jobTitle"]::text, h3 a::text').get()
            location = card.css('dd[data-automation-id="locations"]::text, .location::text').get()
            job_url = card.css('a[data-automation-id="jobTitle"]::attr(href), h3 a::attr(href)').get()

            if title and job_url:
                # Get full job details
                full_url = urljoin(response.url, job_url)

                yield scrapy.Request(
                    url=full_url,
                    callback=self.parse_job_detail,
                    meta={
                        **meta,
                        "title": title.strip(),
                        "location": location.strip() if location else "",
                        "zyte_api_automap": {
                            "browserHtml": True,
                        },
                    },
                )

    def parse_job_detail(self, response) -> Generator[JobItem, None, None]:
        """Parse individual job detail page."""
        meta = response.meta

        # Extract description
        description = response.css(
            'div[data-automation-id="jobPostingDescription"]::text, '
            'div.job-description *::text'
        ).getall()
        description = ' '.join(description).strip()

        # Extract job ID from URL
        job_id = urlparse(response.url).path.split('/')[-1]

        item = self.create_job_item(
            title=meta.get('title', response.css('h1::text').get('')),
            company_name=meta['company_name'],
            location=meta.get('location', ''),
            industry=meta['industry'],
            description=description,
            source_url=response.url,
            source_id=f"workday_{meta['company_slug']}_{job_id}",
        )

        self.jobs_scraped += 1
        yield item

    def handle_error(self, failure):
        """Handle request errors."""
        self.logger.warning(f"Request failed: {failure.request.url}")

    def parse(self, response):
        """Default parse method - redirects to parse_job_listing."""
        return self.parse_job_listing(response)
