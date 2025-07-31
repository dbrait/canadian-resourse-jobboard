import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const unsubscribeSchema = z.object({
  token: z.string().min(1, 'Unsubscribe token is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = unsubscribeSchema.parse(body)
    
    // Find and deactivate the subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('notification_subscriptions')
      .select('id, email, phone, is_active')
      .eq('unsubscribe_token', token)
      .single()
    
    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 404 }
      )
    }
    
    if (!subscription.is_active) {
      return NextResponse.json({
        success: true,
        message: 'Already unsubscribed',
        was_active: false
      })
    }
    
    // Deactivate the subscription
    const { error: updateError } = await supabase
      .from('notification_subscriptions')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('unsubscribe_token', token)
    
    if (updateError) {
      console.error('Unsubscribe error:', updateError)
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from job notifications',
      was_active: true,
      contact: subscription.email || subscription.phone
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for unsubscribe page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unsubscribe token required' },
        { status: 400 }
      )
    }
    
    // Validate token and get subscription info
    const { data: subscription, error } = await supabase
      .from('notification_subscriptions')
      .select('id, email, phone, is_active, frequency, subscription_type')
      .eq('unsubscribe_token', token)
      .single()
    
    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        contact: subscription.email || subscription.phone,
        is_active: subscription.is_active,
        frequency: subscription.frequency,
        subscription_type: subscription.subscription_type
      }
    })
    
  } catch (error) {
    console.error('Get unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}