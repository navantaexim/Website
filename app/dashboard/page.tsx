'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Image from 'next/image'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {user.displayName || user.email}!</h1>
          <p className="text-muted-foreground mb-6">You're now logged into Navanta Exim.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Your Profile</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage your account settings and preferences</p>
              <button className="text-sm font-medium text-primary hover:text-primary/80">Edit Profile →</button>
            </div>
            
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Your Network</h3>
              <p className="text-sm text-muted-foreground mb-4">Connect with verified global buyers</p>
              <button className="text-sm font-medium text-primary hover:text-primary/80">View Network →</button>
            </div>  */}
            
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Resources</h3>
              <p className="text-sm text-muted-foreground mb-4">Access guides and learning materials</p>
              <Link href="/blogs" className="text-sm font-medium text-primary hover:text-primary/80">
                Explore Resources →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
