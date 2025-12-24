// Scraper source registry
// Each source module exports a scrape function that returns ScrapedJob[]

export { scrapeAdzuna } from './adzuna';
export { scrapeJobBank } from './jobbank-api';
export { scrapeWorkday } from './workday';
export { scrapeLever } from './lever';
export { scrapeGreenhouse } from './greenhouse';
export { scrapeIndeedRss } from './indeed-rss';
export { scrapeRigzone } from './rigzone';
export { scrapeInfoMine } from './infomine';
export { scrapeEcoCanada } from './eco-canada';

// Source configuration
export interface ScraperConfig {
  name: string;
  enabled: boolean;
  rateLimit: number; // ms between requests
  scraper: () => Promise<import('../db').ScrapedJob[]>;
}

export const SCRAPER_SOURCES: Record<string, ScraperConfig> = {
  adzuna: {
    name: 'Adzuna (Realistic Data)',
    enabled: true,
    rateLimit: 0,
    scraper: async () => (await import('./adzuna')).scrapeAdzuna(),
  },
  jobbank: {
    name: 'Canada Job Bank API',
    enabled: true,
    rateLimit: 1000,
    scraper: async () => (await import('./jobbank-api')).scrapeJobBank(),
  },
  workday: {
    name: 'Workday ATS (Major Companies)',
    enabled: true,
    rateLimit: 2000,
    scraper: async () => (await import('./workday')).scrapeWorkday(),
  },
  lever: {
    name: 'Lever ATS',
    enabled: true,
    rateLimit: 1000,
    scraper: async () => (await import('./lever')).scrapeLever(),
  },
  greenhouse: {
    name: 'Greenhouse ATS',
    enabled: true,
    rateLimit: 1000,
    scraper: async () => (await import('./greenhouse')).scrapeGreenhouse(),
  },
  indeed: {
    name: 'Indeed RSS Feeds',
    enabled: true,
    rateLimit: 2000,
    scraper: async () => (await import('./indeed-rss')).scrapeIndeedRss(),
  },
  rigzone: {
    name: 'Rigzone (Oil & Gas)',
    enabled: true,
    rateLimit: 2000,
    scraper: async () => (await import('./rigzone')).scrapeRigzone(),
  },
  infomine: {
    name: 'InfoMine (Mining)',
    enabled: true,
    rateLimit: 2000,
    scraper: async () => (await import('./infomine')).scrapeInfoMine(),
  },
  ecocanada: {
    name: 'ECO Canada (Environmental)',
    enabled: true,
    rateLimit: 2000,
    scraper: async () => (await import('./eco-canada')).scrapeEcoCanada(),
  },
};
