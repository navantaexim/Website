import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

/**
 * Admin API to approve a seller.
 * Transition status from 'submitted' to 'verified'.
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

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 })
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
        { error: `Cannot approve seller with status '${seller.status}'. Must be 'submitted'.` },
        { status: 400 }
      )
    }

    // 3. Update Seller status and verification stage with Audit Logging
    const updatedSeller = await prisma.$transaction(async (tx) => {
      const seller = await tx.seller.update({
        where: { id: sellerId },
        data: {
          status: 'verified',
          verificationStage: 'verified',
        },
      })

      await tx.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'APPROVE_SELLER',
          entityType: 'SELLER',
          entityId: sellerId,
          details: {
            legalName: seller.legalName,
            previousStatus: 'submitted',
            newStatus: 'verified'
          },
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || '0.0.0.0'
        }
      })

      return seller
    })

    // Log the action to console/server logs at minimum
    console.log(`[ADMIN ACTION] Seller '${seller.legalName}' (${sellerId}) approved by admin ${adminUser.email}`)

    return NextResponse.json({
      success: true,
      message: 'Seller approved successfully',
      seller: updatedSeller,
    })
  } catch (error: any) {
    console.error('Approve Seller Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
