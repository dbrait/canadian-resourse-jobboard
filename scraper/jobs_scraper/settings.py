"""
Scrapy settings for jobs_scraper project.

Using Zyte infrastructure for enterprise-grade scraping:
- Zyte API for automatic extraction and JavaScript rendering
- Smart Proxy Manager for intelligent proxy rotation
- Scrapy Cloud for managed deployment
"""

import os
from dotenv import load_dotenv

load_dotenv()

BOT_NAME = "jobs_scraper"
SPIDER_MODULES = ["jobs_scraper.spiders"]
NEWSPIDER_MODULE = "jobs_scraper.spiders"

# Crawl responsibly by identifying yourself
USER_AGENT = "ResourcesJobBoard/1.0 (+https://resourcesjobboard.ca)"

# Obey robots.txt rules (Zyte handles this intelligently)
ROBOTSTXT_OBEY = True

# Configure maximum concurrent requests
CONCURRENT_REQUESTS = 16
CONCURRENT_REQUESTS_PER_DOMAIN = 8

# Zyte API handles delays intelligently
DOWNLOAD_DELAY = 0
RANDOMIZE_DOWNLOAD_DELAY = False

# Cookies
COOKIES_ENABLED = True

# =============================================================================
# ZYTE CONFIGURATION (Enterprise Scraping Infrastructure)
# =============================================================================

# Zyte API Key (get from https://app.zyte.com)
ZYTE_API_KEY = os.getenv("ZYTE_API_KEY", "")

# Enable Zyte API for all requests (recommended for production)
ZYTE_API_ENABLED = os.getenv("ZYTE_API_ENABLED", "true").lower() == "true"

if ZYTE_API_ENABLED and ZYTE_API_KEY:
    # Use Zyte API as the download handler
    DOWNLOAD_HANDLERS = {
        "http": "scrapy_zyte_api.ScrapyZyteAPIDownloadHandler",
        "https": "scrapy_zyte_api.ScrapyZyteAPIDownloadHandler",
    }

    # Zyte API settings
    ZYTE_API_TRANSPARENT_MODE = True  # Automatically use Zyte API
    ZYTE_API_BROWSER_HTML = True      # Enable JavaScript rendering
    ZYTE_API_AUTOMATIC_EXTRACTION = True  # Use ML extraction

    # Downloader middlewares for Zyte
    DOWNLOADER_MIDDLEWARES = {
        "scrapy_zyte_api.ScrapyZyteAPIDownloaderMiddleware": 1000,
    }

    # Request fingerprinting for Zyte
    REQUEST_FINGERPRINTER_CLASS = "scrapy_zyte_api.ScrapyZyteAPIRequestFingerprinter"

    # Retry with Zyte
    ZYTE_API_RETRY_POLICY = "zyte_api.retry.zyte_api_retrying"

else:
    # Fallback to Playwright for local development without Zyte
    DOWNLOAD_HANDLERS = {
        "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
        "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    }

    DOWNLOADER_MIDDLEWARES = {
        "jobs_scraper.middlewares.FingerprintMiddleware": 400,
        "scrapy.downloadermiddlewares.useragent.UserAgentMiddleware": None,
        "jobs_scraper.middlewares.RandomUserAgentMiddleware": 500,
    }

# =============================================================================
# ZYTE SMART PROXY MANAGER (Alternative to direct Zyte API)
# For when you want more control but still need enterprise proxies
# =============================================================================

ZYTE_SMARTPROXY_ENABLED = os.getenv("ZYTE_SMARTPROXY_ENABLED", "false").lower() == "true"
ZYTE_SMARTPROXY_APIKEY = os.getenv("ZYTE_API_KEY", "")

if ZYTE_SMARTPROXY_ENABLED:
    # Smart Proxy Manager settings
    DOWNLOADER_MIDDLEWARES.update({
        "scrapy_zyte_smartproxy.ZyteSmartProxyMiddleware": 610,
    })
    ZYTE_SMARTPROXY_URL = "http://proxy.zyte.com:8011"

# =============================================================================
# SPIDER MIDDLEWARES
# =============================================================================

SPIDER_MIDDLEWARES = {
    "jobs_scraper.middlewares.JobsScraperSpiderMiddleware": 543,
}

# =============================================================================
# ITEM PIPELINES
# =============================================================================

ITEM_PIPELINES = {
    "jobs_scraper.pipelines.ValidationPipeline": 100,
    "jobs_scraper.pipelines.NormalizePipeline": 200,
    "jobs_scraper.pipelines.GeocodePipeline": 300,
    "jobs_scraper.pipelines.ClassifyPipeline": 400,
    "jobs_scraper.pipelines.DedupePipeline": 500,
    "jobs_scraper.pipelines.PostgresPipeline": 600,
    "jobs_scraper.pipelines.ElasticsearchPipeline": 700,
}

# =============================================================================
# AUTOTHROTTLE (Zyte handles this, but useful for non-Zyte requests)
# =============================================================================

AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 8.0
AUTOTHROTTLE_DEBUG = False

# =============================================================================
# HTTP CACHING (disabled when using Zyte API - they handle caching)
# =============================================================================

HTTPCACHE_ENABLED = not ZYTE_API_ENABLED
HTTPCACHE_EXPIRATION_SECS = 3600
HTTPCACHE_DIR = "httpcache"
HTTPCACHE_IGNORE_HTTP_CODES = [500, 502, 503, 504, 400, 401, 403, 404]
HTTPCACHE_STORAGE = "scrapy.extensions.httpcache.FilesystemCacheStorage"

# =============================================================================
# RETRY CONFIGURATION
# =============================================================================

RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 408, 429]

# =============================================================================
# CORE SCRAPY SETTINGS
# =============================================================================

REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"

# =============================================================================
# DISTRIBUTED CRAWLING (Redis)
# =============================================================================

# Enable for distributed crawling across multiple Scrapy Cloud units
REDIS_ENABLED = os.getenv("REDIS_ENABLED", "false").lower() == "true"

if REDIS_ENABLED:
    SCHEDULER = "scrapy_redis.scheduler.Scheduler"
    DUPEFILTER_CLASS = "scrapy_redis.dupefilter.RFPDupeFilter"
    SCHEDULER_PERSIST = True
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# =============================================================================
# DATABASE SETTINGS
# =============================================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://resources:resources_dev_password@localhost:5432/resources_job_board"
)

# =============================================================================
# ELASTICSEARCH SETTINGS
# =============================================================================

ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
ELASTICSEARCH_INDEX = "jobs"

# =============================================================================
# PLAYWRIGHT (Fallback for local development)
# =============================================================================

PLAYWRIGHT_BROWSER_TYPE = "chromium"
PLAYWRIGHT_LAUNCH_OPTIONS = {
    "headless": True,
    "timeout": 30000,
}

# =============================================================================
# LOGGING
# =============================================================================

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s [%(name)s] %(levelname)s: %(message)s"

# =============================================================================
# SCRAPY CLOUD SETTINGS (for deployment)
# =============================================================================

# Project ID from Scrapy Cloud
SHUB_PROJECT_ID = os.getenv("SHUB_PROJECT_ID", "")

# Addons for Scrapy Cloud
ADDONS = [
    # Uncomment when deploying to Scrapy Cloud
    # "scrapy_zyte_api.Addon",
]
