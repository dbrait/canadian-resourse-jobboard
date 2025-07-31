import { JobMatcher } from './job-matcher'
import { NotificationService } from './notification-service'
import { supabase } from '@/lib/supabase'
import { NotificationBatch } from '@/types/notifications'

export class NotificationScheduler {
  private jobMatcher: JobMatcher
  private notificationService: NotificationService

  constructor() {
    this.jobMatcher = new JobMatcher()
    this.notificationService = new NotificationService()
  }

  /**
   * Process immediate notifications from the queue
   */
  async processImmediateNotifications(): Promise<void> {
    try {
      console.log('Processing immediate notifications...')
      
      const batches = await this.jobMatcher.processImmediateQueue()
      
      for (const batch of batches) {
        try {
          if (batch.delivery_method === 'email') {
            await this.notificationService.sendEmailNotification(batch)
          } else {
            await this.notificationService.sendSMSNotification(batch)
          }
          
          // Update last notification sent
          await this.jobMatcher.markNotificationSent(batch.subscription_id)
          
          console.log(`Sent immediate notification to subscription ${batch.subscription_id} via ${batch.delivery_method}`)
          
        } catch (error) {
          console.error(`Failed to send immediate notification for subscription ${batch.subscription_id}:`, error)
        }
      }
      
      console.log(`Processed ${batches.length} immediate notification batches`)
      
    } catch (error) {
      console.error('Error processing immediate notifications:', error)
    }
  }

  /**
   * Process daily notifications
   */
  async processDailyNotifications(): Promise<void> {
    try {
      console.log('Processing daily notifications...')
      
      const batches = await this.jobMatcher.generateScheduledBatches('daily')
      
      for (const batch of batches) {
        try {
          if (batch.delivery_method === 'email') {
            await this.notificationService.sendEmailNotification(batch)
          } else {
            await this.notificationService.sendSMSNotification(batch)
          }
          
          // Update last notification sent
          await this.jobMatcher.markNotificationSent(batch.subscription_id)
          
          console.log(`Sent daily notification to subscription ${batch.subscription_id} via ${batch.delivery_method}`)
          
        } catch (error) {
          console.error(`Failed to send daily notification for subscription ${batch.subscription_id}:`, error)
        }
      }
      
      console.log(`Processed ${batches.length} daily notification batches`)
      
    } catch (error) {
      console.error('Error processing daily notifications:', error)
    }
  }

  /**
   * Process weekly notifications
   */
  async processWeeklyNotifications(): Promise<void> {
    try {
      console.log('Processing weekly notifications...')
      
      const batches = await this.jobMatcher.generateScheduledBatches('weekly')
      
      for (const batch of batches) {
        try {
          if (batch.delivery_method === 'email') {
            await this.notificationService.sendEmailNotification(batch)
          } else {
            await this.notificationService.sendSMSNotification(batch)
          }
          
          // Update last notification sent
          await this.jobMatcher.markNotificationSent(batch.subscription_id)
          
          console.log(`Sent weekly notification to subscription ${batch.subscription_id} via ${batch.delivery_method}`)
          
        } catch (error) {
          console.error(`Failed to send weekly notification for subscription ${batch.subscription_id}:`, error)
        }
      }
      
      console.log(`Processed ${batches.length} weekly notification batches`)
      
    } catch (error) {
      console.error('Error processing weekly notifications:', error)
    }
  }

  /**
   * Handle new job notification (called when jobs are scraped)
   */
  async handleNewJob(job: any): Promise<void> {
    try {
      // Queue immediate notifications for this job
      await this.jobMatcher.queueJobNotifications(job)
      
      console.log(`Queued notifications for new job: ${job.title} at ${job.company}`)
      
    } catch (error) {
      console.error('Error handling new job notification:', error)
    }
  }

  /**
   * Update notification analytics
   */
  async updateAnalytics(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Get today's metrics
      const [subscriptionStats, deliveryStats] = await Promise.all([
        this.getSubscriptionStats(),
        this.getDeliveryStats()
      ])
      
      // Update or insert analytics record
      const { error } = await supabase
        .from('subscription_analytics')
        .upsert({
          date: today,
          new_subscriptions: subscriptionStats.new_subscriptions,
          active_subscriptions: subscriptionStats.active_subscriptions,
          unsubscribes: subscriptionStats.unsubscribes,
          emails_sent: deliveryStats.emails_sent,
          emails_delivered: deliveryStats.emails_delivered,
          emails_bounced: deliveryStats.emails_bounced,
          sms_sent: deliveryStats.sms_sent,
          sms_delivered: deliveryStats.sms_delivered,
          sms_failed: deliveryStats.sms_failed,
          notifications_with_jobs: deliveryStats.notifications_with_jobs,
          total_jobs_notified: deliveryStats.total_jobs_notified
        })
      
      if (error) {
        throw new Error(`Failed to update analytics: ${error.message}`)
      }
      
      console.log('Updated notification analytics for', today)
      
    } catch (error) {
      console.error('Error updating analytics:', error)
    }
  }

  /**
   * Cleanup old data (run weekly)
   */
  async cleanup(): Promise<void> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

      // Remove processed queue items older than 1 week
      await supabase
        .from('job_notification_queue')
        .delete()
        .not('processed_at', 'is', null)
        .lt('processed_at', oneWeekAgo.toISOString())

      // Remove delivery records older than 3 months (keep for compliance/debugging)
      await supabase
        .from('notification_deliveries')
        .delete()
        .lt('created_at', threeMonthsAgo.toISOString())

      // Remove unverified subscriptions older than 1 month
      await supabase
        .from('notification_subscriptions')
        .delete()
        .eq('verified', false)
        .lt('created_at', oneMonthAgo.toISOString())

      // Remove inactive subscriptions older than 6 months
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      await supabase
        .from('notification_subscriptions')
        .delete()
        .eq('is_active', false)
        .lt('updated_at', sixMonthsAgo.toISOString())

      console.log('Completed notification system cleanup')
      
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }

  /**
   * Get subscription statistics for analytics
   */
  private async getSubscriptionStats(): Promise<{
    new_subscriptions: number
    active_subscriptions: number
    unsubscribes: number
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const { data: subscriptions, error } = await supabase
      .from('notification_subscriptions')
      .select('created_at, updated_at, is_active')

    if (error) {
      throw new Error(`Failed to fetch subscription stats: ${error.message}`)
    }

    const newSubscriptions = subscriptions.filter(s => 
      new Date(s.created_at) >= today && new Date(s.created_at) < tomorrow
    ).length

    const activeSubscriptions = subscriptions.filter(s => s.is_active).length

    const unsubscribes = subscriptions.filter(s => 
      !s.is_active && 
      new Date(s.updated_at) >= today && 
      new Date(s.updated_at) < tomorrow
    ).length

    return {
      new_subscriptions: newSubscriptions,
      active_subscriptions: activeSubscriptions,
      unsubscribes
    }
  }

  /**
   * Get delivery statistics for analytics
   */
  private async getDeliveryStats(): Promise<{
    emails_sent: number
    emails_delivered: number
    emails_bounced: number
    sms_sent: number
    sms_delivered: number
    sms_failed: number
    notifications_with_jobs: number
    total_jobs_notified: number
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const { data: deliveries, error } = await supabase
      .from('notification_deliveries')
      .select('delivery_method, status, job_ids')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (error) {
      throw new Error(`Failed to fetch delivery stats: ${error.message}`)
    }

    const emailsSent = deliveries.filter(d => d.delivery_method === 'email' && d.status === 'sent').length
    const emailsDelivered = deliveries.filter(d => d.delivery_method === 'email' && d.status === 'delivered').length
    const emailsBounced = deliveries.filter(d => d.delivery_method === 'email' && d.status === 'bounced').length
    
    const smsSent = deliveries.filter(d => d.delivery_method === 'sms' && d.status === 'sent').length
    const smsDelivered = deliveries.filter(d => d.delivery_method === 'sms' && d.status === 'delivered').length
    const smsFailed = deliveries.filter(d => d.delivery_method === 'sms' && d.status === 'failed').length

    const notificationsWithJobs = deliveries.filter(d => d.job_ids && d.job_ids.length > 0).length
    const totalJobsNotified = deliveries.reduce((sum, d) => sum + (d.job_ids?.length || 0), 0)

    return {
      emails_sent: emailsSent,
      emails_delivered: emailsDelivered,
      emails_bounced: emailsBounced,
      sms_sent: smsSent,
      sms_delivered: smsDelivered,
      sms_failed: smsFailed,
      notifications_with_jobs: notificationsWithJobs,
      total_jobs_notified: totalJobsNotified
    }
  }
}

// Export singleton instance
export const notificationScheduler = new NotificationScheduler()