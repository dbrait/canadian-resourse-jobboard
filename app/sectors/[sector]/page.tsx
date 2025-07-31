import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Job } from '@/types/job'
import { generateSectorMetadata, siteConfig } from '@/lib/seo/metadata'
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import Link from 'next/link'

interface Props {
  params: Promise<{ sector: string }>
}

const validSectors = ['mining', 'oil_gas', 'forestry', 'renewable', 'utilities', 'general']

const sectorNames: Record<string, string> = {
  'mining': 'Mining',
  'oil_gas': 'Oil & Gas',
  'forestry': 'Forestry',
  'renewable': 'Renewable Energy',
  'utilities': 'Utilities',
  'general': 'General Natural Resources'
}

const sectorDescriptions: Record<string, string> = {
  'mining': 'Explore career opportunities in Canada\'s mining industry. From exploration to extraction, find roles in gold, copper, uranium, diamond mining and more across all provinces.',
  'oil_gas': 'Discover oil and gas careers across Canada\'s energy sector. Find opportunities in upstream, midstream, and downstream operations from Alberta to offshore Newfoundland.',
  'forestry': 'Find forestry and lumber industry jobs across Canada\'s forests. Opportunities in logging, pulp and paper, wood products, and sustainable forest management.',
  'renewable': 'Join Canada\'s growing renewable energy sector. Find careers in wind, solar, hydroelectric, and clean technology across the country.',
  'utilities': 'Explore utility sector careers in electricity, water, and gas distribution. Find opportunities with Canada\'s major utility companies and infrastructure providers.',
  'general': 'Browse general natural resource opportunities across all sectors. Find diverse roles in environmental services, consulting, and resource management.'
}

async function getSectorJobs(sector: string): Promise<Job[]> {
  if (!validSectors.includes(sector)) {
    return []
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('sector', sector)
    .eq('is_active', true)
    .order('posted_date', { ascending: false })

  if (error) {
    console.error('Error fetching sector jobs:', error)
    return []
  }

  return data || []
}

async function getSectorStats(sector: string) {
  if (!validSectors.includes(sector)) {
    return { totalJobs: 0, locations: [], companies: [] }
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('location, province, company')
    .eq('sector', sector)
    .eq('is_active', true)

  const locations = [...new Set(jobs?.map(job => `${job.location}, ${job.province}`) || [])]
  const companies = [...new Set(jobs?.map(job => job.company) || [])]

  return {
    totalJobs: jobs?.length || 0,
    locations: locations.slice(0, 10), // Top 10 locations
    companies: companies.slice(0, 10) // Top 10 companies
  }
}

export async function generateMetadata({ params }: Props) {
  const { sector } = await params
  
  if (!validSectors.includes(sector)) {
    return {
      title: 'Sector Not Found',
      description: 'The sector you are looking for could not be found.'
    }
  }

  const stats = await getSectorStats(sector)
  return generateSectorMetadata(sector, stats.totalJobs)
}

function JobCard({ job }: { job: Job }) {
  const jobSlug = `${job.id}-${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${job.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  
  return (
    <article className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          <Link 
            href={`/jobs/${jobSlug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {job.title}
          </Link>
        </h3>
        {job.salary_range && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ml-2">
            {job.salary_range}
          </span>
        )}
      </div>
      
      <p className="text-gray-700 font-medium mb-2">{job.company}</p>
      <p className="text-gray-600 text-sm mb-3 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        {job.location}, {job.province}
      </p>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>
      
      <div className="flex justify-between items-center">
        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
          {job.employment_type}
        </span>
        {job.application_url ? (
          <a 
            href={job.application_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors inline-flex items-center"
          >
            Apply Now
            <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        ) : (
          <Link
            href={`/jobs/${jobSlug}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          Posted {new Date(job.posted_date).toLocaleDateString('en-CA')}
        </p>
      </div>
    </article>
  )
}

export default async function SectorPage({ params }: Props) {
  const { sector } = await params
  
  if (!validSectors.includes(sector)) {
    notFound()
  }

  const [jobs, stats] = await Promise.all([
    getSectorJobs(sector),
    getSectorStats(sector)
  ])

  const sectorName = sectorNames[sector]
  const sectorDescription = sectorDescriptions[sector]

  const collectionSchema = generateCollectionPageSchema(
    `${sectorName} Jobs in Canada`,
    sectorDescription,
    jobs,
    `${siteConfig.url}/sectors/${sector}`
  )

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Sectors', url: `${siteConfig.url}/sectors` },
    { name: sectorName, url: `${siteConfig.url}/sectors/${sector}` }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href="/sectors" className="hover:text-blue-600">Sectors</Link>
              <span>/</span>
              <span className="text-gray-900">{sectorName}</span>
            </nav>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {sectorName} Jobs in Canada
              </h1>
              <p className="text-xl text-gray-600 mb-6 max-w-4xl mx-auto">
                {sectorDescription}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {stats.totalJobs} Active Jobs
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  {stats.locations.length} Locations
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  {stats.companies.length} Companies
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 py-3 overflow-x-auto">
              {validSectors.map(sectorKey => (
                <Link 
                  key={sectorKey}
                  href={`/sectors/${sectorKey}`} 
                  className={`whitespace-nowrap transition-colors ${
                    sectorKey === sector 
                      ? 'text-blue-200 font-medium' 
                      : 'hover:text-blue-200'
                  }`}
                >
                  {sectorNames[sectorKey]}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Job Alert CTA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Get {sectorName} Job Alerts
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Be the first to know about new {sectorName.toLowerCase()} opportunities across Canada.
                </p>
                <Link
                  href={`/notifications?sector=${sector}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Set Up Alerts
                </Link>
              </div>

              {/* Top Locations */}
              {stats.locations.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
                  <ul className="space-y-2">
                    {stats.locations.map((location, index) => (
                      <li key={index} className="text-sm">
                        <Link 
                          href={`/search?sector=${sector}&location=${encodeURIComponent(location)}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {location}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Top Companies */}
              {stats.companies.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Employers</h3>
                  <ul className="space-y-2">
                    {stats.companies.map((company, index) => (
                      <li key={index} className="text-sm">
                        <Link 
                          href={`/search?sector=${sector}&company=${encodeURIComponent(company)}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {company}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Available Positions
                  </h2>
                  <p className="text-gray-600">{jobs.length} {sectorName.toLowerCase()} jobs</p>
                </div>
                <div className="flex space-x-4">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Sort by Date</option>
                    <option>Sort by Relevance</option>
                    <option>Sort by Salary</option>
                  </select>
                </div>
              </div>

              {jobs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255a23.931 23.931 0 01-1.787 4.654c-.395.714-.948 1.29-1.634 1.635a3.989 3.989 0 01-2.456.256c-.744-.127-1.49-.394-2.21-.816a15.923 15.923 0 01-2.346-1.506 11.96 11.96 0 01-1.964-2.09A9.868 9.868 0 017.5 12c0-5.523 4.477-10 10-10s10 4.477 10 10a9.95 9.95 0 01-.5 3.255z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {sectorName.toLowerCase()} jobs available
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Check back soon for new opportunities or set up job alerts to be notified when new positions are posted.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Link
                      href="/notifications"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Get Job Alerts
                    </Link>
                    <Link
                      href="/jobs"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                    >
                      View All Jobs
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}