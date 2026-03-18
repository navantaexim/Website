
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuth } from 'firebase-admin/auth'
import prisma from '@/lib/db'
import { z } from 'zod'

const manufacturingSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  manufacturerType: z.string().min(1, 'Manufacturer Type is required'),
  factoryAreaSqm: z.coerce.number().positive('Factory Area must be positive'),
  employeeRange: z.string().min(1, 'Employee Range is required'),
  engineerRange: z.string().optional(),
  inHouseQC: z.boolean(),
  
  // New Fields
  engineeringCategories: z.array(z.string()).min(1, 'Select at least one category'),
  processType: z.string().min(1, 'Select manufacturing process type'),
  machines: z.array(z.string()).min(1, 'Select at least one machine'),
  description: z.string().min(10, 'Description too short').max(500, 'Description too long'),
})

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let decodedToken
    try {
      decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const validation = manufacturingSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation Error', details: validation.error.format() }, { status: 400 })
    }

    const { 
      sellerId, manufacturerType, factoryAreaSqm, employeeRange, 
      engineerRange, inHouseQC,
      engineeringCategories, processType, machines, description
    } = validation.data

    // Verify ownership
    const sellerUser = await prisma.sellerUser.findUnique({
      where: { sellerId_userId: { sellerId, userId: user.id } },
      include: { seller: { select: { status: true } } }
    })

    if (!sellerUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    if (sellerUser.seller.status !== 'draft') return NextResponse.json({ error: 'Cannot edit submitted seller' }, { status: 400 })

    const capability = await prisma.manufacturingCapability.upsert({
      where: { sellerId },
      update: {
        manufacturerType,
        factoryAreaSqm,
        employeeRange,
        engineerRange,
        inHouseQC,
        processType,
        description,
        engineeringCategories: {
          set: engineeringCategories.map(id => ({ id }))
        },
        machines: {
          set: machines.map(id => ({ id }))
        }
      },
      create: {
        sellerId,
        manufacturerType,
        factoryAreaSqm,
        employeeRange,
        engineerRange,
        inHouseQC,
        processType,
        description,
        engineeringCategories: {
          connect: engineeringCategories.map(id => ({ id }))
        },
        machines: {
          connect: machines.map(id => ({ id }))
        }
      }
    })

    return NextResponse.json({ success: true, capability })

  } catch (error: any) {
    console.error('Manufacturing API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
