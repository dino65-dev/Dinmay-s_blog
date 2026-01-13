import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BlogPostCard = ({ post, featured = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const cleanExcerpt = (text) => {
    if (!text) return '';
    let cleaned = text.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`[^`]+`/g, '');
    cleaned = cleaned.replace(/#{1,6}\s+/g, '');
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 160) {
      cleaned = cleaned.substring(0, 160) + '...';
    }
    return cleaned || 'Read more...';
  };

  const getOptimizedImageUrl = (url) => {
    if (!url) return null;
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/q_auto,f_auto,w_600,h_400,c_fill/');
    }
    return url;
  };

  if (featured) {
    return (
      <Link to={`/post/${post.slug}`} className="block group">
        <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/25">
          <div className="relative overflow-hidden rounded-[1.4rem] bg-white dark:bg-gray-900 h-full">
            {post.featuredImage && !imageError ? (
              <div className="relative h-64 md:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                )}
                <img
                  src={getOptimizedImageUrl(post.featuredImage)}
                  alt={post.title}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium mb-3">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Featured
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2 font-display">
                    {post.title}
                  </h2>
                  <p className="text-white/80 text-sm">{formatDate(post.publishedDate)}</p>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-4">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  Featured
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 font-display group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {cleanExcerpt(post.excerpt)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{formatDate(post.publishedDate)}</p>
              </div>
            )}
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/post/${post.slug}`} className="block group">
      <article className="relative overflow-hidden rounded-2xl glass border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
        <div className="flex flex-col sm:flex-row">
          {post.featuredImage && !imageError && (
            <div className="relative w-full sm:w-48 md:w-56 h-48 sm:h-auto overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 dark:to-gray-900/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <img
                src={getOptimizedImageUrl(post.featuredImage)}
                alt={post.title}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          )}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 font-display group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
              {post.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {cleanExcerpt(post.excerpt)}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(post.publishedDate)}
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all duration-300">
                Read more
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </div>
        {/* Hover gradient border effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
        }} />
      </article>
    </Link>
  );
};

export default BlogPostCard;
