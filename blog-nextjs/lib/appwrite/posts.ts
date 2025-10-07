import { getServerDatabases } from './config'
import { appwriteConfig } from './config'
import { BlogPost, CreatePostData, UpdatePostData } from '@/types'
import { Query, ID } from 'node-appwrite'
import { generateSlug } from '@/lib/utils'

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const databases = getServerDatabases()
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [
        Query.orderDesc('publishedDate'),
        Query.limit(100)
      ]
    )
    return response.documents as unknown as BlogPost[]
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const databases = getServerDatabases()
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.equal('slug', slug)]
    )
    
    if (response.documents.length === 0) return null
    return response.documents[0] as unknown as BlogPost
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function createPost(data: CreatePostData): Promise<BlogPost> {
  const databases = getServerDatabases()
  const slug = generateSlug(data.title)
  
  const post = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postsCollectionId,
    ID.unique(),
    {
      ...data,
      slug,
      publishedDate: new Date().toISOString(),
      tags: data.tags || []
    }
  )
  
  return post as unknown as BlogPost
}

export async function updatePost(id: string, data: UpdatePostData): Promise<BlogPost> {
  const databases = getServerDatabases()
  
  const updateData: any = { ...data }
  if (data.title) {
    updateData.slug = generateSlug(data.title)
  }
  
  const post = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postsCollectionId,
    id,
    updateData
  )
  
  return post as unknown as BlogPost
}

export async function deletePost(id: string): Promise<void> {
  const databases = getServerDatabases()
  await databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postsCollectionId,
    id
  )
}

export async function searchPosts(query: string): Promise<BlogPost[]> {
  try {
    const databases = getServerDatabases()
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [
        Query.or([
          Query.search('title', query),
          Query.search('content', query),
          Query.search('excerpt', query)
        ]),
        Query.orderDesc('publishedDate')
      ]
    )
    return response.documents as unknown as BlogPost[]
  } catch (error) {
    console.error('Error searching posts:', error)
    return []
  }
}