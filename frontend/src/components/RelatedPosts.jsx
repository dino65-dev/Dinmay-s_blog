import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const RelatedPosts = ({ currentPostId }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const allPosts = await api.getPosts();
        // Filter out current post and get up to 3 latest posts
        const filtered = allPosts
          .filter(post => post.id !== currentPostId)
          .slice(0, 3);
        setRelatedPosts(filtered);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [currentPostId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <p className="text-gray-600 dark:text-gray-400">Loading related posts...</p>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Related Posts</h3>
      <div className="space-y-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.slug}`}
            className="block group"
          >
            <div className="flex gap-4">
              {post.featuredImage && (
                <div className="w-24 h-24 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                  {post.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {post.excerpt}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatDate(post.publishedDate)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
