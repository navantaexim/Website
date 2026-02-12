
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

// 1. Zod Schema
const updateSellerSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  legalName: z.string().min(1, 'Legal Name is required'),
  businessType: z.string().min(1, 'Business Type is required'),
  yearEstablished: z.coerce.number().int().max(new Date().getFullYear(), 'Year Established cannot be in the future'),
  gstNumber: z.string().length(15, 'GST Number must be exactly 15 characters'),
  iecCode: z.string().length(10, 'IEC Code must be exactly 10 characters'),
})

export async function PUT(request: Request) {
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

    // Get Prisma User ID
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Parse and Validate Request Body with Zod
    const body = await request.json()
    const validationResult = updateSellerSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const { sellerId, legalName, businessType, yearEstablished, gstNumber, iecCode } = validationResult.data

    // 4. Verify Ownership and Seller Status
    // Find the seller where the current user is a Primary Owner
    const sellerUserLink = await prisma.sellerUser.findUnique({
      where: {
        sellerId_userId: {
          sellerId,
          userId: user.id,
        },
      },
      include: {
        seller: {
          select: { status: true },
        },
      },
    })

    if (!sellerUserLink) {
      return NextResponse.json({ error: 'Seller not found or unauthorized' }, { status: 403 })
    }

    // Check if user is Primary Owner
    if (sellerUserLink.role !== 'owner' || !sellerUserLink.isPrimary) {
      return NextResponse.json({ error: 'Only primary owner can edit basic info' }, { status: 403 })
    }

    // Check if Seller is in Draft status
    if (sellerUserLink.seller.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft sellers can be edited' }, { status: 400 })
    }

    // 5. Update Seller
    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: {
        legalName,
        businessType,
        yearEstablished,
        gstNumber,
        iecCode,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Seller updated successfully',
      seller: updatedSeller,
    })

  } catch (error: any) {
    console.error('Update Seller Error:', error)

     // Handle unique constraint violations
     if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'Field'
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
