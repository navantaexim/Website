import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { getAuth } from '@/lib/firebase-admin'

import { ProductEditContainer } from '@/components/seller/products/product-edit-container'


async function getAuthenticatedUser() {

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) return null

  try {

    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true }
    })

    return user

  } catch {
    return null
  }
}


async function getSeller(userId: string) {

  const seller = await prisma.seller.findFirst({
    where: {
      users: {
        some: { userId }
      }
    },
    select: { id: true, status: true }
  })

  return seller
}


async function getProductData(productId: string, sellerId: string) {

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      sellerId: sellerId   // 🔐 seller security check
    },
    include: {
      seller: {
        include: {
          users: true
        }
      },
      specs: true,
      commercial: true,
      compliance: {
        include: {
          standards: true
        }
      },
      media: true,
      category: true,
      originCountry: true
    }
  })

  return product
}


export default async function ProductEditPage({
  params
}: {
  params: { id: string }
}) {

  /**
   * Next.js 16 param resolution safety
   */
  const resolvedParams = await Promise.resolve(params)
  const productId = resolvedParams.id


  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/login')
  }


  const seller = await getSeller(user.id)

  if (!seller || seller.status === 'draft') {
    redirect('/seller/onboarding')
  }


  const product = await getProductData(productId, seller.id)

  if (!product) {
    notFound()
  }


  /**
   * Run independent DB calls in parallel
   * (faster page load)
   */
  const [categories, countries] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true }
    }),
    prisma.country.findMany({
      select: { id: true, name: true }
    })
  ])


  return (
    <ProductEditContainer
      initialProduct={product}
      categories={categories}
      countries={countries}
    />
  )
}