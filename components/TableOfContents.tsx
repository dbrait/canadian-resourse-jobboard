'use client'

import { useEffect, useState } from 'react'
import { TableOfContentsItem } from '@/types/blog'

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TableOfContentsItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from markdown content
    const extractHeadings = () => {
      const headingRegex = /^(#{1,6})\s+(.+)$/gm
      const matches = [...content.matchAll(headingRegex)]
      
      const items: TableOfContentsItem[] = matches.map((match, index) => {
        const level = match[1].length
        const text = match[2].trim()
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        
        return {
          id,
          text,
          level
        }
      })

      // Build hierarchical structure
      const structured: TableOfContentsItem[] = []
      const stack: TableOfContentsItem[] = []

      items.forEach(item => {
        // Remove items from stack that are same or lower level
        while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
          stack.pop()
        }

        if (stack.length === 0) {
          structured.push(item)
        } else {
          const parent = stack[stack.length - 1]
          if (!parent.children) parent.children = []
          parent.children.push(item)
        }

        stack.push(item)
      })

      setHeadings(structured)
    }

    extractHeadings()
  }, [content])

  useEffect(() => {
    // Track scroll position to highlight active section
    const handleScroll = () => {
      const headingElements = document.querySelectorAll('h2, h3, h4, h5, h6')
      const scrollPosition = window.scrollY + 100

      let currentActiveId = ''
      headingElements.forEach((element) => {
        if (element.getBoundingClientRect().top + window.scrollY <= scrollPosition) {
          currentActiveId = element.id
        }
      })

      setActiveId(currentActiveId)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const renderHeadings = (items: TableOfContentsItem[], depth = 0) => {
    return (
      <ul className={depth === 0 ? 'space-y-2' : 'mt-2 ml-4 space-y-1'}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm transition-colors ${
                activeId === item.id
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              } ${item.level > 2 ? 'pl-4' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById(item.id)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              {item.text}
            </a>
            {item.children && renderHeadings(item.children, depth + 1)}
          </li>
        ))}
      </ul>
    )
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="bg-gray-50 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Table of Contents</h3>
      {renderHeadings(headings)}
    </nav>
  )
}