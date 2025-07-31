'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [contactInfo, setContactInfo] = useState<{
    contact: string
    subscription_type: string
  } | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const contact = searchParams.get('contact')

    if (!token || !contact) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifySubscription(token, contact)
  }, [searchParams])

  const verifySubscription = async (token: string, contact: string) => {
    try {
      // First check verification status
      const checkResponse = await fetch(`/api/notifications/verify?token=${token}`)
      const checkData = await checkResponse.json()

      if (!checkData.success) {
        setStatus('error')
        setMessage(checkData.message || 'Invalid verification token')
        return
      }

      if (checkData.data.expired) {
        setStatus('expired')
        setMessage('Verification link has expired')
        return
      }

      if (checkData.data.verified) {
        setStatus('success')
        setMessage('Your subscription is already verified and active!')
        setContactInfo({
          contact: checkData.data.contact,
          subscription_type: checkData.data.subscription_type
        })
        return
      }

      // Proceed with verification
      const verifyResponse = await fetch('/api/notifications/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          contact
        }),
      })

      const verifyData = await verifyResponse.json()

      if (verifyData.success) {
        setStatus('success')
        setMessage('Your subscription has been verified successfully!')
        setContactInfo({
          contact,
          subscription_type: verifyData.subscription?.subscription_type || 'email'
        })
      } else {
        setStatus('error')
        setMessage(verifyData.message || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred during verification')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        )
      case 'success':
        return (
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case 'expired':
        return (
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'expired':
        return 'text-yellow-800'
      default:
        return 'text-gray-800'
    }
  }

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'expired':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className={`bg-white rounded-lg shadow-lg p-8 border-2 ${getBackgroundColor()}`}>
          <div className="text-center">
            {getStatusIcon()}
            
            <h1 className={`text-2xl font-bold mt-4 mb-2 ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying...'}
              {status === 'success' && 'Verification Successful!'}
              {status === 'error' && 'Verification Failed'}
              {status === 'expired' && 'Link Expired'}
            </h1>

            <p className={`mb-6 ${getStatusColor()}`}>
              {message}
            </p>

            {status === 'success' && contactInfo && (
              <div className="bg-white border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-800 mb-2">Subscription Details</h3>
                <p className="text-sm text-green-700">
                  <strong>Contact:</strong> {contactInfo.contact}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Method:</strong> {contactInfo.subscription_type === 'both' ? 'Email & SMS' : contactInfo.subscription_type}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  You'll start receiving job alerts based on your preferences.
                </p>
              </div>
            )}

            {status === 'expired' && (
              <div className="bg-white border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-700">
                  Your verification link has expired. Please subscribe again to receive a new verification link.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {status === 'success' && (
                <a
                  href={`/notifications/manage?token=${searchParams.get('token')}`}
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Manage Subscription
                </a>
              )}

              {(status === 'error' || status === 'expired') && (
                <a
                  href="/notifications"
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Subscribe Again
                </a>
              )}

              <a
                href="/"
                className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>

        {status === 'success' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• You'll receive notifications based on your selected preferences</li>
              <li>• Free users get weekly digest emails</li>
              <li>• Premium users can upgrade for daily/immediate alerts</li>
              <li>• You can update preferences or unsubscribe anytime</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}