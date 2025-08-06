export interface BlogPost {
  id: number
  slug: string
  title: string
  meta_title?: string
  meta_description?: string
  excerpt: string
  content: string
  featured_image?: string
  featured_image_alt?: string
  
  // SEO
  canonical_url?: string
  keywords?: string[]
  
  // Categorization
  category: 'insights' | 'guides' | 'trends' | 'news' | 'analysis'
  tags?: string[]
  
  // Author
  author_id?: number
  author?: Author
  
  // Publishing
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  updated_at: string
  created_at: string
  
  // Engagement
  view_count?: number
  share_count?: number
  
  // Related Content
  related_job_sectors?: string[]
  related_posts?: number[]
}

export interface Author {
  id: number
  slug: string
  name: string
  bio?: string
  avatar_url?: string
  linkedin_url?: string
  twitter_handle?: string
  expertise?: string[]
  credentials?: string
}

export interface BlogCategory {
  id: number
  slug: string
  name: string
  description?: string
  meta_title?: string
  meta_description?: string
  parent_id?: number
}

// For generating Table of Contents
export interface TableOfContentsItem {
  id: string
  text: string
  level: number
  children?: TableOfContentsItem[]
}

// For breadcrumbs
export interface Breadcrumb {
  name: string
  url: string
}