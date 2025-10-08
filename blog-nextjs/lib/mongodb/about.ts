import { getDatabase, COLLECTIONS } from './config'
import { AboutContent } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export async function getAboutContent(): Promise<AboutContent | null> {
  try {
    const db = await getDatabase()
    const about = await db.collection(COLLECTIONS.ABOUT).findOne({})
    
    if (!about) return null
    
    return {
      $id: about._id.toString(),
      content: about.content,
      $createdAt: about.createdAt,
      $updatedAt: about.updatedAt,
    } as AboutContent
  } catch (error) {
    console.error('Error fetching about content:', error)
    return null
  }
}

export async function updateAboutContent(content: string): Promise<AboutContent> {
  const db = await getDatabase()
  const now = new Date().toISOString()
  
  // Check if about content exists
  const existing = await db.collection(COLLECTIONS.ABOUT).findOne({})
  
  if (existing) {
    // Update existing
    await db.collection(COLLECTIONS.ABOUT).updateOne(
      { _id: existing._id },
      { $set: { content, updatedAt: now } }
    )
    
    return {
      $id: existing._id.toString(),
      content,
      $createdAt: existing.createdAt,
      $updatedAt: now,
    } as AboutContent
  } else {
    // Create new
    const id = uuidv4()
    const aboutData = {
      _id: id,
      content,
      createdAt: now,
      updatedAt: now,
    }
    
    await db.collection(COLLECTIONS.ABOUT).insertOne(aboutData)
    
    return {
      $id: id,
      content,
      $createdAt: now,
      $updatedAt: now,
    } as AboutContent
  }
}
