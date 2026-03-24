import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

/**
 * Admin API to activate a product.
 * Transition status from 'verified' to 'active'.
 * Active products are typically visible on the marketplace.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check Admin Permission
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck
    const adminUser = adminCheck

    const { id: productId } = await params

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // 2. Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // 3. Validation Rules
    if (product.status !== 'verified') {
      return NextResponse.json(
        { error: `Product must be in 'verified' status to be activated. Current status: ${product.status}` },
        { status: 400 }
      )
    }

    // 4. Update Product status with Audit Logging in Transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const [updated] = await Promise.all([
        tx.product.update({
          where: { id: productId },
          data: {
          status: 'active',
        },
        }),
        tx.auditLog.create({
          data: {
          userId: adminUser.id,
          action: 'ACTIVATE_PRODUCT',
          entityType: 'PRODUCT',
          entityId: productId,
          details: {
            productName: product.name,
            previousStatus: 'verified',
            newStatus: 'active'
          },
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || '0.0.0.0'
        }
        })
      ])

      return updated
    })

    return NextResponse.json({
      success: true,
      message: 'Product activated successfully',
      product: updatedProduct,
    })
  } catch (error: any) {
    console.error('Activate Product Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
