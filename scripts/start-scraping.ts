#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { createScrapingSystem } from '../lib/scraping'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function main() {
  console.log('🚀 Starting Canadian Resource Job Board Scraping System...')

  try {
    // Create the scraping system
    const scrapingSystem = createScrapingSystem()

    // Check environment variables
    if (!process.env.SCRAPINGBEE_API_KEY) {
      console.error('❌ SCRAPINGBEE_API_KEY environment variable is required')
      process.exit(1)
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase environment variables are required')
      process.exit(1)
    }

    // Start the scheduler
    scrapingSystem.scheduler.start()

    console.log('✅ Scraping system started successfully!')
    console.log('📊 Scheduler status:', scrapingSystem.scheduler.getStatus())

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down scraping system...')
      scrapingSystem.scheduler.stop()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down scraping system...')
      scrapingSystem.scheduler.stop()
      process.exit(0)
    })

    // Test scraping - run immediately to populate database
    console.log('🧪 Running test scrape to populate database...')
    const testResult = await scrapingSystem.manager.scrapePlatform('indeed', {
      maxPages: 2,
      dateRange: 'week',
      sectors: ['mining', 'oil_gas', 'forestry', 'renewable', 'utilities']
    })
    console.log('🧪 Test result:', testResult)

  } catch (error) {
    console.error('❌ Error starting scraping system:', error)
    process.exit(1)
  }
}

// Run the main function
if (require.main === module) {
  main().catch(console.error)
}

export { main as startScrapingSystem }