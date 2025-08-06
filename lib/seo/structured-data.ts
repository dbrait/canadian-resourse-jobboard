import { Job } from '@/types/job'

// Article Schema for blog posts
export function generateArticleSchema(
  title: string,
  description: string,
  author: string,
  publishedDate: string,
  modifiedDate: string,
  image?: string,
  url?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author
    },
    "datePublished": publishedDate,
    "dateModified": modifiedDate,
    "publisher": {
      "@type": "Organization",
      "name": "Resource Careers Canada",
      "logo": {
        "@type": "ImageObject",
        "url": "https://resourcecareers.ca/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url || "https://resourcecareers.ca/blog"
    },
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image
      }
    })
  }
}

// Organization Schema for the site
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Resource Careers Canada",
    "url": "https://resourcecareers.ca",
    "logo": "https://resourcecareers.ca/logo.png",
    "description": "Canada's premier job board for natural resource careers including mining, oil & gas, forestry, renewable energy, and utilities.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-RESOURCE",
      "contactType": "customer service",
      "availableLanguage": ["English", "French"]
    },
    "sameAs": [
      "https://twitter.com/resourcecareers",
      "https://linkedin.com/company/resource-careers-canada"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CA"
    }
  }
}

// WebSite Schema with search functionality
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Resource Careers Canada",
    "url": "https://resourcecareers.ca",
    "description": "Find your next career in Canada's natural resource industries",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://resourcecareers.ca/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
}

// JobPosting Schema for individual jobs
export function generateJobPostingSchema(job: Job) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "Resource Careers Canada",
      "value": job.id.toString()
    },
    "datePosted": job.posted_date,
    "validThrough": new Date(new Date(job.posted_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from posting
    "employmentType": job.employment_type.toUpperCase().replace('-', '_'),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
      "sameAs": job.application_url || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location.split(',')[0],
        "addressRegion": job.province,
        "addressCountry": "CA"
      }
    },
    "baseSalary": job.salary_range ? {
      "@type": "MonetaryAmount",
      "currency": "CAD",
      "value": {
        "@type": "QuantitativeValue",
        "value": extractSalaryFromRange(job.salary_range),
        "unitText": "YEAR"
      }
    } : undefined,
    "industry": mapSectorToIndustry(job.sector),
    "qualifications": job.requirements || undefined,
    "applicationContact": job.contact_email ? {
      "@type": "ContactPoint",
      "email": job.contact_email
    } : undefined,
    "url": `https://resourcecareers.ca/jobs/${generateJobSlug(job)}`,
    "jobBenefits": extractBenefitsFromDescription(job.description)
  }
}

// BreadcrumbList Schema for navigation
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

// FAQ Schema for common questions
export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What types of jobs are available on Resource Careers Canada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We feature jobs across Canada's natural resource sectors including mining, oil & gas, forestry, renewable energy, utilities, and environmental services. Positions range from entry-level to executive roles."
        }
      },
      {
        "@type": "Question",
        "name": "How do I apply for jobs on Resource Careers Canada?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Each job listing includes application instructions. You can apply directly through the employer's website or contact information provided in the job posting."
        }
      },
      {
        "@type": "Question",
        "name": "Are the jobs on Resource Careers Canada legitimate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all jobs are sourced from verified employers and major job boards. We regularly update and verify job postings to ensure they are current and legitimate."
        }
      },
      {
        "@type": "Question",
        "name": "Can I set up job alerts for specific types of positions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can create custom job alerts based on location, sector, job type, keywords, and salary range. You'll receive notifications when matching jobs are posted."
        }
      }
    ]
  }
}

// CollectionPage Schema for job listings
export function generateCollectionPageSchema(
  title: string,
  description: string,
  jobs: Job[],
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": url,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": jobs.length,
      "itemListElement": jobs.slice(0, 10).map((job, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "JobPosting",
          "title": job.title,
          "hiringOrganization": {
            "@type": "Organization",
            "name": job.company
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": job.location.split(',')[0],
              "addressRegion": job.province,
              "addressCountry": "CA"
            }
          },
          "url": `https://resourcecareers.ca/jobs/${generateJobSlug(job)}`
        }
      }))
    }
  }
}

// Helper functions
function extractSalaryFromRange(salaryRange: string): number {
  const match = salaryRange.match(/\$?([\d,]+)/)
  return match ? parseInt(match[1].replace(/,/g, '')) : 0
}

function mapSectorToIndustry(sector: string): string {
  const mapping: Record<string, string> = {
    'mining': 'Mining',
    'oil_gas': 'Oil and Gas Extraction',
    'forestry': 'Forestry and Logging',
    'renewable': 'Renewable Energy',
    'utilities': 'Utilities',
    'general': 'Natural Resources'
  }
  return mapping[sector] || 'Natural Resources'
}

function generateJobSlug(job: Job): string {
  return `${job.id}-${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${job.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

function extractBenefitsFromDescription(description: string): string[] {
  const benefits: string[] = []
  const commonBenefits = [
    'health insurance',
    'dental',
    'vision',
    'retirement',
    '401k',
    'pension',
    'vacation',
    'paid time off',
    'flexible schedule',
    'remote work',
    'training',
    'education',
    'bonus'
  ]

  const descLower = description.toLowerCase()
  commonBenefits.forEach(benefit => {
    if (descLower.includes(benefit)) {
      benefits.push(benefit)
    }
  })

  return benefits
}