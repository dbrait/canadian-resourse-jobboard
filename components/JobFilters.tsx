'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { JOB_CATEGORIES } from '@/lib/jobCategories'

interface FilterOption {
  value: string
  label: string
  count?: number
}

const PROVINCES: FilterOption[] = [
  { value: '', label: 'All Provinces' },
  { value: 'Alberta', label: 'Alberta' },
  { value: 'British Columbia', label: 'British Columbia' },
  { value: 'Manitoba', label: 'Manitoba' },
  { value: 'New Brunswick', label: 'New Brunswick' },
  { value: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador' },
  { value: 'Northwest Territories', label: 'Northwest Territories' },
  { value: 'Nova Scotia', label: 'Nova Scotia' },
  { value: 'Nunavut', label: 'Nunavut' },
  { value: 'Ontario', label: 'Ontario' },
  { value: 'Prince Edward Island', label: 'Prince Edward Island' },
  { value: 'Quebec', label: 'Quebec' },
  { value: 'Saskatchewan', label: 'Saskatchewan' },
  { value: 'Yukon', label: 'Yukon' },
]

const SECTORS: FilterOption[] = [
  { value: '', label: 'All Sectors' },
  { value: 'mining', label: 'Mining' },
  { value: 'oil_gas', label: 'Oil & Gas' },
  { value: 'forestry', label: 'Forestry' },
  { value: 'renewable', label: 'Renewable Energy' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'construction', label: 'Construction' },
  { value: 'general', label: 'General' },
]

const EMPLOYMENT_TYPES: FilterOption[] = [
  { value: '', label: 'All Types' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Temporary', label: 'Temporary' },
  { value: 'Internship', label: 'Internship' },
]

const JOB_CATEGORY_OPTIONS: FilterOption[] = [
  { value: '', label: 'All Categories' },
  ...JOB_CATEGORIES.map(cat => ({
    value: cat.id,
    label: cat.name
  }))
]

export default function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [sector, setSector] = useState(searchParams.get('sector') || '')
  const [province, setProvince] = useState(searchParams.get('province') || '')
  const [employmentType, setEmploymentType] = useState(searchParams.get('employment_type') || '')
  const [jobCategory, setJobCategory] = useState(searchParams.get('job_category') || '')

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update or remove parameters
    if (sector) params.set('sector', sector)
    else params.delete('sector')
    
    if (province) params.set('province', province)
    else params.delete('province')
    
    if (employmentType) params.set('employment_type', employmentType)
    else params.delete('employment_type')
    
    if (jobCategory) params.set('job_category', jobCategory)
    else params.delete('job_category')
    
    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
    setSector('')
    setProvince('')
    setEmploymentType('')
    setJobCategory('')
    router.push('/')
  }

  // Apply filters when they change
  useEffect(() => {
    applyFilters()
  }, [sector, province, employmentType, jobCategory])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filter Jobs</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear All
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
            Sector
          </label>
          <select
            id="sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SECTORS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
            Province
          </label>
          <select
            id="province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {PROVINCES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700 mb-1">
            Employment Type
          </label>
          <select
            id="employment_type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {EMPLOYMENT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="job_category" className="block text-sm font-medium text-gray-700 mb-1">
            Job Category
          </label>
          <select
            id="job_category"
            value={jobCategory}
            onChange={(e) => setJobCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {JOB_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}