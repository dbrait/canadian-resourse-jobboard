"""
Geocoding pipeline for job locations.
"""

import os
from geopy.geocoders import GoogleV3, Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError


class GeocodePipeline:
    """
    Geocodes job locations to latitude/longitude coordinates.
    """

    def __init__(self):
        self.geocoder = None
        self.cache = {}

    def open_spider(self, spider):
        """Initialize geocoder."""
        google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if google_api_key:
            self.geocoder = GoogleV3(api_key=google_api_key)
        else:
            self.geocoder = Nominatim(user_agent="ResourcesJobBoard/1.0")

    def process_item(self, item, spider):
        """Geocode the job location."""
        if item.get("latitude") and item.get("longitude"):
            return item

        location_key = f"{item.get('city', '')}, {item.get('province', '')}, Canada"

        if not location_key.strip(", Canada"):
            return item

        # Check cache
        if location_key in self.cache:
            coords = self.cache[location_key]
            item["latitude"] = coords[0]
            item["longitude"] = coords[1]
            return item

        # Geocode
        try:
            location = self.geocoder.geocode(location_key, timeout=5)
            if location:
                item["latitude"] = location.latitude
                item["longitude"] = location.longitude
                self.cache[location_key] = (location.latitude, location.longitude)
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            spider.logger.warning(f"Geocoding failed for {location_key}: {e}")

        return item
