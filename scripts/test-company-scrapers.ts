#!/usr/bin/env npx tsx

import { createScrapingSystem } from '../lib/scraping'

async function testCompanyScrapers() {
  console.log('🧪 Testing Company-Specific Scrapers...\n')

  try {
    // Check environment variables
    if (!process.env.SCRAPINGBEE_API_KEY) {
      console.error('❌ SCRAPINGBEE_API_KEY environment variable is required')
      process.exit(1)
    }

    // Create the scraping system
    const scrapingSystem = createScrapingSystem()

    const companies = ['suncor', 'cn_rail', 'cameco', 'cnrl']
    const testOptions = {
      maxPages: 1, // Just test the first page
      dateRange: 'week' as const
    }

    for (const company of companies) {
      console.log(`\n🔍 Testing ${company.toUpperCase()} scraper...`)
      
      try {
        const startTime = Date.now()
        const result = await scrapingSystem.manager.scrapePlatform(company, testOptions)
        const duration = Date.now() - startTime

        console.log(`✅ ${company.toUpperCase()} Results:`)
        console.log(`   • Success: ${result.success}`)
        console.log(`   • Jobs Found: ${result.total_found}`)
        console.log(`   • Jobs Parsed: ${result.jobs.length}`)
        console.log(`   • Errors: ${result.errors.length}`)
        console.log(`   • Duration: ${(duration / 1000).toFixed(2)}s`)

        if (result.jobs.length > 0) {
          console.log(`   • Sample Job: "${result.jobs[0].title}" at ${result.jobs[0].location}`)
        }

        if (result.errors.length > 0) {
          console.log(`   • Error Details: ${result.errors[0]}`)
        }

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 3000))

      } catch (error) {
        console.error(`❌ ${company.toUpperCase()} Error:`, error instanceof Error ? error.message : 'Unknown error')
      }
    }

    console.log('\n📊 Test Summary Complete!')

  } catch (error) {
    console.error('❌ Test setup error:', error)
    process.exit(1)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCompanyScrapers().catch(console.error)
}

export { testCompanyScrapers }