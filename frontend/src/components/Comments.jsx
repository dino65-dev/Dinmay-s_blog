import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';

const CommentItem = ({ comment, postId, onReply, onDelete, isAuthenticated }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyName, setReplyName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyName.trim() || !replyEmail.trim() || !replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const newReply = await api.createComment(postId, {
        post_id: postId,
        parent_id: comment.id,
        author_name: replyName,
        author_email: replyEmail,
        content: replyContent,
      });
      
      onReply(newReply);
      setReplyName('');
      setReplyEmail('');
      setReplyContent('');
      setShowReplyForm(false);
      toast({
        title: "Success",
        description: "Reply posted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{comment.author_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</p>
          </div>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(comment.id)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Delete
            </Button>
          )}
        </div>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Reply
        </button>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="ml-8 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Your name"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your email"
                value={replyEmail}
                onChange={(e) => setReplyEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Your reply"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Reply'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowReplyForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      const data = await api.getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.createComment(postId, {
        post_id: postId,
        author_name: name,
        author_email: email,
        content: content,
      });
      
      setName('');
      setEmail('');
      setContent('');
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
      fetchComments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await api.deleteComment(commentId);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
      fetchComments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const handleReply = () => {
    fetchComments();
  };

  // Organize comments into tree structure
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 transition-colors">
        <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Leave a comment</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              required
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              required
            />
          </div>
          <textarea
            placeholder="Your comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            required
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading comments...</p>
      ) : topLevelComments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-6">
          {topLevelComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                postId={postId}
                onReply={handleReply}
                onDelete={handleDelete}
                isAuthenticated={isAuthenticated}
              />
              {/* Render replies */}
              {getReplies(comment.id).length > 0 && (
                <div className="ml-8 mt-4 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                  {getReplies(comment.id).map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      onReply={handleReply}
                      onDelete={handleDelete}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
