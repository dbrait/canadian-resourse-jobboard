/**
 * Rigzone Job Scraper
 *
 * Rigzone is the largest oil & gas job board.
 * https://www.rigzone.com/jobs/
 *
 * Note: Requires HTML parsing - more complex scraping.
 */

import { ScrapedJob } from '../db';
import { generateId, slugify, parseLocation } from '../utils';

// Rigzone RSS feed URL for Canada
const RIGZONE_RSS_URL = 'https://www.rigzone.com/jobs/rss/canada/';

interface RigzoneJob {
  title: string;
  link: string;
  company: string;
  location: string;
  description: string;
  pubDate: string;
}

function parseRigzoneRss(xml: string): RigzoneJob[] {
  const jobs: RigzoneJob[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
  const linkRegex = /<link>(.*?)<\/link>/;
  const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s;
  const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const titleMatch = item.match(titleRegex);
    const linkMatch = item.match(linkRegex);
    const descMatch = item.match(descRegex);
    const dateMatch = item.match(pubDateRegex);

    if (titleMatch && linkMatch) {
      const fullTitle = (titleMatch[1] || titleMatch[2] || '').trim();
      const description = (descMatch?.[1] || descMatch?.[2] || '').trim();

      // Rigzone title format often: "Job Title - Company - Location"
      const parts = fullTitle.split(' - ');
      const title = parts[0] || fullTitle;
      const company = parts[1] || 'Oil & Gas Company';
      const location = parts[2] || 'Canada';

      jobs.push({
        title,
        company,
        location,
        link: linkMatch[1].trim(),
        description: description.replace(/<[^>]*>/g, ' ').trim(),
        pubDate: dateMatch?.[1] || new Date().toISOString(),
      });
    }
  }

  return jobs;
}

export async function scrapeRigzone(): Promise<ScrapedJob[]> {
  console.log('Fetching jobs from Rigzone...');

  const allJobs: ScrapedJob[] = [];

  try {
    const response = await fetch(RIGZONE_RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      console.log(`  Rigzone returned ${response.status}`);
      return [];
    }

    const xml = await response.text();

    // Check for blocking
    if (xml.includes('captcha') || xml.includes('blocked')) {
      console.log('  Rigzone blocked the request');
      return [];
    }

    const jobs = parseRigzoneRss(xml);

    for (const job of jobs) {
      const { province } = parseLocation(job.location);

      // Only Canadian jobs
      const isCanadian = job.location.toLowerCase().includes('canada') ||
                         job.location.toLowerCase().includes('alberta') ||
                         job.location.toLowerCase().includes('calgary') ||
                         job.location.toLowerCase().includes('edmonton') ||
                         province !== null;

      if (!isCanadian) continue;

      allJobs.push({
        id: generateId(),
        title: job.title,
        company: job.company,
        company_slug: slugify(job.company),
        location: job.location,
        province,
        industry: 'oil_gas',
        job_type: 'full_time',
        description: job.description,
        requirements: [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: false,
        is_fly_in_fly_out: job.location.toLowerCase().includes('offshore') ||
                           job.location.toLowerCase().includes('camp'),
        posted_at: new Date(job.pubDate).toISOString(),
        expires_at: null,
        source: 'rigzone',
        source_url: job.link,
        scraped_at: new Date().toISOString(),
      });
    }

    console.log(`  Found ${allJobs.length} Canadian jobs`);
  } catch (error) {
    console.log(`  Rigzone error: ${error}`);
  }

  return allJobs;
}

export default scrapeRigzone;
