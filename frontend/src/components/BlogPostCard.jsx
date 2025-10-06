import React from 'react';
import { Link } from 'react-router-dom';

const BlogPostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link 
      to={`/post/${post.slug}`}
      className="block group"
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-12 hover:opacity-80 transition-opacity">
        <div className="flex-shrink-0 w-full sm:w-56 h-48 sm:h-36 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
          {post.featuredImage && (
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-2 text-black dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {post.excerpt}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-500">
            Published: {formatDate(post.publishedDate)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;