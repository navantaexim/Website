'use client'

import { useState } from 'react'
import { Copy, Check, Mail } from 'lucide-react'

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const email = "contact@navantaexim.com"

  const handleCopy = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="contact" className="py-24 bg-blue-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-6">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Get in Touch
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Ready to take your engineering business global? We are here to help you every step of the way.
        </p>
        
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground mb-1">Direct Email</p>
            <a href={`mailto:${email}`} className="text-xl md:text-2xl font-semibold text-foreground hover:text-primary transition">
              {email}
            </a>
          </div>
          
          <div className="w-px h-12 bg-border hidden sm:block" />
          <div className="w-full h-px bg-border sm:hidden" />
          
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition font-medium"
            title="Copy email address"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
