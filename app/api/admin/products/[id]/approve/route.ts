import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

/**
 * Admin API to approve a product.
 * Transition status from 'submitted' to 'verified'.
 * Constraint: Seller must be verified first.
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

    // 2. Fetch product and its seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            status: true,
            legalName: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // 3. Validation Rules
    if (product.status !== 'submitted') {
      return NextResponse.json(
        { error: `Product must be in 'submitted' status to be approved. Current: ${product.status}` },
        { status: 400 }
      )
    }

    if (product.seller.status !== 'verified') {
      return NextResponse.json(
        { error: `Cannot approve product. Associated Seller "${product.seller.legalName}" is not verified.` },
        { status: 400 }
      )
    }

    // 4. Update Product status with Audit Logging in Transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const [updated] = await Promise.all([
        tx.product.update({
          where: { id: productId },
          data: {
          status: 'verified',
        },
        }),
        tx.auditLog.create({
          data: {
          userId: adminUser.id,
          action: 'APPROVE_PRODUCT',
          entityType: 'PRODUCT',
          entityId: productId,
          details: {
            productName: product.name,
            sellerId: product.sellerId,
            sellerName: product.seller.legalName,
            previousStatus: 'submitted',
            newStatus: 'verified'
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
      message: 'Product approved successfully',
      product: updatedProduct,
    })
  } catch (error: any) {
    console.error('Approve Product Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
