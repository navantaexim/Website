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
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

const manufacturingSchema = z.object({
  manufacturerType: z.string().min(1, 'Type is required'),
  factoryAreaSqm: z.coerce.number().positive('Must be positive'),
  employeeRange: z.string().min(1, 'Required'),
  engineerRange: z.string().optional(),
  inHouseQC: z.boolean().default(false),
  
  engineeringCategories: z.array(z.string()).min(1, 'Select at least one engineering category'),
  processType: z.string().min(1, 'Select a manufacturing process'),
  machines: z.array(z.string()).min(1, 'Select at least one major machine'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
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
        processType?: string | null
        description?: string | null
        engineeringCategories?: { id: string, name: string }[]
        machines?: { id: string, name: string }[]
    } | null
  }
  onUpdate?: (data?: any) => void,
onValidityChange?: (valid: boolean) => void
}

export function SellerManufacturingForm({ seller, onUpdate,onValidityChange }: SellerManufacturingProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [categoriesList, setCategoriesList] = useState<{id: string, name: string}[]>([])
  const [machineCategoriesList, setMachineCategoriesList] = useState<{name: string, machines: {id: string, name: string}[]}[]>([])

  const form = useForm<z.infer<typeof manufacturingSchema>>({
    resolver: zodResolver(manufacturingSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      manufacturerType: seller.capabilities?.manufacturerType || "",
      factoryAreaSqm: seller.capabilities?.factoryAreaSqm || 0,
      employeeRange: seller.capabilities?.employeeRange || "",
      engineerRange: seller.capabilities?.engineerRange || "",
      inHouseQC: seller.capabilities?.inHouseQC || false,
      engineeringCategories: seller.capabilities?.engineeringCategories?.map(c => c.id) || [],
      processType: seller.capabilities?.processType || "",
      machines: seller.capabilities?.machines?.map(m => m.id) || [],
      description: seller.capabilities?.description || "",
    },
  })

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch('/api/manufacturing-options')
        if (res.ok) {
          const data = await res.json()
          setCategoriesList(data.categories || [])
          setMachineCategoriesList(data.machineCategories || [])
        }
      } catch (e) {
        console.error("Failed to fetch manufacturing options")
      } finally {
        setOptionsLoading(false)
      }
    }
    fetchOptions()
  }, [])

  useEffect(() => {
    onValidityChange?.(form.formState.isValid)
  }, [form.formState.isValid])

  useEffect(() => {
    form.reset({
      manufacturerType: seller.capabilities?.manufacturerType || "",
      factoryAreaSqm: seller.capabilities?.factoryAreaSqm || 0,
      employeeRange: seller.capabilities?.employeeRange || "",
      engineerRange: seller.capabilities?.engineerRange || "",
      inHouseQC: seller.capabilities?.inHouseQC || false,
      engineeringCategories: seller.capabilities?.engineeringCategories?.map(c => c.id) || [],
      processType: seller.capabilities?.processType || "",
      machines: seller.capabilities?.machines?.map(m => m.id) || [],
      description: seller.capabilities?.description || "",
    })
  }, [seller, form])

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

      toast({ title: "Success", description: "Manufacturing details saved successfully." })
      if (onUpdate) onUpdate()
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

  if (optionsLoading) {
     return <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        
        {/* NEW FIELDS AT THE TOP FOR BETTER UX AS REQUESTED */}

        {/* Categories Multi Select */}
        <FormField
             control={form.control}
             name="engineeringCategories"
             render={({ field }) => (
                 <FormItem>
                    <FormLabel>Engineering Category</FormLabel>
                     <div className="flex flex-wrap gap-2 mb-2">
                        {field.value?.map(id => {
                            const cat = categoriesList.find(c => c.id === id)
                            return cat ? (
                                <Badge key={id} variant="secondary" className="gap-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                    {cat.name}
                                    {!isReadOnly && (
                                        <X className="h-3 w-3 cursor-pointer ml-1 text-blue-500 hover:text-blue-900" onClick={() => {
                                            field.onChange(field.value?.filter(v => v !== id))
                                        }} />
                                    )}
                                </Badge>
                            ) : null
                        })}
                     </div>
                     {!isReadOnly && (
                         <Select onValueChange={(val) => {
                             if (!field.value?.includes(val)) {
                                 field.onChange([...(field.value || []), val])
                             }
                         }}>
                             <FormControl>
                                <SelectTrigger className="w-full sm:w-[400px]">
                                    <SelectValue placeholder="Add Category..." />
                                </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                                 {categoriesList.filter(c => !field.value?.includes(c.id)).map(c => (
                                     <SelectItem key={c.id} value={c.id}>
                                         {c.name}
                                     </SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                     )}
                     <FormDescription>Select all categories that apply to your business.</FormDescription>
                     <FormMessage />
                 </FormItem>
             )}
        />

        {/* Process Type */}
        <FormField
          control={form.control}
          name="processType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manufacturing Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                <FormControl>
                  <SelectTrigger className="w-full sm:w-[400px]">
                    <SelectValue placeholder="Select process type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Fully Automated">Fully Automated</SelectItem>
                  <SelectItem value="Semi Automated">Semi Automated</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Machines Multi Select */}
        <FormField
             control={form.control}
             name="machines"
             render={({ field }) => (
                 <FormItem>
                    <FormLabel>Major Machines</FormLabel>
                     <div className="flex flex-wrap gap-2 mb-2">
                        {field.value?.map(id => {
                            let machineName = ""
                            machineCategoriesList.forEach(mc => {
                              const m = mc.machines.find(m => m.id === id)
                              if (m) machineName = m.name
                            })
                            
                            return machineName ? (
                                <Badge key={id} variant="secondary" className="gap-1 px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                                    {machineName}
                                    {!isReadOnly && (
                                        <X className="h-3 w-3 cursor-pointer ml-1 text-purple-500 hover:text-purple-900" onClick={() => {
                                            field.onChange(field.value?.filter(v => v !== id))
                                        }} />
                                    )}
                                </Badge>
                            ) : null
                        })}
                     </div>
                     {!isReadOnly && (
                         <Select onValueChange={(val) => {
                             if (!field.value?.includes(val)) {
                                 field.onChange([...(field.value || []), val])
                             }
                         }}>
                             <FormControl>
                                <SelectTrigger className="w-full sm:w-[400px]">
                                    <SelectValue placeholder="Add Machines..." />
                                </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                                {machineCategoriesList.map(mc => {
                                  // filter out already selected ones
                                  const availableMachines = mc.machines.filter(m => !field.value?.includes(m.id));
                                  if (availableMachines.length === 0) return null;
                                  
                                  return (
                                    <div key={mc.name}>
                                      <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase bg-muted/30 sticky top-0">{mc.name}</div>
                                      {availableMachines.map(m => (
                                          <SelectItem key={m.id} value={m.id} className="pl-6">
                                              {m.name}
                                          </SelectItem>
                                      ))}
                                    </div>
                                  )
                                })}
                             </SelectContent>
                         </Select>
                     )}
                     <FormDescription>Select the main machinery your factory holds.</FormDescription>
                     <FormMessage />
                 </FormItem>
             )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manufacturing Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your manufacturing capabilities, specializations, and scale..." 
                  className="min-h-[120px] resize-none"
                  disabled={isReadOnly}
                  {...field} 
                />
              </FormControl>
              <div className="flex justify-between items-center text-xs">
                 <FormDescription>Highlight your key processes and expertise.</FormDescription>
                 <span className={`text-xs ${field.value.length < 200 || field.value.length > 400 ? 'text-red-500' : 'text-green-600'}`}>
                    {field.value.length} / 400 chars (Min: 200)
                 </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="my-8 border-t border-border" />
        <h4 className="text-lg font-bold mb-4">Facility Information</h4>

        <FormField
          control={form.control}
          name="manufacturerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manufacturer Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                <FormControl>
                  <SelectTrigger className="w-full sm:w-[400px]">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold">In-House QC</FormLabel>
                    <FormDescription className="text-xs">
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
            <div className="flex justify-start pt-4 border-t mt-4 border-border">
                 <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto mt-4 px-8">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Save Manufacturing Details
                </Button>
            </div>
        )}
      </form>
    </Form>
  )
}
