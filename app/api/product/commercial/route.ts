import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

// 1. Zod Schema
const commercialSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  moq: z.number().int().gt(0, 'MOQ must be greater than 0'),
  capacityPerMonth: z.number().int().gt(0, 'Capacity must be greater than 0'),
  leadTimeDays: z.number().int().gt(0, 'Lead time must be greater than 0'),
  packaging: z.string().min(1, 'Packaging details are required'),
  portOfDispatch: z.string().min(1, 'Port of dispatch is required'),
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
    const validation = commercialSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validation.error.format() },
        { status: 400 }
      )
    }

    const {
      productId,
      moq,
      capacityPerMonth,
      leadTimeDays,
      packaging,
      portOfDispatch,
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

    // Check if user is linked to seller
    const sellerUser = product.seller.users[0]
    if (!sellerUser) {
      return NextResponse.json({ error: 'Unauthorized access to product' }, { status: 403 })
    }

    // Check if Product is Draft
    if (product.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft products can be edited' }, { status: 400 })
    }

    // 5. Upsert ProductCommercial
    const commercial = await prisma.productCommercial.upsert({
      where: { productId },
      update: {
        moq,
        capacityPerMonth,
        leadTimeDays,
        packaging,
        portOfDispatch,
      },
      create: {
        productId,
        moq,
        capacityPerMonth,
        leadTimeDays,
        packaging,
        portOfDispatch,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Product commercial details saved successfully',
      commercial,
    })

  } catch (error: any) {
    console.error('Product Commercial Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
