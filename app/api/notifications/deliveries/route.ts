import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/notifications/deliveries - Get delivery statistics and history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today' // today, week, month
    const subscriptionId = searchParams.get('subscription_id')
    const status = searchParams.get('status')

    let startDate: Date
    const endDate = new Date()

    switch (period) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'today':
      default:
        startDate = new Date()
        startDate.setHours(0, 0, 0, 0)
        break
    }

    if (subscriptionId) {
      // Get delivery history for specific subscription
      let query = supabase
        .from('notification_deliveries')
        .select(`
          id,
          job_ids,
          delivery_method,
          recipient,
          subject,
          status,
          sent_at,
          delivered_at,
          error_message,
          created_at
        `)
        .eq('subscription_id', subscriptionId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query.limit(100)

      if (error) {
        console.error('Error fetching delivery history:', error)
        return NextResponse.json(
          { success: false, message: 'Failed to fetch delivery history' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, deliveries: data })
    } else {
      // Get delivery statistics
      const { data: stats, error: statsError } = await supabase
        .from('notification_deliveries')
        .select('delivery_method, status, sent_at, delivered_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (statsError) {
        console.error('Error fetching delivery stats:', statsError)
        return NextResponse.json(
          { success: false, message: 'Failed to fetch delivery statistics' },
          { status: 500 }
        )
      }

      // Calculate statistics
      const emailsSent = stats.filter(d => d.delivery_method === 'email' && d.status === 'sent').length
      const emailsDelivered = stats.filter(d => d.delivery_method === 'email' && d.status === 'delivered').length
      const emailsBounced = stats.filter(d => d.delivery_method === 'email' && d.status === 'bounced').length
      
      const smsSent = stats.filter(d => d.delivery_method === 'sms' && d.status === 'sent').length
      const smsDelivered = stats.filter(d => d.delivery_method === 'sms' && d.status === 'delivered').length
      const smsFailed = stats.filter(d => d.delivery_method === 'sms' && d.status === 'failed').length

      const totalSent = emailsSent + smsSent
      const totalDelivered = emailsDelivered + smsDelivered
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0

      const deliveryStats = {
        period,
        emails_sent: emailsSent,
        emails_delivered: emailsDelivered,
        emails_bounced: emailsBounced,
        sms_sent: smsSent,
        sms_delivered: smsDelivered,
        sms_failed: smsFailed,
        delivery_rate: Math.round(deliveryRate * 100) / 100
      }

      return NextResponse.json({ success: true, stats: deliveryStats })
    }

  } catch (error) {
    console.error('Error handling GET /api/notifications/deliveries:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/notifications/deliveries - Record delivery status (webhook endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // This would be called by your email/SMS service provider
    // Format depends on the service (SendGrid, Twilio, etc.)
    const {
      external_id,
      delivery_id,
      status,
      error_message,
      delivered_at
    } = body

    if (!external_id && !delivery_id) {
      return NextResponse.json(
        { success: false, message: 'External ID or delivery ID is required' },
        { status: 400 }
      )
    }

    // Find delivery record
    let query = supabase
      .from('notification_deliveries')
      .select('id')

    if (external_id) {
      query = query.eq('external_id', external_id)
    } else {
      query = query.eq('id', delivery_id)
    }

    const { data: delivery, error: findError } = await query.single()

    if (findError || !delivery) {
      return NextResponse.json(
        { success: false, message: 'Delivery record not found' },
        { status: 404 }
      )
    }

    // Update delivery status
    const updateData: any = { status }
    
    if (error_message) {
      updateData.error_message = error_message
    }
    
    if (delivered_at) {
      updateData.delivered_at = new Date(delivered_at).toISOString()
    }

    const { error: updateError } = await supabase
      .from('notification_deliveries')
      .update(updateData)
      .eq('id', delivery.id)

    if (updateError) {
      console.error('Error updating delivery status:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update delivery status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Delivery status updated' })

  } catch (error) {
    console.error('Error handling POST /api/notifications/deliveries:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}