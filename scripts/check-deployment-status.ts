#!/usr/bin/env npx tsx

async function checkDeploymentStatus() {
  console.log('🔍 Checking Deployment Status After Fixes')
  console.log('🎯 Testing https://resourcecareers.ca after applying fixes')
  console.log('='.repeat(60))

  const baseUrl = 'https://resourcecareers.ca'
  
  try {
    // Test 1: Main site accessibility
    console.log('1️⃣ Testing main website...')
    const mainResponse = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; deployment-check)',
        'Cache-Control': 'no-cache'
      }
    })
    
    console.log(`   Status: ${mainResponse.status} ${mainResponse.statusText}`)
    
    if (mainResponse.ok) {
      const html = await mainResponse.text()
      console.log(`   ✅ Site accessible (${html.length} characters)`)
      
      // Check if it's showing a 404 or error page
      if (html.includes('404') || html.includes('Page Not Found')) {
        console.log(`   ⚠️  Showing 404 page`)
      } else if (html.includes('Canadian Resource') || html.includes('job')) {
        console.log(`   ✅ Job board content detected`)
      } else {
        console.log(`   ⚠️  Unexpected content - may still be deploying`)
      }
    } else {
      console.log(`   ❌ Site not accessible`)
    }

    // Test 2: API endpoints
    console.log('\n2️⃣ Testing API endpoints...')
    
    const apiTests = [
      { name: 'Jobs API', url: `${baseUrl}/api/jobs?limit=5` },
      { name: 'Jobs Stats API', url: `${baseUrl}/api/jobs/stats` },
      { name: 'Scraping API', url: `${baseUrl}/api/scraping` },
    ]
    
    for (const test of apiTests) {
      try {
        const response = await fetch(test.url, {
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        console.log(`   ${response.ok ? '✅' : '❌'} ${test.name}: ${response.status} ${response.statusText}`)
        
        if (response.ok && test.name === 'Jobs API') {
          try {
            const data = await response.json()
            console.log(`      📊 Returned ${Array.isArray(data) ? data.length : 'unknown count'} jobs`)
          } catch (jsonError) {
            console.log(`      ❌ JSON parsing failed`)
          }
        }
      } catch (error) {
        console.log(`   ❌ ${test.name}: Network error`)
      }
    }

    // Test 3: Static files
    console.log('\n3️⃣ Testing static files...')
    
    const staticTests = [
      '/sitemap.xml',
      '/robots.txt',
      '/favicon.ico'
    ]
    
    for (const staticFile of staticTests) {
      try {
        const response = await fetch(`${baseUrl}${staticFile}`)
        console.log(`   ${response.ok ? '✅' : '❌'} ${staticFile}: ${response.status}`)
      } catch (error) {
        console.log(`   ❌ ${staticFile}: Error`)
      }
    }

    // Test 4: Page routes
    console.log('\n4️⃣ Testing page routes...')
    
    const pageTests = [
      '/sectors/oil_gas',
      '/sectors/mining', 
      '/sectors/forestry',
      '/notifications'
    ]
    
    for (const page of pageTests) {
      try {
        const response = await fetch(`${baseUrl}${page}`)
        console.log(`   ${response.ok ? '✅' : '❌'} ${page}: ${response.status}`)
      } catch (error) {
        console.log(`   ❌ ${page}: Error`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📋 DEPLOYMENT STATUS SUMMARY')
    console.log('='.repeat(60))

    // Overall assessment
    console.log('\n🔧 FIXES APPLIED:')
    console.log('   ✅ Removed problematic crypto dependency')
    console.log('   ✅ Downgraded Zod to stable version (^3.22.4)')
    console.log('   ✅ Added Node.js engine requirements')
    console.log('   ✅ Removed experimental Next.js features')
    console.log('   ✅ Created missing Tailwind configuration')
    console.log('   ✅ Added .vercelignore to optimize deployment')

    console.log('\n🌐 DEPLOYMENT INSTRUCTIONS:')
    console.log('   1. Check Vercel Dashboard: https://vercel.com/dashboard')
    console.log('   2. Look for your project and check latest deployment logs')
    console.log('   3. Verify environment variables are configured:')
    console.log('      • NEXT_PUBLIC_SUPABASE_URL')
    console.log('      • NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('      • SCRAPINGBEE_API_KEY (optional)')
    console.log('   4. If still failing, try manual redeploy from Vercel')

    console.log('\n🚨 IF DEPLOYMENT STILL FAILS:')
    console.log('   • Use simplified config: mv next.config.simple.ts next.config.ts')
    console.log('   • Check build logs for specific error messages')
    console.log('   • Ensure project is connected to correct GitHub repository')
    console.log('   • Verify Vercel project settings match repository structure')

    console.log('\n💡 NEXT STEPS ONCE DEPLOYED:')
    console.log('   • Verify 52 exclusive jobs are visible on the site')
    console.log('   • Test job search and filtering functionality')
    console.log('   • Confirm API endpoints return job data correctly')
    console.log('   • Set up automated scraping schedule if desired')

  } catch (error) {
    console.error('❌ Deployment check failed:', error)
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:')
    console.log('   1. Check if site is completely down (DNS/Vercel issues)')
    console.log('   2. Wait 5-10 more minutes for deployment to complete')
    console.log('   3. Check Vercel deployment logs for build errors')
    console.log('   4. Verify GitHub repository has latest commits')
    console.log('   5. Try manual redeploy from Vercel dashboard')
  }
}

if (require.main === module) {
  checkDeploymentStatus().catch(console.error)
}