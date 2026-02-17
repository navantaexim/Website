
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import prisma from '@/lib/db'
import { getAuth } from '@/lib/firebase-admin'
import { ArrowLeft, CheckCircle2, Clock, Globe } from 'lucide-react'

import { ProductBasicInfoForm } from '@/components/seller/products/product-basic-info-form'
import { ProductSpecificationForm } from '@/components/seller/products/product-specification-form'
import { ProductCommercialForm } from '@/components/seller/products/product-commercial-form'
import { ProductComplianceForm } from '@/components/seller/products/product-compliance-form'
import { ProductMediaSection } from '@/components/seller/products/product-media-section'
import { ProductReviewSection } from '@/components/seller/products/product-review-section'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

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
  const resolvedParams = await Promise.resolve(params); // Await params resolution first
  const productId = resolvedParams.id;
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')

  const product = await getProductData(productId)
  if (!product) notFound()

  // Authorization check: User must be part of the seller organization
  if (!product.seller.users.some(u => u.userId === user.id)) {
    redirect('/seller/products') // Or 403
  }

  // Fetch reference data
  const categories = await prisma.category.findMany({ select: { id: true, name: true } })
  const countries = await prisma.country.findMany({ select: { id: true, name: true } })

  const isEditable = product.status === 'draft'

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/seller/products" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {product.name || 'Untitled Product'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{product.hsCode || 'No HS Code'}</span>
            <span>•</span>
            <span className="capitalize">{product.category?.name || 'Uncategorized'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                {product.status}
            </Badge>
        </div>
      </div>

      {!isEditable && (
         <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Product is {product.status}</AlertTitle>
            <AlertDescription className="text-blue-700">
                This product is currently listed. Editing is restricted to maintain listing integrity. 
                Contact support for major changes.
            </AlertDescription>
         </Alert>
      )}

      {product.status === 'active' && (
         <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                    <h3 className="font-medium text-green-900">Live on Marketplace</h3>
                    <p className="text-sm text-green-700">Your product is visible to global buyers.</p>
                </div>
            </div>
            <Link href={`/products/${product.id}`} target="_blank" className="text-sm font-medium text-green-800 hover:underline flex items-center gap-1">
                View Listing <Globe className="h-3 w-3" />
            </Link>
         </div>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="basic" className="py-2">Basic Info</TabsTrigger>
          <TabsTrigger value="specs" className="py-2">Specifications</TabsTrigger>
          <TabsTrigger value="commercial" className="py-2">Commercial</TabsTrigger>
          <TabsTrigger value="compliance" className="py-2">Compliance</TabsTrigger>
          <TabsTrigger value="media" className="py-2">Media & Review</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
             <div className="mb-6">
                <h2 className="text-lg font-semibold">Basic Product Information</h2>
                <p className="text-sm text-muted-foreground">Core details for search and classification.</p>
             </div>
             <ProductBasicInfoForm 
                product={product} 
                categories={categories} 
                countries={countries} 
             />
          </div>
        </TabsContent>

        <TabsContent value="specs" className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
             <div className="mb-6">
                <h2 className="text-lg font-semibold">Technical Specifications</h2>
                <p className="text-sm text-muted-foreground">Detailed physical and material properties.</p>
             </div>
             <ProductSpecificationForm product={product} />
          </div>
        </TabsContent>

        <TabsContent value="commercial" className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
             <div className="mb-6">
                <h2 className="text-lg font-semibold">Commercial & Logistics</h2>
                <p className="text-sm text-muted-foreground">Supply capability, MOQ, and shipping terms.</p>
             </div>
             <ProductCommercialForm product={product} />
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="bg-card border rounded-lg p-6">
             <div className="mb-6">
                <h2 className="text-lg font-semibold">Quality & Compliance</h2>
                <p className="text-sm text-muted-foreground">Inspections standards and certifications.</p>
             </div>
            <ProductComplianceForm product={product} />
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-8">
            <div className="bg-card border rounded-lg p-6">
                 <div className="mb-6">
                    <h2 className="text-lg font-semibold">Product Images</h2>
                    <p className="text-sm text-muted-foreground">Upload high-quality images (Min 1 required).</p>
                 </div>
                 <ProductMediaSection product={product} />
            </div>

            <Separator />
            
            <ProductReviewSection product={product} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
