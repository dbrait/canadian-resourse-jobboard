import { CompanyBaseScraper, CompanyConfig } from './company-base-scraper'
import { ScraperManager } from '../scraper-manager'
import { ScrapedJob, ScrapingOptions } from '../../../types/scraping'
import * as cheerio from 'cheerio'

export class SuncorScraper extends CompanyBaseScraper {
  constructor(scraperManager: ScraperManager) {
    const config: CompanyConfig = {
      name: 'Suncor Energy Inc.',
      sector: 'oil gas',
      baseUrl: 'https://www.suncor.com',
      careersPath: '/en-ca/careers',
      selectors: {
        jobCard: [
          '.job-listing',
          '.career-opportunity',
          '[data-job-id]',
          '.job-item',
          '.position',
          '.career-posting',
          '.job-card'
        ],
        title: [
          '.job-title',
          '.position-title',
          '.career-title',
          'h3',
          'h2',
          '.title',
          '[class*="title"]'
        ],
        location: [
          '.job-location',
          '.location',
          '.workplace',
          '[class*="location"]',
          '.city',
          '.address'
        ],
        department: [
          '.department',
          '.division',
          '.business-unit',
          '[class*="department"]'
        ],
        jobType: [
          '.job-type',
          '.employment-type',
          '.position-type',
          '[class*="type"]'
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
          
          // Suncor may use a dedicated careers portal
          const possibleUrls = [
            `${baseUrl}/en-ca/careers`,
            `${baseUrl}/careers`,
            'https://careers.suncor.com',
            'https://jobs.suncor.com',
            `${baseUrl}/en-ca/careers/search-jobs`,
            `${baseUrl}/careers/current-opportunities`
          ]

          // Add search parameters if available
          possibleUrls.forEach(url => {
            urls.push(url)
            if (options?.keywords?.length) {
              urls.push(`${url}?q=${encodeURIComponent(options.keywords.join(' '))}`)
            }
            if (options?.location) {
              urls.push(`${url}?location=${encodeURIComponent(options.location)}`)
            }
          })

          return urls.slice(0, options?.maxPages || 5)
        },

        parseJobCard: (html: string, baseUrl: string, sector: string) => {
          const $ = cheerio.load(html)

          // Try Suncor-specific parsing patterns
          const title = $('h3').first().text().trim() || 
                       $('.job-title, .position-title, .career-title').first().text().trim() ||
                       $('.title, [class*="title"]').first().text().trim()

          const location = $('.location, .job-location, [class*="location"]').first().text().trim() ||
                          $('.city, .workplace, .address').first().text().trim()

          const department = $('.department, .division, .business-unit').first().text().trim()

          // Look for apply link
          let applicationUrl = ''
          const linkElement = $('a').first()
          if (linkElement.length > 0) {
            const href = linkElement.attr('href')
            if (href) {
              applicationUrl = href.startsWith('http') ? href : `https://www.suncor.com${href}`
            }
          }

          if (!title) return null

          const job: ScrapedJob = {
            title: title,
            company: 'Suncor Energy Inc.',
            location: location || 'Canada',
            province: SuncorScraper.extractProvinceFromLocation(location),
            sector: 'oil gas',
            employment_type: 'Full-time',
            description: `${title} position at Suncor Energy Inc.`,
            requirements: department ? `Department: ${department}` : undefined,
            posted_date: new Date().toISOString().split('T')[0],
            application_url: applicationUrl,
            source_platform: 'suncor',
            source_url: baseUrl,
            external_id: SuncorScraper.generateJobId(title, location)
          }

          return job
        }
      }
    }

    super(scraperManager, config)
  }

  private static extractProvinceFromLocation(location: string): string {
    if (!location) return 'Alberta' // Suncor's primary operations

    const locationLower = location.toLowerCase()
    
    // Suncor's major locations
    if (locationLower.includes('fort mcmurray') || locationLower.includes('oil sands')) return 'Alberta'
    if (locationLower.includes('calgary') || locationLower.includes('alberta')) return 'Alberta'
    if (locationLower.includes('sarnia') || locationLower.includes('ontario')) return 'Ontario'
    if (locationLower.includes('montreal') || locationLower.includes('quebec')) return 'Quebec'
    if (locationLower.includes('vancouver') || locationLower.includes('british columbia')) return 'British Columbia'
    if (locationLower.includes('denver') || locationLower.includes('colorado')) return 'International'
    
    // Default for major Suncor operations
    return 'Alberta'
  }

  private static generateJobId(title: string, location: string): string {
    const crypto = require('crypto')
    const content = `suncor_${title}_${location}_${new Date().toISOString().split('T')[0]}`
    return crypto.createHash('md5').update(content).digest('hex')
  }

  // Override the scrape method to add Suncor-specific logic
  async scrape(options?: ScrapingOptions): Promise<any> {
    console.log('Starting Suncor Energy scraping...')
    
    // Set Suncor-specific defaults
    const suncorOptions = {
      maxPages: 3,
      dateRange: 'week' as const,
      sectors: ['oil_gas'],
      keywords: ['engineer', 'operator', 'technician', 'supervisor', 'analyst', 'specialist'],
      ...options
    }

    return super.scrape(suncorOptions)
  }
}