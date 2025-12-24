"""
Validation pipeline for scraped job items.
"""

from scrapy.exceptions import DropItem
from datetime import datetime


class ValidationPipeline:
    """
    Validates job items and drops invalid ones.
    """

    required_fields = ["title", "company_name", "source", "source_url"]
    max_title_length = 500
    max_description_length = 50000

    def process_item(self, item, spider):
        """Validate the job item."""
        # Check required fields
        for field in self.required_fields:
            if not item.get(field):
                raise DropItem(f"Missing required field: {field}")

        # Validate title
        title = item.get("title", "").strip()
        if len(title) > self.max_title_length:
            item["title"] = title[: self.max_title_length]
        if not title:
            raise DropItem("Empty title after stripping")

        # Validate description
        description = item.get("description", "")
        if description and len(description) > self.max_description_length:
            item["description"] = description[: self.max_description_length]

        # Set scraped_at timestamp
        if not item.get("scraped_at"):
            item["scraped_at"] = datetime.utcnow().isoformat()

        # Clean up whitespace in text fields
        text_fields = ["title", "company_name", "location", "description", "requirements"]
        for field in text_fields:
            if item.get(field):
                item[field] = " ".join(str(item[field]).split())

        return item
