import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BlogPost, TableOfContentsItem } from '@/types/blog'
import { createClient } from '@supabase/supabase-js'
import { generateArticleSchema } from '@/lib/seo/structured-data'
import BlogContent from '@/components/BlogContent'
import TableOfContents from '@/components/TableOfContents'
import AuthorCard from '@/components/AuthorCard'
import RelatedPosts from '@/components/RelatedPosts'
import ShareButtons from '@/components/ShareButtons'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey.trim())

  const { data: post } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:authors(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (post) {
    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', post.id)
  }

  return post
}

async function getRelatedPosts(post: BlogPost): Promise<BlogPost[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey.trim())

  // Get related posts by category and tags
  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .neq('id', post.id)
    .or(`category.eq.${post.category},tags.cs.{${post.tags?.join(',')}}`)
    .order('published_at', { ascending: false })
    .limit(3)

  return relatedPosts || []
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const publishDate = new Date(post.published_at!).toISOString()
  const updateDate = new Date(post.updated_at).toISOString()

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    keywords: post.keywords?.join(', '),
    authors: post.author ? [{ name: post.author.name }] : undefined,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      type: 'article',
      publishedTime: publishDate,
      modifiedTime: updateDate,
      authors: post.author ? [post.author.name] : undefined,
      images: post.featured_image ? [{
        url: post.featured_image,
        alt: post.featured_image_alt || post.title,
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
    alternates: {
      canonical: post.canonical_url || `https://resourcecareers.ca/blog/${post.slug}`
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post)
  const publishDate = new Date(post.published_at!).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const articleSchema = generateArticleSchema(
    post.title,
    post.excerpt,
    post.author?.name || 'Resource Careers Canada',
    post.published_at!,
    post.updated_at,
    post.featured_image,
    `https://resourcecareers.ca/blog/${post.slug}`
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      
      <article className="min-h-screen bg-white">
        <header className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="mb-6">
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
                <li>
                  <Link 
                    href={`/blog/category/${post.category}`} 
                    className="text-gray-500 hover:text-gray-700 capitalize"
                  >
                    {post.category}
                  </Link>
                </li>
              </ol>
            </nav>
            
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full capitalize">
                  {post.category}
                </span>
                <time dateTime={post.published_at}>{publishDate}</time>
                {post.view_count && (
                  <span>{post.view_count.toLocaleString()} views</span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">{post.excerpt}</p>
              
              {post.author && (
                <div className="flex items-center gap-4 mb-8">
                  {post.author.avatar_url && (
                    <img 
                      src={post.author.avatar_url} 
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{post.author.name}</p>
                    {post.author.credentials && (
                      <p className="text-sm text-gray-600">{post.author.credentials}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {post.featured_image && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
            <img 
              src={post.featured_image} 
              alt={post.featured_image_alt || post.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Table of Contents - Desktop */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-8">
                <TableOfContents content={post.content} />
              </div>
            </aside>
            
            {/* Main Content */}
            <main className="lg:col-span-6">
              <BlogContent content={post.content} />
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog/tag/${tag}`}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Share Buttons */}
              <div className="mt-8 pt-8 border-t">
                <ShareButtons 
                  url={`https://resourcecareers.ca/blog/${post.slug}`}
                  title={post.title}
                />
              </div>
              
              {/* Author Card */}
              {post.author && (
                <div className="mt-8 pt-8 border-t">
                  <AuthorCard author={post.author} />
                </div>
              )}
            </main>
            
            {/* Sidebar */}
            <aside className="lg:col-span-3">
              <div className="sticky top-8 space-y-8">
                {/* Related Job Sectors */}
                {post.related_job_sectors && post.related_job_sectors.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Explore Jobs in These Sectors
                    </h3>
                    <div className="space-y-2">
                      {post.related_job_sectors.map((sector) => (
                        <Link
                          key={sector}
                          href={`/sectors/${sector}`}
                          className="block bg-white hover:bg-blue-100 px-4 py-2 rounded text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Jobs →
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Newsletter CTA */}
                <div className="bg-gray-100 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Get Industry Updates
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Subscribe to receive the latest insights and job opportunities.
                  </p>
                  <Link
                    href="/notifications"
                    className="block bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded transition-colors"
                  >
                    Subscribe Now
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
              <RelatedPosts posts={relatedPosts} />
            </div>
          </section>
        )}
      </article>
    </>
  )
}