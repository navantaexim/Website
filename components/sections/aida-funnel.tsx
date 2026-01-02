
'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function AIDAFunnel() {
  const stages = [
    {
      stage: 'Awareness',
      word: 'AWARENESS',
      title: 'Global Visibility',
      action: 'AI Ad Campaigns',
      description:
        'Reach qualified buyers worldwide with targeted AI-powered advertising',
    },
    {
      stage: 'Interest',
      word: 'INTEREST',
      title: 'Educate Buyers',
      action: 'Product Storytelling Videos',
      description:
        'Engage prospects with compelling AI-generated product narratives',
    },
    {
      stage: 'Desire',
      word: 'DESIRE',
      title: 'Create Demand',
      action: 'Data-driven Placement',
      description:
        'Position your products strategically for maximum market impact',
    },
    {
      stage: 'Action',
      word: 'ACTION',
      title: 'Drive Deals',
      action: 'Smart Lead Routing',
      description:
        'Close sales faster with intelligent lead management and follow-ups',
    },
  ]

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-r from-primary to-blue-700 text-white overflow-hidden">
      {/* Decorative uploaded image (floating) */}
      {/* Decorative uploaded image (floating) - REMOVED BROKEN LINK */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Specialized Performance:{' '}
            <span className="text-white/95">AIDA Funnel</span>
          </h2>
          <p className="mt-3 text-lg text-white/80 max-w-2xl mx-auto">
            Four strategic stages to convert prospects into loyal customers
          </p>
        </motion.div>

        {/* Animated cards container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-4 gap-6"
        >
          {stages.map((s, idx) => (
            <motion.div
              key={s.stage}
              variants={cardVariants}
              whileHover={{ scale: 1.03, translateY: -5 }}
              className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 cursor-default overflow-hidden transition-all duration-300 hover:bg-white/15 hover:shadow-xl"
            >
              {/* Upper row: prominent Stage word + number */}
              <div className="flex items-start justify-between">
                {/* Stage word */}
                <span
                  className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white"
                  style={{
                    // gradient text for punch
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0.98), rgba(255,255,255,0.85))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {s.stage.toUpperCase()}
                </span>

                <div className="text-3xl font-extrabold text-white/30">
                  {' '}
                  {idx + 1}{' '}
                </div>
              </div>

              {/* Title */}
              <h3 className="mt-4 text-xl md:text-2xl font-bold text-white">
                {s.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm md:text-base text-white/80 leading-relaxed min-h-[64px]">
                {s.description}
              </p>

              {/* Strategy highlighted */}
              {/* Strategy clean professional block */}
              <div className="mt-8 pt-4 border-t border-white/20">
                <span className="block text-sm md:text-base font-semibold tracking-wide text-white/90">
                  STRATEGY:
                  <span className="ml-2 font-semibold text-white text-[1.08rem] md:text-[1.12rem] leading-none">
                    {s.action}
                  </span>
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
