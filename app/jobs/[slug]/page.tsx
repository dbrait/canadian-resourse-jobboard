import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Job } from '@/types/job'
import { generateJobMetadata, siteConfig } from '@/lib/seo/metadata'
import { generateJobPostingSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

// Extract job ID from slug (format: id-title-company)
function extractJobIdFromSlug(slug: string): number {
  const parts = slug.split('-')
  const id = parseInt(parts[0])
  return isNaN(id) ? 0 : id
}

async function getJob(slug: string): Promise<Job | null> {
  const jobId = extractJobIdFromSlug(slug)
  
  if (!jobId) {
    return null
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function getRelatedJobs(job: Job): Promise<Job[]> {
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .or(`sector.eq.${job.sector},company.eq.${job.company},province.eq.${job.province}`)
    .neq('id', job.id)
    .limit(6)

  return data || []
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const job = await getJob(slug)
  
  if (!job) {
    return {
      title: 'Job Not Found',
      description: 'The job you are looking for could not be found.'
    }
  }

  return generateJobMetadata(job)
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params
  const job = await getJob(slug)
  
  if (!job) {
    notFound()
  }

  const relatedJobs = await getRelatedJobs(job)
  
  const jobSchema = generateJobPostingSchema(job)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Jobs', url: `${siteConfig.url}/jobs` },
    { name: job.sector, url: `${siteConfig.url}/sectors/${job.sector}` },
    { name: job.title, url: `${siteConfig.url}/jobs/${slug}` }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href="/jobs" className="hover:text-blue-600">Jobs</Link>
              <span>/</span>
              <Link href={`/sectors/${job.sector}`} className="hover:text-blue-600 capitalize">
                {job.sector.replace('_', ' & ')}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{job.title}</span>
            </nav>
            
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{job.company}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{job.location}, {job.province}</span>
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center text-green-600 font-medium">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {job.sector.replace('_', ' & ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                    {job.employment_type}
                  </span>
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    Posted {new Date(job.posted_date).toLocaleDateString('en-CA')}
                  </span>
                </div>
              </div>
              
              <div className="ml-6">
                {job.application_url ? (
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center transition-colors"
                  >
                    Apply Now
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                ) : job.contact_email ? (
                  <a
                    href={`mailto:${job.contact_email}?subject=Application for ${job.title}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center transition-colors"
                  >
                    Apply via Email
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </a>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Contact information not available
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Job Description</h2>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {job.description}
                  </div>
                </div>

                {job.requirements && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {job.requirements}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Job ID: {job.id} | Posted: {new Date(job.posted_date).toLocaleDateString('en-CA')}
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => navigator.share?.({ 
                          title: job.title, 
                          text: `${job.title} at ${job.company}`, 
                          url: window.location.href 
                        })}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Share Job
                      </button>
                      <Link
                        href="/notifications"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Get Similar Alerts
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Company</dt>
                    <dd className="text-sm text-gray-900">{job.company}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="text-sm text-gray-900">{job.location}, {job.province}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Sector</dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {job.sector.replace('_', ' & ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Employment Type</dt>
                    <dd className="text-sm text-gray-900">{job.employment_type}</dd>
                  </div>
                  {job.salary_range && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Salary Range</dt>
                      <dd className="text-sm text-gray-900 font-medium text-green-600">
                        {job.salary_range}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Posted Date</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(job.posted_date).toLocaleDateString('en-CA')}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Job Alert CTA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Get Similar Job Alerts
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Never miss opportunities like this. Set up personalized job alerts for 
                  {job.sector.replace('_', ' & ')} jobs in {job.province}.
                </p>
                <Link
                  href="/notifications"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Set Up Alerts
                </Link>
              </div>
            </div>
          </div>

          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Related Jobs</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedJobs.map((relatedJob) => {
                  const slug = `${relatedJob.id}-${relatedJob.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${relatedJob.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                  return (
                    <article key={relatedJob.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link 
                          href={`/jobs/${slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {relatedJob.title}
                        </Link>
                      </h3>
                      <p className="text-gray-700 font-medium mb-1">{relatedJob.company}</p>
                      <p className="text-gray-600 text-sm mb-3">{relatedJob.location}, {relatedJob.province}</p>
                      <div className="flex justify-between items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {relatedJob.sector}
                        </span>
                        <Link
                          href={`/jobs/${slug}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  )
}