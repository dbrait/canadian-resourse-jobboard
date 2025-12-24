import { ScrapedJob, ScrapeLog, addJobs, addScrapeLog, updateScrapeLog, getAllJobs, getStats } from './db';
import { scrapeJobBank } from './sources/jobbank';
import { scrapeIndeed } from './sources/indeed';

export type ScraperSource = 'jobbank' | 'indeed' | 'all';

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

export async function runScrapers(sources: ScraperSource = 'all'): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  if (sources === 'all' || sources === 'jobbank') {
    const result = await runScraper('jobbank', () => scrapeJobBank(10));
    results.push(result);
  }

  if (sources === 'all' || sources === 'indeed') {
    const result = await runScraper('indeed', () => scrapeIndeed(20));
    results.push(result);
  }

  return results;
}

export { getAllJobs, getStats } from './db';
export type { ScrapedJob, ScrapeLog } from './db';
