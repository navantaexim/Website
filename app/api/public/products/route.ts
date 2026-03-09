import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")
    const hsCode = searchParams.get("hsCode")
    const categoryId = searchParams.get("categoryId")
    const page = Math.max(Number(searchParams.get("page") || 1), 1)
    const limit = 12

    const whereClause: any = {
        status: "active",

        // Prevent incomplete products from leaking
        specs: { isNot: null },
        commercial: { isNot: null },
        compliance: { isNot: null },
        media: { some: {} }
    }

    if (hsCode) {
        whereClause.hsCode = hsCode
    }

    if (categoryId) {
        whereClause.categoryId = categoryId
    }

    if (search) {
        whereClause.name = {
            contains: search,
            mode: "insensitive"
        }
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where: whereClause,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                createdAt: "desc"
            },
            include: {
                media: {
                    take: 1
                },
                seller: {
                    select: {
                        legalName: true,
                        verificationStage: true,
                        addresses: {
                            take: 1,
                            select: {
                                city: true,
                                state: true
                            }
                        }
                    }
                },
                category: {
                    select: {
                        name: true
                    }
                }
            }
        }),

        prisma.product.count({
            where: whereClause
        })
    ])

    return NextResponse.json({
        data: products,
        pagination: {
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }
    })
}