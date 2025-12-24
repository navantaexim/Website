import 'server-only'
import { cookies } from 'next/headers'
import { auth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) return null

  try {
    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(session, true)
    
    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedClaims.uid },
    })
    
    return user
  } catch (error) {
    // If verification fails (expired/invalid), return null
    return null
  }
}
