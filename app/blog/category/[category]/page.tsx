import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import { createClient } from '@supabase/supabase-js'

const VALID_CATEGORIES = ['insights', 'guides', 'trends', 'news', 'analysis'] as const
type BlogCategory = typeof VALID_CATEGORIES[number]

const CATEGORY_INFO: Record<BlogCategory, { title: string; description: string }> = {
  insights: {
    title: 'Industry Insights',
    description: 'Deep analysis of Canadian natural resource industry trends, market dynamics, and strategic insights from industry experts.'
  },
  guides: {
    title: 'Career Guides',
    description: 'Comprehensive guides for building successful careers in mining, oil & gas, forestry, renewable energy, and utilities sectors.'
  },
  trends: {
    title: 'Job Market Trends',
    description: 'Latest job market trends, salary data, and employment forecasts for Canadian resource sectors.'
  },
  news: {
    title: 'Industry News',
    description: 'Breaking news and updates from Canadian mining, oil & gas, forestry, and renewable energy sectors.'
  },
  analysis: {
    title: 'Market Analysis',
    description: 'In-depth market analysis, economic forecasts, and investment trends in natural resources.'
  }
}

interface CategoryPageProps {
  params: {
    category: string
  }
}

async function getCategoryPosts(category: string): Promise<BlogPost[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey.trim())

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:authors(*)
    `)
    .eq('category', category)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return posts || []
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  if (!VALID_CATEGORIES.includes(params.category as BlogCategory)) {
    return {
      title: 'Category Not Found',
    }
  }

  const category = params.category as BlogCategory
  const categoryInfo = CATEGORY_INFO[category]

  return {
    title: `${categoryInfo.title} | Resource Careers Blog`,
    description: categoryInfo.description,
    openGraph: {
      title: `${categoryInfo.title} | Resource Careers Blog`,
      description: categoryInfo.description,
      type: 'website',
      url: `https://resourcecareers.ca/blog/category/${category}`,
    },
    alternates: {
      canonical: `https://resourcecareers.ca/blog/category/${category}`
    }
  }
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
          <time dateTime={post.published_at}>{publishDate}</time>
          {post.view_count && (
            <span>{post.view_count.toLocaleString()} views</span>
          )}
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  if (!VALID_CATEGORIES.includes(params.category as BlogCategory)) {
    notFound()
  }

  const category = params.category as BlogCategory
  const categoryInfo = CATEGORY_INFO[category]
  const posts = await getCategoryPosts(category)

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
              <li>
                <Link href="/blog" className="text-gray-500 hover:text-gray-700">
                  Blog
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-900 font-medium capitalize">{category}</li>
            </ol>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {categoryInfo.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {categoryInfo.description}
          </p>
        </div>
      </header>

      <nav className="bg-blue-600 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3 overflow-x-auto">
            <Link href="/blog" className="whitespace-nowrap hover:text-blue-200">
              All Posts
            </Link>
            {VALID_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/blog/category/${cat}`}
                className={`whitespace-nowrap hover:text-blue-200 capitalize ${
                  cat === category ? 'font-medium text-white' : ''
                }`}
              >
                {CATEGORY_INFO[cat].title}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No posts published in this category yet.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-600">
                Showing {posts.length} article{posts.length !== 1 ? 's' : ''} in {categoryInfo.title}
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}