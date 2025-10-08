import { NextResponse } from 'next/server'
import { searchPosts } from '@/lib/mongodb/posts'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    const posts = await searchPosts(query)
    
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ posts: [] }, { status: 500 })
  }
}
