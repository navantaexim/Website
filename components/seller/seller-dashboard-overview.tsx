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
}

export function SellerDashboardOverview({ seller }: DashboardOverviewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Seller Console</h1>
          <p className="text-neutral-500 mt-1">Global operations for <span className="text-primary font-semibold">{seller.legalName}</span></p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" asChild>
              <Link href="/seller/products">Manage Catalog</Link>
           </Button>
           <Button asChild className="shadow-lg shadow-primary/20">
              <Link href="/seller/products/new">
                <Package className="w-4 h-4 mr-2" /> List New Product
              </Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">₹0.00</div>
            <p className="text-xs text-neutral-400 mt-1">+0% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Active Products</CardTitle>
            <Package className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">0</div>
            <p className="text-xs text-neutral-400 mt-1">Ready for global export</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Pending Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">0</div>
            <p className="text-xs text-neutral-400 mt-1">Action required</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Global Reach</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">0</div>
            <p className="text-xs text-neutral-400 mt-1">Inquiries this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle>Market Performance</CardTitle>
            <CardDescription>Sales and inquiry trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed rounded-xl bg-neutral-50/50">
               <TrendingUp className="w-10 h-10 mb-2 opacity-20" />
               <p className="font-medium text-sm">Analytics will appear once you have sales data.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3 border-none shadow-md">
          <CardHeader>
            <CardTitle>Compliance & Health</CardTitle>
            <CardDescription>Verification status of your export documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900 truncate">GST Certificate</p>
                  <p className="text-xs text-neutral-500">Verified & Active</p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-tighter text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Valid</div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900 truncate">IEC Code</p>
                  <p className="text-xs text-neutral-500">Verified for Exports</p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-tighter text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Valid</div>
              </div>

              <div className="pt-4 border-t border-neutral-100 mt-2">
                 <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-900 mb-1">Export Ready!</p>
                    <p className="text-[11px] text-blue-700 leading-relaxed">Your profile meets all compliance requirements for international trade on Navanta Exim.</p>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
