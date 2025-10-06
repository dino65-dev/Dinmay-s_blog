import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarkdownRenderer from '../components/MarkdownRenderer';
import TableOfContents from '../components/TableOfContents';
import SocialShare from '../components/SocialShare';
import RelatedPosts from '../components/RelatedPosts';
import Comments from '../components/Comments';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-center text-gray-600 dark:text-gray-400">Post not found</p>
        </main>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setDeleting(true);
    try {
      await api.deletePost(post.id);
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Sidebar Left - Hidden on mobile, visible on xl screens */}
          <aside className="hidden xl:block xl:col-span-3">
            <div className="sticky top-8">
              <TableOfContents content={post.content} />
            </div>
          </aside>

          {/* Main content - Centered on large screens */}
          <div className="xl:col-span-6 mx-auto w-full max-w-4xl">
            <article>
              {post.featuredImage && (
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
                />
              )}
              <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white flex-1">{post.title}</h1>
                {isAuthenticated && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Published: {formatDate(post.publishedDate)}</p>
              
              {/* Table of Contents - Mobile view */}
              <div className="xl:hidden mb-8">
                <TableOfContents content={post.content} />
              </div>

              <div className="blog-content">
                <MarkdownRenderer content={post.content} />
              </div>
            </article>

            {/* Social Share */}
            <div className="mt-12">
              <SocialShare title={post.title} url={window.location.href} />
            </div>

            {/* Comments */}
            <div className="mt-12">
              <Comments postId={post.id} />
            </div>
          </div>

          {/* Sidebar Right */}
          <aside className="xl:col-span-3">
            <div className="sticky top-8">
              <RelatedPosts currentPostId={post.id} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BlogPostPage;