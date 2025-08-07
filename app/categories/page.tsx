'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { JOB_CATEGORIES } from '@/lib/jobCategories'

interface CategoryStats {
  [key: string]: number
}

export default function CategoriesPage() {
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/jobs/stats')
        if (response.ok) {
          const data = await response.json()
          setCategoryStats(data.categoryBreakdown || {})
        }
      } catch (error) {
        console.error('Error fetching category stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  // Group categories by sector for better organization
  const categoriesBySector: { [key: string]: typeof JOB_CATEGORIES } = {}
  JOB_CATEGORIES.forEach(category => {
    category.sector.forEach(sector => {
      if (!categoriesBySector[sector]) {
        categoriesBySector[sector] = []
      }
      categoriesBySector[sector].push(category)
    })
  })

  const sectorNames: { [key: string]: string } = {
    'mining': 'Mining',
    'oil_gas': 'Oil & Gas',
    'forestry': 'Forestry',
    'renewable': 'Renewable Energy',
    'utilities': 'Utilities',
    'construction': 'Construction',
    'transportation': 'Transportation'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Job Categories
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse opportunities by job type across Canada's resource industries
            </p>
          </div>
        </div>
      </header>

      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3 overflow-x-auto">
            <Link href="/" className="whitespace-nowrap hover:text-blue-200 transition-colors">
              Home
            </Link>
            <Link href="/categories" className="whitespace-nowrap text-blue-200">
              Categories
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
            <Link href="/blog" className="whitespace-nowrap hover:text-blue-200 transition-colors">
              Blog
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* All Categories Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Job Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {JOB_CATEGORIES.map(category => {
              const jobCount = categoryStats[category.id] || 0
              return (
                <Link
                  key={category.id}
                  href={`/?job_category=${category.id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {jobCount} jobs
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {category.sector.map(sector => (
                      <span
                        key={sector}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {sectorNames[sector] || sector}
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Categories by Sector */}
        {Object.entries(categoriesBySector).map(([sector, categories]) => (
          <section key={sector} className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {sectorNames[sector] || sector} Jobs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => {
                const jobCount = categoryStats[category.id] || 0
                return (
                  <Link
                    key={`${sector}-${category.id}`}
                    href={`/?job_category=${category.id}&sector=${sector}`}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <span className="text-sm text-gray-600">{jobCount} jobs</span>
                    </div>
                    <p className="text-gray-600 text-xs">{category.description}</p>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-300">
              Browse job opportunities by category to find your perfect role in Canada's resource industries.
            </p>
            <Link
              href="/notifications"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Get Job Alerts
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}