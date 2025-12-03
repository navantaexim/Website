'use client'

import Link from 'next/link'

export default function LearningSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Learning & Resources
        </h2>

        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Deep insights, export knowledge, and strategies to grow globally.
        </p>

        {/* CTA Box */}
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-3xl mx-auto border border-blue-100">
          <h3 className="text-2xl font-semibold text-primary mb-4">
            Explore expert-written guides on Export, Import & AI-driven Growth
          </h3>

          <p className="text-muted-foreground mb-8">
            Stay ahead with valuable articles designed to help engineering
            manufacturers scale globally.
          </p>

          <Link
            href="/blogs"
            className="inline-block bg-primary text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-primary/90 transition"
          >
            View All Resources →
          </Link>
        </div>
      </div>
    </section>
  )
}
