import { getDatabase, COLLECTIONS } from './config'
import type { Comment, CreateCommentData } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  try {
    const db = await getDatabase()
    const comments = await db
      .collection(COLLECTIONS.COMMENTS)
      .find({ postId })
      .sort({ createdAt: 1 })
      .toArray()
    
    return comments.map(comment => ({
      $id: comment._id.toString(),
      postId: comment.postId,
      parentId: comment.parentId,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail,
      content: comment.content,
      $createdAt: comment.createdAt,
      $updatedAt: comment.updatedAt,
    })) as Comment[]
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export async function createComment(data: CreateCommentData): Promise<Comment> {
  const db = await getDatabase()
  const now = new Date().toISOString()
  const id = uuidv4()
  
  const commentData = {
    _id: id,
    ...data,
    createdAt: now,
    updatedAt: now,
  }
  
  await db.collection(COLLECTIONS.COMMENTS).insertOne(commentData)
  
  return {
    $id: id,
    postId: commentData.postId,
    parentId: commentData.parentId,
    authorName: commentData.authorName,
    authorEmail: commentData.authorEmail,
    content: commentData.content,
    $createdAt: commentData.createdAt,
    $updatedAt: commentData.updatedAt,
  } as Comment
}

export async function deleteComment(commentId: string): Promise<void> {
  const db = await getDatabase()
  await db.collection(COLLECTIONS.COMMENTS).deleteOne({ _id: commentId })
}

export async function deleteCommentAndReplies(commentId: string): Promise<void> {
  const db = await getDatabase()
  
  // Get all replies to this comment
  const replies = await db
    .collection(COLLECTIONS.COMMENTS)
    .find({ parentId: commentId })
    .toArray()
  
  // Delete all replies recursively
  for (const reply of replies) {
    await deleteCommentAndReplies(reply._id)
  }
  
  // Delete the comment itself
  await db.collection(COLLECTIONS.COMMENTS).deleteOne({ _id: commentId })
}
