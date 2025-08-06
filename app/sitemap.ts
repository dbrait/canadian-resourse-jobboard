import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey.trim())

  const baseUrl = 'https://resourcecareers.ca'

  // Get all published blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  // Get all authors
  const { data: authors } = await supabase
    .from('authors')
    .select('slug')

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/notifications`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Sector pages
  const sectors = ['mining', 'oil_gas', 'forestry', 'renewable', 'utilities']
  const sectorPages: MetadataRoute.Sitemap = sectors.map(sector => ({
    url: `${baseUrl}/sectors/${sector}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Blog category pages
  const blogCategories = ['insights', 'guides', 'trends', 'news', 'analysis']
  const categoryPages: MetadataRoute.Sitemap = blogCategories.map(category => ({
    url: `${baseUrl}/blog/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = posts?.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  })) || []

  // Author pages
  const authorPages: MetadataRoute.Sitemap = authors?.map(author => ({
    url: `${baseUrl}/blog/author/${author.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  })) || []

  return [
    ...staticPages,
    ...sectorPages,
    ...categoryPages,
    ...blogPages,
    ...authorPages,
  ]
}