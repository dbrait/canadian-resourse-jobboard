import { supabase } from '@/lib/supabase'
import { 
  NotificationBatch, 
  EmailNotificationData, 
  SMSNotificationData,
  NotificationDelivery,
  DeliveryStatus
} from '@/types/notifications'

export class NotificationService {
  private emailProvider: EmailProvider
  private smsProvider: SMSProvider

  constructor() {
    // Initialize with your preferred providers
    this.emailProvider = new EmailProvider()
    this.smsProvider = new SMSProvider()
  }

  async sendEmailNotification(batch: NotificationBatch): Promise<NotificationDelivery> {
    const subscription = await this.getSubscription(batch.subscription_id)
    if (!subscription?.email) {
      throw new Error('No email address found for subscription')
    }

    const emailData: EmailNotificationData = {
      subscriber_email: subscription.email,
      unsubscribe_token: subscription.unsubscribe_token,
      frequency: subscription.frequency,
      jobs: batch.jobs,
      summary: {
        total_jobs: batch.jobs.length,
        new_jobs_today: batch.template_type === 'daily' ? batch.jobs.length : undefined,
        sectors: [...new Set(batch.jobs.map(j => j.sector))],
        companies: [...new Set(batch.jobs.map(j => j.company))]
      }
    }

    const template = this.getEmailTemplate(batch.template_type)
    const { subject, content } = this.renderEmailTemplate(template, emailData)

    // Create delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('notification_deliveries')
      .insert({
        subscription_id: batch.subscription_id,
        job_ids: batch.jobs.map(j => j.id),
        delivery_method: 'email',
        recipient: subscription.email,
        subject,
        content,
        status: 'pending'
      })
      .select()
      .single()

    if (deliveryError) {
      throw new Error(`Failed to create delivery record: ${deliveryError.message}`)
    }

    try {
      // Send email
      const externalId = await this.emailProvider.send({
        to: subscription.email,
        subject,
        html: content,
        text: this.htmlToText(content)
      })

      // Update delivery record
      await supabase
        .from('notification_deliveries')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          external_id: externalId
        })
        .eq('id', delivery.id)

      return { ...delivery, status: 'sent' as DeliveryStatus, sent_at: new Date().toISOString(), external_id: externalId }

    } catch (error) {
      // Update delivery record with error
      await supabase
        .from('notification_deliveries')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', delivery.id)

      throw error
    }
  }

  async sendSMSNotification(batch: NotificationBatch): Promise<NotificationDelivery> {
    const subscription = await this.getSubscription(batch.subscription_id)
    if (!subscription?.phone) {
      throw new Error('No phone number found for subscription')
    }

    const smsData: SMSNotificationData = {
      subscriber_phone: subscription.phone,
      unsubscribe_token: subscription.unsubscribe_token,
      jobs_count: batch.jobs.length,
      top_job: batch.jobs[0] ? {
        title: batch.jobs[0].title,
        company: batch.jobs[0].company,
        location: batch.jobs[0].location
      } : undefined,
      view_more_url: `${process.env.NEXT_PUBLIC_APP_URL}/notifications?token=${subscription.unsubscribe_token}`
    }

    const template = this.getSMSTemplate(batch.template_type)
    const content = this.renderSMSTemplate(template, smsData)

    // Create delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('notification_deliveries')
      .insert({
        subscription_id: batch.subscription_id,
        job_ids: batch.jobs.map(j => j.id),
        delivery_method: 'sms',
        recipient: subscription.phone,
        content,
        status: 'pending'
      })
      .select()
      .single()

    if (deliveryError) {
      throw new Error(`Failed to create delivery record: ${deliveryError.message}`)
    }

    try {
      // Send SMS
      const externalId = await this.smsProvider.send({
        to: subscription.phone,
        message: content
      })

      // Update delivery record
      await supabase
        .from('notification_deliveries')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          external_id: externalId
        })
        .eq('id', delivery.id)

      return { ...delivery, status: 'sent' as DeliveryStatus, sent_at: new Date().toISOString(), external_id: externalId }

    } catch (error) {
      // Update delivery record with error
      await supabase
        .from('notification_deliveries')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', delivery.id)

      throw error
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/notifications/verify?token=${token}&contact=${encodeURIComponent(email)}`
    
    const subject = 'Verify your job alert subscription'
    const content = `
      <h2>Verify your job alert subscription</h2>
      <p>Thank you for subscribing to Canadian Resource Job Board notifications!</p>
      <p>Please click the link below to verify your email address and activate your subscription:</p>
      <p><a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This verification link will expire in 24 hours.</p>
      <p>If you didn't request this subscription, you can safely ignore this email.</p>
    `

    await this.emailProvider.send({
      to: email,
      subject,
      html: content,
      text: this.htmlToText(content)
    })
  }

  async sendVerificationSMS(phone: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/notifications/verify?token=${token}&contact=${encodeURIComponent(phone)}`
    
    const message = `Canadian Resource Jobs: Verify your subscription by visiting: ${verificationUrl} (expires in 24h)`

    await this.smsProvider.send({
      to: phone,
      message
    })
  }

  private async getSubscription(subscriptionId: number) {
    const { data, error } = await supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch subscription: ${error.message}`)
    }

    return data
  }

  private getEmailTemplate(type: 'immediate' | 'daily' | 'weekly'): string {
    const templates = {
      immediate: `
        <h2>New Job Alert</h2>
        <p>Hi there!</p>
        <p>We found {{jobs_count}} new job(s) matching your preferences:</p>
        {{#jobs}}
        <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
          <h3>{{title}}</h3>
          <p><strong>Company:</strong> {{company}}</p>
          <p><strong>Location:</strong> {{location}}</p>
          <p><strong>Sector:</strong> {{sector}}</p>
          <p><strong>Type:</strong> {{employment_type}}</p>
          {{#salary_range}}<p><strong>Salary:</strong> {{salary_range}}</p>{{/salary_range}}
          <p><strong>Posted:</strong> {{posted_date}}</p>
          {{#application_url}}<p><a href="{{application_url}}" style="background-color: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px;">Apply Now</a></p>{{/application_url}}
        </div>
        {{/jobs}}
        <hr>
        <p><small><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{manage_url}}">Manage Preferences</a></small></p>
      `,
      daily: `
        <h2>Daily Job Digest</h2>
        <p>Hi there!</p>
        <p>Here's your daily summary of {{jobs_count}} new job(s) in {{sectors_list}}:</p>
        {{#jobs}}
        <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
          <h3>{{title}}</h3>
          <p><strong>{{company}}</strong> - {{location}}</p>
          <p>{{sector}} | {{employment_type}}</p>
          {{#application_url}}<p><a href="{{application_url}}">Apply Now</a></p>{{/application_url}}
        </div>
        {{/jobs}}
        <hr>
        <p><small><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{manage_url}}">Manage Preferences</a></small></p>
      `,
      weekly: `
        <h2>Weekly Job Roundup</h2>
        <p>Hi there!</p>
        <p>Here are the {{jobs_count}} new jobs from this week in {{sectors_list}}:</p>
        {{#jobs}}
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
          <h4>{{title}} - {{company}}</h4>
          <p>{{location}} | {{sector}} | {{employment_type}}</p>
          {{#application_url}}<p><a href="{{application_url}}">Apply Now</a></p>{{/application_url}}
        </div>
        {{/jobs}}
        <hr>
        <p><small><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{manage_url}}">Manage Preferences</a></small></p>
      `
    }
    return templates[type]
  }

  private getSMSTemplate(type: 'immediate' | 'daily' | 'weekly'): string {
    const templates = {
      immediate: 'New job alert: {{top_job_title}} at {{top_job_company}} in {{top_job_location}}. {{#multiple}}+{{remaining_count}} more jobs.{{/multiple}} View all: {{view_more_url}}',
      daily: 'Daily job digest: {{jobs_count}} new jobs today. Top: {{top_job_title}} at {{top_job_company}}. View all: {{view_more_url}}',
      weekly: 'Weekly jobs: {{jobs_count}} new positions this week. Latest: {{top_job_title}} at {{top_job_company}}. View all: {{view_more_url}}'
    }
    return templates[type]
  }

  private renderEmailTemplate(template: string, data: EmailNotificationData): { subject: string, content: string } {
    const subject = data.frequency === 'immediate' ? 'New Job Alert' : 
                   data.frequency === 'daily' ? 'Daily Job Digest' : 'Weekly Job Roundup'

    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/notifications/unsubscribe?token=${data.unsubscribe_token}`
    const manageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/notifications/manage?token=${data.unsubscribe_token}`

    // Simple template rendering (replace with proper template engine if needed)
    let content = template
      .replace(/{{jobs_count}}/g, data.jobs.length.toString())
      .replace(/{{sectors_list}}/g, data.summary.sectors.join(', '))
      .replace(/{{unsubscribe_url}}/g, unsubscribeUrl)
      .replace(/{{manage_url}}/g, manageUrl)

    // Render jobs array
    const jobsHtml = data.jobs.map(job => {
      let jobTemplate = template.match(/{{#jobs}}([\s\S]*?){{\/jobs}}/)?.[1] || ''
      return jobTemplate
        .replace(/{{title}}/g, job.title)
        .replace(/{{company}}/g, job.company)
        .replace(/{{location}}/g, job.location)
        .replace(/{{sector}}/g, job.sector)
        .replace(/{{employment_type}}/g, job.employment_type)
        .replace(/{{salary_range}}/g, job.salary_range || '')
        .replace(/{{posted_date}}/g, new Date(job.posted_date).toLocaleDateString())
        .replace(/{{application_url}}/g, job.application_url || '')
    }).join('')

    content = content.replace(/{{#jobs}}[\s\S]*?{{\/jobs}}/, jobsHtml)

    return { subject, content }
  }

  private renderSMSTemplate(template: string, data: SMSNotificationData): string {
    let content = template
      .replace(/{{jobs_count}}/g, data.jobs_count.toString())
      .replace(/{{view_more_url}}/g, data.view_more_url)

    if (data.top_job) {
      content = content
        .replace(/{{top_job_title}}/g, data.top_job.title)
        .replace(/{{top_job_company}}/g, data.top_job.company)
        .replace(/{{top_job_location}}/g, data.top_job.location)
    }

    // Handle conditional sections
    if (data.jobs_count > 1) {
      content = content.replace(/{{#multiple}}(.*?){{\/multiple}}/g, '$1')
      content = content.replace(/{{remaining_count}}/g, (data.jobs_count - 1).toString())
    } else {
      content = content.replace(/{{#multiple}}.*?{{\/multiple}}/g, '')
    }

    return content
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

// Email provider interface (implement with your preferred service)
class EmailProvider {
  async send(email: { to: string; subject: string; html: string; text: string }): Promise<string> {
    // TODO: Implement with SendGrid, AWS SES, or other email service
    console.log('Sending email:', email.to, email.subject)
    
    // Mock implementation - replace with actual service
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// SMS provider interface (implement with your preferred service)
class SMSProvider {
  async send(sms: { to: string; message: string }): Promise<string> {
    // TODO: Implement with Twilio, AWS SNS, or other SMS service
    console.log('Sending SMS:', sms.to, sms.message)
    
    // Mock implementation - replace with actual service
    return `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}