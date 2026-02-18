'use client'

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

// Validation Schemas
const dimensionSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  diameter: z.coerce.number().optional(),
  thickness: z.coerce.number().optional(),
  unit: z.string().min(1, 'Unit is required'),
})

const specificationSchema = z.object({
  productId: z.string(),
  materialGrade: z.string().min(1, "Material Grade is required"),
  weightKg: z.coerce.number().gt(0, "Weight must be greater than 0"),
  tolerance: z.string().min(1, "Tolerance is required"),
  surfaceFinish: z.string().min(1, "Surface Finish is required"),
  process: z.string().min(1, "Manufacturing Process is required"),
  drawingAvailable: z.boolean().default(false),
  dimensions: dimensionSchema,
})

interface ProductSpecificationFormProps {
  product: {
    id: string
    status: string
    specs?: {
        materialGrade: string
        weightKg: number
        tolerance: string
        surfaceFinish: string
        process: string
        drawingAvailable: boolean
        dimensions: any
    } | null
  }
}

export function ProductSpecificationForm({ product }: ProductSpecificationFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditable = product.status === 'draft'

  // Default dimensions based on existing data or fallback
  const existingDims = product.specs?.dimensions as any || {}
  
  const form = useForm<z.infer<typeof specificationSchema>>({
    resolver: zodResolver(specificationSchema),
    defaultValues: {
      productId: product.id,
      materialGrade: product.specs?.materialGrade || "",
      weightKg: product.specs?.weightKg || 0,
      tolerance: product.specs?.tolerance || "",
      surfaceFinish: product.specs?.surfaceFinish || "",
      process: product.specs?.process || "",
      drawingAvailable: product.specs?.drawingAvailable || false,
      dimensions: {
        type: existingDims.type || "rectangular",
        unit: existingDims.unit || "mm",
        length: existingDims.length,
        width: existingDims.width,
        height: existingDims.height,
        diameter: existingDims.diameter,
        thickness: existingDims.thickness,
      }
    },
    disabled: !isEditable
  })

  // Watch dimension type to show relevant fields
  const dimensionType = form.watch("dimensions.type")

  async function onSubmit(values: z.infer<typeof specificationSchema>) {
    setIsLoading(true)
    
    // Clean up dimensions object: remove undefined/null values
    const cleanDimensions = Object.fromEntries(
        Object.entries(values.dimensions).filter(([_, v]) => v != null)
    )

    const payload = {
        ...values,
        dimensions: cleanDimensions
    }

    try {
      const response = await fetch("/api/product/specification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save specifications")
      }

      toast({
        title: "Specifications Saved",
        description: "Product technical details updated successfully.",
      })
      
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Physical Properties */}
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Physical Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="materialGrade"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Material Grade</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. SS 304, Al 6061" {...field} />
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
                    <FormLabel>Net Weight (kg)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-4">
             <h3 className="text-lg font-medium">Dimensions</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="dimensions.type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Shape</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditable}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Shape" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="rectangular">Rectangular / Block</SelectItem>
                            <SelectItem value="cylindrical">Cylindrical / Rod</SelectItem>
                            <SelectItem value="sheet">Sheet / Plate</SelectItem>
                            <SelectItem value="tubular">Tubular / Pipe</SelectItem>
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
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditable}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Unit" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="mm">Millimeters (mm)</SelectItem>
                            <SelectItem value="cm">Centimeters (cm)</SelectItem>
                            <SelectItem value="m">Meters (m)</SelectItem>
                            <SelectItem value="inch">Inches (in)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
             </div>

             {/* Dynamic Dimension Inputs */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-md border">
                 {(dimensionType === 'rectangular' || dimensionType === 'sheet') && (
                    <>
                         <FormField control={form.control} name="dimensions.length" render={({ field }) => (
                             <FormItem><FormLabel>Length</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="dimensions.width" render={({ field }) => (
                             <FormItem><FormLabel>Width</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         {dimensionType === 'rectangular' && (
                             <FormField control={form.control} name="dimensions.height" render={({ field }) => (
                                 <FormItem><FormLabel>Height</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                             )} />
                         )}
                         {dimensionType === 'sheet' && (
                             <FormField control={form.control} name="dimensions.thickness" render={({ field }) => (
                                 <FormItem><FormLabel>Thickness</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                             )} />
                         )}
                    </>
                 )}

                 {(dimensionType === 'cylindrical' || dimensionType === 'tubular') && (
                    <>
                        <FormField control={form.control} name="dimensions.length" render={({ field }) => (
                             <FormItem><FormLabel>Length</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                        <FormField control={form.control} name="dimensions.diameter" render={({ field }) => (
                             <FormItem><FormLabel>Outer Diameter</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         {dimensionType === 'tubular' && (
                             <FormField control={form.control} name="dimensions.thickness" render={({ field }) => (
                                 <FormItem><FormLabel>Wall Thickness</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                             )} />
                         )}
                    </>
                 )}
             </div>
        </div>

        {/* Manufacturing Details */}
        <div className="space-y-4">
             <h3 className="text-lg font-medium">Manufacturing Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="process"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Manufacturing Process</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. CNC Machining, Casting" {...field} />
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
                    <FormLabel>Surface Finish</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Polished, Anodized" {...field} />
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
                    <FormLabel>Tolerance Standard</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. +/- 0.05mm, ISO 2768" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="drawingAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isEditable}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Technical Drawing Available
                    </FormLabel>
                    <FormDescription>
                      Check this if you can provide CAD/PDF drawings for this product.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
        </div>

        {isEditable && (
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Specifications
                </Button>
            </div>
        )}
      </form>
    </Form>
  )
}
