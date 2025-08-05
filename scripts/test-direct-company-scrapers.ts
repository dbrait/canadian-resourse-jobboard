#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { testDirectCompanyScrapers } from '../lib/scraping/direct-company-scrapers'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🏢 Direct Company Website Scraper Test')
  console.log('🎯 Scraping directly from company career pages (not job boards)')
  console.log('='.repeat(60))
  console.log()
  
  try {
    await testDirectCompanyScrapers()
    
    console.log('='.repeat(60))
    console.log('✅ Direct company scraper test completed!')
    console.log('💡 These scrapers get jobs directly from company websites')
    console.log('🎉 Much more valuable than job board aggregation!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

if (require.main === module) {
  main().catch(console.error)
}