import { CompanyBaseScraper, CompanyConfig } from './scrapers/company-base-scraper'
import { ScraperManager } from './scraper-manager'
import { ScrapingOptions, ScrapedJob, ScrapingResult } from '../../types/scraping'
import * as cheerio from 'cheerio'

// Realistic company configurations based on actual working URLs
export const WORKING_COMPANY_CONFIGS: CompanyConfig[] = [
  // Companies with confirmed working job portals
  {
    name: 'Canadian National Railway',
    sector: 'transportation',
    baseUrl: 'https://www.cn.ca',
    careersPath: '/en/careers',
    selectors: {
      jobCard: ['.job-posting', '.career-opportunity', '.job-listing', '.position'],
      title: ['h3', 'h2', '.job-title', '.position-title'],
      location: ['.location', '.job-location', '.workplace'],
      applyLink: ['a', '.apply-link', '.view-job']
    }
  },
  
  // Use Indeed company searches for blocked companies
  {
    name: 'Suncor Energy',
    sector: 'oil_gas', 
    baseUrl: 'https://ca.indeed.com',
    careersPath: '/jobs',
    searchPath: '/jobs?q=company%3A%22Suncor%20Energy%22&l=Canada',
    selectors: {
      jobCard: ['.job_seen_beacon', '.slider_container .slider_item'],
      title: ['h2 a span', '.jobTitle a span'],
      location: ['.companyLocation'],
      applyLink: ['h2 a', '.jobTitle a']
    },
    customLogic: {
      buildSearchUrl: (baseUrl: string, options?: ScrapingOptions) => [
        'https://ca.indeed.com/jobs?q=company%3A%22Suncor%20Energy%22&l=Canada&sort=date',
        'https://ca.indeed.com/jobs?q=suncor&l=Alberta&sort=date'
      ]
    }
  },

  {
    name: 'Barrick Gold Corporation',
    sector: 'mining',
    baseUrl: 'https://ca.indeed.com', 
    careersPath: '/jobs',
    searchPath: '/jobs?q=company%3A%22Barrick%20Gold%22&l=Canada',
    selectors: {
      jobCard: ['.job_seen_beacon', '.slider_container .slider_item'],
      title: ['h2 a span', '.jobTitle a span'],
      location: ['.companyLocation'],
      applyLink: ['h2 a', '.jobTitle a']
    },
    customLogic: {
      buildSearchUrl: (baseUrl: string, options?: ScrapingOptions) => [
        'https://ca.indeed.com/jobs?q=company%3A%22Barrick%20Gold%22&l=Canada&sort=date',
        'https://ca.indeed.com/jobs?q=barrick&l=Ontario&sort=date'
      ]
    }
  },

  // External job portals for companies that use them
  {
    name: 'Shoppers Drug Mart', // Example of Workday portal
    sector: 'general',
    baseUrl: 'https://loblaws.wd3.myworkdayjobs.com',
    careersPath: '/Loblaws',
    selectors: {
      jobCard: ['[data-automation-id="jobPostingItem"]'],
      title: ['[data-automation-id="jobPostingTitle"]'],
      location: ['[data-automation-id="locations"]'],
      applyLink: ['[data-automation-id="jobPostingItem"] a']
    }
  }
]

// Fallback strategy: Use Indeed company searches for all companies
export class IndeedCompanySearchScraper extends CompanyBaseScraper {
  constructor(scraperManager: ScraperManager, companyName: string, sector: string) {
    const config: CompanyConfig = {
      name: companyName,
      sector: sector,
      baseUrl: 'https://ca.indeed.com',
      careersPath: '/jobs',
      selectors: {
        jobCard: [
          '.job_seen_beacon',
          '.slider_container .slider_item',
          '[data-jk]',
          '.jobsearch-SerpJobCard'
        ],
        title: [
          'h2 a span[title]',
          '.jobTitle a span',
          'h2 a',
          '.jobTitle'
        ],
        location: [
          '.companyLocation',
          '[data-testid="job-location"]',
          '.locationsContainer'
        ],
        applyLink: [
          'h2 a',
          '.jobTitle a',
          '[data-jk] a'
        ]
      },
      customLogic: {
        buildSearchUrl: (baseUrl: string, options?: ScrapingOptions) => {
          const encodedCompany = encodeURIComponent(`"${companyName}"`)
          const maxPages = options?.maxPages || 2
          
          const urls = [
            `https://ca.indeed.com/jobs?q=company%3A${encodedCompany}&l=Canada&sort=date&fromage=7`,
            `https://ca.indeed.com/jobs?q=${encodeURIComponent(companyName.split(' ')[0])}&l=Canada&sort=date&fromage=7`
          ]
          
          // Add pagination
          for (let page = 1; page < maxPages; page++) {
            urls.push(`${urls[0]}&start=${page * 10}`)
          }
          
          return urls
        },
        
        parseJobCard: (html: string, baseUrl: string, sector: string) => {
          const $ = cheerio.load(html)
          
          // Indeed-specific parsing
          let title = $('h2 a span[title]').attr('title') || 
                     $('h2 a span').text().trim() ||
                     $('.jobTitle a span').text().trim()
          
          let location = $('.companyLocation').text().trim() ||
                        $('[data-testid="job-location"]').text().trim()
          
          let applyUrl = $('h2 a').attr('href') || $('.jobTitle a').attr('href')
          if (applyUrl && !applyUrl.startsWith('http')) {
            applyUrl = `https://ca.indeed.com${applyUrl}`
          }
          
          if (!title || !location) return null
          
          const job: ScrapedJob = {
            title: title,
            company: companyName,
            location: location,
            province: extractProvinceFromLocation(location),
            sector: sector,
            employment_type: 'Full-time',
            description: `${title} position at ${companyName}`,
            posted_date: new Date().toISOString().split('T')[0],
            application_url: applyUrl || '',
            source_platform: 'indeed_company_search',
            source_url: baseUrl,
            external_id: generateJobId(title, companyName, location)
          }
          
          return job
        }
      }
    }
    
    super(scraperManager, config)
  }
}

// Helper functions
function extractProvinceFromLocation(location: string): string {
  if (!location) return 'Canada'
  
  const locationLower = location.toLowerCase()
  
  const provinceMap: Record<string, string> = {
    'alberta': 'Alberta', 'ab': 'Alberta', 'calgary': 'Alberta', 'edmonton': 'Alberta',
    'british columbia': 'British Columbia', 'bc': 'British Columbia', 'vancouver': 'British Columbia',
    'ontario': 'Ontario', 'on': 'Ontario', 'toronto': 'Ontario', 'ottawa': 'Ontario',
    'quebec': 'Quebec', 'qc': 'Quebec', 'montreal': 'Quebec', 'québec': 'Quebec',
    'manitoba': 'Manitoba', 'mb': 'Manitoba', 'winnipeg': 'Manitoba',
    'saskatchewan': 'Saskatchewan', 'sk': 'Saskatchewan', 'saskatoon': 'Saskatchewan',
    'nova scotia': 'Nova Scotia', 'ns': 'Nova Scotia', 'halifax': 'Nova Scotia',
    'new brunswick': 'New Brunswick', 'nb': 'New Brunswick', 'fredericton': 'New Brunswick',
    'newfoundland': 'Newfoundland and Labrador', 'nl': 'Newfoundland and Labrador',
    'pei': 'Prince Edward Island', 'prince edward island': 'Prince Edward Island',
    'northwest territories': 'Northwest Territories', 'nt': 'Northwest Territories',
    'nunavut': 'Nunavut', 'nu': 'Nunavut',
    'yukon': 'Yukon', 'yt': 'Yukon'
  }
  
  for (const [key, province] of Object.entries(provinceMap)) {
    if (locationLower.includes(key)) {
      return province
    }
  }
  
  return 'Canada'
}

function generateJobId(title: string, company: string, location: string): string {
  const crypto = require('crypto')
  const content = `${title}_${company}_${location}_${new Date().toISOString().split('T')[0]}`
  return crypto.createHash('md5').update(content).digest('hex')
}

// Realistic company scraper factory that actually works
export class RealisticCompanyScraperFactory {
  private scraperManager: ScraperManager

  constructor(scraperManager: ScraperManager) {
    this.scraperManager = scraperManager
  }

  // Create working scrapers using Indeed company searches
  createWorkingCompanyScrapers(): CompanyBaseScraper[] {
    const majorCompanies = [
      // Oil & Gas
      { name: 'Suncor Energy Inc.', sector: 'oil_gas' },
      { name: 'Canadian Natural Resources Limited', sector: 'oil_gas' },
      { name: 'Imperial Oil Limited', sector: 'oil_gas' },
      { name: 'Enbridge Inc.', sector: 'oil_gas' },
      { name: 'TC Energy Corporation', sector: 'oil_gas' },
      
      // Mining
      { name: 'Barrick Gold Corporation', sector: 'mining' },
      { name: 'Newmont Canada', sector: 'mining' },
      { name: 'Teck Resources Limited', sector: 'mining' },
      { name: 'Agnico Eagle Mines Limited', sector: 'mining' },
      { name: 'Nutrien Ltd.', sector: 'mining' },
      
      // Utilities
      { name: 'BC Hydro', sector: 'utilities' },
      { name: 'Hydro One', sector: 'utilities' },
      { name: 'Ontario Power Generation', sector: 'utilities' },
      { name: 'Manitoba Hydro', sector: 'utilities' },
      
      // Transportation  
      { name: 'Canadian National Railway', sector: 'transportation' },
      { name: 'Canadian Pacific Railway', sector: 'transportation' },
      
      // Forestry
      { name: 'West Fraser Timber', sector: 'forestry' },
      { name: 'Canfor Corporation', sector: 'forestry' },
      
      // Construction
      { name: 'SNC-Lavalin', sector: 'construction' },
      { name: 'Stantec Inc.', sector: 'construction' }
    ]

    const scrapers: CompanyBaseScraper[] = []
    
    for (const company of majorCompanies) {
      const scraper = new IndeedCompanySearchScraper(
        this.scraperManager, 
        company.name, 
        company.sector
      )
      scrapers.push(scraper)
    }
    
    return scrapers
  }

  // Get total count of working scrapers
  getTotalWorkingScrapers(): number {
    return 20 // Focus on top 20 companies that will actually work
  }
}

// Test function for realistic scrapers
export async function testRealisticScrapers(): Promise<void> {
  console.log('🧪 Testing Realistic Company Scrapers...')
  
  const scrapingSystem = (await import('./index')).createScrapingSystem()
  const factory = new RealisticCompanyScraperFactory(scrapingSystem.manager)
  
  const scrapers = factory.createWorkingCompanyScrapers()
  console.log(`Created ${scrapers.length} realistic scrapers`)
  
  // Test first few scrapers
  const testScrapers = scrapers.slice(0, 3)
  
  for (const scraper of testScrapers) {
    const companyName = (scraper as any).companyConfig.name
    console.log(`\n🔍 Testing ${companyName}...`)
    
    try {
      const result = await scraper.scrape({
        maxPages: 1,
        dateRange: 'week'
      })
      
      console.log(`   Jobs found: ${result.jobs.length}`)
      console.log(`   Errors: ${result.errors.length}`)
      console.log(`   Success: ${result.success}`)
      
      if (result.jobs.length > 0) {
        console.log(`   Sample job: ${result.jobs[0].title} in ${result.jobs[0].location}`)
      }
      
    } catch (error) {
      console.log(`   Error: ${error}`)
    }
  }
}