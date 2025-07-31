'use client'

import React, { useState, useEffect } from 'react'
import { 
  NotificationMethod, 
  NotificationFrequency, 
  CreateSubscriptionRequest,
  NotificationPreferences 
} from '@/types/notifications'

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [formData, setFormData] = useState<CreateSubscriptionRequest>({
    subscription_type: 'email',
    frequency: 'weekly',
    regions: [],
    sectors: [],
    companies: [],
    employment_types: [],
    keywords: []
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<'form' | 'verification'>('form')

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      if (data.success) {
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage('Subscription created! Please check your email/phone for verification.')
        setStep('verification')
      } else {
        setMessage(data.message || 'Failed to create subscription')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateSubscriptionRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMultiSelectChange = (field: 'regions' | 'sectors' | 'companies' | 'employment_types' | 'keywords', value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      
      return {
        ...prev,
        [field]: newArray
      }
    })
  }

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !formData.keywords?.includes(keyword.trim())) {
      const maxKeywords = formData.subscription_tier === 'premium' ? 20 : 5
      if ((formData.keywords?.length || 0) < maxKeywords) {
        setFormData(prev => ({
          ...prev,
          keywords: [...(prev.keywords || []), keyword.trim()]
        }))
      }
    }
  }

  const handleKeywordRemove = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }))
  }

  if (!preferences) {
    return <div className="p-8">Loading...</div>
  }

  if (step === 'verification') {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Check Your {formData.subscription_type === 'sms' ? 'Phone' : 'Email'}</h2>
          <p className="text-green-700 mb-4">{message}</p>
          <p className="text-sm text-green-600">
            Didn't receive the verification? Check your spam folder or try subscribing again.
          </p>
          <button
            onClick={() => setStep('form')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Form
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Job Alert Notifications</h1>
        <p className="text-gray-600 mb-8">
          Get notified about new job opportunities that match your preferences. 
          Choose from weekly free updates or upgrade to premium for daily and immediate alerts.
        </p>

        {message && (
          <div className={`p-4 rounded mb-6 ${
            message.includes('error') || message.includes('Failed') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Method *
              </label>
              <select
                value={formData.subscription_type}
                onChange={(e) => handleInputChange('subscription_type', e.target.value as NotificationMethod)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="email">Email Only</option>
                <option value="sms">SMS Only</option>
                <option value="both">Both Email & SMS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value as NotificationFrequency)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="weekly">Weekly (Free)</option>
                <option value="daily">Daily (Premium)</option>
                <option value="immediate">Immediate (Premium)</option>
              </select>
              {formData.frequency !== 'weekly' && (
                <p className="text-sm text-blue-600 mt-1">Premium feature - upgrade required</p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          {(formData.subscription_type === 'email' || formData.subscription_type === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@example.com"
                required
              />
            </div>
          )}

          {(formData.subscription_type === 'sms' || formData.subscription_type === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          )}

          {/* Regions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regions/Provinces
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {preferences.regions.map(region => (
                <label key={region.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.regions?.includes(region.value) || false}
                    onChange={() => handleMultiSelectChange('regions', region.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{region.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Sectors
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {preferences.sectors.map(sector => (
                <label key={sector.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.sectors?.includes(sector.value) || false}
                    onChange={() => handleMultiSelectChange('sectors', sector.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{sector.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employment Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {preferences.employment_types.map(type => (
                <label key={type.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.employment_types?.includes(type.value) || false}
                    onChange={() => handleMultiSelectChange('employment_types', type.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords ({formData.keywords?.length || 0}/{formData.subscription_tier === 'premium' ? 20 : 5})
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.keywords?.map(keyword => (
                <span
                  key={keyword}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleKeywordRemove(keyword)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Enter keyword and press Enter"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleKeywordAdd((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
            <p className="text-sm text-gray-500 mt-1">
              Press Enter to add keywords. Examples: "engineer", "supervisor", "remote"
            </p>
          </div>

          {/* Minimum Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Salary (CAD)
            </label>
            <input
              type="number"
              value={formData.salary_min || ''}
              onChange={(e) => handleInputChange('salary_min', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="50000"
              min="0"
            />
          </div>

          {/* Subscription Tier Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Subscription Tiers</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-green-700">Free Tier</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Weekly notifications</li>
                  <li>• Up to 5 keywords</li>
                  <li>• All other filters included</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-blue-700">Premium Tier</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  <li>• Immediate & daily notifications</li>
                  <li>• Up to 20 keywords</li>
                  <li>• Priority delivery</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Subscription...' : 'Subscribe to Job Alerts'}
          </button>
        </form>
      </div>
    </div>
  )
}