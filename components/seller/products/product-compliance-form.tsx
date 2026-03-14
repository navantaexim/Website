'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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

import { Loader2, Save, X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const complianceSchema = z.object({
  productId: z.string(),
  inspectionType: z.string().min(1, "Inspection Type is required"),
  standards: z.array(z.string()).min(1, "At least one standard is required"),
})

interface Certificate {
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
  onUpdate?: () => void
}

const COMMON_STANDARDS = [
  "ISO 9001",
  "ISO 14001",
  "ASTM",
  "DIN",
  "JIS",
  "BS",
  "ANSI",
  "ASME",
  "CE"
]

export function ProductComplianceForm({ product, onUpdate }: ProductComplianceFormProps) {

  const { toast } = useToast()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [customStandard, setCustomStandard] = useState("")

  const isEditable = product.status === 'draft'

  const [certificates, setCertificates] = useState<Certificate[]>(
    product.media
      ?.filter(m => m.type === "certificate")
      .map(m => ({
        name: m.url.split("/").pop() || "certificate",
        url: m.url
      })) || []
  )

  const form = useForm<z.infer<typeof complianceSchema>>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      productId: product.id,
      inspectionType: product.compliance?.inspectionType || "",
      standards: product.compliance?.standards.map(s => s.standard) || [],
    },
    disabled: !isEditable
  })

  const selectedStandards = form.watch("standards") || []

  const certificateRequired = selectedStandards.length > 0

  const [missingCertificate, setMissingCertificate] = useState(false)

  useEffect(() => {
    setMissingCertificate(
      certificateRequired && certificates.length === 0
    )
  }, [certificateRequired, certificates])

  useEffect(() => {

    const standards =
      product.compliance?.standards.map(s => s.standard) || []

    form.reset({
      productId: product.id,
      inspectionType: product.compliance?.inspectionType || "",
      standards
    })

  }, [product, form])

  function updateStandards(newStandards: string[]) {
    form.setValue("standards", newStandards, {
      shouldValidate: true
    })
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

  async function handleCertificateUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const files = e.target.files
    if (!files?.length) return

    try {

      for (const file of Array.from(files)) {

        const formData = new FormData()
        formData.append("file", file)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        })

        if (!uploadRes.ok) throw new Error("Upload failed")

        const uploadData = await uploadRes.json()
        const url = uploadData.url

        await fetch("/api/product/media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            productId: product.id,
            url,
            type: "certificate"
          })
        })

        setCertificates(prev => [
          ...prev,
          {
            name: file.name,
            url
          }
        ])

      }

      e.target.value = ""

      toast({
        title: "Certificate Uploaded"
      })

    } catch {

      toast({
        title: "Upload Failed",
        description: "Could not upload certificate",
        variant: "destructive"
      })

    }

  }

  async function onSubmit(values: z.infer<typeof complianceSchema>) {

    if (missingCertificate) {

      toast({
        title: "Certificate Required",
        description:
          "Upload at least one compliance certificate before continuing.",
        variant: "destructive"
      })

      return
    }

    setIsLoading(true)

    try {

      const response = await fetch("/api/product/compliance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {

        const errorData = await response.json()

        throw new Error(
          errorData.error || "Failed to save compliance"
        )
      }

      toast({
        title: "Compliance Saved",
        description: "Standards updated"
      })

      if (onUpdate) onUpdate()

      router.refresh()

    } catch (error) {

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong",
        variant: "destructive"
      })

    } finally {

      setIsLoading(false)

    }

  }

  return (

    <Form {...form}>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >

        <FormField
          control={form.control}
          name="inspectionType"
          render={({ field }) => (
            <FormItem>

              <FormLabel>
                Quality Inspection Type *
              </FormLabel>

              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isEditable}
              >

                <FormControl>

                  <SelectTrigger>
                    <SelectValue placeholder="Select inspection type" />
                  </SelectTrigger>

                </FormControl>

                <SelectContent>

                  <SelectItem value="Self Inspection">
                    Self Inspection
                  </SelectItem>

                  <SelectItem value="Third Party Inspection">
                    Third Party Inspection
                  </SelectItem>

                  <SelectItem value="Buyer Inspection">
                    Buyer Inspection
                  </SelectItem>

                </SelectContent>

              </Select>

              <FormMessage />

            </FormItem>
          )}
        />

        {/* STANDARDS */}
        <div className="space-y-4">

          <FormLabel>
            Applicable Standards *
          </FormLabel>

          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-lg bg-muted/20">

            {selectedStandards.length === 0 && (
              <span className="text-sm text-muted-foreground">
                No standards selected
              </span>
            )}

            {selectedStandards.map(std => (
              <Badge
                key={std}
                variant="secondary"
                className="pl-2 pr-1 h-8"
              >

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

            <div className="space-y-2">

              <p className="text-xs text-muted-foreground">
                Quick Add Standards
              </p>

              <div className="flex flex-wrap gap-2">

                {COMMON_STANDARDS.map(std => {

                  const selected =
                    selectedStandards.includes(std)

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

          )}

          {isEditable && (

            <div className="flex gap-2">

              <Input
                placeholder="Custom Standard (e.g. ASTM A312)"
                value={customStandard}
                onChange={(e) =>
                  setCustomStandard(e.target.value)
                }
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => addStandard(customStandard)}
                disabled={!customStandard.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>

            </div>

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

          {certificates.map((cert, index) => (
            <div
              key={index}
              className="flex items-center justify-between border p-3 rounded-lg"
            >

              <a
                href={cert.url}
                target="_blank"
                className="text-sm text-primary underline"
              >
                {cert.name}
              </a>

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

        {isEditable && (

          <div className="flex justify-end">

            <Button
              type="submit"
              size="lg"
              disabled={isLoading || missingCertificate}
              className="px-8 rounded-xl"
            >

              {isLoading
                ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                : <Save className="mr-2 h-5 w-5" />
              }

              Save & Continue

            </Button>

          </div>

        )}

      </form>

    </Form>

  )
}