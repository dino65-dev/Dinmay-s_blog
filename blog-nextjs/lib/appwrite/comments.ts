import { Query, ID } from 'node-appwrite'
import { getServerDatabases } from './config'
import { appwriteConfig } from './config'
import type { Comment, CreateCommentData } from '@/types'

const DATABASE_ID = appwriteConfig.databaseId
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  try {
    const databases = getServerDatabases()
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('postId', postId),
        Query.orderAsc('$createdAt')
      ]
    )
    return response.documents as unknown as Comment[]
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export async function createComment(data: CreateCommentData): Promise<Comment> {
  const databases = getServerDatabases()
  const response = await databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    ID.unique(),
    data
  )
  return response as unknown as Comment
}

export async function deleteComment(commentId: string): Promise<void> {
  const databases = getServerDatabases()
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, commentId)
}

export async function deleteCommentAndReplies(commentId: string): Promise<void> {
  const databases = getServerDatabases()
  
  // Get all replies to this comment
  const replies = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_ID,
    [Query.equal('parentId', commentId)]
  )
  
  // Delete all replies recursively
  for (const reply of replies.documents) {
    await deleteCommentAndReplies(reply.$id)
  }
  
  // Delete the comment itself
  await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, commentId)
}