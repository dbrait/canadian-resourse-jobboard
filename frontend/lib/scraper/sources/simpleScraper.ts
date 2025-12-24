import axios from 'axios';
import { ScrapedJob } from '../db';
import {
  generateId,
  slugify,
  parseLocation,
  classifyIndustry,
  parseSalary,
  parseJobType,
  isRemoteJob,
  isFlyInFlyOut,
  cleanHtml,
} from '../utils';

// Simple HTML parsing without cheerio (uses regex)
function extractText(html: string, tagPattern: RegExp): string[] {
  const matches: string[] = [];
  let match;
  while ((match = tagPattern.exec(html)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

function extractAttribute(html: string, attr: string): string | null {
  const pattern = new RegExp(`${attr}=["']([^"']+)["']`, 'i');
  const match = html.match(pattern);
  return match ? match[1] : null;
}

// Simplified Indeed RSS scraper using regex parsing
const INDEED_QUERIES = [
  { q: 'mining', l: 'Canada' },
  { q: 'oil gas', l: 'Alberta' },
  { q: 'drilling', l: 'Alberta' },
  { q: 'forestry', l: 'British Columbia' },
  { q: 'agriculture', l: 'Saskatchewan' },
  { q: 'renewable energy', l: 'Ontario' },
  { q: 'environmental consultant', l: 'Canada' },
  { q: 'heavy equipment operator', l: 'Canada' },
  { q: 'geologist', l: 'Canada' },
  { q: 'pipeline', l: 'Alberta' },
];

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function parseRSSItems(xml: string): RSSItem[] {
  const items: RSSItem[] = [];

  // Extract all <item>...</item> blocks
  const itemPattern = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;

  while ((itemMatch = itemPattern.exec(xml)) !== null) {
    const itemXml = itemMatch[1];

    // Extract fields
    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
    const linkMatch = itemXml.match(/<link>(.*?)<\/link>|<guid[^>]*>(.*?)<\/guid>/);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
    const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s);

    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
    const link = linkMatch ? (linkMatch[1] || linkMatch[2] || '').trim() : '';
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
    const description = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : '';

    if (title && link) {
      items.push({ title, link, pubDate, description });
    }
  }

  return items;
}

function parseDescriptionForCompanyLocation(description: string): { company: string; location: string; summary: string } {
  // Clean HTML
  const cleaned = cleanHtml(description);

  // Indeed format is often: "Company - Location - Description"
  const parts = cleaned.split(' - ').map(p => p.trim());

  if (parts.length >= 3) {
    return {
      company: parts[0],
      location: parts[1],
      summary: parts.slice(2).join(' - '),
    };
  } else if (parts.length === 2) {
    return {
      company: parts[0],
      location: '',
      summary: parts[1],
    };
  }

  return {
    company: 'Unknown Company',
    location: '',
    summary: cleaned,
  };
}

export async function scrapeIndeedRSS(): Promise<ScrapedJob[]> {
  const allJobs: ScrapedJob[] = [];
  const seenUrls = new Set<string>();

  console.log('Starting Indeed RSS scraper...');

  for (const { q, l } of INDEED_QUERIES) {
    console.log(`Fetching Indeed RSS for "${q}" in ${l}...`);

    try {
      const rssUrl = `https://ca.indeed.com/rss?q=${encodeURIComponent(q)}&l=${encodeURIComponent(l)}&sort=date`;

      const response = await axios.get(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml,application/xml,text/xml,*/*',
        },
        timeout: 30000,
        responseType: 'text',
      });

      const items = parseRSSItems(response.data);
      console.log(`Found ${items.length} items for "${q}"`);

      for (const item of items.slice(0, 15)) {
        if (seenUrls.has(item.link)) continue;
        seenUrls.add(item.link);

        const { company, location, summary } = parseDescriptionForCompanyLocation(item.description);
        const { city, province } = parseLocation(location || l);
        const salaryData = parseSalary(summary);
        const industry = classifyIndustry(item.title, summary, company);

        let postedAt = new Date().toISOString();
        if (item.pubDate) {
          try {
            postedAt = new Date(item.pubDate).toISOString();
          } catch {
            // Keep default
          }
        }

        const job: ScrapedJob = {
          id: generateId(),
          title: item.title,
          company,
          company_slug: slugify(company),
          location: location || city || l,
          province,
          industry,
          job_type: parseJobType(item.title + ' ' + summary),
          description: summary || 'See original listing for full details.',
          requirements: [],
          salary_min: salaryData.min,
          salary_max: salaryData.max,
          salary_text: salaryData.text,
          is_remote: isRemoteJob(item.title + ' ' + summary),
          is_fly_in_fly_out: isFlyInFlyOut(summary + ' ' + location),
          posted_at: postedAt,
          expires_at: null,
          source: 'indeed',
          source_url: item.link,
          scraped_at: new Date().toISOString(),
        };

        allJobs.push(job);
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Error fetching Indeed RSS for "${q}":`, error);
    }
  }

  console.log(`Indeed RSS scraper completed. Total jobs: ${allJobs.length}`);
  return allJobs;
}

// Simple Job Bank scraper
const JOBBANK_SEARCHES = [
  'mining',
  'oil gas',
  'forestry',
  'agriculture',
  'renewable energy',
  'environmental',
];

export async function scrapeJobBankSimple(): Promise<ScrapedJob[]> {
  const allJobs: ScrapedJob[] = [];
  const seenUrls = new Set<string>();

  console.log('Starting Job Bank scraper...');

  for (const term of JOBBANK_SEARCHES) {
    console.log(`Searching Job Bank for "${term}"...`);

    try {
      // Job Bank has an API endpoint
      const apiUrl = `https://www.jobbank.gc.ca/api/jobsearch/jobsearch?searchstring=${encodeURIComponent(term)}&sort=D&page=1`;

      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      // If we get JSON data
      if (response.data && response.data.results) {
        const results = response.data.results.slice(0, 10);
        console.log(`Found ${results.length} results for "${term}"`);

        for (const result of results) {
          const jobUrl = `https://www.jobbank.gc.ca/jobsearch/jobposting/${result.id}`;

          if (seenUrls.has(jobUrl)) continue;
          seenUrls.add(jobUrl);

          const { city, province } = parseLocation(result.location || '');
          const salaryData = parseSalary(result.salary || '');
          const industry = classifyIndustry(result.title || '', result.description || '', result.employer || '');

          const job: ScrapedJob = {
            id: generateId(),
            title: result.title || 'Unknown Position',
            company: result.employer || 'Unknown Company',
            company_slug: slugify(result.employer || 'unknown'),
            location: result.location || '',
            province,
            industry,
            job_type: parseJobType(result.jobType || 'full_time'),
            description: result.description || 'See original listing for full details.',
            requirements: [],
            salary_min: salaryData.min,
            salary_max: salaryData.max,
            salary_text: salaryData.text || result.salary || null,
            is_remote: isRemoteJob(result.title + ' ' + (result.description || '')),
            is_fly_in_fly_out: isFlyInFlyOut((result.description || '') + ' ' + (result.location || '')),
            posted_at: result.postedDate ? new Date(result.postedDate).toISOString() : new Date().toISOString(),
            expires_at: null,
            source: 'jobbank',
            source_url: jobUrl,
            scraped_at: new Date().toISOString(),
          };

          allJobs.push(job);
        }
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error fetching Job Bank for "${term}":`, error);
    }
  }

  console.log(`Job Bank scraper completed. Total jobs: ${allJobs.length}`);
  return allJobs;
}

export default { scrapeIndeedRSS, scrapeJobBankSimple };
