'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

import { Loader2, Save, X, Plus, Trash2 } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ---------------- SCHEMA ----------------
const complianceSchema = z.object({
  productId: z.string(),
  inspectionType: z.string().min(1, "Inspection Type is required"),
  standards: z.array(z.string()).min(1, "At least one standard is required"),
})

// ---------------- TYPES ----------------
interface Certificate {
  id?: string
  name: string
  url: string
}

interface ProductComplianceFormProps {
  product: {
    id: string
    status: string
    media?: {
      id: string
      url: string
      type: string
    }[]
    compliance?: {
      inspectionType: string
      standards: { standard: string }[]
    } | null
  }
  onUpdate?: (updates?: any) => void
  onNext?: () => void
}

// ---------------- CONSTANTS ----------------
const COMMON_STANDARDS = [
  "ISO 9001", "ISO 14001", "ASTM", "DIN", "JIS", "BS", "ANSI", "ASME", "CE"
]

// ---------------- COMPONENT ----------------
export function ProductComplianceForm({
  product,
  onUpdate,
  onNext
}: ProductComplianceFormProps) {

  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [customStandard, setCustomStandard] = useState("")
  const [certificates, setCertificates] = useState<Certificate[]>([])

  const isEditable = product.status === 'draft'

  // ---------------- SYNC CERTIFICATES ----------------
  useEffect(() => {
    const certs =
      product.media
        ?.filter(m => m.type === "certificate")
        .map(m => ({
          id: m.id,
          name: m.url.split("/").pop() || "certificate",
          url: m.url
        })) || []

    setCertificates(certs)
  }, [product.media])

  // ---------------- FORM ----------------
  const form = useForm<z.infer<typeof complianceSchema>>({
    resolver: zodResolver(complianceSchema),
    mode: "onChange", // 🔥 ADD THIS LINE
    defaultValues: {
      productId: product.id,
      inspectionType: product.compliance?.inspectionType || "",
      standards: product.compliance?.standards.map(s => s.standard) || [],
    },
    disabled: !isEditable
  })

  const { isValid } = form.formState

  // ---------------- RESET ----------------
  useEffect(() => {
    if (!product) return

    form.reset({
      productId: product.id,
      inspectionType: product.compliance?.inspectionType || "",
      standards: product.compliance?.standards?.map(s => s.standard) || []
    })

  }, [
    product.id,
    product.compliance?.inspectionType,
    product.compliance?.standards?.length // 🔥 FIX HERE
  ])
  // ---------------- WATCH ----------------
  const selectedStandards = useWatch({
    control: form.control,
    name: "standards"
  }) || []

  const certificateRequired = selectedStandards.length > 0
  const missingCertificate = certificateRequired && certificates.length === 0

  // ---------------- STANDARDS ----------------
  function updateStandards(newStandards: string[]) {
    form.setValue("standards", newStandards, { shouldValidate: true })
  }

  function addStandard(std: string) {
    if (!std) return

    const normalized = std.trim().toUpperCase()

    if (!selectedStandards.some(s =>
      s.toLowerCase() === normalized.toLowerCase()
    )) {
      updateStandards([...selectedStandards, normalized])
    }

    setCustomStandard("")
  }

  function removeStandard(std: string) {
    updateStandards(selectedStandards.filter(s => s !== std))
  }

  // ---------------- DELETE CERTIFICATE ----------------
  async function deleteCertificate(cert: Certificate) {

    const prevCertificates = [...certificates]
    const prevMedia = product.media

    const isTemp = !cert.id || cert.id.startsWith('temp-')

    const updated = certificates.filter(c => c.url !== cert.url)
    setCertificates(updated)

    onUpdate?.({
      media: product.media?.filter(m => m.url !== cert.url)
    })

    if (isTemp) return

    try {

      const res = await fetch(
        `/api/product/media?id=${cert.id}&productId=${product.id}`,
        { method: "DELETE" }
      )

      if (!res.ok) throw new Error()

      toast({ title: "Certificate Deleted" })

    } catch {

      // 🔥 ROLLBACK
      setCertificates(prevCertificates)
      onUpdate?.({ media: prevMedia })

      toast({
        title: "Delete failed",
        variant: "destructive"
      })

    }
  }

  // ---------------- UPLOAD ----------------
  async function handleCertificateUpload(e: React.ChangeEvent<HTMLInputElement>) {

    const files = e.target.files
    if (!files?.length) return

    // ✅ prevent duplicate triggers
    if (isLoading) return

    setIsLoading(true)

    try {

      for (const file of Array.from(files)) {

        const formData = new FormData()
        formData.append("file", file)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        })

        if (!uploadRes.ok) throw new Error()

        const { url } = await uploadRes.json()

        const saveRes = await fetch("/api/product/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            url,
            type: "certificate"
          })
        })

        if (!saveRes.ok) throw new Error()

        const saved = await saveRes.json()

        const prevCertificates = [...certificates]
        const prevMedia = product.media

        try {

          const newCert = {
            id: saved.id,
            name: file.name,
            url
          }

          // ✅ FIX: functional update (no stale state)
          const updatedCertificates = [...certificates, newCert]

          // ✅ update local state
          setCertificates(updatedCertificates)

          // ✅ THEN update parent (outside state setter)
          onUpdate?.({
            media: updatedCertificates.map(c => ({
              id: c.id!,
              url: c.url,
              type: "certificate"
            }))
          })

        } catch {

          // 🔥 rollback (UI + parent)
          setCertificates(prevCertificates)
          onUpdate?.({ media: prevMedia })

          throw new Error()
        }

      }

      e.target.value = ""

      toast({ title: "Certificate Uploaded" })

    } catch {

      toast({
        title: "Upload Failed",
        variant: "destructive"
      })

    } finally {

      setIsLoading(false)

    }
  }
  // ---------------- SUBMIT ----------------
  async function onSubmit(values: z.infer<typeof complianceSchema>) {

    if (missingCertificate) {
      toast({
        title: "Certificate Required",
        description: "Upload at least one compliance certificate.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {

      const response = await fetch("/api/product/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error()

      toast({ title: "Compliance Saved" })

      if (onUpdate) {
        onUpdate({
          compliance: {
            inspectionType: values.inspectionType,
            standards: values.standards.map(s => ({ standard: s }))
          }
        })
      }

      if (onNext) onNext()

    } catch {

      toast({
        title: "Error",
        variant: "destructive"
      })

    } finally {

      setIsLoading(false)

    }
  }

  // ---------------- UI ----------------
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* INSPECTION TYPE */}
        <FormField
          control={form.control}
          name="inspectionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quality Inspection Type *</FormLabel>

              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!isEditable}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspection type" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  <SelectItem value="Self Inspection">Self Inspection</SelectItem>
                  <SelectItem value="Third Party Inspection">Third Party Inspection</SelectItem>
                  <SelectItem value="Buyer Inspection">Buyer Inspection</SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* STANDARDS */}
        <div className="space-y-4">

          <FormLabel>Applicable Standards *</FormLabel>

          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-lg bg-muted/20">
            {selectedStandards.length === 0 && (
              <span className="text-sm text-muted-foreground">
                No standards selected
              </span>
            )}

            {selectedStandards.map(std => (
              <Badge key={std} variant="secondary" className="pl-2 pr-1 h-8">
                {std}
                {isEditable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={() => removeStandard(std)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>

          {isEditable && (
            <>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Quick Add Standards</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_STANDARDS.map(std => {
                    const selected = selectedStandards.includes(std)
                    return (
                      <Button
                        key={std}
                        type="button"
                        size="sm"
                        variant={selected ? "secondary" : "outline"}
                        disabled={selected}
                        onClick={() => addStandard(std)}
                      >
                        {std}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Custom Standard"
                  value={customStandard}
                  onChange={(e) => setCustomStandard(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addStandard(customStandard)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

        </div>

        {/* CERTIFICATES */}
        <div className="space-y-4">

          <FormLabel>
            Compliance Certificates {certificateRequired && "*"}
          </FormLabel>

          {missingCertificate && (
            <p className="text-sm text-red-500">
              Upload at least one compliance certificate before continuing.
            </p>
          )}

          {certificates.map(cert => (
            <div key={cert.url} className="flex justify-between border p-3 rounded-lg">
              <a href={cert.url} target="_blank" className="text-sm underline">
                {cert.name}
              </a>

              {isEditable && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteCertificate(cert)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {isEditable && (
            <Input
              type="file"
              multiple
              accept=".pdf,.jpg,.png"
              onChange={handleCertificateUpload}
            />
          )}

        </div>

        {/* SUBMIT */}
        {isEditable && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !isValid || missingCertificate}
            >
              {isLoading
                ? <Loader2 className="mr-2 animate-spin" />
                : <Save className="mr-2" />}
              Save & Continue
            </Button>
          </div>
        )}

      </form>
    </Form>
  )
}