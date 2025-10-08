import { NextResponse } from 'next/server'
import { loginAdmin } from '@/lib/mongodb/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const result = await loginAdmin(email, password)

    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ message: result.message }, { status: 401 })
    }
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({ message: 'Login failed' }, { status: 500 })
  }
}
