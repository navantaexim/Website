
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getAuth } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id: productId } = await Promise.resolve(params);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          include: {
            users: true,
          },
        },
        specs: true,
        commercial: true,
        compliance: {
          include: {
            standards: true
          }
        },
        media: true,
        category: true,
        originCountry: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Authorization check
    if (!product.seller.users.some(u => u.userId === user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
