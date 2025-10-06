'use server'

import { cookies } from 'next/headers'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@dinmay.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tapuhero@123'
const SESSION_COOKIE = 'admin_session'

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; message: string }> {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64')
    
    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return { success: true, message: 'Login successful' }
  }
  
  return { success: false, message: 'Invalid credentials' }
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return !!session
}

export async function requireAuth() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Unauthorized')
  }
}