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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

const updateProductSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  hsCode: z
    .string()
    .trim()
    .regex(/^\d+$/, 'HS Code must contain only digits')
    .refine((val) => val.length === 6 || val.length === 8, {
      message: 'HS Code must be exactly 6 or 8 digits',
    }),
  productType: z.enum(['standard', 'custom', 'made-to-order']),
  originCountryId: z.string().min(1, 'Origin Country is required'),
})

interface ProductBasicInfoFormProps {
  product: {
    id: string
    name: string
    categoryId: string
    hsCode: string
    productType: string
    originCountryId: string
    status: string
  }
  categories: { id: string, name: string }[]
  countries: { id: string, name: string }[]
  onUpdate?: (updates: any) => void
  onNext?: () => void
}

export function ProductBasicInfoForm({
  product,
  categories,
  countries,
  onUpdate,
  onNext
}: ProductBasicInfoFormProps) {

  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const isEditable = product.status === 'draft'

  const form = useForm<z.infer<typeof updateProductSchema>>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      id: product.id || '',
      name: product.name || '',
      categoryId: product.categoryId || '',
      hsCode: product.hsCode || '',
      productType: (product.productType as "standard" | "custom" | "made-to-order") || "standard",
      originCountryId: product.originCountryId || '',
    },
    disabled: !isEditable,
  })

  // ✅ FIXED: stable dependency array (no object refs)
  useEffect(() => {
    form.reset({
      id: product.id || '',
      name: product.name || '',
      categoryId: product.categoryId || '',
      hsCode: product.hsCode || '',
      productType: (product.productType as "standard" | "custom" | "made-to-order") || "standard",
      originCountryId: product.originCountryId || '',
    })
  }, [
    product.id,
    product.name,
    product.categoryId,
    product.hsCode,
    product.productType,
    product.originCountryId,
  ])

  async function onSubmit(values: z.infer<typeof updateProductSchema>) {

    setIsLoading(true)

    try {

      const response = await fetch("/api/product/update/basic", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {

        if (data.details) {

          Object.entries(data.details).forEach(([key, value]: any) => {

            if (value?._errors?.length) {

              form.setError(key as any, {
                type: "server",
                message: value._errors[0],
              })

            }

          })

          return
        }

        throw new Error(data.error || "Failed to update product")

      }

      toast({
        title: "Product Updated",
        description: "Basic information saved successfully.",
      })

      // ✅ update parent state
      if (onUpdate) onUpdate(values)

      // ✅ move to next step
      if (onNext) onNext()

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

        <p className="text-sm text-muted-foreground">
          <span className="text-red-500">*</span> indicates required fields
        </p>

        {/* PRODUCT NAME */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <RequiredLabel required>Product Name</RequiredLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* PRODUCT TYPE */}
          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>

                <RequiredLabel required>Product Type</RequiredLabel>

                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!isEditable}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="standard">Standard Product</SelectItem>
                    <SelectItem value="custom">Custom Configuration</SelectItem>
                    <SelectItem value="made-to-order">Made to Order</SelectItem>
                  </SelectContent>
                </Select>

                <FormDescription>
                  How is this product manufactured?
                </FormDescription>

                <FormMessage />

              </FormItem>
            )}
          />

          {/* CATEGORY */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>

                <RequiredLabel required>Category</RequiredLabel>

                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!isEditable}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />

              </FormItem>
            )}
          />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* HS CODE */}
          <FormField
            control={form.control}
            name="hsCode"
            render={({ field }) => (
              <FormItem>

                <RequiredLabel required>HS Code</RequiredLabel>

                <FormControl>
                  <Input
                    placeholder="Harmonized System Code"
                    {...field}
                  />
                </FormControl>

                <FormDescription>
                  International product classification code.
                </FormDescription>

                <FormMessage />

              </FormItem>
            )}
          />

          {/* COUNTRY */}
          <FormField
            control={form.control}
            name="originCountryId"
            render={({ field }) => (
              <FormItem>

                <RequiredLabel required>Country of Origin</RequiredLabel>

                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!isEditable}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />

              </FormItem>
            )}
          />

        </div>

        {/* SUBMIT */}
        {isEditable && (
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save & Continue
            </Button>
          </div>
        )}

      </form>
    </Form>
  )
}