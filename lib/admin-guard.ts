import { NextResponse } from 'next/server'
import { getCurrentUser } from './session'
import { User } from '@prisma/client'

/**
 * Reusable function to require admin role in API routes or Server Actions.
 * 
 * Requirements:
 * - Verify Firebase authentication (via getCurrentUser)
 * - Fetch user from DB (via getCurrentUser)
 * - Check user.role === "admin"
 * - If not admin, return 403 (or 401 if not logged in)
 * 
 * Usage in API route:
 * const adminCheck = await requireAdmin()
 * if (adminCheck instanceof NextResponse) return adminCheck
 * const admin = adminCheck // admin is now typed as User
 * 
 * @returns {Promise<User | NextResponse>} The user object if admin, otherwise a NextResponse (401/403)
 */
export async function requireAdmin(): Promise<User | NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Please login' },
      { status: 401 }
    )
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    )
  }

  return user
}
