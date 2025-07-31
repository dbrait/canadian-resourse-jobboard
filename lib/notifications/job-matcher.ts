import { supabase } from '@/lib/supabase'
import { Job } from '@/types/job'
import { JobMatchResult, NotificationBatch } from '@/types/notifications'

export class JobMatcher {
  
  /**
   * Find all subscriptions that match a given job
   */
  async findMatchingSubscriptions(job: Job): Promise<JobMatchResult> {
    try {
      const { data: subscriptions, error } = await supabase
        .from('notification_subscriptions')
        .select('*')
        .eq('is_active', true)
        .eq('verified', true)

      if (error) {
        throw new Error(`Failed to fetch subscriptions: ${error.message}`)
      }

      const matchedSubscriptions: JobMatchResult['matched_filters'] = []

      for (const subscription of subscriptions) {
        const matchedCriteria = this.checkJobMatch(job, subscription)
        if (matchedCriteria.length > 0) {
          matchedSubscriptions.push({
            subscription_id: subscription.id,
            matched_criteria: matchedCriteria
          })
        }
      }

      return {
        job_id: job.id,
        subscription_ids: matchedSubscriptions.map(m => m.subscription_id),
        matched_filters: matchedSubscriptions
      }
    } catch (error) {
      console.error('Error finding matching subscriptions:', error)
      throw error
    }
  }

  /**
   * Queue job notifications for immediate delivery
   */
  async queueJobNotifications(job: Job): Promise<void> {
    const matchResult = await this.findMatchingSubscriptions(job)
    
    if (matchResult.subscription_ids.length === 0) {
      return
    }

    // Get immediate notification subscriptions
    const { data: immediateSubscriptions, error } = await supabase
      .from('notification_subscriptions')
      .select('id')
      .in('id', matchResult.subscription_ids)
      .eq('frequency', 'immediate')

    if (error) {
      throw new Error(`Failed to fetch immediate subscriptions: ${error.message}`)
    }

    // Queue notifications
    const queueEntries = immediateSubscriptions.map(sub => ({
      job_id: job.id,
      subscription_id: sub.id,
      priority: 1, // Immediate notifications have priority
      scheduled_for: new Date().toISOString()
    }))

    if (queueEntries.length > 0) {
      const { error: queueError } = await supabase
        .from('job_notification_queue')
        .insert(queueEntries)

      if (queueError) {
        console.error('Error queuing job notifications:', queueError)
        throw new Error(`Failed to queue notifications: ${queueError.message}`)
      }
    }
  }

  /**
   * Generate notification batches for daily/weekly subscriptions
   */
  async generateScheduledBatches(frequency: 'daily' | 'weekly'): Promise<NotificationBatch[]> {
    try {
      // Calculate date range based on frequency
      const now = new Date()
      const startDate = new Date()
      
      if (frequency === 'daily') {
        startDate.setDate(now.getDate() - 1)
      } else {
        startDate.setDate(now.getDate() - 7)
      }

      // Get subscriptions for this frequency
      const { data: subscriptions, error: subError } = await supabase
        .from('notification_subscriptions')
        .select('*')
        .eq('frequency', frequency)
        .eq('is_active', true)
        .eq('verified', true)
        .or(`last_notification_sent.is.null,last_notification_sent.lt.${startDate.toISOString()}`)

      if (subError) {
        throw new Error(`Failed to fetch ${frequency} subscriptions: ${subError.message}`)
      }

      const batches: NotificationBatch[] = []

      for (const subscription of subscriptions) {
        // Get jobs that match this subscription's criteria
        const matchingJobs = await this.getMatchingJobsForSubscription(
          subscription,
          startDate,
          now
        )

        if (matchingJobs.length > 0) {
          // Determine delivery methods
          const methods: ('email' | 'sms')[] = []
          if (subscription.subscription_type === 'email' || subscription.subscription_type === 'both') {
            methods.push('email')
          }
          if (subscription.subscription_type === 'sms' || subscription.subscription_type === 'both') {
            methods.push('sms')
          }

          // Create batch for each delivery method
          for (const method of methods) {
            batches.push({
              id: `${subscription.id}_${method}_${frequency}_${Date.now()}`,
              subscription_id: subscription.id,
              jobs: matchingJobs,
              created_at: now.toISOString(),
              delivery_method: method,
              template_type: frequency
            })
          }
        }
      }

      return batches
    } catch (error) {
      console.error(`Error generating ${frequency} batches:`, error)
      throw error
    }
  }

  /**
   * Process immediate notification queue
   */
  async processImmediateQueue(): Promise<NotificationBatch[]> {
    try {
      // Get pending immediate notifications
      const { data: queueItems, error: queueError } = await supabase
        .from('job_notification_queue')
        .select(`
          id,
          job_id,
          subscription_id,
          scheduled_for,
          jobs:job_id(
            id, title, company, location, province, sector, 
            employment_type, salary_range, posted_date, application_url
          ),
          notification_subscriptions:subscription_id(
            id, subscription_type, email, phone
          )
        `)
        .is('processed_at', null)
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('scheduled_for', { ascending: true })
        .limit(100)

      if (queueError) {
        throw new Error(`Failed to fetch queue items: ${queueError.message}`)
      }

      // Group by subscription and delivery method
      const batches: NotificationBatch[] = []
      const subscriptionGroups = new Map<string, {
        subscription_id: number
        delivery_method: 'email' | 'sms'
        jobs: any[]
        queue_ids: number[]
      }>()

      for (const item of queueItems) {
        const subscription = (item as any).notification_subscriptions
        const job = (item as any).jobs

        if (!subscription || !job) continue

        // Determine delivery methods
        const methods: ('email' | 'sms')[] = []
        if (subscription.subscription_type === 'email' || subscription.subscription_type === 'both') {
          methods.push('email')
        }
        if (subscription.subscription_type === 'sms' || subscription.subscription_type === 'both') {
          methods.push('sms')
        }

        for (const method of methods) {
          const key = `${subscription.id}_${method}`
          if (!subscriptionGroups.has(key)) {
            subscriptionGroups.set(key, {
              subscription_id: subscription.id,
              delivery_method: method,
              jobs: [],
              queue_ids: []
            })
          }
          
          const group = subscriptionGroups.get(key)!
          group.jobs.push(job)
          group.queue_ids.push(item.id)
        }
      }

      // Create batches
      for (const group of subscriptionGroups.values()) {
        batches.push({
          id: `${group.subscription_id}_${group.delivery_method}_immediate_${Date.now()}`,
          subscription_id: group.subscription_id,
          jobs: group.jobs,
          created_at: new Date().toISOString(),
          delivery_method: group.delivery_method,
          template_type: 'immediate'
        })

        // Mark queue items as processed
        await supabase
          .from('job_notification_queue')
          .update({ processed_at: new Date().toISOString() })
          .in('id', group.queue_ids)
      }

      return batches
    } catch (error) {
      console.error('Error processing immediate queue:', error)
      throw error
    }
  }

  /**
   * Check if a job matches a subscription's criteria
   */
  private checkJobMatch(job: Job, subscription: any): string[] {
    const matchedCriteria: string[] = []

    // Region filter
    if (subscription.regions && subscription.regions.length > 0) {
      if (subscription.regions.includes(job.province)) {
        matchedCriteria.push('region')
      } else {
        return [] // Must match region if specified
      }
    }

    // Sector filter
    if (subscription.sectors && subscription.sectors.length > 0) {
      if (subscription.sectors.includes(job.sector)) {
        matchedCriteria.push('sector')
      } else {
        return [] // Must match sector if specified
      }
    }

    // Company filter
    if (subscription.companies && subscription.companies.length > 0) {
      if (subscription.companies.some((company: string) => 
        job.company.toLowerCase().includes(company.toLowerCase())
      )) {
        matchedCriteria.push('company')
      } else {
        return [] // Must match company if specified
      }
    }

    // Employment type filter
    if (subscription.employment_types && subscription.employment_types.length > 0) {
      if (subscription.employment_types.includes(job.employment_type)) {
        matchedCriteria.push('employment_type')
      } else {
        return [] // Must match employment type if specified
      }
    }

    // Keyword filter
    if (subscription.keywords && subscription.keywords.length > 0) {
      const jobText = `${job.title} ${(job as any).description || ''}`.toLowerCase()
      const matchedKeywords = subscription.keywords.filter((keyword: string) =>
        jobText.includes(keyword.toLowerCase())
      )
      
      if (matchedKeywords.length > 0) {
        matchedCriteria.push('keywords')
      } else {
        return [] // Must match at least one keyword if specified
      }
    }

    // Salary filter
    if (subscription.salary_min && job.salary_range) {
      const salaryMatch = this.extractMinSalary(job.salary_range)
      if (salaryMatch && salaryMatch >= subscription.salary_min) {
        matchedCriteria.push('salary')
      } else {
        return [] // Must meet minimum salary if specified
      }
    }

    return matchedCriteria
  }

  /**
   * Get jobs matching a subscription's criteria within a date range
   */
  private async getMatchingJobsForSubscription(
    subscription: any,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    let query = supabase
      .from('jobs')
      .select('id, title, company, location, province, sector, employment_type, salary_range, posted_date, application_url')
      .eq('is_active', true)
      .gte('posted_date', startDate.toISOString())
      .lte('posted_date', endDate.toISOString())

    // Apply filters
    if (subscription.regions && subscription.regions.length > 0) {
      query = query.in('province', subscription.regions)
    }

    if (subscription.sectors && subscription.sectors.length > 0) {
      query = query.in('sector', subscription.sectors)
    }

    if (subscription.employment_types && subscription.employment_types.length > 0) {
      query = query.in('employment_type', subscription.employment_types)
    }

    const { data: jobs, error } = await query

    if (error) {
      throw new Error(`Failed to fetch matching jobs: ${error.message}`)
    }

    // Apply additional filters that can't be done in SQL
    return jobs.filter(job => {
      // Company filter
      if (subscription.companies && subscription.companies.length > 0) {
        const companyMatch = subscription.companies.some((company: string) =>
          job.company.toLowerCase().includes(company.toLowerCase())
        )
        if (!companyMatch) return false
      }

      // Keywords filter
      if (subscription.keywords && subscription.keywords.length > 0) {
        const jobText = `${job.title} ${(job as any).description || ''}`.toLowerCase()
        const keywordMatch = subscription.keywords.some((keyword: string) =>
          jobText.includes(keyword.toLowerCase())
        )
        if (!keywordMatch) return false
      }

      // Salary filter
      if (subscription.salary_min && job.salary_range) {
        const minSalary = this.extractMinSalary(job.salary_range)
        if (!minSalary || minSalary < subscription.salary_min) return false
      }

      return true
    })
  }

  /**
   * Extract minimum salary from salary range string
   */
  private extractMinSalary(salaryRange: string): number | null {
    const match = salaryRange.match(/\$?([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''))
    }
    return null
  }

  /**
   * Update last notification sent timestamp
   */
  async markNotificationSent(subscriptionId: number): Promise<void> {
    await supabase
      .from('notification_subscriptions')
      .update({ last_notification_sent: new Date().toISOString() })
      .eq('id', subscriptionId)
  }
}