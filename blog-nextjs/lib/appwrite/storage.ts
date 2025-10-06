import { getServerStorage } from './config'
import { appwriteConfig } from './config'
import { ID } from 'node-appwrite'

export async function uploadImage(file: File): Promise<string> {
  const storage = getServerStorage()
  
  const response = await storage.createFile(
    appwriteConfig.bucketId,
    ID.unique(),
    file
  )
  
  // Return the file URL
  return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${response.$id}/view?project=${appwriteConfig.projectId}`
}

export async function deleteImage(fileId: string): Promise<void> {
  const storage = getServerStorage()
  await storage.deleteFile(appwriteConfig.bucketId, fileId)
}

export function getImageUrl(fileId: string): string {
  return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`
}