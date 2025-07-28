import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager } from '../../../../lib/scraping/database-manager'

// GET /api/scraping/stats - Get detailed scraping statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const days = parseInt(searchParams.get('days') || '7')

    const dashboard = await DatabaseManager.getScrapingDashboard()
    
    return NextResponse.json({
      success: true,
      data: dashboard
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}