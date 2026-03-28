'use client'

import { useState, useMemo, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
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
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

// 🔒 STRONG SCHEMA (MATCH BACKEND)
const createProductSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Product name cannot be empty or spaces")
    .max(120, "Product name too long"),

  categoryId: z.string().min(1, 'Category is required'),

  hsCode: z.string()
    .trim()
    .refine((val) => /^\d*$/.test(val), {
      message: "HS Code must contain only digits",
    })
    .refine((val) => val.length >= 6 && val.length <= 10, {
      message: "HS Code must be 6-10 digits",
    }),

  productType: z.enum(['standard', 'custom', 'made-to-order']),

  originCountryId: z.string().min(1, 'Origin Country is required'),
})

interface CreateProductDialogProps {
  sellerId: string
  categories: { id: string, name: string }[]
  countries: { id: string, name: string }[]
}

export function CreateProductDialog({ sellerId, categories, countries }: CreateProductDialogProps) {

  const { toast } = useToast()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // ⚠️ FIXED: default country bug
  const defaultCountryId = useMemo(() => {
    return countries.find(c => c.name === 'India')?.id || ""
  }, [countries])

  const form = useForm<z.infer<typeof createProductSchema>>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      hsCode: "",
      productType: "standard",
      originCountryId: "",
    },
  })

  // ✅ FIX: ensure default country actually applies after load
  useEffect(() => {
    if (defaultCountryId) {
      form.setValue("originCountryId", defaultCountryId)
    }
  }, [defaultCountryId, form])

  async function onSubmit(values: z.infer<typeof createProductSchema>) {

    if (isLoading) return // 🔒 extra guard

    setIsLoading(true)

    try {
      const response = await fetch("/api/product/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId,
          ...values,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product")
      }

      toast({
        title: "Product Created",
        description: "Redirecting to edit page...",
      })

      setOpen(false)

      router.push(`/seller/products/${data.productId}`)

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
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[640px]">

        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Enter the basic details to start listing your product.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* PRODUCT NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Stainless Steel Valves"
                      value={field.value}
                      onChange={(e) => {
                        const raw = e.target.value

                        const cleaned = raw.replace(/\s+/g, " ")

                        form.setValue("name", cleaned, {
                          shouldValidate: true,   // 🔥 KEY FIX
                          shouldDirty: true,
                        })
                      }}
                      onBlur={(e) => {
                        const trimmed = e.target.value.trim()

                        form.setValue("name", trimmed, {
                          shouldValidate: true,   // 🔥 FORCE VALIDATION
                          shouldDirty: true,
                        })
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">

              {/* TYPE */}
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="made-to-order">Made to Order</SelectItem>
                      </SelectContent>
                    </Select>

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
                    <FormLabel>Category *</FormLabel>

                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
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

            <div className="grid grid-cols-2 gap-4">

              {/* HS CODE */}
              <FormField
                control={form.control}
                name="hsCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HS Code *</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="6-10 digit code"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                        }}
                        maxLength={10}
                      />
                    </FormControl>

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
                    <FormLabel>Origin Country *</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
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

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading}>

                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                Create & Continue
              </Button>
            </DialogFooter>

          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}