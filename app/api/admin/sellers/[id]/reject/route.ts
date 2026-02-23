import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

/**
 * Admin API to reject a seller.
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

    const { id: sellerId } = await params
    const { reason: rejectionReason } = await request.json()

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 })
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    // 2. Fetch seller and verify current status
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { status: true, legalName: true }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    if (seller.status !== 'submitted') {
      return NextResponse.json(
        { error: `Cannot reject seller with status '${seller.status}'. Must be 'submitted'.` },
        { status: 400 }
      )
    }

    // 3. Update Seller status with Audit Logging
    const updatedSeller = await prisma.$transaction(async (tx) => {
      const updated = await tx.seller.update({
        where: { id: sellerId },
        data: {
          status: 'rejected',
          rejectionReason,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'REJECT_SELLER',
          entityType: 'SELLER',
          entityId: sellerId,
          details: {
            legalName: seller.legalName,
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
      message: 'Seller rejected successfully',
      seller: updatedSeller,
    })
  } catch (error: any) {
    console.error('Reject Seller Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
