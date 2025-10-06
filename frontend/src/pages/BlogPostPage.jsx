import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import MarkdownRenderer from '../components/MarkdownRenderer';
import api from '../utils/api';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await api.getPostBySlug(slug);
        setPost(data);
      } catch (err) {
        setError('Post not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-center text-gray-600">Loading...</p>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-center text-gray-600">Post not found</p>
        </main>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          {post.featuredImage && (
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}
          <h1 className="text-4xl font-bold mb-4 text-black">{post.title}</h1>
          <p className="text-gray-600 mb-8">Published: {formatDate(post.publishedDate)}</p>
        </div>
        <MarkdownRenderer content={post.content} />
      </main>
    </div>
  );
};

export default BlogPostPage;