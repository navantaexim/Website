'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, ShieldCheck, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UnderReviewProps {
  seller: {
    id: string
    legalName: string
  }
}

export function SellerUnderReview({ seller }: UnderReviewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="max-w-2xl w-full border-none shadow-2xl shadow-blue-200/20 overflow-hidden bg-white">
        <div className="h-2 bg-blue-500 w-full"></div>
        <CardHeader className="text-center pt-8">
          <div className="mx-auto bg-blue-50 p-4 rounded-3xl w-fit mb-6">
            <Clock className="h-10 w-10 text-blue-500" />
          </div>
          <CardTitle className="text-3xl font-black text-neutral-900 tracking-tight">Application Under Audit</CardTitle>
          <CardDescription className="text-base mt-2 font-medium">
            Verification in progress for <span className="text-neutral-900 font-bold">{seller.legalName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
           <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 italic">
                 <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Audit Details</p>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-neutral-500 font-medium">Ref ID</span>
                       <span className="text-xs font-bold text-neutral-900">{seller.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-neutral-500 font-medium">Priority</span>
                       <span className="text-[10px] font-black uppercase tracking-tighter bg-amber-100 text-amber-700 px-2 py-0.5 rounded">High</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-neutral-500 font-medium">ETA</span>
                       <span className="text-xs font-bold text-neutral-900">24-48 Hours</span>
                    </div>
                 </div>
              </div>
              
              <div className="flex flex-col justify-center space-y-4">
                 <div className="flex gap-3 hover:translate-x-1 transition-transform cursor-default">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-neutral-900 leading-tight">Documents Received</p>
                       <p className="text-[10px] text-neutral-500 mt-1 font-medium italic">GST, IEC, and PAN cards secured.</p>
                    </div>
                 </div>
                 <div className="flex gap-3 hover:translate-x-1 transition-transform cursor-default opacity-60">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                       <Mail className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-neutral-900 leading-tight">Verification Email</p>
                       <p className="text-[10px] text-neutral-500 mt-1 font-medium">Will be sent upon completion.</p>
                    </div>
                 </div>
              </div>
           </div>
        </CardContent>
        <CardFooter className="bg-neutral-50/50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-neutral-100">
           <p className="text-[11px] text-neutral-400 font-medium max-w-[280px] text-center sm:text-left leading-relaxed">
             Our team is cross-referencing your manufacturing capabilities with international export standards.
           </p>
           <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="font-bold flex-1 sm:flex-none">Support</Button>
              <Button size="sm" className="font-bold gap-2 flex-1 sm:flex-none" variant="outline" asChild>
                 <Link href="/seller/onboarding">
                   Update Profile <ArrowRight className="w-3.5 h-3.5" />
                 </Link>
              </Button>
           </div>
        </CardFooter>
      </Card>
      
      <p className="mt-8 text-xs font-bold text-neutral-400 uppercase tracking-[0.2em]">Navanta Compliance Engine v2.4</p>
    </div>
  )
}
