'use client'

import { useState } from 'react'

interface NotificationSubscriptionProps {
  className?: string
}

const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 
  'Saskatchewan', 'Yukon'
]

const SECTORS = [
  { value: 'mining', label: 'Mining & Minerals' },
  { value: 'oil_gas', label: 'Oil & Gas' },
  { value: 'forestry', label: 'Forestry & Logging' },
  { value: 'renewable', label: 'Renewable Energy' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'general', label: 'General Resource Jobs' }
]

const EMPLOYMENT_TYPES = [
  'Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'
]

export function NotificationSubscription({ className }: NotificationSubscriptionProps) {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    subscription_type: 'email' as 'email' | 'sms' | 'both',
    frequency: 'weekly' as 'immediate' | 'daily' | 'weekly',
    subscription_tier: 'free' as 'free' | 'premium',
    regions: [] as string[],
    sectors: [] as string[],
    companies: [] as string[],
    employment_types: [] as string[],
    keywords: [] as string[],
    salary_min: undefined as number | undefined
  })
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [companyInput, setCompanyInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setStatus('success')
        setMessage('Subscription created successfully! Please check your email/phone for verification.')
      } else {
        setStatus('error')
        setMessage(result.error || 'Failed to create subscription')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const addCompany = () => {
    if (companyInput.trim() && !formData.companies.includes(companyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        companies: [...prev.companies, companyInput.trim()]
      }))
      setCompanyInput('')
    }
  }

  const removeCompany = (company: string) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies.filter(c => c !== company)
    }))
  }

  const handleCheckboxChange = (value: string, field: 'regions' | 'sectors' | 'employment_types') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  if (status === 'success') {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center">
          <div className="h-12 w-12 text-green-600 mx-auto mb-4">✅</div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">Subscription Created!</h3>
          <p className="text-green-700">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🔔 Job Notifications
        </h2>
        <p className="text-gray-600 mt-2">
          Get notified about new Canadian resource jobs that match your preferences
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  📧 Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  📱 Phone Number (SMS)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Subscription Type & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="subscription_type" className="block text-sm font-medium text-gray-700 mb-1">Notification Method</label>
              <select 
                value={formData.subscription_type} 
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_type: e.target.value as 'email' | 'sms' | 'both' }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="email">Email Only</option>
                <option value="sms">SMS Only</option>
                <option value="both">Email & SMS</option>
              </select>
            </div>
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select 
                value={formData.frequency} 
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as 'immediate' | 'daily' | 'weekly' }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="weekly">Weekly (Free)</option>
                <option value="daily" disabled>Daily (Premium)</option>
                <option value="immediate" disabled>Immediate (Premium)</option>
              </select>
            </div>
          </div>

          {/* Region Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Provinces/Territories</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PROVINCES.map(province => (
                <label key={province} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.regions.includes(province)}
                    onChange={() => handleCheckboxChange(province, 'regions')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{province}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sector Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Industry Sectors</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SECTORS.map(sector => (
                <label key={sector.value} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.sectors.includes(sector.value)}
                    onChange={() => handleCheckboxChange(sector.value, 'sectors')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{sector.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employment Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Employment Types</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EMPLOYMENT_TYPES.map(type => (
                <label key={type} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.employment_types.includes(type)}
                    onChange={() => handleCheckboxChange(type, 'employment_types')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">Job Keywords</label>
            <div className="flex gap-2 mt-1">
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="e.g. engineer, technician, manager"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button type="button" onClick={addKeyword} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Add</button>
            </div>
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.keywords.map(keyword => (
                  <span key={keyword} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm cursor-pointer" onClick={() => removeKeyword(keyword)}>
                    {keyword} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Companies */}
          <div>
            <label htmlFor="companies" className="block text-sm font-medium text-gray-700 mb-1">Specific Companies</label>
            <div className="flex gap-2 mt-1">
              <input
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                placeholder="e.g. Suncor, Canadian National Railway"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompany())}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button type="button" onClick={addCompany} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Add</button>
            </div>
            {formData.companies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.companies.map(company => (
                  <span key={company} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm cursor-pointer" onClick={() => removeCompany(company)}>
                    {company} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Salary Filter */}
          <div>
            <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary (CAD, optional)</label>
            <input
              type="number"
              value={formData.salary_min || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                salary_min: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="50000"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              ⚠️ {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={status === 'submitting' || (!formData.email && !formData.phone)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'Creating Subscription...' : 'Subscribe to Job Notifications'}
          </button>
        </form>
      </div>
    </div>
  )
}