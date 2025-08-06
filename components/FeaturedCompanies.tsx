'use client'

import Link from 'next/link'
import Image from 'next/image'

interface FeaturedCompany {
  id: string
  name: string
  logo: string
  description: string
  jobCount?: number
  sector: string
  featured_until?: string
}

// Placeholder data - this would come from a database/CMS in production
const FEATURED_COMPANIES: FeaturedCompany[] = [
  {
    id: 'suncor',
    name: 'Suncor Energy',
    logo: '/logos/suncor.png', // You'll need to add actual logos
    description: 'Canada\'s leading integrated energy company',
    sector: 'oil_gas',
    jobCount: 45
  },
  {
    id: 'teck',
    name: 'Teck Resources',
    logo: '/logos/teck.png',
    description: 'Leading mining company focused on copper, zinc, and steelmaking coal',
    sector: 'mining',
    jobCount: 32
  },
  {
    id: 'cnrl',
    name: 'Canadian Natural Resources',
    logo: '/logos/cnrl.png',
    description: 'One of the largest independent crude oil and natural gas producers',
    sector: 'oil_gas',
    jobCount: 28
  },
  {
    id: 'cameco',
    name: 'Cameco Corporation',
    logo: '/logos/cameco.png',
    description: 'World\'s largest publicly traded uranium company',
    sector: 'mining',
    jobCount: 18
  },
  {
    id: 'west-fraser',
    name: 'West Fraser Timber',
    logo: '/logos/westfraser.png',
    description: 'Leading lumber and wood products company',
    sector: 'forestry',
    jobCount: 22
  }
]

export default function FeaturedCompanies() {
  // Only show first 3-5 companies that are currently featured
  const activeCompanies = FEATURED_COMPANIES.slice(0, 4)

  return (
    <section className="bg-gradient-to-br from-blue-50 to-green-50 py-12 mb-8 rounded-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full mb-4">
            Featured Partners
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Top Resource Companies Hiring Now
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore opportunities with Canada's leading natural resource companies
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {activeCompanies.map((company) => (
            <Link
              key={company.id}
              href={`/jobs?company=${encodeURIComponent(company.name)}`}
              className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center"
            >
              {/* Company Logo Placeholder */}
              <div className="w-24 h-24 bg-gray-100 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                {/* Replace with actual Image component when logos are available */}
                <div className="text-gray-400 text-xs">
                  {company.name.split(' ').map(word => word[0]).join('')}
                </div>
              </div>

              {/* Company Name */}
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {company.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {company.description}
              </p>

              {/* Job Count Badge */}
              {company.jobCount && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {company.jobCount} jobs
                  </span>
                </div>
              )}

              {/* Sector Badge */}
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {company.sector.replace('_', ' & ')}
              </span>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-300"></div>
            </Link>
          ))}
        </div>

        {/* Call to Action for Companies */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Want to feature your company here?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Become a Featured Partner
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}