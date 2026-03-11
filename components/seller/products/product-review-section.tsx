'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
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
        seller?: {
            businessType?: string
        }
    }
    onUpdate?: () => void
}

export function ProductReviewSection({ product, onUpdate }: ProductReviewProps) {

    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    /* ===============================
       VALIDATION LOGIC
    =============================== */

    const hasBasicInfo = !!(product.name && product.hsCode && product.categoryId)
    const hasSpecs = !!product.specs
    const hasCommercial = !!product.commercial
    const hasCompliance = !!product.compliance

    const imageCount = product.media.filter(m => m.type === "image").length
    const factoryImageCount = product.media.filter(m => m.type === "factory").length

    const isManufacturer =
        product?.seller?.businessType === "manufacturer"

    const hasMedia =
        imageCount >= 3 &&
        (!isManufacturer || factoryImageCount >= 1)

    const isReady =
        hasBasicInfo &&
        hasSpecs &&
        hasCommercial &&
        hasCompliance &&
        hasMedia

    const isDraft = product.status === 'draft'

    /* ===============================
       SUBMIT HANDLER
    =============================== */

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

                if (data.details && Array.isArray(data.details)) {
                    throw new Error(data.details.join("\n"))
                }

                throw new Error(data.error || "Submission failed")
            }

            toast({
                title: "Product Published!",
                description: "Your product is now live on the marketplace.",
            })

            if (onUpdate) onUpdate()

            router.push('/seller/products')

        } catch (error) {

            toast({
                title: "Cannot Publish Product",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive"
            })

        } finally {
            setIsSubmitting(false)
        }
    }

    /* ===============================
       NON DRAFT STATE
    =============================== */

    if (!isDraft) {
        return (
            <div className="bg-muted p-6 rounded-lg text-center">
                <h3 className="text-lg font-medium">
                    Product Status: {product.status.toUpperCase()}
                </h3>
                <p className="text-muted-foreground mt-2">
                    This product has already been submitted.
                </p>
            </div>
        )
    }

    /* ===============================
       RENDER
    =============================== */

    return (

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center justify-between">

                <h3 className="text-xl font-bold text-foreground/90">
                    Review Your Listing
                </h3>

                {!isReady && (
                    <Badge variant="destructive" className="animate-pulse">
                        Action Required
                    </Badge>
                )}

            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

                <StatusCard
                    label="Basic Info"
                    isValid={hasBasicInfo}
                    message={hasBasicInfo ? "Completed" : "Missing Details"}
                />

                <StatusCard
                    label="Specs"
                    isValid={hasSpecs}
                    message={hasSpecs ? "Completed" : "Details Missing"}
                />

                <StatusCard
                    label="Commercial"
                    isValid={hasCommercial}
                    message={hasCommercial ? "Completed" : "Info Missing"}
                />

                <StatusCard
                    label="Compliance"
                    isValid={hasCompliance}
                    message={hasCompliance ? "Completed" : "Missing Info"}
                />

                <StatusCard
                    label="Media"
                    isValid={hasMedia}
                    message={
                        imageCount >= 3
                            ? `${imageCount} Images`
                            : `${imageCount} / 3 Images Required`
                    }
                />

            </div>

            <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50 backdrop-blur-sm">

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    <div className="flex-1">

                        <h4 className="font-bold text-foreground">
                            Ready to go live?
                        </h4>

                        <p className="text-sm text-muted-foreground mt-1">
                            {isReady
                                ? "Everything looks great! Once you publish, your product will be visible to global buyers."
                                : "Complete all sections before publishing."}
                        </p>

                    </div>

                    <AlertDialog>

                        <AlertDialogTrigger asChild>

                            <Button
                                size="lg"
                                disabled={!isReady || isSubmitting}
                                className="px-10 rounded-xl shadow-xl shadow-primary/20"
                            >

                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    "Publish Product"
                                )}

                            </Button>

                        </AlertDialogTrigger>

                        <AlertDialogContent>

                            <AlertDialogHeader>

                                <AlertDialogTitle>
                                    Go Live on the Marketplace?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                    This will make <strong>{product.name}</strong> visible to international buyers.
                                </AlertDialogDescription>

                            </AlertDialogHeader>

                            <AlertDialogFooter>

                                <AlertDialogCancel>
                                    Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >

                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}

                                    Confirm & Publish

                                </AlertDialogAction>

                            </AlertDialogFooter>

                        </AlertDialogContent>

                    </AlertDialog>

                </div>

            </div>

        </div>
    )
}

function StatusCard({
    label,
    isValid,
    message
}: {
    label: string
    isValid: boolean
    message: string
}) {

    return (

        <div
            className={`p-4 rounded-2xl border transition-all duration-300 ${isValid
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-amber-500/5 border-amber-500/20"
                }`}
        >

            <div className="flex items-center gap-3 mb-2">

                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isValid
                            ? "bg-green-500/10 text-green-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                >

                    {isValid
                        ? <Check className="h-4 w-4" />
                        : <AlertCircle className="h-4 w-4" />
                    }

                </div>

                <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                    {label}
                </span>

            </div>

            <p
                className={`text-sm font-medium ${isValid
                        ? "text-green-700/80"
                        : "text-amber-700/80"
                    }`}
            >
                {message}
            </p>

        </div>
    )
}