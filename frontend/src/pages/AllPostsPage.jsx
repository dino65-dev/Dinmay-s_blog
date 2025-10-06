import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import BlogPostCard from '../components/BlogPostCard';
import api from '../utils/api';

const AllPostsPage = () => {
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-12 text-black">All Posts</h1>
        {posts.length === 0 ? (
          <p className="text-center text-gray-600">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))
        )}
      </main>
    </div>
  );
};

export default AllPostsPage;