/**
 * Canada Job Bank API Scraper
 *
 * The official Government of Canada job board.
 * API Documentation: https://www.jobbank.gc.ca/api
 *
 * This uses the public search endpoint which returns JSON.
 */

import { ScrapedJob } from '../db';
import { generateId, slugify, parseLocation, classifyIndustry } from '../utils';

const JOB_BANK_BASE = 'https://www.jobbank.gc.ca/jobsearch/jobsearch';

// NOC codes for natural resources industries
// https://noc.esdc.gc.ca/
const NOC_SEARCHES = [
  // Mining
  { noc: '8231', title: 'Underground production and development miners' },
  { noc: '8411', title: 'Underground mine service and support workers' },
  { noc: '7372', title: 'Drillers and blasters' },
  { noc: '2113', title: 'Geoscientists and oceanographers' },
  { noc: '2143', title: 'Mining engineers' },

  // Oil & Gas
  { noc: '8412', title: 'Oil and gas well drillers, servicers, testers' },
  { noc: '9232', title: 'Petroleum, gas and chemical process operators' },
  { noc: '2145', title: 'Petroleum engineers' },
  { noc: '7311', title: 'Industrial mechanics (millwrights)' },

  // Forestry
  { noc: '8421', title: 'Chain saw and skidder operators' },
  { noc: '8422', title: 'Silviculture and forestry workers' },
  { noc: '2122', title: 'Forestry professionals' },
  { noc: '9431', title: 'Sawmill machine operators' },

  // Fishing & Agriculture
  { noc: '8261', title: 'Fishing masters and officers' },
  { noc: '8262', title: 'Fishers' },
  { noc: '8431', title: 'General farm workers' },
  { noc: '8252', title: 'Agricultural service contractors' },
  { noc: '2123', title: 'Agricultural representatives, consultants' },

  // Environmental
  { noc: '2121', title: 'Biologists and related scientists' },
  { noc: '2263', title: 'Inspectors in public and environmental health' },

  // General trades used in resources
  { noc: '7237', title: 'Welders' },
  { noc: '7312', title: 'Heavy-duty equipment mechanics' },
  { noc: '7521', title: 'Heavy equipment operators' },
];

// Keyword-based searches for natural resources
const KEYWORD_SEARCHES = [
  'mining',
  'oil gas',
  'drilling',
  'pipeline',
  'forestry',
  'lumber',
  'sawmill',
  'fishing',
  'aquaculture',
  'agriculture',
  'farm',
  'renewable energy',
  'wind turbine',
  'solar',
  'environmental consultant',
  'geologist',
  'millwright',
  'heavy equipment',
];

interface JobBankResult {
  jobs?: Array<{
    jobId: string;
    title: string;
    employer: string;
    location: string;
    salary?: string;
    datePosted: string;
    url: string;
  }>;
}

async function fetchJobBankSearch(query: string): Promise<any[]> {
  try {
    // Job Bank uses a specific URL structure for searches
    const params = new URLSearchParams({
      searchstring: query,
      sort: 'D', // Date descending
      fprov: 'CA', // All of Canada
    });

    const response = await fetch(
      `https://www.jobbank.gc.ca/jobsearch/jobsearch?${params.toString()}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ResourcesJobBoard/1.0 (Educational Project)',
        },
      }
    );

    if (!response.ok) {
      console.log(`Job Bank search for "${query}" returned ${response.status}`);
      return [];
    }

    const text = await response.text();

    // Job Bank returns HTML, not JSON from this endpoint
    // We need to parse the HTML or use their API differently
    // For now, return empty and use the API approach
    return [];
  } catch (error) {
    console.error(`Error fetching Job Bank for "${query}":`, error);
    return [];
  }
}

// Alternative: Use the Job Bank RSS feeds
async function fetchJobBankRss(query: string): Promise<ScrapedJob[]> {
  try {
    const params = new URLSearchParams({
      searchstring: query,
    });

    const rssUrl = `https://www.jobbank.gc.ca/jobsearch/jobsearch/rss?${params.toString()}`;

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'ResourcesJobBoard/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    return parseRssToJobs(xml, query);
  } catch (error) {
    console.error(`Error fetching Job Bank RSS for "${query}":`, error);
    return [];
  }
}

function parseRssToJobs(xml: string, searchQuery: string): ScrapedJob[] {
  const jobs: ScrapedJob[] = [];

  // Simple XML parsing without external library
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
  const linkRegex = /<link>(.*?)<\/link>/;
  const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
  const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const titleMatch = item.match(titleRegex);
    const linkMatch = item.match(linkRegex);
    const descMatch = item.match(descRegex);
    const dateMatch = item.match(pubDateRegex);

    if (!titleMatch || !linkMatch) continue;

    const fullTitle = (titleMatch[1] || titleMatch[2] || '').trim();
    const link = linkMatch[1].trim();
    const description = (descMatch?.[1] || descMatch?.[2] || '').trim();
    const pubDate = dateMatch?.[1] || new Date().toISOString();

    // Parse title format: "Job Title - Company - Location"
    const titleParts = fullTitle.split(' - ');
    const title = titleParts[0] || fullTitle;
    const company = titleParts[1] || 'Unknown Company';
    const location = titleParts[2] || 'Canada';

    const { province } = parseLocation(location);
    const industry = classifyIndustry(title, description, company);

    // Skip if not a natural resources job
    if (industry === 'other') continue;

    jobs.push({
      id: generateId(),
      title,
      company,
      company_slug: slugify(company),
      location,
      province,
      industry,
      job_type: 'full_time',
      description: description || `${title} position at ${company} in ${location}`,
      requirements: [],
      salary_min: null,
      salary_max: null,
      salary_text: null,
      is_remote: false,
      is_fly_in_fly_out: location.toLowerCase().includes('camp') ||
                         location.toLowerCase().includes('remote'),
      posted_at: new Date(pubDate).toISOString(),
      expires_at: null,
      source: 'jobbank',
      source_url: link,
      scraped_at: new Date().toISOString(),
    });
  }

  return jobs;
}

export async function scrapeJobBank(): Promise<ScrapedJob[]> {
  console.log('Fetching jobs from Canada Job Bank...');

  const allJobs: ScrapedJob[] = [];
  const seenUrls = new Set<string>();

  // Search for each keyword
  for (const query of KEYWORD_SEARCHES.slice(0, 5)) { // Limit to 5 for testing
    console.log(`  Searching Job Bank for: ${query}`);

    const jobs = await fetchJobBankRss(query);

    for (const job of jobs) {
      if (!seenUrls.has(job.source_url)) {
        seenUrls.add(job.source_url);
        allJobs.push(job);
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`Found ${allJobs.length} jobs from Job Bank`);
  return allJobs;
}

export default scrapeJobBank;
