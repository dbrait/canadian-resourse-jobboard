/**
 * Company-Specific Career Page Scrapers
 *
 * This module scrapes jobs directly from company career pages.
 * Each company uses a specific ATS (Applicant Tracking System).
 *
 * Common ATS systems and their API patterns:
 * - Workday: POST to /wday/cxs/{company}/{site}/jobs
 * - Greenhouse: GET boards-api.greenhouse.io/v1/boards/{token}/jobs
 * - Lever: GET api.lever.co/v0/postings/{company}
 * - SmartRecruiters: GET api.smartrecruiters.com/v1/companies/{id}/postings
 * - Taleo: Complex, usually requires browser
 * - iCIMS: GET careers-{company}.icims.com/jobs/search
 * - BambooHR: GET {company}.bamboohr.com/jobs/
 */

import { ScrapedJob } from '../db';
import { generateId, slugify, parseLocation, classifyIndustry } from '../utils';

// ============================================================================
// COMPANY DATABASE
// ============================================================================

interface Company {
  name: string;
  industry: 'mining' | 'oil_gas' | 'forestry' | 'fishing' | 'agriculture' | 'renewable_energy' | 'environmental';
  ats: 'workday' | 'greenhouse' | 'lever' | 'smartrecruiters' | 'icims' | 'taleo' | 'custom';
  careerUrl: string;
  apiUrl?: string;
  // Workday-specific
  wdSubdomain?: string;
  wdNumber?: string;
  wdSite?: string;
  // Greenhouse-specific
  ghToken?: string;
  // Lever-specific
  leverCompany?: string;
  // SmartRecruiters-specific
  srCompanyId?: string;
}

// Major Canadian Natural Resources Companies
const COMPANIES: Company[] = [
  // ============ MINING ============
  {
    name: 'Teck Resources',
    industry: 'mining',
    ats: 'workday',
    careerUrl: 'https://teck.wd3.myworkdayjobs.com/TeckExternalCareers',
    wdSubdomain: 'teck',
    wdNumber: 'wd3',
    wdSite: 'TeckExternalCareers',
  },
  {
    name: 'Barrick Gold',
    industry: 'mining',
    ats: 'workday',
    careerUrl: 'https://barrick.wd1.myworkdayjobs.com/BarrickCareers',
    wdSubdomain: 'barrick',
    wdNumber: 'wd1',
    wdSite: 'BarrickCareers',
  },
  {
    name: 'Kinross Gold',
    industry: 'mining',
    ats: 'workday',
    careerUrl: 'https://kinross.wd5.myworkdayjobs.com/Kinross',
    wdSubdomain: 'kinross',
    wdNumber: 'wd5',
    wdSite: 'Kinross',
  },
  {
    name: 'Agnico Eagle Mines',
    industry: 'mining',
    ats: 'workday',
    careerUrl: 'https://agnicoeagle.wd3.myworkdayjobs.com/External',
    wdSubdomain: 'agnicoeagle',
    wdNumber: 'wd3',
    wdSite: 'External',
  },
  {
    name: 'Lundin Mining',
    industry: 'mining',
    ats: 'workday',
    careerUrl: 'https://lundinmining.wd3.myworkdayjobs.com/LundinMining',
    wdSubdomain: 'lundinmining',
    wdNumber: 'wd3',
    wdSite: 'LundinMining',
  },
  {
    name: 'Cameco',
    industry: 'mining',
    ats: 'workday',
    careerUrl: 'https://cameco.wd10.myworkdayjobs.com/cameco',
    wdSubdomain: 'cameco',
    wdNumber: 'wd10',
    wdSite: 'cameco',
  },
  {
    name: 'Nutrien',
    industry: 'mining', // Potash
    ats: 'workday',
    careerUrl: 'https://nutrien.wd5.myworkdayjobs.com/NutrienCareers',
    wdSubdomain: 'nutrien',
    wdNumber: 'wd5',
    wdSite: 'NutrienCareers',
  },
  {
    name: 'First Quantum Minerals',
    industry: 'mining',
    ats: 'smartrecruiters',
    careerUrl: 'https://careers.first-quantum.com/',
    srCompanyId: 'FirstQuantumMinerals',
  },
  {
    name: 'Hudbay Minerals',
    industry: 'mining',
    ats: 'greenhouse',
    careerUrl: 'https://boards.greenhouse.io/hudbay',
    ghToken: 'hudbay',
  },

  // ============ OIL & GAS ============
  {
    name: 'Suncor Energy',
    industry: 'oil_gas',
    ats: 'workday',
    careerUrl: 'https://suncor.wd1.myworkdayjobs.com/ExternalSite',
    wdSubdomain: 'suncor',
    wdNumber: 'wd1',
    wdSite: 'ExternalSite',
  },
  {
    name: 'Canadian Natural Resources',
    industry: 'oil_gas',
    ats: 'workday',
    careerUrl: 'https://cnrl.wd3.myworkdayjobs.com/CNRL',
    wdSubdomain: 'cnrl',
    wdNumber: 'wd3',
    wdSite: 'CNRL',
  },
  {
    name: 'Cenovus Energy',
    industry: 'oil_gas',
    ats: 'workday',
    careerUrl: 'https://cenovus.wd3.myworkdayjobs.com/CenovusCareers',
    wdSubdomain: 'cenovus',
    wdNumber: 'wd3',
    wdSite: 'CenovusCareers',
  },
  {
    name: 'Imperial Oil',
    industry: 'oil_gas',
    ats: 'workday',
    careerUrl: 'https://jobs.imperialoil.ca/',
    wdSubdomain: 'imperialoil',
    wdNumber: 'wd3',
    wdSite: 'imperialoil',
  },
  {
    name: 'TC Energy',
    industry: 'oil_gas',
    ats: 'workday',
    careerUrl: 'https://tcenergy.wd3.myworkdayjobs.com/TCEnergyCareers',
    wdSubdomain: 'tcenergy',
    wdNumber: 'wd3',
    wdSite: 'TCEnergyCareers',
  },
  {
    name: 'Enbridge',
    industry: 'oil_gas',
    ats: 'workday',
    careerUrl: 'https://enbridge.wd3.myworkdayjobs.com/enbridge_careers',
    wdSubdomain: 'enbridge',
    wdNumber: 'wd3',
    wdSite: 'enbridge_careers',
  },
  {
    name: 'Pembina Pipeline',
    industry: 'oil_gas',
    ats: 'workday',
    careerUrl: 'https://pembina.wd3.myworkdayjobs.com/PembinaCareers',
    wdSubdomain: 'pembina',
    wdNumber: 'wd3',
    wdSite: 'PembinaCareers',
  },
  {
    name: 'MEG Energy',
    industry: 'oil_gas',
    ats: 'smartrecruiters',
    careerUrl: 'https://careers.megenergy.com/',
    srCompanyId: 'MEGEnergy',
  },
  {
    name: 'Tourmaline Oil',
    industry: 'oil_gas',
    ats: 'greenhouse',
    careerUrl: 'https://boards.greenhouse.io/tourmalineoil',
    ghToken: 'tourmalineoil',
  },
  {
    name: 'ARC Resources',
    industry: 'oil_gas',
    ats: 'greenhouse',
    careerUrl: 'https://boards.greenhouse.io/arcresources',
    ghToken: 'arcresources',
  },

  // ============ FORESTRY ============
  {
    name: 'West Fraser Timber',
    industry: 'forestry',
    ats: 'workday',
    careerUrl: 'https://westfraser.wd5.myworkdayjobs.com/WestFraser',
    wdSubdomain: 'westfraser',
    wdNumber: 'wd5',
    wdSite: 'WestFraser',
  },
  {
    name: 'Canfor',
    industry: 'forestry',
    ats: 'workday',
    careerUrl: 'https://canfor.wd10.myworkdayjobs.com/Canfor',
    wdSubdomain: 'canfor',
    wdNumber: 'wd10',
    wdSite: 'Canfor',
  },
  {
    name: 'Resolute Forest Products',
    industry: 'forestry',
    ats: 'workday',
    careerUrl: 'https://resolute.wd5.myworkdayjobs.com/Resolute',
    wdSubdomain: 'resolute',
    wdNumber: 'wd5',
    wdSite: 'Resolute',
  },
  {
    name: 'Interfor',
    industry: 'forestry',
    ats: 'greenhouse',
    careerUrl: 'https://boards.greenhouse.io/interfor',
    ghToken: 'interfor',
  },
  {
    name: 'Mercer International',
    industry: 'forestry',
    ats: 'smartrecruiters',
    careerUrl: 'https://careers.mercerint.com/',
    srCompanyId: 'MercerInternational',
  },

  // ============ RENEWABLE ENERGY ============
  {
    name: 'TransAlta',
    industry: 'renewable_energy',
    ats: 'workday',
    careerUrl: 'https://transalta.wd3.myworkdayjobs.com/TransAlta_Careers',
    wdSubdomain: 'transalta',
    wdNumber: 'wd3',
    wdSite: 'TransAlta_Careers',
  },
  {
    name: 'Capital Power',
    industry: 'renewable_energy',
    ats: 'workday',
    careerUrl: 'https://capitalpower.wd3.myworkdayjobs.com/Capital_Power',
    wdSubdomain: 'capitalpower',
    wdNumber: 'wd3',
    wdSite: 'Capital_Power',
  },
  {
    name: 'Northland Power',
    industry: 'renewable_energy',
    ats: 'greenhouse',
    careerUrl: 'https://boards.greenhouse.io/northlandpower',
    ghToken: 'northlandpower',
  },
  {
    name: 'Innergex',
    industry: 'renewable_energy',
    ats: 'lever',
    careerUrl: 'https://jobs.lever.co/innergex',
    leverCompany: 'innergex',
  },
  {
    name: 'Boralex',
    industry: 'renewable_energy',
    ats: 'smartrecruiters',
    careerUrl: 'https://careers.boralex.com/',
    srCompanyId: 'Boralex',
  },
  {
    name: 'Brookfield Renewable',
    industry: 'renewable_energy',
    ats: 'workday',
    careerUrl: 'https://brookfield.wd5.myworkdayjobs.com/Careers',
    wdSubdomain: 'brookfield',
    wdNumber: 'wd5',
    wdSite: 'Careers',
  },

  // ============ ENVIRONMENTAL ============
  {
    name: 'Stantec',
    industry: 'environmental',
    ats: 'workday',
    careerUrl: 'https://stantec.wd3.myworkdayjobs.com/StantecCareers',
    wdSubdomain: 'stantec',
    wdNumber: 'wd3',
    wdSite: 'StantecCareers',
  },
  {
    name: 'WSP',
    industry: 'environmental',
    ats: 'workday',
    careerUrl: 'https://wsp.wd3.myworkdayjobs.com/WSP_Careers',
    wdSubdomain: 'wsp',
    wdNumber: 'wd3',
    wdSite: 'WSP_Careers',
  },
  {
    name: 'AECOM',
    industry: 'environmental',
    ats: 'workday',
    careerUrl: 'https://aecom.wd1.myworkdayjobs.com/Careers',
    wdSubdomain: 'aecom',
    wdNumber: 'wd1',
    wdSite: 'Careers',
  },
  {
    name: 'SNC-Lavalin',
    industry: 'environmental',
    ats: 'workday',
    careerUrl: 'https://snclavalin.wd3.myworkdayjobs.com/SNC_External',
    wdSubdomain: 'snclavalin',
    wdNumber: 'wd3',
    wdSite: 'SNC_External',
  },
  {
    name: 'Hatch',
    industry: 'environmental',
    ats: 'workday',
    careerUrl: 'https://hatch.wd3.myworkdayjobs.com/hatch_jobs',
    wdSubdomain: 'hatch',
    wdNumber: 'wd3',
    wdSite: 'hatch_jobs',
  },
  {
    name: 'Jacobs',
    industry: 'environmental',
    ats: 'workday',
    careerUrl: 'https://jacobs.wd5.myworkdayjobs.com/Jacobs_Careers',
    wdSubdomain: 'jacobs',
    wdNumber: 'wd5',
    wdSite: 'Jacobs_Careers',
  },
  {
    name: 'Wood PLC',
    industry: 'environmental',
    ats: 'workday',
    careerUrl: 'https://woodplc.wd3.myworkdayjobs.com/WoodCareers',
    wdSubdomain: 'woodplc',
    wdNumber: 'wd3',
    wdSite: 'WoodCareers',
  },

  // ============ AGRICULTURE ============
  {
    name: 'Richardson International',
    industry: 'agriculture',
    ats: 'workday',
    careerUrl: 'https://richardson.wd3.myworkdayjobs.com/Richardson',
    wdSubdomain: 'richardson',
    wdNumber: 'wd3',
    wdSite: 'Richardson',
  },
  {
    name: 'Viterra',
    industry: 'agriculture',
    ats: 'workday',
    careerUrl: 'https://viterra.wd5.myworkdayjobs.com/Viterra',
    wdSubdomain: 'viterra',
    wdNumber: 'wd5',
    wdSite: 'Viterra',
  },
  {
    name: 'Maple Leaf Foods',
    industry: 'agriculture',
    ats: 'workday',
    careerUrl: 'https://mapleleaffoods.wd3.myworkdayjobs.com/Careers',
    wdSubdomain: 'mapleleaffoods',
    wdNumber: 'wd3',
    wdSite: 'Careers',
  },
  {
    name: 'Saputo',
    industry: 'agriculture',
    ats: 'workday',
    careerUrl: 'https://saputo.wd3.myworkdayjobs.com/External',
    wdSubdomain: 'saputo',
    wdNumber: 'wd3',
    wdSite: 'External',
  },

  // ============ FISHING/AQUACULTURE ============
  {
    name: 'Cooke Aquaculture',
    industry: 'fishing',
    ats: 'icims',
    careerUrl: 'https://careers-cookeaqua.icims.com/jobs/',
  },
  {
    name: 'Mowi Canada',
    industry: 'fishing',
    ats: 'workday',
    careerUrl: 'https://mowi.wd3.myworkdayjobs.com/Mowi',
    wdSubdomain: 'mowi',
    wdNumber: 'wd3',
    wdSite: 'Mowi',
  },
  {
    name: 'Clearwater Seafoods',
    industry: 'fishing',
    ats: 'greenhouse',
    careerUrl: 'https://boards.greenhouse.io/clearwaterseafoods',
    ghToken: 'clearwaterseafoods',
  },
];

// ============================================================================
// ATS SCRAPERS
// ============================================================================

interface WorkdayJob {
  title: string;
  externalPath: string;
  locationsText: string;
  postedOn: string;
  bulletFields?: string[];
}

async function scrapeWorkdayCompany(company: Company): Promise<ScrapedJob[]> {
  if (!company.wdSubdomain || !company.wdNumber || !company.wdSite) {
    return [];
  }

  const jobs: ScrapedJob[] = [];

  try {
    const apiUrl = `https://${company.wdSubdomain}.${company.wdNumber}.myworkdayjobs.com/wday/cxs/${company.wdSubdomain}/${company.wdSite}/jobs`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit: 50,
        offset: 0,
        searchText: '',
      }),
    });

    if (!response.ok) {
      console.log(`    ${company.name}: Workday returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.jobPostings || data.jobPostings.length === 0) {
      console.log(`    ${company.name}: No jobs found`);
      return [];
    }

    for (const job of data.jobPostings as WorkdayJob[]) {
      const location = job.locationsText || 'Canada';
      const { province } = parseLocation(location);

      // Filter for Canadian jobs
      const isCanadian =
        location.toLowerCase().includes('canada') ||
        location.toLowerCase().includes('calgary') ||
        location.toLowerCase().includes('edmonton') ||
        location.toLowerCase().includes('vancouver') ||
        location.toLowerCase().includes('toronto') ||
        location.toLowerCase().includes('montreal') ||
        location.toLowerCase().includes('ottawa') ||
        location.toLowerCase().includes('winnipeg') ||
        location.toLowerCase().includes('saskatoon') ||
        location.toLowerCase().includes('regina') ||
        location.toLowerCase().includes('halifax') ||
        location.toLowerCase().includes('fort mcmurray') ||
        location.toLowerCase().includes(', ab') ||
        location.toLowerCase().includes(', bc') ||
        location.toLowerCase().includes(', on') ||
        location.toLowerCase().includes(', qc') ||
        location.toLowerCase().includes(', sk') ||
        location.toLowerCase().includes(', mb') ||
        province !== null;

      if (!isCanadian) continue;

      const jobUrl = `https://${company.wdSubdomain}.${company.wdNumber}.myworkdayjobs.com${job.externalPath}`;

      jobs.push({
        id: generateId(),
        title: job.title,
        company: company.name,
        company_slug: slugify(company.name),
        location,
        province,
        industry: company.industry,
        job_type: 'full_time',
        description: `${job.title} at ${company.name}.\n\n${job.bulletFields?.join('\n') || 'Apply on company website for full details.'}`,
        requirements: job.bulletFields || [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: location.toLowerCase().includes('remote'),
        is_fly_in_fly_out:
          location.toLowerCase().includes('camp') ||
          location.toLowerCase().includes('fort mcmurray') ||
          location.toLowerCase().includes('fly'),
        posted_at: job.postedOn || new Date().toISOString(),
        expires_at: null,
        source: 'workday',
        source_url: jobUrl,
        scraped_at: new Date().toISOString(),
      });
    }

    console.log(`    ${company.name}: Found ${jobs.length} Canadian jobs`);
  } catch (error) {
    console.log(`    ${company.name}: Error - ${error}`);
  }

  return jobs;
}

async function scrapeGreenhouseCompany(company: Company): Promise<ScrapedJob[]> {
  if (!company.ghToken) return [];

  const jobs: ScrapedJob[] = [];

  try {
    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${company.ghToken}/jobs?content=true`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResourcesJobBoard/1.0',
      },
    });

    if (!response.ok) {
      console.log(`    ${company.name}: Greenhouse returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.jobs || data.jobs.length === 0) {
      console.log(`    ${company.name}: No jobs found`);
      return [];
    }

    for (const job of data.jobs) {
      const location = job.location?.name || 'Canada';
      const { province } = parseLocation(location);

      // Filter for Canadian jobs
      const isCanadian =
        location.toLowerCase().includes('canada') ||
        location.toLowerCase().includes('calgary') ||
        location.toLowerCase().includes('vancouver') ||
        location.toLowerCase().includes('toronto') ||
        location.toLowerCase().includes('montreal') ||
        province !== null;

      if (!isCanadian && !location.toLowerCase().includes('remote')) continue;

      const description = job.content ?
        job.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 5000) :
        `${job.title} at ${company.name}`;

      jobs.push({
        id: generateId(),
        title: job.title,
        company: company.name,
        company_slug: slugify(company.name),
        location,
        province,
        industry: company.industry,
        job_type: 'full_time',
        description,
        requirements: [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: location.toLowerCase().includes('remote'),
        is_fly_in_fly_out: false,
        posted_at: job.updated_at || new Date().toISOString(),
        expires_at: null,
        source: 'greenhouse',
        source_url: job.absolute_url,
        scraped_at: new Date().toISOString(),
      });
    }

    console.log(`    ${company.name}: Found ${jobs.length} Canadian jobs`);
  } catch (error) {
    console.log(`    ${company.name}: Error - ${error}`);
  }

  return jobs;
}

async function scrapeLeverCompany(company: Company): Promise<ScrapedJob[]> {
  if (!company.leverCompany) return [];

  const jobs: ScrapedJob[] = [];

  try {
    const apiUrl = `https://api.lever.co/v0/postings/${company.leverCompany}?mode=json`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResourcesJobBoard/1.0',
      },
    });

    if (!response.ok) {
      console.log(`    ${company.name}: Lever returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.log(`    ${company.name}: No jobs found`);
      return [];
    }

    for (const job of data) {
      const location = job.categories?.location || 'Canada';
      const { province } = parseLocation(location);

      // Filter for Canadian jobs
      const isCanadian =
        location.toLowerCase().includes('canada') ||
        location.toLowerCase().includes('toronto') ||
        location.toLowerCase().includes('vancouver') ||
        location.toLowerCase().includes('calgary') ||
        location.toLowerCase().includes('montreal') ||
        province !== null;

      if (!isCanadian && !location.toLowerCase().includes('remote')) continue;

      jobs.push({
        id: generateId(),
        title: job.text,
        company: company.name,
        company_slug: slugify(company.name),
        location,
        province,
        industry: company.industry,
        job_type: 'full_time',
        description: job.descriptionPlain || `${job.text} at ${company.name}`,
        requirements: [],
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

    console.log(`    ${company.name}: Found ${jobs.length} Canadian jobs`);
  } catch (error) {
    console.log(`    ${company.name}: Error - ${error}`);
  }

  return jobs;
}

async function scrapeSmartRecruitersCompany(company: Company): Promise<ScrapedJob[]> {
  if (!company.srCompanyId) return [];

  const jobs: ScrapedJob[] = [];

  try {
    const apiUrl = `https://api.smartrecruiters.com/v1/companies/${company.srCompanyId}/postings?country=Canada`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResourcesJobBoard/1.0',
      },
    });

    if (!response.ok) {
      console.log(`    ${company.name}: SmartRecruiters returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.content || data.content.length === 0) {
      console.log(`    ${company.name}: No jobs found`);
      return [];
    }

    for (const job of data.content) {
      const location = job.location?.city
        ? `${job.location.city}, ${job.location.region || job.location.country}`
        : 'Canada';
      const { province } = parseLocation(location);

      jobs.push({
        id: generateId(),
        title: job.name,
        company: company.name,
        company_slug: slugify(company.name),
        location,
        province,
        industry: company.industry,
        job_type: 'full_time',
        description: `${job.name} at ${company.name}. Apply on company website for full details.`,
        requirements: [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: job.location?.remote || false,
        is_fly_in_fly_out: false,
        posted_at: job.releasedDate || new Date().toISOString(),
        expires_at: null,
        source: 'smartrecruiters',
        source_url: job.ref || company.careerUrl,
        scraped_at: new Date().toISOString(),
      });
    }

    console.log(`    ${company.name}: Found ${jobs.length} Canadian jobs`);
  } catch (error) {
    console.log(`    ${company.name}: Error - ${error}`);
  }

  return jobs;
}

// ============================================================================
// MAIN SCRAPER
// ============================================================================

export async function scrapeCompanies(): Promise<ScrapedJob[]> {
  console.log('Scraping company career pages...');
  console.log(`  Total companies to check: ${COMPANIES.length}`);

  const allJobs: ScrapedJob[] = [];
  const statsByAts: Record<string, { companies: number; jobs: number }> = {};

  // Group companies by ATS
  const byAts = COMPANIES.reduce((acc, company) => {
    if (!acc[company.ats]) acc[company.ats] = [];
    acc[company.ats].push(company);
    return acc;
  }, {} as Record<string, Company[]>);

  // Scrape each ATS type
  for (const [ats, companies] of Object.entries(byAts)) {
    console.log(`\n  Scraping ${ats.toUpperCase()} companies (${companies.length})...`);
    statsByAts[ats] = { companies: companies.length, jobs: 0 };

    for (const company of companies) {
      let jobs: ScrapedJob[] = [];

      switch (ats) {
        case 'workday':
          jobs = await scrapeWorkdayCompany(company);
          break;
        case 'greenhouse':
          jobs = await scrapeGreenhouseCompany(company);
          break;
        case 'lever':
          jobs = await scrapeLeverCompany(company);
          break;
        case 'smartrecruiters':
          jobs = await scrapeSmartRecruitersCompany(company);
          break;
        default:
          console.log(`    ${company.name}: Skipping (${ats} not implemented)`);
      }

      allJobs.push(...jobs);
      statsByAts[ats].jobs += jobs.length;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // Print summary
  console.log('\n  Company scraping summary:');
  for (const [ats, stats] of Object.entries(statsByAts)) {
    console.log(`    ${ats}: ${stats.jobs} jobs from ${stats.companies} companies`);
  }
  console.log(`  Total: ${allJobs.length} jobs`);

  return allJobs;
}

export { COMPANIES };
export default scrapeCompanies;
