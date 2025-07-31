export type NotificationFrequency = 'immediate' | 'daily' | 'weekly'
export type NotificationMethod = 'email' | 'sms' | 'both'
export type SubscriptionTier = 'free' | 'premium'
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced'

export interface NotificationSubscription {
  id: number
  email?: string
  phone?: string
  subscription_type: NotificationMethod
  verified: boolean
  verification_token?: string
  verification_expires_at?: string
  
  // Subscription preferences
  frequency: NotificationFrequency
  subscription_tier: SubscriptionTier
  
  // Filter preferences
  regions: string[] // Province/territory names
  sectors: string[] // Job sectors (mining, oil_gas, etc.)
  companies: string[] // Specific company names
  employment_types: string[] // Full-time, Part-time, Contract, etc.
  keywords: string[] // Keywords to match in job title/description
  salary_min?: number // Minimum salary filter
  
  // Metadata
  created_at: string
  updated_at: string
  last_notification_sent?: string
  is_active: boolean
  unsubscribe_token: string
}

export interface CreateSubscriptionRequest {
  email?: string
  phone?: string
  subscription_type: NotificationMethod
  frequency?: NotificationFrequency
  subscription_tier?: SubscriptionTier
  regions?: string[]
  sectors?: string[]
  companies?: string[]
  employment_types?: string[]
  keywords?: string[]
  salary_min?: number
}

export interface UpdateSubscriptionRequest {
  frequency?: NotificationFrequency
  regions?: string[]
  sectors?: string[]
  companies?: string[]
  employment_types?: string[]
  keywords?: string[]
  salary_min?: number
  is_active?: boolean
}

export interface NotificationDelivery {
  id: number
  subscription_id: number
  job_ids: number[]
  delivery_method: 'email' | 'sms'
  recipient: string
  subject?: string
  content: string
  status: DeliveryStatus
  sent_at?: string
  delivered_at?: string
  error_message?: string
  external_id?: string
  created_at: string
}

export interface JobNotificationQueue {
  id: number
  job_id: number
  subscription_id: number
  priority: number
  scheduled_for: string
  processed_at?: string
  created_at: string
}

export interface NotificationTemplate {
  type: 'immediate' | 'daily' | 'weekly'
  method: 'email' | 'sms'
  subject?: string // For email
  template: string
  variables: string[] // Available template variables
}

export interface JobMatchResult {
  job_id: number
  subscription_ids: number[]
  matched_filters: {
    subscription_id: number
    matched_criteria: string[] // Which filters matched
  }[]
}

export interface NotificationPreferences {
  // Available options for dropdowns/filters
  regions: { value: string; label: string }[]
  sectors: { value: string; label: string }[]
  employment_types: { value: string; label: string }[]
  subscription_tiers: {
    free: {
      max_keywords: number
      frequencies: NotificationFrequency[]
      daily_limit: number
    }
    premium: {
      max_keywords: number
      frequencies: NotificationFrequency[]
      daily_limit: number
    }
  }
}

export interface SubscriptionAnalytics {
  date: string
  new_subscriptions: number
  active_subscriptions: number
  unsubscribes: number
  emails_sent: number
  emails_delivered: number
  emails_bounced: number
  sms_sent: number
  sms_delivered: number
  sms_failed: number
  notifications_with_jobs: number
  total_jobs_notified: number
}

export interface NotificationBatch {
  id: string
  subscription_id: number
  jobs: {
    id: number
    title: string
    company: string
    location: string
    sector: string
    employment_type: string
    salary_range?: string
    posted_date: string
    application_url?: string
  }[]
  created_at: string
  delivery_method: 'email' | 'sms'
  template_type: 'immediate' | 'daily' | 'weekly'
}

// Email template data
export interface EmailNotificationData {
  subscriber_email: string
  unsubscribe_token: string
  frequency: NotificationFrequency
  jobs: NotificationBatch['jobs']
  summary: {
    total_jobs: number
    new_jobs_today?: number
    sectors: string[]
    companies: string[]
  }
}

// SMS template data  
export interface SMSNotificationData {
  subscriber_phone: string
  unsubscribe_token: string
  jobs_count: number
  top_job?: {
    title: string
    company: string
    location: string
  }
  view_more_url: string
}

// Verification
export interface VerificationRequest {
  email?: string
  phone?: string
  subscription_type: NotificationMethod
}

export interface VerificationConfirm {
  token: string
  contact: string // email or phone
}

// Unsubscribe
export interface UnsubscribeRequest {
  token: string
  reason?: string
}

// API Response types
export interface SubscriptionResponse {
  success: boolean
  subscription?: NotificationSubscription
  message?: string
  verification_required?: boolean
}

export interface NotificationStatsResponse {
  total_subscriptions: number
  verified_subscriptions: number
  active_subscriptions: number
  email_subscriptions: number
  sms_subscriptions: number
  both_subscriptions: number
  immediate_subscriptions: number
  daily_subscriptions: number
  weekly_subscriptions: number
  premium_subscriptions: number
}

export interface DeliveryStatsResponse {
  period: string // 'today', 'week', 'month'
  emails_sent: number
  emails_delivered: number
  emails_bounced: number
  sms_sent: number
  sms_delivered: number
  sms_failed: number
  delivery_rate: number
}