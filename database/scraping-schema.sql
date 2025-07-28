-- Additional tables for the scraping system
-- Run these commands in your Supabase SQL editor

-- Update the existing jobs table to support scraping features
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS source_platform TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_platforms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS content_hash TEXT,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE;

-- Create index for external_id lookups
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(external_id);
CREATE INDEX IF NOT EXISTS idx_jobs_content_hash ON jobs(content_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_last_seen ON jobs(last_seen);
CREATE INDEX IF NOT EXISTS idx_jobs_source_platform ON jobs(source_platform);

-- Scraping statistics table
CREATE TABLE IF NOT EXISTS scraping_stats (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  jobs_found INTEGER DEFAULT 0,
  jobs_processed INTEGER DEFAULT 0,
  jobs_added INTEGER DEFAULT 0,
  jobs_updated INTEGER DEFAULT 0,
  duplicates_found INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  execution_time INTEGER DEFAULT 0, -- in milliseconds
  last_run TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, DATE(last_run))
);

-- Create index for scraping stats
CREATE INDEX IF NOT EXISTS idx_scraping_stats_platform ON scraping_stats(platform);
CREATE INDEX IF NOT EXISTS idx_scraping_stats_last_run ON scraping_stats(last_run);

-- Duplicate review log table for manual review of potential duplicates
CREATE TABLE IF NOT EXISTS duplicate_review_log (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  scraped_job_data JSONB NOT NULL,
  potential_duplicate_id INTEGER REFERENCES jobs(id),
  similarity_score DECIMAL(3,2),
  match_fields TEXT[] DEFAULT '{}',
  reasons TEXT[] DEFAULT '{}',
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  action_taken TEXT, -- 'duplicate', 'not_duplicate', 'merge', etc.
  notes TEXT
);

-- Create index for duplicate review log
CREATE INDEX IF NOT EXISTS idx_duplicate_review_platform ON duplicate_review_log(platform);
CREATE INDEX IF NOT EXISTS idx_duplicate_review_reviewed ON duplicate_review_log(reviewed);
CREATE INDEX IF NOT EXISTS idx_duplicate_review_logged_at ON duplicate_review_log(logged_at);

-- Scraping configuration table (for dynamic configuration)
CREATE TABLE IF NOT EXISTS scraping_config (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT TRUE,
  config JSONB NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Insert default configurations
INSERT INTO scraping_config (platform, enabled, config) VALUES
('indeed', true, '{
  "max_pages": 5,
  "delay_between_requests": 2000,
  "date_range": "week",
  "sectors": ["mining", "oil_gas", "forestry", "renewable", "utilities"]
}'),
('jobbank', true, '{
  "max_pages": 3,
  "delay_between_requests": 3000,
  "date_range": "week",
  "sectors": ["mining", "oil_gas", "forestry", "renewable", "utilities"]
}')
ON CONFLICT (platform) DO NOTHING;

-- Job scraping history table (for tracking job lifecycle)
CREATE TABLE IF NOT EXISTS job_scraping_history (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id),
  platform TEXT NOT NULL,
  action TEXT NOT NULL, -- 'found', 'updated', 'disappeared', 'reappeared'
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  job_data_snapshot JSONB,
  notes TEXT
);

-- Create index for job scraping history
CREATE INDEX IF NOT EXISTS idx_job_scraping_history_job_id ON job_scraping_history(job_id);
CREATE INDEX IF NOT EXISTS idx_job_scraping_history_platform ON job_scraping_history(platform);
CREATE INDEX IF NOT EXISTS idx_job_scraping_history_scraped_at ON job_scraping_history(scraped_at);

-- Create RLS (Row Level Security) policies
ALTER TABLE scraping_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_review_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_scraping_history ENABLE ROW LEVEL SECURITY;

-- Allow read access to scraping stats for authenticated users
CREATE POLICY "Allow read access to scraping stats" ON scraping_stats
  FOR SELECT USING (true);

-- Allow read access to duplicate review log for authenticated users  
CREATE POLICY "Allow read access to duplicate review log" ON duplicate_review_log
  FOR SELECT USING (true);

-- Allow read access to scraping config for authenticated users
CREATE POLICY "Allow read access to scraping config" ON scraping_config
  FOR SELECT USING (true);

-- Allow read access to job scraping history for authenticated users
CREATE POLICY "Allow read access to job scraping history" ON job_scraping_history
  FOR SELECT USING (true);

-- Function to automatically update last_seen when a job is found again
CREATE OR REPLACE FUNCTION update_job_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_seen on job updates
CREATE TRIGGER trigger_update_job_last_seen
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_job_last_seen();

-- View for job statistics by sector
CREATE OR REPLACE VIEW job_stats_by_sector AS
SELECT 
  sector,
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE is_active = true) as active_jobs,
  COUNT(*) FILTER (WHERE posted_date >= NOW() - INTERVAL '7 days') as jobs_this_week,
  COUNT(*) FILTER (WHERE posted_date >= NOW() - INTERVAL '1 day') as jobs_today,
  AVG(EXTRACT(EPOCH FROM (NOW() - posted_date::timestamp))/86400) as avg_age_days
FROM jobs
GROUP BY sector
ORDER BY active_jobs DESC;

-- View for scraping performance metrics
CREATE OR REPLACE VIEW scraping_performance AS
SELECT 
  platform,
  DATE(last_run) as scrape_date,
  SUM(jobs_found) as total_found,
  SUM(jobs_added) as total_added,
  SUM(jobs_updated) as total_updated,
  SUM(duplicates_found) as total_duplicates,
  SUM(errors) as total_errors,
  AVG(execution_time) as avg_execution_time,
  COUNT(*) as scrape_runs
FROM scraping_stats
WHERE last_run >= NOW() - INTERVAL '30 days'
GROUP BY platform, DATE(last_run)
ORDER BY scrape_date DESC, platform;