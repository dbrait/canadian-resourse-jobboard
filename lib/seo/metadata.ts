import { Metadata } from 'next'

export const siteConfig = {
  name: 'Resource Careers Canada',
  description: 'Find your next career in Canada\'s natural resource industries. Explore jobs in mining, oil & gas, forestry, renewable energy, and utilities across all provinces.',
  url: 'https://resourcecareers.ca',
  ogImage: 'https://resourcecareers.ca/og-image.jpg',
  creator: '@resourcecareers',
  keywords: [
    'canadian jobs',
    'natural resource jobs',
    'mining jobs canada',
    'oil gas jobs',
    'forestry careers',
    'renewable energy jobs',
    'utilities jobs',
    'resource sector employment',
    'canadian career opportunities',
    'natural resource careers'
  ]
}

export function generateMetadata({
  title,
  description,
  image,
  keywords = [],
  noIndex = false,
  canonical,
}: {
  title?: string
  description?: string
  image?: string
  keywords?: string[]
  noIndex?: boolean
  canonical?: string
}): Metadata {
  const seoTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const seoDescription = description || siteConfig.description
  const seoImage = image || siteConfig.ogImage
  const allKeywords = [...siteConfig.keywords, ...keywords]

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: allKeywords.join(', '),
    authors: [{ name: 'Resource Careers Canada' }],
    creator: siteConfig.creator,
    publisher: siteConfig.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonical || siteConfig.url,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
      locale: 'en_CA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [seoImage],
      creator: siteConfig.creator,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_ID,
      yandex: process.env.YANDEX_VERIFICATION_ID,
      yahoo: process.env.YAHOO_VERIFICATION_ID,
    },
  }
}

// Job-specific metadata generator
export function generateJobMetadata(job: {
  title: string
  company: string
  location: string
  sector: string
  employment_type: string
  salary_range?: string
  description: string
  posted_date: string
}): Metadata {
  const title = `${job.title} at ${job.company} - ${job.location}`
  const description = `${job.employment_type} ${job.title} position at ${job.company} in ${job.location}, ${job.sector} sector. ${job.salary_range ? `Salary: ${job.salary_range}. ` : ''}Apply now on Resource Careers Canada.`
  
  const keywords = [
    job.title.toLowerCase(),
    job.company.toLowerCase(),
    job.location.toLowerCase(),
    job.sector,
    job.employment_type.toLowerCase(),
    'job',
    'career',
    'employment',
    'canada'
  ]

  return generateMetadata({
    title,
    description,
    keywords,
    canonical: `${siteConfig.url}/jobs/${job.title.toLowerCase().replace(/\s+/g, '-')}-${job.company.toLowerCase().replace(/\s+/g, '-')}`
  })
}

// Location-specific metadata generator
export function generateLocationMetadata(location: string, jobCount: number): Metadata {
  const title = `${location} Jobs in Natural Resources`
  const description = `Find ${jobCount} natural resource jobs in ${location}. Browse mining, oil & gas, forestry, renewable energy, and utilities careers in ${location}, Canada.`
  
  const keywords = [
    `${location.toLowerCase()} jobs`,
    `natural resource jobs ${location.toLowerCase()}`,
    `mining jobs ${location.toLowerCase()}`,
    `energy jobs ${location.toLowerCase()}`,
    'canadian resource careers'
  ]

  return generateMetadata({
    title,
    description,
    keywords,
    canonical: `${siteConfig.url}/locations/${location.toLowerCase().replace(/\s+/g, '-')}`
  })
}

// Sector-specific metadata generator
export function generateSectorMetadata(sector: string, jobCount: number): Metadata {
  const sectorNames: Record<string, string> = {
    mining: 'Mining',
    oil_gas: 'Oil & Gas',
    forestry: 'Forestry',
    renewable: 'Renewable Energy',
    utilities: 'Utilities',
    general: 'General Natural Resources'
  }

  const sectorName = sectorNames[sector] || sector
  const title = `${sectorName} Jobs in Canada`
  const description = `Discover ${jobCount} ${sectorName.toLowerCase()} jobs across Canada. Find your next career opportunity in the ${sectorName.toLowerCase()} sector with Resource Careers Canada.`
  
  const keywords = [
    `${sectorName.toLowerCase()} jobs`,
    `${sectorName.toLowerCase()} careers`,
    `canadian ${sectorName.toLowerCase()}`,
    'natural resource jobs',
    'resource sector employment'
  ]

  return generateMetadata({
    title,
    description,
    keywords,
    canonical: `${siteConfig.url}/sectors/${sector}`
  })
}