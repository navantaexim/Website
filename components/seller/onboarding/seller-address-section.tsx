'use client'

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, MapPin, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

const addressSchema = z.object({
  type: z.enum(['registered', 'manufacturing']),
  addressLine: z.string().min(5, 'Address line must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: z.string().default('India'),
})

interface SellerAddressProps {
  seller: {
    id: string
    status: string
    addresses: {
        id: string
        sellerId: string
        type: string
        addressLine: string
        city: string
        state: string
        country: string
        pincode: string
    }[]
  }
}

export function SellerAddressSection({ seller }: SellerAddressProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: "manufacturing",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  })

  async function onSubmit(values: z.infer<typeof addressSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/seller/address", {
        method: "POST",
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
        throw new Error(errorData.error || "Failed to add address")
      }

      toast({
        title: "Success",
        description: "Address added successfully.",
      })
      
      setIsOpen(false)
      form.reset()
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

  async function deleteAddress(addressId: string) {
      // confirm dialog logic ideally here
      try {
          const response = await fetch(`/api/seller/address?id=${addressId}&sellerId=${seller.id}`, {
              method: 'DELETE'
          })

          if (!response.ok) {
              throw new Error('Failed to delete address')
          }

          toast({
              title: "Address Deleted",
              description: "The address has been removed."
          })
          router.refresh()
      } catch (error) {
           toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Something went wrong",
              variant: "destructive",
          })
      }
  }

  return (
    <div className="space-y-6">
        {/* Address List */}
        <div className="grid gap-4 md:grid-cols-2">
            {seller.addresses.map((address) => (
                <Card key={address.id} className="relative group overflow-hidden">
                    <CardContent className="p-4 pt-5">
                       <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-md ${address.type === 'registered' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-semibold capitalize text-sm">{address.type} Address</p>
                                    <p className="text-sm text-muted-foreground mt-1 text-balance">
                                        {address.addressLine}, {address.city}, {address.state} - {address.pincode}, {address.country}
                                    </p>
                                </div>
                            </div>
                            
                            {seller.status === 'draft' && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                    onClick={() => deleteAddress(address.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            )}
                       </div>
                    </CardContent>
                </Card>
            ))}

            {/* Empty State / Add Button */}
           
        </div>

        {seller.status === 'draft' && (
             <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-dashed h-16 bg-muted/5 hover:bg-muted/10">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Address
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Address</DialogTitle>
                        <DialogDescription>
                            Add a registered or manufacturing address.
                        </DialogDescription>
                    </DialogHeader>

                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Address Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="manufacturing">Manufacturing Unit</SelectItem>
                                    <SelectItem value="registered">Registered Office</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            <FormField
                            control={form.control}
                            name="addressLine"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="Plot No, Street, Landmark" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input placeholder="City" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                                <FormField
                                control={form.control}
                                name="pincode"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Pincode</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ZIP/PIN" {...field} maxLength={6} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                        <Input placeholder="State" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                                <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input placeholder="India" {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Address
                                </Button>
                            </DialogFooter>
                        </form>
                        </Form>
                </DialogContent>
            </Dialog>
        )}
    </div>
  )
}
