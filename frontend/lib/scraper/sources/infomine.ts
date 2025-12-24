/**
 * InfoMine Job Scraper
 *
 * InfoMine is a major mining industry job board.
 * https://www.infomine.com/careers/
 *
 * They have an RSS feed for mining jobs.
 */

import { ScrapedJob } from '../db';
import { generateId, slugify, parseLocation } from '../utils';

// InfoMine RSS URL
const INFOMINE_RSS_URL = 'https://www.infomine.com/careers/rss/canada/';

function parseInfoMineRss(xml: string): Array<{
  title: string;
  link: string;
  company: string;
  location: string;
  description: string;
  pubDate: string;
}> {
  const jobs: Array<{
    title: string;
    link: string;
    company: string;
    location: string;
    description: string;
    pubDate: string;
  }> = [];

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

      // Try to parse company from description
      const companyMatch = description.match(/Company:\s*([^\n<]+)/i) ||
                          description.match(/Employer:\s*([^\n<]+)/i);
      const locationMatch = description.match(/Location:\s*([^\n<]+)/i);

      jobs.push({
        title: fullTitle,
        company: companyMatch?.[1]?.trim() || 'Mining Company',
        location: locationMatch?.[1]?.trim() || 'Canada',
        link: linkMatch[1].trim(),
        description: description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        pubDate: dateMatch?.[1] || new Date().toISOString(),
      });
    }
  }

  return jobs;
}

export async function scrapeInfoMine(): Promise<ScrapedJob[]> {
  console.log('Fetching jobs from InfoMine...');

  const allJobs: ScrapedJob[] = [];

  try {
    // Try to fetch the RSS feed
    const response = await fetch(INFOMINE_RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      console.log(`  InfoMine returned ${response.status}`);
      // Fall back to alternative approach or return empty
      return [];
    }

    const xml = await response.text();

    // Check for valid RSS
    if (!xml.includes('<rss') && !xml.includes('<item>')) {
      console.log('  InfoMine did not return valid RSS');
      return [];
    }

    const jobs = parseInfoMineRss(xml);

    for (const job of jobs) {
      const { province } = parseLocation(job.location);

      allJobs.push({
        id: generateId(),
        title: job.title,
        company: job.company,
        company_slug: slugify(job.company),
        location: job.location,
        province,
        industry: 'mining',
        job_type: 'full_time',
        description: job.description,
        requirements: [],
        salary_min: null,
        salary_max: null,
        salary_text: null,
        is_remote: false,
        is_fly_in_fly_out: job.location.toLowerCase().includes('remote') ||
                           job.location.toLowerCase().includes('camp') ||
                           job.location.toLowerCase().includes('fly'),
        posted_at: new Date(job.pubDate).toISOString(),
        expires_at: null,
        source: 'infomine',
        source_url: job.link,
        scraped_at: new Date().toISOString(),
      });
    }

    console.log(`  Found ${allJobs.length} mining jobs`);
  } catch (error) {
    console.log(`  InfoMine error: ${error}`);
  }

  return allJobs;
}

export default scrapeInfoMine;
