import React from 'react';
import { Link } from 'react-router-dom';

const BlogPostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Clean up excerpt - remove markdown syntax and code blocks
  const cleanExcerpt = (text) => {
    if (!text) return '';
    
    // Remove code blocks
    let cleaned = text.replace(/```[\s\S]*?```/g, '');
    // Remove inline code
    cleaned = cleaned.replace(/`[^`]+`/g, '');
    // Remove markdown headers
    cleaned = cleaned.replace(/#{1,6}\s+/g, '');
    // Remove markdown links
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    // Remove markdown bold/italic
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Truncate to reasonable length
    if (cleaned.length > 200) {
      cleaned = cleaned.substring(0, 200) + '...';
    }
    
    return cleaned || 'Read more...';
  };

  return (
    <Link 
      to={`/post/${post.slug}`}
      className="block group"
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
        {post.featuredImage && (
          <div className="flex-shrink-0 w-full lg:w-80 h-56 lg:h-48 flex items-center justify-center rounded-lg overflow-hidden">
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3 text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
            {cleanExcerpt(post.excerpt)}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(post.publishedDate)}
            </span>
            <span className="text-blue-600 dark:text-blue-400 group-hover:underline">
              Read more →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;