import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://resourcesjobs.ca';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/industries`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Industry pages
  const industries = [
    'mining',
    'oil_gas',
    'forestry',
    'fishing',
    'agriculture',
    'renewable_energy',
    'environmental',
  ];

  const industryPages: MetadataRoute.Sitemap = industries.map((industry) => ({
    url: `${baseUrl}/industries/${industry}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Fetch dynamic job and company data for sitemap
  let jobPages: MetadataRoute.Sitemap = [];
  let companyPages: MetadataRoute.Sitemap = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    // Fetch recent jobs for sitemap (limit to 1000 most recent)
    const jobsResponse = await fetch(`${apiUrl}/jobs?limit=1000`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      jobPages = (jobsData.jobs || []).map((job: { id: string; posted_at: string }) => ({
        url: `${baseUrl}/jobs/${job.id}`,
        lastModified: new Date(job.posted_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }

    // Fetch companies for sitemap
    const companiesResponse = await fetch(`${apiUrl}/companies`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (companiesResponse.ok) {
      const companies = await companiesResponse.json();
      companyPages = companies.map((company: { slug: string }) => ({
        url: `${baseUrl}/companies/${company.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching sitemap data:', error);
  }

  return [...staticPages, ...industryPages, ...jobPages, ...companyPages];
}
