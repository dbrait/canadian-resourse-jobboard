-- Complete database setup for Resource Careers Canada
-- Run this in your Supabase SQL Editor

-- Create the main jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  province TEXT NOT NULL,
  sector TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  salary_range TEXT,
  description TEXT NOT NULL,
  requirements TEXT,
  posted_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  application_url TEXT,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Scraping-specific columns
  source_platform TEXT,
  source_url TEXT,
  source_platforms TEXT[] DEFAULT '{}',
  external_id TEXT,
  content_hash TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deactivated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_sector ON jobs(sector);
CREATE INDEX IF NOT EXISTS idx_jobs_province ON jobs(province);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
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
  execution_time INTEGER DEFAULT 0,
  last_run TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, DATE(last_run))
);

-- Create indexes for scraping stats
CREATE INDEX IF NOT EXISTS idx_scraping_stats_platform ON scraping_stats(platform);
CREATE INDEX IF NOT EXISTS idx_scraping_stats_last_run ON scraping_stats(last_run);

-- Insert some sample jobs to get started
INSERT INTO jobs (title, company, location, province, sector, employment_type, description, posted_date, is_active) VALUES
('Mining Engineer', 'Northern Resources Inc.', 'Yellowknife', 'Northwest Territories', 'mining', 'Full-time', 'Seeking experienced mining engineer for gold mining operations in Northern Canada. Must have 3+ years experience in underground mining.', NOW() - INTERVAL '2 days', true),
('Oil & Gas Technician', 'Alberta Energy Corp', 'Calgary', 'Alberta', 'oil_gas', 'Full-time', 'Equipment maintenance and operations for oil sands facility. Competitive salary and benefits package.', NOW() - INTERVAL '1 day', true),
('Forest Operations Manager', 'Pacific Forestry Ltd', 'Vancouver', 'British Columbia', 'forestry', 'Full-time', 'Oversee sustainable forest harvesting operations. Degree in forestry or related field required.', NOW() - INTERVAL '3 days', true),
('Wind Turbine Technician', 'Green Power Solutions', 'Regina', 'Saskatchewan', 'renewable', 'Full-time', 'Install and maintain wind turbine systems. Will train the right candidate. Travel required.', NOW() - INTERVAL '1 day', true),
('Utility Lineworker', 'Manitoba Hydro', 'Winnipeg', 'Manitoba', 'utilities', 'Full-time', 'Electrical power line construction and maintenance. Must be comfortable working at heights.', NOW() - INTERVAL '4 days', true),
('Environmental Consultant', 'EcoNorth Consulting', 'Halifax', 'Nova Scotia', 'general', 'Contract', 'Environmental impact assessments for resource projects. Environmental science degree required.', NOW() - INTERVAL '5 days', true),
('Heavy Equipment Operator', 'Timmins Mining Co.', 'Timmins', 'Ontario', 'mining', 'Full-time', 'Operate excavators and haul trucks in open pit mining operation. Valid heavy equipment certification required.', NOW() - INTERVAL '3 days', true),
('Pipeline Inspector', 'TransCanada Energy', 'Edmonton', 'Alberta', 'oil_gas', 'Contract', 'Quality control and safety inspection of pipeline construction. NDT certification preferred.', NOW() - INTERVAL '2 days', true),
('Lumber Mill Supervisor', 'Atlantic Wood Products', 'Fredericton', 'New Brunswick', 'forestry', 'Full-time', 'Supervise sawmill operations and ensure production targets are met. Management experience required.', NOW() - INTERVAL '6 days', true),
('Solar Panel Installer', 'SunTech Canada', 'Toronto', 'Ontario', 'renewable', 'Full-time', 'Residential and commercial solar panel installation. Will provide training. Must be comfortable on rooftops.', NOW() - INTERVAL '1 day', true);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to active jobs" ON jobs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to scraping stats" ON scraping_stats
  FOR SELECT USING (true);

-- Create view for job statistics by sector
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