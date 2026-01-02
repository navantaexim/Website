'use client'

import Link from 'next/link'

export default function Communities() {
  const locations = [
    { region: "North America", cities: ["New York, NY", "Los Angeles, CA", "Toronto, CA"], count: "15,000+" },
    { region: "Europe", cities: ["London, UK", "Berlin, DE", "Paris, FR"], count: "25,000+" },
    { region: "Asia Pacific", cities: ["Mumbai, IN", "Singapore", "Tokyo, JP"], count: "35,000+" },
    { region: "Middle East", cities: ["Dubai, UAE", "Riyadh, SA", "Tel Aviv, IL"], count: "8,000+" },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-background to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Connected Communities Around the World
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thousands of engineering manufacturers are already networking on Navanta Exim
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {locations.map((location, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-primary mb-3">{location.region}</h3>
              <div className="space-y-2 mb-4">
                {location.cities.map((city) => (
                  <p key={city} className="text-sm text-muted-foreground">{city}</p>
                ))}
              </div>
              <p className="text-2xl font-bold text-foreground">{location.count} active</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-lg border border-primary/20 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Join?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Connect with engineering manufacturers and buyers globally. Start your international growth journey today.
          </p>
          <Link href="/signup" className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition">
            Take Me to Your Community
          </Link>
        </div>
      </div>
    </section>
  )
}
