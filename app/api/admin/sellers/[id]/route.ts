import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check Admin Permission
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { id: sellerId } = await params

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 })
    }

    // 2. Fetch Seller with all details
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        users: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                picture: true,
                status: true,
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
        products: {
            take: 10, // Just a preview of products, full product list can be fetched separately if needed
            orderBy: { createdAt: 'desc' },
            include: {
                category: { select: { name: true } },
                originCountry: { select: { name: true } }
            }
        }
      },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      seller,
    })
  } catch (error: any) {
    console.error('Fetch Seller Detail Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
