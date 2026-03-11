'use client'

import { useEffect, useState } from 'react'
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
  FormMessage,
} from "@/components/ui/form"
import { RequiredLabel } from "@/components/form/required-label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

const commercialSchema = z.object({
  productId: z.string(),
  moq: z.coerce.number().int().gt(0),
  capacityPerMonth: z.coerce.number().int().gt(0),
  leadTimeDays: z.coerce.number().int().gt(0),
  packaging: z.string().min(1),
  portOfDispatch: z.string().min(1),
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
  onUpdate?: () => void
}

export function ProductCommercialForm({ product, onUpdate }: ProductCommercialFormProps) {

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

  useEffect(() => {

    form.reset({
      productId: product.id,
      moq: product.commercial?.moq || 0,
      capacityPerMonth: product.commercial?.capacityPerMonth || 0,
      leadTimeDays: product.commercial?.leadTimeDays || 0,
      packaging: product.commercial?.packaging || "",
      portOfDispatch: product.commercial?.portOfDispatch || "",
    })

  }, [product])

  async function onSubmit(values: z.infer<typeof commercialSchema>) {

    setIsLoading(true)

    try {

      const response = await fetch("/api/product/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error()

      toast({
        title: "Commercial Details Saved",
        description: "Product logistics info updated successfully.",
      })

      if (onUpdate) onUpdate()

      router.refresh()

    } catch {

      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })

    } finally {

      setIsLoading(false)

    }
  }

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        <p className="text-sm text-muted-foreground">
          <span className="text-red-500">*</span> indicates required fields
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <FormField
            control={form.control}
            name="moq"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>MOQ (Minimum Order Qty)</RequiredLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                <RequiredLabel required>Monthly Capacity</RequiredLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leadTimeDays"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Lead Time (Days)</RequiredLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
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
                <RequiredLabel required>Packaging Details</RequiredLabel>
                <FormControl>
                  <Textarea className="resize-none h-32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="portOfDispatch"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel required>Port of Dispatch</RequiredLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        {isEditable && (
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              Save & Continue
            </Button>
          </div>
        )}

      </form>
    </Form>
  )
}