'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, FileCheck, X, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Link from 'next/link'

interface SellerDocumentProps {
  seller: {
    id: string
    status: string
    documents: {
        id: string
        type: string
        documentUrl: string
        verified: boolean
        uploadedAt: string
    }[]
  }
}

const REQUIRED_DOCS = [
    { type: 'PAN_CARD', label: 'PAN Card', description: 'Upload a clear copy of your PAN card.' },
    { type: 'GST_CERT', label: 'GST Certificate', description: 'Upload your GST registration certificate.' },
    { type: 'IEC_CERT', label: 'IEC Certificate', description: 'Upload your Import Export Code certificate.' },
]

export function SellerDocumentSection({ seller }: SellerDocumentProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [uploading, setUploading] = useState<string | null>(null) // type of doc currently uploading

  async function handleFileUpload(type: string, file: File) {
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({ title: "Invalid File", description: "Please upload an image or PDF.", variant: "destructive" })
        return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({ title: "File too large", description: "File size must be less than 5MB.", variant: "destructive" })
        return
    }

    setUploading(type)
    try {
        // 1. Upload to Firebase Storage
        const storageRef = ref(storage, `seller-docs/${seller.id}/${type}_${Date.now()}_${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        const downloadUrl = await getDownloadURL(snapshot.ref)

        // 2. Save URL to Database
        const response = await fetch('/api/seller/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sellerId: seller.id,
                type: type,
                documentUrl: downloadUrl
            })
        })

        if (!response.ok) {
            throw new Error('Failed to save document record')
        }

        toast({ title: "Upload Success", description: `${type.replace('_', ' ')} uploaded successfully.` })
        router.refresh()
    } catch (error) {
        console.error(error)
        toast({ title: "Upload Error", description: "Failed to upload document. Please try again.", variant: "destructive" })
    } finally {
        setUploading(null)
    }
  }

  async function deleteDocument(docId: string) {
       try {
          const response = await fetch(`/api/seller/documents?id=${docId}&sellerId=${seller.id}`, {
              method: 'DELETE'
          })
          if (!response.ok) throw new Error('Failed to delete')
          
          toast({ title: "Document Removed", description: "The document has been deleted." })
          router.refresh()
       } catch (error) {
           toast({ title: "Error", description: "Could not delete document.", variant: "destructive" })
       }
  }

  const getExistingDoc = (type: string) => seller.documents.find(d => d.type === type)

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {REQUIRED_DOCS.map((docType) => {
                const existingDoc = getExistingDoc(docType.type)
                const isUploading = uploading === docType.type

                return (
                    <Card key={docType.type} className={`relative flex flex-col ${existingDoc ? 'border-primary/50 bg-primary/5' : ''}`}>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{docType.label}</CardTitle>
                                {existingDoc && <FileCheck className="h-5 w-5 text-primary" />}
                            </div>
                            <CardDescription className="text-xs">{docType.description}</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex-1 flex flex-col justify-end gap-3">
                            {existingDoc ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background p-2 rounded border">
                                        <span className="truncate max-w-[150px]">Document Uploaded</span>
                                        <div className="ml-auto flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                                <Link href={existingDoc.documentUrl} target="_blank">
                                                    <Eye className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                            {seller.status === 'draft' && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={() => deleteDocument(existingDoc.id)}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {seller.status === 'draft' && (
                                         <p className="text-xs text-muted-foreground text-center">To replace, allowed deletion must be done first.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label htmlFor={`upload-${docType.type}`} className={`
                                        flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors
                                        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                                    `}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                                            {isUploading ? (
                                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                            ) : (
                                                <Upload className="h-8 w-8 mb-2" />
                                            )}
                                            <p className="text-xs font-medium">{isUploading ? 'Uploading...' : 'Click to Upload'}</p>
                                            <p className="text-[10px] mt-1">SVG, PNG, JPG (MAX. 5MB)</p>
                                        </div>
                                        <input 
                                            id={`upload-${docType.type}`} 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*,application/pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if(file) handleFileUpload(docType.type, file)
                                            }}
                                            disabled={seller.status !== 'draft'}
                                        />
                                    </label>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
        
        {seller.status === 'draft' && (
             <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900 p-4 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                Please ensure all uploaded documents are clear and valid. Unclear documents may lead to rejection of your seller application.
             </div>
        )}
    </div>
  )
}
