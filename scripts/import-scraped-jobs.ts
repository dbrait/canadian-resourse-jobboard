#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
config({ path: '.env.local' })

interface JobResult {
  title: string
  company: string
  location: string
  sector: string
  applicationUrl: string
  sourceUrl: string
  discoveryMethod: string
  scrapedAt: string
}

interface CompanyResult {
  company: string
  sector: string
  success: boolean
  jobsFound: number
  jobs: JobResult[]
  error?: string
  timeElapsed: number
  discoveryMethod: string
}

interface BatchResult {
  batchNumber: number
  scrapedAt: string
  totalCompanies: number
  successfulCompanies: number
  totalJobs: number
  results: CompanyResult[]
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function generateExternalId(job: JobResult): string {
  // Create a unique ID based on job content
  const content = `${job.title}-${job.company}-${job.location}`.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `company-${content.substring(0, 50)}-${Date.now()}`
}

function generateContentHash(job: JobResult): string {
  // Create a hash for duplicate detection
  const content = `${job.title}|${job.company}|${job.location}|${job.sector}`.toLowerCase()
  return Buffer.from(content).toString('base64').substring(0, 32)
}

function cleanJobTitle(title: string): string {
  // Clean up job titles
  return title
    .replace(/\s+/g, ' ')
    .replace(/^(careers?|jobs?|opportunities|positions?)\s*:?\s*/i, '')
    .replace(/\s*-\s*(careers?|jobs?|opportunities|positions?)$/i, '')
    .trim()
    .substring(0, 200) // Limit length
}

function extractProvinceFromLocation(location: string): string {
  const provinces = {
    'alberta': 'AB', 'ab': 'AB',
    'british columbia': 'BC', 'bc': 'BC',
    'manitoba': 'MB', 'mb': 'MB',
    'new brunswick': 'NB', 'nb': 'NB',
    'newfoundland': 'NL', 'nl': 'NL',
    'northwest territories': 'NT', 'nt': 'NT',
    'nova scotia': 'NS', 'ns': 'NS',
    'nunavut': 'NU', 'nu': 'NU',
    'ontario': 'ON', 'on': 'ON',
    'prince edward island': 'PE', 'pe': 'PE', 'pei': 'PE',
    'quebec': 'QC', 'qc': 'QC',
    'saskatchewan': 'SK', 'sk': 'SK',
    'yukon': 'YT', 'yt': 'YT'
  }

  const lowerLocation = location.toLowerCase()
  
  for (const [name, code] of Object.entries(provinces)) {
    if (lowerLocation.includes(name)) {
      return code
    }
  }
  
  return 'Canada' // Default if no province found
}

async function importJobsFromBatch(batchResult: BatchResult): Promise<number> {
  console.log(`📥 Importing jobs from batch ${batchResult.batchNumber}`)
  
  let importedJobs = 0
  const allJobs: JobResult[] = []
  
  // Collect all jobs from successful companies
  for (const companyResult of batchResult.results) {
    if (companyResult.success && companyResult.jobs.length > 0) {
      allJobs.push(...companyResult.jobs)
    }
  }
  
  console.log(`   Found ${allJobs.length} jobs to import`)
  
  if (allJobs.length === 0) {
    return 0
  }
  
  // Process jobs in smaller batches to avoid timeouts
  const batchSize = 10
  const batches = Math.ceil(allJobs.length / batchSize)
  
  for (let i = 0; i < batches; i++) {
    const startIdx = i * batchSize
    const endIdx = Math.min(startIdx + batchSize, allJobs.length)
    const jobBatch = allJobs.slice(startIdx, endIdx)
    
    console.log(`   Processing jobs ${startIdx + 1}-${endIdx} of ${allJobs.length}`)
    
    for (const job of jobBatch) {
      try {
        // Skip jobs with poor titles
        const cleanTitle = cleanJobTitle(job.title)
        if (cleanTitle.length < 3 || 
            cleanTitle.toLowerCase().includes('read more') ||
            cleanTitle.toLowerCase().includes('view all') ||
            cleanTitle.toLowerCase().includes('see all')) {
          continue
        }
        
        // Prepare job data for database
        const jobData = {
          title: cleanTitle,
          company: job.company,
          location: job.location || 'Canada',
          province: extractProvinceFromLocation(job.location || 'Canada'),
          sector: job.sector || 'unknown',
          employment_type: 'Full-time', // Default
          description: `${cleanTitle} position at ${job.company}. Direct from company career portal.`,
          posted_date: new Date().toISOString().split('T')[0], // Today's date
          application_url: job.applicationUrl,
          source_platform: 'company_direct',
          source_url: job.sourceUrl,
          external_id: generateExternalId(job),
          content_hash: generateContentHash(job),
          is_active: true,
          last_seen: new Date().toISOString()
        }
        
        // Check for existing job with same content hash
        const { data: existingJobs, error: checkError } = await supabase
          .from('jobs')
          .select('id, title, company')
          .eq('content_hash', jobData.content_hash)
          .limit(1)
        
        if (checkError) {
          console.error(`   ❌ Error checking for duplicate: ${checkError.message}`)
          continue
        }
        
        if (existingJobs && existingJobs.length > 0) {
          // Update last_seen for existing job
          const { error: updateError } = await supabase
            .from('jobs')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', existingJobs[0].id)
          
          if (updateError) {
            console.error(`   ⚠️  Error updating existing job: ${updateError.message}`)
          } else {
            console.log(`   🔄 Updated existing job: ${existingJobs[0].title}`)
          }
          continue
        }
        
        // Insert new job
        const { error: insertError } = await supabase
          .from('jobs')
          .insert([jobData])
        
        if (insertError) {
          console.error(`   ❌ Error inserting job "${jobData.title}": ${insertError.message}`)
        } else {
          importedJobs++
          console.log(`   ✅ Imported: ${jobData.title} at ${jobData.company}`)
        }
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`   💥 Error processing job: ${error}`)
      }
    }
  }
  
  return importedJobs
}

async function updateScrapingStats(platform: string, stats: {
  jobsFound: number
  jobsProcessed: number
  jobsAdded: number
  executionTime: number
}) {
  try {
    const { error } = await supabase
      .from('scraping_stats')
      .insert([{
        platform: platform,
        jobs_found: stats.jobsFound,
        jobs_processed: stats.jobsProcessed,
        jobs_added: stats.jobsAdded,
        jobs_updated: 0,
        duplicates_found: stats.jobsProcessed - stats.jobsAdded,
        errors: 0,
        execution_time: stats.executionTime
      }])
    
    if (error) {
      console.error(`⚠️  Error updating scraping stats: ${error.message}`)
    } else {
      console.log(`📊 Updated scraping stats for ${platform}`)
    }
  } catch (error) {
    console.error(`💥 Error updating scraping stats: ${error}`)
  }
}

async function main() {
  console.log('💾 Company Jobs Database Import')
  console.log('🎯 Importing all scraped company jobs into Supabase')
  console.log('='.repeat(50))

  // Find all batch result files
  const currentDir = process.cwd()
  const files = fs.readdirSync(currentDir)
  const batchFiles = files.filter(file => file.startsWith('batch-') && file.endsWith('.json'))
  
  console.log(`📂 Found ${batchFiles.length} batch result files`)
  
  if (batchFiles.length === 0) {
    console.log('❌ No batch files found. Run the scraping first.')
    return
  }
  
  let totalJobsImported = 0
  let totalJobsProcessed = 0
  let totalJobsFound = 0
  const startTime = Date.now()
  
  // Process each batch file
  for (const filename of batchFiles.sort()) {
    console.log(`\n📁 Processing ${filename}`)
    
    try {
      const filePath = path.join(currentDir, filename)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const batchResult: BatchResult = JSON.parse(fileContent)
      
      console.log(`   Batch ${batchResult.batchNumber}: ${batchResult.successfulCompanies} companies, ${batchResult.totalJobs} jobs`)
      
      const imported = await importJobsFromBatch(batchResult)
      
      totalJobsImported += imported
      totalJobsProcessed += batchResult.totalJobs
      totalJobsFound += batchResult.totalJobs
      
      console.log(`   ✅ Imported ${imported} jobs from batch ${batchResult.batchNumber}`)
      
    } catch (error) {
      console.error(`   ❌ Error processing ${filename}: ${error}`)
    }
  }
  
  const executionTime = Date.now() - startTime
  
  // Update scraping statistics
  await updateScrapingStats('company_direct', {
    jobsFound: totalJobsFound,
    jobsProcessed: totalJobsProcessed,
    jobsAdded: totalJobsImported,
    executionTime: executionTime
  })
  
  // Final summary
  console.log('\n' + '='.repeat(50))
  console.log('🎉 DATABASE IMPORT COMPLETED!')
  console.log('='.repeat(50))
  
  console.log(`\n📊 IMPORT SUMMARY:`)
  console.log(`   Jobs found in batches: ${totalJobsFound}`)
  console.log(`   Jobs processed: ${totalJobsProcessed}`)
  console.log(`   Jobs imported: ${totalJobsImported}`)
  console.log(`   Duplicates skipped: ${totalJobsProcessed - totalJobsImported}`)
  console.log(`   Success rate: ${((totalJobsImported/totalJobsProcessed)*100).toFixed(1)}%`)
  console.log(`   Execution time: ${(executionTime/1000).toFixed(1)}s`)
  
  if (totalJobsImported > 0) {
    console.log(`\n✅ SUCCESS! Imported ${totalJobsImported} exclusive Canadian resource jobs`)
    console.log(`🎯 These jobs are now live on your job board!`)
    console.log(`🌐 Jobs sourced directly from company career portals`)
    console.log(`📈 This gives you exclusive content not available on other job boards`)
    
    // Test database connection
    console.log(`\n🔍 Testing database access...`)
    const { data: recentJobs, error } = await supabase
      .from('jobs')
      .select('title, company, sector')
      .eq('source_platform', 'company_direct')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error(`❌ Database test failed: ${error.message}`)
    } else if (recentJobs && recentJobs.length > 0) {
      console.log(`✅ Database test successful! Recent jobs:`)
      recentJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} at ${job.company} (${job.sector})`)
      })
    }
    
  } else {
    console.log(`\n⚠️  No jobs were imported. Check the batch files and database connection.`)
  }
  
  console.log(`\n🚀 Your Canadian Resource Job Board is now updated with exclusive company jobs!`)
}

if (require.main === module) {
  main().catch(console.error)
}