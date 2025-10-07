import { NextRequest, NextResponse } from 'next/server'
import { getCommentsByPostId, createComment } from '@/lib/appwrite/comments'
import { CreateCommentData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      )
    }

    const comments = await getCommentsByPostId(postId)
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error in GET /api/comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCommentData = await request.json()

    // Validate required fields
    if (!body.postId || !body.authorName || !body.authorEmail || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.authorEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const comment = await createComment(body)
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/comments:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}