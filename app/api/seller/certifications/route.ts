
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from 'firebase-admin/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const certificationSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  type: z.string().min(1, 'Type is required'),
  documentUrl: z.string().url().optional(),
  issuedBy: z.string().optional(),
  validTill: z.string().optional().nullable(), // Receive as string, convert to Date
})

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let decodedToken
    try {
      decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true },
    })
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const validation = certificationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation Error', details: validation.error.format() }, { status: 400 })
    }

    const { sellerId, type, documentUrl, issuedBy, validTill } = validation.data

    const sellerUser = await prisma.sellerUser.findUnique({
      where: { sellerId_userId: { sellerId, userId: user.id } },
      include: { seller: { select: { status: true } } }
    })

    if (!sellerUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (sellerUser.seller.status !== 'draft') return NextResponse.json({ error: 'Cannot edit submitted seller' }, { status: 400 })

    const cert = await prisma.sellerCertification.create({
      data: {
        sellerId,
        type,
        documentUrl,
        issuedBy,
        validTill: validTill ? new Date(validTill) : null
      }
    })

    return NextResponse.json({ success: true, certification: cert })

  } catch (error: any) {
    console.error('Certification API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get('session')?.value
        if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
        let decodedToken
        try {
          decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
        } catch {
          return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }
    
        const user = await prisma.user.findUnique({
          where: { firebaseUid: decodedToken.uid },
          select: { id: true },
        })
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const sellerId = searchParams.get('sellerId')

        if (!id || !sellerId) return NextResponse.json({ error: 'ID and SellerID required' }, { status: 400 })

        const sellerUser = await prisma.sellerUser.findUnique({
            where: { sellerId_userId: { sellerId, userId: user.id } },
            include: { seller: { select: { status: true } } }
        })
      
        if (!sellerUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        if (sellerUser.seller.status !== 'draft') return NextResponse.json({ error: 'Cannot edit submitted seller' }, { status: 400 })

        await prisma.sellerCertification.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
