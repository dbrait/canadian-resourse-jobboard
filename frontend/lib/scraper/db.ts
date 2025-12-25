import fs from 'fs';
import path from 'path';

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  company_slug: string;
  location: string;
  province: string;
  industry: string;
  job_type: string;
  description: string;
  requirements: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_text: string | null;
  is_remote: boolean;
  is_fly_in_fly_out: boolean;
  posted_at: string;
  expires_at: string | null;
  source: string;
  source_url: string;
  scraped_at: string;
}

export interface ScrapeLog {
  id: string;
  source: string;
  started_at: string;
  finished_at: string | null;
  status: 'running' | 'completed' | 'failed';
  jobs_found: number;
  jobs_added: number;
  jobs_updated: number;
  error: string | null;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const LOGS_FILE = path.join(DATA_DIR, 'scrape-logs.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Job freshness settings
const MAX_JOB_AGE_DAYS = 30; // Jobs older than this are considered stale

// Job operations
export function getAllJobs(): ScrapedJob[] {
  return readJsonFile<ScrapedJob[]>(JOBS_FILE, []);
}

// Get only fresh jobs (scraped within MAX_JOB_AGE_DAYS)
export function getFreshJobs(): ScrapedJob[] {
  const jobs = getAllJobs();
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - MAX_JOB_AGE_DAYS * 24 * 60 * 60 * 1000);

  return jobs.filter(job => {
    // Check scraped_at date
    const scrapedAt = new Date(job.scraped_at);
    if (scrapedAt >= cutoffDate) return true;

    // Also check posted_at date (some jobs may have recent post dates)
    const postedAt = new Date(job.posted_at);
    if (postedAt >= cutoffDate) return true;

    return false;
  });
}

// Remove stale jobs from database
export function removeStaleJobs(): number {
  const jobs = getAllJobs();
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - MAX_JOB_AGE_DAYS * 24 * 60 * 60 * 1000);

  const freshJobs = jobs.filter(job => {
    const scrapedAt = new Date(job.scraped_at);
    const postedAt = new Date(job.posted_at);
    return scrapedAt >= cutoffDate || postedAt >= cutoffDate;
  });

  const removed = jobs.length - freshJobs.length;
  if (removed > 0) {
    writeJsonFile(JOBS_FILE, freshJobs);
  }
  return removed;
}

export function getJobById(id: string): ScrapedJob | undefined {
  const jobs = getAllJobs();
  return jobs.find(job => job.id === id);
}

export function getJobsBySource(source: string): ScrapedJob[] {
  const jobs = getAllJobs();
  return jobs.filter(job => job.source === source);
}

export function addJob(job: ScrapedJob): boolean {
  const jobs = getAllJobs();
  const existingIndex = jobs.findIndex(j => j.source_url === job.source_url);

  if (existingIndex >= 0) {
    // Update existing job
    jobs[existingIndex] = { ...job, id: jobs[existingIndex].id };
    writeJsonFile(JOBS_FILE, jobs);
    return false; // Not a new job
  }

  jobs.push(job);
  writeJsonFile(JOBS_FILE, jobs);
  return true; // New job added
}

export function addJobs(newJobs: ScrapedJob[]): { added: number; updated: number } {
  const jobs = getAllJobs();
  let added = 0;
  let updated = 0;

  for (const job of newJobs) {
    const existingIndex = jobs.findIndex(j => j.source_url === job.source_url);

    if (existingIndex >= 0) {
      jobs[existingIndex] = { ...job, id: jobs[existingIndex].id };
      updated++;
    } else {
      jobs.push(job);
      added++;
    }
  }

  writeJsonFile(JOBS_FILE, jobs);
  return { added, updated };
}

export function clearJobsBySource(source: string): number {
  const jobs = getAllJobs();
  const filtered = jobs.filter(job => job.source !== source);
  const removed = jobs.length - filtered.length;
  writeJsonFile(JOBS_FILE, filtered);
  return removed;
}

export function clearAllJobs(): number {
  const jobs = getAllJobs();
  const count = jobs.length;
  writeJsonFile(JOBS_FILE, []);
  return count;
}

// Scrape log operations
export function getAllScrapeLogs(): ScrapeLog[] {
  return readJsonFile<ScrapeLog[]>(LOGS_FILE, []);
}

export function addScrapeLog(log: ScrapeLog): void {
  const logs = getAllScrapeLogs();
  logs.unshift(log); // Add to beginning
  // Keep only last 100 logs
  writeJsonFile(LOGS_FILE, logs.slice(0, 100));
}

export function updateScrapeLog(id: string, updates: Partial<ScrapeLog>): void {
  const logs = getAllScrapeLogs();
  const index = logs.findIndex(l => l.id === id);
  if (index >= 0) {
    logs[index] = { ...logs[index], ...updates };
    writeJsonFile(LOGS_FILE, logs);
  }
}

// Stats
export function getStats() {
  const jobs = getAllJobs();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const activeJobs = jobs.filter(job => {
    const postedAt = new Date(job.posted_at);
    return postedAt >= thirtyDaysAgo;
  });

  const companies = new Set(jobs.map(j => j.company));
  const jobsByIndustry: Record<string, number> = {};
  const jobsByProvince: Record<string, number> = {};
  const jobsBySource: Record<string, number> = {};

  for (const job of jobs) {
    jobsByIndustry[job.industry] = (jobsByIndustry[job.industry] || 0) + 1;
    jobsByProvince[job.province] = (jobsByProvince[job.province] || 0) + 1;
    jobsBySource[job.source] = (jobsBySource[job.source] || 0) + 1;
  }

  return {
    total_jobs: jobs.length,
    active_jobs: activeJobs.length,
    total_companies: companies.size,
    jobsByIndustry,
    jobsByProvince,
    jobsBySource,
  };
}
