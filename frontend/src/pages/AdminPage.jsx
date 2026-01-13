import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import AdvancedMarkdownEditor from '../components/AdvancedMarkdownEditor';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

const AdminPage = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [password, setPassword] = useState('');

  // HTML Editor State
  const [htmlTitle, setHtmlTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlImage, setHtmlImage] = useState('');
  const [htmlImageError, setHtmlImageError] = useState('');

  // Markdown Editor State
  const [mdTitle, setMdTitle] = useState('');
  const [mdContent, setMdContent] = useState('');
  const [mdImage, setMdImage] = useState('');
  const [mdImageError, setMdImageError] = useState('');

  // Admin Panel State
  const [adminTitle, setAdminTitle] = useState('');
  const [adminContent, setAdminContent] = useState('');
  const [adminImage, setAdminImage] = useState('');
  const [adminExcerpt, setAdminExcerpt] = useState('');
  const [adminImageError, setAdminImageError] = useState('');

  const isDirectImageUrl = (url) => {
    if (!url) return true;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)/i;
    if (imageExtensions.test(url)) return true;
    const imageHosts = ['unsplash.com', 'imgur.com', 'ibb.co', 'cloudinary.com', 'imagekit.io', 'images.pexels.com'];
    return imageHosts.some(host => url.includes(host));
  };

  const validateImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('pin.it') || url.includes('pinterest.com/pin/')) {
      return '⚠️ Pinterest links don\'t work. Right-click the image on Pinterest and select "Copy Image Address"';
    }
    if (url.includes('instagram.com') || url.includes('facebook.com') || url.includes('twitter.com')) {
      return '⚠️ Social media page links don\'t work. You need the direct image URL';
    }
    if (!isDirectImageUrl(url)) {
      return '⚠️ URL should end with image extension (.jpg, .png, .webp, etc.) or be from a known image host';
    }
    return '';
  };

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

  const handleHtmlSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = generateSlug(htmlTitle);
      await api.createPost({
        title: htmlTitle, slug, content: htmlContent, featuredImage: htmlImage,
        contentType: 'html', excerpt: htmlContent.substring(0, 150),
      });
      toast({ title: "Success", description: "Blog post published successfully!" });
      setHtmlTitle(''); setHtmlContent(''); setHtmlImage('');
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
        contentType: 'markdown', excerpt: mdContent.substring(0, 150),
      });
      toast({ title: "Success", description: "Blog post published successfully!" });
      setMdTitle(''); setMdContent(''); setMdImage('');
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
        contentType: 'markdown', excerpt: adminExcerpt || adminContent.substring(0, 150),
      });
      toast({ title: "Success", description: "Blog post published successfully!" });
      setAdminTitle(''); setAdminContent(''); setAdminImage(''); setAdminExcerpt('');
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || error.message, variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-950 transition-colors duration-300">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="font-script text-xl md:text-2xl text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Dinmay's Blog
            </Link>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="pt-32 pb-32 px-6 md:px-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-gray-600 dark:text-gray-400">Secure Access</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-amber-500 mb-4">Admin Login</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8">
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
                <Button type="submit" className="w-full py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100">
                  Login
                </Button>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-12 px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-500 text-sm">© 2025 Dinmay's Blog. All Rights Reserved</p>
            <nav className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
              <Link to="/all-posts" className="hover:text-amber-500 transition-colors">Posts</Link>
              <Link to="/about" className="hover:text-amber-500 transition-colors">About</Link>
            </nav>
          </div>
        </footer>

        {/* Floating Bottom Navigation */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-1 px-2 py-2 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-full shadow-2xl">
            <Link to="/" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Home</Link>
            <Link to="/all-posts" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Posts</Link>
            <Link to="/about" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">About</Link>
            <Link to="/search" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Search</Link>
            <Link to="/admin" className="px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-full">Admin</Link>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-script text-xl md:text-2xl text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            Dinmay's Blog
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-700 dark:text-green-400 font-medium">Admin</span>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-32 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-gray-600 dark:text-gray-400">Content Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-amber-500">Admin Panel</h1>
          </div>

          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
              <TabsTrigger value="html" className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">HTML Editor</TabsTrigger>
              <TabsTrigger value="markdown" className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">Markdown Editor</TabsTrigger>
              <TabsTrigger value="admin" className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">Quick Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="html">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Create Post - HTML Editor</h2>
                <form onSubmit={handleHtmlSubmit}>
                  <div className="mb-4">
                    <Label htmlFor="html-title" className="text-gray-700 dark:text-gray-300 mb-2 block">Title</Label>
                    <Input id="html-title" value={htmlTitle} onChange={(e) => setHtmlTitle(e.target.value)} placeholder="Enter post title" required className="rounded-xl" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="html-image" className="text-gray-700 dark:text-gray-300 mb-2 block">Featured Image URL</Label>
                    <Input
                      id="html-image"
                      value={htmlImage}
                      onChange={(e) => { setHtmlImage(e.target.value); setHtmlImageError(validateImageUrl(e.target.value)); }}
                      placeholder="https://example.com/image.jpg"
                      className={`rounded-xl ${htmlImageError ? 'border-yellow-500' : ''}`}
                    />
                    {htmlImageError && <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{htmlImageError}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Use direct image URLs from Unsplash, Imgur, or your own hosting</p>
                    {htmlImage && !htmlImageError && (
                      <div className="mt-2 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl border">
                        <img src={htmlImage} alt="Preview" className="max-w-full max-h-full object-contain rounded" onError={() => setHtmlImageError('❌ Image failed to load. Please check the URL')} onLoad={() => setHtmlImageError('')} />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="html-content" className="text-gray-700 dark:text-gray-300 mb-2 block">Content (HTML/Markdown)</Label>
                    <Textarea id="html-content" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} placeholder="<h1>Your HTML content</h1> or # Your markdown" className="rounded-xl font-mono" rows={15} />
                  </div>
                  <Button type="submit" className="w-full py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100">
                    Publish Post
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="markdown">
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 md:p-8">
                <form onSubmit={handleMarkdownSubmit}>
                  <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
                    <Label htmlFor="md-image" className="text-base font-semibold mb-2 block text-gray-900 dark:text-white">Featured Image URL</Label>
                    <Input
                      id="md-image"
                      value={mdImage}
                      onChange={(e) => { setMdImage(e.target.value); setMdImageError(validateImageUrl(e.target.value)); }}
                      placeholder="https://example.com/image.jpg"
                      className={`rounded-xl ${mdImageError ? 'border-yellow-500' : ''}`}
                    />
                    {mdImageError && <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{mdImageError}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Use direct image URLs from Unsplash, Imgur, or your own hosting</p>
                    {mdImage && !mdImageError && (
                      <div className="mt-3 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl border">
                        <img src={mdImage} alt="Preview" className="max-w-full max-h-full object-contain rounded" onError={(e) => { e.target.style.display = 'none'; setMdImageError('❌ Image failed to load. Check if URL is a direct image link'); }} onLoad={() => setMdImageError('')} />
                      </div>
                    )}
                  </div>
                  <div className="min-h-[600px]">
                    <AdvancedMarkdownEditor value={mdContent} onChange={setMdContent} title={mdTitle} onTitleChange={setMdTitle} placeholder="Start writing your blog post... Type / for block commands" />
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Button type="submit" className="flex-1 py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100" disabled={!mdTitle || !mdContent}>Publish Post</Button>
                    <Button type="button" variant="outline" className="py-6 rounded-full" onClick={() => { setMdTitle(''); setMdContent(''); setMdImage(''); setMdImageError(''); }}>Clear</Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="admin">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Quick Upload - Paste Content</h2>
                <form onSubmit={handleAdminSubmit}>
                  <div className="mb-4">
                    <Label htmlFor="admin-title" className="text-gray-700 dark:text-gray-300 mb-2 block">Title</Label>
                    <Input id="admin-title" value={adminTitle} onChange={(e) => setAdminTitle(e.target.value)} placeholder="Enter post title" required className="rounded-xl" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="admin-excerpt" className="text-gray-700 dark:text-gray-300 mb-2 block">Excerpt</Label>
                    <Input id="admin-excerpt" value={adminExcerpt} onChange={(e) => setAdminExcerpt(e.target.value)} placeholder="Short description of the post" className="rounded-xl" />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="admin-image" className="text-gray-700 dark:text-gray-300 mb-2 block">Featured Image URL</Label>
                    <Input
                      id="admin-image"
                      value={adminImage}
                      onChange={(e) => { setAdminImage(e.target.value); setAdminImageError(validateImageUrl(e.target.value)); }}
                      placeholder="https://example.com/image.jpg"
                      className={`rounded-xl ${adminImageError ? 'border-yellow-500' : ''}`}
                    />
                    {adminImageError && <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{adminImageError}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💡 Use direct image URLs from Unsplash, Imgur, or your own hosting</p>
                    {adminImage && !adminImageError && (
                      <div className="mt-2 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl border">
                        <img src={adminImage} alt="Preview" className="max-w-full max-h-full object-contain rounded" onError={() => setAdminImageError('❌ Image failed to load. Please check the URL')} onLoad={() => setAdminImageError('')} />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="admin-content" className="text-gray-700 dark:text-gray-300 mb-2 block">Content (HTML/Markdown)</Label>
                    <Textarea id="admin-content" value={adminContent} onChange={(e) => setAdminContent(e.target.value)} placeholder="Paste your pre-written content here..." className="rounded-xl font-mono" rows={15} />
                  </div>
                  <Button type="submit" className="w-full py-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-100">
                    Publish Post
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm">© 2025 Dinmay's Blog. All Rights Reserved</p>
          <nav className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <Link to="/all-posts" className="hover:text-amber-500 transition-colors">Posts</Link>
            <Link to="/about" className="hover:text-amber-500 transition-colors">About</Link>
          </nav>
        </div>
      </footer>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-2 py-2 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-full shadow-2xl">
          <Link to="/" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Home</Link>
          <Link to="/all-posts" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Posts</Link>
          <Link to="/about" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">About</Link>
          <Link to="/search" className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors">Search</Link>
          <Link to="/admin" className="px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-full">Admin</Link>
        </div>
      </nav>
    </div>
  );
};

export default AdminPage;
