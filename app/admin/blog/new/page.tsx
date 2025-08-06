'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BlogEditor from '@/components/admin/BlogEditor'
import { createClient } from '@supabase/supabase-js'

const BLOG_TEMPLATES = {
  'career-guide': {
    title: 'Career Guide Template',
    content: `# [Job Title] Career Guide

## Overview
[Brief introduction to the role and its importance in the resource sector]

## Key Responsibilities
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

## Required Qualifications
### Education
- [Degree requirements]
- [Certifications needed]

### Experience
- [Years of experience]
- [Specific skills]

## Salary Expectations
- Entry Level: $[X] - $[Y]
- Mid-Level: $[X] - $[Y]
- Senior Level: $[X] - $[Y]

## Career Path
[Describe typical career progression]

## Job Market Outlook
[Current demand and future prospects]

## How to Get Started
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Resources
- [Professional associations]
- [Training programs]
- [Job boards]`
  },
  'industry-insight': {
    title: 'Industry Insight Template',
    content: `# [Industry Trend/Topic]

## Executive Summary
[Key takeaways in 2-3 sentences]

## Current State of the Industry
[Overview of the current situation]

## Key Trends
### Trend 1: [Name]
[Description and impact]

### Trend 2: [Name]
[Description and impact]

## Market Analysis
- **Growth Rate**: [X]%
- **Key Players**: [List major companies]
- **Investment**: $[X] billion

## Implications for Job Seekers
[How these trends affect employment]

## Expert Opinions
> "[Quote from industry expert]" - [Name, Title]

## Future Outlook
[Predictions for the next 5-10 years]

## Conclusion
[Summary and call to action]`
  },
  'job-trends': {
    title: 'Job Market Trends Template',
    content: `# [Sector] Job Market Report - [Month/Year]

## Key Statistics
- **Total Jobs Posted**: [X]
- **Month-over-Month Growth**: [X]%
- **Average Salary**: $[X]
- **Top Hiring Companies**: [List]

## Regional Breakdown
### [Province 1]
- Jobs: [X]
- Growth: [X]%
- Top Roles: [List]

### [Province 2]
- Jobs: [X]
- Growth: [X]%
- Top Roles: [List]

## In-Demand Skills
1. [Skill 1] - [X]% of postings
2. [Skill 2] - [X]% of postings
3. [Skill 3] - [X]% of postings

## Salary Trends
[Chart or table of salary ranges by role]

## Hiring Forecast
[Predictions for upcoming months]

## Recommendations
- For Job Seekers: [Advice]
- For Employers: [Advice]`
  }
}

export default function NewBlogPost() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const handleSave = async (postData: any) => {
    setLoading(true)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey.trim())

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single()

      if (error) throw error

      router.push('/admin/blog')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error saving post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = (templateKey: string) => {
    setSelectedTemplate(templateKey)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
            <Link
              href="/admin/blog"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Posts
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Template Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Start with a Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(BLOG_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => loadTemplate(key)}
                className={`p-4 border rounded-lg text-left hover:border-blue-500 transition-colors ${
                  selectedTemplate === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <h3 className="font-medium text-gray-900">{template.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {key === 'career-guide' && 'Perfect for role-specific guides'}
                  {key === 'industry-insight' && 'For market analysis and trends'}
                  {key === 'job-trends' && 'Monthly job market reports'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <BlogEditor
          initialData={{
            title: '',
            content: selectedTemplate ? BLOG_TEMPLATES[selectedTemplate as keyof typeof BLOG_TEMPLATES].content : '',
            status: 'draft',
            category: 'insights'
          }}
          onSave={handleSave}
          loading={loading}
        />
      </main>
    </div>
  )
}