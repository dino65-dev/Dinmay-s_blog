import React from 'react';
import { Link } from 'react-router-dom';

const BlogPostCard = ({ post }) => {
  return (
    <Link 
      to={`/post/${post.slug}`}
      className="block group"
    >
      <div className="flex gap-6 mb-12 hover:opacity-80 transition-opacity">
        <div className="flex-shrink-0 w-56 h-36 overflow-hidden rounded-md bg-gray-100">
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-2 text-black group-hover:text-gray-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-sm text-gray-600">
            Published: {post.publishedDate}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;