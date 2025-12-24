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

const BASE_URL = 'https://www.jobbank.gc.ca';

// Natural resources related NOC codes and search terms
const SEARCH_TERMS = [
  'mining',
  'oil gas',
  'forestry',
  'fishing',
  'agriculture',
  'renewable energy',
  'environmental',
  'geologist',
  'drilling',
  'heavy equipment operator',
  'millwright',
  'welder',
  'pipeline',
  'lumber',
];

interface JobBankJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  postedDate: string;
  url: string;
}

async function searchJobs(term: string, page: number = 1): Promise<JobBankJob[]> {
  const jobs: JobBankJob[] = [];

  try {
    const searchUrl = `${BASE_URL}/jobsearch/jobsearch?searchstring=${encodeURIComponent(term)}&sort=D&page=${page}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-CA,en;q=0.9',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    // Parse job listings from search results
    $('article.resultJobItem').each((_, el) => {
      const $el = $(el);

      const titleEl = $el.find('a.resultJobItem-titleLink');
      const title = titleEl.text().trim();
      const href = titleEl.attr('href');

      if (!title || !href) return;

      const jobId = href.match(/\/jobposting\/(\d+)/)?.[1] || '';
      const company = $el.find('.business').text().trim() || 'Unknown Company';
      const location = $el.find('.location').text().trim();
      const salary = $el.find('.salary').text().trim();
      const postedDate = $el.find('.date').text().trim();

      jobs.push({
        id: jobId,
        title,
        company,
        location,
        salary,
        postedDate,
        url: `${BASE_URL}${href}`,
      });
    });

  } catch (error) {
    console.error(`Error searching Job Bank for "${term}":`, error);
  }

  return jobs;
}

async function getJobDetails(job: JobBankJob): Promise<ScrapedJob | null> {
  try {
    const response = await axios.get(job.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-CA,en;q=0.9',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    // Extract detailed information
    const description = $('.job-posting-details').text().trim() ||
                       $('#job-description').text().trim() ||
                       $('main').text().trim();

    const jobTypeRaw = $('.job-type').text().trim() || 'Full-time';
    const { city, province } = parseLocation(job.location);
    const salaryData = parseSalary(job.salary);
    const industry = classifyIndustry(job.title, description, job.company);

    // Parse posted date
    let postedAt = new Date().toISOString();
    if (job.postedDate) {
      const dateMatch = job.postedDate.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        postedAt = new Date(dateMatch[1]).toISOString();
      }
    }

    const scrapedJob: ScrapedJob = {
      id: generateId(),
      title: job.title,
      company: job.company,
      company_slug: slugify(job.company),
      location: job.location || city,
      province,
      industry,
      job_type: parseJobType(jobTypeRaw),
      description: cleanHtml(description).substring(0, 5000),
      requirements: extractRequirements(description),
      salary_min: salaryData.min,
      salary_max: salaryData.max,
      salary_text: salaryData.text,
      is_remote: isRemoteJob(description + ' ' + job.title),
      is_fly_in_fly_out: isFlyInFlyOut(description + ' ' + job.location),
      posted_at: postedAt,
      expires_at: null,
      source: 'jobbank',
      source_url: job.url,
      scraped_at: new Date().toISOString(),
    };

    return scrapedJob;

  } catch (error) {
    console.error(`Error fetching job details from ${job.url}:`, error);
    return null;
  }
}

export async function scrapeJobBank(maxJobsPerTerm: number = 10): Promise<ScrapedJob[]> {
  const allJobs: ScrapedJob[] = [];
  const seenUrls = new Set<string>();

  console.log('Starting Job Bank scraper...');

  for (const term of SEARCH_TERMS) {
    console.log(`Searching for "${term}"...`);

    const searchResults = await searchJobs(term, 1);
    console.log(`Found ${searchResults.length} results for "${term}"`);

    // Limit jobs per search term
    const jobsToProcess = searchResults.slice(0, maxJobsPerTerm);

    for (const job of jobsToProcess) {
      // Skip if we've already seen this job
      if (seenUrls.has(job.url)) {
        continue;
      }
      seenUrls.add(job.url);

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));

      const scrapedJob = await getJobDetails(job);
      if (scrapedJob) {
        allJobs.push(scrapedJob);
        console.log(`Scraped: ${scrapedJob.title} at ${scrapedJob.company}`);
      }
    }

    // Add delay between search terms
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`Job Bank scraper completed. Total jobs: ${allJobs.length}`);
  return allJobs;
}

export default scrapeJobBank;
