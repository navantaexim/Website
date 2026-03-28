import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

/* ===========================
   CONSTANTS
=========================== */

const MAX_DIMENSION = 100000      // Prevent absurd values
const MAX_WEIGHT = 50000          // 50 tons max

const unitEnum = z.enum([
  'Millimeters (mm)',
  'Centimeters (cm)',
  'Meters (m)',
  'Inches (in)',
])

/* ===========================
   DIMENSION SCHEMAS
=========================== */

const rectangularSchema = z.object({
  type: z.literal('Rectangular / Block'),
  unit: unitEnum,
  length: z.coerce.number().gt(0).lt(MAX_DIMENSION),
  width: z.coerce.number().gt(0).lt(MAX_DIMENSION),
  height: z.coerce.number().gt(0).lt(MAX_DIMENSION),
})

const cylindricalSchema = z.object({
  type: z.literal('Cylindrical / Rod'),
  unit: unitEnum,
  length: z.coerce.number().gt(0).lt(MAX_DIMENSION),
  outerDiameter: z.coerce.number().gt(0).lt(MAX_DIMENSION),
})

const sheetSchema = z.object({
  type: z.literal('Sheet / Plate'),
  unit: unitEnum,
  length: z.coerce.number().gt(0).lt(MAX_DIMENSION),
  width: z.coerce.number().gt(0).lt(MAX_DIMENSION),
  thickness: z.coerce.number().gt(0).lt(MAX_DIMENSION),
})

const tubularSchema = z.object({
  type: z.literal('Tubular / Pipe'),
  unit: unitEnum,
  length: z.coerce.number().gt(0).lt(MAX_DIMENSION),
  outerDiameter: z.coerce.number().gt(0).lt(MAX_DIMENSION),
  wallThickness: z.coerce.number().gt(0).lt(MAX_DIMENSION),
})

const dimensionSchema = z
  .discriminatedUnion('type', [
    rectangularSchema,
    cylindricalSchema,
    sheetSchema,
    tubularSchema,
  ])
  .refine((data) => {
    if (data.type === 'Tubular / Pipe') {
      return data.wallThickness < data.outerDiameter / 2
    }
    return true
  }, {
    message: 'Wall thickness cannot exceed half of outer diameter',
    path: ['wallThickness'],
  })


/* ===========================
   SPECIFICATION SCHEMA
=========================== */

const specificationSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  materialGrade: z.string().min(1, 'Material Grade is required'),
  dimensions: dimensionSchema,
  weightKg: z.coerce.number().gt(0).lt(MAX_WEIGHT),
  tolerance: z.string().min(1, 'Tolerance is required'),
  surfaceFinish: z.string().min(1, 'Surface Finish is required'),
  process: z.string().min(1, 'Process is required'),
  drawingAvailable: z.boolean(),
})

/* ===========================
   ROUTE HANDLER
=========================== */

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: No session' }, { status: 401 })
    }

    let decodedToken
    try {
      decodedToken = await getAuth().verifySessionCookie(sessionCookie, false)
    } catch {
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

    if (!sellerUser) {
      return NextResponse.json({ error: 'Unauthorized access to product' }, { status: 403 })
    }

    if (sellerUser.role !== 'owner') {
      return NextResponse.json({ error: 'Only owner can edit specifications' }, { status: 403 })
    }

    if (product.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft products can be edited' }, { status: 400 })
    }

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

