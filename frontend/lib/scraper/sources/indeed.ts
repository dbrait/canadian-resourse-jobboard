import axios from 'axios';
import * as cheerio from 'cheerio';
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
  extractRequirements,
} from '../utils';

// Indeed RSS feeds for Canada - natural resources keywords
const SEARCH_QUERIES = [
  { q: 'mining', l: 'Canada' },
  { q: 'oil gas', l: 'Alberta' },
  { q: 'forestry', l: 'British Columbia' },
  { q: 'agriculture', l: 'Saskatchewan' },
  { q: 'renewable energy', l: 'Canada' },
  { q: 'environmental consultant', l: 'Canada' },
  { q: 'drilling', l: 'Alberta' },
  { q: 'heavy equipment operator', l: 'Canada' },
  { q: 'geologist', l: 'Canada' },
  { q: 'pipeline', l: 'Canada' },
];

interface IndeedJob {
  title: string;
  company: string;
  location: string;
  summary: string;
  url: string;
  pubDate: string;
}

async function searchIndeedRSS(query: string, location: string): Promise<IndeedJob[]> {
  const jobs: IndeedJob[] = [];

  try {
    // Indeed RSS feed URL
    const rssUrl = `https://ca.indeed.com/rss?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&sort=date`;

    const response = await axios.get(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data, { xmlMode: true });

    $('item').each((_, el) => {
      const $el = $(el);

      const title = $el.find('title').text().trim();
      const link = $el.find('link').text().trim() || $el.find('guid').text().trim();
      const description = $el.find('description').text().trim();
      const pubDate = $el.find('pubDate').text().trim();

      if (!title || !link) return;

      // Parse company and location from description
      // Indeed format: "Company - Location - Description"
      const cleanDesc = cleanHtml(description);
      const parts = cleanDesc.split(' - ');

      let company = 'Unknown Company';
      let jobLocation = location;
      let summary = cleanDesc;

      if (parts.length >= 2) {
        company = parts[0].trim();
        jobLocation = parts[1].trim();
        summary = parts.slice(2).join(' - ').trim();
      }

      jobs.push({
        title,
        company,
        location: jobLocation,
        summary,
        url: link,
        pubDate,
      });
    });

  } catch (error) {
    console.error(`Error fetching Indeed RSS for "${query}" in ${location}:`, error);
  }

  return jobs;
}

async function getIndeedJobDetails(job: IndeedJob): Promise<ScrapedJob | null> {
  try {
    // Note: Indeed blocks direct scraping, so we'll use the RSS data
    // For full details, you'd need to use their API or a proxy service

    const { city, province } = parseLocation(job.location);
    const salaryData = parseSalary(job.summary);
    const industry = classifyIndustry(job.title, job.summary, job.company);

    // Parse posted date
    let postedAt = new Date().toISOString();
    if (job.pubDate) {
      try {
        postedAt = new Date(job.pubDate).toISOString();
      } catch {
        // Keep default
      }
    }

    const scrapedJob: ScrapedJob = {
      id: generateId(),
      title: job.title,
      company: job.company,
      company_slug: slugify(job.company),
      location: job.location,
      province,
      industry,
      job_type: parseJobType(job.title + ' ' + job.summary),
      description: job.summary || 'See original listing for full details.',
      requirements: extractRequirements(job.summary),
      salary_min: salaryData.min,
      salary_max: salaryData.max,
      salary_text: salaryData.text,
      is_remote: isRemoteJob(job.title + ' ' + job.summary + ' ' + job.location),
      is_fly_in_fly_out: isFlyInFlyOut(job.summary + ' ' + job.location),
      posted_at: postedAt,
      expires_at: null,
      source: 'indeed',
      source_url: job.url,
      scraped_at: new Date().toISOString(),
    };

    return scrapedJob;

  } catch (error) {
    console.error(`Error processing Indeed job:`, error);
    return null;
  }
}

export async function scrapeIndeed(maxJobsPerQuery: number = 20): Promise<ScrapedJob[]> {
  const allJobs: ScrapedJob[] = [];
  const seenUrls = new Set<string>();

  console.log('Starting Indeed Canada scraper...');

  for (const { q, l } of SEARCH_QUERIES) {
    console.log(`Searching Indeed for "${q}" in ${l}...`);

    const searchResults = await searchIndeedRSS(q, l);
    console.log(`Found ${searchResults.length} results`);

    // Limit jobs per query
    const jobsToProcess = searchResults.slice(0, maxJobsPerQuery);

    for (const job of jobsToProcess) {
      // Skip if we've already seen this job
      if (seenUrls.has(job.url)) {
        continue;
      }
      seenUrls.add(job.url);

      const scrapedJob = await getIndeedJobDetails(job);
      if (scrapedJob) {
        allJobs.push(scrapedJob);
        console.log(`Scraped: ${scrapedJob.title} at ${scrapedJob.company}`);
      }
    }

    // Add delay between queries
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`Indeed scraper completed. Total jobs: ${allJobs.length}`);
  return allJobs;
}

export default scrapeIndeed;
