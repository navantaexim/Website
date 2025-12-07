'use client'

import Link from 'next/link'

export default function Footer() {
  const footerLinks = [
    {
      title: 'Company',
      links: [
        { label: 'Home', href: '#hero' },
        { label: 'About Us', href: '#about' },
        { label: 'Solutions', href: '#solutions' },
        // { label: 'Careers', href: '#' },
        // { label: 'Blog', href: '#blogs' },
      ]
    },
    {
      title: 'Contact',
      links: [
        { label: 'Email Us', href: 'mailto:contact@navantaexim.com' },
        // { label: 'Support', href: '#' },
      ]
    },
    // {
    //   title: 'Product',
    //   links: [
    //     { label: 'Features', href: '#solutions' },
    //     { label: 'Pricing', href: '#' },
    //   ]
    // },
    // {
    //   title: 'Legal',
    //   links: [
    //     { label: 'Terms of Service', href: '#' },
    //     { label: 'Privacy Policy', href: '#' },
    //     { label: 'Cookie Policy', href: '#' },
    //   ]
    // }
  ]

  return (
    <footer className="bg-gradient-to-br from-primary to-accent text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-bold text-lg">Navanta Exim</span>
            </div>
            <p className="text-white/80 text-sm max-w-sm leading-relaxed">
              Connecting global manufacturers with verified buyers through
              intelligent automation. We simplify international trade for engineering businesses.
            </p>
            
            {/* Social Media Placeholders */}
            {/* <div className="flex gap-4 mt-6">
              <a href="#" className="text-white/70 hover:text-white transition">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
               <a href="#" className="text-white/70 hover:text-white transition">
                <span className="sr-only">YouTube</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.654a2 2 0 00-1.414-1.414C15.888 2 10 2 10 2s-5.888 0-8.201.24a2 2 0 00-1.414 1.414C0 5.967 0 10 0 10s0 4.033.385 6.346a2 2 0 001.414 1.414C4.112 18 10 18 10 18s5.888 0 8.201-.24a2 2 0 001.414-1.414C20 14.033 20 10 20 10s0-4.033-.385-6.346zM8 14V6l5.2 4-5.2 4z"/></svg>
              </a>
            </div> */}
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4 text-white/90">{section.title}</h4>
              <ul className="space-y-3 text-sm text-white/70">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <a
                      href={link.href}
                      className="hover:text-white transition scroll-smooth"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-white/60 mb-4 md:mb-0">
              © 2025 Navanta Exim. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
