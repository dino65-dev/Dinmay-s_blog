import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import BlogPostCard from '../components/BlogPostCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import api from '../utils/api';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [contentType, setContentType] = useState(searchParams.get('type') || 'all');
  const [startDate, setStartDate] = useState(searchParams.get('start') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // If there's a query in URL, perform search on load
    if (searchParams.get('q')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setSearched(true);
    
    try {
      const filters = {
        q: searchQuery,
        sortBy: sortBy,
        order: order,
      };
      
      if (contentType !== 'all') {
        filters.contentType = contentType;
      }
      
      if (startDate) {
        filters.startDate = startDate;
      }
      
      if (endDate) {
        filters.endDate = endDate;
      }
      
      const results = await api.searchPosts(filters);
      setPosts(results);
      
      // Update URL params
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (contentType !== 'all') params.set('type', contentType);
      if (startDate) params.set('start', startDate);
      if (endDate) params.set('end', endDate);
      if (sortBy !== 'date') params.set('sort', sortBy);
      if (order !== 'desc') params.set('order', order);
      setSearchParams(params);
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setContentType('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setOrder('desc');
    setPosts([]);
    setSearched(false);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-black">Search Blog Posts</h1>
        
        {/* Search Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch}>
            {/* Basic Search */}
            <div className="mb-4">
              <Label htmlFor="search-query">Search</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="search-query"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, content, or excerpt..."
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mb-4"
            >
              {showAdvanced ? '▼' : '▶'} Advanced Filters
            </Button>

            {/* Advanced Filters */}
            {showAdvanced && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Content Type Filter */}
                  <div>
                    <Label htmlFor="content-type">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger id="content-type" className="mt-2">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <Label htmlFor="sort-by">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort-by" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <Label htmlFor="start-date">From Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <Label htmlFor="end-date">To Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Select value={order} onValueChange={setOrder}>
                    <SelectTrigger id="order" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Button */}
                <Button type="button" variant="outline" onClick={handleReset} className="w-full">
                  Reset All Filters
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Search Results */}
        {loading && (
          <p className="text-center text-gray-600">Searching...</p>
        )}

        {!loading && searched && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-black">
                {posts.length} {posts.length === 1 ? 'result' : 'results'} found
                {searchQuery && ` for "${searchQuery}"`}
              </h2>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 mb-2">No posts found matching your search.</p>
                <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">Enter a search term or use advanced filters to find posts.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
