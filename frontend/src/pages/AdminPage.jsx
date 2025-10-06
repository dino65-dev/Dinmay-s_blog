import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import MarkdownRenderer from '../components/MarkdownRenderer';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';

const AdminPage = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('html');

  // HTML Editor State
  const [htmlTitle, setHtmlTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlImage, setHtmlImage] = useState('');

  // Markdown Editor State
  const [mdTitle, setMdTitle] = useState('');
  const [mdContent, setMdContent] = useState('');
  const [mdImage, setMdImage] = useState('');

  // Admin Panel State
  const [adminTitle, setAdminTitle] = useState('');
  const [adminContent, setAdminContent] = useState('');
  const [adminImage, setAdminImage] = useState('');
  const [adminExcerpt, setAdminExcerpt] = useState('');

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
      <div className="min-h-screen bg-white">
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
            <p className="text-xs text-gray-500 mt-4 text-center">
              Demo password: admin123
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button onClick={() => setIsAuthenticated(false)} variant="outline">
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
                    onChange={(e) => setHtmlImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
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
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Write in Markdown</h2>
                <form onSubmit={handleMarkdownSubmit}>
                  <div className="mb-4">
                    <Label htmlFor="md-title">Title</Label>
                    <Input
                      id="md-title"
                      value={mdTitle}
                      onChange={(e) => setMdTitle(e.target.value)}
                      placeholder="Enter post title"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="md-image">Featured Image URL</Label>
                    <Input
                      id="md-image"
                      value={mdImage}
                      onChange={(e) => setMdImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="mt-2"
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="md-content">Content (Markdown)</Label>
                    <Textarea
                      id="md-content"
                      value={mdContent}
                      onChange={(e) => setMdContent(e.target.value)}
                      placeholder="# Your markdown content here..."
                      className="mt-2 font-mono"
                      rows={15}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Publish Post
                  </Button>
                </form>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Live Preview</h2>
                {mdTitle && <h1 className="text-3xl font-bold mb-4">{mdTitle}</h1>}
                {mdImage && (
                  <img src={mdImage} alt="Preview" className="w-full h-48 object-cover rounded mb-4" />
                )}
                {mdContent && <MarkdownRenderer content={mdContent} />}
              </div>
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
                    onChange={(e) => setAdminImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
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