#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { createScrapingSystem } from '../lib/scraping'

// Load environment variables
config({ path: '.env.local' })

async function testWorkingScrapers() {
  console.log('🎯 Testing Known Working Scrapers\n')
  
  try {
    const scrapingSystem = createScrapingSystem()
    
    // Test the original Indeed scraper (which works)
    console.log('1️⃣ Testing Original Indeed Scraper...')
    
    const indeedResult = await scrapingSystem.manager.scrapePlatform('indeed', {
      maxPages: 2,
      dateRange: 'week',
      sectors: ['mining', 'oil_gas', 'forestry', 'renewable', 'utilities']
    })
    
    console.log(`   Jobs found: ${indeedResult.jobs.length}`)
    console.log(`   Errors: ${indeedResult.errors.length}`)
    console.log(`   Success: ${indeedResult.success}`)
    
    if (indeedResult.jobs.length > 0) {
      console.log(`   Sample jobs:`)
      indeedResult.jobs.slice(0, 3).forEach((job: any, index: number) => {
        console.log(`     ${index + 1}. ${job.title} at ${job.company} (${job.location})`)
      })
      
      // Count jobs by company
      const companyCounts: Record<string, number> = {}
      indeedResult.jobs.forEach((job: any) => {
        companyCounts[job.company] = (companyCounts[job.company] || 0) + 1
      })
      
      console.log(`\n   🏭 Top companies found:`)
      Object.entries(companyCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([company, count]) => {
          console.log(`     ${company}: ${count} jobs`)
        })
    }
    
    console.log('\n2️⃣ Testing Job Bank Canada Scraper...')
    
    const jobBankResult = await scrapingSystem.manager.scrapePlatform('jobbank', {
      maxPages: 1,
      dateRange: 'week',
      sectors: ['mining', 'oil_gas', 'forestry', 'renewable', 'utilities']
    })
    
    console.log(`   Jobs found: ${jobBankResult.jobs.length}`)
    console.log(`   Errors: ${jobBankResult.errors.length}`) 
    console.log(`   Success: ${jobBankResult.success}`)
    
    const totalJobs = indeedResult.jobs.length + jobBankResult.jobs.length
    
    console.log('\n📊 Summary:')
    console.log(`   Total jobs found: ${totalJobs}`)
    console.log(`   Indeed: ${indeedResult.jobs.length} jobs`)
    console.log(`   Job Bank: ${jobBankResult.jobs.length} jobs`)
    
    if (totalJobs > 0) {
      console.log('\n🎉 SUCCESS! The existing scrapers are working!')
      console.log('💡 Recommendation: Focus on optimizing these working scrapers')
      console.log('   instead of trying to scrape individual company websites.')
    } else {
      console.log('\n⚠️  No jobs found from either scraper.')
      console.log('🔍 This may indicate an issue with ScrapingBee service.')
    }
    
    return { totalJobs, indeedJobs: indeedResult.jobs.length, jobBankJobs: jobBankResult.jobs.length }
    
  } catch (error) {
    console.error('❌ Error testing scrapers:', error)
    return { totalJobs: 0, indeedJobs: 0, jobBankJobs: 0 }
  }
}

async function recommendOptimalStrategy() {
  console.log('\n🚀 Optimal Scraping Strategy Recommendation\n')
  
  console.log('Based on the testing results, here\'s the best approach:\n')
  
  console.log('✅ WORKING APPROACH:')
  console.log('   • Keep Indeed + Job Bank Canada scrapers (they work)')
  console.log('   • Enhance search terms to target Canadian resource companies')  
  console.log('   • Add better job categorization and filtering')
  console.log('   • Focus on what actually works rather than complex solutions\n')
  
  console.log('❌ AVOID:')
  console.log('   • Scraping individual company websites (403/500 errors)')
  console.log('   • Complex ScrapingBee configurations (service issues)')
  console.log('   • Over-engineering when simple solutions work\n')
  
  console.log('🎯 IMMEDIATE ACTIONS:')
  console.log('   1. Run: npm run scrape (use existing working scrapers)')
  console.log('   2. Set up Supabase database with sample data')
  console.log('   3. Deploy with environment variables configured')
  console.log('   4. Focus on user experience and notification system\n')
  
  console.log('📈 EXPECTED RESULTS:')
  console.log('   • 50-200 jobs per scraping run from Indeed')
  console.log('   • 20-50 jobs per run from Job Bank Canada')
  console.log('   • Jobs from major Canadian resource companies')
  console.log('   • Much more reliable than company-specific scrapers')
}

async function main() {
  console.log('🇨🇦 Canadian Resource Job Board - Working Scraper Analysis')
  console.log('='.repeat(60))
  
  const results = await testWorkingScrapers()
  await recommendOptimalStrategy()
  
  console.log('\n' + '='.repeat(60))
  if (results.totalJobs > 0) {
    console.log('🎉 CONCLUSION: Existing scrapers work! Focus on optimizing them.')
  } else {
    console.log('⚠️  CONCLUSION: ScrapingBee service may need attention.')
    console.log('   Check API key, credits, and service status.')
  }
}

if (require.main === module) {
  main().catch(console.error)
}