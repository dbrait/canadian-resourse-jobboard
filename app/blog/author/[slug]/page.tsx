import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Author, BlogPost } from '@/types/blog'
import { createClient } from '@supabase/supabase-js'

interface AuthorPageProps {
  params: {
    slug: string
  }
}

async function getAuthor(slug: string): Promise<Author | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey.trim())

  const { data: author } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single()

  return author
}

async function getAuthorPosts(authorId: number): Promise<BlogPost[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey.trim())

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('author_id', authorId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return posts || []
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const author = await getAuthor(params.slug)
  
  if (!author) {
    return {
      title: 'Author Not Found',
    }
  }

  return {
    title: `${author.name} - Resource Industry Expert`,
    description: author.bio || `Read articles and insights by ${author.name}, expert in Canadian natural resource industries.`,
    openGraph: {
      title: `${author.name} - Resource Industry Expert`,
      description: author.bio || `Read articles and insights by ${author.name}`,
      type: 'profile',
      images: author.avatar_url ? [{ url: author.avatar_url }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${author.name} - Resource Industry Expert`,
      description: author.bio || `Read articles and insights by ${author.name}`,
      images: author.avatar_url ? [author.avatar_url] : undefined,
    },
  }
}

function AuthorSchema(author: Author, posts: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "description": author.bio,
    "image": author.avatar_url,
    "sameAs": [
      author.linkedin_url,
      author.twitter_handle ? `https://twitter.com/${author.twitter_handle}` : null
    ].filter(Boolean),
    "jobTitle": author.credentials,
    "knowsAbout": author.expertise,
    "url": `https://resourcecareers.ca/blog/author/${author.slug}`,
    "mainEntityOfPage": {
      "@type": "ProfilePage",
      "@id": `https://resourcecareers.ca/blog/author/${author.slug}`
    },
    "article": posts.slice(0, 5).map(post => ({
      "@type": "Article",
      "headline": post.title,
      "url": `https://resourcecareers.ca/blog/${post.slug}`
    }))
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const author = await getAuthor(params.slug)
  
  if (!author) {
    notFound()
  }

  const posts = await getAuthorPosts(author.id)
  const authorSchema = AuthorSchema(author, posts)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
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
                <li className="text-gray-900 font-medium">Authors</li>
              </ol>
            </nav>
            
            <div className="flex items-start gap-8">
              {author.avatar_url && (
                <img 
                  src={author.avatar_url} 
                  alt={author.name}
                  className="w-32 h-32 rounded-full"
                />
              )}
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{author.name}</h1>
                
                {author.credentials && (
                  <p className="text-lg text-gray-600 mb-4">{author.credentials}</p>
                )}
                
                {author.bio && (
                  <p className="text-gray-700 mb-6 max-w-3xl">{author.bio}</p>
                )}
                
                {author.expertise && author.expertise.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {author.expertise.map((area) => (
                        <span
                          key={area}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  {author.linkedin_url && (
                    <a
                      href={author.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  )}
                  
                  {author.twitter_handle && (
                    <a
                      href={`https://twitter.com/${author.twitter_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      @{author.twitter_handle}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Articles by {author.name} ({posts.length})
          </h2>
          
          {posts.length === 0 ? (
            <p className="text-gray-600">No articles published yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const publishDate = new Date(post.published_at!).toLocaleDateString('en-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })

                return (
                  <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                      
                      <h3 className="text-xl font-semibold mb-2">
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Read More →
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </>
  )
}