#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { createScrapingSystem } from '../lib/scraping'
import { CompanyScraperFactory, CANADIAN_RESOURCE_COMPANIES } from '../lib/scraping/company-scraper-factory'
import { SCRAPING_SCHEDULE } from '../lib/scraping/schedule-config'

// Load environment variables
config({ path: '.env.local' })

async function runInitialScrape() {
  console.log('🚀 Starting Initial Company Scraping')
  console.log(`📊 Will scrape up to ${SCRAPING_SCHEDULE.initial.maxJobsPerCompany} jobs per company`)
  console.log('================================================')

  try {
    // Create scraping system
    const scrapingSystem = createScrapingSystem()
    
    // Create company scraper factory
    const factory = new CompanyScraperFactory(scrapingSystem.manager)
    
    // Create and register all company scrapers
    const companyScrapers = factory.createAllCompanyScrapers()
    
    // Register scrapers
    for (const scraper of companyScrapers) {
      const scraperId = (scraper as any).platform
      scrapingSystem.manager.registerScraper(scraperId, scraper)
    }

    console.log(`✅ Registered ${companyScrapers.length} company scrapers`)

    // Run initial scraping for all companies
    let successCount = 0
    let totalJobs = 0
    const startTime = Date.now()

    for (const company of CANADIAN_RESOURCE_COMPANIES) {
      try {
        console.log(`\n🏢 Scraping ${company.name} (${company.sector})...`)
        
        const scraperId = company.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        const result = await scrapingSystem.manager.scrapePlatform(
          scraperId, 
          SCRAPING_SCHEDULE.initial
        )
        
        if (result.success && result.jobs.length > 0) {
          successCount++
          totalJobs += result.jobs.length
          console.log(`   ✅ Success: ${result.jobs.length} jobs found`)
        } else {
          console.log(`   ❌ Failed: ${result.errors.join(', ')}`)
        }
        
        // Add delay between companies to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error(`   ❌ Error scraping ${company.name}:`, error)
      }
    }

    const duration = (Date.now() - startTime) / 1000 / 60 // minutes
    
    console.log('\n================================================')
    console.log('📊 INITIAL SCRAPING SUMMARY')
    console.log('================================================')
    console.log(`✅ Successful companies: ${successCount}/${CANADIAN_RESOURCE_COMPANIES.length}`)
    console.log(`📋 Total jobs scraped: ${totalJobs}`)
    console.log(`⏱️  Total time: ${duration.toFixed(1)} minutes`)
    console.log(`📈 Average jobs per company: ${(totalJobs / successCount).toFixed(1)}`)
    console.log('================================================')

  } catch (error) {
    console.error('Fatal error during initial scraping:', error)
    process.exit(1)
  }
}

// Run the initial scrape
runInitialScrape().catch(console.error)