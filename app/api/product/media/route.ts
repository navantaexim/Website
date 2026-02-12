
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { z } from 'zod'

const mediaSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  url: z.string().url('Invalid URL'),
  type: z.enum(['image', 'video', 'document']),
})

async function getAuthenticatedUser(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null
  try {
    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    return await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true },
    })
  } catch {
    return null
  }
}

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
    
    if (!product) return { error: 'Product not found', status: 404 }
    if (product.seller.users.length === 0) return { error: 'Unauthorized', status: 403 }
    if (product.status !== 'draft') return { error: 'Only draft products can be edited', status: 400 }
    
    return { product }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validation = mediaSchema.safeParse(body)
    if (!validation.success) return NextResponse.json({ error: 'Validation Error' }, { status: 400 })

    const { productId, url, type } = validation.data
    const access = await verifyProductAccess(user.id, productId)
    if (access.error) return NextResponse.json({ error: access.error }, { status: access.status })

    const media = await prisma.productMedia.create({
      data: {
        productId,
        url,
        type,
        isPrimary: false // Logic to set primary can be added later
      }
    })

    return NextResponse.json({ success: true, media })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
    try {
        const user = await getAuthenticatedUser(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const productId = searchParams.get('productId')

        if (!id || !productId) return NextResponse.json({ error: 'ID required' }, { status: 400 })
        
        const access = await verifyProductAccess(user.id, productId)
        if (access.error) return NextResponse.json({ error: access.error }, { status: access.status })

        await prisma.productMedia.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
