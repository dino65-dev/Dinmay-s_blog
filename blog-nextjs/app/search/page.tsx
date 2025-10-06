'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { BlogCard } from '@/components/blog/blog-card'
import { BlogPost } from '@/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState&lt;BlogPost[]&gt;([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () =&gt; {
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

  const handleKeyPress = (e: React.KeyboardEvent) =&gt; {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    &lt;div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"&gt;
      &lt;div className="max-w-3xl mx-auto mb-12"&gt;
        &lt;h1 className="text-4xl md:text-5xl font-bold mb-6 text-center"&gt;Search&lt;/h1&gt;
        &lt;div className="flex gap-2"&gt;
          &lt;Input
            type="text"
            placeholder="Search for posts..."
            value={query}
            onChange={(e) =&gt; setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          /&gt;
          &lt;Button onClick={handleSearch} disabled={isSearching}&gt;
            &lt;Search className="w-4 h-4 mr-2" /&gt;
            {isSearching ? 'Searching...' : 'Search'}
          &lt;/Button&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {hasSearched &amp;&amp; (
        &lt;div&gt;
          {results.length &gt; 0 ? (
            &lt;&gt;
              &lt;p className="text-gray-600 dark:text-gray-400 mb-6"&gt;
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              &lt;/p&gt;
              &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"&gt;
                {results.map((post, index) =&gt; (
                  &lt;BlogCard key={post.$id} post={post} index={index} /&gt;
                ))}
              &lt;/div&gt;
            &lt;/&gt;
          ) : (
            &lt;div className="text-center py-12"&gt;
              &lt;p className="text-gray-500 dark:text-gray-400 text-lg"&gt;
                No results found for "{query}"
              &lt;/p&gt;
            &lt;/div&gt;
          )}
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  )
}