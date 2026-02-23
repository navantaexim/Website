import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

/**
 * Admin API to reject a product.
 * Transition status from 'submitted' to 'rejected'.
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
    const { reason: rejectionReason } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    // 2. Fetch product and verify current status
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { status: true, name: true, sellerId: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.status !== 'submitted') {
      return NextResponse.json(
        { error: `Cannot reject product with status '${product.status}'. Must be 'submitted'.` },
        { status: 400 }
      )
    }

    // 3. Update Product status with Audit Logging in Transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          status: 'rejected',
          rejectionReason,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'REJECT_PRODUCT',
          entityType: 'PRODUCT',
          entityId: productId,
          details: {
            productName: product.name,
            sellerId: product.sellerId,
            previousStatus: 'submitted',
            newStatus: 'rejected',
            reason: rejectionReason
          },
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || '0.0.0.0'
        }
      })

      return updated
    })

    return NextResponse.json({
      success: true,
      message: 'Product rejected successfully',
      product: updatedProduct,
    })
  } catch (error: any) {
    console.error('Reject Product Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
