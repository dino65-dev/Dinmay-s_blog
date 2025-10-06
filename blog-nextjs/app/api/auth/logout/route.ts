import { NextResponse } from 'next/server'
import { logoutAdmin } from '@/lib/appwrite/auth'

export async function POST() {
  try {
    await logoutAdmin()
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 })
  }
}