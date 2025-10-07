'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { BlogCard } from '@/components/blog/blog-card'
import { BlogPost } from '@/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BlogPost[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data.posts || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Search</h1>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {hasSearched && (
        <div>
          {results.length > 0 ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.map((post, index) => (
                  <BlogCard key={post.$id} post={post} index={index} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No results found for "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}