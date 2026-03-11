'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileCheck, Package, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

interface DashboardOverviewProps {
  seller: {
    id: string
    legalName: string
    status: string
  }
  products: {
    id: string
    name: string
    status: string
    category: {
      name: string
    }
  }[]
}

export function SellerDashboardOverview({ seller, products }: DashboardOverviewProps) {

  const activeProducts = products.filter(p => p.status === 'active').length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Seller Console
          </h1>
          <p className="text-neutral-500 mt-1">
            Global operations for
            <span className="text-primary font-semibold ml-1">
              {seller.legalName}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/seller/products">Manage Catalog</Link>
          </Button>

          <Button asChild className="shadow-lg shadow-primary/20">
            <Link href="/seller/products">
              <Package className="w-4 h-4 mr-2" />
              List New Product
            </Link>
          </Button>
        </div>
      </div>


      {/* METRIC CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">₹0.00</div>
            <p className="text-xs text-neutral-400 mt-1">
              +0% from last month
            </p>
          </CardContent>
        </Card>


        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Active Products
            </CardTitle>
            <Package className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">
              {activeProducts}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Ready for global export
            </p>
          </CardContent>
        </Card>


        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Pending Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">0</div>
            <p className="text-xs text-neutral-400 mt-1">
              Action required
            </p>
          </CardContent>
        </Card>


        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Global Reach
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">0</div>
            <p className="text-xs text-neutral-400 mt-1">
              Inquiries this week
            </p>
          </CardContent>
        </Card>

      </div>


      {/* PRODUCTS + COMPLIANCE */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

        {/* RECENT PRODUCTS */}
        <Card className="col-span-full lg:col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>
              Latest products added to your catalog
            </CardDescription>
          </CardHeader>

          <CardContent>

            {products.length === 0 ? (

              <div className="h-[220px] flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed rounded-xl bg-neutral-50/50">

                <Package className="w-10 h-10 mb-2 opacity-20" />

                <p className="font-medium text-sm">
                  No products created yet
                </p>

                <Button asChild size="sm" className="mt-3">
                  <Link href="/seller/products">
                    Create Product
                  </Link>
                </Button>

              </div>

            ) : (

              <div className="space-y-3">

                {products.map(product => (

                  <Link
                    key={product.id}
                    href={`/seller/products/${product.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-neutral-50 transition"
                  >

                    <div>
                      <p className="font-semibold text-sm text-neutral-900">
                        {product.name}
                      </p>

                      <p className="text-xs text-neutral-500">
                        {product.category?.name}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-1 rounded
                        ${product.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : product.status === 'draft'
                            ? 'bg-neutral-100 text-neutral-600'
                            : product.status === 'rejected'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-amber-100 text-amber-700'
                        }
                      `}
                    >
                      {product.status}
                    </span>

                  </Link>

                ))}

                <div className="pt-3 border-t">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/seller/products">
                      View All Products
                    </Link>
                  </Button>
                </div>

              </div>

            )}

          </CardContent>
        </Card>


        {/* COMPLIANCE */}
        <Card className="col-span-full lg:col-span-3 border-none shadow-md">
          <CardHeader>
            <CardTitle>Compliance & Health</CardTitle>
            <CardDescription>
              Verification status of your export documents
            </CardDescription>
          </CardHeader>

          <CardContent>

            <div className="space-y-6">

              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-neutral-900">
                    GST Certificate
                  </p>

                  <p className="text-xs text-neutral-500">
                    Verified & Active
                  </p>
                </div>

                <div className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Valid
                </div>
              </div>


              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-neutral-900">
                    IEC Code
                  </p>

                  <p className="text-xs text-neutral-500">
                    Verified for Exports
                  </p>
                </div>

                <div className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Valid
                </div>
              </div>

            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  )
}