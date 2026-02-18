
'use client'

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Loader2, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

// Mock Data for MVP - ideally fetched from API
const COUNTRIES = [
    { id: 'c1', name: 'USA' }, { id: 'c2', name: 'UK' }, { id: 'c3', name: 'UAE' }, 
    { id: 'c4', name: 'Germany' }, { id: 'c5', name: 'Australia' }
]
const INCOTERMS = [
    { id: 'i1', code: 'FOB' }, { id: 'i2', code: 'CIF' }, { id: 'i3', code: 'EXW' }, 
    { id: 'i4', code: 'DDP' }
]

const exportProfileSchema = z.object({
  exportExperience: z.coerce.number().min(0),
  annualTurnover: z.string().min(1, 'Required'),
  logisticsModes: z.array(z.string()).min(1, 'Select at least one mode'),
  marketIds: z.array(z.string()).optional(),
  incotermIds: z.array(z.string()).optional(),
  hsCodes: z.array(
    z.object({ value: z.string().min(4, 'HS Code must be at least 4 chars') })
  ).optional(), 
})

interface SellerExportProfileProps {
  seller: {
    id: string
    status: string
    exportProfile?: {
        exportExperience: number
        annualTurnover: string
        logisticsModes: string[]
        markets: { countryId: string }[]
        incoterms: { incotermId: string }[]
        hsExpertise: { hsCode: string }[]
    } | null
  }
}

export function SellerExportProfileForm({ seller }: SellerExportProfileProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof exportProfileSchema>>({
    resolver: zodResolver(exportProfileSchema),
    defaultValues: {
      exportExperience: seller.exportProfile?.exportExperience || 0,
      annualTurnover: seller.exportProfile?.annualTurnover || "",
      logisticsModes: seller.exportProfile?.logisticsModes || [],
      marketIds: seller.exportProfile?.markets.map(m => m.countryId) || [],
      incotermIds: seller.exportProfile?.incoterms.map(i => i.incotermId) || [],
      hsCodes: seller.exportProfile?.hsExpertise.map(h => ({ value: h.hsCode })) || [{ value: '' }],
    },
  })

  // We only handle HS codes as dynamic field array for input
  const { fields: hsFields, append: appendHs, remove: removeHs } = useFieldArray({
    control: form.control,
    name: "hsCodes",
  })

  async function onSubmit(values: z.infer<typeof exportProfileSchema>) {
    setIsLoading(true)
    try {
        // Flatten hsCodes to array of strings
        const payload = {
            sellerId: seller.id,
            exportExperience: values.exportExperience,
            annualTurnover: values.annualTurnover,
            logisticsModes: values.logisticsModes,
            marketIds: values.marketIds,
            incotermIds: values.incotermIds,
            hsCodes: values.hsCodes?.map(h => h.value).filter(Boolean)
        }

      const response = await fetch("/api/seller/export-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save export profile")

      toast({ title: "Success", description: "Export profile updated." })
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="exportExperience"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Export Experience (Years)</FormLabel>
                <FormControl>
                    <Input type="number" {...field} disabled={isReadOnly} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="annualTurnover"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Annual Turnover</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="<10L">Less than ₹10 Lakhs</SelectItem>
                    <SelectItem value="10L-1Cr">₹10 Lakhs - ₹1 Cr</SelectItem>
                    <SelectItem value="1Cr-10Cr">₹1 Cr - ₹10 Cr</SelectItem>
                    <SelectItem value="10Cr-50Cr">₹10 Cr - ₹50 Cr</SelectItem>
                    <SelectItem value="50Cr+">Above ₹50 Cr</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="logisticsModes"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Logistics Modes</FormLabel>
                <FormDescription>
                  Select the modes of transport you support.
                </FormDescription>
              </div>
              <div className="flex gap-4">
                {['Sea', 'Air', 'Road', 'Rail'].map((mode) => (
                  <FormField
                    key={mode}
                    control={form.control}
                    name="logisticsModes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={mode}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(mode)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, mode])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== mode
                                      )
                                    )
                              }}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {mode}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Markets - Simple Multi-Select logic for MVP */}
        <FormField
             control={form.control}
             name="marketIds"
             render={({ field }) => (
                 <FormItem>
                    <FormLabel>Target Markets (Countries)</FormLabel>
                     <div className="flex flex-wrap gap-2 mb-2">
                        {field.value?.map(id => {
                            const country = COUNTRIES.find(c => c.id === id)
                            return country ? (
                                <Badge key={id} variant="secondary" className="gap-1">
                                    {country.name}
                                    {!isReadOnly && (
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => {
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Add Market..." />
                                </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                                 {COUNTRIES.map(c => (
                                     <SelectItem key={c.id} value={c.id}>
                                         {c.name}
                                     </SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                     )}
                     <FormDescription>Select countries you currently export to.</FormDescription>
                 </FormItem>
             )}
        />
        
        {/* Incoterms */}
        <FormField
             control={form.control}
             name="incotermIds"
             render={({ field }) => (
                 <FormItem>
                    <FormLabel>Supported Incoterms</FormLabel>
                     <div className="flex flex-wrap gap-2 mb-2">
                        {field.value?.map(id => {
                            const term = INCOTERMS.find(t => t.id === id)
                            return term ? (
                                <Badge key={id} variant="secondary" className="gap-1">
                                    {term.code}
                                    {!isReadOnly && (
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => {
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Add Incoterm..." />
                                </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                                 {INCOTERMS.map(term => (
                                     <SelectItem key={term.id} value={term.id}>
                                         {term.code}
                                     </SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                     )}
                 </FormItem>
             )}
        />

        {/* HS Codes */}
        <div className="space-y-3">
            <FormLabel>Key HS Codes</FormLabel>
            <FormDescription>Enter the main HS Codes for your products.</FormDescription>
            {hsFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                     <FormField
                        control={form.control}
                        name={`hsCodes.${index}.value`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormControl>
                                <Input placeholder="e.g. 840120" {...field} disabled={isReadOnly} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        {!isReadOnly && (
                            <Button type="button" variant="outline" size="icon" onClick={() => removeHs(index)} disabled={hsFields.length === 1 && index === 0}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                </div>
            ))}
            {!isReadOnly && (
                <Button type="button" variant="outline" size="sm" onClick={() => appendHs({ value: "" })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Code
                </Button>
            )}
        </div>

        {!isReadOnly && (
            <div className="flex justify-end pt-4">
                 <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
                </Button>
            </div>
        )}
      </form>
    </Form>
  )
}
