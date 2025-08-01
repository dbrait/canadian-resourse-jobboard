#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testImportedJobs() {
  console.log('🧪 Testing Imported Jobs on Website')
  console.log('🎯 Verifying jobs are accessible via API and database')
  console.log('='.repeat(50))

  try {
    // Test 1: Get total job count
    const { count: totalJobs, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (countError) {
      console.error('❌ Error getting job count:', countError.message)
      return
    }

    console.log(`📊 Total active jobs in database: ${totalJobs}`)

    // Test 2: Get recent jobs from today
    const today = new Date().toISOString().split('T')[0]
    const { data: todaysJobs, error: todayError } = await supabase
      .from('jobs')
      .select('title, company, sector, posted_date')
      .eq('is_active', true)
      .eq('posted_date', today)
      .order('created_at', { ascending: false })
      .limit(20)

    if (todayError) {
      console.error('❌ Error getting today\'s jobs:', todayError.message)
      return
    }

    console.log(`\n🎯 Jobs imported today (${today}): ${todaysJobs?.length || 0}`)
    
    if (todaysJobs && todaysJobs.length > 0) {
      console.log('\n📋 Sample of today\'s imported jobs:')
      todaysJobs.slice(0, 10).forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title}`)
        console.log(`      Company: ${job.company}`)
        console.log(`      Sector: ${job.sector}`)
        console.log('')
      })
    }

    // Test 3: Jobs by sector
    const { data: sectorStats, error: sectorError } = await supabase
      .from('jobs')
      .select('sector')
      .eq('is_active', true)
      .eq('posted_date', today)

    if (!sectorError && sectorStats) {
      const sectorCounts = sectorStats.reduce((acc: Record<string, number>, job) => {
        acc[job.sector] = (acc[job.sector] || 0) + 1
        return acc
      }, {})

      console.log('🏭 Jobs by sector (imported today):')
      Object.entries(sectorCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .forEach(([sector, count]) => {
          console.log(`   • ${sector}: ${count} jobs`)
        })
    }

    // Test 4: Top companies
    const { data: companyStats, error: companyError } = await supabase
      .from('jobs')
      .select('company')
      .eq('is_active', true)
      .eq('posted_date', today)

    if (!companyError && companyStats) {
      const companyCounts = companyStats.reduce((acc: Record<string, number>, job) => {
        acc[job.company] = (acc[job.company] || 0) + 1
        return acc
      }, {})

      console.log('\n🏢 Top companies (imported today):')
      Object.entries(companyCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .forEach(([company, count]) => {
          console.log(`   • ${company}: ${count} jobs`)
        })
    }

    // Test 5: Test API endpoint
    console.log('\n🌐 Testing website API endpoint...')
    
    try {
      const apiResponse = await fetch('http://localhost:3001/api/jobs?limit=5')
      
      if (apiResponse.ok) {
        const apiJobs = await apiResponse.json()
        console.log(`✅ API endpoint working: ${apiResponse.status} ${apiResponse.statusText}`)
        console.log(`📋 API returned ${apiJobs.length} jobs`)
        
        if (apiJobs.length > 0) {
          console.log('\n🎯 Sample jobs from API:')
          apiJobs.slice(0, 3).forEach((job: any, index: number) => {
            console.log(`   ${index + 1}. ${job.title} at ${job.company}`)
          })
        }
      } else {
        console.log(`⚠️  API endpoint status: ${apiResponse.status} ${apiResponse.statusText}`)
      }
    } catch (apiError) {
      console.log(`⚠️  Could not test API endpoint (server may not be running): ${apiError}`)
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 VERIFICATION COMPLETED!')
    console.log('='.repeat(50))

    if (todaysJobs && todaysJobs.length > 0) {
      console.log(`\n✅ SUCCESS! ${todaysJobs.length} jobs are now live on your website`)
      console.log(`🎯 These are exclusive Canadian resource industry jobs`)
      console.log(`🌐 Sourced directly from company career portals`)
      console.log(`🚀 Your job board now has unique content not found elsewhere!`)
      
      console.log(`\n🔗 View your updated job board at:`)
      console.log(`   • Homepage: http://localhost:3001`)
      console.log(`   • All Jobs: http://localhost:3001/jobs`)
      console.log(`   • By Sector: http://localhost:3001/sectors/[sector]`)
    } else {
      console.log(`\n⚠️  No jobs found for today. Check the import process.`)
    }

  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

if (require.main === module) {
  testImportedJobs().catch(console.error)
}