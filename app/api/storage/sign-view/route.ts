import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import prisma from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const signViewSchema = z.object({
    path: z.string().min(1),
    bucket: z.enum(['private-docs'])
})

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validation = signViewSchema.safeParse(body)
        
        if (!validation.success) {
            return NextResponse.json({ error: 'Validation Error' }, { status: 400 })
        }

        const { path, bucket } = validation.data

        // Path format: documents/{sellerId}/... or certifications/{sellerId}/...
        const pathParts = path.split('/')
        if (pathParts.length < 2) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
        }
        
        const resourceSellerId = pathParts[1]

        // 1. Check if user belongs to this seller
        const sellerUser = await prisma.sellerUser.findUnique({
            where: {
                sellerId_userId: {
                    sellerId: resourceSellerId,
                    userId: user.id
                }
            }
        })
        
        // 2. Allow access if user is either the seller OR an admin
        if (!sellerUser && user.role !== 'admin') {
             return NextResponse.json({ error: 'Unauthorized access to file' }, { status: 403 })
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing Supabase credentials in sign-view')
            return NextResponse.json({ error: 'Storage configuration error' }, { status: 500 })
        }

        // Generate Signed URL for viewing (valid for 1 hour)
        const { data, error: storageError } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(path, 3600) // 1 hour

        if (storageError) {
            console.error('Supabase Storage Error:', storageError)
            return NextResponse.json({ error: `Storage error: ${storageError.message}` }, { status: 500 })
        }

        return NextResponse.json({ signedUrl: data.signedUrl })

    } catch (error: any) {
        console.error('Sign View API Error:', error)
        
        const isNetworkError = error.message?.includes('fetch failed')
        const message = isNetworkError 
            ? 'Network Error: Connection to storage failed. Please check server connectivity.' 
            : 'Internal Server Error'

        return NextResponse.json({ 
            error: message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 })
    }
}
