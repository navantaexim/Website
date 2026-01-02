'use client'
import { motion } from 'framer-motion'

export default function WhyChoose() {
  const reasons = [
    {
      title: 'Industry-Specific Focus',
      description:
        'Built exclusively for engineering manufacturers and B2B industrial sectors.',
      icon: '🏭',
    },
    {
      title: 'AI-Driven Solutions',
      description:
        'Every feature is powered by intelligent automation and real-time insights.',
      icon: '⚡',
    },
    {
      title: 'Verified Global Network',
      description: 'Trusted access to verified buyers across 50+ countries.',
      icon: '🌐',
    },
    {
      title: 'One-Stop Growth Platform',
      description:
        'A complete ecosystem for marketing, sales, compliance, and scaling.',
      icon: '🎯',
    },
    {
      title: 'Cost Effective',
      description:
        'High ROI solutions designed to reduce operational and marketing costs.',
      icon: '💰',
    },
    {
      title: 'Performance-Driven Results',
      description:
        'Proven track record of delivering measurable growth and high-quality leads.',
      icon: '📈',
    },
  ]


  return (
    <section id="why-choose" className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      {/* Optimized Background - Removed heavy blur elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6 text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight"
        >
          Why Choose <span className="text-primary">Navanta Exim</span>?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4"
        >
          Five strong reasons why engineering manufacturers trust our platform
        </motion.p>
      </div>

      {/* Card Grid */}
      <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {reasons.map((reason, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="group relative"
          >
            {/* Simplified Card Background */}
            <div className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-blue-100 transition-all duration-300 group-hover:shadow-xl"></div>

            {/* Content */}
            <div className="relative p-8 rounded-3xl z-10">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-5">
                {reason.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition">
                {reason.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {reason.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
