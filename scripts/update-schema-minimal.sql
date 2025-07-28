-- Minimal database schema update for job scraping
-- Copy and paste this into your Supabase SQL Editor

-- Add the essential columns to the existing jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS source_platform TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(external_id);
CREATE INDEX IF NOT EXISTS idx_jobs_source_platform ON jobs(source_platform);
CREATE INDEX IF NOT EXISTS idx_jobs_last_seen ON jobs(last_seen);

-- Simple scraping stats table
CREATE TABLE IF NOT EXISTS scraping_stats (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  jobs_found INTEGER DEFAULT 0,
  jobs_processed INTEGER DEFAULT 0,
  last_run TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, DATE(last_run))
);

-- Test the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND column_name IN ('source_platform', 'source_url', 'external_id', 'last_seen');

-- Show current job count
SELECT COUNT(*) as current_jobs FROM jobs;

-- Success message
SELECT 'Database schema updated successfully for job scraping!' as message;