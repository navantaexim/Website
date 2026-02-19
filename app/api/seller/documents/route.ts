
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

const documentSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  type: z.enum(['PAN_CARD', 'GST_CERT', 'IEC_CERT'], {
    errorMap: () => ({ message: "Type must be one of PAN_CARD, GST_CERT, IEC_CERT" }),
  }),
  documentUrl: z.string().min(1, 'Document path is required'),
})

async function getAuthenticatedUser(request: Request) {
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
    const user = await getAuthenticatedUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validation = documentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation Error', details: validation.error.format() }, { status: 400 })
    }

    const { sellerId, type, documentUrl } = validation.data

    const sellerUser = await verifySellerAccess(user.id, sellerId)
    if (!sellerUser) return NextResponse.json({ error: 'Unauthorized seller access' }, { status: 403 })
    if (sellerUser.seller.status !== 'draft') return NextResponse.json({ error: 'Cannot upload docs for submitted seller' }, { status: 400 })

    // Upsert logic: If document of type exists, update it.
    // However, Prisma upsert requires unique constraint on [sellerId, type]
    // Schema has @@unique([sellerId, type]) in SellerDocument model.
    
    const document = await prisma.sellerDocument.upsert({
      where: {
        sellerId_type: {
            sellerId,
            type
        }
      },
      update: {
        documentUrl,
        uploadedAt: new Date(),
        verified: false
      },
      create: {
        sellerId,
        type,
        documentUrl,
        verified: false
      }
    })

    return NextResponse.json({ success: true, document })

  } catch (error: any) {
    console.error('Document Upload Error:', error)
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
    try {
        const user = await getAuthenticatedUser(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const sellerId = searchParams.get('sellerId')

        if (!id || !sellerId) return NextResponse.json({ error: 'Document ID and Seller ID required' }, { status: 400 })
        
        const sellerUser = await verifySellerAccess(user.id, sellerId)
        if (!sellerUser) return NextResponse.json({ error: 'Unauthorized seller access' }, { status: 403 })
        if (sellerUser.seller.status !== 'draft') return NextResponse.json({ error: 'Cannot delete docs for submitted seller' }, { status: 400 })

        // Ensure document belongs to seller
        const doc = await prisma.sellerDocument.findUnique({ where: { id } })
        if (!doc || doc.sellerId !== sellerId) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

        await prisma.sellerDocument.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
