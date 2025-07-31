// Main entry point for the scraping system
export { ScraperManager } from './scraper-manager'
export { ScrapingScheduler } from './scheduler'
export { DatabaseManager } from './database-manager'
export { DuplicateDetector } from './duplicate-detector'

// Job Board Scrapers
export { IndeedScraper } from './scrapers/indeed-scraper'
export { JobBankScraper } from './scrapers/jobbank-scraper'

// Company Scrapers
export { SuncorScraper } from './scrapers/suncor-scraper'
export { CNRailScraper } from './scrapers/cn-rail-scraper'
export { CamecoScraper } from './scrapers/cameco-scraper'
export { CNRLScraper } from './scrapers/cnrl-scraper'
export { CompanyBaseScraper } from './scrapers/company-base-scraper'

// Configuration
export { SCRAPING_CONFIG, JOB_PLATFORMS, COMPANY_PLATFORMS, RESOURCE_SECTORS } from './config'

// Types
export * from '../../types/scraping'

// Initialize and export the main scraping system
export function createScrapingSystem() {
  const { ScraperManager } = require('./scraper-manager')
  const { ScrapingScheduler } = require('./scheduler')
  const { DatabaseManager } = require('./database-manager')
  const { DuplicateDetector } = require('./duplicate-detector')
  const { IndeedScraper } = require('./scrapers/indeed-scraper')
  const { JobBankScraper } = require('./scrapers/jobbank-scraper')
  const { CompanyScraperFactory } = require('./company-scraper-factory')
  
  const manager = new ScraperManager()
  const scheduler = new ScrapingScheduler()
  
  // Register job board scrapers
  manager.registerScraper('indeed', new IndeedScraper())
  manager.registerScraper('jobbank', new JobBankScraper())
  
  // Register all company scrapers
  try {
    const factory = new CompanyScraperFactory(manager)
    const companyScrapers = factory.createAllCompanyScrapers()
    
    console.log(`Registering ${companyScrapers.length} company scrapers...`)
    
    let registeredCount = 0
    for (const scraper of companyScrapers) {
      try {
        const scraperId = (scraper as any).platform
        manager.registerScraper(scraperId, scraper)
        registeredCount++
      } catch (error) {
        console.error(`Failed to register company scraper: ${error}`)
      }
    }
    
    console.log(`Successfully registered ${registeredCount} company scrapers`)
    
  } catch (error) {
    console.error('Error setting up company scrapers:', error)
  }
  
  return {
    manager,
    scheduler,
    database: new DatabaseManager(),
    duplicateDetector: new DuplicateDetector()
  }
}