
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

const addressSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  type: z.enum(['registered', 'manufacturing']),
  addressLine: z.string().min(5, 'Address line must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: z.string().default('India'),
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
    const validation = addressSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation Error', details: validation.error.format() }, { status: 400 })
    }

    const { sellerId, type, addressLine, city, state, pincode, country } = validation.data

    const sellerUser = await verifySellerAccess(user.id, sellerId)
    if (!sellerUser) return NextResponse.json({ error: 'Unauthorized seller access' }, { status: 403 })
    if (sellerUser.seller.status !== 'draft') return NextResponse.json({ error: 'Cannot edit submitted seller' }, { status: 400 })

    if (type === 'registered') {
        const existing = await prisma.sellerAddress.findFirst({
            where: { sellerId, type: 'registered' }
        })
        if (existing) {
             return NextResponse.json({ error: 'A registered address already exists.' }, { status: 400 })
        }
    }

    const address = await prisma.sellerAddress.create({
      data: {
        sellerId,
        type,
        addressLine,
        city,
        state,
        pincode,
        country
      }
    })

    return NextResponse.json({ success: true, address })

  } catch (error: any) {
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

        if (!id || !sellerId) return NextResponse.json({ error: 'Address ID and Seller ID required' }, { status: 400 })
        
        const sellerUser = await verifySellerAccess(user.id, sellerId)
        if (!sellerUser) return NextResponse.json({ error: 'Unauthorized seller access' }, { status: 403 })
        if (sellerUser.seller.status !== 'draft') return NextResponse.json({ error: 'Cannot edit submitted seller' }, { status: 400 })

        // Ensure address belongs to seller
        const address = await prisma.sellerAddress.findFirst({ where: { id, sellerId } })
        if (!address) return NextResponse.json({ error: 'Address not found' }, { status: 404 })

        await prisma.sellerAddress.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
