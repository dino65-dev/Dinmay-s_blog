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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient transition-colors">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading post...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen mesh-gradient transition-colors">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-24 h-24 mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The post you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-indigo-600 to-purple-600">
              Go Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient transition-colors">
      <Header />
      
      {/* Hero Section with Featured Image */}
      {post.featuredImage && (
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10" />
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display drop-shadow-lg">
              {post.title}
            </h1>
          </div>
        </div>
      )}

      {/* Mobile TOC */}
      <div className="lg:hidden max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <TableOfContents content={post.content} />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex gap-8">
          {/* Sidebar Left - TOC */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <TableOfContents content={post.content} />
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Post Header (if no featured image) */}
            {!post.featuredImage && (
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white font-display mb-4">
                  {post.title}
                </h1>
              </header>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  D
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dinmay</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.publishedDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                  {post.contentType === 'markdown' ? 'Markdown' : 'HTML'}
                </span>
                {isAuthenticated && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="ml-2"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* Social Share */}
            <div className="mt-12">
              <SocialShare title={post.title} url={window.location.href} />
            </div>

            {/* Comments */}
            <div className="mt-12">
              <Comments postId={post.id} />
            </div>

            {/* Related Posts */}
            <div className="mt-12">
              <RelatedPosts currentPostId={post.id} />
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default BlogPostPage;
