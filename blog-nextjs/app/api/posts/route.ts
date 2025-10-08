import { NextResponse } from 'next/server'
import { createPost } from '@/lib/mongodb/posts'
import { requireAuth } from '@/lib/mongodb/auth'

export async function POST(request: Request) {
  try {
    await requireAuth()
    
    const data = await request.json()
    const post = await createPost(data)
    
    return NextResponse.json({ post })
  } catch (error: any) {
    console.error('Create post error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json({ message: 'Failed to create post' }, { status: 500 })
  }
}
