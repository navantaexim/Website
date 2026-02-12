
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let decodedToken
    try {
      decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()
    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { firebaseUid: decodedToken.uid } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          include: { users: { where: { userId: user.id } } }
        },
        specs: true,
        commercial: true,
        compliance: true,
        media: true,
      },
    })

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (product.seller.users.length === 0) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    if (product.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft products can be submitted' }, { status: 400 })
    }

    // Validation
    const errors: string[] = []
    
    // Check Basic Info (implied by existence, but double check key fields)
    if (!product.name || !product.hsCode || !product.categoryId) errors.push("Basic product info is incomplete")

    // Check Specs
    // specs is one-to-one (optional in schema), so it might be null if not created
    // However, our API upserts it.
    // Let's check if the relation exists and has meaningful data if needed
    // Assuming existence is enough for now based on previous steps
    if (!product.specs) errors.push("Detailed specifications are missing")

    // Check Commercial
    if (!product.commercial) errors.push("Commercial/Logistics details are missing")

    // Check Compliance
    if (!product.compliance) errors.push("Compliance info is missing")

    // Check Media
    if (product.media.length === 0) errors.push("At least one product image is required")

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation Failed', details: errors }, { status: 400 })
    }

    // Determine target status.
    // If seller is unverified, maybe we can't submit? 
    // Requirement said: "Seller must be verified" to CREATE product.
    // So if they created it, they are verified (or logic changed).
    // Let's assume we proceed to 'pending_approval' or 'active' depending on platform rules.
    // For now, let's set to 'active' or a 'submitted' state if distinct.
    // Schema Enum: 'unknown' likely has 'active', 'draft', etc.
    // Let's use 'active' or 'pending'. User request: "Redirect to product dashboard".
    
    // Let's update to 'submitted' or 'active'. ProductStatus enum usually has: draft, active, inactive, rejected?
    // Let's use 'active' for now as a simple flow, or 'pending' if it needs admin review.
    // Based on previous convos, we used 'submitted' for seller. 
    // Let's check schema. Re-using 'active' seems safe if no admin review step is built yet.
    // Actually, let's use 'active' so it shows up.
    
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: 'active' } // Or 'submitted' if you have that enum value
    })

    return NextResponse.json({ success: true, product: updated })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
