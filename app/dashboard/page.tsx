'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Store, ShoppingBag, BookOpen, LogOut, Loader2, User as UserIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { SellerUnderReview } from '@/components/seller/seller-under-review'

interface Seller {
  id: string
  legalName: string
  status: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [checkingSeller, setCheckingSeller] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Check Admin
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.user?.role === 'admin') {
            router.push('/admin')
          }
        })
        .catch(err => console.error(err))

      // Check Seller Status
      fetch('/api/seller/me')
        .then(res => res.json())
        .then(data => {
          if (data.seller) {
            setSeller(data.seller)
          }
        })
        .catch(err => console.error(err))
        .finally(() => setCheckingSeller(false))
    }
  }, [user, router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  if (loading || checkingSeller) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest animate-pulse">
          Synchronizing Workspace...
        </p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // --- Under Review View ---
  if (seller?.status === 'submitted') {
    return (
      <div className="min-h-screen bg-[#F8F9FC] p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <SellerUnderReview seller={seller} />
        </div>
      </div>
    )
  }

  // --- Default Dashboard ---
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12">

        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-3xl bg-white shadow-xl shadow-neutral-200/50 flex items-center justify-center border border-neutral-100 overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=0D0D0D&color=fff`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
                Personal Dashboard
              </h1>
              <p className="text-neutral-500 font-medium">
                Verified Account:
                <span className="text-neutral-900 font-bold italic"> {user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="font-bold border-2 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {/* Seller Card */}
          <Card className="group border-none shadow-2xl shadow-neutral-200/50 bg-white hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/10 group-hover:bg-primary transition-colors"></div>

            <CardHeader className="pb-4">
              <div className="mb-4 w-fit p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Store className="h-6 w-6 text-primary" />
              </div>

              <CardTitle className="text-2xl font-black text-neutral-900">
                Seller Center
              </CardTitle>

              <CardDescription className="text-neutral-500 font-medium leading-relaxed">
                {seller?.status === 'draft'
                  ? "Resume your onboarding to start exporting globally"
                  : "Launch your manufacturing business on the global stage."}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              {seller?.status === 'draft' ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-tight">
                    Draft Profile
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Open for registration
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4 pb-8">
              <Button
                asChild
                className="w-full rounded-2xl h-14 text-base font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Link href={seller ? "/seller" : "/seller/onboarding"}>
                  {seller ? "Open Seller Center" : "Register as Seller"}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Buyer/Sourcing Card */}
          <Card className="border-none shadow-2xl shadow-neutral-200/50 bg-white flex flex-col group opacity-90 grayscale hover:grayscale-0 transition-all duration-500">
            <CardHeader className="pb-4">
              <div className="mb-4 w-fit p-3 bg-orange-100 rounded-2xl group-hover:bg-orange-600 transition-colors">
                <ShoppingBag className="h-6 w-6 text-orange-600 group-hover:text-white transition-colors" />
              </div>

              <CardTitle className="text-2xl font-black text-neutral-900">
                Sourcing
              </CardTitle>

              <CardDescription className="text-neutral-500 font-medium">
                Find custom engineering components and specialized manufacturers.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Global Supply Chain
              </p>
            </CardContent>

            <CardFooter className="pt-4 pb-8">
              <Button
                variant="secondary"
                className="w-full rounded-2xl h-14 text-base font-black bg-neutral-100 text-neutral-500 cursor-not-allowed"
              >
                Coming Soon
              </Button>
            </CardFooter>
          </Card>

          {/* Resources Card */}
          <Card className="border-none shadow-2xl shadow-neutral-200/50 bg-white flex flex-col group">
            <CardHeader className="pb-4">
              <div className="mb-4 w-fit p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors">
                <BookOpen className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
              </div>

              <CardTitle className="text-2xl font-black text-neutral-900">
                Exprot & Import Guides
              </CardTitle>

              <CardDescription className="text-neutral-500 font-medium">
                Export guides, trade policies, and HS code lookups.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="flex gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-100 px-2 py-1 rounded">
                  Logistics
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-100 px-2 py-1 rounded">
                  Regulations
                </span>
              </div>
            </CardContent>

            <CardFooter className="pt-4 pb-8">
              <Button
                variant="outline"
                asChild
                className="w-full rounded-2xl h-14 text-base font-black border-2 hover:bg-neutral-50 transition-all"
              >
                <Link href="/blogs">Exim Learning</Link>
              </Button>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  )
}