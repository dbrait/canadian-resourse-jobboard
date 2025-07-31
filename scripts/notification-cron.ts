#!/usr/bin/env tsx

/**
 * Notification system cron job runner
 * 
 * This script handles scheduled notification processing.
 * Run different functions based on the schedule:
 * 
 * Every 5 minutes: immediate notifications
 * Daily at 8 AM: daily notifications  
 * Weekly on Monday at 8 AM: weekly notifications
 * Daily at 2 AM: analytics update
 * Weekly on Sunday at 3 AM: cleanup
 * 
 * Usage:
 * npm run notifications:immediate  # Process immediate queue
 * npm run notifications:daily      # Send daily digests
 * npm run notifications:weekly     # Send weekly digests
 * npm run notifications:analytics  # Update analytics
 * npm run notifications:cleanup    # Cleanup old data
 */

import { notificationScheduler } from '../lib/notifications/scheduler'

const command = process.argv[2]

async function main() {
  console.log(`Starting notification job: ${command}`)
  
  try {
    switch (command) {
      case 'immediate':
        await notificationScheduler.processImmediateNotifications()
        break
        
      case 'daily':
        await notificationScheduler.processDailyNotifications()
        break
        
      case 'weekly':
        await notificationScheduler.processWeeklyNotifications()
        break
        
      case 'analytics':
        await notificationScheduler.updateAnalytics()
        break
        
      case 'cleanup':
        await notificationScheduler.cleanup()
        break
        
      default:
        console.error('Invalid command. Use: immediate, daily, weekly, analytics, or cleanup')
        process.exit(1)
    }
    
    console.log(`Completed notification job: ${command}`)
    
  } catch (error) {
    console.error(`Error in notification job ${command}:`, error)
    process.exit(1)
  }
}

main()