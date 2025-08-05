import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check if environment variables are available
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return NextResponse.json({
    status: 'API is working',
    environment: {
      hasSupabaseUrl,
      hasSupabaseKey,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    },
    timestamp: new Date().toISOString()
  })
}