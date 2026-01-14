import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import api from '../utils/api';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSiteSettings();
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
      
      if (contentType !== 'all') filters.contentType = contentType;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      const results = await api.searchPosts(filters);
      setPosts(results);
      
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

  const cleanExcerpt = (text) => {
    if (!text) return '';
    return text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_~]+/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 150);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-script text-xl md:text-2xl text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            Dinmay's Blog
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Available for work
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-32 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-gray-600 dark:text-gray-400">Find what you need</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-amber-500 mb-4">
              Search Posts
            </h1>
          </div>
          
          {/* Search Form */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 mb-8">
            <form onSubmit={handleSearch}>
              {/* Main Search */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, content, or excerpt..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Search Button */}
              <div className="flex gap-3 mb-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </span>
                  )}
                </Button>
              </div>

              {/* Advanced Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              >
                <svg className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Advanced Filters
              </button>

              {/* Advanced Filters */}
              {showAdvanced && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Content Type</Label>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="rounded-xl">
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
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 mb-2 block">From Date</Label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 mb-2 block">To Date</Label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Order</Label>
                    <Select value={order} onValueChange={setOrder}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="outline" onClick={handleReset} className="w-full rounded-full">
                    Reset All Filters
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Results */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
            </div>
          )}

          {!loading && searched && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {posts.length} {posts.length === 1 ? 'result' : 'results'}
                  {searchQuery && <span className="text-gray-500 dark:text-gray-400 font-normal"> for "{searchQuery}"</span>}
                </h2>
              </div>

              {posts.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.slug}`}
                      className="group flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-900 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="w-full md:w-48 h-48 md:h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(post.publishedDate)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-400" />
                          <span className="text-xs text-amber-500 font-medium">
                            {post.contentType === 'markdown' ? 'Markdown' : 'HTML'}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {cleanExcerpt(post.excerpt || post.content)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && !searched && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ready to explore?</h3>
              <p className="text-gray-600 dark:text-gray-400">Enter a search term or use advanced filters to find posts.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © 2025 Dinmay's Blog. All Rights Reserved
          </p>
          <nav className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <Link to="/all-posts" className="hover:text-amber-500 transition-colors">Posts</Link>
            <Link to="/about" className="hover:text-amber-500 transition-colors">About</Link>
            <Link to="/admin" className="hover:text-amber-500 transition-colors">Admin</Link>
          </nav>
        </div>
      </footer>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-2 py-2 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-full shadow-2xl">
          <Link to="/" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">
            Home
          </Link>
          <Link to="/all-posts" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">
            Posts
          </Link>
          <Link to="/about" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">
            About
          </Link>
          <Link to="/search" className="px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-full">
            Search
          </Link>
          <Link to="/admin" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">
            Admin
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default SearchPage;
