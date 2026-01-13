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
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
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
      toast({ title: "Success", description: "Reply posted successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to post reply", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Generate initials color based on name
  const getAvatarColor = (name) => {
    const colors = [
      'from-indigo-500 to-purple-500',
      'from-cyan-500 to-blue-500',
      'from-pink-500 to-rose-500',
      'from-amber-500 to-orange-500',
      'from-emerald-500 to-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(comment.author_name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {comment.author_name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{comment.author_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{comment.content}</p>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </button>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="ml-8 glass rounded-2xl p-5 animate-fade-in">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 text-sm">Reply to {comment.author_name}</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your name"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="email"
                placeholder="Your email"
                value={replyEmail}
                onChange={(e) => setReplyEmail(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <textarea
              placeholder="Your reply"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-sm">
                {submitting ? 'Posting...' : 'Post Reply'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowReplyForm(false)} className="rounded-xl text-sm">
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
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
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
      toast({ title: "Success", description: "Comment posted successfully" });
      fetchComments();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to post comment", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.deleteComment(commentId);
      toast({ title: "Success", description: "Comment deleted" });
      fetchComments();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to delete", variant: "destructive" });
    }
  };

  const handleReply = () => fetchComments();
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="glass rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">Comments</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</p>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
        <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Leave a comment</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <textarea
            placeholder="Your comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
          <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
        </div>
      ) : topLevelComments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
        </div>
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
              {getReplies(comment.id).length > 0 && (
                <div className="ml-8 mt-4 space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
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
