'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Badge } from '@/components/ui/badge'

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

  const [isMounted, setIsMounted] = useState(false)
  const [product, setProduct] = useState(initialProduct)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const activeTab = searchParams.get('step') || 'basic'

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

  const nextTab = () => {
    const currentIndex = sections.findIndex((s) => s.id === activeTab)
    if (currentIndex < sections.length - 1) {
      setActiveTab(sections[currentIndex + 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isEditable = product.status === 'draft'

  // 🔥 stable refs (fixes loop + listeners)
  const updateTimeoutRef = useRef<any>(null)

  const isUpdatingRef = useRef(false)

  function handleUpdate(updates?: any) {

    if (!updates) return

    // 🚫 prevent recursive loops
    if (isUpdatingRef.current) return

    isUpdatingRef.current = true

    setProduct((prev: any) => {

      const next = { ...prev }

      if ('specs' in updates) {
        if (JSON.stringify(prev.specs) !== JSON.stringify(updates.specs)) {
          next.specs = updates.specs
        }
      }

      if ('commercial' in updates) {
        if (JSON.stringify(prev.commercial) !== JSON.stringify(updates.commercial)) {
          next.commercial = updates.commercial
        }
      }

      if ('compliance' in updates) {
        if (JSON.stringify(prev.compliance) !== JSON.stringify(updates.compliance)) {
          next.compliance = updates.compliance
        }
      }

      if ('media' in updates) {
        if (JSON.stringify(prev.media) !== JSON.stringify(updates.media)) {
          next.media = updates.media
        }
      }

      return next
    })

    setTimeout(() => {
      isUpdatingRef.current = false
    }, 0)
  }
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/seller/products" className="group flex items-center justify-center h-10 w-10 rounded-full bg-secondary hover:bg-secondary/80">
          <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground/90">
              {product.name || 'Untitled Product'}
            </h1>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Badge variant="outline" className="font-mono px-2 py-0 text-[10px] uppercase tracking-wider">
              {product.hsCode || 'No HS Code'}
            </Badge>

            <span className="text-muted-foreground/40">•</span>

            <span className="capitalize">
              {product.category?.name || 'Uncategorized'}
            </span>
          </div>
        </div>

        <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="capitalize px-3 py-1 text-xs font-semibold">
          {product.status}
        </Badge>
      </div>

      {/* Stepper */}
      <div className="mb-10 relative">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-blue-200 -translate-y-1/2 -z-10" />

        <div className="flex justify-between items-center">
          {sections.map((section, index) => {

            const isActive = activeTab === section.id
            const isCompleted = sections.findIndex(s => s.id === activeTab) > index

            return (
              <button key={section.id} onClick={() => setActiveTab(section.id)} className="flex flex-col items-center gap-2">

                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold
                  ${isActive
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'}
                `}>
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>

                <span className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {section.label}
                </span>

                {isActive && <div className="w-8 h-[3px] bg-blue-600 rounded-full mt-1" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 🔥 FIXED: prevent hydration mismatch */}
      {isMounted && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">

          <TabsContent value="basic">
            <ProductBasicInfoForm
              product={product}
              categories={categories}
              countries={countries}
              onUpdate={handleUpdate}
              onNext={nextTab}
            />
          </TabsContent>

          <TabsContent value="specs">
            <ProductSpecificationForm
              product={product}
              onUpdate={handleUpdate}
              onNext={nextTab}
            />
          </TabsContent>

          <TabsContent value="commercial">
            <ProductCommercialForm
              product={product}
              onUpdate={handleUpdate}
              onNext={nextTab}
            />
          </TabsContent>

          <TabsContent value="compliance">
            <ProductComplianceForm
              product={product}
              onUpdate={handleUpdate}
              onNext={nextTab}
            />
          </TabsContent>

          <TabsContent value="media" className="space-y-10">
            <ProductMediaSection product={product} onUpdate={handleUpdate} />
            <Separator className="bg-border/30" />
            <ProductReviewSection product={product} onUpdate={handleUpdate} />
          </TabsContent>

        </Tabs>
      )}

    </div>
  )
}