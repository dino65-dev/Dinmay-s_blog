import { useEffect, useState } from 'react';
import { ArrowUpRight, CornerDownRight, LoaderCircle, Send, Trash2 } from 'lucide-react';
import api from '../utils/api';

const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now';

function CommentForm({ postId, parentId, onComplete, onCancel }) {
  const [form, setForm] = useState({ author_name: '', author_email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true); setError('');
    try { await api.createComment(postId, { post_id: postId, parent_id: parentId || null, ...form }); setForm({ author_name: '', author_email: '', content: '' }); onComplete(); } catch (requestError) { setError(requestError.response?.data?.detail || 'Your comment could not be posted.'); } finally { setSubmitting(false); }
  };
  return <form className="comment-form" onSubmit={submit}><div className="comment-form__identity"><label>Name<input value={form.author_name} onChange={(event) => update('author_name', event.target.value)} required /></label><label>Email<input type="email" value={form.author_email} onChange={(event) => update('author_email', event.target.value)} required /></label></div><label>Comment<textarea rows="4" value={form.content} onChange={(event) => update('content', event.target.value)} required /></label>{error ? <p className="comment-error">{error}</p> : null}<div className="comment-form__actions"><button type="submit" className="button button--dark" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={15} /> : <Send size={14} />}{submitting ? 'Posting...' : parentId ? 'Post reply' : 'Post comment'}</button>{onCancel ? <button type="button" className="comment-cancel" onClick={onCancel}>Cancel</button> : null}</div></form>;
}

function Comment({ comment, replies, postId, refresh, canModerate }) {
  const [replying, setReplying] = useState(false);
  const remove = async () => { if (!window.confirm('Delete this comment and its replies?')) return; try { await api.deleteComment(comment.id); refresh(); } catch { /* Authorization is handled by the existing backend. */ } };
  return <article className="comment"><div className="comment__avatar">{comment.author_name?.slice(0, 1).toUpperCase() || '?'}</div><div className="comment__content"><div className="comment__meta"><strong>{comment.author_name}</strong><time>{dateLabel(comment.created_at)}</time></div><p>{comment.content}</p><div className="comment__tools"><button type="button" onClick={() => setReplying((current) => !current)}><CornerDownRight size={14} /> Reply</button>{canModerate ? <button type="button" onClick={remove} className="is-danger"><Trash2 size={13} /> Delete</button> : null}</div>{replying ? <CommentForm postId={postId} parentId={comment.id} onComplete={() => { setReplying(false); refresh(); }} onCancel={() => setReplying(false)} /> : null}{replies.length ? <div className="comment__replies">{replies.map((reply) => <Comment key={reply.id} comment={reply} replies={[]} postId={postId} refresh={refresh} canModerate={canModerate} />)}</div> : null}</div></article>;
}

export default function CommentThread({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const canModerate = Boolean(localStorage.getItem('authToken'));
  const refresh = async () => { setLoading(true); setError(''); try { const data = await api.getComments(postId); setComments(Array.isArray(data) ? data : []); } catch { setError('Comments are temporarily unavailable.'); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, [postId]);
  const roots = comments.filter((comment) => !comment.parent_id);
  const children = (parentId) => comments.filter((comment) => comment.parent_id === parentId);
  return <section className="comment-thread" aria-labelledby="comments-title"><header><div><p className="eyebrow">Discussion</p><h2 id="comments-title">Notes from readers.</h2><p>{comments.length} {comments.length === 1 ? 'comment' : 'comments'} on this article.</p></div><button type="button" className="button button--outline" onClick={() => setOpen((current) => !current)}>{open ? 'Close form' : 'Leave a comment'} <ArrowUpRight size={15} /></button></header>{open ? <CommentForm postId={postId} onComplete={() => { setOpen(false); refresh(); }} /> : null}{loading ? <p className="comment-loading"><LoaderCircle className="spin" size={15} /> Loading comments...</p> : error ? <p className="comment-error">{error}</p> : roots.length ? <div className="comment-list">{roots.map((comment) => <Comment key={comment.id} comment={comment} replies={children(comment.id)} postId={postId} refresh={refresh} canModerate={canModerate} />)}</div> : <p className="comment-empty">There are no comments yet. Start the conversation.</p>}</section>;
}
