export default function About() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6 text-center">
            About Navanta Exim
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-center">
            Empowering global trade with intelligent AI-driven technology,
            trusted networks, and seamless export-import solutions designed for
            engineering manufacturers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-muted/50 p-8 rounded-xl">
            <h3 className="text-xl font-semibold text-primary mb-4">
              Our Vision
            </h3>
            <p className="text-foreground leading-relaxed">
              To build a trusted, AI-powered global platform that makes
              export-import simple, transparent, and efficient for engineering
              manufacturers, while equipping them with the right knowledge to
              grow confidently in international markets.
            </p>
          </div>

          <div className="bg-muted/50 p-8 rounded-xl">
            <h3 className="text-xl font-semibold text-primary mb-4">
              Our Mission
            </h3>
            <p className="text-foreground leading-relaxed">
              To solve real industry challenges — not just digitize them — by
              continuously innovating through AI-driven insights, industry
              feedback, and advanced technology. We aim to eliminate the
              operational barriers engineering companies face and empower them
              with practical, scalable solutions.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
