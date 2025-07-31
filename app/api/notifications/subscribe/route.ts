import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schema for subscription requests
const subscriptionSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  subscription_type: z.enum(['email', 'sms', 'both']),
  frequency: z.enum(['immediate', 'daily', 'weekly']).default('weekly'),
  subscription_tier: z.enum(['free', 'premium']).default('free'),
  regions: z.array(z.string()).default([]),
  sectors: z.array(z.string()).default([]),
  companies: z.array(z.string()).default([]),
  employment_types: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  salary_min: z.number().optional()
}).refine(
  (data) => data.email || data.phone,
  { message: "Either email or phone number is required" }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = subscriptionSchema.parse(body)
    
    // Check for existing subscription with same contact info
    let existingQuery = supabase
      .from('notification_subscriptions')
      .select('id')
    
    if (validatedData.email) {
      existingQuery = existingQuery.eq('email', validatedData.email)
    } else if (validatedData.phone) {
      existingQuery = existingQuery.eq('phone', validatedData.phone)
    }
    
    const { data: existing } = await existingQuery.single()
    
    if (existing) {
      return NextResponse.json(
        { error: 'A subscription already exists for this contact information' },
        { status: 409 }
      )
    }
    
    // Generate verification token for email/SMS verification
    const verificationToken = crypto.randomUUID()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Insert new subscription
    const { data: subscription, error } = await supabase
      .from('notification_subscriptions')
      .insert({
        ...validatedData,
        verification_token: verificationToken,
        verification_expires_at: verificationExpires.toISOString(),
        verified: false
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }
    
    // TODO: Send verification email/SMS
    // For now, return success response
    
    return NextResponse.json({
      success: true,
      message: 'Subscription created successfully',
      subscription_id: subscription.id,
      verification_required: true,
      // Don't return sensitive data like tokens
      subscription: {
        id: subscription.id,
        subscription_type: subscription.subscription_type,
        frequency: subscription.frequency,
        subscription_tier: subscription.subscription_tier,
        verified: subscription.verified
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve subscription preferences (with token authentication)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      )
    }
    
    const { data: subscription, error } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('unsubscribe_token', token)
      .single()
    
    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 }
      )
    }
    
    // Remove sensitive data
    const { verification_token, unsubscribe_token, ...safeSubscription } = subscription
    
    return NextResponse.json({
      success: true,
      subscription: safeSubscription
    })
    
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}