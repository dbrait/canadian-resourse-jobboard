import { ScrapedJob } from './db';

// Generate a unique ID
export function generateId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Normalize company name to slug
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Canadian provinces mapping
export const PROVINCES: Record<string, string> = {
  'ab': 'AB', 'alberta': 'AB',
  'bc': 'BC', 'british columbia': 'BC',
  'mb': 'MB', 'manitoba': 'MB',
  'nb': 'NB', 'new brunswick': 'NB',
  'nl': 'NL', 'newfoundland': 'NL', 'newfoundland and labrador': 'NL',
  'ns': 'NS', 'nova scotia': 'NS',
  'nt': 'NT', 'northwest territories': 'NT',
  'nu': 'NU', 'nunavut': 'NU',
  'on': 'ON', 'ontario': 'ON',
  'pe': 'PE', 'pei': 'PE', 'prince edward island': 'PE',
  'qc': 'QC', 'quebec': 'QC', 'québec': 'QC',
  'sk': 'SK', 'saskatchewan': 'SK',
  'yt': 'YT', 'yukon': 'YT',
};

// Parse location to extract province
export function parseLocation(location: string): { city: string; province: string } {
  const normalized = location.toLowerCase().trim();

  // Check for province at the end (e.g., "Calgary, AB" or "Calgary, Alberta")
  const parts = location.split(',').map(p => p.trim());

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].toLowerCase();
    // Remove "Canada" if present
    const provincePart = lastPart.replace(/\s*canada\s*/i, '').trim();
    const province = PROVINCES[provincePart];

    if (province) {
      const city = parts.slice(0, -1).join(', ').trim();
      return { city: city || location, province };
    }
  }

  // Check for province anywhere in the string
  for (const [key, value] of Object.entries(PROVINCES)) {
    if (key.length > 2 && normalized.includes(key)) {
      return { city: location, province: value };
    }
  }

  // Default to empty province
  return { city: location, province: '' };
}

// Industry keywords for classification
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  mining: [
    'mining', 'mine', 'miner', 'gold', 'copper', 'uranium', 'potash',
    'mineral', 'ore', 'extraction', 'geologist', 'metallurg', 'assay',
    'drill', 'blast', 'underground', 'open pit', 'tailings'
  ],
  oil_gas: [
    'oil', 'gas', 'petroleum', 'drilling', 'pipeline', 'refinery',
    'wellsite', 'fracking', 'oilfield', 'rig', 'upstream', 'downstream',
    'midstream', 'lng', 'bitumen', 'oilsands', 'oil sands', 'suncor',
    'cenovus', 'cnrl', 'enbridge', 'tc energy', 'imperial oil'
  ],
  forestry: [
    'forestry', 'forest', 'lumber', 'logging', 'pulp', 'paper',
    'sawmill', 'timber', 'wood', 'silviculture', 'harvesting'
  ],
  fishing: [
    'fishing', 'fish', 'aquaculture', 'seafood', 'marine', 'vessel',
    'trawl', 'hatchery', 'salmon', 'shellfish', 'lobster', 'crab'
  ],
  agriculture: [
    'agriculture', 'farm', 'farming', 'crop', 'livestock', 'grain',
    'cattle', 'dairy', 'poultry', 'agri', 'harvest', 'seed', 'fertilizer'
  ],
  renewable_energy: [
    'renewable', 'solar', 'wind', 'hydro', 'turbine', 'clean energy',
    'green energy', 'power generation', 'electrical grid', 'battery storage'
  ],
  environmental: [
    'environmental', 'environment', 'ecology', 'remediation', 'sustainability',
    'conservation', 'reclamation', 'assessment', 'compliance', 'ehs', 'hse'
  ],
};

// Classify job into industry
export function classifyIndustry(title: string, description: string, company: string): string {
  const text = `${title} ${description} ${company}`.toLowerCase();

  let bestMatch = 'general';
  let bestScore = 0;

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = industry;
    }
  }

  return bestMatch;
}

// Parse salary from text
export function parseSalary(text: string): { min: number | null; max: number | null; text: string | null } {
  if (!text) return { min: null, max: null, text: null };

  const normalized = text.toLowerCase().replace(/,/g, '');

  // Match ranges like "$80,000 - $100,000" or "$80k-$100k"
  const rangeMatch = normalized.match(/\$?\s*(\d+(?:\.\d+)?)\s*k?\s*[-–to]+\s*\$?\s*(\d+(?:\.\d+)?)\s*k?/);
  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1]);
    let max = parseFloat(rangeMatch[2]);

    // If values are small, assume they're in thousands
    if (min < 500) min *= 1000;
    if (max < 500) max *= 1000;

    return { min, max, text };
  }

  // Match single values like "$80,000" or "$45/hour"
  const singleMatch = normalized.match(/\$?\s*(\d+(?:\.\d+)?)\s*(k|per hour|\/hour|\/hr|hourly)?/);
  if (singleMatch) {
    let value = parseFloat(singleMatch[1]);
    const unit = singleMatch[2];

    if (unit === 'k') {
      value *= 1000;
    } else if (unit && unit.includes('hour')) {
      // Convert hourly to annual (2080 hours/year)
      value *= 2080;
    } else if (value < 500) {
      value *= 1000;
    }

    return { min: value, max: null, text };
  }

  // Check for "competitive", "negotiable", etc.
  if (normalized.includes('competitive') || normalized.includes('negotiable') || normalized.includes('doe')) {
    return { min: null, max: null, text: 'Competitive' };
  }

  return { min: null, max: null, text: null };
}

// Determine job type
export function parseJobType(text: string): string {
  const normalized = text.toLowerCase();

  if (normalized.includes('contract') || normalized.includes('temporary')) {
    return 'contract';
  }
  if (normalized.includes('part-time') || normalized.includes('part time')) {
    return 'part_time';
  }
  if (normalized.includes('intern')) {
    return 'internship';
  }

  return 'full_time';
}

// Check if job is remote
export function isRemoteJob(text: string): boolean {
  const normalized = text.toLowerCase();
  return normalized.includes('remote') ||
         normalized.includes('work from home') ||
         normalized.includes('wfh') ||
         normalized.includes('virtual');
}

// Check if job is fly-in/fly-out
export function isFlyInFlyOut(text: string): boolean {
  const normalized = text.toLowerCase();
  return normalized.includes('fly-in') ||
         normalized.includes('fly in fly out') ||
         normalized.includes('fifo') ||
         normalized.includes('rotational') ||
         normalized.includes('camp');
}

// Clean HTML from text
export function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract requirements from description
export function extractRequirements(description: string): string[] {
  const requirements: string[] = [];
  const lines = description.split(/[\n\r]+/);

  let inRequirementsSection = false;

  for (const line of lines) {
    const normalized = line.toLowerCase().trim();

    // Check if we're entering a requirements section
    if (normalized.includes('requirement') || normalized.includes('qualification') ||
        normalized.includes('what you need') || normalized.includes('must have')) {
      inRequirementsSection = true;
      continue;
    }

    // Check if we're leaving the requirements section
    if (inRequirementsSection && (
      normalized.includes('responsibilit') ||
      normalized.includes('what you') ||
      normalized.includes('about us') ||
      normalized.includes('benefits')
    )) {
      inRequirementsSection = false;
      continue;
    }

    // Extract bullet points
    if (inRequirementsSection || line.match(/^[\s]*[-•*]\s+/)) {
      const cleaned = line.replace(/^[\s]*[-•*]\s+/, '').trim();
      if (cleaned.length > 10 && cleaned.length < 500) {
        requirements.push(cleaned);
      }
    }
  }

  return requirements.slice(0, 10); // Limit to 10 requirements
}
