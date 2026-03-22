import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import { getAuth } from '@/lib/firebase-admin'
import { SellerDashboardOverview } from '@/components/seller/seller-dashboard-overview'

async function getSellerData() {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) return null

    try {
        const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)

        const user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid }
        })

        if (!user) return null

        const seller = await prisma.seller.findFirst({
            where: {
                users: {
                    some: { userId: user.id }
                }
            },
            include: {
                products: {
                    take: 5,
                    orderBy: { updatedAt: 'desc' },
                    include: {
                        category: true
                    }
                }
            }
        })

        return seller
    } catch (error) {
        console.error('Seller lookup failed:', error)
        return null
    }
}

export default async function SellerPage() {

    const seller = await getSellerData()

    if (!seller || seller.status === 'draft') {
        redirect('/seller/onboarding')
    }

    return (
        <div className="p-8">
            <SellerDashboardOverview
                seller={{
                    id: seller.id,
                    legalName: seller.legalName,
                    status: seller.status
                }}
                products={seller.products}
            />
        </div>
    )
}