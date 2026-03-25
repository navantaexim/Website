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
}

export function ProductSpecificationForm({ product, onUpdate }: ProductSpecificationFormProps) {

  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [drawingName, setDrawingName] = useState<string | null>(null)

  const isEditable = product.status === 'draft'
  const existingDims = product.specs?.dimensions || {}

  useEffect(() => {

    const existingDrawing = product.media?.find(m => m.type === "drawing")

    if (existingDrawing) {
      const name = existingDrawing.url.split('/').pop()
      setDrawingName(name || null)
    }

  }, [product.media])

  const form = useForm<z.infer<typeof specificationSchema>>({
    resolver: zodResolver(specificationSchema),
    defaultValues: {
      productId: product.id,
      materialGrade: product.specs?.materialGrade || "",
      weightKg: product.specs?.weightKg ?? "",
      tolerance: product.specs?.tolerance || "",
      surfaceFinish: product.specs?.surfaceFinish || "",
      process: product.specs?.process || "",
      drawingAvailable: product.specs?.drawingAvailable || false,
      dimensions: {
        type: existingDims.type || 'Rectangular / Block',
        unit: existingDims.unit || 'Millimeters (mm)',
        length: existingDims.length ?? "",
        width: existingDims.width ?? "",
        height: existingDims.height ?? "",
        outerDiameter: existingDims.outerDiameter ?? "",
        thickness: existingDims.thickness ?? "",
        wallThickness: existingDims.wallThickness ?? "",
      } as any
    },
    disabled: !isEditable
  })

  const dimensionType = useWatch({
    control: form.control,
    name: "dimensions.type"
  })

  const drawingAvailable = useWatch({
    control: form.control,
    name: "drawingAvailable"
  })

  async function uploadDrawing(file: File) {

    if (drawingName === file.name) {
      toast({ title: "Drawing already uploaded" })
      return
    }

    try {

      setUploading(true)

      const formData = new FormData()
      formData.append("file", file)

      const upload = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (!upload.ok) throw new Error()

      const result = await upload.json()

      await fetch("/api/product/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          url: result.url,
          type: "drawing"
        })
      })

      setDrawingName(file.name)

      toast({
        title: "Drawing uploaded successfully"
      })

    } catch {

      toast({
        title: "Upload failed",
        variant: "destructive"
      })

    } finally {

      setUploading(false)

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

        {/* rest of the file remains exactly unchanged */}

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

          <FormField
            control={form.control}
            name="process"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Process</RequiredLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surfaceFinish"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Surface Finish</RequiredLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tolerance"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Tolerance</RequiredLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        {/* DIMENSION TYPE + UNIT */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <FormField
            control={form.control}
            name="dimensions.type"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Shape</RequiredLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
            )}
          />

          <FormField
            control={form.control}
            name="dimensions.unit"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Unit</RequiredLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
            )}
          />

        </div>

        {/* DIMENSIONS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <FormField
            control={form.control}
            name="dimensions.length"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Length</RequiredLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {dimensionType === 'Cylindrical / Rod' && (
            <FormField
              control={form.control}
              name="dimensions.outerDiameter"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel required>Outer Diameter</RequiredLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(dimensionType === 'Rectangular / Block' || dimensionType === 'Sheet / Plate') && (
            <FormField
              control={form.control}
              name="dimensions.width"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel required>Width</RequiredLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {dimensionType === 'Rectangular / Block' && (
            <FormField
              control={form.control}
              name="dimensions.height"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel required>Height</RequiredLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {dimensionType === 'Sheet / Plate' && (
            <FormField
              control={form.control}
              name="dimensions.thickness"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel required>Thickness</RequiredLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {dimensionType === 'Tubular / Pipe' && (
            <FormField
              control={form.control}
              name="dimensions.wallThickness"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel required>Wall Thickness</RequiredLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

        </div>

        {/* DRAWING */}

        <FormField
          control={form.control}
          name="drawingAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 border p-4 rounded-md">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <RequiredLabel>
                Technical Drawing Available
              </RequiredLabel>
            </FormItem>
          )}
        />

        {drawingAvailable && (

          <div className="space-y-2">

            <RequiredLabel required>
              Upload Technical Drawing
            </RequiredLabel>

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
              <p className="text-sm text-green-600">
                Uploaded: {drawingName}
              </p>
            )}

          </div>

        )}

        {isEditable && (
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading || uploading}>
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