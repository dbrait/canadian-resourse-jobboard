import * as cron from 'node-cron'
import { ScraperManager } from './scraper-manager'
import { IndeedScraper } from './scrapers/indeed-scraper'
import { JobBankScraper } from './scrapers/jobbank-scraper'
import { DatabaseManager } from './database-manager'
import { ScrapingOptions } from '../../types/scraping'

export interface ScheduleConfig {
  enabled: boolean
  cronExpression: string
  platforms: string[]
  options?: ScrapingOptions
}

export class ScrapingScheduler {
  private scraperManager: ScraperManager
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map()
  private isRunning = false

  constructor() {
    this.scraperManager = new ScraperManager()
    this.initializeScrapers()
  }

  private initializeScrapers() {
    // Register job board scrapers
    this.scraperManager.registerScraper('indeed', new IndeedScraper(this.scraperManager))
    this.scraperManager.registerScraper('jobbank', new JobBankScraper(this.scraperManager))
    
    // Register company-specific scrapers
    const { SuncorScraper } = require('./scrapers/suncor-scraper')
    const { CNRailScraper } = require('./scrapers/cn-rail-scraper')
    const { CamecoScraper } = require('./scrapers/cameco-scraper')
    const { CNRLScraper } = require('./scrapers/cnrl-scraper')
    
    this.scraperManager.registerScraper('suncor', new SuncorScraper(this.scraperManager))
    this.scraperManager.registerScraper('cn_rail', new CNRailScraper(this.scraperManager))
    this.scraperManager.registerScraper('cameco', new CamecoScraper(this.scraperManager))
    this.scraperManager.registerScraper('cnrl', new CNRLScraper(this.scraperManager))
  }

  // Start the scheduler with predefined schedules
  start() {
    console.log('Starting job scraping scheduler...')

    // Schedule 1: Daily comprehensive scraping (3 AM)
    this.scheduleTask('daily-comprehensive', {
      enabled: true,
      cronExpression: '0 3 * * *', // 3 AM daily
      platforms: ['indeed', 'jobbank'],
      options: {
        maxPages: 5,
        dateRange: 'week',
        sectors: ['mining', 'oil_gas', 'forestry', 'renewable', 'utilities']
      }
    })

    // Schedule 2: Frequent updates for new jobs (every 4 hours during business hours)
    this.scheduleTask('frequent-updates', {
      enabled: true,
      cronExpression: '0 8,12,16,20 * * *', // 8 AM, 12 PM, 4 PM, 8 PM
      platforms: ['indeed', 'jobbank'],
      options: {
        maxPages: 2,
        dateRange: 'today',
        sectors: ['mining', 'oil_gas']
      }
    })

    // Schedule 3: Company-specific scraping (twice daily)
    this.scheduleTask('company-scraping', {
      enabled: true,
      cronExpression: '0 6,18 * * *', // 6 AM and 6 PM daily
      platforms: ['suncor', 'cn_rail', 'cameco', 'cnrl'],
      options: {
        maxPages: 3,
        dateRange: 'week'
      }
    })

    // Schedule 4: Weekly maintenance (Sunday 2 AM)
    this.scheduleTask('weekly-maintenance', {
      enabled: true,
      cronExpression: '0 2 * * 0', // 2 AM on Sundays
      platforms: [],
      options: {}
    })

    console.log(`Scheduler started with ${this.scheduledTasks.size} scheduled tasks`)
  }

  // Stop all scheduled tasks
  stop() {
    console.log('Stopping job scraping scheduler...')
    
    for (const [name, task] of this.scheduledTasks) {
      task.stop()
      console.log(`Stopped scheduled task: ${name}`)
    }
    
    this.scheduledTasks.clear()
    console.log('Scheduler stopped')
  }

  // Schedule a specific task
  scheduleTask(name: string, config: ScheduleConfig) {
    if (!config.enabled) {
      console.log(`Task ${name} is disabled, skipping`)
      return
    }

    // Validate cron expression
    if (!cron.validate(config.cronExpression)) {
      console.error(`Invalid cron expression for task ${name}: ${config.cronExpression}`)
      return
    }

    // Stop existing task with same name
    if (this.scheduledTasks.has(name)) {
      this.scheduledTasks.get(name)?.stop()
    }

    // Create and start new task
    const task = cron.schedule(config.cronExpression, async () => {
      await this.executeScheduledTask(name, config)
    }, {
      timezone: "America/Toronto" // Canadian timezone
    })

    this.scheduledTasks.set(name, task)
    console.log(`Scheduled task "${name}" with cron: ${config.cronExpression}`)
  }

  // Execute a scheduled scraping task
  private async executeScheduledTask(taskName: string, config: ScheduleConfig) {
    if (this.isRunning) {
      console.log(`Skipping task ${taskName} - another scraping task is already running`)
      return
    }

    this.isRunning = true
    const startTime = Date.now()

    try {
      console.log(`Executing scheduled task: ${taskName}`)

      if (taskName === 'weekly-maintenance') {
        await this.performMaintenanceTasks()
      } else {
        await this.performScrapingTask(taskName, config)
      }

      const duration = Date.now() - startTime
      console.log(`Task ${taskName} completed in ${duration}ms`)

    } catch (error) {
      console.error(`Error executing task ${taskName}:`, error)
    } finally {
      this.isRunning = false
    }
  }

  private async performScrapingTask(taskName: string, config: ScheduleConfig) {
    const results: Record<string, any> = {}
    const platformStats: Record<string, any> = {}

    for (const platform of config.platforms) {
      try {
        console.log(`Starting scraping for ${platform}...`)
        const startTime = Date.now()

        // Perform the scraping
        const scrapingResult = await this.scraperManager.scrapePlatform(platform, config.options)
        
        // Process and save the jobs
        if (scrapingResult.success && scrapingResult.jobs.length > 0) {
          const dbResult = await DatabaseManager.saveScrapedJobs(scrapingResult.jobs, platform)
          
          results[platform] = {
            scraping: scrapingResult,
            database: dbResult
          }

          // Update platform statistics
          const executionTime = Date.now() - startTime
          await DatabaseManager.updateScrapingStats(platform, {
            jobs_found: scrapingResult.total_found,
            jobs_processed: scrapingResult.jobs.length,
            jobs_added: dbResult.newJobs,
            jobs_updated: dbResult.updatedJobs,
            duplicates_found: dbResult.duplicatesSkipped,
            errors: dbResult.errors,
            execution_time: executionTime
          })

          platformStats[platform] = {
            jobsFound: scrapingResult.total_found,
            jobsProcessed: scrapingResult.jobs.length,
            newJobs: dbResult.newJobs,
            updatedJobs: dbResult.updatedJobs,
            duplicatesSkipped: dbResult.duplicatesSkipped,
            errors: dbResult.errors,
            executionTime
          }

        } else {
          console.log(`No jobs found for ${platform}`)
          results[platform] = { scraping: scrapingResult, database: null }
        }

      } catch (error) {
        console.error(`Error scraping ${platform}:`, error)
        results[platform] = { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Log summary
    this.logTaskSummary(taskName, platformStats)
  }

  private async performMaintenanceTasks() {
    console.log('Performing weekly maintenance tasks...')

    try {
      // Run database maintenance
      await DatabaseManager.performMaintenanceTasks()

      // Clean up old scraping logs
      await this.cleanupOldLogs()

      console.log('Weekly maintenance completed successfully')

    } catch (error) {
      console.error('Error during maintenance tasks:', error)
    }
  }

  private async cleanupOldLogs() {
    // This would clean up old log files, clear caches, etc.
    console.log('Cleaning up old logs and caches...')
    // Implementation would depend on logging setup
  }

  private logTaskSummary(taskName: string, stats: Record<string, any>) {
    console.log(`\n--- Task Summary: ${taskName} ---`)
    
    for (const [platform, platformStats] of Object.entries(stats)) {
      console.log(`${platform.toUpperCase()}:`)
      console.log(`  Jobs Found: ${platformStats.jobsFound}`)
      console.log(`  Jobs Processed: ${platformStats.jobsProcessed}`)
      console.log(`  New Jobs: ${platformStats.newJobs}`)
      console.log(`  Updated Jobs: ${platformStats.updatedJobs}`)
      console.log(`  Duplicates Skipped: ${platformStats.duplicatesSkipped}`)
      console.log(`  Errors: ${platformStats.errors}`)
      console.log(`  Execution Time: ${(platformStats.executionTime / 1000).toFixed(2)}s`)
    }
    
    console.log('--- End Summary ---\n')
  }

  // Manual trigger for testing
  async runTaskNow(taskName: string) {
    if (this.isRunning) {
      throw new Error('Another scraping task is already running')
    }

    const task = this.scheduledTasks.get(taskName)
    if (!task) {
      throw new Error(`Task "${taskName}" not found`)
    }

    // Get the task configuration
    const config = this.getTaskConfig(taskName)
    if (config) {
      await this.executeScheduledTask(taskName, config)
    }
  }

  private getTaskConfig(taskName: string): ScheduleConfig | null {
    // Return the configuration for the specified task
    const configs: Record<string, ScheduleConfig> = {
      'daily-comprehensive': {
        enabled: true,
        cronExpression: '0 3 * * *',
        platforms: ['indeed', 'jobbank'],
        options: {
          maxPages: 5,
          dateRange: 'week',
          sectors: ['mining', 'oil_gas', 'forestry', 'renewable', 'utilities']
        }
      },
      'frequent-updates': {
        enabled: true,
        cronExpression: '0 8,12,16,20 * * *',
        platforms: ['indeed', 'jobbank'],
        options: {
          maxPages: 2,
          dateRange: 'today',
          sectors: ['mining', 'oil_gas']
        }
      },
      'company-scraping': {
        enabled: true,
        cronExpression: '0 6,18 * * *',
        platforms: ['suncor', 'cn_rail', 'cameco', 'cnrl'],
        options: {
          maxPages: 3,
          dateRange: 'week'
        }
      },
      'weekly-maintenance': {
        enabled: true,
        cronExpression: '0 2 * * 0',
        platforms: [],
        options: {}
      }
    }

    return configs[taskName] || null
  }

  // Get scheduler status
  getStatus() {
    const tasks = Array.from(this.scheduledTasks.entries()).map(([name, task]) => ({
      name,
      running: (task as any).running || false,
      nextExecution: (task as any).nextDate?.()?.toISOString()
    }))

    return {
      isRunning: this.isRunning,
      totalTasks: this.scheduledTasks.size,
      tasks
    }
  }
}