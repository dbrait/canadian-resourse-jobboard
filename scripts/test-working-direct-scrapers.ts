#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import * as cheerio from 'cheerio'

// Load environment variables
config({ path: '.env.local' })

interface CompanyConfig {
  name: string
  sector: string
  baseUrl: string
  careersPath: string
  selectors: {
    jobCard: string[]
    title: string[]
    location: string[]
    applyLink: string[]
  }
}

const WORKING_COMPANIES: CompanyConfig[] = [
  {
    name: 'Canadian National Railway',
    sector: 'transportation',
    baseUrl: 'https://www.cn.ca',
    careersPath: '/en/careers',
    selectors: {
      jobCard: ['.career-search-result', '.job-posting', '.career-opportunity', '.position-listing', '.job-item', 'article', '.result'],
      title: ['.job-title', '.position-title', 'h3', 'h2', '.title', 'a[href*="job"]'],
      location: ['.job-location', '.location', '.workplace', '.city'],
      applyLink: ['.apply-link', '.job-title a', 'a[href*="apply"]', 'a[href*="job"]', 'a']
    }
  },
  {
    name: 'Teck Resources Limited',
    sector: 'mining',
    baseUrl: 'https://www.teck.com',
    careersPath: '/careers',
    selectors: {
      jobCard: ['.job-posting', '.career-listing', '.position', '.job-item', 'article'],
      title: ['.job-title', 'h3', 'h2', '.title'],
      location: ['.location', '.job-location'],
      applyLink: ['a[href*="apply"]', '.job-title a', 'a']
    }
  },
  {
    name: 'West Fraser Timber Co. Ltd.',
    sector: 'forestry',
    baseUrl: 'https://www.westfraser.com',
    careersPath: '/careers',
    selectors: {
      jobCard: ['.job-listing', '.career-opportunity', '.job-item', 'article'],
      title: ['.job-title', 'h3', '.title'],
      location: ['.location', '.job-location'],
      applyLink: ['a[href*="apply"]', 'a']
    }
  }
]

async function scrapeCompanyWithFetch(company: CompanyConfig) {
  console.log(`\n🏢 Scraping ${company.name}...`)
  
  const apiKey = process.env.SCRAPINGBEE_API_KEY
  if (!apiKey) {
    throw new Error('SCRAPINGBEE_API_KEY not found')
  }

  const url = `${company.baseUrl}${company.careersPath}`
  console.log(`   URL: ${url}`)

  try {
    // Use minimal parameters that we know work
    const queryParams = new URLSearchParams({
      api_key: apiKey,
      url: url,
      country_code: 'ca',
      render_js: 'true',
      wait: '3000'
    })
    
    const scrapingUrl = `https://app.scrapingbee.com/api/v1/?${queryParams}`
    
    const startTime = Date.now()
    const response = await fetch(scrapingUrl)
    const timeElapsed = Date.now() - startTime
    
    if (response.status !== 200) {
      console.log(`   ❌ Failed: ${response.status} ${response.statusText}`)
      return { company: company.name, jobs: [], success: false, time: timeElapsed }
    }

    const html = await response.text()
    console.log(`   📄 Received ${html.length} characters in ${timeElapsed}ms`)

    // Parse jobs from HTML
    const jobs = parseJobsFromHtml(html, company, url)
    
    console.log(`   ✅ Found ${jobs.length} potential jobs`)
    
    if (jobs.length > 0) {
      console.log(`   🎯 Sample jobs:`)
      jobs.slice(0, 3).forEach((job, index) => {
        console.log(`      ${index + 1}. ${job.title} in ${job.location}`)
      })
    }

    return { 
      company: company.name, 
      jobs, 
      success: jobs.length > 0, 
      time: timeElapsed 
    }

  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { company: company.name, jobs: [], success: false, time: 0 }
  }
}

function parseJobsFromHtml(html: string, company: CompanyConfig, sourceUrl: string) {
  const $ = cheerio.load(html)
  const jobs: any[] = []

  // Try each job card selector
  for (const selector of company.selectors.jobCard) {
    const jobCards = $(selector)
    
    if (jobCards.length > 0) {
      console.log(`   🎯 Found ${jobCards.length} job cards using selector: ${selector}`)
      
      jobCards.each((index, element) => {
        if (index >= 10) return false // Limit to 10 jobs per company
        
        const $card = $(element)
        
        // Extract title
        let title = ''
        for (const titleSelector of company.selectors.title) {
          title = $card.find(titleSelector).first().text().trim()
          if (title) break
        }
        
        // Extract location
        let location = ''
        for (const locationSelector of company.selectors.location) {
          location = $card.find(locationSelector).first().text().trim()
          if (location) break
        }
        
        // Extract apply link
        let applicationUrl = ''
        for (const linkSelector of company.selectors.applyLink) {
          const href = $card.find(linkSelector).first().attr('href')
          if (href) {
            applicationUrl = href.startsWith('http') ? href : `${company.baseUrl}${href}`
            break
          }
        }

        // Only add if we have at least a title
        if (title && title.length > 3) {
          jobs.push({
            title: cleanText(title),
            company: company.name,
            location: cleanText(location) || 'Canada',
            sector: company.sector,
            applicationUrl: applicationUrl,
            sourceUrl: sourceUrl
          })
        }
      })
      
      break // Stop after finding jobs with first working selector
    }
  }

  // Fallback: look for job-related links if no structured jobs found
  if (jobs.length === 0) {
    const jobKeywords = ['job', 'career', 'position', 'opportunity', 'opening', 'vacancy']
    
    $('a').each((index, element) => {
      if (jobs.length >= 5) return false // Limit fallback results
      
      const $link = $(element)
      const linkText = $link.text().trim().toLowerCase()
      const href = $link.attr('href')
      
      const isJobLink = jobKeywords.some(keyword => linkText.includes(keyword))
      
      if (isJobLink && href && linkText.length > 5 && linkText.length < 100) {
        jobs.push({
          title: cleanText($link.text().trim()),
          company: company.name,
          location: 'Canada',
          sector: company.sector,
          applicationUrl: href.startsWith('http') ? href : `${company.baseUrl}${href}`,
          sourceUrl: sourceUrl
        })
      }
    })
    
    if (jobs.length > 0) {
      console.log(`   🔗 Used fallback method - found ${jobs.length} job links`)
    }
  }

  return jobs
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

async function main() {
  console.log('🇨🇦 Direct Company Website Scraper Test (Using Fetch)')
  console.log('🎯 Testing companies that we know ScrapingBee can access')
  console.log('='.repeat(60))
  
  const results = []
  
  for (const company of WORKING_COMPANIES) {
    const result = await scrapeCompanyWithFetch(company)
    results.push(result)
    
    // Small delay between companies
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Summary
  console.log('\n📊 FINAL RESULTS:')
  console.log('='.repeat(50))
  
  const successful = results.filter(r => r.success)
  const totalJobs = results.reduce((sum, r) => sum + r.jobs.length, 0)
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length
  
  console.log(`✅ Successful scrapers: ${successful.length}/${results.length}`)
  console.log(`🎯 Total jobs found: ${totalJobs}`)
  console.log(`⏱️  Average time per company: ${(avgTime/1000).toFixed(1)}s`)
  
  if (successful.length > 0) {
    console.log('\n🏆 Working Companies:')
    successful.forEach(result => {
      console.log(`   • ${result.company}: ${result.jobs.length} jobs`)
    })
    
    console.log('\n🎉 SUCCESS!')
    console.log(`✅ Direct company scraping works for ${successful.length} companies`)
    console.log(`📈 This proves the concept - companies post jobs on their own sites`)
    console.log(`⚡ We can get exclusive jobs not found on job boards`)
    
    const estimatedFor175Companies = (avgTime * 175) / 1000 / 60
    console.log(`🕒 Estimated time for all 175 companies: ${estimatedFor175Companies.toFixed(0)} minutes`)
  } else {
    console.log('\n❌ No companies worked - need to debug further')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Next: Integrate working approach into main scraping system')
}

if (require.main === module) {
  main().catch(console.error)
}