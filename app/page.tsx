'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Job } from '../types/job'

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('posted_date', { ascending: false })

        if (error) throw error
        setJobs(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading jobs...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Canadian Resource Job Board</h1>
          <p className="text-gray-600 mt-2">Find opportunities in Canada's resource sectors</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Latest Job Postings</h2>
          <p className="text-gray-600">{jobs.length} jobs available</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{job.title}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {job.sector}
                </span>
              </div>
              
              <p className="text-gray-700 font-medium mb-2">{job.company}</p>
              <p className="text-gray-600 text-sm mb-2">{job.location}, {job.province}</p>
              
              {job.salary_range && (
                <p className="text-green-600 font-medium text-sm mb-3">{job.salary_range}</p>
              )}
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {job.employment_type}
                </span>
                {job.application_url && (
                  <a 
                    href={job.application_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors"
                  >
                    Apply Now
                  </a>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Posted {new Date(job.posted_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No jobs found.</p>
          </div>
        )}
      </main>
    </div>
  )
}
