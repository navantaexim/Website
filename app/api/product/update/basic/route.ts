
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

const updateProductSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  hsCode: z.string().min(1, 'HS Code is required'),
  productType: z.enum(['standard', 'custom', 'made-to-order']),
  originCountryId: z.string().min(1, 'Origin Country is required'),
})

async function getAuthenticatedUser(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null

  try {
    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true },
    })
    return user
  } catch {
    return null
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validation = updateProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation Error', details: validation.error.format() }, { status: 400 })
    }

    const { id, name, categoryId, hsCode, productType, originCountryId } = validation.data

    // 1. Verify Ownership & Status
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          include: {
            users: {
              where: { userId: user.id }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user is associated with the seller
    if (product.seller.users.length === 0) {
      return NextResponse.json({ error: 'Unauthorized access to product' }, { status: 403 })
    }

    // Check status
    if (product.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft products can be edited' }, { status: 400 })
    }

    // 2. Perform Update
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        categoryId,
        hsCode,
        productType,
        originCountryId,
      },
      include: {
        category: true,
        originCountry: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    })

  } catch (error: any) {
    console.error('Update Product Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
