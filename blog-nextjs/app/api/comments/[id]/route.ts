import { NextRequest, NextResponse } from 'next/server'
import { deleteCommentAndReplies } from '@/lib/appwrite/comments'
import { isAuthenticated } from '@/lib/appwrite/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authenticated = await isAuthenticated()
    
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    await deleteCommentAndReplies(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/comments/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}