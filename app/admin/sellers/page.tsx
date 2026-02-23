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
import { GraduationCap, Store, ArrowRight, User as UserIcon, Calendar } from 'lucide-react'

interface Seller {
  id: string
  legalName: string
  businessType: string
  yearEstablished: number
  status: string
  verificationStage: string
  createdAt: string
  users: Array<{
    user: {
      name: string
      email: string
    }
  }>
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSellers() {
      try {
        const response = await fetch('/api/admin/sellers/submitted')
        const data = await response.json()

        if (data.success) {
          setSellers(data.sellers)
        } else {
          setError(data.error || 'Failed to fetch sellers')
        }
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSellers()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner className="w-8 h-8 text-primary" />
        <p className="text-neutral-500 font-medium">Loading submitted profiles...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight">Seller Verification</h1>
        <p className="text-neutral-500 font-medium">Review and verify engineering manufacturers joining Navanta Exim.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-2xl shadow-neutral-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-neutral-100 pb-6 px-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Pending Submissions</CardTitle>
                <CardDescription>Sellers waiting for profile verification</CardDescription>
              </div>
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-bold bg-amber-50 text-amber-600 border-amber-200">
                {sellers.length} Profiles
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="p-12 text-center">
                <p className="text-red-500 font-bold text-lg mb-2">Error</p>
                <p className="text-neutral-500">{error}</p>
              </div>
            ) : sellers.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                  <Store className="w-8 h-8 text-neutral-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-neutral-900">All caught up!</h3>
                  <p className="text-neutral-500 max-w-xs mx-auto">There are currently no seller profiles waiting for verification.</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-neutral-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-4 pl-8 font-bold text-neutral-900">Merchant Details</TableHead>
                    <TableHead className="font-bold text-neutral-900">Type</TableHead>
                    <TableHead className="font-bold text-neutral-900">Primary Contact</TableHead>
                    <TableHead className="font-bold text-neutral-900">Submitted On</TableHead>
                    <TableHead className="font-bold text-neutral-900">Status</TableHead>
                    <TableHead className="pr-8 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((seller) => (
                    <TableRow key={seller.id} className="group transition-colors hover:bg-neutral-50">
                      <TableCell className="py-5 pl-8">
                        <div className="space-y-1">
                          <p className="font-bold text-neutral-900 group-hover:text-primary transition-colors">{seller.legalName}</p>
                          <p className="text-xs text-neutral-400 font-medium">ID: {seller.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-semibold text-neutral-600 border-neutral-200">
                          {seller.businessType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div className="text-xs">
                            <p className="font-bold text-neutral-900">{seller.users[0]?.user.name}</p>
                            <p className="text-neutral-400 font-medium">{seller.users[0]?.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-neutral-500">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {new Date(seller.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold px-3 py-1">
                          {seller.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8 whitespace-nowrap text-right">
                        <Link href={`/admin/sellers/${seller.id}`}>
                          <Button variant="ghost" size="sm" className="font-bold gap-2 text-neutral-600 hover:text-primary transition-all">
                            Review Profile
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
