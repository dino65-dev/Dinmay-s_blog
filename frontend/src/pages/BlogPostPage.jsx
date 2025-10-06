import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { mockBlogPosts } from '../mockData';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    // TODO: Replace with API call
    const foundPost = mockBlogPosts.find((p) => p.slug === slug);
    setPost(foundPost);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-center text-gray-600">Post not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
          <h1 className="text-4xl font-bold mb-4 text-black">{post.title}</h1>
          <p className="text-gray-600 mb-8">Published: {post.publishedDate}</p>
        </div>
        <MarkdownRenderer content={post.content} />
      </main>
    </div>
  );
};

export default BlogPostPage;