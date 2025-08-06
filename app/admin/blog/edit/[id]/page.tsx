'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BlogEditor from '@/components/admin/BlogEditor'
import { createClient } from '@supabase/supabase-js'
import { BlogPost } from '@/types/blog'

interface EditBlogPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadPost() {
      const { id } = await params
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey.trim())

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error loading post:', error)
        alert('Error loading post')
        router.push('/admin/blog')
      } else {
        setPost(data)
      }
      setLoading(false)
    }

    loadPost()
  }, [params, router])

  const handleSave = async (postData: any) => {
    setSaving(true)
    try {
      const { id } = await params
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey.trim())

      // Add published_at timestamp if publishing for the first time
      if (postData.status === 'published' && post?.status !== 'published') {
        postData.published_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          ...postData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      alert('Post saved successfully!')
      router.push('/admin/blog')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error saving post. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setSaving(true)
    try {
      const { id } = await params
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey.trim())

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.push('/admin/blog')
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
                disabled={saving}
              >
                Delete Post
              </button>
              <Link
                href="/admin/blog"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Posts
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogEditor
          initialData={post}
          onSave={handleSave}
          loading={saving}
        />
      </main>
    </div>
  )
}