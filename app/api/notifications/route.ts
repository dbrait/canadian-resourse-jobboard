import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  CreateSubscriptionRequest, 
  UpdateSubscriptionRequest,
  NotificationSubscription,
  SubscriptionResponse 
} from '@/types/notifications'

// GET /api/notifications - Get subscription preferences and stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const stats = searchParams.get('stats')

    // Return subscription stats
    if (stats === 'true') {
      const { data, error } = await supabase
        .from('subscription_summary')
        .select('*')
        .single()

      if (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    // Get specific subscription by token or email
    if (token || email) {
      let query = supabase
        .from('notification_subscriptions')
        .select('*')

      if (token) {
        query = query.eq('unsubscribe_token', token)
      } else if (email) {
        query = query.eq('email', email)
      }

      const { data, error } = await query.single()

      if (error || !data) {
        return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, subscription: data })
    }

    // Return notification preferences (for dropdowns)
    const preferences = {
      regions: [
        { value: 'Alberta', label: 'Alberta' },
        { value: 'British Columbia', label: 'British Columbia' },
        { value: 'Manitoba', label: 'Manitoba' },
        { value: 'New Brunswick', label: 'New Brunswick' },
        { value: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador' },
        { value: 'Nova Scotia', label: 'Nova Scotia' },
        { value: 'Northwest Territories', label: 'Northwest Territories' },
        { value: 'Nunavut', label: 'Nunavut' },
        { value: 'Ontario', label: 'Ontario' },
        { value: 'Prince Edward Island', label: 'Prince Edward Island' },
        { value: 'Quebec', label: 'Quebec' },
        { value: 'Saskatchewan', label: 'Saskatchewan' },
        { value: 'Yukon', label: 'Yukon' }
      ],
      sectors: [
        { value: 'mining', label: 'Mining' },
        { value: 'oil_gas', label: 'Oil & Gas' },
        { value: 'forestry', label: 'Forestry' },
        { value: 'renewable', label: 'Renewable Energy' },
        { value: 'utilities', label: 'Utilities' },
        { value: 'general', label: 'General' }
      ],
      employment_types: [
        { value: 'Full-time', label: 'Full-time' },
        { value: 'Part-time', label: 'Part-time' },
        { value: 'Contract', label: 'Contract' },
        { value: 'Temporary', label: 'Temporary' },
        { value: 'Internship', label: 'Internship' },
        { value: 'Casual', label: 'Casual' }
      ],
      subscription_tiers: {
        free: {
          max_keywords: 5,
          frequencies: ['weekly'],
          daily_limit: 0
        },
        premium: {
          max_keywords: 20,
          frequencies: ['immediate', 'daily', 'weekly'],
          daily_limit: 50
        }
      }
    }

    return NextResponse.json({ success: true, preferences })

  } catch (error) {
    console.error('Error handling GET /api/notifications:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const body: CreateSubscriptionRequest = await request.json()

    // Validate required fields
    if (!body.email && !body.phone) {
      return NextResponse.json(
        { success: false, message: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    if (!body.subscription_type) {
      return NextResponse.json(
        { success: false, message: 'Subscription type is required' },
        { status: 400 }
      )
    }

    // Validate contact method matches subscription type
    if (body.subscription_type === 'email' && !body.email) {
      return NextResponse.json(
        { success: false, message: 'Email is required for email subscriptions' },
        { status: 400 }
      )
    }

    if (body.subscription_type === 'sms' && !body.phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required for SMS subscriptions' },
        { status: 400 }
      )
    }

    if (body.subscription_type === 'both' && (!body.email || !body.phone)) {
      return NextResponse.json(
        { success: false, message: 'Both email and phone are required for combined subscriptions' },
        { status: 400 }
      )
    }

    // Check for existing subscription
    let existingQuery = supabase
      .from('notification_subscriptions')
      .select('id, verified')

    if (body.email) {
      existingQuery = existingQuery.eq('email', body.email)
    }
    if (body.phone) {
      existingQuery = existingQuery.eq('phone', body.phone)
    }

    const { data: existing } = await existingQuery.maybeSingle()

    if (existing) {
      return NextResponse.json(
        { 
          success: false, 
          message: existing.verified ? 'Subscription already exists' : 'Subscription exists but not verified',
          verification_required: !existing.verified
        },
        { status: 409 }
      )
    }

    // Set defaults based on tier
    const tier = body.subscription_tier || 'free'
    const frequency = body.frequency || (tier === 'free' ? 'weekly' : 'immediate')

    // Validate frequency based on tier
    if (tier === 'free' && frequency !== 'weekly') {
      return NextResponse.json(
        { success: false, message: 'Free tier only supports weekly notifications' },
        { status: 400 }
      )
    }

    // Validate keyword limits
    if (body.keywords && body.keywords.length > (tier === 'free' ? 5 : 20)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `${tier === 'free' ? 'Free' : 'Premium'} tier allows maximum ${tier === 'free' ? 5 : 20} keywords` 
        },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create subscription
    const { data: subscription, error } = await supabase
      .from('notification_subscriptions')
      .insert({
        email: body.email,
        phone: body.phone,
        subscription_type: body.subscription_type,
        frequency,
        subscription_tier: tier,
        regions: body.regions || [],
        sectors: body.sectors || [],
        companies: body.companies || [],
        employment_types: body.employment_types || [],
        keywords: body.keywords || [],
        salary_min: body.salary_min,
        verification_token: verificationToken,
        verification_expires_at: verificationExpires.toISOString(),
        verified: false,
        is_active: false // Will be activated after verification
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    // TODO: Send verification email/SMS
    // This would integrate with your email/SMS service
    console.log(`Verification needed for ${body.email || body.phone}: ${verificationToken}`)

    const response: SubscriptionResponse = {
      success: true,
      subscription,
      message: 'Subscription created. Please check your email/phone for verification.',
      verification_required: true
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error handling POST /api/notifications:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Update existing subscription  
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token && !email) {
      return NextResponse.json(
        { success: false, message: 'Token or email is required' },
        { status: 400 }
      )
    }

    const body: UpdateSubscriptionRequest = await request.json()

    // Find subscription
    let query = supabase
      .from('notification_subscriptions')
      .select('*')

    if (token) {
      query = query.eq('unsubscribe_token', token)
    } else if (email) {
      query = query.eq('email', email)
    }

    const { data: existing, error: findError } = await query.single()

    if (findError || !existing) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Validate frequency based on tier
    if (body.frequency && existing.subscription_tier === 'free' && body.frequency !== 'weekly') {
      return NextResponse.json(
        { success: false, message: 'Free tier only supports weekly notifications' },
        { status: 400 }
      )
    }

    // Validate keyword limits
    if (body.keywords && body.keywords.length > (existing.subscription_tier === 'free' ? 5 : 20)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `${existing.subscription_tier === 'free' ? 'Free' : 'Premium'} tier allows maximum ${existing.subscription_tier === 'free' ? 5 : 20} keywords` 
        },
        { status: 400 }
      )
    }

    // Update subscription
    const { data: updated, error: updateError } = await supabase
      .from('notification_subscriptions')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: updated,
      message: 'Subscription updated successfully'
    })

  } catch (error) {
    console.error('Error handling PUT /api/notifications:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unsubscribe token is required' },
        { status: 400 }
      )
    }

    // Soft delete - deactivate subscription
    const { data, error } = await supabase
      .from('notification_subscriptions')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('unsubscribe_token', token)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'Invalid unsubscribe token' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    })

  } catch (error) {
    console.error('Error handling DELETE /api/notifications:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}