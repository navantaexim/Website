import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET() {
  try {
    // 1. Check Admin Permission
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    // 2. Fetch Submitted Products with all details
    const products = await prisma.product.findMany({
      where: {
        status: 'submitted',
      },
      include: {
        seller: {
          select: {
            id: true,
            legalName: true,
            status: true,
          }
        },
        specs: true,
        commercial: true,
        compliance: {
          include: {
            standards: true,
            certificates: true,
          }
        },
        media: true,
        category: {
          select: {
            name: true
          }
        },
        originCountry: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error: any) {
    console.error('Fetch Submitted Products Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
