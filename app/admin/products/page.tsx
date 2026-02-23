'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Package, ArrowRight, User as UserIcon, Calendar, Tag, ShieldCheck } from 'lucide-react'

interface Product {
  id: string
  name: string
  status: string
  createdAt: string
  category: {
    name: string
  }
  seller: {
    id: string
    legalName: string
    status: string
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/admin/products/submitted')
        const data = await response.json()

        if (data.success) {
          setProducts(data.products)
        } else {
          setError(data.error || 'Failed to fetch products')
        }
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner className="w-8 h-8 text-primary" />
        <p className="text-neutral-500 font-medium">Scanning product catalog...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight">Product Moderation</h1>
        <p className="text-neutral-500 font-medium">Approve or reject new engineering goods listed by verified sellers.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-2xl shadow-neutral-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-neutral-100 pb-6 px-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Pending Review</CardTitle>
                <CardDescription>New product listings waiting for technical audit</CardDescription>
              </div>
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-bold bg-indigo-50 text-indigo-600 border-indigo-200">
                {products.length} Items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="p-12 text-center text-red-500 font-bold">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-neutral-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-neutral-900">Catalogue is clean</h3>
                  <p className="text-neutral-500 max-w-xs mx-auto">All product submissions have been processed.</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-neutral-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-4 pl-8 font-bold text-neutral-900">Product Name</TableHead>
                    <TableHead className="font-bold text-neutral-900">Category</TableHead>
                    <TableHead className="font-bold text-neutral-900">Seller</TableHead>
                    <TableHead className="font-bold text-neutral-900">Merchant Status</TableHead>
                    <TableHead className="font-bold text-neutral-900">Submitted On</TableHead>
                    <TableHead className="pr-8 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="group transition-colors hover:bg-neutral-50">
                      <TableCell className="py-5 pl-8">
                        <div className="flex items-center gap-4">
                           <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                              <Package className="w-5 h-5 text-neutral-500 group-hover:text-primary" />
                           </div>
                           <p className="font-bold text-neutral-900 group-hover:text-primary transition-colors uppercase tracking-tight">{product.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Tag className="w-3.5 h-3.5 text-neutral-400" />
                           <span className="text-sm font-semibold text-neutral-600">{product.category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/sellers/${product.seller.id}`} className="hover:underline decoration-neutral-300">
                          <p className="font-bold text-neutral-900 text-sm">{product.seller.legalName}</p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           {product.seller.status === 'verified' ? (
                             <Badge className="bg-green-50 text-green-600 border-green-100 font-bold">
                               <ShieldCheck className="w-3 h-3 mr-1" />
                               VERIFIED
                             </Badge>
                           ) : (
                             <Badge variant="outline" className="text-neutral-400 border-neutral-200">
                               {product.seller.status.toUpperCase()}
                             </Badge>
                           )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-neutral-500">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-medium">
                            {new Date(product.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-8 whitespace-nowrap text-right">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="ghost" size="sm" className="font-bold gap-2 text-neutral-600 hover:text-primary transition-all">
                            Details
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
