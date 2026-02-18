'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Store, ShoppingBag, BookOpen, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sellerStatus, setSellerStatus] = useState<string | null>(null)
  const [checkingSeller, setCheckingSeller] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
        // Check if user is a seller
        fetch('/api/seller/me')
            .then(res => res.json())
            .then(data => {
                if (data.seller) {
                    setSellerStatus(data.seller.status)
                }
            })
            .catch(err => console.error(err))
            .finally(() => setCheckingSeller(false))
    }
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back, {user.displayName || user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Seller Card */}
            <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <div className="mb-2 w-fit p-2 bg-primary/10 rounded-full">
                        <Store className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Seller Center</CardTitle>
                    <CardDescription>
                        {checkingSeller 
                            ? "Loading status..." 
                            : sellerStatus 
                                ? "Manage your products and orders" 
                                : "Start selling your products globally"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sellerStatus ? (
                         <div className="text-sm text-muted-foreground">
                            Account Status: <span className="font-medium capitalize text-foreground">{sellerStatus}</span>
                         </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            Join verified sellers network.
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href={sellerStatus === 'active' || sellerStatus === 'verified' ? "/seller/products" : "/seller/onboarding"}>
                            {sellerStatus ? "Go to Dashboard" : "Register as Seller"}
                        </Link>
                    </Button>
                </CardFooter>
            </Card>

            {/* Buyer/Sourcing Card (Future) */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
                 <CardHeader>
                    <div className="mb-2 w-fit p-2 bg-orange-100 rounded-full">
                        <ShoppingBag className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle>Sourcing</CardTitle>
                    <CardDescription>Find products and suppliers.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground">Browse categories and post requirements.</p>
                </CardContent>
                <CardFooter>
                     <Button variant="secondary" className="w-full" disabled>Coming Soon</Button>
                </CardFooter>
            </Card>

            {/* Resources Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
                 <CardHeader>
                    <div className="mb-2 w-fit p-2 bg-blue-100 rounded-full">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Resources</CardTitle>
                    <CardDescription>Guides and export documentation.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-sm text-muted-foreground">Learn about trade policies.</p>
                </CardContent>
                <CardFooter>
                     <Button variant="outline" asChild className="w-full">
                         <Link href="/blogs">View Articles</Link>
                     </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  )
}
