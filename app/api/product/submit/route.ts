import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

// 1. Zod Schema
const submitSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
})

export async function POST(request: Request) {
  try {
    // 2. Authentication
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized: No session' },
        { status: 401 }
      )
    }

    let decodedToken
    try {
      decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session' },
        { status: 401 }
      )
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
    const validation = submitSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { productId } = validation.data

    // 4. Retrieve Product with all necessary relations
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          include: {
            users: {
              where: { userId: user.id },
            },
          },
        },
        specs: true,
        commercial: true,
        compliance: true,
        media: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // 5. Authorization Check
    const sellerUser = product.seller.users[0]
    if (!sellerUser) {
      return NextResponse.json(
        { error: 'Unauthorized access to product' },
        { status: 403 }
      )
    }

    // 6. Validation Logic
    const errors: Record<string, string> = {}

    // Rule: Product must be draft
    if (product.status !== 'draft') {
      errors.status = 'Product must be in draft status to submit'
    }

    // Rule: Seller must be verified
    if (product.seller.verificationStage !== 'verified') {
      errors.seller = 'Seller must be verified before submitting products'
    }

    // Rule: Must have Specification
    if (!product.specs) {
      errors.specification = 'Product specification is missing'
    }

    // Rule: Must have Commercial
    if (!product.commercial) {
      errors.commercial = 'Product commercial details are missing'
    }

    // Rule: Must have Compliance
    if (!product.compliance) {
      errors.compliance = 'Product compliance details are missing'
    }

    // Rule: At least 1 media image
    const hasImage = product.media.some((m) => m.type === 'image')
    if (!hasImage) {
      errors.media = 'At least 1 product image is required'
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors,
        },
        { status: 400 }
      )
    }

    // 7. Success - Update status
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'submitted',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Product submitted successfully',
      product: updatedProduct,
    })
  } catch (error: any) {
    console.error('Product Submission Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
