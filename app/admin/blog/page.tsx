import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { BlogPost } from '@/types/blog'

export const metadata: Metadata = {
  title: 'Blog Admin | Resource Careers Canada',
  description: 'Manage blog posts for Resource Careers Canada',
  robots: 'noindex, nofollow' // Don't index admin pages
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey.trim())

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:authors(name)
    `)
    .order('created_at', { ascending: false })

  return posts || []
}

function PostRow({ post }: { post: BlogPost }) {
  const statusColor = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800'
  }[post.status]

  const publishDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-CA')
    : 'Not published'

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{post.title}</div>
          <div className="text-sm text-gray-500">/{post.slug}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="capitalize text-sm text-gray-900">{post.category}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
          {post.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {post.author?.name || 'No author'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {publishDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link
          href={`/admin/blog/edit/${post.id}`}
          className="text-blue-600 hover:text-blue-900 mr-4"
        >
          Edit
        </Link>
        {post.status === 'published' && (
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            View
          </a>
        )}
      </td>
    </tr>
  )
}

export default async function BlogAdminPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Blog Admin</h1>
            <div className="space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Site
              </Link>
              <Link
                href="/admin/blog/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                New Post
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">All Blog Posts</h2>
            <p className="mt-1 text-sm text-gray-600">
              Total: {posts.length} posts
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title / Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </tbody>
            </table>
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No blog posts yet.</p>
              <Link
                href="/admin/blog/new"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700"
              >
                Create your first post →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}