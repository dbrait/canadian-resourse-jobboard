'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function JobSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [company, setCompany] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Pre-fill search fields from URL params
    const companyParam = searchParams.get('company')
    const searchParam = searchParams.get('search')
    const locationParam = searchParams.get('location')
    
    if (companyParam) setCompany(companyParam)
    if (searchParam) setSearchTerm(searchParam)
    if (locationParam) setLocation(locationParam)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (searchTerm) params.append('search', searchTerm)
    if (location) params.append('location', location)
    if (company) params.append('company', company)
    
    const queryString = params.toString()
    if (queryString) {
      router.push(`/?${queryString}`)
    } else {
      router.push('/')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setLocation('')
    setCompany('')
    router.push('/')
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4">
        {/* Show active company filter if present */}
        {company && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <span className="text-sm text-blue-800">
              Showing jobs from: <strong>{company}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setCompany('')
                const params = new URLSearchParams(searchParams.toString())
                params.delete('company')
                router.push(params.toString() ? `/?${params.toString()}` : '/')
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear filter ×
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title or Keywords
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Engineer, Manager, Analyst"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Calgary, Toronto, Vancouver"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-1 flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
            {(searchTerm || location || company) && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Clear all filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}