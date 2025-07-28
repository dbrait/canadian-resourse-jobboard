-- Fix database permissions for job scraping
-- Copy and paste this into your Supabase SQL Editor

-- Option 1: Allow public inserts for job scraping (recommended for job board)
CREATE POLICY "Allow public job insertions" ON jobs
  FOR INSERT
  WITH CHECK (true);

-- Option 2: If you want to be more restrictive, allow inserts only for specific columns
-- CREATE POLICY "Allow scraping job insertions" ON jobs
--   FOR INSERT
--   WITH CHECK (
--     source_platform IS NOT NULL OR 
--     title IS NOT NULL
--   );

-- Option 3: Temporarily disable RLS (less secure but simpler)
-- ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- Test the fix
INSERT INTO jobs (
  title, 
  company, 
  location, 
  province, 
  sector, 
  employment_type, 
  description, 
  posted_date, 
  is_active, 
  created_at
) VALUES (
  'Test Job - RLS Fix', 
  'Test Company', 
  'Toronto, Ontario', 
  'Ontario', 
  'technology', 
  'Full-time', 
  'Test job to verify RLS permissions are working', 
  CURRENT_DATE, 
  true, 
  NOW()
);

-- Clean up test job
DELETE FROM jobs WHERE title = 'Test Job - RLS Fix';

-- Show success message
SELECT 'Database permissions fixed! Ready for job scraping.' as message;