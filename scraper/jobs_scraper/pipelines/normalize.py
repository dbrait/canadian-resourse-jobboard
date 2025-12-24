"""
Normalization pipeline for job data.
"""

import re
from typing import Optional, Tuple


class NormalizePipeline:
    """
    Normalizes job data to consistent formats.
    """

    # Province mappings
    PROVINCE_MAP = {
        # Full names
        "alberta": "AB",
        "british columbia": "BC",
        "saskatchewan": "SK",
        "manitoba": "MB",
        "ontario": "ON",
        "quebec": "QC",
        "new brunswick": "NB",
        "nova scotia": "NS",
        "prince edward island": "PE",
        "newfoundland and labrador": "NL",
        "newfoundland": "NL",
        "yukon": "YT",
        "northwest territories": "NT",
        "nunavut": "NU",
        # Abbreviations
        "ab": "AB",
        "bc": "BC",
        "sk": "SK",
        "mb": "MB",
        "on": "ON",
        "qc": "QC",
        "nb": "NB",
        "ns": "NS",
        "pe": "PE",
        "pei": "PE",
        "nl": "NL",
        "yt": "YT",
        "nt": "NT",
        "nu": "NU",
    }

    # Job type normalization
    JOB_TYPE_MAP = {
        "full-time": "full_time",
        "full time": "full_time",
        "fulltime": "full_time",
        "permanent": "full_time",
        "part-time": "part_time",
        "part time": "part_time",
        "parttime": "part_time",
        "contract": "contract",
        "contractor": "contract",
        "temp": "temporary",
        "temporary": "temporary",
        "seasonal": "temporary",
        "intern": "internship",
        "internship": "internship",
        "co-op": "internship",
        "coop": "internship",
    }

    def process_item(self, item, spider):
        """Normalize the job item."""
        # Normalize location and extract province
        if item.get("location"):
            city, province = self._parse_location(item["location"])
            if city:
                item["city"] = city
            if province:
                item["province"] = province
            item["country"] = "CA"

        # Detect remote work
        item["is_remote"] = self._is_remote(item)

        # Detect fly-in/fly-out
        item["is_fly_in_fly_out"] = self._is_fifo(item)

        # Normalize job type
        if item.get("job_type"):
            item["job_type"] = self._normalize_job_type(item["job_type"])

        # Parse salary
        if item.get("salary_raw"):
            salary_info = self._parse_salary(item["salary_raw"])
            item.update(salary_info)

        return item

    def _parse_location(self, location: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract city and province from location string."""
        if not location:
            return None, None

        location = location.strip()

        # Try to find province
        for name, abbrev in self.PROVINCE_MAP.items():
            if name in location.lower():
                # Extract city (before the province)
                pattern = rf"(.+?)[\s,]+{re.escape(name)}"
                match = re.search(pattern, location, re.IGNORECASE)
                city = match.group(1).strip() if match else None
                return city, abbrev

        return location, None

    def _normalize_job_type(self, job_type: str) -> str:
        """Normalize job type to standard format."""
        normalized = job_type.lower().strip()
        return self.JOB_TYPE_MAP.get(normalized, "full_time")

    def _is_remote(self, item) -> bool:
        """Detect if job is remote."""
        remote_keywords = ["remote", "work from home", "wfh", "virtual", "telecommute"]
        location = str(item.get("location", "")).lower()
        title = str(item.get("title", "")).lower()
        description = str(item.get("description", "")).lower()

        for keyword in remote_keywords:
            if keyword in location or keyword in title or keyword in description:
                return True
        return False

    def _is_fifo(self, item) -> bool:
        """Detect if job is fly-in/fly-out (camp job)."""
        fifo_keywords = [
            "fly-in",
            "fly in",
            "fly-out",
            "fly out",
            "fifo",
            "camp",
            "rotational",
            "rotation",
            "2 weeks on",
            "14 days on",
        ]
        location = str(item.get("location", "")).lower()
        description = str(item.get("description", "")).lower()

        for keyword in fifo_keywords:
            if keyword in location or keyword in description:
                return True
        return False

    def _parse_salary(self, salary_raw: str) -> dict:
        """Parse salary string into structured data."""
        result = {
            "salary_min": None,
            "salary_max": None,
            "salary_currency": "CAD",
            "salary_period": "yearly",
        }

        if not salary_raw:
            return result

        salary_raw = salary_raw.lower()

        # Detect hourly
        if "hour" in salary_raw or "/hr" in salary_raw or "per hour" in salary_raw:
            result["salary_period"] = "hourly"

        # Extract numbers
        numbers = re.findall(r"[\d,]+(?:\.\d+)?", salary_raw.replace(",", ""))
        numbers = [float(n.replace(",", "")) for n in numbers if n]

        if len(numbers) >= 2:
            result["salary_min"] = int(min(numbers))
            result["salary_max"] = int(max(numbers))
        elif len(numbers) == 1:
            result["salary_min"] = int(numbers[0])
            result["salary_max"] = int(numbers[0])

        return result
