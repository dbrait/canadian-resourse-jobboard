"""
Elasticsearch pipeline for indexing jobs.
"""

from elasticsearch import Elasticsearch
from datetime import datetime


class ElasticsearchPipeline:
    """
    Indexes job items in Elasticsearch for search.
    """

    def __init__(self):
        self.client = None
        self.index_name = None

    def open_spider(self, spider):
        """Connect to Elasticsearch."""
        from scrapy.utils.project import get_project_settings
        settings = get_project_settings()

        es_url = settings.get("ELASTICSEARCH_URL")
        self.index_name = settings.get("ELASTICSEARCH_INDEX", "jobs")

        self.client = Elasticsearch([es_url])

        # Create index if not exists
        self._create_index()

    def close_spider(self, spider):
        """Close Elasticsearch connection."""
        if self.client:
            self.client.close()

    def _create_index(self):
        """Create the jobs index with mappings."""
        if self.client.indices.exists(index=self.index_name):
            return

        mappings = {
            "mappings": {
                "properties": {
                    "title": {"type": "text", "analyzer": "english"},
                    "company_name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
                    "location": {"type": "text"},
                    "city": {"type": "keyword"},
                    "province": {"type": "keyword"},
                    "country": {"type": "keyword"},
                    "geo_point": {"type": "geo_point"},
                    "industry": {"type": "keyword"},
                    "job_type": {"type": "keyword"},
                    "salary_min": {"type": "integer"},
                    "salary_max": {"type": "integer"},
                    "salary_period": {"type": "keyword"},
                    "description": {"type": "text", "analyzer": "english"},
                    "requirements": {"type": "text", "analyzer": "english"},
                    "is_remote": {"type": "boolean"},
                    "is_fly_in_fly_out": {"type": "boolean"},
                    "source": {"type": "keyword"},
                    "source_url": {"type": "keyword"},
                    "posted_at": {"type": "date"},
                    "expires_at": {"type": "date"},
                    "scraped_at": {"type": "date"},
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "analysis": {
                    "analyzer": {
                        "english": {
                            "type": "english"
                        }
                    }
                }
            }
        }

        self.client.indices.create(index=self.index_name, body=mappings)

    def process_item(self, item, spider):
        """Index job in Elasticsearch."""
        try:
            doc = {
                "title": item.get("title"),
                "company_name": item.get("company_name"),
                "location": item.get("location"),
                "city": item.get("city"),
                "province": item.get("province"),
                "country": item.get("country", "CA"),
                "industry": item.get("industry"),
                "job_type": item.get("job_type"),
                "salary_min": item.get("salary_min"),
                "salary_max": item.get("salary_max"),
                "salary_period": item.get("salary_period"),
                "description": item.get("description"),
                "requirements": item.get("requirements"),
                "is_remote": item.get("is_remote", False),
                "is_fly_in_fly_out": item.get("is_fly_in_fly_out", False),
                "source": item.get("source"),
                "source_url": item.get("source_url"),
                "posted_at": item.get("posted_at"),
                "expires_at": item.get("expires_at"),
                "scraped_at": item.get("scraped_at"),
            }

            # Add geo point if coordinates available
            if item.get("latitude") and item.get("longitude"):
                doc["geo_point"] = {
                    "lat": item.get("latitude"),
                    "lon": item.get("longitude"),
                }

            # Use source + source_id as document ID for upsert
            doc_id = f"{item.get('source')}_{item.get('source_id')}"

            self.client.index(
                index=self.index_name,
                id=doc_id,
                document=doc,
            )

            spider.logger.debug(f"Indexed job: {item.get('title')}")

        except Exception as e:
            spider.logger.error(f"Failed to index job: {e}")

        return item
