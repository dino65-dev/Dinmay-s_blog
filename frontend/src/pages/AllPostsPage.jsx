import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import BlogPostCard from '../components/BlogPostCard';
import { mockBlogPosts } from '../mockData';

const AllPostsPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // TODO: Replace with API call
    setPosts(mockBlogPosts);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-12 text-black">All Posts</h1>
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </main>
    </div>
  );
};

export default AllPostsPage;