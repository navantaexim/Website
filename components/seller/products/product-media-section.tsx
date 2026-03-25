'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, Trash2, Eye } from "lucide-react"
import { supabase } from '@/lib/supabase'
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
    onUpdate?: (updates?: any) => void
}

export function ProductMediaSection({ product, onUpdate }: ProductMediaProps) {

    const { toast } = useToast()

    const [uploading, setUploading] = useState(false)

    const isEditable = product.status === 'draft'

    const images = product.media.filter(m => m.type === 'image')
    const drawings = product.media.filter(m => m.type === 'drawing')

    async function handleFileUpload(file: File) {

        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid File",
                description: "Please upload an image.",
                variant: "destructive"
            })
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Must be less than 5MB.",
                variant: "destructive"
            })
            return
        }

        setUploading(true)

        try {

            const signRes = await fetch('/api/storage/sign-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId: 'product-upload',
                    productId: product.id,
                    fileName: file.name,
                    fileType: file.type,
                    usage: 'product-media'
                })
            })

            if (!signRes.ok) {
                const err = await signRes.json()
                throw new Error(err.error || 'Failed to get upload signature')
            }

            const { token, path, publicUrl } = await signRes.json()

            const { error: uploadError } = await supabase.storage
                .from('product-media')
                .uploadToSignedUrl(path, token, file)

            if (uploadError) throw uploadError

            const response = await fetch('/api/product/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    url: publicUrl,
                    type: 'image'
                })
            })

            if (!response.ok) throw new Error('Failed to save media')

            toast({
                title: "Image Uploaded",
                description: "Product image added successfully."
            })

            if (onUpdate) onUpdate()

        } catch (error: any) {

            console.error(error)

            toast({
                title: "Upload Error",
                description: error.message || "Failed to upload image.",
                variant: "destructive"
            })

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

            toast({
                title: "Media Removed",
                description: "The media file has been deleted."
            })

            if (onUpdate) onUpdate()

        } catch {

            toast({
                title: "Error",
                description: "Could not delete media.",
                variant: "destructive"
            })

        }

    }

    return (

        <div className="space-y-8">

            {/* PRODUCT IMAGES */}

            <div className="space-y-4">

                <h3 className="text-sm font-semibold">
                    Product Images
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {images.map((item) => (

                        <div
                            key={item.id}
                            className="relative group aspect-square rounded-lg border overflow-hidden bg-muted"
                        >

                            <Image
                                src={item.url}
                                alt="Product Image"
                                fill
                                className="object-cover"
                            />

                            {isEditable && (

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">

                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => deleteMedia(item.id)}
                                    >
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
                                    <span className="text-xs text-muted-foreground font-medium">
                                        Add Image
                                    </span>
                                </>
                            )}

                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileUpload(file)
                                }}
                                disabled={uploading}
                            />

                        </label>

                    )}

                </div>

            </div>

            {/* TECHNICAL DRAWING */}

            {drawings.length > 0 && (

                <div className="space-y-4">

                    <h3 className="text-sm font-semibold">
                        Technical Drawing
                    </h3>

                    {drawings.map((drawing) => (

                        <div
                            key={drawing.id}
                            className="flex items-center justify-between border rounded-lg p-3"
                        >

                            <a
                                href={drawing.url}
                                target="_blank"
                                className="flex items-center gap-2 text-sm text-primary underline"
                            >
                                <Eye className="h-4 w-4" />
                                View Drawing
                            </a>

                            {isEditable && (

                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deleteMedia(drawing.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                            )}

                        </div>

                    ))}

                </div>

            )}

        </div>

    )

}