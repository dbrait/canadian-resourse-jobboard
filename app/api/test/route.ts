import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'working',
    message: 'API routes are functional',
    timestamp: new Date().toISOString()
  })
}