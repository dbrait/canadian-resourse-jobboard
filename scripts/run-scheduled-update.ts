#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { createScrapingSystem } from '../lib/scraping'
import { CompanyScraperFactory, CANADIAN_RESOURCE_COMPANIES } from '../lib/scraping/company-scraper-factory'
import { getScrapingOptions, COMPANY_UPDATE_FREQUENCY } from '../lib/scraping/schedule-config'

// Load environment variables
config({ path: '.env.local' })

async function runScheduledUpdate(updateType: 'daily' | 'weekly' = 'weekly') {
  console.log(`🔄 Running ${updateType.toUpperCase()} Scheduled Update`)
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

    // Filter companies based on update type
    const companiesToUpdate = CANADIAN_RESOURCE_COMPANIES.filter(company => {
      const companyId = company.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      const frequency = COMPANY_UPDATE_FREQUENCY[companyId] || 'weekly'
      return frequency === updateType || (updateType === 'weekly' && frequency === 'weekly')
    })

    console.log(`📊 Updating ${companiesToUpdate.length} companies with ${updateType} schedule`)

    let successCount = 0
    let totalNewJobs = 0
    let totalUpdatedJobs = 0
    const startTime = Date.now()

    for (const company of companiesToUpdate) {
      try {
        console.log(`\n🏢 Updating ${company.name} (${company.sector})...`)
        
        const scraperId = company.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        const scrapingOptions = getScrapingOptions(scraperId, false)
        
        const result = await scrapingSystem.manager.scrapePlatform(
          scraperId, 
          scrapingOptions
        )
        
        if (result.success && result.jobs.length > 0) {
          successCount++
          totalNewJobs += result.jobs.length
          console.log(`   ✅ Success: ${result.jobs.length} jobs found`)
          
          // Check scraping stats for new vs updated jobs
          const stats = await scrapingSystem.databaseManager.getScrapingStats(scraperId)
          if (stats && stats.length > 0) {
            const latestStats = stats[0]
            totalUpdatedJobs += latestStats.jobs_updated || 0
          }
        } else if (result.success) {
          console.log(`   ⚠️  No new jobs found`)
        } else {
          console.log(`   ❌ Failed: ${result.errors.join(', ')}`)
        }
        
        // Add delay between companies
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error) {
        console.error(`   ❌ Error updating ${company.name}:`, error)
      }
    }

    const duration = (Date.now() - startTime) / 1000 / 60 // minutes
    
    console.log('\n================================================')
    console.log(`📊 ${updateType.toUpperCase()} UPDATE SUMMARY`)
    console.log('================================================')
    console.log(`✅ Successful updates: ${successCount}/${companiesToUpdate.length}`)
    console.log(`🆕 New jobs found: ${totalNewJobs}`)
    console.log(`🔄 Jobs updated: ${totalUpdatedJobs}`)
    console.log(`⏱️  Total time: ${duration.toFixed(1)} minutes`)
    console.log('================================================')

    // Send notification summary if configured
    if (process.env.SEND_UPDATE_NOTIFICATIONS === 'true') {
      console.log('\n📧 Sending update notifications...')
      // TODO: Implement notification sending
    }

  } catch (error) {
    console.error('Fatal error during scheduled update:', error)
    process.exit(1)
  }
}

// Get update type from command line args
const updateType = process.argv[2] as 'daily' | 'weekly' || 'weekly'

// Run the scheduled update
runScheduledUpdate(updateType).catch(console.error)