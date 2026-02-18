'use client'

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
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  legalName: z.string().min(2, {
    message: "Legal name must be at least 2 characters.",
  }),
  businessType: z.string({
    required_error: "Please select a business type.",
  }),
  yearEstablished: z.coerce.number().min(1800).max(new Date().getFullYear()),
  gstNumber: z.string().length(15, {
    message: "GST Number must be exactly 15 characters.",
  }),
  iecCode: z.string().length(10, {
    message: "IEC Code must be exactly 10 characters.",
  }),
})

interface SellerBasicInfoProps {
  seller: {
    id: string
    legalName: string
    businessType: string
    yearEstablished: number
    gstNumber: string
    iecCode: string
    status: string
  }
}

export function SellerBasicInfoForm({ seller }: SellerBasicInfoProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legalName: seller.legalName,
      businessType: seller.businessType,
      yearEstablished: seller.yearEstablished,
      gstNumber: seller.gstNumber,
      iecCode: seller.iecCode,
    },
    disabled: seller.status !== "draft"
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/seller/update-basic", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId: seller.id,
          ...values,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update seller info")
      }

      toast({
        title: "Success",
        description: "Seller basic information updated successfully.",
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
          name="legalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legal Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter legal business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={field.disabled}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                      <SelectItem value="Merchant Exporter">Merchant Exporter</SelectItem>
                      <SelectItem value="Service Provider">Service Provider</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearEstablished"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Established</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="YYYY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="gstNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                  <FormControl>
                    <Input placeholder="15-digit GST Number" {...field} maxLength={15} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="iecCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IEC Code</FormLabel>
                  <FormControl>
                    <Input placeholder="10-digit IEC Code" {...field} maxLength={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <Button type="submit" disabled={isLoading || seller.status !== 'draft'}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Information
        </Button>
      </form>
    </Form>
  )
}
