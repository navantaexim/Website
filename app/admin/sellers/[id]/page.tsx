'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { 
  ArrowLeft, CheckCircle2, XCircle, FileText, MapPin, 
  Building2, Calendar, Globe, User as UserIcon, ShieldCheck, 
  Download, ExternalLink, Factory, Truck, Info, AlertTriangle, Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface SellerDetail {
  id: string
  legalName: string
  businessType: string
  yearEstablished: number
  gstNumber: string
  iecCode: string
  panNumber?: string
  cinOrLlpin?: string
  status: string
  verificationStage: string
  createdAt: string
  users: Array<{
    role: string
    designation: string
    user: {
      name: string
      email: string
      picture?: string
    }
  }>
  addresses: Array<{
    type: string
    addressLine: string
    city: string
    state: string
    country: string
    pincode: string
  }>
  documents: Array<{
    type: string
    documentUrl: string
    verified: boolean
  }>
  capabilities?: {
    manufacturerType: string
    factoryAreaSqm: number
    employeeRange: string
    inHouseQC: boolean
  }
  exportProfile?: {
    exportExperience: number
    annualTurnover: string
    logisticsModes: string[]
    markets: Array<{ country: { name: string } }>
    incoterms: Array<{ incoterm: { code: string } }>
    hsExpertise: Array<{ hsCode: string }>
  }
  certificates: Array<{
    type: string
    documentUrl?: string
    issuedBy?: string
    validTill?: string
  }>
}

export default function AdminSellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sellerId } = use(params)
  const router = useRouter()
  
  const [seller, setSeller] = useState<SellerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Modals
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [viewingFile, setViewingFile] = useState<string | null>(null)

  const handleViewDocument = async (path: string) => {
    if (!path || path.startsWith('http')) {
        if (path) window.open(path, '_blank')
        return
    }
    setViewingFile(path)
    try {
      const res = await fetch('/api/storage/sign-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, bucket: 'private-docs' })
      })
      if (!res.ok) throw new Error('Failed to get access')
      const { signedUrl } = await res.json()
      window.open(signedUrl, '_blank')
    } catch (error) {
      toast.error("Could not open document.")
    } finally {
      setViewingFile(null)
    }
  }

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await fetch(`/api/admin/sellers/${sellerId}`)
        const data = await response.json()
        if (data.success) {
          setSeller(data.seller)
        } else {
          toast.error(data.error || 'Failed to load seller details')
        }
      } catch (err) {
        toast.error('Connection error')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [sellerId])

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}/approve`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Seller approved successfully')
        router.push('/admin/sellers')
      } else {
        toast.error(data.error || 'Approval failed')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setActionLoading(false)
      setShowApproveDialog(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Seller profile rejected')
        router.push('/admin/sellers')
      } else {
        toast.error(data.error || 'Rejection failed')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setActionLoading(false)
      setShowRejectDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner className="w-12 h-12 text-primary" />
        <p className="text-neutral-500 font-bold animate-pulse">Loading meticulous profile data...</p>
      </div>
    )
  }

  if (!seller) return <div className="p-12 text-center text-neutral-500">Profile not found.</div>

  const isSubmitted = seller.status === 'submitted'

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
        <div className="space-y-2">
          <Link href="/admin/sellers" className="group flex items-center text-sm text-neutral-500 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Verification Queue
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">{seller.legalName}</h1>
            <Badge className="bg-amber-50 text-amber-600 border-amber-200 font-bold px-4 py-1">
              {seller.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-neutral-500 font-medium">Verification ID: <code className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">{seller.id}</code></p>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                className="font-bold text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Profile
            </Button>
            <Button 
                className="font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                onClick={() => setShowApproveDialog(true)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve Seller
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Core Profile */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Business Info */}
          <Card className="border-none shadow-xl shadow-neutral-200/50">
            <CardHeader className="border-b border-neutral-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl">Business Foundation</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Legal Name</label>
                  <p className="font-bold text-neutral-900 text-lg">{seller.legalName}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Business Type</label>
                  <p className="font-semibold text-neutral-700">{seller.businessType}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Year Established</label>
                  <p className="font-semibold text-neutral-700">{seller.yearEstablished}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">GST Number</label>
                  <p className="font-mono font-bold text-neutral-900">{seller.gstNumber}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">IEC Code</label>
                  <p className="font-mono font-bold text-neutral-900">{seller.iecCode}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">PAN Card</label>
                  <p className="font-mono font-bold text-neutral-900">{seller.panNumber || 'Not Provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure & Manufacturing */}
          {seller.capabilities && (
            <Card className="border-none shadow-xl shadow-neutral-200/50">
              <CardHeader className="border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Factory className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl">Manufacturing Capability</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Facility Type</label>
                  <p className="font-bold text-neutral-900 uppercase">{seller.capabilities.manufacturerType}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Factory Area</label>
                  <p className="font-bold text-neutral-900">{seller.capabilities.factoryAreaSqm.toLocaleString()} Sqm</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Workforce</label>
                  <p className="font-bold text-neutral-900">{seller.capabilities.employeeRange} Members</p>
                </div>
                <div>
                   <Badge variant={seller.capabilities.inHouseQC ? 'default' : 'secondary'} className={seller.capabilities.inHouseQC ? 'bg-green-50 text-green-700' : ''}>
                      {seller.capabilities.inHouseQC ? 'In-house QC Available' : 'No in-house QC'}
                   </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Strategy */}
          {seller.exportProfile && (
            <Card className="border-none shadow-xl shadow-neutral-200/50">
              <CardHeader className="border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                          <Globe className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl">Global Export Profile</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Export Experience</label>
                        <p className="font-bold text-neutral-900">{seller.exportProfile.exportExperience} Years</p>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Annual Turnover</label>
                        <p className="font-bold text-neutral-900">{seller.exportProfile.annualTurnover}</p>
                    </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Primary Target Markets</label>
                  <div className="flex flex-wrap gap-2">
                    {seller.exportProfile.markets.map((m, i) => (
                      <Badge key={i} variant="outline" className="bg-neutral-50 border-neutral-200 font-bold text-neutral-700">
                        {m.country.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center gap-3">
                        <Truck className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm font-bold text-neutral-600 uppercase tracking-wider">{seller.exportProfile.logisticsModes.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm font-bold text-neutral-600 uppercase tracking-wider">{seller.exportProfile.incoterms.map(i => i.incoterm.code).join(', ')}</span>
                    </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Compliance & Team */}
        <div className="space-y-8">
          
          {/* Document Verification */}
          <Card className="border-none shadow-xl shadow-neutral-200/50 bg-neutral-900 text-white">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-lg flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400" />
                Legal Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {seller.documents.map((doc, i) => (
                <div key={i} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-neutral-200 uppercase tracking-wider">{doc.type.replace('_', ' ')}</p>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">{doc.verified ? 'Verified' : 'Verification Required'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-neutral-400 hover:text-white"
                        onClick={() => handleViewDocument(doc.documentUrl)}
                        disabled={viewingFile === doc.documentUrl}
                    >
                        {viewingFile === doc.documentUrl ? (
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        ) : (
                            <ExternalLink className="w-4 h-4" />
                        )}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications */}
          {seller.certificates && seller.certificates.length > 0 && (
            <Card className="border-none shadow-xl shadow-neutral-200/50">
              <CardHeader className="border-b border-neutral-100">
                <CardTitle className="text-lg flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  Certifications & Awards
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {seller.certificates.map((cert, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-neutral-800 uppercase tracking-wider">{cert.type.replace('_', ' ')}</p>
                      {cert.issuedBy && <p className="text-[10px] text-neutral-500 font-bold uppercase">Issued by: {cert.issuedBy}</p>}
                      {cert.validTill && <p className="text-[10px] text-neutral-400 font-bold uppercase text-xs">Valid till: {new Date(cert.validTill).toLocaleDateString()}</p>}
                    </div>
                    {cert.documentUrl && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-neutral-400 hover:text-primary"
                        onClick={() => handleViewDocument(cert.documentUrl!)}
                        disabled={viewingFile === cert.documentUrl}
                      >
                        {viewingFile === cert.documentUrl ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ExternalLink className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Team / Owners */}
          <Card className="border-none shadow-xl shadow-neutral-200/50">
            <CardHeader className="border-b border-neutral-100">
                <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-neutral-400" />
                    <CardTitle className="text-lg">Primary Contacts</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {seller.users.map((link, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl border border-neutral-50">
                   <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold shrink-0">
                      {link.user.name.charAt(0)}
                   </div>
                   <div className="text-xs">
                      <p className="font-bold text-neutral-900">{link.user.name}</p>
                      <p className="text-neutral-500 mt-0.5">{link.designation}</p>
                      <p className="text-neutral-400 mt-1 italic">{link.user.email}</p>
                   </div>
                </div>
              ))}
            </CardContent>
          </Card>

           {/* Addresses */}
           <Card className="border-none shadow-xl shadow-neutral-200/50">
            <CardHeader className="border-b border-neutral-100">
                <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-neutral-400" />
                    <CardTitle className="text-lg">Office & Facilities</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {seller.addresses.map((addr, i) => (
                <div key={i} className="space-y-1 p-3 rounded-xl border border-neutral-50">
                  <Badge variant="outline" className="text-[9px] uppercase tracking-tighter mb-1 border-neutral-200 text-neutral-500">
                    {addr.type.replace('_', ' ')}
                  </Badge>
                  <p className="text-xs font-bold text-neutral-800 leading-relaxed">{addr.addressLine}</p>
                  <p className="text-xs text-neutral-500 font-medium">{addr.city}, {addr.state}, {addr.pincode}</p>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Approve Modal */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl">
          <DialogHeader className="items-center text-center py-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-neutral-900">Approve Merchant?</DialogTitle>
            <DialogDescription className="text-neutral-500 font-medium px-4">
              This will grant {seller.legalName} full seller access to the marketplace. Are you satisfied with the verification of their IEC and GST documents?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowApproveDialog(false)} className="font-bold">Cancel</Button>
            <Button 
                onClick={handleApprove} 
                className="bg-green-600 hover:bg-green-700 font-bold px-8"
                disabled={actionLoading}
            >
              {actionLoading ? <Spinner className="mr-2" /> : 'Confirm Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl">
          <DialogHeader className="py-2">
            <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <DialogTitle className="text-xl font-extrabold">Reject Submission</DialogTitle>
            </div>
            <DialogDescription className="text-neutral-500 font-medium">
              Please specify why this application is being rejected. This reason will be shared with the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
                placeholder="e.g. IEC certificate is expired or invalid. Please re-upload latest PDF." 
                className="min-h-[120px] rounded-xl border-neutral-200 focus:ring-red-100"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setShowRejectDialog(false)} className="font-bold">Nevermind</Button>
            <Button 
                onClick={handleReject} 
                className="bg-red-600 hover:bg-red-700 font-bold px-8 shadow-lg shadow-red-100"
                disabled={actionLoading}
            >
               {actionLoading ? <Spinner className="mr-2" /> : 'Reject Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
