'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, Store, ChevronRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
  capabilities: any
  exportProfile: any
  certificates: any[]
}

const steps: Step[] = [
  { id: 1, title: 'Business Details *', description: 'Tax & Legal Info' },
  { id: 2, title: 'Address *', description: 'Registered & Factory' },
  { id: 3, title: 'Documents *', description: 'GST, IEC, PAN' },
  { id: 4, title: 'Capabilities *', description: 'Manufacturing Info' },
  { id: 5, title: 'Export Profile *', description: 'Markets & Logistics' },
  { id: 6, title: 'Certifications *', description: 'ISO, API, etc.' },
  { id: 7, title: 'Review & Submit ', description: 'Final Check' },
]

const checkStepCompletion = (stepIndex: number, seller: any) => {
  if (!seller) return false;
  switch (stepIndex) {
    case 0:
      return !!(seller.legalName && seller.businessType && seller.yearEstablished && seller.gstNumber && seller.iecCode);
    case 1:
      const hasRegistered = seller.addresses?.some((a: any) => a.addressType === 'Registered');
      const hasFactory = seller.addresses?.some((a: any) => a.addressType === 'Factory/Operating');
      return !!(hasRegistered && hasFactory);
    case 2:
      return !!(seller.documents && seller.documents.length > 0);
    case 3:
      return !!(seller.capabilities?.manufacturerType && seller.capabilities?.employeeRange);
    case 4:
      return !!(seller.exportProfile?.annualTurnover && seller.exportProfile?.logisticsModes?.length > 0);
    case 5:
      return true; // Certifications are optional
    case 6:
      return false; // Final check isn't complete until submit
    default:
      return false;
  }
}

export default function SellerOnboardingPage() {
  const [seller, setSeller] = useState<Seller | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isStepValid, setIsStepValid] = useState(false)

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

  useEffect(() => {
    fetchSeller()
  }, [])

  useEffect(() => {
    if (seller) {
      setIsStepValid(checkStepCompletion(currentStepIndex, seller))
    } else {
      setIsStepValid(false)
    }
  }, [currentStepIndex, seller])

/**
 * FIX: redirect moved into useEffect
 * This avoids React hook errors
 */
useEffect(() => {
  if (seller?.status === 'verified' || seller?.status === 'active') {
    router.replace('/seller')
  }
}, [seller?.status, router])

  async function nextStep() {
  if (!seller) return
  // force refresh so latest saved data loads
  await fetchSeller()
  setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
}
  const prevStep = () => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))
  
  const progress = Math.round(((currentStepIndex) / steps.length) * 100)

  // const nextStep = () =>
  //   setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1))


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

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="max-w-md w-full border-muted-foreground/10 shadow-lg">

          <CardHeader className="text-center pb-2">

            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <Store className="h-10 w-10 text-primary" />
            </div>

            <CardTitle className="text-2xl font-bold">
              Become a Seller
            </CardTitle>

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
              <Link href="/seller/create">
                Create Seller Account
              </Link>
            </Button>
          </CardFooter>

        </Card>
      </div>
    )
  }

  if (seller.status === 'draft') {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground">
            Finish setting up your seller account to start listing products.
          </p>
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
                        {currentStepIndex === 0 && <SellerBasicInfoForm seller={seller} onValidityChange={setIsStepValid} onUpdate={fetchSeller} />}
                        {currentStepIndex === 1 && <SellerAddressSection seller={seller} onValidityChange={setIsStepValid} onUpdate={fetchSeller} />}
                        {currentStepIndex === 2 && <SellerDocumentSection seller={seller} onValidityChange={setIsStepValid} onUpdate={fetchSeller} />}
                        {currentStepIndex === 3 && <SellerManufacturingForm seller={seller} onValidityChange={setIsStepValid} onUpdate={fetchSeller} />}
                        {currentStepIndex === 4 && <SellerExportProfileForm seller={seller} onValidityChange={setIsStepValid} onUpdate={fetchSeller} />}
                        {currentStepIndex === 5 && <SellerCertificationForm seller={{...seller, certificates: seller.certificates || []}} onValidityChange={setIsStepValid} onUpdate={fetchSeller} />}
                        {currentStepIndex === 6 && <SellerReviewSection seller={seller} onValidityChange={setIsStepValid} onUpdate={fetchSeller} />}
                    </CardContent>
                     <CardFooter className="flex justify-between border-t p-6">
                        <Button variant="outline" onClick={prevStep} disabled={currentStepIndex === 0}>Back</Button>
                        <Button 
                            onClick={nextStep} 
                            disabled={!checkStepCompletion(currentStepIndex, seller)}
                        >
                            {currentStepIndex === steps.length - 1 ? 'Submit' : (
                                <>Continue <ChevronRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
          <div className="space-y-6">

            <Card>

              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">

                <div className="space-y-2">

                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>{progress}% Complete</span>
                    <span>{currentStepIndex + 1}/{steps.length} Steps</span>
                  </div>

                  <Progress value={progress} className="h-2" />

                </div>

                <Separator />

                <Stepper 
                  steps={steps} 
                  currentStep={currentStepIndex} 
                  onStepClick={(index) => {
                    // Only allow clicking to previous steps, or next steps if the previous ones are completed
                    if (index < currentStepIndex) {
                      setCurrentStepIndex(index);
                    } else if (index > currentStepIndex) {
                      // Check if all steps up to index - 1 are completed
                      let canAccess = true;
                      for (let i = 0; i < index; i++) {
                        if (!checkStepCompletion(i, seller)) {
                          canAccess = false;
                          break;
                        }
                      }
                      if (canAccess) {
                        setCurrentStepIndex(index);
                      }
                    }
                  }} 
                />

              </CardContent>

            </Card>

          </div>

        </div>

      </div>
    )
  }

  if (seller.status === 'submitted') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-lg w-full text-center p-6">
          <CardHeader>
            <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <CardTitle>Application Under Review</CardTitle>
            <CardDescription>
              Our team is reviewing your documents.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return null
}