-- Notification system schema for job alerts
-- Run these commands in your Supabase SQL editor

-- Notification subscription table
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT,
  phone TEXT,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('email', 'sms', 'both')),
  verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Subscription preferences
  frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily', 'weekly')),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  
  -- Filter preferences
  regions TEXT[] DEFAULT '{}', -- Array of provinces/territories
  sectors TEXT[] DEFAULT '{}', -- Array of job sectors
  companies TEXT[] DEFAULT '{}', -- Array of specific companies
  employment_types TEXT[] DEFAULT '{}', -- Array of employment types
  keywords TEXT[] DEFAULT '{}', -- Array of keywords to match in title/description
  salary_min INTEGER, -- Minimum salary filter
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_notification_sent TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribe_token TEXT UNIQUE,
  
  -- Ensure at least one contact method is provided
  CONSTRAINT contact_method_required CHECK (
    (email IS NOT NULL AND email != '') OR 
    (phone IS NOT NULL AND phone != '')
  )
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_email ON notification_subscriptions(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_phone ON notification_subscriptions(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_verified ON notification_subscriptions(verified);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_active ON notification_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_frequency ON notification_subscriptions(frequency);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_regions ON notification_subscriptions USING GIN(regions);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_sectors ON notification_subscriptions USING GIN(sectors);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_companies ON notification_subscriptions USING GIN(companies);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_unsubscribe ON notification_subscriptions(unsubscribe_token);

-- Notification delivery log
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER REFERENCES notification_subscriptions(id) ON DELETE CASCADE,
  job_ids INTEGER[] NOT NULL, -- Array of job IDs included in this notification
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms')),
  recipient TEXT NOT NULL, -- Email address or phone number
  subject TEXT,
  content TEXT,
  
  -- Delivery status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- External service tracking
  external_id TEXT, -- ID from email/SMS service provider
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for delivery tracking
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_subscription ON notification_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_sent_at ON notification_deliveries(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_job_ids ON notification_deliveries USING GIN(job_ids);

-- Job notification queue (for batch processing)
CREATE TABLE IF NOT EXISTS job_notification_queue (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES notification_subscriptions(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1, -- Higher number = higher priority
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(job_id, subscription_id) -- Prevent duplicate notifications
);

-- Create indexes for queue processing
CREATE INDEX IF NOT EXISTS idx_job_notification_queue_scheduled ON job_notification_queue(scheduled_for) WHERE processed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_job_notification_queue_priority ON job_notification_queue(priority DESC) WHERE processed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_job_notification_queue_processed ON job_notification_queue(processed_at);

-- Subscription analytics table
CREATE TABLE IF NOT EXISTS subscription_analytics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Daily metrics
  new_subscriptions INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  
  -- Delivery metrics
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  sms_sent INTEGER DEFAULT 0,
  sms_delivered INTEGER DEFAULT 0,
  sms_failed INTEGER DEFAULT 0,
  
  -- Engagement metrics
  notifications_with_jobs INTEGER DEFAULT 0,
  total_jobs_notified INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(date)
);

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_date ON subscription_analytics(date);

-- Enable RLS
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (with rate limiting handled at app level)
CREATE POLICY "Allow public subscription creation" ON notification_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow subscription owners to view their data" ON notification_subscriptions
  FOR SELECT USING (
    email = current_setting('request.jwt.claims', true)::json->>'email' OR
    unsubscribe_token = current_setting('request.headers', true)::json->>'unsubscribe-token'
  );

CREATE POLICY "Allow subscription owners to update their data" ON notification_subscriptions
  FOR UPDATE USING (
    email = current_setting('request.jwt.claims', true)::json->>'email' OR
    unsubscribe_token = current_setting('request.headers', true)::json->>'unsubscribe-token'
  );

-- Service role policies for notification processing
CREATE POLICY "Service role full access to deliveries" ON notification_deliveries
  FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role full access to queue" ON job_notification_queue
  FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "Public read access to analytics" ON subscription_analytics
  FOR SELECT USING (true);

-- Functions for subscription management

-- Generate unsubscribe token
CREATE OR REPLACE FUNCTION generate_unsubscribe_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Auto-generate unsubscribe token on insert
CREATE OR REPLACE FUNCTION set_unsubscribe_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token = generate_unsubscribe_token();
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_unsubscribe_token
  BEFORE INSERT OR UPDATE ON notification_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_unsubscribe_token();

-- Function to match jobs with subscriptions
CREATE OR REPLACE FUNCTION match_job_subscriptions(job_row jobs)
RETURNS TABLE(subscription_id INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT ns.id
  FROM notification_subscriptions ns
  WHERE ns.is_active = true 
    AND ns.verified = true
    AND (
      -- Region filter
      (array_length(ns.regions, 1) IS NULL OR job_row.province = ANY(ns.regions))
      AND
      -- Sector filter  
      (array_length(ns.sectors, 1) IS NULL OR job_row.sector = ANY(ns.sectors))
      AND
      -- Company filter
      (array_length(ns.companies, 1) IS NULL OR job_row.company = ANY(ns.companies))
      AND
      -- Employment type filter
      (array_length(ns.employment_types, 1) IS NULL OR job_row.employment_type = ANY(ns.employment_types))
      AND
      -- Keyword filter (search in title and description)
      (array_length(ns.keywords, 1) IS NULL OR 
       EXISTS (
         SELECT 1 FROM unnest(ns.keywords) AS keyword
         WHERE job_row.title ILIKE '%' || keyword || '%' 
            OR job_row.description ILIKE '%' || keyword || '%'
       ))
      AND
      -- Salary filter (if salary_range is parseable)
      (ns.salary_min IS NULL OR 
       CASE 
         WHEN job_row.salary_range IS NOT NULL AND job_row.salary_range ~ '\$[0-9,]+'
         THEN (regexp_replace(split_part(job_row.salary_range, '-', 1), '[^0-9]', '', 'g'))::INTEGER >= ns.salary_min
         ELSE true
       END)
    );
END;
$$ LANGUAGE plpgsql;

-- View for subscription summary
CREATE OR REPLACE VIEW subscription_summary AS
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(*) FILTER (WHERE verified = true) as verified_subscriptions,
  COUNT(*) FILTER (WHERE is_active = true) as active_subscriptions,
  COUNT(*) FILTER (WHERE subscription_type = 'email') as email_subscriptions,
  COUNT(*) FILTER (WHERE subscription_type = 'sms') as sms_subscriptions,
  COUNT(*) FILTER (WHERE subscription_type = 'both') as both_subscriptions,
  COUNT(*) FILTER (WHERE frequency = 'immediate') as immediate_subscriptions,
  COUNT(*) FILTER (WHERE frequency = 'daily') as daily_subscriptions,
  COUNT(*) FILTER (WHERE frequency = 'weekly') as weekly_subscriptions,
  COUNT(*) FILTER (WHERE subscription_tier = 'premium') as premium_subscriptions
FROM notification_subscriptions;