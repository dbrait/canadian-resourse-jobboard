-- Authors Table (for E-A-T) - Created first since blog_posts references it
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  expertise TEXT[], -- Areas of expertise
  credentials TEXT, -- Professional credentials
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  parent_id INTEGER REFERENCES blog_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts Table - Created after authors table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT, -- For SEO, max 60 chars
  meta_description TEXT, -- For SEO, max 160 chars
  excerpt TEXT, -- Short summary for listing pages
  content TEXT NOT NULL, -- Main article content in Markdown
  featured_image TEXT, -- URL to hero image
  featured_image_alt TEXT, -- Alt text for accessibility and SEO
  
  -- SEO Fields
  canonical_url TEXT,
  keywords TEXT[], -- Array of target keywords
  
  -- Categorization
  category TEXT NOT NULL CHECK (category IN ('insights', 'guides', 'trends', 'news', 'analysis')),
  tags TEXT[], -- Array of tags
  
  -- Author Information
  author_id INTEGER REFERENCES authors(id),
  
  -- Publishing
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Related Content
  related_job_sectors TEXT[], -- Link to relevant job sectors
  related_posts INTEGER[] -- Array of related post IDs
);

-- Indexes for performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX idx_blog_posts_keywords ON blog_posts USING GIN(keywords);

-- Insert default categories
INSERT INTO blog_categories (slug, name, description, meta_title, meta_description) VALUES
('insights', 'Industry Insights', 'Deep analysis of Canadian natural resource industry trends and developments', 'Natural Resource Industry Insights | Resource Careers Canada', 'Expert insights and analysis on mining, oil & gas, forestry, and renewable energy trends in Canada'),
('guides', 'Career Guides', 'Comprehensive guides for careers in natural resources', 'Career Guides for Natural Resource Jobs | Resource Careers Canada', 'Complete career guides for mining engineers, geologists, forestry technicians, and other resource sector professionals'),
('trends', 'Job Market Trends', 'Latest job market trends and salary data for resource sectors', 'Resource Sector Job Market Trends | Resource Careers Canada', 'Current job market trends, salary data, and employment forecasts for Canadian natural resource industries'),
('news', 'Industry News', 'Breaking news and updates from Canadian resource sectors', 'Natural Resource Industry News | Resource Careers Canada', 'Latest news and updates from mining, oil & gas, forestry, and renewable energy sectors in Canada'),
('analysis', 'Market Analysis', 'In-depth market analysis and forecasts', 'Resource Sector Market Analysis | Resource Careers Canada', 'Expert market analysis and forecasts for Canadian natural resource industries')
ON CONFLICT (slug) DO NOTHING;

-- Insert default author
INSERT INTO authors (slug, name, bio, expertise) VALUES
('admin', 'Resource Careers Team', 'Expert team providing insights into Canadian natural resource careers', ARRAY['Mining', 'Oil & Gas', 'Forestry', 'Renewable Energy'])
ON CONFLICT (slug) DO NOTHING;