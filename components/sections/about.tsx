export default function About() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6 text-center">
            About Navanta Exim
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-center">
            Navanta EXIM is a global market access partner helping Indian
            engineering manufacturers identify international business
            opportunities and establish connections with relevant global buyers.
            Through targeted B2B marketing, market research, export development
            and strategic partnerships, we help manufacturers build a pathway to
            sustainable international growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-muted/50 p-8 rounded-xl">
            <h3 className="text-xl font-semibold text-primary mb-4">
              Our Vision
            </h3>
            <p className="text-foreground leading-relaxed">
              Make Indian engineering manufacturers globally accessible,
              competitive and recognised as trusted partners in international
              markets.
            </p>
          </div>

          <div className="bg-muted/50 p-8 rounded-xl">
            <h3 className="text-xl font-semibold text-primary mb-4">
              Our Mission
            </h3>
            <p className="text-foreground leading-relaxed">
              Empower Indian engineering manufacturers to expand into global
              markets through targeted buyer identification, strategic B2B
              marketing, export development and international business
              partnerships.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
