import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import BlogPostCard from '../components/BlogPostCard';
import api from '../utils/api';

const AllPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(p => p.contentType === filter);

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient transition-colors">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading posts...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient transition-colors">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600" />
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Archive</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-display">
                <span className="gradient-text">All Posts</span>
              </h1>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                {posts.length} {posts.length === 1 ? 'article' : 'articles'} and counting
              </p>
            </div>
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              {['all', 'markdown', 'html'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === f
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No posts found</h2>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filter or check back later.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 stagger-children">
            {filteredPosts.map((post, index) => (
              <div key={post.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <BlogPostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllPostsPage;
