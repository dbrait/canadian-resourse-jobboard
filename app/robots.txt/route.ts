import { NextResponse } from 'next/server'

export async function GET() {
  const robotsTxt = `
User-agent: *
Allow: /

# Sitemap
Sitemap: https://resourcecareers.ca/sitemap.xml

# Specific crawl directives
Allow: /jobs/*
Allow: /sectors/*
Allow: /locations/*
Allow: /notifications

# Block sensitive or admin pages
Disallow: /api/*
Disallow: /admin/*
Disallow: /_next/*
Disallow: /notifications/verify*
Disallow: /notifications/unsubscribe*

# Crawl delay (optional)
Crawl-delay: 1

# Cache directive
Cache-Control: public, max-age=86400
`.trim()

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}