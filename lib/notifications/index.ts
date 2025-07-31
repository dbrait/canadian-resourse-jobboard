// Export all notification system components
export { NotificationService } from './notification-service'
export { JobMatcher } from './job-matcher'
export { NotificationScheduler, notificationScheduler } from './scheduler'

// Re-export types for convenience
export * from '@/types/notifications'

/**
 * Integration helper functions
 */

import { notificationScheduler } from './scheduler'
import { Job } from '@/types/job'

/**
 * Call this function when new jobs are scraped to trigger immediate notifications
 */
export async function handleNewJobScraped(job: Job): Promise<void> {
  await notificationScheduler.handleNewJob(job)
}

/**
 * Utility function to get notification system status
 */
export async function getNotificationSystemStatus(): Promise<{
  immediate_queue_size: number
  active_subscriptions: number
  verified_subscriptions: number
  daily_notifications_sent: number
  weekly_notifications_sent: number
}> {
  const { supabase } = await import('@/lib/supabase')
  
  // Get queue size
  const { count: queueSize } = await supabase
    .from('job_notification_queue')
    .select('*', { count: 'exact' })
    .is('processed_at', null)

  // Get subscription counts
  const { data: subStats } = await supabase
    .from('subscription_summary')
    .select('*')
    .single()

  // Get today's delivery counts
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: deliveries } = await supabase
    .from('notification_deliveries')
    .select('delivery_method, status')
    .gte('created_at', today.toISOString())

  const dailyDeliveries = deliveries?.filter(d => d.status === 'sent') || []
  const weeklyDeliveries = deliveries?.filter(d => d.status === 'sent') || []

  return {
    immediate_queue_size: queueSize || 0,
    active_subscriptions: subStats?.active_subscriptions || 0,
    verified_subscriptions: subStats?.verified_subscriptions || 0,
    daily_notifications_sent: dailyDeliveries.length,
    weekly_notifications_sent: weeklyDeliveries.length
  }
}