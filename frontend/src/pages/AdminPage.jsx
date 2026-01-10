import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import MarkdownRenderer from '../components/MarkdownRenderer';
import AdvancedMarkdownEditor from '../components/AdvancedMarkdownEditor';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

const AdminPage = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('html');

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

  // Validate if URL is a direct image URL
  const isDirectImageUrl = (url) => {
    if (!url) return true; // Empty is okay
    
    // Check for image extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)/i;
    if (imageExtensions.test(url)) return true;
    
    // Allow known image hosting services that serve images without extensions
    const imageHosts = ['unsplash.com', 'imgur.com', 'ibb.co', 'cloudinary.com', 'imagekit.io', 'images.pexels.com'];
    return imageHosts.some(host => url.includes(host));
  };

  // Validate image URL on change
  const validateImageUrl = (url) => {
    if (!url) return '';
    
    // Check for common non-image link patterns that definitely won't work
    if (url.includes('pin.it') || url.includes('pinterest.com/pin/')) {
      return '⚠️ Pinterest links don\'t work. Right-click the image on Pinterest and select "Copy Image Address"';
    }
    if (url.includes('instagram.com') || url.includes('facebook.com') || url.includes('twitter.com')) {
      return '⚠️ Social media page links don\'t work. You need the direct image URL';
    }
    
    // Check if it looks like a direct image URL or from known image hosts
    if (!isDirectImageUrl(url)) {
      return '⚠️ URL should end with image extension (.jpg, .png, .webp, etc.) or be from a known image host';
    }
    
    return '';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(password);
    if (result.success) {
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleHtmlSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = generateSlug(htmlTitle);
      await api.createPost({
        title: htmlTitle,
        slug: slug,
        content: htmlContent,
        featuredImage: htmlImage,
        contentType: 'html',
        excerpt: htmlContent.substring(0, 150),
      });
      toast({
        title: "Success",
        description: "Blog post published successfully!",
      });
      setHtmlTitle('');
      setHtmlContent('');
      setHtmlImage('');
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    }
  };

  const handleMarkdownSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = generateSlug(mdTitle);
      await api.createPost({
        title: mdTitle,
        slug: slug,
        content: mdContent,
        featuredImage: mdImage,
        contentType: 'markdown',
        excerpt: mdContent.substring(0, 150),
      });
      toast({
        title: "Success",
        description: "Blog post published successfully!",
      });
      setMdTitle('');
      setMdContent('');
      setMdImage('');
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = generateSlug(adminTitle);
      await api.createPost({
        title: adminTitle,
        slug: slug,
        content: adminContent,
        featuredImage: adminImage,
        contentType: 'markdown',
        excerpt: adminExcerpt || adminContent.substring(0, 150),
      });
      toast({
        title: "Success",
        description: "Blog post published successfully!",
      });
      setAdminTitle('');
      setAdminContent('');
      setAdminImage('');
      setAdminExcerpt('');
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <Header />
        <main className="max-w-md mx-auto px-6 py-24">
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="html">HTML Editor</TabsTrigger>
            <TabsTrigger value="markdown">Markdown Editor</TabsTrigger>
            <TabsTrigger value="admin">Quick Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="html">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Create Post - HTML Editor</h2>
              <form onSubmit={handleHtmlSubmit}>
                <div className="mb-4">
                  <Label htmlFor="html-title">Title</Label>
                  <Input
                    id="html-title"
                    value={htmlTitle}
                    onChange={(e) => setHtmlTitle(e.target.value)}
                    placeholder="Enter post title"
                    required
                    className="mt-2"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="html-image">Featured Image URL</Label>
                  <Input
                    id="html-image"
                    value={htmlImage}
                    onChange={(e) => {
                      const url = e.target.value;
                      setHtmlImage(url);
                      setHtmlImageError(validateImageUrl(url));
                    }}
                    placeholder="https://example.com/image.jpg"
                    className={`mt-2 ${htmlImageError ? 'border-yellow-500' : ''}`}
                  />
                  {htmlImageError && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{htmlImageError}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 Use direct image URLs from Unsplash, Imgur, or your own hosting
                  </p>
                  {htmlImage && !htmlImageError && (
                    <div className="mt-2 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border">
                      <img 
                        src={htmlImage} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          setHtmlImageError('❌ Image failed to load. Please check the URL');
                        }}
                        onLoad={() => setHtmlImageError('')}
                      />
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <Label htmlFor="html-content">Content (HTML/Markdown)</Label>
                  <Textarea
                    id="html-content"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<h1>Your HTML content</h1> or # Your markdown"
                    className="mt-2 font-mono"
                    rows={15}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Publish Post
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="markdown">
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <form onSubmit={handleMarkdownSubmit}>
                {/* Featured Image Section */}
                <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Label htmlFor="md-image" className="text-base font-semibold mb-2 block">Featured Image URL</Label>
                  <Input
                    id="md-image"
                    value={mdImage}
                    onChange={(e) => {
                      const url = e.target.value;
                      setMdImage(url);
                      setMdImageError(validateImageUrl(url));
                    }}
                    placeholder="https://example.com/image.jpg"
                    className={`${mdImageError ? 'border-yellow-500' : ''}`}
                  />
                  {mdImageError && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{mdImageError}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 Use direct image URLs from Unsplash, Imgur, or your own hosting
                  </p>
                  {mdImage && !mdImageError && (
                    <div className="mt-3 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border">
                      <img 
                        src={mdImage} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain rounded" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          setMdImageError('❌ Image failed to load. Check if URL is a direct image link');
                        }}
                        onLoad={() => {
                          setMdImageError('');
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Advanced Markdown Editor */}
                <div className="min-h-[600px]">
                  <AdvancedMarkdownEditor
                    value={mdContent}
                    onChange={setMdContent}
                    title={mdTitle}
                    onTitleChange={setMdTitle}
                    placeholder="Start writing your blog post... Type / for block commands"
                  />
                </div>

                <div className="mt-6 flex gap-4">
                  <Button type="submit" className="flex-1 py-6 text-lg" disabled={!mdTitle || !mdContent}>
                    Publish Post
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="py-6"
                    onClick={() => {
                      setMdTitle('');
                      setMdContent('');
                      setMdImage('');
                      setMdImageError('');
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="admin">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Quick Upload - Paste Content</h2>
              <form onSubmit={handleAdminSubmit}>
                <div className="mb-4">
                  <Label htmlFor="admin-title">Title</Label>
                  <Input
                    id="admin-title"
                    value={adminTitle}
                    onChange={(e) => setAdminTitle(e.target.value)}
                    placeholder="Enter post title"
                    required
                    className="mt-2"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="admin-excerpt">Excerpt</Label>
                  <Input
                    id="admin-excerpt"
                    value={adminExcerpt}
                    onChange={(e) => setAdminExcerpt(e.target.value)}
                    placeholder="Short description of the post"
                    className="mt-2"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="admin-image">Featured Image URL</Label>
                  <Input
                    id="admin-image"
                    value={adminImage}
                    onChange={(e) => {
                      const url = e.target.value;
                      setAdminImage(url);
                      setAdminImageError(validateImageUrl(url));
                    }}
                    placeholder="https://example.com/image.jpg"
                    className={`mt-2 ${adminImageError ? 'border-yellow-500' : ''}`}
                  />
                  {adminImageError && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{adminImageError}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 Use direct image URLs from Unsplash, Imgur, or your own hosting
                  </p>
                  {adminImage && !adminImageError && (
                    <div className="mt-2 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border">
                      <img 
                        src={adminImage} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          setAdminImageError('❌ Image failed to load. Please check the URL');
                        }}
                        onLoad={() => setAdminImageError('')}
                      />
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <Label htmlFor="admin-content">Content (HTML/Markdown)</Label>
                  <Textarea
                    id="admin-content"
                    value={adminContent}
                    onChange={(e) => setAdminContent(e.target.value)}
                    placeholder="Paste your pre-written content here..."
                    className="mt-2 font-mono"
                    rows={15}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Publish Post
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;