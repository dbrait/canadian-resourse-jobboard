'use client'

import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

interface BlogContentProps {
  content: string
}

export default function BlogContent({ content }: BlogContentProps) {
  // Add smooth scrolling for anchor links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault()
        const id = target.getAttribute('href')?.slice(1)
        const element = document.getElementById(id!)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }]
        ]}
        components={{
          // SEO-friendly heading structure
          h1: ({ children }) => <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>,
          h2: ({ children }) => <h3 className="text-2xl font-semibold mt-6 mb-3">{children}</h3>,
          h3: ({ children }) => <h4 className="text-xl font-medium mt-4 mb-2">{children}</h4>,
          
          // Enhanced link styling
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http')
            return (
              <a 
                href={href} 
                className="text-blue-600 hover:text-blue-700 underline"
                {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {children}
              </a>
            )
          },
          
          // Image optimization
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt || ''} 
              className="rounded-lg shadow-md my-6"
              loading="lazy"
            />
          ),
          
          // Table styling
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-200">{children}</table>
            </div>
          ),
          
          // Blockquote styling
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-6 italic text-gray-700">
              {children}
            </blockquote>
          ),
          
          // Code block styling
          pre: ({ children }) => (
            <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto my-6">
              {children}
            </pre>
          ),
          
          code: ({ children }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}