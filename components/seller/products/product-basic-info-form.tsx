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

const updateProductSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  hsCode: z.string().min(1, 'HS Code is required'),
  productType: z.enum(['standard', 'custom', 'made-to-order']),
  originCountryId: z.string().min(1, 'Origin Country is required'),
})

interface ProductBasicInfoFormProps {
  product: {
    id: string
    name: string
    categoryId: string
    hsCode: string
    productType: string // "standard" | "custom" | "made-to-order"
    originCountryId: string
    status: string
  }
  categories: { id: string, name: string }[]
  countries: { id: string, name: string }[]
}

export function ProductBasicInfoForm({ product, categories, countries }: ProductBasicInfoFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const isEditable = product.status === 'draft'

  const form = useForm<z.infer<typeof updateProductSchema>>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      hsCode: product.hsCode,
      productType: product.productType as "standard" | "custom" | "made-to-order",
      originCountryId: product.originCountryId,
    },
    disabled: !isEditable,
  })

  async function onSubmit(values: z.infer<typeof updateProductSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/product/update/basic", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product")
      }

      toast({
        title: "Product Updated",
        description: "Basic information saved successfully.",
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="productType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Generation Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditable}>
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

             <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditable}>
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
            <FormField
              control={form.control}
              name="hsCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HS Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Harmonized System Code" {...field} />
                  </FormControl>
                  <FormDescription>
                    International product classification code.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="originCountryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Origin</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditable}>
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

        {isEditable && (
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        )}
      </form>
    </Form>
  )
}
