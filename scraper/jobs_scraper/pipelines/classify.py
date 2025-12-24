"""
Industry classification pipeline for jobs.
"""

import re
from typing import Optional


class ClassifyPipeline:
    """
    Classifies jobs into industry categories using keyword matching.
    Future: Replace with ML model for better accuracy.
    """

    INDUSTRY_KEYWORDS = {
        "mining": [
            "mining", "mine", "miner", "geologist", "geology", "metallurgy",
            "ore", "mineral", "drill", "blast", "gold", "copper", "uranium",
            "potash", "nickel", "iron ore", "diamond", "coal", "quarry",
            "exploration", "assay", "mill", "tailings", "concentrate",
        ],
        "oil_gas": [
            "oil", "gas", "petroleum", "drilling", "rig", "pipeline",
            "refinery", "upstream", "downstream", "wellsite", "oilfield",
            "natural gas", "lng", "fracking", "hydraulic fracturing",
            "production operator", "derrick", "roughneck", "mudlogger",
            "completions", "wellhead", "reservoir", "seismic",
        ],
        "forestry": [
            "forestry", "forest", "lumber", "logging", "sawmill", "pulp",
            "paper", "timber", "woodlands", "silviculture", "harvesting",
            "feller", "skidder", "log", "wood", "plywood", "veneer",
            "forester", "tree planter", "dendrologist",
        ],
        "fishing": [
            "fishing", "fish", "seafood", "aquaculture", "fishery",
            "salmon", "crab", "lobster", "shrimp", "shellfish",
            "processing plant", "trawler", "vessel", "captain",
            "deckhand", "marine harvest", "hatchery",
        ],
        "agriculture": [
            "agriculture", "farm", "farming", "agricultural", "crop",
            "livestock", "dairy", "grain", "wheat", "canola", "cattle",
            "poultry", "hog", "agri", "fertilizer", "seed", "harvest",
            "agronomist", "ranch", "feedlot", "irrigation",
        ],
        "renewable_energy": [
            "renewable", "solar", "wind", "hydro", "hydroelectric",
            "wind turbine", "solar panel", "clean energy", "green energy",
            "sustainability", "battery", "energy storage", "geothermal",
            "biomass", "power generation", "transmission",
        ],
        "environmental": [
            "environmental", "environment", "ecology", "ecologist",
            "remediation", "assessment", "contamination", "cleanup",
            "eia", "sustainability", "conservation", "wildlife",
            "water quality", "air quality", "compliance", "reclamation",
            "habitat", "biodiversity", "esg",
        ],
    }

    def process_item(self, item, spider):
        """Classify the job by industry."""
        if item.get("industry"):
            return item

        industry = self._classify(item)
        if industry:
            item["industry"] = industry

        return item

    def _classify(self, item) -> Optional[str]:
        """Determine industry based on keyword matching."""
        text = " ".join([
            str(item.get("title", "")),
            str(item.get("company_name", "")),
            str(item.get("description", ""))[:2000],  # Limit description
        ]).lower()

        scores = {}
        for industry, keywords in self.INDUSTRY_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text)
            if score > 0:
                scores[industry] = score

        if scores:
            return max(scores, key=scores.get)

        return None
