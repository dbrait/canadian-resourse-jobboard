#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { testRealisticScrapers } from '../lib/scraping/realistic-company-scrapers'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🎯 Testing Realistic Company Scraper Approach\n')
  
  try {
    await testRealisticScrapers()
    console.log('\n✅ Realistic scraper test completed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

if (require.main === module) {
  main().catch(console.error)
}