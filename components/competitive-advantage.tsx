export default function CompetitiveAdvantage() {
  const advantages = [
    {
      title: "AI-Driven Lead Generation",
      description: "Smart algorithms identify and qualify high-potential buyers matching your products and business goals.",
      icon: "🤖"
    },
    {
      title: "Smart Digital Campaigns & AI Video Promotion",
      description: "Automated campaign creation with AI-generated product storytelling videos that engage and convert.",
      icon: "📹"
    },
    {
      title: "Educate. Export. Expand.",
      description: "Comprehensive resources to educate buyers, streamline exports, and scale your global business.",
      icon: "📈"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Make Marketing Your Competitive Advantage</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three powerful tools to dominate your market and accelerate growth
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {advantages.map((advantage, idx) => (
            <div key={idx} className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-border hover:shadow-lg transition">
              <div className="text-5xl mb-4">{advantage.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{advantage.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
