"""
Base spider classes for job scraping.
"""

import scrapy
from abc import abstractmethod
from typing import Generator, Any
from datetime import datetime

from jobs_scraper.items import JobItem


class BaseJobSpider(scrapy.Spider):
    """
    Base class for all job spiders.
    """

    # Override in subclass
    name = "base"
    source_name = "base"

    # Default settings
    custom_settings = {
        "DOWNLOAD_DELAY": 1,
        "RANDOMIZE_DOWNLOAD_DELAY": True,
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.jobs_scraped = 0

    def create_job_item(self, **kwargs) -> JobItem:
        """Create a job item with common fields."""
        item = JobItem()
        item["source"] = self.source_name
        item["scraped_at"] = datetime.utcnow().isoformat()

        for key, value in kwargs.items():
            if key in JobItem.fields:
                item[key] = value

        return item

    @abstractmethod
    def start_requests(self) -> Generator[scrapy.Request, None, None]:
        """Generate initial requests."""
        pass

    @abstractmethod
    def parse(self, response) -> Generator[Any, None, None]:
        """Parse response and yield items or requests."""
        pass

    def closed(self, reason):
        """Called when spider is closed."""
        self.logger.info(f"Spider closed: {reason}. Jobs scraped: {self.jobs_scraped}")


class APISpider(BaseJobSpider):
    """
    Base class for API-based job spiders.
    """

    # Override in subclass
    api_base_url = ""
    api_key = None

    def make_api_request(self, endpoint: str, params: dict = None, callback=None):
        """Make an API request."""
        url = f"{self.api_base_url}{endpoint}"
        headers = {}

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        return scrapy.Request(
            url=url,
            headers=headers,
            callback=callback or self.parse,
            meta={"params": params},
        )


class DynamicSpider(BaseJobSpider):
    """
    Base class for JavaScript-rendered pages using Playwright.
    """

    custom_settings = {
        **BaseJobSpider.custom_settings,
        "DOWNLOAD_HANDLERS": {
            "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
            "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
        },
    }

    def make_playwright_request(
        self,
        url: str,
        callback=None,
        wait_for: str = None,
        wait_time: int = 2000,
    ):
        """Make a request using Playwright."""
        meta = {
            "playwright": True,
            "playwright_include_page": True,
        }

        if wait_for:
            meta["playwright_page_methods"] = [
                {"method": "wait_for_selector", "args": [wait_for]},
            ]
        else:
            meta["playwright_page_methods"] = [
                {"method": "wait_for_timeout", "args": [wait_time]},
            ]

        return scrapy.Request(
            url=url,
            callback=callback or self.parse,
            meta=meta,
        )
