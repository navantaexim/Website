'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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

interface SellerReviewProps {
  seller: {
    id: string
    legalName: string
    gstNumber: string
    iecCode: string
    status: string
    addresses: any[]
    documents: any[]
    capabilities?: any
    exportProfile?: any
  }
}

export function SellerReviewSection({ seller }: SellerReviewProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasBasicInfo = seller.legalName && seller.gstNumber && seller.iecCode
  const hasAddress = seller.addresses.length > 0
  
  const hasPan = seller.documents.some(d => d.type === 'PAN_CARD')
  const hasGst = seller.documents.some(d => d.type === 'GST_CERT')
  const hasIec = seller.documents.some(d => d.type === 'IEC_CERT')
  const hasDocuments = hasPan && hasGst && hasIec

  const isReady = hasBasicInfo && hasAddress && hasDocuments && !!seller.capabilities && !!seller.exportProfile

  async function handleSubmit() {
    setIsSubmitting(true)
    try {
        const response = await fetch('/api/seller/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerId: seller.id })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Submission failed')
        }

        toast({
            title: "Application Submitted!",
            description: "Your seller profile is now under review.",
        })

        // Force a hard reload to update the main page state to "submitted"
        window.location.reload()

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

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <Card className={hasBasicInfo ? "border-green-200 bg-green-50/50" : "border-destructive/50 bg-destructive/5"}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {hasBasicInfo ? <Check className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                        Basic Info
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">{hasBasicInfo ? "Completed" : "Missing required fields"}</p>
                </CardContent>
            </Card>

            <Card className={hasAddress ? "border-green-200 bg-green-50/50" : "border-destructive/50 bg-destructive/5"}>
                <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {hasAddress ? <Check className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                        Address
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-xs text-muted-foreground">{hasAddress ? `${seller.addresses.length} Address(es) Added` : "At least one address required"}</p>
                </CardContent>
            </Card>

            <Card className={hasDocuments ? "border-green-200 bg-green-50/50" : "border-destructive/50 bg-destructive/5"}>
                <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {hasDocuments ? <Check className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                        Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-xs text-muted-foreground">{hasDocuments ? "All required docs uploaded" : "Missing PAN, GST, or IEC"}</p>
                </CardContent>
            </Card>

            <Card className={seller.capabilities ? "border-green-200 bg-green-50/50" : "border-destructive/50 bg-destructive/5"}>
                <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {seller.capabilities ? <Check className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                        Capabilities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-xs text-muted-foreground">{seller.capabilities ? "Manufacturing info saved" : "Missing capabilities"}</p>
                </CardContent>
            </Card>

            <Card className={seller.exportProfile ? "border-green-200 bg-green-50/50" : "border-destructive/50 bg-destructive/5"}>
                <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {seller.exportProfile ? <Check className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                        Export Profile
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-xs text-muted-foreground">{seller.exportProfile ? "Export profile saved" : "Missing export profile"}</p>
                </CardContent>
            </Card>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Review Summary</h3>
            <div className="text-sm grid grid-cols-2 gap-y-2 text-muted-foreground">
                <span className="font-medium text-foreground">Legal Name:</span> {seller.legalName || '-'}
                <span className="font-medium text-foreground">GST Number:</span> {seller.gstNumber || '-'}
                <span className="font-medium text-foreground">IEC Code:</span> {seller.iecCode || '-'}
                <span className="font-medium text-foreground">Documents:</span> {seller.documents.length} Uploaded
                <span className="font-medium text-foreground">Capabilities:</span> {seller.capabilities ? 'Completed' : 'Pending'}
                <span className="font-medium text-foreground">Export Profile:</span> {seller.exportProfile ? 'Completed' : 'Pending'}
            </div>
        </div>

        <div className="flex justify-end pt-4">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="lg" disabled={!isReady || isSubmitting} className="w-full md:w-auto">
                        Submit for Verification
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Application?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Once submitted, you cannot edit your details until the verification process is complete.
                            Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
        </div>
    </div>
  )
}
