/**
 * Lever ATS Scraper
 *
 * Lever provides a public JSON API for job postings.
 * URL pattern: https://api.lever.co/v0/postings/{company}
 *
 * This is one of the easiest sources to scrape - fully public JSON.
 */

import { ScrapedJob } from '../db';
import { generateId, slugify, parseLocation, classifyIndustry } from '../utils';

interface LeverCompany {
  name: string;
  slug: string;
  industry: string;
}

// Companies using Lever (add more as discovered)
const LEVER_COMPANIES: LeverCompany[] = [
  // Renewable Energy
  { name: 'Bullfrog Power', slug: 'bullfrogpower', industry: 'renewable_energy' },
  { name: 'Spark Power', slug: 'sparkpower', industry: 'renewable_energy' },

  // Environmental Tech
  { name: 'Pachama', slug: 'pachama', industry: 'environmental' },
  { name: 'Watershed', slug: 'watershed', industry: 'environmental' },

  // Clean Tech
  { name: 'CarbonCure', slug: 'carboncure', industry: 'environmental' },
  { name: 'Carbon Engineering', slug: 'carbonengineering', industry: 'environmental' },

  // Mining Tech
  { name: 'MineSense', slug: 'minesense', industry: 'mining' },

  // AgTech
  { name: 'Terramera', slug: 'terramera', industry: 'agriculture' },
  { name: 'Semios', slug: 'semios', industry: 'agriculture' },

  // Energy Tech
  { name: 'Opus One Solutions', slug: 'opusonesolutions', industry: 'renewable_energy' },
  { name: 'Peak Power', slug: 'peakpower', industry: 'renewable_energy' },
];

interface LeverJob {
  id: string;
  text: string;
  hostedUrl: string;
  applyUrl: string;
  categories: {
    location?: string;
    team?: string;
    commitment?: string;
  };
  descriptionPlain?: string;
  lists?: Array<{
    text: string;
    content: string;
  }>;
  createdAt: number;
}

async function fetchLeverJobs(company: LeverCompany): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    const apiUrl = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResourcesJobBoard/1.0',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data: LeverJob[] = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    for (const job of data) {
      const location = job.categories?.location || 'Canada';
      const { province } = parseLocation(location);

      // Filter for Canadian jobs
      const isCanadian = location.toLowerCase().includes('canada') ||
                         location.toLowerCase().includes('toronto') ||
                         location.toLowerCase().includes('vancouver') ||
                         location.toLowerCase().includes('calgary') ||
                         location.toLowerCase().includes('montreal') ||
                         location.toLowerCase().includes('ottawa') ||
                         province !== null;

      if (!isCanadian && !location.toLowerCase().includes('remote')) continue;

      // Extract requirements from lists
      const requirements: string[] = [];
      if (job.lists) {
        for (const list of job.lists) {
          if (list.text.toLowerCase().includes('requirement') ||
              list.text.toLowerCase().includes('qualif')) {
            // Parse HTML list items
            const liRegex = /<li>(.*?)<\/li>/g;
            let match;
            while ((match = liRegex.exec(list.content)) !== null) {
              requirements.push(match[1].replace(/<[^>]*>/g, '').trim());
            }
          }
        }
      }

      jobs.push({
        id: generateId(),
        title: job.text,
        company: company.name,
        company_slug: slugify(company.name),
        location,
        province,
        industry: company.industry,
        job_type: job.categories?.commitment?.toLowerCase().includes('part') ? 'part_time' :
                  job.categories?.commitment?.toLowerCase().includes('contract') ? 'contract' : 'full_time',
        description: job.descriptionPlain || `${job.text} at ${company.name}`,
        requirements: requirements.slice(0, 10),
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: location.toLowerCase().includes('remote'),
        is_fly_in_fly_out: false,
        posted_at: new Date(job.createdAt).toISOString(),
        expires_at: null,
        source: 'lever',
        source_url: job.hostedUrl,
        scraped_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.log(`  ${company.name}: Error fetching - ${error}`);
  }

  return jobs;
}

export async function scrapeLever(): Promise<ScrapedJob[]> {
  console.log('Fetching jobs from Lever ATS...');
  console.log(`  Checking ${LEVER_COMPANIES.length} companies...`);

  const allJobs: ScrapedJob[] = [];

  for (const company of LEVER_COMPANIES) {
    console.log(`  Fetching: ${company.name}`);

    const jobs = await fetchLeverJobs(company);
    allJobs.push(...jobs);

    if (jobs.length > 0) {
      console.log(`    Found ${jobs.length} jobs`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`Total Lever jobs found: ${allJobs.length}`);
  return allJobs;
}

export default scrapeLever;
