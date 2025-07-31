import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { VerificationConfirm } from '@/types/notifications'

// POST /api/notifications/verify - Verify email/phone subscription
export async function POST(request: NextRequest) {
  try {
    const body: VerificationConfirm = await request.json()

    if (!body.token || !body.contact) {
      return NextResponse.json(
        { success: false, message: 'Verification token and contact method are required' },
        { status: 400 }
      )
    }

    // Find subscription by verification token
    const { data: subscription, error: findError } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('verification_token', body.token)
      .single()

    if (findError || !subscription) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token' },
        { status: 404 }
      )
    }

    // Check if token has expired
    if (subscription.verification_expires_at && new Date(subscription.verification_expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Verify the contact method matches
    const contactMatches = 
      (subscription.email && subscription.email === body.contact) ||
      (subscription.phone && subscription.phone === body.contact)

    if (!contactMatches) {
      return NextResponse.json(
        { success: false, message: 'Contact method does not match subscription' },
        { status: 400 }
      )
    }

    // Already verified
    if (subscription.verified) {
      return NextResponse.json(
        { success: true, message: 'Subscription already verified' }
      )
    }

    // Update subscription to verified and active
    const { data: updated, error: updateError } = await supabase
      .from('notification_subscriptions')
      .update({
        verified: true,
        is_active: true,
        verification_token: null,
        verification_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error verifying subscription:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to verify subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: updated,
      message: 'Subscription verified successfully'
    })

  } catch (error) {
    console.error('Error handling POST /api/notifications/verify:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/notifications/verify - Check verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find subscription by verification token
    const { data: subscription, error } = await supabase
      .from('notification_subscriptions')
      .select('id, email, phone, subscription_type, verified, verification_expires_at')
      .eq('verification_token', token)
      .single()

    if (error || !subscription) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token' },
        { status: 404 }
      )
    }

    const expired = subscription.verification_expires_at && 
      new Date(subscription.verification_expires_at) < new Date()

    return NextResponse.json({
      success: true,
      data: {
        contact: subscription.email || subscription.phone,
        subscription_type: subscription.subscription_type,
        verified: subscription.verified,
        expired: expired
      }
    })

  } catch (error) {
    console.error('Error handling GET /api/notifications/verify:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}