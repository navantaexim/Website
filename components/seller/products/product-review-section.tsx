'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface ProductReviewProps {
  product: {
    id: string
    name: string
    hsCode: string
    categoryId: string
    status: string
    specs?: any | null
    commercial?: any | null
    compliance?: any | null
    media: any[]
  }
}

export function ProductReviewSection({ product }: ProductReviewProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation Checks
  const hasBasicInfo = !!(product.name && product.hsCode && product.categoryId)
  const hasSpecs = !!product.specs
  const hasCommercial = !!product.commercial
  const hasCompliance = !!product.compliance
  const hasMedia = product.media && product.media.length > 0

  const isReady = hasBasicInfo && hasSpecs && hasCommercial && hasCompliance && hasMedia
  const isDraft = product.status === 'draft'

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
        const response = await fetch('/api/product/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Submission failed')
        }

        toast({
            title: "Product Submitted!",
            description: "Your product is now active and listed.",
        })

        // Redirect to dashboard
        router.push('/seller/products')

    } catch (error) {
        toast({
            title: "Submission Error",
            description: error instanceof Error ? error.message : "Failed to submit",
            variant: "destructive"
        })
    } finally {
        setIsSubmitting(false)
    }
  }

  if (!isDraft) {
      return (
          <div className="bg-muted p-6 rounded-lg text-center">
              <h3 className="text-lg font-medium">Product Status: {product.status.toUpperCase()}</h3>
              <p className="text-muted-foreground mt-2">
                  This product has already been submitted. You can edit specific fields, but major changes might require re-verification.
              </p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
        <h3 className="text-lg font-medium">Review & Submit</h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatusCard label="Basic Info" isValid={hasBasicInfo} message={hasBasicInfo ? "Completed" : "Missing Name/HS Code"} />
            <StatusCard label="Specifications" isValid={hasSpecs} message={hasSpecs ? "Completed" : "Technical details missing"} />
            <StatusCard label="Commercial" isValid={hasCommercial} message={hasCommercial ? "Completed" : "Logistics info missing"} />
            <StatusCard label="Compliance" isValid={hasCompliance} message={hasCompliance ? "Completed" : "Standards missing"} />
            <StatusCard label="Media" isValid={hasMedia} message={hasMedia ? `${product.media.length} Images` : "Add at least 1 image"} />
        </div>

        <div className="flex justify-end pt-8">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="lg" disabled={!isReady || isSubmitting} className="w-full md:w-auto">
                        {isSubmitting ? "Submitting..." : "Submit Product Listing"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to publish this product? It will become visible to buyers immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publish Product
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
        </div>
    </div>
  )
}

function StatusCard({ label, isValid, message }: { label: string, isValid: boolean, message: string }) {
    return (
        <Card className={isValid ? "border-green-200 bg-green-50/50" : "border-destructive/50 bg-destructive/5"}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {isValid ? <Check className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{message}</p>
            </CardContent>
        </Card>
    )
}
