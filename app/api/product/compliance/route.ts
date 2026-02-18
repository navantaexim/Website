import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

// 1. Zod Schema
const complianceSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  inspectionType: z.string().min(1, 'Inspection Type is required'),
  standards: z.array(z.string().min(1)).min(1, 'At least one standard is required'),
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
    const validation = complianceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { productId, inspectionType, standards } = validation.data

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

    // 5. Upsert Compliance and Standards Transaction
    const compliance = await prisma.$transaction(async (tx) => {
      // Upsert ProductCompliance
      const comp = await tx.productCompliance.upsert({
        where: { productId },
        update: {
          inspectionType,
          status: 'pending', // Reset status if modified
          // We will recreate standards below
        },
        create: {
          productId,
          inspectionType,
          status: 'pending',
        },
      })

      // Handle Standards: Delete existing and create new ones for simplicity
      // First, delete existing standards for this complianceId
      await tx.productStandard.deleteMany({
        where: { complianceId: comp.id },
      })

      // Create new standards
      await tx.productStandard.createMany({
        data: standards.map((std) => ({
          complianceId: comp.id,
          standard: std,
        })),
      })

      // Return compliance with standards
      return await tx.productCompliance.findUnique({
        where: { id: comp.id },
        include: { standards: true },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Product compliance details saved successfully',
      compliance,
    })

  } catch (error: any) {
    console.error('Product Compliance Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
