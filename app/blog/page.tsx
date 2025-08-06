import { Metadata } from 'next'
import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = {
  title: 'Resource Industry Blog | Career Insights & Guides',
  description: 'Expert insights, career guides, and job market trends for Canadian natural resource industries including mining, oil & gas, forestry, and renewable energy.',
  openGraph: {
    title: 'Resource Industry Blog | Career Insights & Guides',
    description: 'Expert insights, career guides, and job market trends for Canadian natural resource industries',
    type: 'website',
    url: 'https://resourcecareers.ca/blog',
  },
  alternates: {
    canonical: 'https://resourcecareers.ca/blog'
  }
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey.trim())

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:authors(*)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  return posts || []
}

function BlogPostCard({ post }: { post: BlogPost }) {
  const publishDate = new Date(post.published_at!).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.featured_image && (
        <Link href={`/blog/${post.slug}`}>
          <img 
            src={post.featured_image} 
            alt={post.featured_image_alt || post.title}
            className="w-full h-48 object-cover"
          />
        </Link>
      )}
      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {post.category}
          </span>
          <time dateTime={post.published_at}>{publishDate}</time>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">
          <Link 
            href={`/blog/${post.slug}`}
            className="text-gray-900 hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        
        <div className="flex items-center justify-between">
          {post.author && (
            <div className="flex items-center gap-2">
              {post.author.avatar_url && (
                <img 
                  src={post.author.avatar_url} 
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-700">{post.author.name}</span>
            </div>
          )}
          
          <Link 
            href={`/blog/${post.slug}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Read More →
          </Link>
        </div>
      </div>
    </article>
  )
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-900 font-medium">Blog</li>
            </ol>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resource Industry Insights & Career Guides
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Stay informed with expert analysis, career guides, and job market trends 
            in Canada's natural resource sectors.
          </p>
        </div>
      </header>

      <nav className="bg-blue-600 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3 overflow-x-auto">
            <Link href="/blog" className="whitespace-nowrap hover:text-blue-200 font-medium">
              All Posts
            </Link>
            <Link href="/blog/category/insights" className="whitespace-nowrap hover:text-blue-200">
              Industry Insights
            </Link>
            <Link href="/blog/category/guides" className="whitespace-nowrap hover:text-blue-200">
              Career Guides
            </Link>
            <Link href="/blog/category/trends" className="whitespace-nowrap hover:text-blue-200">
              Job Trends
            </Link>
            <Link href="/blog/category/analysis" className="whitespace-nowrap hover:text-blue-200">
              Market Analysis
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts published yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}