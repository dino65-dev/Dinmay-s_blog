import { NextResponse } from 'next/server'
import { updatePost, deletePost } from '@/lib/appwrite/posts'
import { requireAuth } from '@/lib/appwrite/auth'

export async function PUT(
  request: Request,
  context: { params: Promise&lt;{ id: string }&gt; }
) {
  try {
    await requireAuth()
    
    const { id } = await context.params
    const data = await request.json()
    const post = await updatePost(id, data)
    
    return NextResponse.json({ post })
  } catch (error: any) {
    console.error('Update post error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json({ message: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise&lt;{ id: string }&gt; }
) {
  try {
    await requireAuth()
    
    const { id } = await context.params
    await deletePost(id)
    
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error: any) {
    console.error('Delete post error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json({ message: 'Failed to delete post' }, { status: 500 })
  }
}