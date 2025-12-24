/**
 * Greenhouse ATS Scraper
 *
 * Greenhouse job boards have embedded JSON data that can be extracted.
 * URL patterns:
 * - https://boards.greenhouse.io/{company}
 * - https://{company}.greenhouse.io
 * - Job API: https://boards-api.greenhouse.io/v1/boards/{company}/jobs
 */

import { ScrapedJob } from '../db';
import { generateId, slugify, parseLocation, classifyIndustry } from '../utils';

interface GreenhouseCompany {
  name: string;
  boardToken: string;
  industry: string;
}

// Companies using Greenhouse
const GREENHOUSE_COMPANIES: GreenhouseCompany[] = [
  // Renewable/Clean Energy
  { name: 'Innergex', boardToken: 'innergex', industry: 'renewable_energy' },
  { name: 'Boralex', boardToken: 'boralex', industry: 'renewable_energy' },
  { name: 'Brookfield Renewable', boardToken: 'brookfieldrenewable', industry: 'renewable_energy' },
  { name: 'Algonquin Power', boardToken: 'algonquinpower', industry: 'renewable_energy' },

  // Environmental Consulting
  { name: 'Golder Associates', boardToken: 'golder', industry: 'environmental' },
  { name: 'GHD', boardToken: 'ghd', industry: 'environmental' },
  { name: 'Tetra Tech', boardToken: 'tetratech', industry: 'environmental' },
  { name: 'ERM', boardToken: 'erm', industry: 'environmental' },

  // Mining Tech
  { name: 'Hatch', boardToken: 'hatch', industry: 'environmental' },
  { name: 'Ausenco', boardToken: 'ausenco', industry: 'mining' },

  // Agriculture/Food
  { name: 'Maple Leaf Foods', boardToken: 'mapleleaffoods', industry: 'agriculture' },
  { name: 'Saputo', boardToken: 'saputo', industry: 'agriculture' },

  // Aquaculture
  { name: 'Cooke Aquaculture', boardToken: 'cookeaqua', industry: 'fishing' },
  { name: 'Mowi', boardToken: 'mowi', industry: 'fishing' },
];

interface GreenhouseJob {
  id: number;
  title: string;
  location: {
    name: string;
  };
  updated_at: string;
  absolute_url: string;
  metadata?: Array<{
    name: string;
    value: string | null;
  }>;
  content?: string;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
  meta: {
    total: number;
  };
}

async function fetchGreenhouseJobs(company: GreenhouseCompany): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    // Greenhouse public API
    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${company.boardToken}/jobs?content=true`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResourcesJobBoard/1.0',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data: GreenhouseResponse = await response.json();

    if (!data.jobs || data.jobs.length === 0) {
      return [];
    }

    for (const job of data.jobs) {
      const location = job.location?.name || 'Canada';
      const { province } = parseLocation(location);

      // Filter for Canadian jobs
      const isCanadian = location.toLowerCase().includes('canada') ||
                         location.toLowerCase().includes('toronto') ||
                         location.toLowerCase().includes('vancouver') ||
                         location.toLowerCase().includes('calgary') ||
                         location.toLowerCase().includes('montreal') ||
                         location.toLowerCase().includes('edmonton') ||
                         location.toLowerCase().includes('ottawa') ||
                         location.toLowerCase().includes('winnipeg') ||
                         location.toLowerCase().includes('halifax') ||
                         province !== null;

      if (!isCanadian && !location.toLowerCase().includes('remote')) continue;

      // Clean HTML from content
      const description = job.content ?
        job.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() :
        `${job.title} at ${company.name}`;

      // Extract salary from metadata if available
      let salaryText: string | null = null;
      if (job.metadata) {
        const salaryMeta = job.metadata.find(m =>
          m.name.toLowerCase().includes('salary') ||
          m.name.toLowerCase().includes('compensation')
        );
        if (salaryMeta?.value) {
          salaryText = salaryMeta.value;
        }
      }

      jobs.push({
        id: generateId(),
        title: job.title,
        company: company.name,
        company_slug: slugify(company.name),
        location,
        province,
        industry: company.industry,
        job_type: 'full_time',
        description: description.slice(0, 5000),
        requirements: [],
        salary_min: null,
        salary_max: null,
        salary_text: salaryText,
        is_remote: location.toLowerCase().includes('remote'),
        is_fly_in_fly_out: false,
        posted_at: job.updated_at || new Date().toISOString(),
        expires_at: null,
        source: 'greenhouse',
        source_url: job.absolute_url,
        scraped_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.log(`  ${company.name}: Error fetching - ${error}`);
  }

  return jobs;
}

export async function scrapeGreenhouse(): Promise<ScrapedJob[]> {
  console.log('Fetching jobs from Greenhouse ATS...');
  console.log(`  Checking ${GREENHOUSE_COMPANIES.length} companies...`);

  const allJobs: ScrapedJob[] = [];

  for (const company of GREENHOUSE_COMPANIES) {
    console.log(`  Fetching: ${company.name}`);

    const jobs = await fetchGreenhouseJobs(company);
    allJobs.push(...jobs);

    if (jobs.length > 0) {
      console.log(`    Found ${jobs.length} Canadian jobs`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`Total Greenhouse jobs found: ${allJobs.length}`);
  return allJobs;
}

export default scrapeGreenhouse;
