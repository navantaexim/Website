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

  const checkSectionCompletion = (sectionIndex: number, productData: any) => {
    if (!productData) return false
    switch (sectionIndex) {
      case 0:
        return !!(productData.name && productData.categoryId && productData.hsCode && productData.originCountryId)
      case 1:
        return !!productData.specs
      case 2:
        return !!productData.commercial
      case 3:
        return !!productData.compliance
      case 4:
        return !!(productData.media && productData.media.length > 0)
      default:
        return false
    }
  }

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

  const isUpdatingRef = useRef(false)

  function handleUpdate(updates?: any) {
    if (!updates) return
    if (isUpdatingRef.current) return

    isUpdatingRef.current = true

    setProduct((prev: any) => {
      const next = { ...prev }

      if ('specs' in updates && JSON.stringify(prev.specs) !== JSON.stringify(updates.specs)) {
        next.specs = updates.specs
      }

      if ('commercial' in updates && JSON.stringify(prev.commercial) !== JSON.stringify(updates.commercial)) {
        next.commercial = updates.commercial
      }

      if ('compliance' in updates && JSON.stringify(prev.compliance) !== JSON.stringify(updates.compliance)) {
        next.compliance = updates.compliance
      }

      if ('media' in updates && JSON.stringify(prev.media) !== JSON.stringify(updates.media)) {
        next.media = updates.media
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
          <h1 className="text-3xl font-bold">
            {product.name || 'Untitled Product'}
          </h1>
        </div>

        <Badge>{product.status}</Badge>
      </div>

      {/* Stepper */}
      <div className="mb-10">
        <div className="flex justify-between">
          {sections.map((section, index) => {

            const isActive = activeTab === section.id
            const isCompleted = sections.findIndex(s => s.id === activeTab) > index

            return (
              <button
                key={section.id}
                onClick={() => {
                  const targetIndex = sections.findIndex(s => s.id === section.id)
                  const currentIndex = sections.findIndex(s => s.id === activeTab)

                  if (targetIndex < currentIndex) {
                    setActiveTab(section.id)
                    return
                  }

                  for (let i = 0; i < targetIndex; i++) {
                    if (!checkSectionCompletion(i, product)) {
                      alert("Complete previous steps first")
                      return
                    }
                  }

                  setActiveTab(section.id)
                }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-full border
                  ${isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-500 text-white' : ''}
                `}>
                  {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
                </div>

                <span>{section.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      {isMounted && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="basic">
            <ProductBasicInfoForm product={product} categories={categories} countries={countries} onUpdate={handleUpdate} onNext={nextTab} />
          </TabsContent>

          <TabsContent value="specs">
            <ProductSpecificationForm product={product} onUpdate={handleUpdate} onNext={nextTab} />
          </TabsContent>

          <TabsContent value="commercial">
            <ProductCommercialForm product={product} onUpdate={handleUpdate} onNext={nextTab} />
          </TabsContent>

          <TabsContent value="compliance">
            <ProductComplianceForm product={product} onUpdate={handleUpdate} onNext={nextTab} />
          </TabsContent>

          <TabsContent value="media">
            <ProductMediaSection product={product} onUpdate={handleUpdate} />
            <Separator />
            <ProductReviewSection product={product} onUpdate={handleUpdate} />
          </TabsContent>
        </Tabs>
      )}

    </div>
  )
}