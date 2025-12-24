"""
Deduplication pipeline using SimHash.
"""

from simhash import Simhash
from scrapy.exceptions import DropItem


class DedupePipeline:
    """
    Detects and drops duplicate job listings using SimHash.
    """

    def __init__(self):
        self.fingerprints = set()
        self.threshold = 3  # Hamming distance threshold

    def process_item(self, item, spider):
        """Check for duplicates and create fingerprint."""
        # Create text for fingerprinting
        text = " ".join([
            str(item.get("title", "")),
            str(item.get("company_name", "")),
            str(item.get("location", "")),
        ])

        # Generate SimHash
        fingerprint = Simhash(text)
        item["fingerprint"] = str(fingerprint.value)

        # Check for near-duplicates
        for existing in self.fingerprints:
            distance = fingerprint.distance(Simhash(int(existing)))
            if distance <= self.threshold:
                raise DropItem(f"Duplicate job detected (distance={distance})")

        self.fingerprints.add(str(fingerprint.value))
        return item

    def close_spider(self, spider):
        """Log deduplication stats."""
        spider.logger.info(f"Unique jobs fingerprinted: {len(self.fingerprints)}")
