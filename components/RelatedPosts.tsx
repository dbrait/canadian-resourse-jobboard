import Link from 'next/link'
import { BlogPost } from '@/types/blog'

interface RelatedPostsProps {
  posts: BlogPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {posts.map((post) => {
        const publishDate = new Date(post.published_at!).toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })

        return (
          <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {post.featured_image && (
              <Link href={`/blog/${post.slug}`}>
                <img 
                  src={post.featured_image} 
                  alt={post.featured_image_alt || post.title}
                  className="w-full h-40 object-cover"
                />
              </Link>
            )}
            
            <div className="p-4">
              <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {post.category}
                </span>
                <time dateTime={post.published_at}>{publishDate}</time>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {post.title}
                </Link>
              </h3>
              
              <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
              
              <Link 
                href={`/blog/${post.slug}`}
                className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Read More →
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}