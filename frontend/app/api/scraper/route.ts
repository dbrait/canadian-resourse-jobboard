import { NextRequest, NextResponse } from 'next/server';
import { addJobs, addScrapeLog, updateScrapeLog, getAllScrapeLogs, getAllJobs, getFreshJobs, removeStaleJobs, clearJobsBySource, ScrapeLog, clearAllJobs } from '@/lib/scraper/db';

// Available scraper sources
const AVAILABLE_SOURCES = [
  'discover',    // ATS Discovery - scrapes 137+ companies with auto-detection
  'companies',   // All company career pages (45+ companies)
  'adzuna',      // Realistic generated data from real companies
  'workday',     // Workday ATS (Suncor, Teck, TC Energy, etc.)
  'lever',       // Lever ATS (CleanTech, AgTech companies)
  'greenhouse',  // Greenhouse ATS (Environmental consulting)
  'indeed',      // Indeed RSS feeds
  'rigzone',     // Rigzone (Oil & Gas)
  'infomine',    // InfoMine (Mining)
  'ecocanada',   // ECO Canada (Environmental)
  'jobbank',     // Canada Job Bank
] as const;

type ScraperSource = typeof AVAILABLE_SOURCES[number] | 'all' | 'clear' | 'cleanup';

function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// GET - Get scraper status and logs
export async function GET() {
  try {
    const logs = getAllScrapeLogs();
    const jobs = getAllJobs();

    // Count jobs by source
    const jobsBySource: Record<string, number> = {};
    for (const job of jobs) {
      jobsBySource[job.source] = (jobsBySource[job.source] || 0) + 1;
    }

    return NextResponse.json({
      status: 'ready',
      totalJobs: jobs.length,
      jobsBySource,
      logs: logs.slice(0, 20),
      availableSources: AVAILABLE_SOURCES,
      instructions: {
        all: 'POST with {"source":"all"} to run ALL scrapers (takes a while)',
        discover: 'POST with {"source":"discover"} to auto-discover & scrape 137+ companies (BEST)',
        companies: 'POST with {"source":"companies"} to scrape 45+ company career pages',
        adzuna: 'POST with {"source":"adzuna"} to generate realistic job data',
        workday: 'POST with {"source":"workday"} to scrape Workday ATS companies',
        lever: 'POST with {"source":"lever"} to scrape Lever ATS companies',
        greenhouse: 'POST with {"source":"greenhouse"} to scrape Greenhouse ATS companies',
        indeed: 'POST with {"source":"indeed"} to scrape Indeed RSS feeds',
        rigzone: 'POST with {"source":"rigzone"} to scrape Rigzone (Oil & Gas)',
        infomine: 'POST with {"source":"infomine"} to scrape InfoMine (Mining)',
        ecocanada: 'POST with {"source":"ecocanada"} to scrape ECO Canada (Environmental)',
        jobbank: 'POST with {"source":"jobbank"} to scrape Canada Job Bank',
        clear: 'POST with {"source":"clear"} to clear all scraped jobs',
        cleanup: 'POST with {"source":"cleanup"} to remove stale jobs (older than 30 days)',
      },
    });
  } catch (error) {
    console.error('Error getting scraper status:', error);
    return NextResponse.json(
      { error: 'Failed to get scraper status' },
      { status: 500 }
    );
  }
}

// Run a single scraper source
async function runScraper(source: string): Promise<{
  source: string;
  success: boolean;
  jobsFound: number;
  jobsAdded: number;
  jobsUpdated: number;
  duration: number;
  error?: string;
}> {
  const logId = generateLogId();
  const startTime = Date.now();

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
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Starting scraper: ${source}`);
    console.log(`${'='.repeat(50)}`);

    let jobs: any[] = [];

    // Dynamically import and run the appropriate scraper
    switch (source) {
      case 'discover':
        const { scrapeAllCompanies } = await import('@/lib/scraper/sources/ats-discovery');
        jobs = await scrapeAllCompanies();
        break;
      case 'companies':
        const { scrapeCompanies } = await import('@/lib/scraper/sources/companies');
        jobs = await scrapeCompanies();
        break;
      case 'adzuna':
        const { scrapeAdzuna } = await import('@/lib/scraper/sources/adzuna');
        jobs = await scrapeAdzuna();
        break;
      case 'workday':
        const { scrapeWorkday } = await import('@/lib/scraper/sources/workday');
        jobs = await scrapeWorkday();
        break;
      case 'lever':
        const { scrapeLever } = await import('@/lib/scraper/sources/lever');
        jobs = await scrapeLever();
        break;
      case 'greenhouse':
        const { scrapeGreenhouse } = await import('@/lib/scraper/sources/greenhouse');
        jobs = await scrapeGreenhouse();
        break;
      case 'indeed':
        const { scrapeIndeedRss } = await import('@/lib/scraper/sources/indeed-rss');
        jobs = await scrapeIndeedRss();
        break;
      case 'rigzone':
        const { scrapeRigzone } = await import('@/lib/scraper/sources/rigzone');
        jobs = await scrapeRigzone();
        break;
      case 'infomine':
        const { scrapeInfoMine } = await import('@/lib/scraper/sources/infomine');
        jobs = await scrapeInfoMine();
        break;
      case 'ecocanada':
        const { scrapeEcoCanada } = await import('@/lib/scraper/sources/eco-canada');
        jobs = await scrapeEcoCanada();
        break;
      case 'jobbank':
        const { scrapeJobBank } = await import('@/lib/scraper/sources/jobbank-api');
        jobs = await scrapeJobBank();
        break;
      default:
        throw new Error(`Unknown source: ${source}`);
    }

    const { added, updated } = addJobs(jobs);

    updateScrapeLog(logId, {
      finished_at: new Date().toISOString(),
      status: 'completed',
      jobs_found: jobs.length,
      jobs_added: added,
      jobs_updated: updated,
    });

    console.log(`Completed ${source}: ${jobs.length} found, ${added} added, ${updated} updated`);

    return {
      source,
      success: true,
      jobsFound: jobs.length,
      jobsAdded: added,
      jobsUpdated: updated,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`Error in ${source}:`, error);

    updateScrapeLog(logId, {
      finished_at: new Date().toISOString(),
      status: 'failed',
      error: String(error),
    });

    return {
      source,
      success: false,
      jobsFound: 0,
      jobsAdded: 0,
      jobsUpdated: 0,
      duration: Date.now() - startTime,
      error: String(error),
    };
  }
}

// POST - Trigger a scrape
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const source = (body.source || 'adzuna') as ScraperSource;

    // Validate source
    if (source !== 'all' && source !== 'clear' && source !== 'cleanup' && !AVAILABLE_SOURCES.includes(source as any)) {
      return NextResponse.json(
        { error: `Invalid source. Available: ${AVAILABLE_SOURCES.join(', ')}, all, clear` },
        { status: 400 }
      );
    }

    // Handle clear request
    if (source === 'clear') {
      const removed = clearAllJobs();
      return NextResponse.json({
        success: true,
        message: `Cleared ${removed} jobs from database`,
      });
    }

    // Handle cleanup request (remove stale jobs older than 14 days)
    if (source === 'cleanup') {
      const removed = removeStaleJobs();
      const remaining = getFreshJobs().length;
      return NextResponse.json({
        success: true,
        message: `Removed ${removed} stale jobs, ${remaining} fresh jobs remaining`,
        removed,
        remaining,
      });
    }

    // Handle clear_source request (remove jobs from a specific source)
    if (body.clear_source) {
      const sourceToRemove = body.clear_source;
      const removed = clearJobsBySource(sourceToRemove);
      const remaining = getAllJobs().length;
      return NextResponse.json({
        success: true,
        message: `Removed ${removed} jobs from source "${sourceToRemove}", ${remaining} jobs remaining`,
        removed,
        remaining,
      });
    }

    console.log(`\n${'#'.repeat(60)}`);
    console.log(`# STARTING SCRAPER RUN: ${source}`);
    console.log(`# Time: ${new Date().toISOString()}`);
    console.log(`${'#'.repeat(60)}\n`);

    const results: any[] = [];

    if (source === 'all') {
      // Run all scrapers sequentially
      for (const src of AVAILABLE_SOURCES) {
        const result = await runScraper(src);
        results.push(result);

        // Small delay between scrapers
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      // Run single scraper
      const result = await runScraper(source);
      results.push(result);
    }

    const totalJobsFound = results.reduce((sum, r) => sum + (r.jobsFound || 0), 0);
    const totalJobsAdded = results.reduce((sum, r) => sum + (r.jobsAdded || 0), 0);
    const totalJobsUpdated = results.reduce((sum, r) => sum + (r.jobsUpdated || 0), 0);
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`\n${'#'.repeat(60)}`);
    console.log(`# SCRAPER RUN COMPLETE`);
    console.log(`# Sources: ${successCount} succeeded, ${failCount} failed`);
    console.log(`# Jobs: ${totalJobsFound} found, ${totalJobsAdded} added, ${totalJobsUpdated} updated`);
    console.log(`# Duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`${'#'.repeat(60)}\n`);

    return NextResponse.json({
      success: true,
      message: `Scraping completed for ${source}`,
      results,
      summary: {
        sourcesRun: results.length,
        sourcesSucceeded: successCount,
        sourcesFailed: failCount,
        totalJobsFound,
        totalJobsAdded,
        totalJobsUpdated,
        totalDuration: `${(totalDuration / 1000).toFixed(1)}s`,
      },
    });
  } catch (error) {
    console.error('Error running scraper:', error);
    return NextResponse.json(
      { error: 'Failed to run scraper', details: String(error) },
      { status: 500 }
    );
  }
}
