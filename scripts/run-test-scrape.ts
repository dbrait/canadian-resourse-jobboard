#!/usr/bin/env npx tsx

// Simple test script to run scraping without the full application build
import { ScraperManager } from '../lib/scraping/scraper-manager'
import { IndeedScraper } from '../lib/scraping/scrapers/indeed-scraper'
import { JobBankScraper } from '../lib/scraping/scrapers/jobbank-scraper'
import { SuncorScraper } from '../lib/scraping/scrapers/suncor-scraper'
import { CNRailScraper } from '../lib/scraping/scrapers/cn-rail-scraper'
import { CamecoScraper } from '../lib/scraping/scrapers/cameco-scraper'
import { CNRLScraper } from '../lib/scraping/scrapers/cnrl-scraper'
import { DatabaseManager } from '../lib/scraping/database-manager'

async function runTestScrape() {
  console.log('🚀 Starting Test Scrape of All 6 Sources...\n')

  // Check environment variables
  if (!process.env.SCRAPINGBEE_API_KEY) {
    console.error('❌ SCRAPINGBEE_API_KEY environment variable is required')
    console.log('Please add your ScrapingBee API key to .env.local')
    return
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Supabase environment variables are required')
    console.log('Please add your Supabase credentials to .env.local')
    return
  }

  try {
    // Initialize scraper manager
    const scraperManager = new ScraperManager()

    // Register all scrapers
    scraperManager.registerScraper('indeed', new IndeedScraper(scraperManager))
    scraperManager.registerScraper('jobbank', new JobBankScraper(scraperManager))
    scraperManager.registerScraper('suncor', new SuncorScraper(scraperManager))
    scraperManager.registerScraper('cn_rail', new CNRailScraper(scraperManager))
    scraperManager.registerScraper('cameco', new CamecoScraper(scraperManager))
    scraperManager.registerScraper('cnrl', new CNRLScraper(scraperManager))

    console.log('✅ All scrapers registered successfully\n')

    // Test options - small scale for testing
    const testOptions = {
      maxPages: 1, // Only first page for testing
      dateRange: 'week' as const,
      sectors: ['mining', 'oil_gas', 'transportation']
    }

    // Track results
    const results: Record<string, any> = {}
    let totalJobsFound = 0
    let totalProcessed = 0

    // Test each platform
    const platforms = ['indeed', 'jobbank', 'suncor', 'cn_rail', 'cameco', 'cnrl']
    
    for (const platform of platforms) {
      console.log(`\n🔍 Testing ${platform.toUpperCase()}...`)
      
      try {
        const startTime = Date.now()
        
        // Run the scraping
        const scrapingResult = await scraperManager.scrapePlatform(platform, testOptions)
        
        const duration = Date.now() - startTime
        
        console.log(`📊 ${platform.toUpperCase()} Results:`)
        console.log(`   • Success: ${scrapingResult.success}`)
        console.log(`   • Jobs Found: ${scrapingResult.total_found}`)
        console.log(`   • Jobs Parsed: ${scrapingResult.jobs.length}`)
        console.log(`   • Errors: ${scrapingResult.errors.length}`)
        console.log(`   • Duration: ${(duration / 1000).toFixed(2)}s`)

        if (scrapingResult.jobs.length > 0) {
          console.log(`   • Sample Job: "${scrapingResult.jobs[0].title}" at ${scrapingResult.jobs[0].location}`)
          
          // Try to save to database
          console.log(`💾 Saving ${scrapingResult.jobs.length} jobs to database...`)
          
          const dbResult = await DatabaseManager.saveScrapedJobs(scrapingResult.jobs, platform)
          
          console.log(`   • New Jobs Added: ${dbResult.newJobs}`)
          console.log(`   • Jobs Updated: ${dbResult.updatedJobs}`)
          console.log(`   • Duplicates Skipped: ${dbResult.duplicatesSkipped}`)
          console.log(`   • Errors: ${dbResult.errors}`)
          
          totalProcessed += dbResult.newJobs + dbResult.updatedJobs
        }

        if (scrapingResult.errors.length > 0) {
          console.log(`⚠️  First Error: ${scrapingResult.errors[0]}`)
        }

        totalJobsFound += scrapingResult.jobs.length
        results[platform] = scrapingResult

        // Add delay between platforms to be respectful
        if (platform !== platforms[platforms.length - 1]) {
          console.log('   ⏱️  Waiting 3 seconds before next platform...')
          await new Promise(resolve => setTimeout(resolve, 3000))
        }

      } catch (error) {
        console.error(`❌ ${platform.toUpperCase()} Error:`, error instanceof Error ? error.message : 'Unknown error')
        results[platform] = { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Final summary
    console.log('\n📈 FINAL TEST SUMMARY:')
    console.log('=' .repeat(50))
    console.log(`Total Jobs Found: ${totalJobsFound}`)
    console.log(`Total Jobs Processed to DB: ${totalProcessed}`)
    console.log(`Platforms Tested: ${platforms.length}`)
    
    const successfulPlatforms = platforms.filter(p => results[p]?.success || results[p]?.jobs?.length > 0)
    console.log(`Successful Platforms: ${successfulPlatforms.length}/${platforms.length}`)
    
    if (successfulPlatforms.length > 0) {
      console.log(`✅ Working Platforms: ${successfulPlatforms.join(', ')}`)
    }
    
    const failedPlatforms = platforms.filter(p => results[p]?.error || (!results[p]?.success && !results[p]?.jobs?.length))
    if (failedPlatforms.length > 0) {
      console.log(`❌ Failed Platforms: ${failedPlatforms.join(', ')}`)
    }

    console.log('\n🎉 Test scraping completed!')
    
    if (totalProcessed > 0) {
      console.log(`\n💡 Check your deployment at the job board URL to see if the ${totalProcessed} new jobs appear!`)
    }

  } catch (error) {
    console.error('💥 Fatal error during test scraping:', error)
  }
}

// Run the test
if (require.main === module) {
  runTestScrape().catch(console.error)
}

export { runTestScrape }