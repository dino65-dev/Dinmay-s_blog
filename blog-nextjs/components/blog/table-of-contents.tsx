'use client'

import { useEffect, useState, useRef } from 'react'
import { ChevronDown, List } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Wait for content to be rendered
    const timer = setTimeout(() => {
      const contentElement = document.querySelector('.markdown-content')
      if (!contentElement) return

      const headingElements = contentElement.querySelectorAll('h1, h2, h3')
      const extractedHeadings: Heading[] = []

      headingElements.forEach((heading, index) => {
        const id = heading.id || `heading-${index}`
        if (!heading.id) {
          heading.id = id
        }

        extractedHeadings.push({
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName[1])
        })
      })

      setHeadings(extractedHeadings)

      // Set up intersection observer for scroll spy
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id)
            }
          })
        },
        {
          rootMargin: '-100px 0px -66%',
          threshold: 0
        }
      )

      headingElements.forEach((heading) => {
        if (observerRef.current) {
          observerRef.current.observe(heading)
        }
      })
    }, 500)

    return () => {
      clearTimeout(timer)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [content])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }

  if (headings.length === 0) return null

  return (
    <div className="sticky top-24 hidden lg:block">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full mb-4 group"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Table of Contents
          </h3>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-90 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          className={`space-y-2 overflow-hidden transition-all duration-500 ${
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {headings.map((heading, index) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left py-2 px-3 rounded-lg transition-all duration-300 hover:translate-x-2 ${
                heading.level === 1 ? 'pl-3' : heading.level === 2 ? 'pl-6' : 'pl-9'
              } ${
                activeId === heading.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'slideIn 0.5s ease-out forwards'
              }}
            >
              <span className="text-sm line-clamp-2">{heading.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}