import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

/* ===========================
   DIMENSION VALIDATION
=========================== */

const unitEnum = z.enum([
  'Millimeters (mm)',
  'Centimeters (cm)',
  'Meters (m)',
  'Inches (in)',
])

const rectangularSchema = z.object({
  type: z.literal('Rectangular / Block'),
  unit: unitEnum,
  length: z.number().gt(0),
  width: z.number().gt(0),
  height: z.number().gt(0),
})

const cylindricalSchema = z.object({
  type: z.literal('Cylindrical / Rod'),
  unit: unitEnum,
  length: z.number().gt(0),
  outerDiameter: z.number().gt(0),
})

const sheetSchema = z.object({
  type: z.literal('Sheet / Plate'),
  unit: unitEnum,
  length: z.number().gt(0),
  width: z.number().gt(0),
  thickness: z.number().gt(0),
})

const tubularSchema = z.object({
  type: z.literal('Tubular / Pipe'),
  unit: unitEnum,
  length: z.number().gt(0),
  outerDiameter: z.number().gt(0),
  wallThickness: z.number().gt(0),
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
  })

/* ===========================
   PRODUCT SUBMIT API
=========================== */

export async function POST(request: Request) {

  try {

    /* ===========================
       AUTHENTICATION
    ============================ */

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    /* ===========================
       LOAD PRODUCT
    ============================ */

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          include: {
            users: { where: { userId: user.id } },
          },
        },
        specs: true,
        commercial: true,
        compliance: {
          include: {
            standards: true,
          },
        },
        media: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.seller.users.length) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (product.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft products can be submitted' },
        { status: 400 }
      )
    }

    const errors: string[] = []

    /* ===========================
       BASIC INFO VALIDATION
    ============================ */

    if (!product.name || !product.hsCode || !product.categoryId) {
      errors.push('Basic product information is incomplete')
    }

    if (!/^\d{6}$|^\d{8}$/.test(product.hsCode)) {
      errors.push('Invalid HS Code format')
    }

    /* ===========================
       SPECIFICATIONS VALIDATION
    ============================ */

    if (!product.specs) {

      errors.push('Detailed specifications are missing')

    } else {

      if (!product.specs.weightKg || product.specs.weightKg <= 0) {
        errors.push('Weight must be greater than 0')
      }

      const dimensionCheck = dimensionSchema.safeParse(product.specs.dimensions)

      if (!dimensionCheck.success) {
        errors.push('Invalid product dimensions')
      }

      /* Drawing Validation */

      if (product.specs?.drawingAvailable) {

        const hasDrawing = product.media.some(
          (m) => m.type === 'drawing'
        )

        if (!hasDrawing) {
          errors.push(
            'Technical drawing must be uploaded when drawing is marked available'
          )
        }

      }

    }

    /* ===========================
       COMMERCIAL VALIDATION
    ============================ */

    if (!product.commercial) {

      errors.push('Commercial details are missing')

    } else {

      if (!product.commercial.moq || product.commercial.moq <= 0) {
        errors.push('MOQ must be greater than 0')
      }

      if (!product.commercial.capacityPerMonth || product.commercial.capacityPerMonth <= 0) {
        errors.push('Production capacity per month must be greater than 0')
      }

      if (!product.commercial.leadTimeDays || product.commercial.leadTimeDays <= 0) {
        errors.push('Lead time must be greater than 0')
      }

      if (!product.commercial.portOfDispatch?.trim()) {
        errors.push('Port of dispatch is required')
      }

    }

    /* ===========================
   COMPLIANCE VALIDATION
=========================== */

    if (!product.compliance) {

      errors.push('Compliance information is missing')

    } else {

      if (!product.compliance.inspectionType) {
        errors.push('Inspection type is required')
      }

      const standards = product.compliance.standards

      if (!standards.length) {
        errors.push('At least one compliance standard must be selected')
      }

      /* Certificate Required When Standards Selected */

      if (standards.length > 0) {

        const certificates = product.media.filter(
          (m) => m.type === 'certificate'
        )

        if (!certificates.length) {
          errors.push(
            'At least one compliance certificate must be uploaded when standards are selected'
          )
        }

      }

    }
    /* ===========================
       MEDIA VALIDATION
    ============================ */

    const productImages = product.media.filter(
      (m) => m.type === 'image'
    )

    if (productImages.length < 3) {
      errors.push('Minimum 3 product images are required')
    }

    if (product.seller.businessType === 'manufacturer') {

      const factoryImages = product.media.filter(
        (m) => m.type === 'factory'
      )

      if (!factoryImages.length) {
        errors.push('Manufacturer must upload at least one factory image')
      }

    }

    /* ===========================
       FINAL VALIDATION RESULT
    ============================ */

    if (errors.length) {

      return NextResponse.json(
        {
          error: 'Validation Failed',
          details: errors
        },
        { status: 400 }
      )

    }

    /* ===========================
       ACTIVATE PRODUCT
    ============================ */

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: 'submitted' },
    })

    return NextResponse.json({
      success: true,
      product: updated,
    })

  } catch (error: any) {

    console.error('Product Submit Error:', error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )

  }

}