import { NextRequest, NextResponse } from 'next/server'
import { createScrapingSystem } from '../../../lib/scraping'

// Initialize scraping system
const scrapingSystem = createScrapingSystem()

// GET /api/scraping - Get scraping status
export async function GET() {
  try {
    const status = scrapingSystem.scheduler.getStatus()
    const dashboard = await scrapingSystem.database.getScrapingDashboard()
    
    return NextResponse.json({
      success: true,
      data: {
        scheduler: status,
        dashboard
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/scraping - Trigger scraping manually
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, platform, options } = body

    if (action === 'scrape') {
      if (platform && platform !== 'all') {
        // Scrape specific platform
        const result = await scrapingSystem.manager.scrapePlatform(platform, options)
        return NextResponse.json({ success: true, data: result })
      } else {
        // Scrape all platforms
        const results = await scrapingSystem.manager.scrapeAll(options)
        return NextResponse.json({ success: true, data: results })
      }
    } else if (action === 'trigger-task') {
      const { taskName } = body
      if (!taskName) {
        return NextResponse.json({
          success: false,
          error: 'Task name is required'
        }, { status: 400 })
      }

      await scrapingSystem.scheduler.runTaskNow(taskName)
      return NextResponse.json({ success: true, message: `Task ${taskName} executed successfully` })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action'
      }, { status: 400 })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}