
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

// Schema for request validation
const signUploadSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  usage: z.enum(['seller-document', 'product-media', 'seller-certification']),
  productId: z.string().optional(), // Required only for product-media
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

async function verifySellerAccess(userId: string, sellerId: string) {
  return await prisma.sellerUser.findUnique({
    where: {
      sellerId_userId: {
        sellerId,
        userId,
      },
    },
    include: {
        seller: { select: { status: true } }
    }
  })
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validation = signUploadSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation Error', details: validation.error.format() }, { status: 400 })
    }

    const { sellerId, fileName, fileType, usage, productId } = validation.data

    // Verify Access
    // If usage is product-media, we verify product access later.
    // If usage is seller-*, we verify seller access here.
    
    if (usage !== 'product-media') {
        const sellerUser = await verifySellerAccess(user.id, sellerId)
        if (!sellerUser) return NextResponse.json({ error: 'Unauthorized seller access' }, { status: 403 })
    } else {
        // For product media, verify product ownership
        if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { seller: { include: { users: { where: { userId: user.id } } } } }
        })
        if (!product || product.seller.users.length === 0) {
             return NextResponse.json({ error: 'Unauthorized product access' }, { status: 403 })
        }
    }
    
    // For product edits, we should also verify product ownership if productId is provided. 
    // Simplified here to just seller access as products belong to seller.

    let bucketName = ''
    let filePath = ''

    if (usage === 'product-media') {
        bucketName = 'product-media' // Public Bucket
        if (!productId) return NextResponse.json({ error: 'Product ID required for media' }, { status: 400 })
        // Clean filename
        const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
        filePath = `${productId}/${Date.now()}_${cleanName}`
    } else if (usage === 'seller-document') {
        bucketName = 'private-docs' // Private Bucket
        const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
        filePath = `documents/${sellerId}/${Date.now()}_${cleanName}`
    } else if (usage === 'seller-certification') {
        bucketName = 'private-docs' // Private Bucket
        const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
        filePath = `certifications/${sellerId}/${Date.now()}_${cleanName}`
    }

    // Generate Signed Upload URL
    // Note: The Supabase Admin Client allows us to generate a URL that lets the frontend upload 
    // directly to the bucket, bypassing RLS for this specific operation.
    
    const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUploadUrl(filePath)

    if (error) {
        console.error('Supabase Sign Error', error)
        throw new Error('Failed to generate upload signature')
    }

    // For public buckets, we can construct the specific public URL.
    // For private buckets, the path is what we store.
    
    let publicUrl = null
    if (bucketName === 'product-media') {
        const { data: publicUrlData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(filePath)
        publicUrl = publicUrlData.publicUrl
    }

    return NextResponse.json({ 
        success: true, 
        signedUrl: data.signedUrl, 
        token: data.token,
        path: filePath,
        publicUrl, // Only for public bucket
        bucket: bucketName 
    })

  } catch (error: any) {
    console.error('Sign Upload Error:', error)
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 })
  }
}
