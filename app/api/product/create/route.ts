import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

// 1. Zod Schema
const createProductSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  hsCode: z.string().min(1, 'HS Code is required'),
  productType: z.enum(['standard', 'custom', 'made-to-order']),
  originCountryId: z.string().min(1, 'Origin Country ID is required'),
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

    // 3. Parse and Validate Request Body
    const body = await request.json()
    const validation = createProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { sellerId, name, categoryId, hsCode, productType, originCountryId } = validation.data

    // 4. Verify Authorization and Seller Status
    const sellerUser = await prisma.sellerUser.findUnique({
      where: {
        sellerId_userId: {
          sellerId,
          userId: user.id,
        },
      },
      include: {
        seller: {
          select: {
            verificationStage: true,
            status: true,
          },
        },
      },
    })

    if (!sellerUser) {
      return NextResponse.json({ error: 'Unauthorized access to seller' }, { status: 403 })
    }

    // Rule: Seller must be verified
    // We check verificationStage. You might also want to check status is 'active' depending on logic,
    // but the requirement specifically said "Seller must be verified".
    if (sellerUser.seller.verificationStage !== 'verified') {
      return NextResponse.json(
        { error: 'Seller must be verified to create products' },
        { status: 403 }
      )
    }

    // 5. Create Product using Transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      // Verify Category exists (Optional but good practice)
      const category = await tx.category.findUnique({
        where: { id: categoryId },
      })
      if (!category) {
        throw new Error('Invalid Category ID')
      }

      // Verify Country exists
      const country = await tx.country.findUnique({
        where: { id: originCountryId },
      })
      if (!country) {
        throw new Error('Invalid Origin Country ID')
      }

      // Create Product
      return await tx.product.create({
        data: {
          sellerId,
          name,
          categoryId,
          hsCode,
          productType,
          originCountryId,
          status: 'draft', // Explicitly set status to draft
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Product draft created successfully',
      productId: newProduct.id,
    })

  } catch (error: any) {
    console.error('Create Product Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
