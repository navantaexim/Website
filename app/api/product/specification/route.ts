import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

// 1. Zod Schema
const dimensionSchema = z.object({
  type: z.string({ required_error: 'Dimension type is required' }),
  unit: z.string({ required_error: 'Dimension unit is required' }),
}).passthrough() // Allow other properties like length, width, etc.

const specificationSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  materialGrade: z.string().min(1, 'Material Grade is required'),
  dimensions: dimensionSchema,
  weightKg: z.number().gt(0, 'Weight must be greater than 0'),
  tolerance: z.string().min(1, 'Tolerance is required'),
  surfaceFinish: z.string().min(1, 'Surface Finish is required'),
  process: z.string().min(1, 'Process is required'),
  drawingAvailable: z.boolean(),
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
    const validation = specificationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validation.error.format() },
        { status: 400 }
      )
    }

    const {
      productId,
      materialGrade,
      dimensions,
      weightKg,
      tolerance,
      surfaceFinish,
      process,
      drawingAvailable,
    } = validation.data

    // 4. Verify Authorization and Product Status
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
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const sellerUser = product.seller.users[0]

    // Check if user is linked to seller
    if (!sellerUser) {
      return NextResponse.json({ error: 'Unauthorized access to product' }, { status: 403 })
    }

    // Check if user is Owner
    if (sellerUser.role !== 'owner') {
      return NextResponse.json({ error: 'Only owner can edit specifications' }, { status: 403 })
    }

    // Check if Product is Draft
    if (product.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft products can be edited' }, { status: 400 })
    }

    // 5. Upsert ProductSpecification
    const spec = await prisma.productSpecification.upsert({
      where: { productId },
      update: {
        materialGrade,
        dimensions: dimensions as any,
        weightKg,
        tolerance,
        surfaceFinish,
        process,
        drawingAvailable,
      },
      create: {
        productId,
        materialGrade,
        dimensions: dimensions as any,
        weightKg,
        tolerance,
        surfaceFinish,
        process,
        drawingAvailable,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Product specification saved successfully',
      specification: spec,
    })

  } catch (error: any) {
    console.error('Product Specification Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
