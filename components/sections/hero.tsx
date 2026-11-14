'use client'

import Link from 'next/link'
import HeroCarousel from './herocarousel'

export default function Hero() {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-background via-background to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center md:items-center">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Global Market Access Partner Connecting Indian Engineering Manufacturers with Global Buyers.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We help Indian engineering manufacturers expand internationally through targeted buyer identification, B2B marketing, export
              development and strategic business partnerships.
            </p>
          </div>

          <HeroCarousel />
        </div>
      </div>
    </section>
  )
}
