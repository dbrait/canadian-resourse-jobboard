"""
Data processing pipelines for scraped jobs.
"""

from jobs_scraper.pipelines.validation import ValidationPipeline
from jobs_scraper.pipelines.normalize import NormalizePipeline
from jobs_scraper.pipelines.geocode import GeocodePipeline
from jobs_scraper.pipelines.classify import ClassifyPipeline
from jobs_scraper.pipelines.dedupe import DedupePipeline
from jobs_scraper.pipelines.postgres import PostgresPipeline
from jobs_scraper.pipelines.elasticsearch import ElasticsearchPipeline

__all__ = [
    "ValidationPipeline",
    "NormalizePipeline",
    "GeocodePipeline",
    "ClassifyPipeline",
    "DedupePipeline",
    "PostgresPipeline",
    "ElasticsearchPipeline",
]
