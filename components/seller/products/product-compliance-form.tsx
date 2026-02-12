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
import { Loader2, Save, X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const complianceSchema = z.object({
  productId: z.string(),
  inspectionType: z.string().min(1, "Inspection Type is required"),
  standards: z.array(z.string().min(1)).min(1, "At least one standard is required"),
})

interface ProductComplianceFormProps {
  product: {
    id: string
    status: string
    compliance?: {
        inspectionType: string
        standards: { standard: string }[]
    } | null
  }
}

const COMMON_STANDARDS = [
    "ISO 9001", "ISO 14001", "ASTM", "DIN", "JIS", "BS (British Standards)", "ANSI", "ASME", "CE Support"
]

export function ProductComplianceForm({ product }: ProductComplianceFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditable = product.status === 'draft'

  // Initialize standards list from existing data
  const [selectedStandards, setSelectedStandards] = useState<string[]>(
      product.compliance?.standards.map(s => s.standard) || []
  )
  const [customStandard, setCustomStandard] = useState("")

  const form = useForm<z.infer<typeof complianceSchema>>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      productId: product.id,
      inspectionType: product.compliance?.inspectionType || "",
      standards: selectedStandards,
    },
    disabled: !isEditable
  })

  // Update form value when local state changes
  function updateStandards(newStandards: string[]) {
      setSelectedStandards(newStandards)
      form.setValue('standards', newStandards, { shouldValidate: true })
  }

  function addStandard(std: string) {
      if (!std) return
      if (!selectedStandards.includes(std)) {
          updateStandards([...selectedStandards, std])
      }
      setCustomStandard("")
  }

  function removeStandard(std: string) {
      updateStandards(selectedStandards.filter(s => s !== std))
  }

  async function onSubmit(values: z.infer<typeof complianceSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/product/compliance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save compliance details")
      }

      toast({
        title: "Compliance Saved",
        description: "Standards and inspection details updated.",
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
            name="inspectionType"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Quality Inspection Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditable}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Inspection Method" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Self Inspection">Self Inspection (Internal)</SelectItem>
                        <SelectItem value="Third Party Inspection">Third Party Inspection (TPI)</SelectItem>
                        <SelectItem value="Buyer Inspection">Buyer Inspection Allowed</SelectItem>
                    </SelectContent>
                </Select>
                <FormDescription>
                    How is quality verified before shipment?
                </FormDescription>
                <FormMessage />
            </FormItem>
            )}
        />

        <div className="space-y-4">
            <FormLabel className={form.formState.errors.standards ? "text-destructive" : ""}>
                Applicable Standards & Certifications
            </FormLabel>
            
            {/* Selected Standards Tags */}
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/20">
                {selectedStandards.length === 0 && (
                    <span className="text-sm text-muted-foreground self-center">No standards selected</span>
                )}
                {selectedStandards.map(std => (
                    <Badge key={std} variant="secondary" className="pl-2 pr-1 h-8">
                        {std}
                        {isEditable && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                onClick={() => removeStandard(std)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </Badge>
                ))}
            </div>
            {form.formState.errors.standards && (
                 <p className="text-sm font-medium text-destructive">{form.formState.errors.standards.message}</p>
            )}

            {isEditable && (
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Common Standards Dropdown */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Quick Add</label>
                        <Select onValueChange={addStandard}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Common Standard" />
                            </SelectTrigger>
                            <SelectContent>
                                {COMMON_STANDARDS.map(std => (
                                    <SelectItem key={std} value={std} disabled={selectedStandards.includes(std)}>
                                        {std}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Add Custom</label>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="e.g. ASTM A312" 
                                value={customStandard}
                                onChange={(e) => setCustomStandard(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addStandard(customStandard)
                                    }
                                }}
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => addStandard(customStandard)}
                                disabled={!customStandard.trim()}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {isEditable && (
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Compliance Info
                </Button>
            </div>
        )}
      </form>
    </Form>
  )
}
