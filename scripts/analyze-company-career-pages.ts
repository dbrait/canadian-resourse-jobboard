#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import * as cheerio from 'cheerio'
import * as fs from 'fs'

// Load environment variables
config({ path: '.env.local' })

const MAJOR_COMPANIES = [
  { name: 'Canadian National Railway', url: 'https://www.cn.ca/en/careers' },
  { name: 'Suncor Energy', url: 'https://www.suncor.com/en-ca/careers' },
  { name: 'Teck Resources', url: 'https://www.teck.com/careers' },
  { name: 'Canadian Natural Resources', url: 'https://www.cnrl.com/careers' },
  { name: 'Shopify', url: 'https://www.shopify.com/careers' }, // Tech comparison
]

async function analyzeCareerPage(company: { name: string, url: string }) {
  console.log(`\n🔍 Analyzing ${company.name}`)
  console.log(`   URL: ${company.url}`)
  
  const apiKey = process.env.SCRAPINGBEE_API_KEY
  if (!apiKey) {
    throw new Error('SCRAPINGBEE_API_KEY not found')
  }

  try {
    const queryParams = new URLSearchParams({
      api_key: apiKey,
      url: company.url,
      country_code: 'ca',
      render_js: 'true',
      wait: '5000' // Longer wait for JavaScript-heavy pages
    })
    
    const response = await fetch(`https://app.scrapingbee.com/api/v1/?${queryParams}`)
    
    if (response.status !== 200) {
      console.log(`   ❌ Failed: ${response.status}`)
      return null
    }

    const html = await response.text()
    console.log(`   📄 ${html.length} characters`)

    const $ = cheerio.load(html)
    
    // Save HTML for manual inspection (first 50KB only)
    const truncatedHtml = html.substring(0, 50000)
    const filename = `career-analysis-${company.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.html`
    fs.writeFileSync(filename, truncatedHtml)
    console.log(`   💾 Saved sample to ${filename}`)

    // Analyze page structure
    const analysis = {
      company: company.name,
      url: company.url,
      title: $('title').text(),
      hasJobBoard: false,
      detectedPatterns: [] as string[],
      potentialJobSelectors: [] as string[],
      externalJobBoards: [] as string[],
      careerSystemType: 'unknown'
    }

    // Check for common job board indicators
    const jobBoardIndicators = [
      { pattern: 'workday', selector: '[data-automation-id*="job"]' },
      { pattern: 'greenhouse', selector: '.opening' },
      { pattern: 'lever', selector: '.posting' },
      { pattern: 'bamboohr', selector: '.job-board-job' },
      { pattern: 'taleo', selector: '.jobTitle' },
      { pattern: 'successfactors', selector: '.job' },
      { pattern: 'icims', selector: '.iCIMS_JobsTable' }
    ]

    for (const indicator of jobBoardIndicators) {
      if (html.toLowerCase().includes(indicator.pattern)) {
        analysis.detectedPatterns.push(indicator.pattern)
        analysis.careerSystemType = indicator.pattern
        
        const elements = $(indicator.selector)
        if (elements.length > 0) {
          analysis.hasJobBoard = true
          analysis.potentialJobSelectors.push(indicator.selector)
          console.log(`   🎯 Found ${indicator.pattern} system with ${elements.length} job elements`)
        }
      }
    }

    // Look for external job board links
    const externalBoards = ['workday.com', 'greenhouse.io', 'lever.co', 'bamboohr.com', 'taleo.net']
    $('a').each((_, element) => {
      const href = $(element).attr('href')
      if (href) {
        for (const board of externalBoards) {
          if (href.includes(board)) {
            analysis.externalJobBoards.push(href)
            console.log(`   🔗 External job board: ${href}`)
          }
        }
      }
    })

    // Generic job-related elements analysis
    const genericSelectors = [
      'article',
      '.job', '.job-item', '.job-listing', '.job-post',
      '.position', '.opening', '.career', '.opportunity',
      '[data-job]', '[data-position]', '[data-career]',
      '.posting', '.vacancy'
    ]

    for (const selector of genericSelectors) {
      const elements = $(selector)
      if (elements.length > 0 && elements.length < 100) { // Reasonable number
        const sampleText = elements.first().text().trim().substring(0, 100)
        if (sampleText.length > 10) {
          analysis.potentialJobSelectors.push(`${selector} (${elements.length} elements)`)
        }
      }
    }

    // Check if they redirect to external career sites
    const metaRedirects = $('meta[http-equiv="refresh"]')
    if (metaRedirects.length > 0) {
      console.log(`   ↪️  Has meta redirects`)
    }

    console.log(`   📊 Analysis: ${analysis.careerSystemType} system`)
    console.log(`   🔧 Potential selectors: ${analysis.potentialJobSelectors.length}`)
    
    return analysis

  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    return null
  }
}

async function main() {
  console.log('🏢 Company Career Page Analysis')
  console.log('🎯 Understanding how major Canadian companies structure their job pages')
  console.log('='.repeat(70))

  const analyses = []
  
  for (const company of MAJOR_COMPANIES) {
    const analysis = await analyzeCareerPage(company)
    if (analysis) {
      analyses.push(analysis)
    }
    
    // Respectful delay
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  // Summary report
  console.log('\n📊 CAREER PAGE ANALYSIS SUMMARY')
  console.log('='.repeat(50))

  const systemTypes = analyses.reduce((acc, analysis) => {
    acc[analysis.careerSystemType] = (acc[analysis.careerSystemType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('\n🏗️  Career System Types:')
  Object.entries(systemTypes).forEach(([system, count]) => {
    console.log(`   • ${system}: ${count} companies`)
  })

  console.log('\n🔗 External Job Boards Found:')
  analyses.forEach(analysis => {
    if (analysis.externalJobBoards.length > 0) {
      console.log(`   • ${analysis.company}: ${analysis.externalJobBoards.length} external links`)
    }
  })

  console.log('\n💡 RECOMMENDATIONS:')
  
  const hasWorkday = analyses.some(a => a.careerSystemType === 'workday')
  const hasGreenhouse = analyses.some(a => a.careerSystemType === 'greenhouse')
  const hasExternal = analyses.some(a => a.externalJobBoards.length > 0)

  if (hasWorkday) {
    console.log('   ✅ Many companies use Workday - build Workday-specific scraper')
  }
  
  if (hasGreenhouse) {
    console.log('   ✅ Some companies use Greenhouse - add Greenhouse support')
  }
  
  if (hasExternal) {
    console.log('   ✅ Companies use external job boards - follow redirect links')
  }

  console.log('   ✅ Build system-specific scrapers rather than generic selectors')
  console.log('   ✅ Handle JavaScript-heavy career portals with longer wait times')
  
  console.log('\n📂 HTML samples saved for manual inspection')
  console.log('   Use these to build accurate selectors for each system type')
  
  console.log('\n' + '='.repeat(70))
  console.log('Next: Build system-specific scrapers based on this analysis')
}

if (require.main === module) {
  main().catch(console.error)
}