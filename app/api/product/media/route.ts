import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

/* ===========================
   MEDIA VALIDATION
=========================== */

const mediaSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  url: z.string().min(1, 'Media URL required'),
  type: z.enum([
    'image',
    'video',
    'document',
    'drawing',
    'factory',
    'certificate'
  ]),
})

/* ===========================
   AUTHENTICATION
=========================== */

async function getAuthenticatedUser() {

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) return null

  try {

    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, false)

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true },
    })

    return user

  } catch {

    return null

  }

}

/* ===========================
   PRODUCT ACCESS CHECK
=========================== */

async function verifyProductAccess(userId: string, productId: string) {

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: {
        include: {
          users: { where: { userId } }
        }
      }
    }
  })

  if (!product)
    return { error: 'Product not found', status: 404 }

  if (product.seller.users.length === 0)
    return { error: 'Unauthorized', status: 403 }

  if (product.status !== 'draft')
    return { error: 'Only draft products can be edited', status: 400 }

  return { product }

}

/* ===========================
   CREATE / REPLACE MEDIA
=========================== */

export async function POST(request: Request) {

  try {

    const user = await getAuthenticatedUser()

    if (!user)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )

    const body = await request.json()

    const validation = mediaSchema.safeParse(body)

    if (!validation.success)
      return NextResponse.json(
        {
          error: 'Validation Error',
          details: validation.error.format()
        },
        { status: 400 }
      )

    const { productId, url, type } = validation.data

    const access = await verifyProductAccess(user.id, productId)

    if ('error' in access)
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      )

    /* ===========================
       IMAGE LIMIT PROTECTION
    ============================ */

    if (type === 'image') {

      const imageCount = await prisma.productMedia.count({
        where: {
          productId,
          type: 'image'
        }
      })

      if (imageCount >= 10) {
        return NextResponse.json(
          { error: 'Maximum 10 product images allowed' },
          { status: 400 }
        )
      }

    }

    /* ===========================
       DRAWING REPLACEMENT LOGIC
    ============================ */

    if (type === 'drawing') {

      const existingDrawing = await prisma.productMedia.findFirst({
        where: {
          productId,
          type: 'drawing'
        }
      })

      if (existingDrawing) {

        const updated = await prisma.productMedia.update({
          where: { id: existingDrawing.id },
          data: { url }
        })

        return NextResponse.json({
          success: true,
          media: updated
        })

      }

    }

    /* ===========================
       NORMAL MEDIA CREATE
    ============================ */

    const media = await prisma.productMedia.create({
      data: {
        productId,
        url,
        type
      }
    })

    return NextResponse.json({
      success: true,
      media
    })

  } catch (error: any) {

    console.error('Product Media Error:', error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )

  }

}

/* ===========================
   DELETE MEDIA
=========================== */

export async function DELETE(request: Request) {

  try {

    const user = await getAuthenticatedUser()

    if (!user)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )

    const { searchParams } = new URL(request.url)

    const productId = searchParams.get('productId')

    if (!productId)
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      )

    const access = await verifyProductAccess(user.id, productId)

    if ('error' in access)
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      )

    // 🔥 FINAL FIX: delete drawing by productId (NOT id)
    const deleted = await prisma.productMedia.deleteMany({
      where: {
        productId: String(productId),
        type: "drawing"
      }
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'No drawing found to delete' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count
    })

  } catch (error: any) {

    console.error('Media Delete Error:', error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )

  }

}