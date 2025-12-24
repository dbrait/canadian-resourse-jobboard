"""
Scrapy middlewares for anti-detection and proxy rotation.
"""

import random
from fake_useragent import UserAgent
from scrapy import signals
from scrapy.exceptions import NotConfigured


class RandomUserAgentMiddleware:
    """
    Rotates user agents randomly for each request.
    """

    def __init__(self):
        self.ua = UserAgent()

    def process_request(self, request, spider):
        request.headers["User-Agent"] = self.ua.random


class ProxyMiddleware:
    """
    Rotates proxies using Bright Data.
    """

    def __init__(self, settings):
        self.enabled = settings.getbool("BRIGHT_DATA_ENABLED")
        if not self.enabled:
            raise NotConfigured("Bright Data proxy not enabled")

        self.username = settings.get("BRIGHT_DATA_USERNAME")
        self.password = settings.get("BRIGHT_DATA_PASSWORD")
        self.host = settings.get("BRIGHT_DATA_HOST")
        self.port = settings.getint("BRIGHT_DATA_PORT")

        if not all([self.username, self.password, self.host, self.port]):
            raise NotConfigured("Bright Data credentials not configured")

    @classmethod
    def from_crawler(cls, crawler):
        return cls(crawler.settings)

    def process_request(self, request, spider):
        # Rotate session for each request
        session_id = random.randint(1, 1000000)
        proxy_url = (
            f"http://{self.username}-session-{session_id}:{self.password}"
            f"@{self.host}:{self.port}"
        )
        request.meta["proxy"] = proxy_url


class FingerprintMiddleware:
    """
    Adds browser fingerprint headers to requests.
    """

    ACCEPT_LANGUAGES = [
        "en-CA,en;q=0.9",
        "en-US,en;q=0.9",
        "en-GB,en;q=0.9,en-US;q=0.8",
    ]

    ACCEPT_HEADERS = [
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    ]

    def process_request(self, request, spider):
        request.headers["Accept"] = random.choice(self.ACCEPT_HEADERS)
        request.headers["Accept-Language"] = random.choice(self.ACCEPT_LANGUAGES)
        request.headers["Accept-Encoding"] = "gzip, deflate, br"
        request.headers["Connection"] = "keep-alive"
        request.headers["Upgrade-Insecure-Requests"] = "1"


class JobsScraperSpiderMiddleware:
    """
    Spider middleware for job scraper.
    """

    @classmethod
    def from_crawler(cls, crawler):
        s = cls()
        crawler.signals.connect(s.spider_opened, signal=signals.spider_opened)
        return s

    def process_spider_input(self, response, spider):
        return None

    def process_spider_output(self, response, result, spider):
        for i in result:
            yield i

    def process_spider_exception(self, response, exception, spider):
        pass

    def process_start_requests(self, start_requests, spider):
        for r in start_requests:
            yield r

    def spider_opened(self, spider):
        spider.logger.info(f"Spider opened: {spider.name}")
