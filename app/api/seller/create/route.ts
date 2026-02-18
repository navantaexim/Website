import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin' // Adjust path if needed, assumed lib/
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    // 1. Authenticate the user
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: No session' }, { status: 401 })
    }

    let decodedToken
    try {
      decodedToken = await getAuth().verifySessionCookie(sessionCookie, true /** checkRevoked */)
    } catch (error) {
      console.error('Session verification failed:', error)
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 })
    }

    const firebaseUid = decodedToken.uid

    // 2. Get the Prisma User
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Parse and Validate Request Body
    const body = await request.json()
    const {
      legalName,
      businessType,
      yearEstablished,
      gstNumber,
      iecCode,
      panNumber,
      cinOrLlpin,
      // SellerUser fields
      phone,
      whatsapp,
      designation,
    } = body

    // Basic validation
    if (
      !legalName ||
      !businessType ||
      !yearEstablished ||
      !gstNumber ||
      !iecCode ||
      !phone ||
      whatsapp === undefined ||
      !designation
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 4. Perform Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Seller
      const seller = await tx.seller.create({
        data: {
          legalName,
          businessType,
          yearEstablished: Number(yearEstablished),
          gstNumber,
          iecCode,
          panNumber,
          cinOrLlpin,
          status: 'draft', // Default, but being explicit
          verificationStage: 'unverified', // Default
        },
      })

      // Create SellerUser link
      await tx.sellerUser.create({
        data: {
          sellerId: seller.id,
          userId: user.id,
          role: 'owner',
          isPrimary: true,
          phone,
          whatsapp: Boolean(whatsapp),
          designation,
        },
      })

      return seller
    })

    // 5. Return Success
    return NextResponse.json({
      success: true,
      sellerId: result.id,
      message: 'Seller created successfully',
    })
  } catch (error: any) {
    console.error('Seller creation error:', error)

    // Handle unique constraint violations (e.g. GST already exists)
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
