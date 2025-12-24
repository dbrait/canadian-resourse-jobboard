// Company-specific scrapers for major Canadian resource companies
import * as cheerio from 'cheerio';
import { getScrapingBeeService } from '../services/scrapingbee';
import { classifyIndustry, parseLocation, parseSalary, slugify } from '../utils';

export interface CompanyConfig {
  name: string;
  slug: string;
  sector: string;
  baseUrl: string;
  careersUrl: string;
  selectors: {
    jobCard: string[];
    title: string[];
    location: string[];
    department?: string[];
    applyLink: string[];
  };
  alternativeUrls?: string[];
}

export interface ScrapedCompanyJob {
  id: string;
  title: string;
  company: string;
  company_slug: string;
  location: string;
  province: string;
  industry: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  requirements: string[];
  posted_at: string;
  source: string;
  source_url: string;
  is_remote: boolean;
  is_fly_in_fly_out: boolean;
}

// Major Canadian resource company configurations
export const COMPANY_CONFIGS: CompanyConfig[] = [
  {
    name: 'Suncor Energy Inc.',
    slug: 'suncor',
    sector: 'oil_gas',
    baseUrl: 'https://www.suncor.com',
    careersUrl: 'https://www.suncor.com/en-ca/careers',
    selectors: {
      jobCard: ['.job-listing', '.career-opportunity', '[data-job-id]', '.job-item'],
      title: ['.job-title', '.position-title', 'h3', 'h2'],
      location: ['.job-location', '.location', '.workplace'],
      applyLink: ['.apply-button', '.job-title a', 'a[href*="apply"]', 'a'],
    },
    alternativeUrls: ['https://careers.suncor.com', 'https://jobs.suncor.com'],
  },
  {
    name: 'Canadian Natural Resources Limited',
    slug: 'cnrl',
    sector: 'oil_gas',
    baseUrl: 'https://www.cnrl.com',
    careersUrl: 'https://www.cnrl.com/careers',
    selectors: {
      jobCard: ['.job-posting', '.career-listing', '.position'],
      title: ['.job-title', 'h3', 'h2'],
      location: ['.location', '.job-location'],
      applyLink: ['a[href*="apply"]', '.job-title a', 'a'],
    },
  },
  {
    name: 'Teck Resources Limited',
    slug: 'teck-resources',
    sector: 'mining',
    baseUrl: 'https://www.teck.com',
    careersUrl: 'https://www.teck.com/careers',
    selectors: {
      jobCard: ['.job-posting', '.career-listing', '.position'],
      title: ['.job-title', 'h3', 'h2'],
      location: ['.location', '.job-location'],
      applyLink: ['a[href*="apply"]', '.job-title a', 'a'],
    },
  },
  {
    name: 'Cameco Corporation',
    slug: 'cameco',
    sector: 'mining',
    baseUrl: 'https://www.cameco.com',
    careersUrl: 'https://www.cameco.com/careers',
    selectors: {
      jobCard: ['.job-listing', '.career-opportunity'],
      title: ['.job-title', 'h3'],
      location: ['.location', '.job-location'],
      applyLink: ['a[href*="apply"]', 'a'],
    },
  },
  {
    name: 'Canadian National Railway',
    slug: 'cn-rail',
    sector: 'transportation',
    baseUrl: 'https://www.cn.ca',
    careersUrl: 'https://www.cn.ca/en/careers',
    selectors: {
      jobCard: ['.career-search-result', '.job-posting', '.position-listing'],
      title: ['.job-title', '.position-title', 'h3', 'h2'],
      location: ['.job-location', '.location', '.workplace'],
      applyLink: ['.apply-link', '.job-title a', 'a[href*="job"]'],
    },
  },
  {
    name: 'West Fraser Timber Co. Ltd.',
    slug: 'west-fraser',
    sector: 'forestry',
    baseUrl: 'https://www.westfraser.com',
    careersUrl: 'https://www.westfraser.com/careers',
    selectors: {
      jobCard: ['.job-listing', '.career-opportunity'],
      title: ['.job-title', 'h3'],
      location: ['.location', '.job-location'],
      applyLink: ['a[href*="apply"]', 'a'],
    },
  },
  {
    name: 'BC Hydro',
    slug: 'bc-hydro',
    sector: 'renewable_energy',
    baseUrl: 'https://www.bchydro.com',
    careersUrl: 'https://www.bchydro.com/careers',
    selectors: {
      jobCard: ['.job-posting', '.career-listing'],
      title: ['.job-title', 'h3'],
      location: ['.location'],
      applyLink: ['a'],
    },
  },
  {
    name: 'Imperial Oil Limited',
    slug: 'imperial-oil',
    sector: 'oil_gas',
    baseUrl: 'https://www.imperialoil.ca',
    careersUrl: 'https://careers.imperialoil.ca',
    selectors: {
      jobCard: ['.job-listing', '.career-opportunity'],
      title: ['.job-title', 'h3'],
      location: ['.location'],
      applyLink: ['a'],
    },
  },
  {
    name: 'Husky Energy (Cenovus)',
    slug: 'cenovus',
    sector: 'oil_gas',
    baseUrl: 'https://www.cenovus.com',
    careersUrl: 'https://www.cenovus.com/careers',
    selectors: {
      jobCard: ['.job-listing', '.career-opportunity'],
      title: ['.job-title', 'h3'],
      location: ['.location'],
      applyLink: ['a'],
    },
  },
  {
    name: 'Nutrien Ltd.',
    slug: 'nutrien',
    sector: 'mining',
    baseUrl: 'https://www.nutrien.com',
    careersUrl: 'https://www.nutrien.com/careers',
    selectors: {
      jobCard: ['.job-listing', '.career-opportunity'],
      title: ['.job-title', 'h3'],
      location: ['.location'],
      applyLink: ['a'],
    },
  },
];

function generateJobId(): string {
  return `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function extractTextFromSelectors($element: any, selectors: string[], $: any): string {
  for (const selector of selectors) {
    const text = $element.find(selector).first().text().trim();
    if (text && text.length > 0) {
      return text;
    }
  }
  return '';
}

function extractProvince(location: string, companyProvince?: string): string {
  const { province } = parseLocation(location);
  if (province) return province;

  // Default provinces for known company headquarters
  const provinceDefaults: Record<string, string> = {
    'suncor': 'Alberta',
    'cnrl': 'Alberta',
    'imperial-oil': 'Alberta',
    'cenovus': 'Alberta',
    'teck-resources': 'British Columbia',
    'west-fraser': 'British Columbia',
    'bc-hydro': 'British Columbia',
    'cameco': 'Saskatchewan',
    'nutrien': 'Saskatchewan',
    'cn-rail': 'Quebec',
  };

  return companyProvince ? provinceDefaults[companyProvince] || 'Canada' : 'Canada';
}

async function scrapeCompanyJobs(config: CompanyConfig): Promise<ScrapedCompanyJob[]> {
  const jobs: ScrapedCompanyJob[] = [];
  const scrapingBee = getScrapingBeeService();

  const urlsToTry = [config.careersUrl, ...(config.alternativeUrls || [])];

  for (const url of urlsToTry) {
    try {
      console.log(`  Scraping ${config.name} from ${url}...`);

      const html = await scrapingBee.fetchWithFallback(url, {
        render_js: true,
        wait: 3000,
      });

      const $ = cheerio.load(html);

      // Try each job card selector
      let jobCards: any = null;
      for (const selector of config.selectors.jobCard) {
        const cards = $(selector);
        if (cards.length > 0) {
          jobCards = cards;
          console.log(`    Found ${cards.length} job cards with selector: ${selector}`);
          break;
        }
      }

      if (!jobCards || jobCards.length === 0) {
        // Fallback: look for job-related links
        const fallbackJobs = findJobLinksAsFallback($, config, url);
        jobs.push(...fallbackJobs);
        continue;
      }

      jobCards.each((index: number, element: any) => {
        try {
          const $card = $(element);
          const title = extractTextFromSelectors($card, config.selectors.title, $);
          const location = extractTextFromSelectors($card, config.selectors.location, $);

          if (!title) return;

          // Extract apply link
          let applicationUrl = '';
          for (const selector of config.selectors.applyLink) {
            const href = $card.find(selector).first().attr('href');
            if (href) {
              applicationUrl = href.startsWith('http') ? href : `${config.baseUrl}${href}`;
              break;
            }
          }

          const job: ScrapedCompanyJob = {
            id: generateJobId(),
            title: title.trim(),
            company: config.name,
            company_slug: config.slug,
            location: location || 'Canada',
            province: extractProvince(location, config.slug),
            industry: config.sector,
            job_type: 'full_time',
            salary_min: null,
            salary_max: null,
            description: `${title} position at ${config.name}`,
            requirements: [],
            posted_at: new Date().toISOString(),
            source: `company_${config.slug}`,
            source_url: applicationUrl || url,
            is_remote: false,
            is_fly_in_fly_out: location.toLowerCase().includes('fly') || location.toLowerCase().includes('camp'),
          };

          jobs.push(job);
        } catch (error) {
          console.error(`    Error parsing job card: ${error}`);
        }
      });

      // If we found jobs, don't try alternative URLs
      if (jobs.length > 0) break;

    } catch (error) {
      console.error(`  Error scraping ${url}: ${error}`);
    }
  }

  return jobs;
}

function findJobLinksAsFallback($: any, config: CompanyConfig, sourceUrl: string): ScrapedCompanyJob[] {
  const jobs: ScrapedCompanyJob[] = [];
  const jobKeywords = ['job', 'career', 'position', 'opportunity', 'opening', 'vacancy', 'engineer', 'operator', 'technician'];

  $('a').each((index: number, element: any) => {
    const $link = $(element);
    const linkText = $link.text().trim().toLowerCase();
    const href = $link.attr('href');

    const isJobLink = jobKeywords.some(keyword => linkText.includes(keyword));

    if (isJobLink && href && linkText.length > 5 && linkText.length < 200) {
      const job: ScrapedCompanyJob = {
        id: generateJobId(),
        title: $link.text().trim(),
        company: config.name,
        company_slug: config.slug,
        location: 'Canada',
        province: extractProvince('', config.slug),
        industry: config.sector,
        job_type: 'full_time',
        salary_min: null,
        salary_max: null,
        description: `${$link.text().trim()} at ${config.name}`,
        requirements: [],
        posted_at: new Date().toISOString(),
        source: `company_${config.slug}`,
        source_url: href.startsWith('http') ? href : `${config.baseUrl}${href}`,
        is_remote: false,
        is_fly_in_fly_out: false,
      };

      jobs.push(job);
    }
  });

  return jobs.slice(0, 10); // Limit fallback results
}

export async function scrapeAllCompanies(companyFilter?: string[]): Promise<ScrapedCompanyJob[]> {
  const allJobs: ScrapedCompanyJob[] = [];

  const configsToScrape = companyFilter
    ? COMPANY_CONFIGS.filter(c => companyFilter.includes(c.slug))
    : COMPANY_CONFIGS;

  console.log(`Scraping ${configsToScrape.length} company websites...`);

  for (const config of configsToScrape) {
    try {
      const jobs = await scrapeCompanyJobs(config);
      allJobs.push(...jobs);
      console.log(`  ${config.name}: ${jobs.length} jobs found`);

      // Delay between companies to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error scraping ${config.name}: ${error}`);
    }
  }

  console.log(`Total company jobs scraped: ${allJobs.length}`);
  return allJobs;
}

export async function scrapeCompany(slug: string): Promise<ScrapedCompanyJob[]> {
  const config = COMPANY_CONFIGS.find(c => c.slug === slug);
  if (!config) {
    throw new Error(`Unknown company: ${slug}`);
  }
  return scrapeCompanyJobs(config);
}

export function getCompanyConfigs(): CompanyConfig[] {
  return COMPANY_CONFIGS;
}
