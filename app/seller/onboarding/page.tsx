'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, FileCheck, Store, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { SellerBasicInfoForm } from '@/components/seller/onboarding/seller-basic-info-form'
import { Step, Stepper } from '@/components/ui/stepper'
import { SellerAddressSection } from '@/components/seller/onboarding/seller-address-section'
import { SellerDocumentSection } from '@/components/seller/onboarding/seller-document-section'
import { SellerReviewSection } from '@/components/seller/onboarding/seller-review-section'
import { SellerManufacturingForm } from '@/components/seller/onboarding/seller-manufacturing-form'
import { SellerExportProfileForm } from '@/components/seller/onboarding/seller-export-profile-form'
import { SellerCertificationForm } from '@/components/seller/onboarding/seller-certification-form'

// Define the Seller type based on Prisma schema
interface Seller {
  id: string
  legalName: string
  status: string
  verificationStage: string
  businessType: string
  yearEstablished: number
  gstNumber: string
  iecCode: string
  addresses: any[]
  documents: any[]
  capabilities: any // Using specific types in sub-components
  exportProfile: any
  certificates: any[]
}

const steps: Step[] = [
  { id: 1, title: 'Business Details', description: 'Tax & Legal Info' },
  { id: 2, title: 'Address', description: 'Registered & Factory' },
  { id: 3, title: 'Documents', description: 'GST, IEC, PAN' },
  { id: 4, title: 'Capabilities', description: 'Manufacturing Info' },
  { id: 5, title: 'Export Profile', description: 'Markets & Logistics' },
  { id: 6, title: 'Certifications', description: 'ISO, API, etc.' },
  { id: 7, title: 'Review & Submit', description: 'Final Check' },
]

export default function SellerOnboardingPage() {
  const [seller, setSeller] = useState<Seller | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Moved hook to top level
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    async function fetchSeller() {
      try {
        const res = await fetch('/api/seller/me')
        if (res.status === 401) {
          window.location.href = '/login'
          return
        }
        if (!res.ok) throw new Error('Failed to fetch seller profile')
        
        const data = await res.json()
        setSeller(data.seller)
      } catch (err) {
        console.error(err)
        setError('Something went wrong while loading your profile.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSeller()
  }, [])

  const nextStep = () => setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))
  
  const progress = Math.round(((currentStepIndex) / steps.length) * 100)

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="grid gap-6">
           <Skeleton className="h-40 w-full" />
           <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-red-500 font-medium">{error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // 1. If no seller -> Show Create Seller button
  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="max-w-md w-full border-muted-foreground/10 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <Store className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Become a Seller</CardTitle>
            <CardDescription className="text-balance text-base mt-2">
              Start your journey with Navanta Exim. Create your seller profile to reach global markets.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Access verified international buyers</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Seamless export documentation support</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Secure payments and logistics</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-6">
            <Button asChild className="w-full text-lg h-12" size="lg">
              <Link href="/seller/create">Create Seller Account</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // 2. If seller.status="draft" -> Show Stepper UI
  if (seller.status === 'draft') {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">Finish setting up your seller account to start listing products.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            {/* Main Content Area */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{steps[currentStepIndex].title}</CardTitle>
                        <CardDescription>{steps[currentStepIndex].description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentStepIndex === 0 && <SellerBasicInfoForm seller={seller} />}
                        {currentStepIndex === 1 && <SellerAddressSection seller={seller} />}
                        {currentStepIndex === 2 && <SellerDocumentSection seller={seller} />}
                        {currentStepIndex === 3 && <SellerManufacturingForm seller={seller} />}
                        {currentStepIndex === 4 && <SellerExportProfileForm seller={seller} />}
                        {currentStepIndex === 5 && <SellerCertificationForm seller={{...seller, certificates: seller.certificates || []}} />}
                        {currentStepIndex === 6 && <SellerReviewSection seller={seller} />}
                    </CardContent>
                     <CardFooter className="flex justify-between border-t p-6">
                        <Button variant="outline" onClick={prevStep} disabled={currentStepIndex === 0}>Back</Button>
                        <Button onClick={nextStep} disabled={currentStepIndex === steps.length - 1}>
                            {currentStepIndex === steps.length - 1 ? 'Submit' : (
                                <>Continue <ChevronRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Sidebar Stepper */}
            <div className="space-y-6">
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                             <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>{progress}% Complete</span>
                                <span>{currentStepIndex + 1}/{steps.length} Steps</span>
                             </div>
                             <Progress value={progress} className="h-2" />
                        </div>

                        <Separator />
                        
                        {/* Reusable Stepper Component */}
                        <Stepper 
                            steps={steps} 
                            currentStep={currentStepIndex} 
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    )
  }

  // 3. If seller.status="submitted" -> Show "Under Review"
  if (seller.status === 'submitted') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-lg w-full text-center p-6 border-blue-100 dark:border-blue-900/50 shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full w-fit mb-4">
              <Clock className="h-12 w-12 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-blue-950 dark:text-blue-50">Application Under Review</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you for submitting your seller application. Our team is currently reviewing your documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Application ID</span>
                    <span className="font-mono">{seller.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted On</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Review</span>
                    <span className="font-medium">2-3 Business Days</span>
                </div>
             </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-6">
            <Button variant="outline" className="w-full" asChild>
                <Link href="/#contact">Contact Support</Link>
            </Button>
            <p className="text-xs text-muted-foreground">We will notify you via email once the verification is complete.</p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // 4. If seller.status="verified" -> Show dashboard placeholder
  if (seller.status === 'verified' || seller.status === 'active') {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {seller.legalName}</p>
            </div>
            <Button asChild>
                <Link href="/seller/products/new">Add New Product</Link>
            </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                    >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹0.00</div>
                    <p className="text-xs text-muted-foreground">+0% from last month</p>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">+0 new products</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                    >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">+0 since yesterday</p>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                    >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">+0 since last hour</p>
                </CardContent>
            </Card>
        </div>

        {/* Recent Activity / Empty State */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
             <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>You made 0 sales this month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md bg-muted/5">
                        No sales data available
                    </div>
                </CardContent>
             </Card>
             <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Compliance Status</CardTitle>
                    <CardDescription>Your documents are up to date.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                                <FileCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">GST Certificate</p>
                                <p className="text-xs text-muted-foreground">Verified on {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                                <FileCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">IEC Code</p>
                                <p className="text-xs text-muted-foreground">Verified on {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
             </Card>
        </div>
      </div>
    )
  }

  // Fallback for rejected or unknown status
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
       <Card className="max-w-md w-full border-red-200">
            <CardHeader>
                 <CardTitle className="text-red-600">Account Issue</CardTitle>
                 <CardDescription>Your account status is: <span className="font-semibold">{seller.status}</span></CardDescription>
            </CardHeader>
            <CardContent>
                Please contact support for assistance with your seller account.
            </CardContent>
            <CardFooter>
                 <Button variant="outline" className="w-full">Contact Support</Button>
            </CardFooter>
       </Card>
    </div>
  )
}
