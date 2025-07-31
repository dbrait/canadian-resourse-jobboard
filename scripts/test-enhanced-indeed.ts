#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { testEnhancedIndeedScraper } from '../lib/scraping/practical-company-search'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🚀 Testing Enhanced Indeed Company Search Strategy\n')
  
  try {
    const result = await testEnhancedIndeedScraper()
    
    console.log('\n✅ Enhanced Indeed scraper test completed!')
    console.log(`📈 Success rate: ${result.success ? '100%' : '0%'}`)
    
    if (result.jobs.length > 0) {
      console.log('🎉 This approach is working! We found Canadian resource jobs.')
    } else {
      console.log('⚠️  No jobs found. May need to adjust search strategy.')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

if (require.main === module) {
  main().catch(console.error)
}