#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

async function diagnoseJobLoading() {
  console.log('🔍 Diagnosing Job Loading Issues')
  console.log('🎯 Checking why jobs aren\'t displaying on resourcecareers.ca')
  console.log('='.repeat(60))

  // Test 1: Check local database connection
  console.log('1️⃣ Testing local database connection...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('   ❌ Missing Supabase environment variables')
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}`)
    console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? 'Set' : 'Missing'}`)
    return
  }

  console.log('   ✅ Environment variables found')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`)

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test database connection
    const { data: jobs, error, count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .limit(10)

    if (error) {
      console.log(`   ❌ Database error: ${error.message}`)
      console.log(`   Code: ${error.code}`)
      console.log(`   Details: ${JSON.stringify(error.details)}`)
      return
    }

    console.log(`   ✅ Database connection successful`)
    console.log(`   📊 Total active jobs: ${count}`)
    console.log(`   📋 Sample jobs retrieved: ${jobs?.length || 0}`)

    if (jobs && jobs.length > 0) {
      console.log('\n   🎯 Sample job data:')
      jobs.slice(0, 3).forEach((job, index) => {
        console.log(`      ${index + 1}. ${job.title}`)
        console.log(`          Company: ${job.company}`)
        console.log(`          Sector: ${job.sector}`)
        console.log(`          Posted: ${job.posted_date}`)
        console.log(`          Active: ${job.is_active}`)
        console.log('')
      })
    }

  } catch (error) {
    console.log(`   ❌ Connection failed: ${error}`)
    return
  }

  // Test 2: Check production site API
  console.log('2️⃣ Testing production site API...')
  
  try {
    const productionUrl = 'https://resourcecareers.ca'
    
    // Test API endpoint
    const apiResponse = await fetch(`${productionUrl}/api/jobs?limit=5`, {
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'Job-Loading-Diagnostic'
      }
    })

    console.log(`   API Status: ${apiResponse.status} ${apiResponse.statusText}`)

    if (apiResponse.ok) {
      try {
        const apiJobs = await apiResponse.json()
        console.log(`   ✅ API working - returned ${Array.isArray(apiJobs) ? apiJobs.length : 'unknown'} jobs`)
        
        if (Array.isArray(apiJobs) && apiJobs.length > 0) {
          console.log('\n   🎯 API sample data:')
          apiJobs.slice(0, 2).forEach((job, index) => {
            console.log(`      ${index + 1}. ${job.title} at ${job.company}`)
          })
        } else if (Array.isArray(apiJobs) && apiJobs.length === 0) {
          console.log('   ⚠️  API returns empty array - no jobs found')
        }
      } catch (jsonError) {
        console.log(`   ❌ API response not valid JSON: ${jsonError}`)
        const text = await apiResponse.text()
        console.log(`   Response text: ${text.substring(0, 200)}...`)
      }
    } else {
      console.log(`   ❌ API endpoint not working`)
      if (apiResponse.status === 404) {
        console.log('   💡 API route may not be deployed correctly')
      }
    }

  } catch (error) {
    console.log(`   ❌ API test failed: ${error}`)
  }

  // Test 3: Check main page for job content
  console.log('\n3️⃣ Testing main page for job content...')
  
  try {
    const mainPageResponse = await fetch('https://resourcecareers.ca', {
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'Job-Loading-Diagnostic'
      }
    })

    console.log(`   Main page status: ${mainPageResponse.status} ${mainPageResponse.statusText}`)

    if (mainPageResponse.ok) {
      const html = await mainPageResponse.text()
      console.log(`   📄 Page size: ${html.length} characters`)

      // Check for job-related content
      const jobIndicators = [
        'West Fraser',
        'Tourmaline Oil',
        'BC Hydro',
        'jobs found',
        'job-listing',
        'position',
        'Engineer',
        'Manager'
      ]

      const foundIndicators = jobIndicators.filter(indicator => 
        html.toLowerCase().includes(indicator.toLowerCase())
      )

      if (foundIndicators.length > 0) {
        console.log(`   ✅ Found job-related content: ${foundIndicators.join(', ')}`)
      } else {
        console.log(`   ⚠️  No job-related content found on main page`)
      }

      // Check for error messages
      const errorIndicators = ['404', 'Not Found', 'Error', 'Unable to connect']
      const foundErrors = errorIndicators.filter(error => html.includes(error))
      
      if (foundErrors.length > 0) {
        console.log(`   ❌ Found error indicators: ${foundErrors.join(', ')}`)
      }

    } else {
      console.log(`   ❌ Main page not accessible`)
    }

  } catch (error) {
    console.log(`   ❌ Main page test failed: ${error}`)
  }

  // Test 4: Check environment variables in production
  console.log('\n4️⃣ Environment variable analysis...')
  
  console.log('   📋 Required environment variables for production:')
  console.log('      • NEXT_PUBLIC_SUPABASE_URL (public)')
  console.log('      • NEXT_PUBLIC_SUPABASE_ANON_KEY (public)')
  console.log('      • SUPABASE_SERVICE_ROLE_KEY (server-only, optional)')
  
  console.log('\n   🔧 Local environment status:')
  console.log(`      ✅ NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}`)
  console.log(`      ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}`)
  console.log(`      ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '⚠️'} SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'}`)

  console.log('\n' + '='.repeat(60))
  console.log('🔧 DIAGNOSIS SUMMARY')
  console.log('='.repeat(60))

  console.log('\n💡 MOST LIKELY CAUSES:')
  console.log('   1. Environment variables not set in Vercel dashboard')
  console.log('   2. API routes not deploying correctly')  
  console.log('   3. Database permissions or connection issues in production')
  console.log('   4. Build process not including job data fetch')
  console.log('   5. Caching issues preventing fresh data load')

  console.log('\n🚀 IMMEDIATE ACTIONS:')
  console.log('   1. Check Vercel dashboard environment variables:')
  console.log('      https://vercel.com/[your-username]/[project-name]/settings/environment-variables')
  console.log('   2. Ensure these variables are set:')
  console.log(`      NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log(`      NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
  console.log('   3. Trigger manual redeploy from Vercel dashboard')
  console.log('   4. Check deployment logs for any build errors')

  console.log('\n🔍 DEBUG NEXT STEPS:')
  console.log('   • If database works locally but not in production → Environment variables')
  console.log('   • If API returns 404 → Deployment issue with API routes')
  console.log('   • If API works but page doesn\'t show jobs → Frontend issue')
  console.log('   • If no jobs in database → Re-run import script')
}

if (require.main === module) {
  diagnoseJobLoading().catch(console.error)
}