import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: No session' }, { status: 401 })
    }

    let decodedToken
    try {
      decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    } catch (error) {
      console.error('Session verify failed:', error)
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

    const { sellerId } = await request.json()

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 })
    }

    // 2. Fetch Seller Data
    const sellerUser = await prisma.sellerUser.findUnique({
      where: {
        sellerId_userId: {
          sellerId,
          userId: user.id,
        },
      },
      include: {
        seller: {
          include: {
            addresses: true,
          },
        },
      },
    })

    if (!sellerUser) {
      return NextResponse.json({ error: 'Seller not found or unauthorized' }, { status: 404 })
    }

    const { seller } = sellerUser

    // 3. Validation Rules
    const errors: string[] = []

    // Rule: Seller must be draft
    if (seller.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft sellers can be submitted' }, { status: 400 })
    }

    // Rule: Must have legalName
    if (!seller.legalName || seller.legalName.trim() === '') {
      errors.push('Legal Name is required')
    }

    // Rule: Must have gstNumber
    if (!seller.gstNumber || seller.gstNumber.trim() === '') {
      errors.push('GST Number is required')
    }

    // Rule: Must have iecCode
    if (!seller.iecCode || seller.iecCode.trim() === '') {
      errors.push('IEC Code is required')
    }

    // Rule: Must have at least 1 address
    if (!seller.addresses || seller.addresses.length === 0) {
      errors.push('At least one address is required')
    }

    // 4. Return Validation Errors
    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Validation Failed',
        details: errors,
      }, { status: 400 })
    }

    // 5. Update Status
    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: {
        status: 'submitted',
        verificationStage: 'pending_review',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Seller submitted successfully',
      seller: updatedSeller,
    })

  } catch (error: any) {
    console.error('Submit Seller Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
