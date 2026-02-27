'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Store, 
  Package, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DashboardStats {
  totalSellers: number
  pendingSellers: number
  totalProducts: number
  pendingProducts: number
  totalUsers: number
}

interface RecentSeller {
  id: string
  legalName: string
  status: string
  createdAt: string
  users: Array<{
    user: {
      name: string
      email: string
    }
  }>
}

interface RecentProduct {
  id: string
  name: string
  status: string
  createdAt: string
  seller: {
    legalName: string
  }
  category: {
    name: string
  }
}

interface RecentLog {
  id: string
  action: string
  entityType: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentSellers, setRecentSellers] = useState<RecentSeller[]>([])
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/admin/dashboard/stats')
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
          setRecentSellers(data.recentSellers)
          setRecentProducts(data.recentProducts)
          setRecentLogs(data.recentLogs || [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner className="w-10 h-10 text-primary" />
        <p className="text-neutral-500 font-medium animate-pulse">Initializing Command Center...</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Sellers',
      value: stats?.totalSellers || 0,
      icon: Store,
      color: 'bg-blue-500',
      description: 'Registered engineering partners',
      trend: '+12% from last month'
    },
    {
      title: 'Active Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-indigo-500',
      description: 'SKUs across all categories',
      trend: '+5% from last month'
    },
    {
      title: 'Pending Reviews',
      value: (stats?.pendingSellers || 0) + (stats?.pendingProducts || 0),
      icon: Clock,
      color: 'bg-amber-500',
      description: 'Awaiting verification',
      trend: stats?.pendingSellers ? `${stats.pendingSellers} sellers, ${stats.pendingProducts} products` : 'All clear'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-emerald-500',
      description: 'Platform members',
      trend: 'New registrations daily'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-neutral-500 mt-2 text-lg font-medium">Global Trade & Verification Control Tower</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="font-bold border-2 hover:bg-neutral-50 whitespace-nowrap">
                <FileText className="w-4 h-4 mr-2" /> Export Reports
            </Button>
            <Button className="font-bold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xl shadow-neutral-200">
                Refresh Data
            </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="group relative overflow-hidden border-none shadow-2xl shadow-neutral-200/40 bg-white hover:shadow-primary/10 transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${stat.color}`}></div>
            <CardHeader className="pb-2">
               <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${stat.color} text-white shadow-lg`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
               </div>
            </CardHeader>
            <CardContent>
               <div className="text-3xl font-black text-neutral-900">{stat.value}</div>
               <p className="text-sm font-bold text-neutral-500 mt-1">{stat.title}</p>
               <div className="mt-4 flex flex-col gap-1 border-t border-neutral-50 pt-4">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">{stat.description}</span>
                  <span className="text-xs font-semibold text-neutral-600">{stat.trend}</span>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column - Submissions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Seller Submissions */}
          <Card className="border-none shadow-2xl shadow-neutral-200/40 bg-white/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100/50 pb-6 px-8">
               <div>
                  <CardTitle className="text-xl font-bold">Recent Seller Applications</CardTitle>
                  <CardDescription className="text-sm font-medium">Manufacturers awaiting verification</CardDescription>
               </div>
               <Link href="/admin/sellers">
                  <Button variant="ghost" size="sm" className="font-bold group">
                    View All <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </Link>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                  <TableHeader className="bg-neutral-50/50">
                    <TableRow>
                      <TableHead className="pl-8 font-bold">Company</TableHead>
                      <TableHead className="font-bold">Contact</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="pr-8 text-right font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSellers.map((seller) => (
                      <TableRow key={seller.id} className="group hover:bg-neutral-50/50 transition-colors">
                        <TableCell className="pl-8 py-4">
                          <div className="flex flex-col">
                             <span className="font-bold text-neutral-900 group-hover:text-primary transition-colors">{seller.legalName}</span>
                             <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">ID: {seller.id.slice(0,8)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="text-xs">
                             <p className="font-bold text-neutral-800">{seller.users[0]?.user.name}</p>
                             <p className="text-neutral-500">{seller.users[0]?.user.email}</p>
                           </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${
                            seller.status === 'submitted' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            seller.status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-neutral-50 text-neutral-600'
                          } font-bold px-3 py-1`}>
                            {seller.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <Link href={`/admin/sellers/${seller.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
               </Table>
            </CardContent>
          </Card>

          {/* Product Submissions */}
          <Card className="border-none shadow-2xl shadow-neutral-200/40 bg-white/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-100/50 pb-6 px-8">
               <div>
                  <CardTitle className="text-xl font-bold">Product Listing Feed</CardTitle>
                  <CardDescription className="text-sm font-medium">New engineering components for review</CardDescription>
               </div>
               <Link href="/admin/products">
                  <Button variant="ghost" size="sm" className="font-bold group">
                    View All <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </Link>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                  <TableHeader className="bg-neutral-50/50">
                    <TableRow>
                      <TableHead className="pl-8 font-bold">Product</TableHead>
                      <TableHead className="font-bold">Seller</TableHead>
                      <TableHead className="font-bold">Category</TableHead>
                      <TableHead className="pr-8 text-right font-bold">Review</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentProducts.map((product) => (
                      <TableRow key={product.id} className="group hover:bg-neutral-50/50 transition-colors">
                        <TableCell className="pl-8 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <Package className="w-4 h-4" />
                             </div>
                             <span className="font-bold text-neutral-900">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <span className="text-sm font-semibold text-neutral-600">{product.seller.legalName}</span>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="text-[10px] font-bold uppercase border-neutral-200 text-neutral-500">
                              {product.category.name}
                           </Badge>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <Link href={`/admin/products/${product.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - System Health & Shortcuts */}
        <div className="space-y-8">
           
           {/* Review Progress */}
           <Card className="border-none shadow-2xl shadow-neutral-200/40 bg-neutral-900 text-white overflow-hidden">
             <CardHeader>
                <CardTitle className="text-lg">Audit Backlog</CardTitle>
                <CardDescription className="text-neutral-400">Current workload distribution</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-neutral-500">
                      <span>Seller Verification</span>
                      <span>{stats?.pendingSellers || 0} Open</span>
                   </div>
                   <div className="h-1.5 w-full bg-neutral-800 rounded-full">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: stats?.pendingSellers ? `${Math.min(stats.pendingSellers * 10, 100)}%` : '0%' }}></div>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-neutral-500">
                      <span>Product Audits</span>
                      <span>{stats?.pendingProducts || 0} Open</span>
                   </div>
                   <div className="h-1.5 w-full bg-neutral-800 rounded-full">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: stats?.pendingProducts ? `${Math.min(stats.pendingProducts * 5, 100)}%` : '0%' }}></div>
                   </div>
                </div>
                <div className="pt-4 flex items-center gap-3 text-emerald-400 bg-emerald-400/10 p-4 rounded-xl border border-emerald-400/20">
                   <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                   <p className="text-sm font-bold leading-tight">System Secure & Syncing Real-time</p>
                </div>
             </CardContent>
           </Card>

           {/* Recent Activity */}
           <Card className="border-none shadow-2xl shadow-neutral-200/40 bg-white">
             <CardHeader className="pb-3 px-6">
                <CardTitle className="text-lg">System Activity</CardTitle>
             </CardHeader>
             <CardContent className="px-6 pb-6">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No recent activity logs.</p>
                ) : (
                  <div className="space-y-5">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="flex gap-3 relative">
                         <div className="w-[2px] bg-neutral-100 absolute left-[15px] top-8 bottom-[-20px] last:hidden"></div>
                         <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100 relative z-10">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-neutral-800">{log.action.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">On {log.entityType}</span>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] text-neutral-500 font-medium">{log.user?.name || 'System'}</span>
                               <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                               <span className="text-[10px] text-neutral-400">
                                 {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </CardContent>
           </Card>

           {/* Quick Actions */}
           <Card className="border-none shadow-2xl shadow-neutral-200/40 bg-white">
              <CardHeader>
                 <CardTitle className="text-lg">Platform Management</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                 <Link href="/admin/sellers" className="flex items-center justify-between p-4 rounded-xl border-2 border-neutral-50 hover:border-primary/20 hover:bg-neutral-50 transition-all group">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <Store className="w-4 h-4" />
                       </div>
                       <span className="font-bold text-neutral-700">Verify Sellers</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary transition-colors" />
                 </Link>
                 <Link href="/admin/products" className="flex items-center justify-between p-4 rounded-xl border-2 border-neutral-50 hover:border-primary/20 hover:bg-neutral-50 transition-all group">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Package className="w-4 h-4" />
                       </div>
                       <span className="font-bold text-neutral-700">Moderate Catalog</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary transition-colors" />
                 </Link>
                 <div className="flex items-center justify-between p-4 rounded-xl border-2 border-neutral-50 opacity-40 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                          <AlertCircle className="w-4 h-4" />
                       </div>
                       <span className="font-bold text-neutral-700">Dispute Center</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Beta</Badge>
                 </div>
              </CardContent>
           </Card>

           {/* System Alert */}
           <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                 <AlertCircle className="w-12 h-12 text-amber-600" />
              </div>
              <h4 className="font-black text-amber-900 tracking-tight">Security Protocol</h4>
              <p className="text-xs text-amber-700 font-bold mt-2 leading-relaxed">Ensure all Manufacturer documents (IEC, GST, PAN) are cross-verified with government portals before approval.</p>
           </div>
        </div>

      </div>
    </div>
  )
}
