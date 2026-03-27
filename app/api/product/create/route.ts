import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

// 🔒 STRONG VALIDATION SCHEMA
const createProductSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),

  name: z.string()
    .trim()
    .min(3, 'Product name must be at least 3 characters')
    .max(120, 'Product name too long'),

  categoryId: z.string().min(1, 'Category ID is required'),

  hsCode: z.string()
    .trim()
    .regex(/^\d{6,10}$/, 'HS Code must be 6-10 digits'),

  productType: z.enum(['standard', 'custom', 'made-to-order']),

  originCountryId: z.string().min(1, 'Origin Country ID is required'),
})

export async function POST(request: Request) {
  try {
    // =========================
    // 1. AUTH CHECK
    // =========================
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: No session' }, { status: 401 })
    }

    let decodedToken
    try {
      decodedToken = await getAuth().verifySessionCookie(sessionCookie, false)
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

    // =========================
    // 2. BODY VALIDATION
    // =========================
    const body = await request.json()

    const validation = createProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const {
      sellerId,
      name,
      categoryId,
      hsCode,
      productType,
      originCountryId,
    } = validation.data

    // =========================
    // 3. AUTHORIZATION CHECK
    // =========================
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
      return NextResponse.json(
        { error: 'Unauthorized access to seller' },
        { status: 403 }
      )
    }

    // Rule: Seller must not be in 'draft' status to create products
    // Submitted sellers are allowed to pre-populate catalogs before approval.
    if (sellerUser.seller.status === 'draft' || sellerUser.seller.status === 'rejected') {
      return NextResponse.json(
        { error: 'Action disallowed for your current seller status.' },
        { status: 403 }
      )
    }

    if (sellerUser.seller.status !== 'active') {
      return NextResponse.json(
        { error: 'Seller account is not active' },
        { status: 403 }
      )
    }

    // =========================
    // 4. TRANSACTION (SAFE CREATE)
    // =========================
    const newProduct = await prisma.$transaction(async (tx) => {
      const [category, country] = await Promise.all([
        tx.category.findUnique({ where: { id: categoryId } }),
        tx.country.findUnique({ where: { id: originCountryId } })
      ])

      if (!category) throw new Error('Invalid Category ID')
      if (!country) throw new Error('Invalid Origin Country ID')

      // 🔒 Optional: prevent duplicate drafts (same name + seller)
      const existing = await tx.product.findFirst({
        where: {
          sellerId,
          name,
          status: 'draft',
        },
      })

      if (existing) {
        throw new Error('Draft product with same name already exists')
      }

      // 🚀 CREATE PRODUCT
      return await tx.product.create({
        data: {
          sellerId,
          name,
          categoryId,
          hsCode,
          productType,
          originCountryId,
          status: 'draft',
        },
      })
    })

    // =========================
    // 5. SUCCESS RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      message: 'Product draft created successfully',
      productId: newProduct.id,
    })

  } catch (error: any) {
    console.error('Create Product Error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Internal Server Error',
      },
      { status: 500 }
    )
  }
}