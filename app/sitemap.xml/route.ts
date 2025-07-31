import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all active jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, company, posted_date, sector, province')
      .eq('is_active', true)
      .order('posted_date', { ascending: false })

    // Get unique sectors and provinces
    const sectors = [...new Set(jobs?.map(job => job.sector) || [])]
    const provinces = [...new Set(jobs?.map(job => job.province) || [])]

    const baseUrl = 'https://resourcecareers.ca'
    const now = new Date().toISOString()

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}/jobs</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/notifications</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/sectors</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/locations</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Sector pages -->
  ${sectors.map(sector => `
  <url>
    <loc>${baseUrl}/sectors/${sector}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  
  <!-- Location pages -->
  ${provinces.map(province => `
  <url>
    <loc>${baseUrl}/locations/${province.toLowerCase().replace(/\s+/g, '-')}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  
  <!-- Individual job pages -->
  ${(jobs || []).map(job => {
    const slug = `${job.id}-${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${job.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    const lastmod = new Date(job.posted_date).toISOString()
    
    return `
  <url>
    <loc>${baseUrl}/jobs/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  }).join('')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return basic sitemap if there's an error
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://resourcecareers.ca</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    return new NextResponse(basicSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }
}