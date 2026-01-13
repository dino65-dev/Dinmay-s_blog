import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import TableOfContents from '../components/TableOfContents';
import SocialShare from '../components/SocialShare';
import RelatedPosts from '../components/RelatedPosts';
import Comments from '../components/Comments';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeleting(true);
    try {
      await api.deletePost(post.id);
      toast({ title: "Success", description: "Post deleted successfully" });
      navigate('/');
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to delete post", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // Start editing
  const handleStartEdit = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImage(post.featuredImage || '');
    setEditExcerpt(post.excerpt || '');
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
    setEditImage('');
    setEditExcerpt('');
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    try {
      const updatedPost = await api.updatePost(post.id, {
        title: editTitle,
        content: editContent,
        featuredImage: editImage,
        excerpt: editExcerpt || editContent.substring(0, 150),
      });
      setPost(updatedPost);
      setIsEditing(false);
      toast({ title: "Success", description: "Post updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to update post", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-950 transition-colors duration-300">
        {/* Header */}
        <header className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-12 py-4 sm:py-6 transition-all duration-300 ${
          scrolled ? 'bg-cream/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm' : ''
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="font-script text-lg sm:text-xl md:text-2xl text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Dinmay's Blog
            </Link>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="pt-32 pb-32 px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The post you're looking for doesn't exist.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </main>

        {/* Floating Bottom Navigation */}
        <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto max-w-lg">
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-full shadow-2xl">
            <Link to="/" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Home</Link>
            <Link to="/all-posts" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Posts</Link>
            <Link to="/about" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">About</Link>
            <Link to="/search" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Search</Link>
            <Link to="/admin" className="px-3 sm:px-5 py-2 sm:py-2.5 bg-amber-500 text-white text-xs sm:text-sm font-medium rounded-full">Admin</Link>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-12 py-4 sm:py-6 transition-all duration-300 ${
        scrolled ? 'bg-cream/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm' : ''
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-script text-lg sm:text-xl md:text-2xl text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            Dinmay's Blog
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Available for work
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Featured Image */}
      {post.featuredImage && (
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden mt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10" />
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 max-w-4xl mx-auto px-6 md:px-12 pb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
              {post.title}
            </h1>
          </div>
        </div>
      )}

      {/* Mobile TOC */}
      <div className="lg:hidden max-w-4xl mx-auto px-6 pt-6">
        <TableOfContents content={post.content} />
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
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
              <header className="mb-8 pt-24">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {post.title}
                </h1>
              </header>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400">
                  <img 
                    src="https://assets-v2.codedesign.ai/storage/v1/object/public/69666207f25d5592fb297096_0af76837/asset-11d4c42a" 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dinmay</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.publishedDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <span className="px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                  {post.contentType === 'markdown' ? 'Markdown' : 'HTML'}
                </span>
                {isAuthenticated && (
                  <button 
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-code:text-amber-600 dark:prose-code:text-amber-400 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700">
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

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © 2025 Dinmay's Blog. All Rights Reserved
          </p>
          <nav className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <Link to="/all-posts" className="hover:text-amber-500 transition-colors">Posts</Link>
            <Link to="/about" className="hover:text-amber-500 transition-colors">About</Link>
            <Link to="/admin" className="hover:text-amber-500 transition-colors">Admin</Link>
          </nav>
        </div>
      </footer>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto max-w-lg">
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-full shadow-2xl">
          <Link to="/" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Home</Link>
          <Link to="/all-posts" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Posts</Link>
          <Link to="/about" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">About</Link>
          <Link to="/search" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Search</Link>
          <Link to="/admin" className="px-3 sm:px-5 py-2 sm:py-2.5 bg-amber-500 text-white text-xs sm:text-sm font-medium rounded-full hover:bg-amber-600 transition-colors">Admin</Link>
        </div>
      </nav>
    </div>
  );
};

export default BlogPostPage;
