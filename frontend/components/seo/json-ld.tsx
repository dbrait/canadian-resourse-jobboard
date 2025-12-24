interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Job Posting Schema
export interface JobPostingData {
  title: string;
  description: string;
  company: string;
  location: string;
  province?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: string;
  postedAt: string;
  expiresAt?: string;
  isRemote?: boolean;
  sourceUrl?: string;
}

export function generateJobPostingSchema(job: JobPostingData) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.postedAt,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location.split(',')[0]?.trim(),
        addressRegion: job.province || job.location.split(',')[1]?.trim(),
        addressCountry: 'CA',
      },
    },
    employmentType: mapJobType(job.jobType),
  };

  if (job.salaryMin || job.salaryMax) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'CAD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: 'YEAR',
      },
    };
  }

  if (job.expiresAt) {
    schema.validThrough = job.expiresAt;
  }

  if (job.isRemote) {
    schema.jobLocationType = 'TELECOMMUTE';
  }

  if (job.sourceUrl) {
    schema.url = job.sourceUrl;
  }

  return schema;
}

function mapJobType(jobType: string): string {
  const mapping: Record<string, string> = {
    full_time: 'FULL_TIME',
    part_time: 'PART_TIME',
    contract: 'CONTRACTOR',
    temporary: 'TEMPORARY',
    internship: 'INTERN',
  };
  return mapping[jobType] || 'FULL_TIME';
}

// Organization Schema
export interface OrganizationData {
  name: string;
  description: string;
  url?: string;
  logo?: string;
  industry?: string;
  location?: string;
}

export function generateOrganizationSchema(org: OrganizationData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    description: org.description,
    url: org.url,
    logo: org.logo,
    industry: org.industry,
    address: org.location
      ? {
          '@type': 'PostalAddress',
          addressCountry: 'CA',
          addressLocality: org.location,
        }
      : undefined,
  };
}

// Breadcrumb Schema
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Website Schema (for homepage)
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ResourcesJobs.ca',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://resourcesjobs.ca',
    description:
      'Find jobs in Canada\'s natural resources sector: Mining, Oil & Gas, Forestry, Fishing, Agriculture, Renewable Energy, and Environmental.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://resourcesjobs.ca'}/jobs?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Job Search Schema (for job listing pages)
export interface JobSearchData {
  query?: string;
  industry?: string;
  location?: string;
  totalResults: number;
}

export function generateJobSearchSchema(data: JobSearchData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [],
    numberOfItems: data.totalResults,
    name: data.query
      ? `${data.query} Jobs`
      : data.industry
        ? `${data.industry} Jobs`
        : 'All Jobs',
    description: `${data.totalResults} job listings found`,
  };
}
