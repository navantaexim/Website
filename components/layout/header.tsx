'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
  }

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Why Choose Us', href: '#why-choose' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'Contact Us', href: '#contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/navantalogo.jpg"
            alt="Navanta Exim Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="font-bold text-lg text-foreground">
            Navanta Exim
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition scroll-smooth"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-primary hover:text-primary/80 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-primary hover:text-primary/80 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-base font-medium text-muted-foreground hover:text-primary transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 mt-2 border-t border-border">
              <a
                href="#contact"
                className="block w-full text-center text-sm font-medium bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </a>
            </div>

            {/* Mobile Auth - Commented out */}
            {/* <div className="pt-3 border-t border-border space-y-2">
              {loading ? (
                <div className="w-full h-8 bg-gray-200 rounded animate-pulse" />
              ) : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block text-sm font-medium text-primary hover:text-primary/80"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-sm font-medium text-primary hover:text-primary/80"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full text-center text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div> */}
          </div>
        </div>
      )}
    </header>
  )
}
