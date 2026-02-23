
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
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
      select: { id: true },
    })
    return user
  } catch {
    return null
  }
}

async function getProductData(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: {
        include: {
          users: true,
        },
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
      originCountry: true,
    },
  })
  return product
}

interface ProductEditPageProps {
  params: { id: string }
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const productId = resolvedParams.id;
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')

  const product = await getProductData(productId)
  if (!product) notFound()

  // Authorization check
  if (!product.seller.users.some(u => u.userId === user.id)) {
    redirect('/seller/products')
  }

  // Fetch reference data
  const categories = await prisma.category.findMany({ select: { id: true, name: true } })
  const countries = await prisma.country.findMany({ select: { id: true, name: true } })

  return (
    <ProductEditContainer 
        initialProduct={product} 
        categories={categories} 
        countries={countries} 
    />
  )
}

