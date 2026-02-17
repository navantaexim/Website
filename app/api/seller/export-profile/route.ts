
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from 'firebase-admin/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const exportProfileSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  exportExperience: z.coerce.number().int().min(0),
  annualTurnover: z.string().min(1),
  logisticsModes: z.array(z.string()),
  marketIds: z.array(z.string()).optional(),
  incotermIds: z.array(z.string()).optional(),
  hsCodes: z.array(z.string()).optional(),
})

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let decodedToken
    try {
      decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const validation = exportProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation Error', details: validation.error.format() }, { status: 400 })
    }

    const { 
        sellerId, 
        exportExperience, 
        annualTurnover, 
        logisticsModes, 
        marketIds, 
        incotermIds, 
        hsCodes 
    } = validation.data

    const sellerUser = await prisma.sellerUser.findUnique({
      where: { sellerId_userId: { sellerId, userId: user.id } },
      include: { seller: { select: { status: true } } }
    })

    if (!sellerUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (sellerUser.seller.status !== 'draft') return NextResponse.json({ error: 'Cannot edit submitted seller' }, { status: 400 })

    // Transaction to handle profile and relations
    const result = await prisma.$transaction(async (tx) => {
        // 1. Upsert Profile
        const profile = await tx.exportProfile.upsert({
            where: { sellerId },
            update: {
                exportExperience,
                annualTurnover,
                logisticsModes
            },
            create: {
                sellerId,
                exportExperience,
                annualTurnover,
                logisticsModes
            }
        })

        // 2. Handle Markets
        if (marketIds) {
            await tx.exportProfileMarket.deleteMany({ where: { exportProfileId: profile.id } })
            if (marketIds.length > 0) {
                await tx.exportProfileMarket.createMany({
                    data: marketIds.map(countryId => ({
                        exportProfileId: profile.id,
                        countryId
                    }))
                })
            }
        }

        // 3. Handle Incoterms
        if (incotermIds) {
            await tx.exportProfileIncoterm.deleteMany({ where: { exportProfileId: profile.id } })
            if (incotermIds.length > 0) {
                await tx.exportProfileIncoterm.createMany({
                    data: incotermIds.map(incotermId => ({
                        exportProfileId: profile.id,
                        incotermId
                    }))
                })
            }
        }

        // 4. Handle HS Codes
        if (hsCodes) {
            await tx.exportProfileHsCode.deleteMany({ where: { exportProfileId: profile.id } })
            if (hsCodes.length > 0) {
                await tx.exportProfileHsCode.createMany({
                    data: hsCodes.map(hsCode => ({
                        exportProfileId: profile.id,
                        hsCode
                    }))
                })
            }
        }

        return profile
    })

    return NextResponse.json({ success: true, profile: result })

  } catch (error: any) {
    console.error('Export Profile API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
