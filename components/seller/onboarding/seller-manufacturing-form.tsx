
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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const manufacturingSchema = z.object({
  manufacturerType: z.string().min(1, 'Type is required'),
  factoryAreaSqm: z.coerce.number().positive('Must be positive'),
  employeeRange: z.string().min(1, 'Required'),
  engineerRange: z.string().optional(),
  inHouseQC: z.boolean().default(false),
})

interface SellerManufacturingProps {
  seller: {
    id: string
    status: string
    capabilities?: {
        manufacturerType: string
        factoryAreaSqm: number
        employeeRange: string
        engineerRange?: string | null
        inHouseQC: boolean
    } | null
  }
}

export function SellerManufacturingForm({ seller }: SellerManufacturingProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof manufacturingSchema>>({
    resolver: zodResolver(manufacturingSchema),
    defaultValues: {
      manufacturerType: seller.capabilities?.manufacturerType || "",
      factoryAreaSqm: seller.capabilities?.factoryAreaSqm || 0,
      employeeRange: seller.capabilities?.employeeRange || "",
      engineerRange: seller.capabilities?.engineerRange || "",
      inHouseQC: seller.capabilities?.inHouseQC || false,
    },
  })

  async function onSubmit(values: z.infer<typeof manufacturingSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/seller/manufacturing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: seller.id,
          ...values,
        }),
      })

      if (!response.ok) throw new Error("Failed to save capabilities")

      toast({ title: "Success", description: "Manufacturing capabilities saved." })
      router.refresh()
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save details.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isReadOnly = seller.status !== 'draft'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        
        <FormField
          control={form.control}
          name="manufacturerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manufacturer Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="OEM">Original Equipment Manufacturer (OEM)</SelectItem>
                  <SelectItem value="ODM">Original Design Manufacturer (ODM)</SelectItem>
                  <SelectItem value="Trader">Trader / Distributor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="factoryAreaSqm"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Factory Area (sqm)</FormLabel>
                <FormControl>
                    <Input type="number" {...field} disabled={isReadOnly} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="employeeRange"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Total Employees</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="200+">200+</SelectItem>
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
            name="engineerRange"
            render={({ field }) => (
                <FormItem>
                <FormLabel>R&D Engineers (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="1-5">1-5</SelectItem>
                    <SelectItem value="6-20">6-20</SelectItem>
                    <SelectItem value="20+">20+</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="inHouseQC"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <FormLabel>In-House QC</FormLabel>
                    <FormDescription>
                    Do you have an internal Quality Control team?
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isReadOnly}
                    />
                </FormControl>
                </FormItem>
            )}
            />
        </div>

        {!isReadOnly && (
            <div className="flex justify-end">
                 <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Capabilities
                </Button>
            </div>
        )}
      </form>
    </Form>
  )
}
