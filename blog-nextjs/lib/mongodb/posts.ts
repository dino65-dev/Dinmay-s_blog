import { getDatabase, COLLECTIONS } from './config'
import { BlogPost, CreatePostData, UpdatePostData } from '@/types'
import { generateSlug } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const db = await getDatabase()
    const posts = await db
      .collection(COLLECTIONS.POSTS)
      .find({})
      .sort({ publishedDate: -1 })
      .limit(100)
      .toArray()
    
    return posts.map(post => ({
      $id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      contentType: post.contentType,
      featuredImage: post.featuredImage,
      publishedDate: post.publishedDate,
      tags: post.tags || [],
      $createdAt: post.createdAt,
      $updatedAt: post.updatedAt,
    })) as BlogPost[]
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const db = await getDatabase()
    const post = await db.collection(COLLECTIONS.POSTS).findOne({ slug })
    
    if (!post) return null
    
    return {
      $id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      contentType: post.contentType,
      featuredImage: post.featuredImage,
      publishedDate: post.publishedDate,
      tags: post.tags || [],
      $createdAt: post.createdAt,
      $updatedAt: post.updatedAt,
    } as BlogPost
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  try {
    const db = await getDatabase()
    const post = await db.collection(COLLECTIONS.POSTS).findOne({ _id: id })
    
    if (!post) return null
    
    return {
      $id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      contentType: post.contentType,
      featuredImage: post.featuredImage,
      publishedDate: post.publishedDate,
      tags: post.tags || [],
      $createdAt: post.createdAt,
      $updatedAt: post.updatedAt,
    } as BlogPost
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function createPost(data: CreatePostData): Promise<BlogPost> {
  const db = await getDatabase()
  const slug = generateSlug(data.title)
  const now = new Date().toISOString()
  const id = uuidv4()
  
  const postData = {
    _id: id,
    ...data,
    slug,
    publishedDate: now,
    tags: data.tags || [],
    createdAt: now,
    updatedAt: now,
  }
  
  await db.collection(COLLECTIONS.POSTS).insertOne(postData)
  
  return {
    $id: id,
    title: postData.title,
    slug: postData.slug,
    content: postData.content,
    excerpt: postData.excerpt,
    contentType: postData.contentType,
    featuredImage: postData.featuredImage,
    publishedDate: postData.publishedDate,
    tags: postData.tags,
    $createdAt: postData.createdAt,
    $updatedAt: postData.updatedAt,
  } as BlogPost
}

export async function updatePost(id: string, data: UpdatePostData): Promise<BlogPost> {
  const db = await getDatabase()
  
  const updateData: any = { ...data, updatedAt: new Date().toISOString() }
  if (data.title) {
    updateData.slug = generateSlug(data.title)
  }
  
  await db.collection(COLLECTIONS.POSTS).updateOne(
    { _id: id },
    { $set: updateData }
  )
  
  const post = await getPostById(id)
  if (!post) {
    throw new Error('Post not found after update')
  }
  
  return post
}

export async function deletePost(id: string): Promise<void> {
  const db = await getDatabase()
  await db.collection(COLLECTIONS.POSTS).deleteOne({ _id: id })
}

export async function searchPosts(query: string): Promise<BlogPost[]> {
  try {
    const db = await getDatabase()
    
    // Create text index if it doesn't exist
    try {
      await db.collection(COLLECTIONS.POSTS).createIndex(
        { title: 'text', content: 'text', excerpt: 'text' },
        { name: 'posts_text_search' }
      )
    } catch (e) {
      // Index might already exist, ignore error
    }
    
    const posts = await db
      .collection(COLLECTIONS.POSTS)
      .find({ $text: { $search: query } })
      .sort({ publishedDate: -1 })
      .toArray()
    
    return posts.map(post => ({
      $id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      contentType: post.contentType,
      featuredImage: post.featuredImage,
      publishedDate: post.publishedDate,
      tags: post.tags || [],
      $createdAt: post.createdAt,
      $updatedAt: post.updatedAt,
    })) as BlogPost[]
  } catch (error) {
    console.error('Error searching posts:', error)
    return []
  }
}
