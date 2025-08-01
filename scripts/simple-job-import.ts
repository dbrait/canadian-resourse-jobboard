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
  batchNumber?: number
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

function cleanJobTitle(title: string): string {
  return title
    .replace(/\s+/g, ' ')
    .replace(/^(careers?|jobs?|opportunities|positions?)\s*:?\s*/i, '')
    .replace(/\s*-\s*(careers?|jobs?|opportunities|positions?)$/i, '')
    .trim()
    .substring(0, 200)
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
  
  return 'Canada'
}

async function importJobsSimple(allJobs: JobResult[]): Promise<number> {
  console.log(`📥 Importing ${allJobs.length} jobs to database`)
  
  let importedJobs = 0
  
  // Process jobs one by one
  for (let i = 0; i < allJobs.length; i++) {
    const job = allJobs[i]
    
    try {
      // Clean and validate job title
      const cleanTitle = cleanJobTitle(job.title)
      if (cleanTitle.length < 3 || 
          cleanTitle.toLowerCase().includes('read more') ||
          cleanTitle.toLowerCase().includes('view all') ||
          cleanTitle.toLowerCase().includes('see all') ||
          cleanTitle.toLowerCase().includes('board of directors') ||
          cleanTitle.toLowerCase().includes('analyst coverage')) {
        console.log(`   ⏭️  Skipping: "${cleanTitle}" (not a real job)`)
        continue
      }
      
      // Prepare job data for database (using existing schema)
      const jobData = {
        title: cleanTitle,
        company: job.company,
        location: job.location || 'Canada',
        province: extractProvinceFromLocation(job.location || 'Canada'),
        sector: job.sector || 'unknown',
        employment_type: 'Full-time',
        description: `${cleanTitle} position at ${job.company}. Sourced directly from company career portal.`,
        posted_date: new Date().toISOString().split('T')[0],
        application_url: job.applicationUrl,
        is_active: true
      }
      
      // Check for similar existing job (simple check by title and company)
      const { data: existingJobs, error: checkError } = await supabase
        .from('jobs')
        .select('id, title, company')
        .eq('title', jobData.title)
        .eq('company', jobData.company)
        .limit(1)
      
      if (checkError) {
        console.error(`   ❌ Error checking for duplicate: ${checkError.message}`)
        continue
      }
      
      if (existingJobs && existingJobs.length > 0) {
        console.log(`   🔄 Job already exists: ${jobData.title} at ${jobData.company}`)
        continue
      }
      
      // Insert new job
      const { error: insertError } = await supabase
        .from('jobs')
        .insert([jobData])
      
      if (insertError) {
        console.error(`   ❌ Error inserting "${jobData.title}": ${insertError.message}`)
      } else {
        importedJobs++
        console.log(`   ✅ [${i+1}/${allJobs.length}] Imported: ${jobData.title} at ${jobData.company}`)
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200))
      
    } catch (error) {
      console.error(`   💥 Error processing job "${job.title}": ${error}`)
    }
  }
  
  return importedJobs
}

async function main() {
  console.log('💾 Simple Company Jobs Import')
  console.log('🎯 Importing scraped jobs using existing database schema')
  console.log('='.repeat(50))

  // Find all batch result files
  const currentDir = process.cwd()
  const files = fs.readdirSync(currentDir)
  const batchFiles = files.filter(file => 
    (file.startsWith('batch-') || file.startsWith('batch-test-')) && 
    file.endsWith('.json')
  )
  
  console.log(`📂 Found ${batchFiles.length} batch result files`)
  
  if (batchFiles.length === 0) {
    console.log('❌ No batch files found.')
    return
  }
  
  // Collect all jobs from all batches
  const allJobs: JobResult[] = []
  let totalBatches = 0
  
  for (const filename of batchFiles.sort()) {
    try {
      const filePath = path.join(currentDir, filename)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const batchResult: BatchResult = JSON.parse(fileContent)
      
      console.log(`📁 ${filename}: ${batchResult.successfulCompanies || 0} companies, ${batchResult.totalJobs || 0} jobs`)
      
      // Extract jobs from successful companies
      if (batchResult.results) {
        for (const companyResult of batchResult.results) {
          if (companyResult.success && companyResult.jobs && companyResult.jobs.length > 0) {
            allJobs.push(...companyResult.jobs)
          }
        }
      }
      
      totalBatches++
      
    } catch (error) {
      console.error(`   ❌ Error reading ${filename}: ${error}`)
    }
  }
  
  console.log(`\n📊 COLLECTION SUMMARY:`)
  console.log(`   Batch files processed: ${totalBatches}`)
  console.log(`   Total jobs collected: ${allJobs.length}`)
  
  if (allJobs.length === 0) {
    console.log('❌ No jobs found in batch files.')
    return
  }
  
  // Import all jobs
  const startTime = Date.now()
  const importedCount = await importJobsSimple(allJobs)
  const executionTime = Date.now() - startTime
  
  // Final summary
  console.log('\n' + '='.repeat(50))
  console.log('🎉 IMPORT COMPLETED!')
  console.log('='.repeat(50))
  
  console.log(`\n📊 FINAL RESULTS:`)
  console.log(`   Jobs processed: ${allJobs.length}`)
  console.log(`   Jobs imported: ${importedCount}`)
  console.log(`   Duplicates/skipped: ${allJobs.length - importedCount}`)
  console.log(`   Success rate: ${((importedCount/allJobs.length)*100).toFixed(1)}%`)
  console.log(`   Execution time: ${(executionTime/1000).toFixed(1)}s`)
  
  if (importedCount > 0) {
    console.log(`\n✅ SUCCESS! Imported ${importedCount} exclusive Canadian resource jobs`)
    console.log(`🎯 These jobs are now live on your job board!`)
    console.log(`🌐 Sourced directly from company career portals`)
    
    // Test database connection
    console.log(`\n🔍 Verifying imported jobs...`)
    const { data: recentJobs, error } = await supabase
      .from('jobs')
      .select('title, company, sector, posted_date')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error(`❌ Database verification failed: ${error.message}`)
    } else if (recentJobs && recentJobs.length > 0) {
      console.log(`✅ Database verification successful! Recent jobs:`)
      recentJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} at ${job.company} (${job.sector})`)
      })
    }
    
  } else {
    console.log(`\n⚠️  No jobs were imported.`)
  }
  
  console.log(`\n🚀 Your Canadian Resource Job Board is updated with exclusive company jobs!`)
  console.log(`🌐 Visit your site to see the new jobs live!`)
}

if (require.main === module) {
  main().catch(console.error)
}