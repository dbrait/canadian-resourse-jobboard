#!/usr/bin/env npx tsx

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function verifyApiDeployment() {
  console.log('🔍 Verifying API Deployment')
  console.log('================================================')

  const baseUrl = 'https://www.resourcecareers.ca'
  const endpoints = [
    '/api/test',
    '/api/jobs',
    '/api/jobs/stats',
    '/api/scraping/stats'
  ]

  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint}`
    console.log(`\n📡 Testing: ${url}`)
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`   Status: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const data = await response.json()
          console.log(`   ✅ JSON Response: ${JSON.stringify(data).substring(0, 100)}...`)
        } else {
          console.log(`   ⚠️  Non-JSON response (${contentType})`)
        }
      } else {
        console.log(`   ❌ Failed`)
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error}`)
    }
  }

  console.log('\n================================================')
  console.log('💡 RECOMMENDATIONS:')
  console.log('================================================')
  console.log('1. If all endpoints return 404, redeploy with: vercel --prod')
  console.log('2. Check Vercel dashboard for deployment errors')
  console.log('3. Ensure environment variables are set in Vercel')
  console.log('4. Check Function logs in Vercel dashboard')
}

// Run verification
verifyApiDeployment().catch(console.error)