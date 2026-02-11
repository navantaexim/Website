import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

// 1. Zod Validation
const addressSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  addressId: z.string().optional(), // Optional for creation, required for update
  type: z.enum(['registered', 'manufacturing'], {
    errorMap: () => ({ message: "Type must be 'registered' or 'manufacturing'" }),
  }),
  addressLine: z.string().min(5, 'Address line must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: z.string().default('India'),
})

export async function POST(request: Request) {
  try {
    // 2. Authentication
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: No session' }, { status: 401 })
    }

    let decodedToken
    try {
      decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 })
    }

    const firebaseUid = decodedToken.uid

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Parse Body
    const body = await request.json()
    const validation = addressSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { sellerId, addressId, type, addressLine, city, state, pincode, country } = validation.data

    // 4. Verify Ownership
    const sellerUser = await prisma.sellerUser.findUnique({
      where: {
        sellerId_userId: {
          sellerId,
          userId: user.id,
        },
      },
    })

    if (!sellerUser) {
      return NextResponse.json({ error: 'Unauthorized access to seller' }, { status: 403 })
    }

    // 5. Check Duplicate Registered Address Logic
    if (type === 'registered') {
      const existingRegistered = await prisma.sellerAddress.findFirst({
        where: {
          sellerId,
          type: 'registered',
          // Exclude current address if updating
          id: addressId ? { not: addressId } : undefined,
        },
      })

      if (existingRegistered) {
        return NextResponse.json(
          { error: 'A registered address already exists. Only one is allowed.' },
          { status: 400 }
        )
      }
    }

    // 6. Perform Create or Update
    if (addressId) {
      // Update
      // Verify address belongs to seller first
      const existingAddress = await prisma.sellerAddress.findFirst({
        where: { id: addressId, sellerId },
      })

      if (!existingAddress) {
        return NextResponse.json({ error: 'Address not found for this seller' }, { status: 404 })
      }

      await prisma.sellerAddress.update({
        where: { id: addressId },
        data: {
          type,
          addressLine,
          city,
          state,
          country,
          pincode,
        },
      })
    } else {
      // Create
      await prisma.sellerAddress.create({
        data: {
          sellerId,
          type,
          addressLine,
          city,
          state,
          country,
          pincode,
        },
      })
    }

    // 7. Return Updated Seller with Addresses
    const updatedSeller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        addresses: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: addressId ? 'Address updated' : 'Address added',
      seller: updatedSeller,
    })
  } catch (error: any) {
    console.error('Address API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
