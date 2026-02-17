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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const currentYear = new Date().getFullYear()

const createSellerSchema = z.object({
  legalName: z.string().min(2, "Legal name must be at least 2 characters"),
  businessType: z.enum([
    "Private Limited",
    "Public Limited",
    "Partnership",
    "LLP",
    "Proprietorship",
    "Other"
  ]),
  yearEstablished: z.coerce.number().min(1900, "Year must be valid").max(currentYear, "Cannot be in future"),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST Number format"),
  iecCode: z.string().length(10, "IEC Code must be exactly 10 characters").regex(/^[A-Z0-9]+$/, "Alphanumeric only"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional().or(z.literal("")),
  cinOrLlpin: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  whatsapp: z.boolean().default(true),
  designation: z.string().min(2, "Designation is required"),
})

export default function CreateSellerPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof createSellerSchema>>({
    resolver: zodResolver(createSellerSchema),
    defaultValues: {
      legalName: "",
      businessType: "Private Limited",
      yearEstablished: currentYear,
      gstNumber: "",
      iecCode: "",
      panNumber: "",
      cinOrLlpin: "",
      phone: "",
      whatsapp: true,
      designation: "",
    },
  })

  async function onSubmit(values: z.infer<typeof createSellerSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/seller/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create seller account")
      }

      toast({
        title: "Account Created!",
        description: "Redirecting you to complete your profile...",
      })
      
      // Redirect to onboarding to start the stepper
      router.push('/seller/onboarding')
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Register as a Seller</CardTitle>
          <CardDescription>
            Enter your business details to get started. All fields marked with * are mandatory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Information</h3>
                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Business Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="As per GST Certificate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Private Limited">Private Limited</SelectItem>
                              <SelectItem value="Public Limited">Public Limited</SelectItem>
                              <SelectItem value="Partnership">Partnership</SelectItem>
                              <SelectItem value="LLP">LLP</SelectItem>
                              <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
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
                          <FormLabel>Year Established *</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gstNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="15-digit GSTIN" {...field} maxLength={15} className="uppercase" />
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
                          <FormLabel>IEC Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="10-digit IEC" {...field} maxLength={10} className="uppercase" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="panNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PAN Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Permanent Account Number" {...field} maxLength={10} className="uppercase" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cinOrLlpin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CIN / LLPIN (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Corporate ID Number" {...field} className="uppercase" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Designation *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Director, Manager" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number *</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+91" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Enable WhatsApp Notifications
                        </FormLabel>
                        <FormDescription>
                          Receive important updates about your account on WhatsApp.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account & Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
