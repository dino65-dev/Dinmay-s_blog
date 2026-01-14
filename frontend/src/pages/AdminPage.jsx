import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import AdvancedMarkdownEditor from '../components/AdvancedMarkdownEditor';
import FeaturedMedia from '../components/FeaturedMedia';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

const AdminPage = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { settings, refreshSettings } = useSiteSettings();
  const [password, setPassword] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // HTML Editor State
  const [htmlTitle, setHtmlTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlImage, setHtmlImage] = useState('');
  const [htmlImageError, setHtmlImageError] = useState('');
  const [htmlTags, setHtmlTags] = useState([]);
  const [htmlTagInput, setHtmlTagInput] = useState('');

  // Markdown Editor State
  const [mdTitle, setMdTitle] = useState('');
  const [mdContent, setMdContent] = useState('');
  const [mdImage, setMdImage] = useState('');
  const [mdImageError, setMdImageError] = useState('');
  const [mdTags, setMdTags] = useState([]);
  const [mdTagInput, setMdTagInput] = useState('');

  // Admin Panel State
  const [adminTitle, setAdminTitle] = useState('');
  const [adminContent, setAdminContent] = useState('');
  const [adminImage, setAdminImage] = useState('');
  const [adminExcerpt, setAdminExcerpt] = useState('');
  const [adminImageError, setAdminImageError] = useState('');
  const [adminTags, setAdminTags] = useState([]);
  const [adminTagInput, setAdminTagInput] = useState('');

  // Messages State
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Available tags suggestions
  const [availableTags, setAvailableTags] = useState([]);

  // Posts Management State
  const [allPosts, setAllPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editTagInput, setEditTagInput] = useState('');

  // About Page State
  const [aboutContent, setAboutContent] = useState('');
  const [loadingAbout, setLoadingAbout] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);

  // Site Settings State
  const [siteSettings, setSiteSettings] = useState({
    blog_title: "Dinmay's Blog",
    blog_description: "A personal blog about technology, AI, and more",
    author_name: "Dinmay",
    author_bio: "",
    author_avatar: "",
    social_twitter: "",
    social_github: "",
    social_linkedin: "",
    footer_text: "© 2025 Dinmay's Blog. All Rights Reserved"
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
      fetchAvailableTags();
      fetchAllPosts();
      fetchAboutContent();
      fetchSiteSettings();
    }
  }, [isAuthenticated]);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await api.getContactMessages();
      setMessages(data);
      const unread = data.filter(m => !m.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const tags = await api.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchAllPosts = async () => {
    setLoadingPosts(true);
    try {
      const posts = await api.getPosts();
      setAllPosts(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchAboutContent = async () => {
    setLoadingAbout(true);
    try {
      const data = await api.getAbout();
      setAboutContent(data.content || '');
    } catch (error) {
      console.error('Error fetching about:', error);
    } finally {
      setLoadingAbout(false);
    }
  };

  const fetchSiteSettings = async () => {
    setLoadingSettings(true);
    try {
      const settings = await api.getSiteSettings();
      setSiteSettings(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveAbout = async () => {
    setSavingAbout(true);
    try {
      await api.updateAbout(aboutContent);
      toast({ title: "Success", description: "About page updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save about page", variant: "destructive" });
    } finally {
      setSavingAbout(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.updateSiteSettings(siteSettings);
      await refreshSettings(); // Refresh the global settings context
      toast({ title: "Success", description: "Site settings updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(postId);
      setAllPosts(allPosts.filter(p => p.id !== postId));
      toast({ title: "Success", description: "Post deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  };

  const handleEditPost = (post) => {
    setEditingPost({
      ...post,
      tags: post.tags || []
    });
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    try {
      const updated = await api.updatePost(editingPost.id, {
        title: editingPost.title,
        content: editingPost.content,
        featuredImage: editingPost.featuredImage,
        excerpt: editingPost.excerpt,
        tags: editingPost.tags
      });
      setAllPosts(allPosts.map(p => p.id === updated.id ? updated : p));
      setEditingPost(null);
      toast({ title: "Success", description: "Post updated successfully" });
      fetchAvailableTags();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
    }
  };

  const isDirectMediaUrl = (url) => {
    if (!url) return true;
    // Image extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)/i;
    // Video extensions
    const videoExtensions = /\.(mp4|webm|ogg|mov|m4v)/i;
    if (imageExtensions.test(url) || videoExtensions.test(url)) return true;
    // Known media hosts
    const mediaHosts = ['unsplash.com', 'imgur.com', 'ibb.co', 'cloudinary.com', 'imagekit.io', 'images.pexels.com', 'youtube.com', 'youtu.be', 'vimeo.com', 'screenpal.com', 'giphy.com'];
    return mediaHosts.some(host => url.includes(host));
  };

  const validateMediaUrl = (url) => {
    if (!url) return '';
    if (url.includes('pin.it') || url.includes('pinterest.com/pin/')) {
      return '⚠️ Pinterest links don\'t work. Right-click the image on Pinterest and select "Copy Image Address"';
    }
    if (url.includes('instagram.com') || url.includes('facebook.com') || url.includes('twitter.com')) {
      return '⚠️ Social media page links don\'t work. You need the direct media URL';
    }
    if (!isDirectMediaUrl(url)) {
      return '⚠️ URL should end with media extension (.jpg, .png, .gif, .mp4, .webm) or be from a known media host';
    }
    return '';
  };

  // Detect if URL is a video
  const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = /\.(mp4|webm|ogg|mov|m4v)/i;
    const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'screenpal.com'];
    return videoExtensions.test(url) || videoHosts.some(host => url.includes(host));
  };

  // Keep legacy function name for backward compatibility
  const isDirectImageUrl = isDirectMediaUrl;
  const validateImageUrl = validateMediaUrl;

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(password);
    if (result.success) {
      toast({ title: "Success", description: "Logged in successfully" });
    } else {
      toast({ title: "Error", description: "Incorrect password", variant: "destructive" });
    }
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  // Tag handlers
  const addTag = (tags, setTags, tagInput, setTagInput) => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tags, setTags, tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e, tags, setTags, tagInput, setTagInput) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tags, setTags, tagInput, setTagInput);
    }
  };

  const handleHtmlSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = generateSlug(htmlTitle);
      await api.createPost({
        title: htmlTitle, slug, content: htmlContent, featuredImage: htmlImage,
        contentType: 'html', excerpt: htmlContent.substring(0, 150), tags: htmlTags,
      });
      toast({ title: "Success", description: "Blog post published successfully!" });
      setHtmlTitle(''); setHtmlContent(''); setHtmlImage(''); setHtmlTags([]);
      fetchAvailableTags();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || error.message, variant: "destructive" });
    }
  };

  const handleMarkdownSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = generateSlug(mdTitle);
      await api.createPost({
        title: mdTitle, slug, content: mdContent, featuredImage: mdImage,
        contentType: 'markdown', excerpt: mdContent.substring(0, 150), tags: mdTags,
      });
      toast({ title: "Success", description: "Blog post published successfully!" });
      setMdTitle(''); setMdContent(''); setMdImage(''); setMdTags([]);
      fetchAvailableTags();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || error.message, variant: "destructive" });
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = generateSlug(adminTitle);
      await api.createPost({
        title: adminTitle, slug, content: adminContent, featuredImage: adminImage,
        contentType: 'markdown', excerpt: adminExcerpt || adminContent.substring(0, 150), tags: adminTags,
      });
      toast({ title: "Success", description: "Blog post published successfully!" });
      setAdminTitle(''); setAdminContent(''); setAdminImage(''); setAdminExcerpt(''); setAdminTags([]);
      fetchAvailableTags();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || error.message, variant: "destructive" });
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.markMessageRead(messageId);
      setMessages(messages.map(m => m.id === messageId ? { ...m, read: true } : m));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark as read", variant: "destructive" });
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.deleteContactMessage(messageId);
      const deletedMsg = messages.find(m => m.id === messageId);
      setMessages(messages.filter(m => m.id !== messageId));
      if (deletedMsg && !deletedMsg.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast({ title: "Success", description: "Message deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete message", variant: "destructive" });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Tag Input Component
  const TagInput = ({ tags, setTags, tagInput, setTagInput, placeholder = "Add tags..." }) => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tags, setTags, tag)}
              className="w-4 h-4 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 flex items-center justify-center"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => handleTagKeyDown(e, tags, setTags, tagInput, setTagInput)}
          placeholder={placeholder}
          className="rounded-xl flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addTag(tags, setTags, tagInput, setTagInput)}
          className="rounded-xl"
        >
          Add
        </Button>
      </div>
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Suggestions:</span>
          {availableTags.filter(t => !tags.includes(t)).slice(0, 5).map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { if (!tags.includes(tag)) setTags([...tags, tag]); }}
              className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-950 transition-colors duration-300">
        {/* Header */}
        <header className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-12 py-4 sm:py-6 transition-all duration-300 ${
          scrolled ? 'bg-cream/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm' : ''
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="font-script text-lg sm:text-xl md:text-2xl text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            {settings.blog_title}
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

        <main className="pt-24 sm:pt-32 pb-24 sm:pb-32 px-4 sm:px-6 md:px-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Secure Access</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-amber-500 mb-4">Admin Login</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 mb-2 block">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full py-5 sm:py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100">
                  Login
                </Button>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 sm:py-12 px-4 sm:px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <p className="text-gray-500 text-xs sm:text-sm">{settings.footer_text}</p>
            <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
              <Link to="/all-posts" className="hover:text-amber-500 transition-colors">Posts</Link>
              <Link to="/about" className="hover:text-amber-500 transition-colors">About</Link>
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
            {settings.blog_title}
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
            <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium">Admin</span>
            </div>
            <button
              onClick={logout}
              className="px-3 sm:px-5 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 sm:pt-32 pb-24 sm:pb-32 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Content Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-amber-500">Admin Panel</h1>
          </div>

          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 mb-6 sm:mb-8 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 h-auto gap-1">
              <TabsTrigger value="posts" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs py-2 sm:py-2.5">Posts</TabsTrigger>
              <TabsTrigger value="html" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs py-2 sm:py-2.5">HTML</TabsTrigger>
              <TabsTrigger value="markdown" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs py-2 sm:py-2.5">Markdown</TabsTrigger>
              <TabsTrigger value="admin" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs py-2 sm:py-2.5">Quick</TabsTrigger>
              <TabsTrigger value="about" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs py-2 sm:py-2.5">About</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs py-2 sm:py-2.5">Settings</TabsTrigger>
              <TabsTrigger value="tags" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs py-2 sm:py-2.5">Tags</TabsTrigger>
              <TabsTrigger value="messages" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs py-2 sm:py-2.5 relative">
                Msgs
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Posts Management Tab */}
            <TabsContent value="posts">
              <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">All Posts</h2>
                  <button
                    onClick={fetchAllPosts}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Refresh posts"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                {loadingPosts ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                  </div>
                ) : allPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No posts yet. Create your first post!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allPosts.map((post) => (
                      <div key={post.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
                        {post.featuredImage && (
                          <img src={post.featuredImage} alt="" className="w-full sm:w-20 h-32 sm:h-14 object-cover rounded-lg" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{post.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(post.publishedDate).toLocaleDateString()}
                            </span>
                            {post.tags && post.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditPost(post)} className="rounded-lg text-xs">
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeletePost(post.id)} className="rounded-lg text-xs">
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Post Modal */}
              {editingPost && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Post</h3>
                        <button onClick={() => setEditingPost(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Title</Label>
                          <Input
                            value={editingPost.title}
                            onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Featured Media URL (image, GIF, video)</Label>
                          <Input
                            value={editingPost.featuredImage || ''}
                            onChange={(e) => setEditingPost({...editingPost, featuredImage: e.target.value})}
                            placeholder="https://example.com/image.jpg or video URL"
                            className="rounded-xl"
                          />
                          {editingPost.featuredImage && (
                            <div className="mt-2 w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-xl border overflow-hidden">
                              <FeaturedMedia 
                                src={editingPost.featuredImage} 
                                alt="Preview" 
                                className="max-w-full max-h-full object-contain"
                                containerClassName="w-full h-full flex items-center justify-center"
                                autoPlay={true}
                                loop={true}
                                muted={true}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Excerpt</Label>
                          <Input
                            value={editingPost.excerpt || ''}
                            onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Tags</Label>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 min-h-[38px] p-2 border rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              {(editingPost.tags || []).map((tag, index) => (
                                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => setEditingPost({...editingPost, tags: editingPost.tags.filter((_, i) => i !== index)})}
                                    className="hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full p-0.5"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </span>
                              ))}
                              <input
                                type="text"
                                value={editTagInput}
                                onChange={(e) => setEditTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault();
                                    const trimmedTag = editTagInput.trim().toLowerCase();
                                    if (trimmedTag && !(editingPost.tags || []).includes(trimmedTag)) {
                                      setEditingPost({...editingPost, tags: [...(editingPost.tags || []), trimmedTag]});
                                    }
                                    setEditTagInput('');
                                  }
                                }}
                                placeholder={editingPost.tags?.length > 0 ? "Add more tags..." : "Add tags (press Enter)"}
                                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-gray-700 dark:text-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const trimmedTag = editTagInput.trim().toLowerCase();
                                  if (trimmedTag && !(editingPost.tags || []).includes(trimmedTag)) {
                                    setEditingPost({...editingPost, tags: [...(editingPost.tags || []), trimmedTag]});
                                  }
                                  setEditTagInput('');
                                }}
                                className="px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg"
                              >
                                Add
                              </button>
                            </div>
                            {availableTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs text-gray-500 mr-1">Suggested:</span>
                                {availableTags.filter(t => !(editingPost.tags || []).includes(t)).slice(0, 5).map((tag, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setEditingPost({...editingPost, tags: [...(editingPost.tags || []), tag]})}
                                    className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400"
                                  >
                                    + {tag}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Content</Label>
                          <Textarea
                            value={editingPost.content}
                            onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                            className="rounded-xl font-mono text-sm min-h-[200px]"
                            rows={10}
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button onClick={handleUpdatePost} className="flex-1 rounded-full">Save Changes</Button>
                          <Button variant="outline" onClick={() => setEditingPost(null)} className="rounded-full">Cancel</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="html">
              <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Create Post - HTML Editor</h2>
                <form onSubmit={handleHtmlSubmit}>
                  <div className="mb-4">
                    <Label htmlFor="html-title" className="text-gray-700 dark:text-gray-300 mb-2 block text-sm sm:text-base">Title</Label>
                    <Input id="html-title" value={htmlTitle} onChange={(e) => setHtmlTitle(e.target.value)} placeholder="Enter post title" required className="rounded-xl" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="html-image" className="text-gray-700 dark:text-gray-300 mb-2 block text-sm sm:text-base">Featured Media URL</Label>
                    <Input
                      id="html-image"
                      value={htmlImage}
                      onChange={(e) => { setHtmlImage(e.target.value); setHtmlImageError(validateMediaUrl(e.target.value)); }}
                      placeholder="https://example.com/image.jpg or video URL"
                      className={`rounded-xl ${htmlImageError ? 'border-yellow-500' : ''}`}
                    />
                    {htmlImageError && <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{htmlImageError}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Supports images, GIFs, MP4 videos, YouTube, Vimeo links</p>
                    {htmlImage && !htmlImageError && (
                      <div className="mt-2 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl border overflow-hidden">
                        <FeaturedMedia 
                          src={htmlImage} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain rounded"
                          containerClassName="w-full h-full"
                          autoPlay={true}
                          loop={true}
                          muted={true}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm sm:text-base">Tags</Label>
                    <TagInput tags={htmlTags} setTags={setHtmlTags} tagInput={htmlTagInput} setTagInput={setHtmlTagInput} />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="html-content" className="text-gray-700 dark:text-gray-300 mb-2 block text-sm sm:text-base">Content (HTML/Markdown)</Label>
                    <Textarea id="html-content" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} placeholder="<h1>Your HTML content</h1> or # Your markdown" className="rounded-xl font-mono text-sm" rows={12} />
                  </div>
                  <Button type="submit" className="w-full py-5 sm:py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100">
                    Publish Post
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="markdown">
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <form onSubmit={handleMarkdownSubmit}>
                  <div className="mb-6 p-3 sm:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl">
                    <Label htmlFor="md-image" className="text-sm sm:text-base font-semibold mb-2 block text-gray-900 dark:text-white">Featured Image URL</Label>
                    <Input
                      id="md-image"
                      value={mdImage}
                      onChange={(e) => { setMdImage(e.target.value); setMdImageError(validateMediaUrl(e.target.value)); }}
                      placeholder="https://example.com/image.jpg or video URL"
                      className={`rounded-xl ${mdImageError ? 'border-yellow-500' : ''}`}
                    />
                    {mdImageError && <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{mdImageError}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Supports images, GIFs, MP4 videos, YouTube, Vimeo links</p>
                    {mdImage && !mdImageError && (
                      <div className="mt-3 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl border overflow-hidden">
                        <FeaturedMedia 
                          src={mdImage} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain rounded"
                          containerClassName="w-full h-full"
                          autoPlay={true}
                          loop={true}
                          muted={true}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-6 p-3 sm:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl">
                    <Label className="text-sm sm:text-base font-semibold mb-2 block text-gray-900 dark:text-white">Tags</Label>
                    <TagInput tags={mdTags} setTags={setMdTags} tagInput={mdTagInput} setTagInput={setMdTagInput} />
                  </div>
                  <div className="min-h-[400px] sm:min-h-[600px]">
                    <AdvancedMarkdownEditor value={mdContent} onChange={setMdContent} title={mdTitle} onTitleChange={setMdTitle} placeholder="Start writing your blog post... Type / for block commands" />
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button type="submit" className="flex-1 py-5 sm:py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100" disabled={!mdTitle || !mdContent}>Publish Post</Button>
                    <Button type="button" variant="outline" className="py-5 sm:py-6 rounded-full" onClick={() => { setMdTitle(''); setMdContent(''); setMdImage(''); setMdImageError(''); setMdTags([]); }}>Clear</Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="admin">
              <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Quick Upload - Paste Content</h2>
                <form onSubmit={handleAdminSubmit}>
                  <div className="mb-4">
                    <Label htmlFor="admin-title" className="text-gray-700 dark:text-gray-300 mb-2 block text-sm sm:text-base">Title</Label>
                    <Input id="admin-title" value={adminTitle} onChange={(e) => setAdminTitle(e.target.value)} placeholder="Enter post title" required className="rounded-xl" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="admin-excerpt" className="text-gray-700 dark:text-gray-300 mb-2 block text-sm sm:text-base">Excerpt</Label>
                    <Input id="admin-excerpt" value={adminExcerpt} onChange={(e) => setAdminExcerpt(e.target.value)} placeholder="Short description of the post" className="rounded-xl" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="admin-image" className="text-gray-700 dark:text-gray-300 mb-2 block text-sm sm:text-base">Featured Media URL</Label>
                    <Input
                      id="admin-image"
                      value={adminImage}
                      onChange={(e) => { setAdminImage(e.target.value); setAdminImageError(validateMediaUrl(e.target.value)); }}
                      placeholder="https://example.com/image.jpg or video URL"
                      className={`rounded-xl ${adminImageError ? 'border-yellow-500' : ''}`}
                    />
                    {adminImageError && <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{adminImageError}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Supports images, GIFs, MP4 videos, YouTube, Vimeo links</p>
                    {adminImage && !adminImageError && (
                      <div className="mt-2 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl border overflow-hidden">
                        <FeaturedMedia 
                          src={adminImage} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain rounded"
                          containerClassName="w-full h-full"
                          autoPlay={true}
                          loop={true}
                          muted={true}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm sm:text-base">Tags</Label>
                    <TagInput tags={adminTags} setTags={setAdminTags} tagInput={adminTagInput} setTagInput={setAdminTagInput} />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="admin-content" className="text-gray-700 dark:text-gray-300 mb-2 block text-sm sm:text-base">Content (HTML/Markdown)</Label>
                    <Textarea id="admin-content" value={adminContent} onChange={(e) => setAdminContent(e.target.value)} placeholder="Paste your pre-written content here..." className="rounded-xl font-mono text-sm" rows={12} />
                  </div>
                  <Button type="submit" className="w-full py-5 sm:py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100">
                    Publish Post
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about">
              <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Edit About Page</h2>
                {loadingAbout ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm sm:text-base">About Content (Markdown supported)</Label>
                      <Textarea
                        value={aboutContent}
                        onChange={(e) => setAboutContent(e.target.value)}
                        placeholder="Write about yourself, your blog, and what readers can expect..."
                        className="rounded-xl font-mono text-sm min-h-[300px]"
                        rows={12}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      💡 Tip: You can use Markdown formatting like **bold**, *italic*, [links](url), and # headings
                    </p>
                    <Button
                      onClick={handleSaveAbout}
                      disabled={savingAbout}
                      className="w-full py-5 sm:py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100"
                    >
                      {savingAbout ? 'Saving...' : 'Save About Page'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Site Settings</h2>
                {loadingSettings ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Basic Settings */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Basic Info</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm">Blog Title</Label>
                          <Input
                            value={siteSettings.blog_title}
                            onChange={(e) => setSiteSettings({...siteSettings, blog_title: e.target.value})}
                            placeholder="My Blog"
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm">Author Name</Label>
                          <Input
                            value={siteSettings.author_name}
                            onChange={(e) => setSiteSettings({...siteSettings, author_name: e.target.value})}
                            placeholder="Your Name"
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm">Blog Description</Label>
                        <Input
                          value={siteSettings.blog_description}
                          onChange={(e) => setSiteSettings({...siteSettings, blog_description: e.target.value})}
                          placeholder="A short description of your blog"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm">Author Avatar URL</Label>
                        <Input
                          value={siteSettings.author_avatar}
                          onChange={(e) => setSiteSettings({...siteSettings, author_avatar: e.target.value})}
                          placeholder="https://example.com/avatar.jpg"
                          className="rounded-xl"
                        />
                        {siteSettings.author_avatar && (
                          <div className="mt-2 w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400">
                            <img src={siteSettings.author_avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm">Author Bio</Label>
                        <Textarea
                          value={siteSettings.author_bio}
                          onChange={(e) => setSiteSettings({...siteSettings, author_bio: e.target.value})}
                          placeholder="A brief bio about yourself"
                          className="rounded-xl"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Social Links</h3>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm">Twitter/X</Label>
                          <Input
                            value={siteSettings.social_twitter}
                            onChange={(e) => setSiteSettings({...siteSettings, social_twitter: e.target.value})}
                            placeholder="@username"
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm">GitHub</Label>
                          <Input
                            value={siteSettings.social_github}
                            onChange={(e) => setSiteSettings({...siteSettings, social_github: e.target.value})}
                            placeholder="username"
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm">LinkedIn</Label>
                          <Input
                            value={siteSettings.social_linkedin}
                            onChange={(e) => setSiteSettings({...siteSettings, social_linkedin: e.target.value})}
                            placeholder="username"
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Footer</h3>
                      <div>
                        <Label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm">Footer Text</Label>
                        <Input
                          value={siteSettings.footer_text}
                          onChange={(e) => setSiteSettings({...siteSettings, footer_text: e.target.value})}
                          placeholder="© 2025 My Blog. All Rights Reserved"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      className="w-full py-5 sm:py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100"
                    >
                      {savingSettings ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tags Management Tab */}
            <TabsContent value="tags">
              <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Tags Management</h2>
                  <button
                    onClick={fetchAvailableTags}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Refresh tags"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>💡 Tip:</strong> Tags are added when creating or editing posts. This page shows all tags currently in use across your posts.
                  </p>
                </div>

                {availableTags.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No tags yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Add tags when creating posts to categorize your content</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {availableTags.length} {availableTags.length === 1 ? 'tag' : 'tags'} in use
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {availableTags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="font-medium">{tag}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tag Usage Tips</h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Use lowercase tags for consistency (e.g., "ai" instead of "AI")</li>
                        <li>• Keep tags short and descriptive</li>
                        <li>• Use common tags across related posts for better filtering</li>
                        <li>• Example tags: ai, ml, python, web-dev, tutorial</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Contact Messages</h2>
                  <button
                    onClick={fetchMessages}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Refresh messages"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border transition-colors ${
                          msg.read
                            ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{msg.firstName}</span>
                              {!msg.read && (
                                <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">New</span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{msg.email}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-3 whitespace-pre-wrap">{msg.message}</p>
                        <div className="flex items-center gap-2">
                          {!msg.read && (
                            <button
                              onClick={() => handleMarkAsRead(msg.id)}
                              className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                          <a
                            href={`mailto:${msg.email}`}
                            className="px-3 py-1.5 text-xs sm:text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                          >
                            Reply
                          </a>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="px-3 py-1.5 text-xs sm:text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <p className="text-gray-500 text-xs sm:text-sm">{settings.footer_text}</p>
          <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <Link to="/all-posts" className="hover:text-amber-500 transition-colors">Posts</Link>
            <Link to="/about" className="hover:text-amber-500 transition-colors">About</Link>
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
          <Link to="/admin" className="px-3 sm:px-5 py-2 sm:py-2.5 bg-amber-500 text-white text-xs sm:text-sm font-medium rounded-full">Admin</Link>
        </div>
      </nav>
    </div>
  );
};

export default AdminPage;
