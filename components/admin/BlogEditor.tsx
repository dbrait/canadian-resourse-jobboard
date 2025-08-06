'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface BlogEditorProps {
  initialData?: {
    title?: string
    slug?: string
    content?: string
    excerpt?: string
    category?: string
    status?: string
    meta_title?: string
    meta_description?: string
    keywords?: string[]
    featured_image?: string
    featured_image_alt?: string
    tags?: string[]
    related_job_sectors?: string[]
  }
  onSave: (data: any) => void
  loading?: boolean
}

const CATEGORIES = [
  { value: 'insights', label: 'Industry Insights' },
  { value: 'guides', label: 'Career Guides' },
  { value: 'trends', label: 'Job Trends' },
  { value: 'news', label: 'Industry News' },
  { value: 'analysis', label: 'Market Analysis' }
]

const JOB_SECTORS = [
  { value: 'mining', label: 'Mining' },
  { value: 'oil_gas', label: 'Oil & Gas' },
  { value: 'forestry', label: 'Forestry' },
  { value: 'renewable', label: 'Renewable Energy' },
  { value: 'utilities', label: 'Utilities' }
]

export default function BlogEditor({ initialData = {}, onSave, loading = false }: BlogEditorProps) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    slug: initialData.slug || '',
    content: initialData.content || '',
    excerpt: initialData.excerpt || '',
    category: initialData.category || 'insights',
    status: initialData.status || 'draft',
    meta_title: initialData.meta_title || '',
    meta_description: initialData.meta_description || '',
    keywords: initialData.keywords || [],
    featured_image: initialData.featured_image || '',
    featured_image_alt: initialData.featured_image_alt || '',
    tags: initialData.tags || [],
    related_job_sectors: initialData.related_job_sectors || []
  })

  const [showPreview, setShowPreview] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData.slug && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, initialData.slug])

  // Auto-generate meta title
  useEffect(() => {
    if (!formData.meta_title && formData.title) {
      setFormData(prev => ({ 
        ...prev, 
        meta_title: formData.title.slice(0, 60) 
      }))
    }
  }, [formData.title, formData.meta_title])

  // Auto-generate excerpt from content
  useEffect(() => {
    if (!formData.excerpt && formData.content) {
      const plainText = formData.content
        .replace(/^#+\s+/gm, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_~`]/g, '')
        .trim()
      const excerpt = plainText.slice(0, 160) + (plainText.length > 160 ? '...' : '')
      setFormData(prev => ({ ...prev, excerpt }))
    }
  }, [formData.content, formData.excerpt])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">/blog/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the post..."
            />
            <p className="text-sm text-gray-500 mt-1">{formData.excerpt.length}/160 characters</p>
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Content</h2>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {showPreview ? (
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {formData.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Write your content in Markdown..."
              required
            />
            <div className="mt-2 text-sm text-gray-500">
              <p>Markdown supported. Common syntax:</p>
              <code className="block mt-1 p-2 bg-gray-50 rounded">
                # Heading 1<br />
                ## Heading 2<br />
                **bold text**<br />
                *italic text*<br />
                [link text](url)<br />
                ![alt text](image-url)<br />
                - List item<br />
                1. Numbered item
              </code>
            </div>
          </div>
        )}
      </div>

      {/* SEO Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">SEO Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              maxLength={60}
            />
            <p className="text-sm text-gray-500 mt-1">{formData.meta_title.length}/60 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              maxLength={160}
            />
            <p className="text-sm text-gray-500 mt-1">{formData.meta_description.length}/160 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add keyword..."
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image URL
            </label>
            <input
              type="url"
              value={formData.featured_image}
              onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image Alt Text
            </label>
            <input
              type="text"
              value={formData.featured_image_alt}
              onChange={(e) => setFormData({ ...formData, featured_image_alt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descriptive text for the image"
            />
          </div>
        </div>
      </div>

      {/* Tags and Related Sectors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Tags & Related Content</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Job Sectors
            </label>
            <div className="space-y-2">
              {JOB_SECTORS.map(sector => (
                <label key={sector.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.related_job_sectors.includes(sector.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          related_job_sectors: [...formData.related_job_sectors, sector.value]
                        })
                      } else {
                        setFormData({
                          ...formData,
                          related_job_sectors: formData.related_job_sectors.filter(s => s !== sector.value)
                        })
                      }
                    }}
                    className="mr-2"
                  />
                  {sector.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </form>
  )
}