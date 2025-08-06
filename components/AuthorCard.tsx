import { Author } from '@/types/blog'
import Link from 'next/link'

interface AuthorCardProps {
  author: Author
}

export default function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">About the Author</h3>
      
      <div className="flex items-start gap-4">
        {author.avatar_url && (
          <img 
            src={author.avatar_url} 
            alt={author.name}
            className="w-16 h-16 rounded-full"
          />
        )}
        
        <div className="flex-1">
          <Link 
            href={`/blog/author/${author.slug}`}
            className="text-lg font-medium text-gray-900 hover:text-blue-600"
          >
            {author.name}
          </Link>
          
          {author.credentials && (
            <p className="text-sm text-gray-600 mt-1">{author.credentials}</p>
          )}
          
          {author.bio && (
            <p className="text-sm text-gray-700 mt-3">{author.bio}</p>
          )}
          
          {author.expertise && author.expertise.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Areas of Expertise:</p>
              <div className="flex flex-wrap gap-2">
                {author.expertise.map((area) => (
                  <span
                    key={area}
                    className="bg-white text-xs px-2 py-1 rounded text-gray-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4 mt-4">
            {author.linkedin_url && (
              <a
                href={author.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                LinkedIn →
              </a>
            )}
            
            {author.twitter_handle && (
              <a
                href={`https://twitter.com/${author.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Twitter →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}