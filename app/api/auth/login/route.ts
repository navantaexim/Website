import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    // 1. Verify the Firebase ID token
    // The verifyIdToken promise resolves to the decoded token if valid
    const decodedToken = await getAuth().verifyIdToken(token)
    const { email, uid, name, picture } = decodedToken

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // 2. Upsert user in PostgreSQL
    // We match by email to support existing users, and ensure firebaseUid is set
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firebaseUid: uid,
        name: name || undefined,
        picture: picture || undefined,
        // We do NOT update role here to prevent overriding admin assignments
      },
      create: {
        email,
        firebaseUid: uid,
        name: name || '',
        picture: picture || '',
        role: 'user', // Default role
        status: 'active',
      },
    })

    // 3. Create Session Cookie
    // Set explicit expiration (e.g., 5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000
    const sessionCookie = await getAuth().createSessionCookie(token, { expiresIn })

    // 4. Set the cookie
    // Next.js 15+ compatible await
    const cookieStore = await cookies()
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 401 }
    )
  }
}
