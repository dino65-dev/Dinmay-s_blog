import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import BlogPostCard from '../components/BlogPostCard';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 5);

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
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading amazing content...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient transition-colors">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Welcome to my corner of the internet
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6" style={{ animationDelay: '0.1s' }}>
              <span className="gradient-text">Ideas</span>
              <span className="text-gray-900 dark:text-white">, </span>
              <span className="gradient-text">Stories</span>
              <span className="text-gray-900 dark:text-white"> & </span>
              <br className="hidden sm:block" />
              <span className="gradient-text">Code</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8" style={{ animationDelay: '0.2s' }}>
              Exploring the intersection of technology, creativity, and human experience through thoughtful writing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/all-posts"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105"
              >
                Explore All Posts
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
              >
                About Me
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-16">
            {[
              { value: posts.length, label: 'Posts' },
              { value: '1K+', label: 'Readers' },
              { value: '☕', label: 'Coffees' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl glass">
                <div className="text-2xl md:text-3xl font-bold gradient-text font-display">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Posts Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No posts yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to create amazing content!</p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create First Post
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600" />
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Featured</h2>
                </div>
                <BlogPostCard post={featuredPost} featured={true} />
              </section>
            )}

            {/* Recent Posts Grid */}
            {recentPosts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500" />
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Posts</h2>
                  </div>
                  <Link
                    to="/all-posts"
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    View all
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {recentPosts.map((post, index) => (
                    <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <BlogPostCard post={post} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CTA Section */}
            <section className="mt-24">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12">
                <div className="relative z-10 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-display">Want to create your own posts?</h2>
                  <p className="text-white/80 mb-6 max-w-md mx-auto">Access the admin panel to start writing and sharing your thoughts with the world.</p>
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-600 font-medium hover:bg-gray-100 transition-colors"
                  >
                    Go to Admin
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                </div>
                {/* Decorative shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
