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
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
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
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editContentType, setEditContentType] = useState('markdown');
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await api.getPostBySlug(slug);
        setPost(data);
        // Initialize edit form with current post data
        setEditTitle(data.title);
        setEditContent(data.content);
        setEditImage(data.featuredImage || '');
        setEditExcerpt(data.excerpt || '');
        setEditContentType(data.contentType || 'markdown');
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

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    // Reset edit form to original post data
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImage(post.featuredImage || '');
    setEditExcerpt(post.excerpt || '');
    setEditContentType(post.contentType || 'markdown');
    setIsEditMode(false);
    setImageError('');
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('❌ Invalid file type. Please upload an image file (JPG, PNG, GIF, WEBP, SVG, AVIF, BMP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageError('❌ File size too large. Maximum size is 10MB');
      return;
    }

    setImageUploading(true);
    setImageError('');

    try {
      const result = await api.uploadImage(file);
      if (result.success) {
        setEditImage(result.url);
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      } else {
        setImageError('❌ Upload failed. Please try again.');
      }
    } catch (error) {
      setImageError(`❌ Upload failed: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!editTitle.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!editContent.trim()) {
      toast({
        title: "Error",
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updatedPost = await api.updatePost(post.id, {
        title: editTitle,
        content: editContent,
        featuredImage: editImage,
        excerpt: editExcerpt,
        contentType: editContentType,
      });
      
      setPost(updatedPost);
      setIsEditMode(false);
      
      toast({
        title: "Success",
        description: "Post updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
              {isEditMode ? (
                /* Edit Mode */
                <div className="w-full bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-500 dark:border-blue-600 p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">✏️ Edit Post</h2>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveEdit}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveEdit} className="space-y-6">
                    {/* Title */}
                    <div>
                      <Label htmlFor="edit-title" className="text-gray-900 dark:text-white">Title *</Label>
                      <Input
                        id="edit-title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Enter post title"
                        className="mt-2"
                        required
                      />
                    </div>

                    {/* Content Type */}
                    <div>
                      <Label className="text-gray-900 dark:text-white">Content Type</Label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="markdown"
                            checked={editContentType === 'markdown'}
                            onChange={(e) => setEditContentType(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-900 dark:text-white">Markdown</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="html"
                            checked={editContentType === 'html'}
                            onChange={(e) => setEditContentType(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-900 dark:text-white">HTML</span>
                        </label>
                      </div>
                    </div>

                    {/* Featured Image */}
                    <div>
                      <Label className="text-gray-900 dark:text-white">Featured Image</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0])}
                            className="hidden"
                            id="edit-image-upload"
                            disabled={imageUploading}
                          />
                          <label
                            htmlFor="edit-image-upload"
                            className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                              imageUploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {imageUploading ? 'Uploading...' : '📁 Upload Image'}
                          </label>
                          <span className="text-gray-500 dark:text-gray-400">OR</span>
                          <Input
                            type="url"
                            value={editImage}
                            onChange={(e) => setEditImage(e.target.value)}
                            placeholder="Paste image URL"
                            className="flex-1"
                          />
                        </div>
                        {imageError && (
                          <p className="text-sm text-red-500">{imageError}</p>
                        )}
                        {editImage && !imageError && (
                          <div className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-2">
                            <img 
                              src={editImage} 
                              alt="Preview" 
                              className="max-h-48 mx-auto rounded"
                              onError={() => setImageError('❌ Failed to load image. Please check the URL.')}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <Label htmlFor="edit-excerpt" className="text-gray-900 dark:text-white">Excerpt (Optional)</Label>
                      <Textarea
                        id="edit-excerpt"
                        value={editExcerpt}
                        onChange={(e) => setEditExcerpt(e.target.value)}
                        placeholder="Brief summary for post preview"
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <Label htmlFor="edit-content" className="text-gray-900 dark:text-white">Content *</Label>
                      <Textarea
                        id="edit-content"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder={editContentType === 'markdown' ? 'Write your content in Markdown...' : 'Write your content in HTML...'}
                        rows={20}
                        className="mt-2 font-mono text-sm"
                        required
                      />
                    </div>

                    {/* Preview */}
                    <div>
                      <Label className="text-gray-900 dark:text-white">Preview</Label>
                      <div className="mt-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900 max-h-96 overflow-y-auto">
                        <MarkdownRenderer content={editContent} />
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                /* View Mode */
                <>
                  <article className="w-full max-w-full overflow-hidden">
                    <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white flex-1">{post.title}</h1>
                      {isAuthenticated && (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={handleEditClick}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          >
                            ✏️ Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleting}
                          >
                            {deleting ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
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

                    <div className="blog-content w-full max-w-full overflow-hidden">
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
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPostPage;