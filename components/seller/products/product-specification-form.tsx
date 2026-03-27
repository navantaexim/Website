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
  FormMessage,
} from "@/components/ui/form"
import { RequiredLabel } from "@/components/form/required-label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const MAX_WEIGHT = 50000

const unitEnum = z.enum([
  'Millimeters (mm)',
  'Centimeters (cm)',
  'Meters (m)',
  'Inches (in)',
])

const rectangularSchema = z.object({
  type: z.literal('Rectangular / Block'),
  unit: unitEnum,
  length: z.coerce.number().gt(0),
  width: z.coerce.number().gt(0),
  height: z.coerce.number().gt(0),
})

const cylindricalSchema = z.object({
  type: z.literal('Cylindrical / Rod'),
  unit: unitEnum,
  length: z.coerce.number().gt(0),
  outerDiameter: z.coerce.number().gt(0),
})

const sheetSchema = z.object({
  type: z.literal('Sheet / Plate'),
  unit: unitEnum,
  length: z.coerce.number().gt(0),
  width: z.coerce.number().gt(0),
  thickness: z.coerce.number().gt(0),
})

const tubularSchema = z.object({
  type: z.literal('Tubular / Pipe'),
  unit: unitEnum,
  length: z.coerce.number().gt(0),
  outerDiameter: z.coerce.number().gt(0),
  wallThickness: z.coerce.number().gt(0),
})

const dimensionSchema = z.discriminatedUnion('type', [
  rectangularSchema,
  cylindricalSchema,
  sheetSchema,
  tubularSchema,
])

const specificationSchema = z.object({
  productId: z.string(),
  materialGrade: z.string().min(1),
  weightKg: z.coerce.number().gt(0).lt(MAX_WEIGHT),
  tolerance: z.string().min(1),
  surfaceFinish: z.string().min(1),
  process: z.string().min(1),
  drawingAvailable: z.boolean().default(false),
  dimensions: dimensionSchema,
})

interface ProductSpecificationFormProps {
  product: {
    id: string
    status: string
    specs?: any | null
    media?: any[]
  }
  onUpdate?: (updates: any) => void
  onNext?: () => void
}

export function ProductSpecificationForm({
  product,
  onUpdate,
  onNext
}: ProductSpecificationFormProps) {

  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [drawingName, setDrawingName] = useState<string | null>(null)

  const isEditable = product.status === 'draft'

  const form = useForm<z.infer<typeof specificationSchema>>({
    resolver: zodResolver(specificationSchema),
    mode: "onChange", // 🔥 ADD THIS
    defaultValues: {
      productId: product.id,
      materialGrade: product.specs?.materialGrade || "",
      weightKg: product.specs?.weightKg ?? "",
      tolerance: product.specs?.tolerance || "",
      surfaceFinish: product.specs?.surfaceFinish || "",
      process: product.specs?.process || "",
      drawingAvailable: product.specs?.drawingAvailable || false,
      dimensions: {
        type: product.specs?.dimensions?.type || 'Rectangular / Block',
        unit: product.specs?.dimensions?.unit || 'Millimeters (mm)',
        length: product.specs?.dimensions?.length ?? "",
        width: product.specs?.dimensions?.width ?? "",
        height: product.specs?.dimensions?.height ?? "",
        outerDiameter: product.specs?.dimensions?.outerDiameter ?? "",
        thickness: product.specs?.dimensions?.thickness ?? "",
        wallThickness: product.specs?.dimensions?.wallThickness ?? "",
      } as any
    },
    disabled: !isEditable
  })
  const { isValid } = form.formState
  // ✅ FIXED: proper reset with stable deps
  useEffect(() => {
    if (!product) return

    const dims = product.specs?.dimensions || {}

    form.reset({
      productId: product.id,
      materialGrade: product.specs?.materialGrade || "",
      weightKg: product.specs?.weightKg ?? "",
      tolerance: product.specs?.tolerance || "",
      surfaceFinish: product.specs?.surfaceFinish || "",
      process: product.specs?.process || "",
      drawingAvailable: product.specs?.drawingAvailable || false,
      dimensions: {
        type: dims.type || 'Rectangular / Block',
        unit: dims.unit || 'Millimeters (mm)',
        length: dims.length ?? "",
        width: dims.width ?? "",
        height: dims.height ?? "",
        outerDiameter: dims.outerDiameter ?? "",
        thickness: dims.thickness ?? "",
        wallThickness: dims.wallThickness ?? "",
      } as any
    })

  }, [product.id]) // ✅ ONLY THIS

  // drawing name sync
  useEffect(() => {
    const existingDrawing = product.media?.find(m => m.type === "drawing")
    if (existingDrawing) {
      const name = existingDrawing.url.split('/').pop()
      setDrawingName(name || null)
    }
  }, [product.media])

  const dimensionType = useWatch({
    control: form.control,
    name: "dimensions.type"
  })

  const drawingAvailable = useWatch({
    control: form.control,
    name: "drawingAvailable"
  })
  const drawingMissing = drawingAvailable && !drawingName

  async function uploadDrawing(file: File) {

    if (uploading) return

    if (drawingName === file.name) {
      toast({ title: "Drawing already uploaded" })
      return
    }

    setUploading(true)

    const prevDrawingName = drawingName
    const prevMedia = product.media

    try {

      const formData = new FormData()
      formData.append("file", file)

      const upload = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (!upload.ok) throw new Error()

      const result = await upload.json()

      const saveRes = await fetch("/api/product/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          url: result.url,
          type: "drawing"
        })
      })

      if (!saveRes.ok) throw new Error()

      const saved = await saveRes.json()

      // optimistic update
      setDrawingName(file.name)

      onUpdate?.({
        media: [
          ...(product.media || []),
          {
            id: saved.id,
            url: result.url,
            type: "drawing"
          }
        ]
      })

      // 🔥 REAL FIX → sync with backend

      toast({
        title: "Drawing uploaded successfully"
      })

    } catch {

      setDrawingName(prevDrawingName)
      onUpdate?.({ media: prevMedia })

      toast({
        title: "Upload failed",
        variant: "destructive"
      })

    } finally {

      setUploading(false)

    }
  }

  async function deleteDrawing() {

    if (!product.media) return

    const drawing = product.media.find(m => m.type === "drawing")
    if (!drawing) return

    const prevDrawingName = drawingName
    const prevMedia = product.media

    const updatedMedia = (product.media || []).filter(m => m.type !== "drawing")

    // optimistic remove
    setDrawingName(null)

    onUpdate?.({
      media: updatedMedia
    })

    try {

      const res = await fetch(
        `/api/product/media?id=${drawing.id}&productId=${product.id}`,
        { method: "DELETE" }
      )

      if (!res.ok) throw new Error()

      toast({ title: "Drawing deleted" })

    } catch {

      setDrawingName(prevDrawingName)
      onUpdate?.({ media: prevMedia })

      toast({
        title: "Delete failed",
        variant: "destructive"
      })

    }
  }

  async function onSubmit(values: z.infer<typeof specificationSchema>) {

    setIsLoading(true)

    try {

      const response = await fetch("/api/product/specification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error()

      toast({
        title: "Specifications Saved"
      })

      if (onUpdate) onUpdate({ specs: values })
      if (onNext) onNext()

    } catch {

      toast({
        title: "Something went wrong",
        variant: "destructive"
      })

    } finally {

      setIsLoading(false)

    }

  }

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        <p className="text-sm text-muted-foreground">
          <span className="text-red-500">*</span> indicates required fields
        </p>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <FormField
            control={form.control}
            name="materialGrade"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Material Grade</RequiredLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Net Weight (kg)</RequiredLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        {/* PROCESS / FINISH / TOLERANCE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <FormField name="process" control={form.control} render={({ field }) => (
            <FormItem>
              <RequiredLabel required>Process</RequiredLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="surfaceFinish" control={form.control} render={({ field }) => (
            <FormItem>
              <RequiredLabel required>Surface Finish</RequiredLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="tolerance" control={form.control} render={({ field }) => (
            <FormItem>
              <RequiredLabel required>Tolerance</RequiredLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

        </div>

        {/* TYPE + UNIT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <FormField name="dimensions.type" control={form.control} render={({ field }) => (
            <FormItem>
              <RequiredLabel required>Shape</RequiredLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Rectangular / Block">Rectangular / Block</SelectItem>
                  <SelectItem value="Cylindrical / Rod">Cylindrical / Rod</SelectItem>
                  <SelectItem value="Sheet / Plate">Sheet / Plate</SelectItem>
                  <SelectItem value="Tubular / Pipe">Tubular / Pipe</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="dimensions.unit" control={form.control} render={({ field }) => (
            <FormItem>
              <RequiredLabel required>Unit</RequiredLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Millimeters (mm)">Millimeters (mm)</SelectItem>
                  <SelectItem value="Centimeters (cm)">Centimeters (cm)</SelectItem>
                  <SelectItem value="Meters (m)">Meters (m)</SelectItem>
                  <SelectItem value="Inches (in)">Inches (in)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

        </div>

        {/* DIMENSIONS (unchanged logic) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <FormField name="dimensions.length" control={form.control} render={({ field }) => (
            <FormItem>
              <RequiredLabel required>Length</RequiredLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
            </FormItem>
          )} />

          {dimensionType === 'Cylindrical / Rod' && (
            <FormField name="dimensions.outerDiameter" control={form.control} render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Outer Diameter</RequiredLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          )}

          {(dimensionType === 'Rectangular / Block' || dimensionType === 'Sheet / Plate') && (
            <FormField name="dimensions.width" control={form.control} render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Width</RequiredLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
              </FormItem>
            )} />
          )}

          {dimensionType === 'Rectangular / Block' && (
            <FormField name="dimensions.height" control={form.control} render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Height</RequiredLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
              </FormItem>
            )} />
          )}

          {dimensionType === 'Sheet / Plate' && (
            <FormField name="dimensions.thickness" control={form.control} render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Thickness</RequiredLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
              </FormItem>
            )} />
          )}

          {dimensionType === 'Tubular / Pipe' && (
            <FormField name="dimensions.wallThickness" control={form.control} render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Wall Thickness</RequiredLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
              </FormItem>
            )} />
          )}

        </div>

        {/* DRAWING */}
        <FormField name="drawingAvailable" control={form.control} render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 border p-4 rounded-md">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <RequiredLabel>Technical Drawing Available</RequiredLabel>
          </FormItem>
        )} />

        {drawingAvailable && (
          <div className="space-y-2">
            <RequiredLabel required>Upload Technical Drawing</RequiredLabel>

            <Input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.dwg"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                uploadDrawing(file)
              }}
            />

            {uploading && (
              <p className="text-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading drawing...
              </p>
            )}

            {drawingName && (
              <div className="flex items-center justify-between border p-2 rounded-md">
                <span className="text-sm text-green-600">
                  Uploaded: {drawingName}
                </span>

                {isEditable && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={deleteDrawing}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUBMIT */}
        {isEditable && (
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isLoading || uploading || !isValid || drawingMissing}
            >
              {isLoading
                ? <Loader2 className="animate-spin mr-2" />
                : <Save className="mr-2" />}
              Save & Continue
            </Button>
          </div>
        )}

      </form>
    </Form>
  )
}