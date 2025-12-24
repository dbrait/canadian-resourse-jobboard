/**
 * Workday Career Site Discovery & Scraping
 *
 * Workday career sites have varied URL structures.
 * This module discovers the correct API endpoints by:
 * 1. Fetching the career page HTML
 * 2. Extracting the embedded configuration
 * 3. Using that to call the correct API
 */

import { ScrapedJob } from '../db';
import { generateId, slugify, parseLocation } from '../utils';

interface WorkdayConfig {
  name: string;
  industry: 'mining' | 'oil_gas' | 'forestry' | 'fishing' | 'agriculture' | 'renewable_energy' | 'environmental';
  careerUrl: string;
}

// Companies with known Workday career sites
const WORKDAY_COMPANIES: WorkdayConfig[] = [
  // Mining
  { name: 'Teck Resources', industry: 'mining', careerUrl: 'https://www.teck.com/careers' },
  { name: 'Barrick Gold', industry: 'mining', careerUrl: 'https://www.barrick.com/English/careers' },
  { name: 'Agnico Eagle', industry: 'mining', careerUrl: 'https://www.agnicoeagle.com/English/careers' },
  { name: 'Kinross Gold', industry: 'mining', careerUrl: 'https://www.kinross.com/careers' },
  { name: 'Cameco', industry: 'mining', careerUrl: 'https://www.cameco.com/careers' },
  { name: 'Nutrien', industry: 'mining', careerUrl: 'https://nutrien.com/careers' },

  // Oil & Gas
  { name: 'Suncor Energy', industry: 'oil_gas', careerUrl: 'https://www.suncor.com/en-ca/careers' },
  { name: 'Canadian Natural Resources', industry: 'oil_gas', careerUrl: 'https://www.cnrl.com/careers' },
  { name: 'Cenovus Energy', industry: 'oil_gas', careerUrl: 'https://www.cenovus.com/careers' },
  { name: 'Imperial Oil', industry: 'oil_gas', careerUrl: 'https://www.imperialoil.ca/en-CA/Careers' },
  { name: 'TC Energy', industry: 'oil_gas', careerUrl: 'https://www.tcenergy.com/careers' },
  { name: 'Enbridge', industry: 'oil_gas', careerUrl: 'https://www.enbridge.com/careers' },
  { name: 'Pembina Pipeline', industry: 'oil_gas', careerUrl: 'https://www.pembina.com/careers' },

  // Forestry
  { name: 'West Fraser', industry: 'forestry', careerUrl: 'https://www.westfraser.com/careers' },
  { name: 'Canfor', industry: 'forestry', careerUrl: 'https://www.canfor.com/careers' },

  // Environmental
  { name: 'Stantec', industry: 'environmental', careerUrl: 'https://www.stantec.com/en/careers' },
  { name: 'WSP', industry: 'environmental', careerUrl: 'https://www.wsp.com/en-CA/careers' },
  { name: 'AECOM', industry: 'environmental', careerUrl: 'https://aecom.jobs' },

  // Renewable Energy
  { name: 'TransAlta', industry: 'renewable_energy', careerUrl: 'https://transalta.com/careers' },
  { name: 'Capital Power', industry: 'renewable_energy', careerUrl: 'https://www.capitalpower.com/careers' },

  // Agriculture
  { name: 'Nutrien', industry: 'agriculture', careerUrl: 'https://nutrien.com/careers' },
  { name: 'Richardson', industry: 'agriculture', careerUrl: 'https://www.richardson.ca/careers' },
  { name: 'Viterra', industry: 'agriculture', careerUrl: 'https://www.viterra.ca/en/careers' },
];

// Known working Workday API configurations (manually verified)
const VERIFIED_WORKDAY_APIS: Array<{
  name: string;
  industry: string;
  apiBase: string;
  site: string;
}> = [
  // These are example structures - need to be verified manually
  // Format: https://{company}.wd{N}.myworkdayjobs.com/wday/cxs/{company}/{site}/jobs
];

/**
 * Try to discover Workday API endpoint from career page
 */
async function discoverWorkdayApi(url: string): Promise<{
  apiBase: string;
  site: string;
} | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Look for Workday job board URL patterns in the HTML
    // Pattern 1: Direct link to Workday
    const wdPattern = /https?:\/\/([a-z0-9-]+)\.wd(\d+)\.myworkdayjobs\.com\/([^"'\s]+)/gi;
    const matches = Array.from(html.matchAll(wdPattern));

    if (matches.length > 0) {
      const match = matches[0];
      const company = match[1];
      const wdNumber = match[2];
      const site = match[3].split('/')[0].split('?')[0];

      return {
        apiBase: `https://${company}.wd${wdNumber}.myworkdayjobs.com`,
        site,
      };
    }

    // Pattern 2: Look for embedded Workday iframe
    const iframePattern = /src=["']([^"']*workday[^"']*)/gi;
    const iframeMatches = Array.from(html.matchAll(iframePattern));

    if (iframeMatches.length > 0) {
      const iframeUrl = iframeMatches[0][1];
      const wdMatch = iframeUrl.match(/([a-z0-9-]+)\.wd(\d+)\.myworkdayjobs\.com\/([^"'\s\/]+)/i);
      if (wdMatch) {
        return {
          apiBase: `https://${wdMatch[1]}.wd${wdMatch[2]}.myworkdayjobs.com`,
          site: wdMatch[3],
        };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch jobs from a Workday API endpoint
 */
async function fetchWorkdayJobs(
  apiBase: string,
  site: string,
  companyName: string,
  industry: string
): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    // Extract company subdomain from apiBase
    const subdomainMatch = apiBase.match(/https?:\/\/([^.]+)\./);
    if (!subdomainMatch) return [];

    const subdomain = subdomainMatch[1];
    const apiUrl = `${apiBase}/wday/cxs/${subdomain}/${site}/jobs`;

    console.log(`    Trying API: ${apiUrl}`);

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
      console.log(`    API returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.jobPostings || data.jobPostings.length === 0) {
      return [];
    }

    console.log(`    Found ${data.jobPostings.length} total jobs, filtering for Canada...`);

    for (const job of data.jobPostings) {
      const location = job.locationsText || '';

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
        location.toLowerCase().includes(', ns') ||
        location.toLowerCase().includes(', nb');

      if (!isCanadian) continue;

      const { province } = parseLocation(location);
      const jobUrl = `${apiBase}${job.externalPath}`;

      jobs.push({
        id: generateId(),
        title: job.title,
        company: companyName,
        company_slug: slugify(companyName),
        location: location || 'Canada',
        province,
        industry: industry as any,
        job_type: 'full_time',
        description: `${job.title} at ${companyName}.\n\n${job.bulletFields?.join('\n') || 'Apply on company website for full details.'}`,
        requirements: job.bulletFields || [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: location.toLowerCase().includes('remote'),
        is_fly_in_fly_out:
          location.toLowerCase().includes('camp') ||
          location.toLowerCase().includes('fort mcmurray'),
        posted_at: job.postedOn || new Date().toISOString(),
        expires_at: null,
        source: 'workday',
        source_url: jobUrl,
        scraped_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.log(`    Error: ${error}`);
  }

  return jobs;
}

/**
 * Main scraper function with discovery
 */
export async function scrapeWorkdayWithDiscovery(): Promise<ScrapedJob[]> {
  console.log('Scraping Workday career sites with discovery...');

  const allJobs: ScrapedJob[] = [];

  for (const company of WORKDAY_COMPANIES) {
    console.log(`\n  ${company.name}:`);
    console.log(`    Career URL: ${company.careerUrl}`);

    // Try to discover the Workday API
    const discovered = await discoverWorkdayApi(company.careerUrl);

    if (discovered) {
      console.log(`    Discovered: ${discovered.apiBase} / ${discovered.site}`);

      const jobs = await fetchWorkdayJobs(
        discovered.apiBase,
        discovered.site,
        company.name,
        company.industry
      );

      if (jobs.length > 0) {
        console.log(`    ✓ Found ${jobs.length} Canadian jobs`);
        allJobs.push(...jobs);
      } else {
        console.log(`    No Canadian jobs found`);
      }
    } else {
      console.log(`    Could not discover Workday API`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\nTotal Workday jobs found: ${allJobs.length}`);
  return allJobs;
}

export default scrapeWorkdayWithDiscovery;
