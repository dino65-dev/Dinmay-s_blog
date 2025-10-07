'use client'

import { useState, useEffect } from 'react'
import { Comment } from '@/types'
import { formatDate } from '@/lib/utils'
import { MessageCircle, Reply, Trash2, User } from 'lucide-react'
import { toast } from 'sonner'

interface CommentsProps {
  postId: string
  isAdmin: boolean
}

export function Comments({ postId, isAdmin }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    content: ''
  })

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()
    
    if (!formData.authorName || !formData.authorEmail || !formData.content) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          parentId,
          ...formData
        })
      })

      if (response.ok) {
        toast.success('Comment posted successfully!')
        setFormData({ authorName: '', authorEmail: '', content: '' })
        setReplyTo(null)
        fetchComments()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to post comment')
      }
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment and all its replies?')) {
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Comment deleted successfully')
        fetchComments()
      } else {
        toast.error('Failed to delete comment')
      }
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const CommentForm = ({ parentId }: { parentId?: string }) => (
    <form onSubmit={(e) => handleSubmit(e, parentId)} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Your Name"
          value={formData.authorName}
          onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={formData.authorEmail}
          onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>
      <textarea
        placeholder="Write your comment..."
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        rows={4}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        required
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting...' : parentId ? 'Post Reply' : 'Post Comment'}
        </button>
        {parentId && (
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const replies = comments.filter(c => c.parentId === comment.$id)
    const isReplyFormOpen = replyTo === comment.$id

    return (
      <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{comment.authorName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.$createdAt)}</p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => handleDelete(comment.$id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                title="Delete comment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
          <button
            onClick={() => setReplyTo(comment.$id)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>
        </div>

        {isReplyFormOpen && (
          <div className="mt-4">
            <CommentForm parentId={comment.$id} />
          </div>
        )}

        {replies.map(reply => (
          <CommentItem key={reply.$id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    )
  }

  const topLevelComments = comments.filter(c => !c.parentId)

  return (
    <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-12">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <MessageCircle className="w-8 h-8" />
        Comments ({comments.length})
      </h2>

      <CommentForm />

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading comments...</div>
      ) : topLevelComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="space-y-6">
          {topLevelComments.map(comment => (
            <CommentItem key={comment.$id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}