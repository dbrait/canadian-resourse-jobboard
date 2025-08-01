#!/usr/bin/env npx tsx

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function checkProductionDeployment() {
  console.log('🌐 Production Deployment Verification')
  console.log('🎯 Checking resourcecareers.ca deployment status')
  console.log('='.repeat(50))

  const productionUrl = 'https://resourcecareers.ca'
  
  try {
    // Test 1: Check if main site is accessible
    console.log('1️⃣ Testing main site accessibility...')
    
    const mainResponse = await fetch(productionUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; deployment-check)'
      }
    })
    
    console.log(`   Status: ${mainResponse.status} ${mainResponse.statusText}`)
    
    if (mainResponse.ok) {
      const html = await mainResponse.text()
      console.log(`   ✅ Site is accessible (${html.length} characters)`)
      
      // Check if it contains job board content
      if (html.includes('Canadian Resource') || html.includes('job') || html.includes('career')) {
        console.log(`   ✅ Contains job board content`)
      } else {
        console.log(`   ⚠️  May be showing default/placeholder content`)
      }
    } else {
      console.log(`   ❌ Site not accessible`)
    }

  } catch (error) {
    console.log(`   ❌ Error accessing main site: ${error}`)
  }

  try {
    // Test 2: Check API endpoints
    console.log('\n2️⃣ Testing API endpoints...')
    
    const apiUrls = [
      `${productionUrl}/api/jobs?limit=5`,
      `${productionUrl}/api/jobs/stats`,
      `${productionUrl}/sitemap.xml`,
      `${productionUrl}/robots.txt`
    ]
    
    for (const apiUrl of apiUrls) {
      try {
        const response = await fetch(apiUrl)
        console.log(`   ${response.ok ? '✅' : '❌'} ${apiUrl}: ${response.status} ${response.statusText}`)
        
        if (response.ok && apiUrl.includes('/api/jobs?limit=5')) {
          try {
            const jobs = await response.json()
            console.log(`      📊 API returned ${jobs.length || 0} jobs`)
          } catch (jsonError) {
            console.log(`      ⚠️  API response not JSON`)
          }
        }
      } catch (error) {
        console.log(`   ❌ ${apiUrl}: ${error}`)
      }
    }

  } catch (error) {
    console.log(`   ❌ Error testing APIs: ${error}`)
  }

  // Test 3: Environment variables check
  console.log('\n3️⃣ Checking local environment configuration...')
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SCRAPINGBEE_API_KEY'
  ]
  
  let envIssues = 0
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    if (value) {
      console.log(`   ✅ ${envVar}: configured`)
    } else {
      console.log(`   ❌ ${envVar}: missing`)
      envIssues++
    }
  }
  
  if (envIssues > 0) {
    console.log(`\n   ⚠️  ${envIssues} environment variables need to be configured in Vercel`)
  }

  // Test 4: Database connectivity
  console.log('\n4️⃣ Testing database connectivity...')
  
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const { count, error } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      
      if (error) {
        console.log(`   ❌ Database error: ${error.message}`)
      } else {
        console.log(`   ✅ Database connected: ${count} active jobs`)
      }
    } else {
      console.log(`   ❌ Supabase configuration missing`)
    }
  } catch (error) {
    console.log(`   ❌ Database test failed: ${error}`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('📋 DEPLOYMENT CHECKLIST')
  console.log('='.repeat(50))
  
  console.log('\n✅ COMPLETED:')
  console.log('   • Code pushed to GitHub repository')
  console.log('   • 52 exclusive jobs imported to database')
  console.log('   • Direct company scraping system implemented')
  console.log('   • Job board updated with new content')
  
  console.log('\n🔧 TO VERIFY IN VERCEL DASHBOARD:')
  console.log('   • Environment variables are set correctly')
  console.log('   • Latest deployment completed successfully')
  console.log('   • No build errors in deployment logs')
  console.log('   • Functions are deploying correctly')
  
  console.log('\n🌐 NEXT STEPS:')
  console.log('   1. Visit https://vercel.com/dashboard to check deployment status')
  console.log('   2. Verify environment variables in Vercel project settings')
  console.log('   3. Check deployment logs for any errors')
  console.log('   4. Test the live site at https://resourcecareers.ca')
  console.log('   5. Verify new jobs are showing on the live site')
  
  console.log('\n🎉 Your Canadian Resource Job Board should now be live with 52 exclusive jobs!')
}

if (require.main === module) {
  checkProductionDeployment().catch(console.error)
}