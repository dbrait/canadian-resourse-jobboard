/**
 * Indeed Canada RSS Feed Scraper
 *
 * Indeed provides RSS feeds for search results.
 * URL pattern: https://ca.indeed.com/rss?q={query}&l={location}
 *
 * Note: Indeed may block excessive requests. Use responsibly.
 */

import { ScrapedJob } from '../db';
import { generateId, slugify, parseLocation, classifyIndustry, parseSalary } from '../utils';

// Search queries for natural resources jobs
const INDEED_SEARCHES = [
  // Mining
  { query: 'mining engineer', location: 'Canada' },
  { query: 'underground miner', location: 'Canada' },
  { query: 'geologist mining', location: 'Canada' },
  { query: 'drill operator mining', location: 'Canada' },
  { query: 'mill operator', location: 'Canada' },

  // Oil & Gas
  { query: 'drilling engineer', location: 'Alberta' },
  { query: 'pipeline technician', location: 'Alberta' },
  { query: 'rig operator', location: 'Alberta' },
  { query: 'process operator oil gas', location: 'Canada' },
  { query: 'wellsite supervisor', location: 'Alberta' },

  // Forestry
  { query: 'forestry technician', location: 'British Columbia' },
  { query: 'sawmill operator', location: 'Canada' },
  { query: 'logging', location: 'British Columbia' },
  { query: 'silviculture', location: 'Canada' },

  // Agriculture
  { query: 'farm manager', location: 'Canada' },
  { query: 'agronomist', location: 'Canada' },
  { query: 'agricultural technician', location: 'Canada' },
  { query: 'grain elevator', location: 'Saskatchewan' },

  // Fishing
  { query: 'aquaculture technician', location: 'Canada' },
  { query: 'fish plant', location: 'Canada' },
  { query: 'fishing deckhand', location: 'Canada' },

  // Renewable Energy
  { query: 'wind turbine technician', location: 'Canada' },
  { query: 'solar installer', location: 'Canada' },
  { query: 'renewable energy', location: 'Canada' },

  // Environmental
  { query: 'environmental consultant', location: 'Canada' },
  { query: 'environmental engineer', location: 'Canada' },
  { query: 'remediation specialist', location: 'Canada' },

  // General Trades
  { query: 'heavy equipment operator mining', location: 'Canada' },
  { query: 'millwright', location: 'Alberta' },
  { query: 'welder pipeline', location: 'Alberta' },
];

interface IndeedRssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source?: string;
}

function parseIndeedRss(xml: string): IndeedRssItem[] {
  const items: IndeedRssItem[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
  const linkRegex = /<link>(.*?)<\/link>/;
  const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s;
  const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
  const sourceRegex = /<source[^>]*>(.*?)<\/source>/;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const titleMatch = item.match(titleRegex);
    const linkMatch = item.match(linkRegex);
    const descMatch = item.match(descRegex);
    const dateMatch = item.match(pubDateRegex);
    const sourceMatch = item.match(sourceRegex);

    if (titleMatch && linkMatch) {
      items.push({
        title: (titleMatch[1] || titleMatch[2] || '').trim(),
        link: linkMatch[1].trim(),
        description: (descMatch?.[1] || descMatch?.[2] || '').trim(),
        pubDate: dateMatch?.[1] || new Date().toISOString(),
        source: sourceMatch?.[1]?.trim(),
      });
    }
  }

  return items;
}

function extractCompanyFromDescription(description: string): string {
  // Indeed description format: "Company Name - Location - Description..."
  // Or just HTML content
  const cleanDesc = description.replace(/<[^>]*>/g, ' ').trim();

  // Try to find company name patterns
  const dashMatch = cleanDesc.match(/^([^-]+)\s*-/);
  if (dashMatch) {
    return dashMatch[1].trim();
  }

  // Try to find "at Company" pattern
  const atMatch = cleanDesc.match(/at\s+([A-Z][^\-\.\,]+)/i);
  if (atMatch) {
    return atMatch[1].trim();
  }

  return 'Unknown Company';
}

function extractLocationFromDescription(description: string): string {
  // Look for Canadian locations
  const locations = [
    'Calgary', 'Edmonton', 'Vancouver', 'Toronto', 'Montreal',
    'Winnipeg', 'Halifax', 'Saskatoon', 'Regina', 'Ottawa',
    'Fort McMurray', 'Red Deer', 'Lethbridge', 'Medicine Hat',
    'British Columbia', 'Alberta', 'Ontario', 'Quebec',
    'Saskatchewan', 'Manitoba', 'Nova Scotia', 'New Brunswick',
  ];

  const cleanDesc = description.replace(/<[^>]*>/g, ' ');

  for (const loc of locations) {
    if (cleanDesc.toLowerCase().includes(loc.toLowerCase())) {
      // Try to get more specific location
      const regex = new RegExp(`(${loc}[\\s,]*[A-Z]{2})`, 'i');
      const match = cleanDesc.match(regex);
      if (match) return match[1];
      return loc;
    }
  }

  return 'Canada';
}

async function fetchIndeedRss(query: string, location: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    const params = new URLSearchParams({
      q: query,
      l: location,
      sort: 'date',
      fromage: '14', // Last 14 days
    });

    const rssUrl = `https://ca.indeed.com/rss?${params.toString()}`;

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      console.log(`  Indeed RSS for "${query}" returned ${response.status}`);
      return [];
    }

    const xml = await response.text();

    // Check if we got blocked (Cloudflare or captcha)
    if (xml.includes('Just a moment') || xml.includes('captcha')) {
      console.log(`  Indeed RSS blocked for "${query}"`);
      return [];
    }

    const items = parseIndeedRss(xml);

    for (const item of items) {
      const company = item.source || extractCompanyFromDescription(item.description);
      const jobLocation = extractLocationFromDescription(item.description);
      const { province } = parseLocation(jobLocation);
      const industry = classifyIndustry(item.title, item.description, company);

      // Skip non-natural resources jobs
      if (industry === 'other') continue;

      // Clean up description
      const description = item.description
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      jobs.push({
        id: generateId(),
        title: item.title,
        company,
        company_slug: slugify(company),
        location: jobLocation,
        province,
        industry,
        job_type: 'full_time',
        description,
        requirements: [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: item.title.toLowerCase().includes('remote') ||
                   description.toLowerCase().includes('remote'),
        is_fly_in_fly_out: description.toLowerCase().includes('fly in') ||
                           description.toLowerCase().includes('camp') ||
                           description.toLowerCase().includes('fifo'),
        posted_at: new Date(item.pubDate).toISOString(),
        expires_at: null,
        source: 'indeed',
        source_url: item.link,
        scraped_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.log(`  Indeed RSS error for "${query}": ${error}`);
  }

  return jobs;
}

export async function scrapeIndeedRss(): Promise<ScrapedJob[]> {
  console.log('Fetching jobs from Indeed Canada RSS...');
  console.log(`  Running ${INDEED_SEARCHES.length} searches...`);

  const allJobs: ScrapedJob[] = [];
  const seenUrls = new Set<string>();

  for (const search of INDEED_SEARCHES) {
    console.log(`  Searching: "${search.query}" in ${search.location}`);

    const jobs = await fetchIndeedRss(search.query, search.location);

    for (const job of jobs) {
      if (!seenUrls.has(job.source_url)) {
        seenUrls.add(job.source_url);
        allJobs.push(job);
      }
    }

    // Rate limiting - be very respectful with Indeed
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`Total Indeed jobs found: ${allJobs.length}`);
  return allJobs;
}

export default scrapeIndeedRss;
