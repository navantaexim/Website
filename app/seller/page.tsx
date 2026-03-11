import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import { getAuth } from '@/lib/firebase-admin'

async function getSeller() {
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
            }
        })

        return seller
    } catch (error) {
        console.error('Seller lookup failed:', error)
        return null
    }
}

export default async function SellerPage() {
    const seller = await getSeller()

    // If user has no seller profile → go to onboarding
    if (!seller) {
        redirect('/seller/onboarding')
    }

    // Redirect Seller Center → Catalog
    redirect('/seller/products')
}