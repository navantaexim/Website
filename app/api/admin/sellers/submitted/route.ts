import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET() {
  try {
    // 1. Check Admin Permission
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    // 2. Fetch Submitted Sellers with all details
    const sellers = await prisma.seller.findMany({
      where: {
        status: 'submitted',
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                picture: true,
              },
            },
          },
        },
        addresses: true,
        documents: true,
        capabilities: true,
        exportProfile: {
          include: {
            markets: {
              include: {
                country: true,
              },
            },
            incoterms: {
              include: {
                incoterm: true,
              },
            },
            hsExpertise: true,
          },
        },
        certificates: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      count: sellers.length,
      sellers,
    })
  } catch (error: any) {
    console.error('Fetch Submitted Sellers Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
