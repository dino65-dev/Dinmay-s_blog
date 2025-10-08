import { getGridFSBucket } from './config'
import { Readable } from 'stream'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImage(file: File): Promise<string> {
  const bucket = await getGridFSBucket()
  const fileId = uuidv4()
  
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // Create readable stream from buffer
  const readableStream = Readable.from(buffer)
  
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStreamWithId(
      fileId,
      file.name,
      {
        metadata: {
          contentType: file.type,
          size: file.size,
        }
      }
    )

    readableStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        // Return the file ID that can be used to retrieve the image
        resolve(fileId)
      })
  })
}

export async function deleteImage(fileId: string): Promise<void> {
  const bucket = await getGridFSBucket()
  await bucket.delete(fileId)
}

export async function getImageStream(fileId: string): Promise<Readable> {
  const bucket = await getGridFSBucket()
  return bucket.openDownloadStream(fileId)
}

export function getImageUrl(fileId: string): string {
  // Return URL to API route that will serve the image
  return `/api/images/${fileId}`
}
