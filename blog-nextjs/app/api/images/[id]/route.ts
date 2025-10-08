import { NextRequest, NextResponse } from 'next/server'
import { getImageStream } from '@/lib/mongodb/storage'
import { getGridFSBucket } from '@/lib/mongodb/config'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    // Get the bucket to check file metadata
    const bucket = await getGridFSBucket()
    const files = await bucket.find({ _id: id }).toArray()
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }
    
    const file = files[0]
    const stream = await getImageStream(id)
    
    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    
    // Return image with proper content type
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.metadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    )
  }
}
