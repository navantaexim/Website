'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { 
  ArrowLeft, CheckCircle2, XCircle, FileText, 
  Package, Calendar, Tag, ShieldCheck, 
  Download, ExternalLink, Info, AlertTriangle,
  Layers, ShoppingCart, Award, Image as ImageIcon,
  PlayCircle, Globe, Loader2
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
import Image from 'next/image'

interface ProductDetail {
  id: string
  name: string
  status: string
  rejectionReason?: string
  createdAt: string
  category: { name: string }
  originCountry: { name: string }
  seller: {
    id: string
    legalName: string
    status: string
  }
  specs: {
    materialGrade: string
    dimensions: any
    weightKg: number
    tolerance: string
    surfaceFinish: string
    process: string
    drawingAvailable: boolean
  }
  commercial: {
    moq: number
    capacityPerMonth: number
    leadTimeDays: number
    packaging: string
    portOfDispatch: string
  }
  compliance: {
    inspectionType: string
    status: string
    standards: Array<{ standard: string }>
    certificates: Array<{
      type: string
      available: boolean
      issuedBy?: string
      documentUrl: string
    }>
  }
  media: Array<{
    type: string
    url: string
  }>
}

export default function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = use(params)
  const router = useRouter()
  
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Modals
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
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
        const response = await fetch(`/api/admin/products/${productId}`)
        const data = await response.json()
        if (data.success) {
          setProduct(data.product)
        } else {
          toast.error(data.error || 'Failed to load product details')
        }
      } catch (err) {
        toast.error('Connection error')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [productId])

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Product verified successfully')
        setProduct(prev => prev ? { ...prev, status: 'verified' } : null)
      } else {
        toast.error(data.error || 'Verification failed')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setActionLoading(false)
      setShowApproveDialog(false)
    }
  }

  const handleActivate = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/activate`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Product is now LIVE on marketplace')
        setProduct(prev => prev ? { ...prev, status: 'active' } : null)
      } else {
        toast.error(data.error || 'Activation failed')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setActionLoading(false)
      setShowActivateDialog(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Product rejected')
        setProduct(prev => prev ? { ...prev, status: 'rejected' } : null)
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
        <p className="text-neutral-500 font-bold animate-pulse">Gathering technical specifications...</p>
      </div>
    )
  }

  if (!product) return <div className="p-12 text-center text-neutral-500">Product listing not found.</div>

  const isSubmitted = product.status === 'submitted'
  const isVerified = product.status === 'verified'
  const isSellerVerified = product.seller.status === 'verified'

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4">
        <div className="space-y-2">
          <Link href="/admin/products" className="group flex items-center text-sm text-neutral-500 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Catalog Moderation
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight uppercase">{product.name}</h1>
            <Badge className={`font-bold px-4 py-1 ${
                product.status === 'submitted' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                product.status === 'verified' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                product.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' :
                'bg-red-50 text-red-600 border-red-200'
            }`}>
              {product.status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
             <span className="text-neutral-400 font-medium">By</span>
             <Link href={`/admin/sellers/${product.seller.id}`} className="font-bold text-neutral-700 hover:text-primary underline decoration-neutral-200 decoration-2 underline-offset-4">
                {product.seller.legalName}
             </Link>
             {!isSellerVerified && (
                 <Badge variant="outline" className="text-[10px] text-red-400 border-red-100 uppercase">Seller Unverified</Badge>
             )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSubmitted && (
            <>
              <Button 
                variant="outline" 
                className="font-bold text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                className="font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                onClick={() => setShowApproveDialog(true)}
                disabled={!isSellerVerified}
                title={!isSellerVerified ? "Verify seller first" : "Verify product"}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verify Specs
              </Button>
            </>
          )}

          {isVerified && (
            <Button 
              className="font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
              onClick={() => setShowActivateDialog(true)}
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Activate to Shop
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Component - Images & Specs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Media Gallery */}
          <Card className="border-none shadow-xl shadow-neutral-200/50 overflow-hidden">
             <CardHeader className="bg-neutral-50 border-b border-neutral-100 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-neutral-400" />
                    Visual Assets
                </CardTitle>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{product.media.length} Files</span>
             </CardHeader>
             <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {product.media.map((item, i) => (
                     <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 group border border-neutral-100">
                        <img 
                          src={item.url} 
                          alt={`Product media ${i}`} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2">
                           <Badge className="bg-black/60 backdrop-blur-md text-white text-[10px] border-none">
                              {item.type.toUpperCase()}
                           </Badge>
                        </div>
                        <a href={item.url} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg">
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                        </a>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card className="border-none shadow-xl shadow-neutral-200/50">
             <CardHeader className="border-b border-neutral-100">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-500" />
                    Engineering Specifications
                </CardTitle>
             </CardHeader>
             <CardContent className="py-6 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <div>
                      <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold block mb-1">Material Grade</label>
                      <p className="font-bold text-neutral-800">{product.specs.materialGrade}</p>
                   </div>
                   <div>
                      <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold block mb-1">Process</label>
                      <p className="font-bold text-neutral-800">{product.specs.process}</p>
                   </div>
                   <div>
                      <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold block mb-1">Surface Finish</label>
                      <p className="font-bold text-neutral-800">{product.specs.surfaceFinish}</p>
                   </div>
                   <div>
                      <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold block mb-1">Tolerance</label>
                      <p className="font-bold text-neutral-800">{product.specs.tolerance}</p>
                   </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <h4 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                         Dimensions ({product.specs.dimensions.unit || 'unit'})
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                         {Object.entries(product.specs.dimensions).map(([key, value]) => (
                            key !== 'unit' && (
                                <div key={key} className="flex justify-between py-1 border-b border-neutral-200/50 italic">
                                   <span className="text-neutral-400 capitalize">{key}</span>
                                   <span className="font-bold text-neutral-700">{String(value)}</span>
                                </div>
                            )
                         ))}
                      </div>
                   </div>
                   <div className="flex flex-col justify-center gap-4">
                      <div className="flex items-center justify-between text-sm">
                         <span className="text-neutral-500 font-medium">Weight per unit</span>
                         <span className="font-bold text-neutral-900">{product.specs.weightKg} KG</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                         <span className="text-neutral-500 font-medium">Technical Drawing</span>
                         <Badge variant={product.specs.drawingAvailable ? 'default' : 'secondary'} className={product.specs.drawingAvailable ? 'bg-green-50 text-green-700' : ''}>
                             {product.specs.drawingAvailable ? 'PROVIDED' : 'MISSING'}
                         </Badge>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Compliance & Certificates */}
          <Card className="border-none shadow-xl shadow-neutral-200/50 overflow-hidden">
             <CardHeader className="bg-neutral-900 text-white border-b border-white/10">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Compliance & Accreditation
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                   {product.compliance.standards.map((s, i) => (
                     <Badge key={i} className="bg-neutral-800 text-white border-none px-4 py-1 font-bold tracking-wider">
                        {s.standard}
                     </Badge>
                   ))}
                </div>

                <div className="grid gap-3">
                   {product.compliance.certificates.map((cert, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-white transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="p-2 bg-white rounded-lg border border-neutral-100">
                               <FileText className="w-5 h-5 text-neutral-400" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-neutral-900 uppercase">{cert.type.replace('_', ' ')}</p>
                              <p className="text-[10px] text-neutral-500 font-bold tracking-widest">ISSUED BY: {cert.issuedBy || 'N/A'}</p>
                           </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="font-bold text-primary gap-2"
                            onClick={() => handleViewDocument(cert.documentUrl)}
                            disabled={viewingFile === cert.documentUrl}
                        >
                           {viewingFile === cert.documentUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'VERIFY'}
                           <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column - Commercials & Status */}
        <div className="space-y-8">
           
           {/* Commercial Terms */}
           <Card className="border-none shadow-xl shadow-neutral-200/50">
             <CardHeader className="border-b border-neutral-100">
                <CardTitle className="text-lg flex items-center gap-2 text-neutral-400">
                    <ShoppingCart className="w-5 h-5" />
                    Commercial Strategy
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                         <span className="text-[10px] uppercase text-neutral-400 font-black">Minimum Order</span>
                         <p className="text-2xl font-extrabold text-neutral-900">{product.commercial.moq}</p>
                      </div>
                      <span className="text-xs font-bold text-neutral-400 mb-1 tracking-widest italic">UNITS</span>
                   </div>
                   
                   <div className="pt-4 border-t border-dotted border-neutral-200">
                      <div className="flex justify-between text-sm py-2">
                         <span className="text-neutral-500 font-bold">Supply Capacity</span>
                         <span className="font-black text-neutral-900">{product.commercial.capacityPerMonth} / Mo</span>
                      </div>
                      <div className="flex justify-between text-sm py-2">
                         <span className="text-neutral-500 font-bold">Prod. Lead Time</span>
                         <span className="font-black text-neutral-900">{product.commercial.leadTimeDays} Days</span>
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl space-y-3">
                   <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                         <p className="text-[10px] font-black text-blue-800 uppercase tracking-tighter">Port of Dispatch</p>
                         <p className="text-sm font-bold text-blue-900">{product.commercial.portOfDispatch}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <Package className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                         <p className="text-[10px] font-black text-blue-800 uppercase tracking-tighter">Packaging Type</p>
                         <p className="text-sm font-bold text-blue-900">{product.commercial.packaging}</p>
                      </div>
                   </div>
                </div>
             </CardContent>
           </Card>

           {/* Moderation History */}
           <Card className="border-none shadow-xl shadow-neutral-200/50 bg-neutral-50/50">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Audit Information</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 text-xs font-medium">
                <div className="flex justify-between">
                   <span className="text-neutral-400 italic">Listing Created</span>
                   <span className="text-neutral-700 font-bold">{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-neutral-400 italic">Origin Country</span>
                   <span className="text-neutral-700 font-bold uppercase tracking-widest">{product.originCountry.name}</span>
                </div>
                {product.rejectionReason && (
                   <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2 mb-1 text-red-600">
                         <AlertTriangle className="w-3 h-3" />
                         <span className="text-[10px] font-bold uppercase">Latest Rejection Reason</span>
                      </div>
                      <p className="text-red-700 leading-relaxed font-semibold">{product.rejectionReason}</p>
                   </div>
                )}
             </CardContent>
           </Card>
        </div>
      </div>

       {/* Approve Modal */}
       <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl">
          <DialogHeader className="items-center text-center py-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-neutral-900">Verify Checklist?</DialogTitle>
            <DialogDescription className="text-neutral-500 font-medium px-4">
              I have checked the material grades, MTC certificates, and engineering drawings for this listing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowApproveDialog(false)} className="font-bold text-neutral-400">Cancel Review</Button>
            <Button 
                onClick={handleApprove} 
                className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8"
                disabled={actionLoading}
            >
              {actionLoading ? <Spinner className="mr-2" /> : 'Confirm Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Modal */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl">
          <DialogHeader className="items-center text-center py-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <PlayCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-neutral-900">Push to Marketplace?</DialogTitle>
            <DialogDescription className="text-neutral-500 font-medium px-4">
              This will make "{product.name}" visible and purchasable by global buyers. Proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowActivateDialog(false)} className="font-bold text-neutral-400">Hold Back</Button>
            <Button 
                onClick={handleActivate} 
                className="bg-green-600 hover:bg-green-700 font-bold px-8 shadow-lg shadow-green-100"
                disabled={actionLoading}
            >
              {actionLoading ? <Spinner className="mr-2" /> : 'Publish Listing'}
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
                <DialogTitle className="text-xl font-extrabold">Reject Listing</DialogTitle>
            </div>
            <DialogDescription className="text-neutral-500 font-medium">
              Explain why this technical listing fails to meet Navanta Quality Standards.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
                placeholder="e.g. MTC certificate doesn't match the stated Material Grade. Surface finish photos are blurry." 
                className="min-h-[120px] rounded-xl border-neutral-200 focus:ring-red-100"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setShowRejectDialog(false)} className="font-bold text-neutral-400">Keep and Hub</Button>
            <Button 
                onClick={handleReject} 
                className="bg-red-600 hover:bg-red-700 font-bold px-8"
                disabled={actionLoading}
            >
               {actionLoading ? <Spinner className="mr-2" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
