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
      
      {/* Table of Contents - Mobile Only */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <TableOfContents content={post.content} />
      </div>

      <main className="w-full py-8 md:py-12">
        <div className="max-w-[95%] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6">
          <div className="flex gap-6">
            {/* Sidebar Left - Table of Contents (Desktop) */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-8">
                <TableOfContents content={post.content} />
              </div>
            </aside>

            {/* Main content - MUCH WIDER NOW */}
            <div className="flex-1 w-full">
              <article className="w-full">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white flex-1">{post.title}</h1>
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
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">Published: {formatDate(post.publishedDate)}</p>
                
                {post.featuredImage && (
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-auto max-h-[500px] object-contain rounded-lg mb-8"
                  />
                )}

                <div className="blog-content w-full">
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

              {/* Related Posts - Show below content on all screens */}
              <div className="mt-12">
                <RelatedPosts currentPostId={post.id} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPostPage;