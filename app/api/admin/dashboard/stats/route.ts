import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET() {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const [
      totalSellers,
      pendingSellers,
      totalProducts,
      pendingProducts,
      totalUsers,
      recentSellers,
      recentProducts,
      recentLogs
    ] = await Promise.all([
      prisma.seller.count(),
      prisma.seller.count({ where: { status: 'submitted' } }),
      prisma.product.count(),
      prisma.product.count({ where: { status: 'submitted' } }),
      prisma.user.count(),
      prisma.seller.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          users: {
            include: { user: { select: { name: true, email: true } } }
          }
        }
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { legalName: true } },
          category: { select: { name: true } }
        }
      }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalSellers,
        pendingSellers,
        totalProducts,
        pendingProducts,
        totalUsers,
      },
      recentSellers,
      recentProducts,
      recentLogs
    })
  } catch (error: any) {
    console.error('Fetch Dashboard Stats Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
