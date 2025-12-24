/**
 * Workday ATS Scraper
 *
 * Many large Canadian natural resources companies use Workday:
 * - Suncor Energy
 * - Teck Resources
 * - TC Energy
 * - Enbridge
 * - Imperial Oil
 * - Cenovus Energy
 * - Pembina Pipeline
 * - And many more
 *
 * Workday has a hidden JSON API that powers their job search.
 * URL pattern: https://{company}.wd{N}.myworkdayjobs.com/wday/cxs/{company}/{site}/jobs
 */

import { ScrapedJob } from '../db';
import { generateId, slugify, parseLocation, classifyIndustry, parseSalary } from '../utils';

interface WorkdayCompany {
  name: string;
  subdomain: string;
  wdNumber: string; // wd1, wd3, wd5, etc.
  site: string; // Usually "External" or company-specific
  industry: string;
}

// Major natural resources companies using Workday
const WORKDAY_COMPANIES: WorkdayCompany[] = [
  // Oil & Gas
  { name: 'Suncor Energy', subdomain: 'suncor', wdNumber: 'wd1', site: 'External', industry: 'oil_gas' },
  { name: 'TC Energy', subdomain: 'tcenergy', wdNumber: 'wd3', site: 'External', industry: 'oil_gas' },
  { name: 'Enbridge', subdomain: 'enbridge', wdNumber: 'wd3', site: 'External', industry: 'oil_gas' },
  { name: 'Cenovus Energy', subdomain: 'cenovus', wdNumber: 'wd3', site: 'External', industry: 'oil_gas' },
  { name: 'Imperial Oil', subdomain: 'imperialoil', wdNumber: 'wd3', site: 'External', industry: 'oil_gas' },
  { name: 'Pembina Pipeline', subdomain: 'pembina', wdNumber: 'wd3', site: 'External', industry: 'oil_gas' },
  { name: 'Canadian Natural Resources', subdomain: 'cnrl', wdNumber: 'wd3', site: 'External', industry: 'oil_gas' },
  { name: 'MEG Energy', subdomain: 'megenergy', wdNumber: 'wd3', site: 'External', industry: 'oil_gas' },

  // Mining
  { name: 'Teck Resources', subdomain: 'teck', wdNumber: 'wd3', site: 'External', industry: 'mining' },
  { name: 'Barrick Gold', subdomain: 'barrick', wdNumber: 'wd3', site: 'External', industry: 'mining' },
  { name: 'Kinross Gold', subdomain: 'kinross', wdNumber: 'wd3', site: 'External', industry: 'mining' },
  { name: 'Agnico Eagle', subdomain: 'agnicoeagle', wdNumber: 'wd3', site: 'External', industry: 'mining' },
  { name: 'Newmont', subdomain: 'newmont', wdNumber: 'wd5', site: 'External', industry: 'mining' },
  { name: 'Lundin Mining', subdomain: 'lundinmining', wdNumber: 'wd3', site: 'External', industry: 'mining' },
  { name: 'First Quantum Minerals', subdomain: 'firstquantum', wdNumber: 'wd3', site: 'External', industry: 'mining' },
  { name: 'Hudbay Minerals', subdomain: 'hudbay', wdNumber: 'wd3', site: 'External', industry: 'mining' },
  { name: 'Cameco', subdomain: 'cameco', wdNumber: 'wd3', site: 'External', industry: 'mining' },
  { name: 'Nutrien', subdomain: 'nutrien', wdNumber: 'wd5', site: 'Nutrien', industry: 'mining' },

  // Forestry
  { name: 'West Fraser Timber', subdomain: 'westfraser', wdNumber: 'wd3', site: 'External', industry: 'forestry' },
  { name: 'Canfor', subdomain: 'canfor', wdNumber: 'wd3', site: 'External', industry: 'forestry' },
  { name: 'Resolute Forest Products', subdomain: 'resolute', wdNumber: 'wd3', site: 'External', industry: 'forestry' },

  // Environmental/Engineering
  { name: 'Stantec', subdomain: 'stantec', wdNumber: 'wd3', site: 'External', industry: 'environmental' },
  { name: 'WSP', subdomain: 'wsp', wdNumber: 'wd3', site: 'External', industry: 'environmental' },
  { name: 'AECOM', subdomain: 'aecom', wdNumber: 'wd3', site: 'External', industry: 'environmental' },
  { name: 'SNC-Lavalin', subdomain: 'snclavalin', wdNumber: 'wd3', site: 'External', industry: 'environmental' },

  // Renewable Energy
  { name: 'TransAlta', subdomain: 'transalta', wdNumber: 'wd3', site: 'External', industry: 'renewable_energy' },
  { name: 'Capital Power', subdomain: 'capitalpower', wdNumber: 'wd3', site: 'External', industry: 'renewable_energy' },
  { name: 'Northland Power', subdomain: 'northlandpower', wdNumber: 'wd3', site: 'External', industry: 'renewable_energy' },
];

interface WorkdayJob {
  title: string;
  externalPath: string;
  locationsText: string;
  postedOn: string;
  bulletFields?: string[];
}

interface WorkdayResponse {
  total: number;
  jobPostings: WorkdayJob[];
}

async function fetchWorkdayJobs(company: WorkdayCompany): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    // Workday API endpoint
    const apiUrl = `https://${company.subdomain}.${company.wdNumber}.myworkdayjobs.com/wday/cxs/${company.subdomain}/${company.site}/jobs`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit: 20,
        offset: 0,
        searchText: '',
      }),
    });

    if (!response.ok) {
      console.log(`  ${company.name}: Workday returned ${response.status}`);
      return [];
    }

    const data: WorkdayResponse = await response.json();

    if (!data.jobPostings || data.jobPostings.length === 0) {
      return [];
    }

    for (const job of data.jobPostings) {
      const location = job.locationsText || 'Canada';
      const { province } = parseLocation(location);

      // Filter for Canadian jobs only
      const isCanadian = location.toLowerCase().includes('canada') ||
                         location.toLowerCase().includes(', ab') ||
                         location.toLowerCase().includes(', bc') ||
                         location.toLowerCase().includes(', on') ||
                         location.toLowerCase().includes(', qc') ||
                         location.toLowerCase().includes(', sk') ||
                         location.toLowerCase().includes(', mb') ||
                         location.toLowerCase().includes(', ns') ||
                         location.toLowerCase().includes(', nb') ||
                         location.toLowerCase().includes(', nl') ||
                         location.toLowerCase().includes(', pe') ||
                         location.toLowerCase().includes(', nt') ||
                         location.toLowerCase().includes(', nu') ||
                         location.toLowerCase().includes(', yt') ||
                         location.toLowerCase().includes('calgary') ||
                         location.toLowerCase().includes('edmonton') ||
                         location.toLowerCase().includes('vancouver') ||
                         location.toLowerCase().includes('toronto') ||
                         location.toLowerCase().includes('montreal');

      if (!isCanadian) continue;

      const jobUrl = `https://${company.subdomain}.${company.wdNumber}.myworkdayjobs.com${job.externalPath}`;

      jobs.push({
        id: generateId(),
        title: job.title,
        company: company.name,
        company_slug: slugify(company.name),
        location,
        province,
        industry: company.industry,
        job_type: 'full_time',
        description: `${job.title} at ${company.name}.\n\n${job.bulletFields?.join('\n') || ''}`,
        requirements: job.bulletFields || [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: location.toLowerCase().includes('remote'),
        is_fly_in_fly_out: location.toLowerCase().includes('camp') ||
                           location.toLowerCase().includes('fort mcmurray') ||
                           location.toLowerCase().includes('fort mac'),
        posted_at: job.postedOn || new Date().toISOString(),
        expires_at: null,
        source: 'workday',
        source_url: jobUrl,
        scraped_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.log(`  ${company.name}: Error fetching - ${error}`);
  }

  return jobs;
}

export async function scrapeWorkday(): Promise<ScrapedJob[]> {
  console.log('Fetching jobs from Workday ATS...');
  console.log(`  Checking ${WORKDAY_COMPANIES.length} companies...`);

  const allJobs: ScrapedJob[] = [];

  for (const company of WORKDAY_COMPANIES) {
    console.log(`  Fetching: ${company.name}`);

    const jobs = await fetchWorkdayJobs(company);
    allJobs.push(...jobs);

    if (jobs.length > 0) {
      console.log(`    Found ${jobs.length} Canadian jobs`);
    }

    // Rate limiting - be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`Total Workday jobs found: ${allJobs.length}`);
  return allJobs;
}

export default scrapeWorkday;
