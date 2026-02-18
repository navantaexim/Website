
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const signViewSchema = z.object({
    path: z.string().min(1),
    bucket: z.enum(['private-docs'])
})

async function getAuthenticatedUser() {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    if (!sessionCookie) return null
  
    try {
      const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
        select: { id: true },
      })
      return user
    } catch {
      return null
    }
}

export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser()
        // If no user, maybe allow admin? For now, require auth.
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const validation = signViewSchema.safeParse(body)
        
        if (!validation.success) {
            return NextResponse.json({ error: 'Validation Error' }, { status: 400 })
        }

        const { path, bucket } = validation.data

        // Extract sellerId from path to verify ownership?
        // Path format: documents/{sellerId}/... or certifications/{sellerId}/...
        const pathParts = path.split('/')
        if (pathParts.length < 2) return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
        
        const resourceType = pathParts[0] // documents or certifications
        const resourceSellerId = pathParts[1]

        // Verify that the requesting user belongs to this seller
        // or is a super admin (not implemented yet, assume seller check)
        
        const sellerUser = await prisma.sellerUser.findUnique({
             where: {
                 sellerId_userId: {
                     sellerId: resourceSellerId,
                     userId: user.id
                 }
             }
        })
        
        if (!sellerUser) {
             // If not the seller, check if it's an admin (TODO)
             return NextResponse.json({ error: 'Unauthorized access to file' }, { status: 403 })
        }

        // Generate Signed URL for viewing (valid for 1 hour)
        const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(path, 3600) // 1 hour

        if (error) throw error

        return NextResponse.json({ signedUrl: data.signedUrl })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
