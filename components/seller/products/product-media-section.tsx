'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Image from 'next/image'

interface ProductMediaProps {
  product: {
    id: string
    status: string
    media: {
        id: string
        url: string
        type: string
        isPrimary?: boolean
    }[]
  }
}

export function ProductMediaSection({ product }: ProductMediaProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  
  const isEditable = product.status === 'draft'

  async function handleFileUpload(file: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File", description: "Please upload an image.", variant: "destructive" })
        return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({ title: "File too large", description: "Must be less than 5MB.", variant: "destructive" })
        return
    }

    setUploading(true)
    try {
        const storageRef = ref(storage, `products/${product.id}/${Date.now()}_${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        const downloadUrl = await getDownloadURL(snapshot.ref)

        const response = await fetch('/api/product/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: product.id,
                url: downloadUrl,
                type: 'image'
            })
        })

        if (!response.ok) throw new Error('Failed to save media')
        toast({ title: "Image Uploaded", description: "Product image added successfully." })
        router.refresh()
    } catch (error) {
        toast({ title: "Upload Error", description: "Failed to upload image.", variant: "destructive" })
    } finally {
        setUploading(false)
    }
  }

  async function deleteMedia(mediaId: string) {
       try {
          const response = await fetch(`/api/product/media?id=${mediaId}&productId=${product.id}`, {
              method: 'DELETE'
          })
          if (!response.ok) throw new Error('Failed to delete')
          toast({ title: "Image Removed", description: "The image has been deleted." })
          router.refresh()
       } catch (error) {
           toast({ title: "Error", description: "Could not delete image.", variant: "destructive" })
       }
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.media.map((item) => (
                <div key={item.id} className="relative group aspect-square rounded-lg border overflow-hidden bg-muted">
                    <Image 
                        src={item.url} 
                        alt="Product Image" 
                        fill 
                        className="object-cover"
                    />
                    {isEditable && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => deleteMedia(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            ))}

            {isEditable && (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground font-medium">Add Image</span>
                        </>
                    )}
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if(file) handleFileUpload(file)
                        }}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
        {!isEditable && product.media.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No images uploaded.</p>
        )}
    </div>
  )
}
