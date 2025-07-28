import { CompanyBaseScraper, CompanyConfig } from './company-base-scraper'
import { ScraperManager } from '../scraper-manager'
import { ScrapedJob, ScrapingOptions } from '../../../types/scraping'
import * as cheerio from 'cheerio'

export class CNRailScraper extends CompanyBaseScraper {
  constructor(scraperManager: ScraperManager) {
    const config: CompanyConfig = {
      name: 'Canadian National Railway Company',
      sector: 'transportation',
      baseUrl: 'https://www.cn.ca',
      careersPath: '/en/careers',
      selectors: {
        jobCard: [
          '.job-listing',
          '.career-opportunity',
          '.job-posting',
          '[data-job]',
          '.position',
          '.job-item',
          '.career-card',
          '.job-card'
        ],
        title: [
          '.job-title',
          '.position-title',
          '.career-title',
          'h3',
          'h2',
          '.title',
          '[class*="title"]',
          '.job-name'
        ],
        location: [
          '.job-location',
          '.location',
          '.city',
          '[class*="location"]',
          '.workplace',
          '.region'
        ],
        department: [
          '.department',
          '.division',
          '.business-area',
          '[class*="department"]',
          '.function'
        ],
        jobType: [
          '.job-type',
          '.employment-type',
          '.position-type',
          '[class*="type"]',
          '.classification'
        ],
        description: [
          '.job-description',
          '.description',
          '.summary',
          '.job-summary',
          '[class*="description"]'
        ],
        postDate: [
          '.post-date',
          '.posted-date',
          '.date-posted',
          '[class*="date"]'
        ],
        applyLink: [
          '.apply-button',
          '.apply-link',
          'a[href*="apply"]',
          'a[href*="job"]',
          '.job-title a',
          '.position-title a',
          'a'
        ]
      },
      customLogic: {
        buildSearchUrl: (baseUrl: string, options?: ScrapingOptions) => {
          const urls: string[] = []
          
          // CN Rail career portal variations
          const possibleUrls = [
            `${baseUrl}/en/careers`,
            `${baseUrl}/careers`,
            'https://careers.cn.ca',
            'https://jobs.cn.ca',
            `${baseUrl}/en/careers/job-opportunities`,
            `${baseUrl}/en/careers/current-openings`,
            'https://cn.taleo.net/careersection/cn_external/jobsearch.ftl', // Common Taleo integration
            'https://careers-cn.icims.com/jobs/search' // Common iCIMS integration
          ]

          // Add search parameters
          possibleUrls.forEach(url => {
            urls.push(url)
            
            // Add keyword searches
            if (options?.keywords?.length) {
              const keywords = options.keywords.join(' OR ')
              urls.push(`${url}?q=${encodeURIComponent(keywords)}`)
            }
            
            // Add location-based searches for major CN hubs
            const cnLocations = ['Montreal', 'Toronto', 'Winnipeg', 'Saskatoon', 'Edmonton', 'Vancouver', 'Halifax']
            cnLocations.forEach(location => {
              urls.push(`${url}?location=${encodeURIComponent(location)}`)
            })
          })

          return urls.slice(0, options?.maxPages || 6)
        },

        parseJobCard: (html: string, baseUrl: string, sector: string) => {
          const $ = cheerio.load(html)

          // CN Rail specific parsing patterns
          const title = $('h3, h2, .job-title, .position-title').first().text().trim() ||
                       $('.title, [class*="title"], .job-name').first().text().trim()

          const location = $('.location, .job-location, .city, [class*="location"]').first().text().trim() ||
                          $('.workplace, .region').first().text().trim()

          const department = $('.department, .division, .business-area, .function').first().text().trim()
          
          const jobType = $('.job-type, .employment-type, .classification').first().text().trim()

          // Look for apply link - CN might use external job portals
          let applicationUrl = ''
          const linkElement = $('a[href*="apply"], a[href*="job"], .apply-button, .apply-link').first() || $('a').first()
          if (linkElement.length > 0) {
            const href = linkElement.attr('href')
            if (href) {
              if (href.startsWith('http')) {
                applicationUrl = href
              } else if (href.startsWith('/')) {
                applicationUrl = `${baseUrl}${href}`
              } else {
                applicationUrl = `${baseUrl}/${href}`
              }
            }
          }

          if (!title) return null

          const job: ScrapedJob = {
            title: title,
            company: 'Canadian National Railway Company',
            location: location || 'Canada',
            province: CNRailScraper.extractProvinceFromLocation(location),
            sector: 'transportation',
            employment_type: CNRailScraper.normalizeJobType(jobType),
            description: `${title} position at Canadian National Railway Company`,
            requirements: department ? `Department: ${department}` : undefined,
            posted_date: new Date().toISOString().split('T')[0],
            application_url: applicationUrl,
            source_platform: 'cn_rail',
            source_url: baseUrl,
            external_id: CNRailScraper.generateJobId(title, location)
          }

          return job
        }
      }
    }

    super(scraperManager, config)
  }

  private static extractProvinceFromLocation(location: string): string {
    if (!location) return 'Quebec' // CN's headquarters

    const locationLower = location.toLowerCase()
    
    // CN's major operational centers
    if (locationLower.includes('montreal') || locationLower.includes('quebec')) return 'Quebec'
    if (locationLower.includes('toronto') || locationLower.includes('ontario')) return 'Ontario'
    if (locationLower.includes('winnipeg') || locationLower.includes('manitoba')) return 'Manitoba'
    if (locationLower.includes('saskatoon') || locationLower.includes('regina') || locationLower.includes('saskatchewan')) return 'Saskatchewan'
    if (locationLower.includes('edmonton') || locationLower.includes('calgary') || locationLower.includes('alberta')) return 'Alberta'
    if (locationLower.includes('vancouver') || locationLower.includes('prince george') || locationLower.includes('british columbia')) return 'British Columbia'
    if (locationLower.includes('halifax') || locationLower.includes('nova scotia')) return 'Nova Scotia'
    if (locationLower.includes('moncton') || locationLower.includes('new brunswick')) return 'New Brunswick'
    if (locationLower.includes('thunder bay')) return 'Ontario'
    if (locationLower.includes('chicago') || locationLower.includes('usa') || locationLower.includes('united states')) return 'International'
    
    // Default to Quebec (CN headquarters)
    return 'Quebec'
  }

  private static normalizeJobType(jobType: string): string {
    if (!jobType) return 'Full-time'
    
    const typeLower = jobType.toLowerCase()
    
    if (typeLower.includes('temp') || typeLower.includes('seasonal')) return 'Temporary'
    if (typeLower.includes('part')) return 'Part-time'
    if (typeLower.includes('contract')) return 'Contract'
    if (typeLower.includes('intern')) return 'Internship'
    if (typeLower.includes('apprentice') || typeLower.includes('trainee')) return 'Apprenticeship'
    
    return 'Full-time'
  }

  private static generateJobId(title: string, location: string): string {
    const crypto = require('crypto')
    const content = `cn_rail_${title}_${location}_${new Date().toISOString().split('T')[0]}`
    return crypto.createHash('md5').update(content).digest('hex')
  }

  // Override the scrape method to add CN Rail-specific logic
  async scrape(options?: ScrapingOptions): Promise<any> {
    console.log('Starting Canadian National Railway scraping...')
    
    // Set CN Rail-specific defaults
    const cnOptions = {
      maxPages: 4,
      dateRange: 'week' as const,
      sectors: ['transportation'],
      keywords: [
        'conductor', 'engineer', 'locomotive', 'rail', 'transportation', 
        'mechanical', 'maintenance', 'signal', 'dispatcher', 'yardman',
        'carman', 'electrician', 'machinist', 'welder'
      ],
      ...options
    }

    return super.scrape(cnOptions)
  }
}