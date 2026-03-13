'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, Globe, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { ProductBasicInfoForm } from '@/components/seller/products/product-basic-info-form'
import { ProductSpecificationForm } from '@/components/seller/products/product-specification-form'
import { ProductCommercialForm } from '@/components/seller/products/product-commercial-form'
import { ProductComplianceForm } from '@/components/seller/products/product-compliance-form'
import { ProductMediaSection } from '@/components/seller/products/product-media-section'
import { ProductReviewSection } from '@/components/seller/products/product-review-section'

import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface ProductEditContainerProps {
  initialProduct: any
  categories: { id: string; name: string }[]
  countries: { id: string; name: string }[]
}

export function ProductEditContainer({
  initialProduct,
  categories,
  countries,
}: ProductEditContainerProps) {

  const router = useRouter()
  const searchParams = useSearchParams()

  const activeTab = searchParams.get('step') || 'basic'

  const [product, setProduct] = useState(initialProduct)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Globe },
    { id: 'specs', label: 'Specifications', icon: Clock },
    { id: 'commercial', label: 'Commercial', icon: Clock },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle2 },
    { id: 'media', label: 'Media & Review', icon: Globe },
  ]

  function setActiveTab(step: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step)

    router.replace(`?${params.toString()}`, { scroll: false })
  }

  async function fetchProduct() {
    setIsLoading(true)

    try {
      const res = await fetch(`/api/product/${initialProduct.id}`)
      if (!res.ok) throw new Error('Failed to fetch product')

      const data = await res.json()
      setProduct(data.product)

    } catch (error) {

      toast({
        title: 'Error',
        description: 'Failed to refresh product data',
        variant: 'destructive',
      })

    } finally {
      setIsLoading(false)
    }
  }

  const nextTab = () => {
    const currentIndex = sections.findIndex((s) => s.id === activeTab)

    if (currentIndex < sections.length - 1) {
      setActiveTab(sections[currentIndex + 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isEditable = product.status === 'draft'

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">

        <Link
          href="/seller/products"
          className="group flex items-center justify-center h-10 w-10 rounded-full bg-secondary hover:bg-secondary/80 transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
        </Link>

        <div className="flex-1">

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground/90">
              {product.name || 'Untitled Product'}
            </h1>

            {isLoading && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">

            <Badge
              variant="outline"
              className="font-mono px-2 py-0 text-[10px] uppercase tracking-wider"
            >
              {product.hsCode || 'No HS Code'}
            </Badge>

            <span className="text-muted-foreground/40">•</span>

            <span className="capitalize">
              {product.category?.name || 'Uncategorized'}
            </span>

          </div>
        </div>

        <div className="flex items-center gap-3">

          <Badge
            variant={product.status === 'active' ? 'default' : 'secondary'}
            className={`capitalize px-3 py-1 text-xs font-semibold ${product.status === 'active'
              ? 'bg-green-500/10 text-green-600 border-green-500/20'
              : ''
              }`}
          >
            {product.status}
          </Badge>

        </div>
      </div>

      {/* Stepper */}
      <div className="mb-10 relative">

        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -translate-y-1/2 -z-10 hidden lg:block" />

        <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-0">

          {sections.map((section, index) => {

            const isActive = activeTab === section.id
            const isCompleted =
              sections.findIndex((s) => s.id === activeTab) > index

            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex flex-row lg:flex-col items-center gap-3 lg:gap-2 px-4 py-2 rounded-xl transition-all relative ${isActive
                  ? 'bg-primary/5 lg:bg-transparent'
                  : 'hover:bg-secondary/50 lg:hover:bg-transparent'
                  }`}
              >

                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${isActive
                    ? 'border-primary bg-primary text-white scale-110 shadow-lg shadow-primary/20'
                    : isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted-foreground/20 bg-background text-muted-foreground'
                    }`}
                >

                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">
                      {index + 1}
                    </span>
                  )}

                </div>

                <span
                  className={`text-sm font-semibold transition-colors duration-300 ${isActive
                    ? 'text-primary'
                    : isCompleted
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                    }`}
                >
                  {section.label}
                </span>

                {isActive && (
                  <div className="hidden lg:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}

              </button>
            )
          })}
        </div>
      </div>

      {/* Locked warning */}
      {!isEditable && (
        <Alert className="mb-8 border-blue-200 bg-blue-50/50 backdrop-blur-sm">
          <Clock className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800 font-semibold">
            Listing Locked
          </AlertTitle>
          <AlertDescription className="text-blue-700/80">
            This product is currently <strong>{product.status}</strong>.
            Editing is restricted to maintain data integrity.
          </AlertDescription>
        </Alert>
      )}

      {/* VIEW LISTING BLOCK (RESTORED) */}
      {product.status === 'active' && (
        <div className="mb-8 p-5 bg-linear-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl flex items-center justify-between shadow-sm">

          <div className="flex items-center gap-4">

            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>

            <div>
              <h3 className="font-bold text-green-900">
                Live on Marketplace
              </h3>
              <p className="text-sm text-green-700/80 font-medium">
                Your product is visible to global buyers.
              </p>
            </div>

          </div>

          <Link
            href={`/products/${product.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-700 border border-green-200 rounded-xl text-sm font-bold transition-all hover:bg-green-50 hover:shadow-md"
          >
            View Listing
            <Globe className="h-4 w-4" />
          </Link>

        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">

        <TabsContent value="basic">
          <ProductBasicInfoForm
            product={product}
            categories={categories}
            countries={countries}
            onUpdate={() => {
              fetchProduct()
              nextTab()
            }}
          />
        </TabsContent>

        <TabsContent value="specs">
          <ProductSpecificationForm
            product={product}
            onUpdate={() => {
              fetchProduct()
              nextTab()
            }}
          />
        </TabsContent>

        <TabsContent value="commercial">
          <ProductCommercialForm
            product={product}
            onUpdate={() => {
              fetchProduct()
              nextTab()
            }}
          />
        </TabsContent>

        <TabsContent value="compliance">
          <ProductComplianceForm
            product={product}
            onUpdate={() => {
              fetchProduct()
              nextTab()
            }}
          />
        </TabsContent>

        <TabsContent value="media" className="space-y-10">

          <ProductMediaSection
            product={product}
            onUpdate={fetchProduct}
          />

          <Separator className="bg-border/30" />

          <ProductReviewSection
            product={product}
            onUpdate={fetchProduct}
          />

        </TabsContent>

      </Tabs>

    </div>
  )
}