import { getGridFSBucket } from './config'
import { Readable } from 'stream'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImage(file: File): Promise<string> {
  const bucket = await getGridFSBucket()
  const fileId = uuidv4()
  const filename = `${fileId}_${file.name}`
  
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // Create readable stream from buffer
  const readableStream = Readable.from(buffer)
  
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(
      filename,
      {
        metadata: {
          contentType: file.type,
          size: file.size,
          fileId: fileId,
        }
      }
    )

    readableStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        // Return the filename that can be used to retrieve the image
        resolve(filename)
      })
  })
}

export async function deleteImage(filename: string): Promise<void> {
  const bucket = await getGridFSBucket()
  const files = await bucket.find({ filename }).toArray()
  if (files.length > 0) {
    await bucket.delete(files[0]._id)
  }
}

export async function getImageStream(filename: string): Promise<Readable> {
  const bucket = await getGridFSBucket()
  return bucket.openDownloadStreamByName(filename)
}

export function getImageUrl(fileId: string): string {
  // Return URL to API route that will serve the image
  return `/api/images/${fileId}`
}
