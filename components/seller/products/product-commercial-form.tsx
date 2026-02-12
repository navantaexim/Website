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
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

const commercialSchema = z.object({
  productId: z.string(),
  moq: z.coerce.number().int().gt(0, "MOQ must be greater than 0"),
  capacityPerMonth: z.coerce.number().int().gt(0, "Capacity must be greater than 0"),
  leadTimeDays: z.coerce.number().int().gt(0, "Lead time must be greater than 0"),
  packaging: z.string().min(1, "Packaging details are required"),
  portOfDispatch: z.string().min(1, "Port of dispatch is required"),
})

interface ProductCommercialFormProps {
  product: {
    id: string
    status: string
    commercial?: {
        moq: number
        capacityPerMonth: number
        leadTimeDays: number
        packaging: string
        portOfDispatch: string
    } | null
  }
}

export function ProductCommercialForm({ product }: ProductCommercialFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditable = product.status === 'draft'

  const form = useForm<z.infer<typeof commercialSchema>>({
    resolver: zodResolver(commercialSchema),
    defaultValues: {
      productId: product.id,
      moq: product.commercial?.moq || 0,
      capacityPerMonth: product.commercial?.capacityPerMonth || 0,
      leadTimeDays: product.commercial?.leadTimeDays || 0,
      packaging: product.commercial?.packaging || "",
      portOfDispatch: product.commercial?.portOfDispatch || "",
    },
    disabled: !isEditable
  })

  async function onSubmit(values: z.infer<typeof commercialSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/product/commercial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save commercial details")
      }

      toast({
        title: "Commercial Details Saved",
        description: "Product logistics info updated successfully.",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="moq"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MOQ (Minimum Order Qty)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Smallest order size you accept.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="capacityPerMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Max units you can produce per month.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="leadTimeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Time (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Days to ship after order confirmation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="packaging"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Packaging Details</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="e.g. Wooden crates, Palletized, Corrugated boxes" 
                        className="resize-none h-32"
                        {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Describe how the product is packed for shipment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="portOfDispatch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port of Dispatch</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Nhava Sheva, Mumbai Air Cargo" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nearest port/airport from where you ship.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {isEditable && (
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Commercial Details
                </Button>
            </div>
        )}
      </form>
    </Form>
  )
}
