import { ScrapedJob, ScrapeLog, addJobs, addScrapeLog, updateScrapeLog, getAllJobs, getStats } from './db';
import { scrapeJobBank } from './sources/jobbank';
import { scrapeIndeed } from './sources/indeed';
import { scrapeIndeedRss } from './sources/indeed-rss';
import { scrapeJobBank as scrapeJobBankApi } from './sources/jobbank-api';
import { scrapeAllCompanies, scrapeCompany, getCompanyConfigs } from './sources/company-scrapers';
import { getScrapingBeeService } from './services/scrapingbee';

export type ScraperSource =
  | 'jobbank'
  | 'jobbank_api'
  | 'indeed'
  | 'indeed_rss'
  | 'companies'
  | 'all'
  | 'quick';  // Quick scrape - just RSS feeds and API (no JS rendering)

interface ScrapeResult {
  source: string;
  success: boolean;
  jobsFound: number;
  jobsAdded: number;
  jobsUpdated: number;
  duration: number;
  error?: string;
}

function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function runScraper(
  source: string,
  scraperFn: () => Promise<ScrapedJob[]>
): Promise<ScrapeResult> {
  const logId = generateLogId();
  const startTime = Date.now();

  // Log start
  const log: ScrapeLog = {
    id: logId,
    source,
    started_at: new Date().toISOString(),
    finished_at: null,
    status: 'running',
    jobs_found: 0,
    jobs_added: 0,
    jobs_updated: 0,
    error: null,
  };
  addScrapeLog(log);

  try {
    console.log(`Starting ${source} scraper...`);
    const jobs = await scraperFn();

    // Add jobs to database
    const { added, updated } = addJobs(jobs);

    const duration = Date.now() - startTime;

    // Update log
    updateScrapeLog(logId, {
      finished_at: new Date().toISOString(),
      status: 'completed',
      jobs_found: jobs.length,
      jobs_added: added,
      jobs_updated: updated,
    });

    console.log(`${source} scraper completed in ${duration}ms. Found: ${jobs.length}, Added: ${added}, Updated: ${updated}`);

    return {
      source,
      success: true,
      jobsFound: jobs.length,
      jobsAdded: added,
      jobsUpdated: updated,
      duration,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update log with error
    updateScrapeLog(logId, {
      finished_at: new Date().toISOString(),
      status: 'failed',
      error: errorMessage,
    });

    console.error(`${source} scraper failed:`, error);

    return {
      source,
      success: false,
      jobsFound: 0,
      jobsAdded: 0,
      jobsUpdated: 0,
      duration,
      error: errorMessage,
    };
  }
}

// Convert company jobs to standard ScrapedJob format
function convertCompanyJobs(companyJobs: any[]): ScrapedJob[] {
  return companyJobs.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    company_slug: job.company_slug,
    location: job.location,
    province: job.province,
    industry: job.industry,
    job_type: job.job_type,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_text: null,
    description: job.description,
    requirements: job.requirements,
    posted_at: job.posted_at,
    expires_at: null,
    source: job.source,
    source_url: job.source_url,
    is_remote: job.is_remote,
    is_fly_in_fly_out: job.is_fly_in_fly_out,
    scraped_at: new Date().toISOString(),
  }));
}

export async function runScrapers(sources: ScraperSource = 'all'): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  // Quick mode - just API/RSS feeds (no JS rendering needed)
  if (sources === 'quick') {
    const jobBankResult = await runScraper('jobbank_api', () => scrapeJobBankApi());
    results.push(jobBankResult);

    const indeedRssResult = await runScraper('indeed_rss', () => scrapeIndeedRss());
    results.push(indeedRssResult);

    return results;
  }

  // Job Bank scrapers
  if (sources === 'all' || sources === 'jobbank') {
    const result = await runScraper('jobbank', () => scrapeJobBank(10));
    results.push(result);
  }

  if (sources === 'all' || sources === 'jobbank_api') {
    const result = await runScraper('jobbank_api', () => scrapeJobBankApi());
    results.push(result);
  }

  // Indeed scrapers
  if (sources === 'all' || sources === 'indeed') {
    const result = await runScraper('indeed', () => scrapeIndeed(20));
    results.push(result);
  }

  if (sources === 'all' || sources === 'indeed_rss') {
    const result = await runScraper('indeed_rss', () => scrapeIndeedRss());
    results.push(result);
  }

  // Company website scrapers (uses ScrapingBee if available)
  if (sources === 'all' || sources === 'companies') {
    const result = await runScraper('companies', async () => {
      const companyJobs = await scrapeAllCompanies();
      return convertCompanyJobs(companyJobs);
    });
    results.push(result);
  }

  return results;
}

// Run scraper for a specific company
export async function runCompanyScraper(companySlug: string): Promise<ScrapeResult> {
  return runScraper(`company_${companySlug}`, async () => {
    const companyJobs = await scrapeCompany(companySlug);
    return convertCompanyJobs(companyJobs);
  });
}

// Get scraping service status
export function getScrapingStatus() {
  const scrapingBee = getScrapingBeeService();
  return {
    scrapingBeeAvailable: scrapingBee.isAvailable(),
    scrapingBeeStats: scrapingBee.getStats(),
    availableCompanies: getCompanyConfigs().map(c => ({
      name: c.name,
      slug: c.slug,
      sector: c.sector,
    })),
    availableSources: [
      'jobbank',
      'jobbank_api',
      'indeed',
      'indeed_rss',
      'companies',
    ],
  };
}

export { getAllJobs, getStats } from './db';
export type { ScrapedJob, ScrapeLog } from './db';
export { getCompanyConfigs } from './sources/company-scrapers';
