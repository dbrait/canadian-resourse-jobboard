import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return simple success response
    return NextResponse.json({
      status: 'ok',
      message: 'API is working',
      timestamp: new Date().toISOString(),
      jobs: []
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'API error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}