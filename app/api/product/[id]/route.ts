import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getAuth } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

/* ---------------- GET PRODUCT ---------------- */

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, false)

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id: productId } = await context.params

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          include: { users: true },
        },
        specs: true,
        commercial: true,
        compliance: {
          include: { standards: true },
        },
        media: true,
        category: true,
        originCountry: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.seller.users.some((u) => u.userId === user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/* ---------------- DELETE PRODUCT ---------------- */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {

    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, false)

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id: productId } = await context.params

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: { include: { users: true } }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.seller.users.some(u => u.userId === user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    /* SAFE DELETE */

    await prisma.$transaction(async (tx) => {

      /* DELETE STANDARDS FIRST */

      const compliances = await tx.productCompliance.findMany({
        where: { productId },
        select: { id: true }
      })

      const complianceIds = compliances.map(c => c.id)

      if (complianceIds.length > 0) {
        await tx.productStandard.deleteMany({
          where: {
            complianceId: {
              in: complianceIds
            }
          }
        })
      }

      /* DELETE OTHER CHILD TABLES */

      await Promise.all([
        tx.productMedia.deleteMany({ where: { productId } }),
        tx.productSpecification.deleteMany({ where: { productId } }),
        tx.productCommercial.deleteMany({ where: { productId } }),
        tx.productCompliance.deleteMany({ where: { productId } }),
      ])

      /* DELETE PRODUCT */

      await tx.product.delete({
        where: { id: productId }
      })

    })
    return NextResponse.json({ success: true })

  } catch (error) {

    console.error('Error deleting product:', error)

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}