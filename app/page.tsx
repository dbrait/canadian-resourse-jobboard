'use client'

import { Suspense, useEffect, useState } from 'react'
import { Job } from '../types/job'
import { generateCollectionPageSchema } from '@/lib/seo/structured-data'
import Link from 'next/link'

interface JobStats {
  totalJobs: number
  sectors: Record<string, number>
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
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ml-2">
          {job.sector}
        </span>
      </div>
      
      <p className="text-gray-700 font-medium mb-2">{job.company}</p>
      <p className="text-gray-600 text-sm mb-2 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        {job.location}, {job.province}
      </p>
      
      {job.salary_range && (
        <p className="text-green-600 font-medium text-sm mb-3 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
          {job.salary_range}
        </p>
      )}
      
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

function SectorStats({ sectors }: { sectors: Record<string, number> }) {
  const sectorNames: Record<string, string> = {
    'mining': 'Mining',
    'oil_gas': 'Oil & Gas',
    'forestry': 'Forestry',
    'renewable': 'Renewable Energy',
    'utilities': 'Utilities',
    'general': 'General'
  }

  return (
    <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Jobs by Sector</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(sectors).map(([sector, count]) => (
          <Link
            key={sector}
            href={`/sectors/${sector}`}
            className="text-center p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <div className="text-2xl font-bold text-blue-600">{count}</div>
            <div className="text-sm text-gray-600">{sectorNames[sector] || sector}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<JobStats>({ totalJobs: 0, sectors: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch jobs
        const jobsResponse = await fetch('/api/jobs?limit=50')
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          setJobs(Array.isArray(jobsData) ? jobsData : [])
        } else {
          console.error('Failed to fetch jobs:', jobsResponse.status)
        }

        // Fetch stats
        const statsResponse = await fetch('/api/jobs/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats({
            totalJobs: statsData.totalJobs || 0,
            sectors: statsData.sectorBreakdown || {}
          })
        } else {
          console.error('Failed to fetch stats:', statsResponse.status)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load job data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(generateCollectionPageSchema(
            'Natural Resource Jobs in Canada',
            'Browse the latest career opportunities in Canada\'s natural resource sectors',
            jobs,
            'https://resourcecareers.ca'
          ))
        }}
      />
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Resource Careers Canada
              </h1>
              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                Discover career opportunities in Canada's natural resource industries. 
                From mining to renewable energy, find your next role in the sectors that power our nation.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {stats.totalJobs} Active Jobs
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  All Provinces
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  Updated Daily
                </span>
              </div>
            </div>
          </div>
        </header>

        <nav className="bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 py-3 overflow-x-auto">
              <Link href="/" className="whitespace-nowrap hover:text-blue-200 transition-colors">
                All Jobs
              </Link>
              <Link href="/sectors/mining" className="whitespace-nowrap hover:text-blue-200 transition-colors">
                Mining
              </Link>
              <Link href="/sectors/oil_gas" className="whitespace-nowrap hover:text-blue-200 transition-colors">
                Oil & Gas
              </Link>
              <Link href="/sectors/forestry" className="whitespace-nowrap hover:text-blue-200 transition-colors">
                Forestry
              </Link>
              <Link href="/sectors/renewable" className="whitespace-nowrap hover:text-blue-200 transition-colors">
                Renewable Energy
              </Link>
              <Link href="/sectors/utilities" className="whitespace-nowrap hover:text-blue-200 transition-colors">
                Utilities
              </Link>
              <Link href="/notifications" className="whitespace-nowrap hover:text-blue-200 transition-colors">
                Job Alerts
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<div>Loading sector statistics...</div>}>
            <SectorStats sectors={stats.sectors} />
          </Suspense>

          <section>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Latest Job Postings</h2>
                <p className="text-gray-600">{jobs.length} recent opportunities</p>
              </div>
              <Link
                href="/jobs"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                View All Jobs
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {jobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255a23.931 23.931 0 01-1.787 4.654c-.395.714-.948 1.29-1.634 1.635a3.989 3.989 0 01-2.456.256c-.744-.127-1.49-.394-2.21-.816a15.923 15.923 0 01-2.346-1.506 11.96 11.96 0 01-1.964-2.09A9.868 9.868 0 017.5 12c0-5.523 4.477-10 10-10s10 4.477 10 10a9.95 9.95 0 01-.5 3.255z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {error ? 'Error Loading Jobs' : 'No jobs available'}
                </h3>
                <p className="text-gray-500">
                  {error || 'Check back soon for new opportunities or set up job alerts.'}
                </p>
                <Link
                  href="/notifications"
                  className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Get Job Alerts
                </Link>
              </div>
            )}
          </section>
        </main>

        <footer className="bg-gray-800 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Resource Careers Canada</h3>
                <p className="text-gray-300 text-sm">
                  Canada's premier job board for natural resource careers. 
                  Connecting talent with opportunities across the nation.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-3">Job Sectors</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><Link href="/sectors/mining" className="hover:text-white">Mining</Link></li>
                  <li><Link href="/sectors/oil_gas" className="hover:text-white">Oil & Gas</Link></li>
                  <li><Link href="/sectors/forestry" className="hover:text-white">Forestry</Link></li>
                  <li><Link href="/sectors/renewable" className="hover:text-white">Renewable Energy</Link></li>
                  <li><Link href="/sectors/utilities" className="hover:text-white">Utilities</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><Link href="/notifications" className="hover:text-white">Job Alerts</Link></li>
                  <li><Link href="/locations" className="hover:text-white">Jobs by Location</Link></li>
                  <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Stay Updated</h4>
                <p className="text-sm text-gray-300 mb-3">
                  Get notified about new job opportunities in your area.
                </p>
                <Link
                  href="/notifications"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors inline-block"
                >
                  Set Up Alerts
                </Link>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2025 Resource Careers Canada. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}