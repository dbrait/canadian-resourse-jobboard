import { ScrapedJob, ScrapingStats } from '../../types/scraping'
import { DuplicateDetector, DeduplicationResult } from './duplicate-detector'
import { supabase } from '../supabase'

export interface DatabaseUpdateResult {
  totalProcessed: number
  newJobs: number
  updatedJobs: number
  duplicatesSkipped: number
  errors: number
  errorDetails: string[]
}

export class DatabaseManager {
  // Process and save scraped jobs with duplicate detection
  static async saveScrapedJobs(jobs: ScrapedJob[], platform: string): Promise<DatabaseUpdateResult> {
    const result: DatabaseUpdateResult = {
      totalProcessed: 0,
      newJobs: 0,
      updatedJobs: 0,
      duplicatesSkipped: 0,
      errors: 0,
      errorDetails: []
    }

    console.log(`Processing ${jobs.length} jobs from ${platform}...`)

    for (const job of jobs) {
      result.totalProcessed++
      
      try {
        // Check for duplicates
        const duplicateResult = await DuplicateDetector.checkForDuplicates(job)
        
        if (duplicateResult.isLikeDuplicate && duplicateResult.duplicateMatch) {
          // Handle duplicate job
          const handled = await this.handleDuplicateJob(job, duplicateResult, platform)
          if (handled.updated) {
            result.updatedJobs++
          } else {
            result.duplicatesSkipped++
          }
        } else {
          // Insert new job
          const inserted = await this.insertNewJob(job, platform)
          if (inserted) {
            result.newJobs++
          } else {
            result.errors++
            result.errorDetails.push(`Failed to insert job: ${job.title} at ${job.company}`)
          }
        }

        // Log potential duplicates for manual review
        if (duplicateResult.duplicateMatch?.matchType === 'potential') {
          await this.logPotentialDuplicate(job, duplicateResult, platform)
        }

      } catch (error) {
        result.errors++
        const errorMsg = `Error processing job "${job.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
        result.errorDetails.push(errorMsg)
        console.error(errorMsg)
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    console.log(`Database update completed for ${platform}:`, result)
    return result
  }

  private static async handleDuplicateJob(
    job: ScrapedJob, 
    duplicateResult: DeduplicationResult, 
    platform: string
  ): Promise<{ updated: boolean }> {
    
    if (!duplicateResult.duplicateMatch) {
      return { updated: false }
    }

    const existingJobId = duplicateResult.duplicateMatch.existingJobId

    try {
      // Get the existing job to compare
      const { data: existingJob, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', existingJobId)
        .single()

      if (fetchError || !existingJob) {
        console.error('Failed to fetch existing job for update:', fetchError)
        return { updated: false }
      }

      // Determine what to update
      const updates: any = {}
      let shouldUpdate = false

      // Update if the scraped job has more recent posting date
      const scrapedDate = new Date(job.posted_date)
      const existingDate = new Date(existingJob.posted_date)
      
      if (scrapedDate > existingDate) {
        updates.posted_date = job.posted_date
        shouldUpdate = true
      }

      // Update description if the new one is longer/more detailed
      if (job.description && job.description.length > (existingJob.description?.length || 0)) {
        updates.description = job.description
        shouldUpdate = true
      }

      // Update salary if missing in existing job
      if (job.salary_range && !existingJob.salary_range) {
        updates.salary_range = job.salary_range
        shouldUpdate = true
      }

      // Update application URL if missing in existing job
      if (job.application_url && !existingJob.application_url) {
        updates.application_url = job.application_url
        shouldUpdate = true
      }

      // Add source platform tracking
      const existingSources = existingJob.source_platforms || []
      if (!existingSources.includes(platform)) {
        updates.source_platforms = [...existingSources, platform]
        shouldUpdate = true
      }

      // Update last seen timestamp
      updates.last_seen = new Date().toISOString()
      shouldUpdate = true

      if (shouldUpdate) {
        const { error: updateError } = await supabase
          .from('jobs')
          .update(updates)
          .eq('id', existingJobId)

        if (updateError) {
          console.error('Failed to update existing job:', updateError)
          return { updated: false }
        }

        console.log(`Updated existing job ${existingJobId} with new data from ${platform}`)
        return { updated: true }
      }

      return { updated: false }

    } catch (error) {
      console.error('Error handling duplicate job:', error)
      return { updated: false }
    }
  }

  private static async insertNewJob(job: ScrapedJob, platform: string): Promise<boolean> {
    try {
      // Prepare job data for database insertion
      const dbJob = {
        title: job.title,
        company: job.company,
        location: job.location,
        province: job.province,
        sector: job.sector,
        employment_type: job.employment_type,
        salary_range: job.salary_range,
        description: job.description,
        requirements: job.requirements,
        posted_date: job.posted_date,
        application_url: job.application_url,
        contact_email: job.contact_email,
        is_active: true,
        created_at: new Date().toISOString(),
        source_platform: platform,
        source_url: job.source_url,
        source_platforms: [platform], // Track multiple platforms
        external_id: job.external_id,
        content_hash: DuplicateDetector.generateContentHash(job),
        last_seen: new Date().toISOString()
      }

      const { error } = await supabase
        .from('jobs')
        .insert([dbJob])

      if (error) {
        console.error('Database insertion error:', error)
        return false
      }

      return true

    } catch (error) {
      console.error('Error inserting new job:', error)
      return false
    }
  }

  private static async logPotentialDuplicate(
    job: ScrapedJob, 
    duplicateResult: DeduplicationResult, 
    platform: string
  ): Promise<void> {
    try {
      const logEntry = {
        platform,
        scraped_job_data: job,
        potential_duplicate_id: duplicateResult.duplicateMatch?.existingJobId,
        similarity_score: duplicateResult.confidence,
        match_fields: duplicateResult.duplicateMatch?.matchFields || [],
        reasons: duplicateResult.reasons,
        logged_at: new Date().toISOString(),
        reviewed: false
      }

      const { error } = await supabase
        .from('duplicate_review_log')
        .insert([logEntry])

      if (error) {
        console.error('Error logging potential duplicate:', error)
      }

    } catch (error) {
      console.error('Error in duplicate logging:', error)
    }
  }

  // Update scraping statistics
  static async updateScrapingStats(platform: string, stats: Partial<ScrapingStats>): Promise<void> {
    try {
      const statsRecord = {
        platform,
        jobs_found: stats.jobs_found || 0,
        jobs_processed: stats.jobs_processed || 0,
        jobs_added: stats.jobs_added || 0,
        jobs_updated: stats.jobs_updated || 0,
        duplicates_found: stats.duplicates_found || 0,
        errors: stats.errors || 0,
        execution_time: stats.execution_time || 0,
        last_run: new Date().toISOString()
      }

      const { error } = await supabase
        .from('scraping_stats')
        .upsert([statsRecord], { onConflict: 'platform' })

      if (error) {
        console.error('Error updating scraping stats:', error)
      }

    } catch (error) {
      console.error('Error in stats update:', error)
    }
  }

  // Get jobs that haven't been seen recently (potential inactive jobs)
  static async findStaleJobs(daysStale: number = 30): Promise<any[]> {
    const cutoffDate = new Date(Date.now() - daysStale * 24 * 60 * 60 * 1000).toISOString()

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .lt('last_seen', cutoffDate)
        .eq('is_active', true)

      if (error) throw error
      
      return data || []

    } catch (error) {
      console.error('Error finding stale jobs:', error)
      return []
    }
  }

  // Mark jobs as inactive
  static async markJobsInactive(jobIds: number[]): Promise<void> {
    if (jobIds.length === 0) return

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .in('id', jobIds)

      if (error) {
        console.error('Error marking jobs inactive:', error)
      } else {
        console.log(`Marked ${jobIds.length} jobs as inactive`)
      }

    } catch (error) {
      console.error('Error in job deactivation:', error)
    }
  }

  // Clean up old job data and optimize database
  static async performMaintenanceTasks(): Promise<void> {
    try {
      // Mark very old jobs as inactive
      await DuplicateDetector.cleanupOldJobs(90)

      // Find and mark stale jobs
      const staleJobs = await this.findStaleJobs(30)
      if (staleJobs.length > 0) {
        await this.markJobsInactive(staleJobs.map(job => job.id))
      }

      // Clean up old duplicate review logs (older than 6 months)
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const { error } = await supabase
        .from('duplicate_review_log')
        .delete()
        .lt('logged_at', sixMonthsAgo)
        .eq('reviewed', true)

      if (error) {
        console.error('Error cleaning duplicate logs:', error)
      }

      console.log('Database maintenance tasks completed')

    } catch (error) {
      console.error('Error performing maintenance tasks:', error)
    }
  }

  // Get scraping dashboard data
  static async getScrapingDashboard(): Promise<any> {
    try {
      const [statsResult, jobsResult, duplicatesResult] = await Promise.all([
        supabase.from('scraping_stats').select('*').order('last_run', { ascending: false }).limit(10),
        supabase.from('jobs').select('count', { count: 'exact' }).eq('is_active', true),
        supabase.from('duplicate_review_log').select('count', { count: 'exact' }).eq('reviewed', false)
      ])

      return {
        recentStats: statsResult.data || [],
        totalActiveJobs: jobsResult.count || 0,
        pendingDuplicateReviews: duplicatesResult.count || 0,
        generatedAt: new Date().toISOString()
      }

    } catch (error) {
      console.error('Error generating dashboard data:', error)
      return null
    }
  }
}