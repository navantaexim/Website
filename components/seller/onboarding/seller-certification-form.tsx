
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, FileCheck, X, Trash2, Plus, Calendar as CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SellerCertificationProps {
  seller: {
    id: string
    status: string
    certificates: {
        id: string
        type: string
        documentUrl: string | null
        issuedBy: string | null
        validTill: string | null
    }[]
  }
}

export function SellerCertificationForm({ seller }: SellerCertificationProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // Local form state
  const [type, setType] = useState("")
  const [issuedBy, setIssuedBy] = useState("")
  const [validTill, setValidTill] = useState<Date | undefined>(undefined)
  const [file, setFile] = useState<File | null>(null)


    // Helper component to view private certs
    const ViewCertButton = ({ path, label }: { path: string, label: string }) => {
        const [loading, setLoading] = useState(false)
        
        async function openDocument() {
            setLoading(true)
            try {
                const res = await fetch('/api/storage/sign-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path, bucket: 'private-docs' })
                })
                if (!res.ok) throw new Error('Failed to get access')
                const { signedUrl } = await res.json()
                window.open(signedUrl, '_blank')
            } catch (error) {
                toast({ title: "Error", description: "Could not open document.", variant: "destructive" })
            } finally {
                setLoading(false)
            }
        }

        return (
             <Button variant="link" className="p-0 h-auto" onClick={openDocument} disabled={loading}>
                {loading ? "Loading..." : label}
             </Button>
        )
    }

  async function handleSave() {
      if (!type) {
          toast({ title: "Required", description: "Certificate Type is required", variant: "destructive" })
          return
      }

      setIsUploading(true)
      try {
          let documentPath = ""

          if (file) {
             // 1. Get Signed Upload URL
             const signRes = await fetch('/api/storage/sign-upload', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     sellerId: seller.id,
                     fileName: file.name,
                     fileType: file.type,
                     usage: 'seller-certification'
                 })
             })
             
             if (!signRes.ok) throw new Error('Failed to get upload signature')
             const { token, path } = await signRes.json()

             // 2. Upload to Supabase
             const { error: uploadError } = await supabase.storage
                .from('private-docs')
                .uploadToSignedUrl(path, token, file)

             if (uploadError) throw uploadError
             
             documentPath = path
          }

          const response = await fetch('/api/seller/certifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  sellerId: seller.id,
                  type,
                  issuedBy,
                  validTill: validTill ? validTill.toISOString() : null,
                  documentUrl: documentPath || null
              })
          })

          if (!response.ok) throw new Error('Failed to save')

          toast({ title: "Success", description: "Certificate added." })
          setIsOpen(false)
          resetForm()
          router.refresh()
      } catch (error) {
          toast({ title: "Error", description: "Failed to add certificate", variant: "destructive" })
      } finally {
          setIsUploading(false)
      }
  }

  function resetForm() {
      setType("")
      setIssuedBy("")
      setValidTill(undefined)
      setFile(null)
  }

  async function deleteCert(id: string) {
       try {
          const response = await fetch(`/api/seller/certifications?id=${id}&sellerId=${seller.id}`, {
              method: 'DELETE'
          })
          if (!response.ok) throw new Error('Failed to delete')
          
          toast({ title: "Certificate Removed", description: "The certificate has been deleted." })
          router.refresh()
       } catch (error) {
           toast({ title: "Error", description: "Could not delete certificate.", variant: "destructive" })
       }
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
            {seller.certificates.map((cert) => (
                <Card key={cert.id} className="relative">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-medium">{cert.type}</CardTitle>
                            {seller.status === 'draft' && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteCert(cert.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <CardDescription>{cert.issuedBy}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        {cert.validTill && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Valid Till:</span>
                                <span>{format(new Date(cert.validTill), "PPP")}</span>
                            </div>
                        )}
                        {cert.documentUrl && (
                             <ViewCertButton path={cert.documentUrl} label="View Document" />
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>

        {seller.status === 'draft' && (
             <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-dashed h-16 bg-muted/5 hover:bg-muted/10">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Certification (ISO, API, etc)
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Certification</DialogTitle>
                        <DialogDescription>
                            Add certifications to showcase your compliance and quality.
                        </DialogDescription>
                    </DialogHeader>

                     <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Certificate Type</Label>
                            <Input placeholder="e.g. ISO 9001:2015" value={type} onChange={(e) => setType(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Issued By</Label>
                            <Input placeholder="e.g. TUV NORD" value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} />
                        </div>
                         <div className="space-y-2 flex flex-col">
                            <Label>Valid Till</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] pl-3 text-left font-normal",
                                        !validTill && "text-muted-foreground"
                                    )}
                                    >
                                    {validTill ? (
                                        format(validTill, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                    mode="single"
                                    selected={validTill}
                                    onSelect={setValidTill}
                                    disabled={(date) =>
                                        date < new Date()
                                    }
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Document (Optional)</Label>
                            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </div>
                     </div>

                    <DialogFooter>
                        <Button onClick={handleSave} disabled={isUploading}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
    </div>
  )
}
