"use client"

import Logo from "@/components/common/logo"
import { useAuth } from "@/providers/auth-provider"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Menu, X } from "lucide-react"

export default function Header() {

    const { user, loading } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const handleLogout = async () => {
        await signOut(auth)
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <header className="border-b border-slate-200">

            {/* 🔹 Top Bar */}
            <div className="bg-gradient-to-r from-blue-50 via-white to-cyan-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

                    {/* Left */}
                    <div className="flex items-center gap-3">
                        <Logo />
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        >
                            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {loading && (
                            <span className="text-sm text-slate-500">
                                Loading...
                            </span>
                        )}

                        {!loading && !user && (
                            <Link
                                href="/login"
                                className="hidden md:inline px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                Login
                            </Link>
                        )}

                        {!loading && user && (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    <img
                                        src={
                                            (user as any).picture ||
                                            `https://ui-avatars.com/api/?name=${user.email}`
                                        }
                                        alt="profile"
                                        className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border"
                                    />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-3 w-48 bg-white border rounded-md shadow-lg overflow-hidden">

                                        <div className="px-4 py-2 text-xs text-slate-500 border-b">
                                            {user.email}
                                        </div>

                                        <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-slate-100">
                                            Dashboard
                                        </Link>

                                        <Link href="/products" className="block px-4 py-2 text-sm hover:bg-slate-100">
                                            My Products
                                        </Link>

                                        <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-slate-100">
                                            Orders
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 border-t"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔹 Desktop Navigation */}
            <div className="hidden md:block bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-center">

                    <nav className="flex items-center gap-8 text-sm font-medium">

                        <Link href="/" className="hover:text-blue-200 transition">Home</Link>
                        <Link href="/marketplace" className="hover:text-blue-200 transition">Marketplace</Link>
                        <Link href="/blogs" className="hover:text-blue-200 transition">Trade Insights</Link>
                        <Link href="/seller" className="hover:text-blue-200 transition">For Suppliers</Link>
                        <Link href="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>

                    </nav>
                </div>
            </div>

            {/* 🔹 Mobile Navigation */}
            {mobileNavOpen && (
                <div className="md:hidden bg-blue-600 text-white px-4 py-4 space-y-3">

                    <Link href="/" className="block">Home</Link>
                    <Link href="/marketplace" className="block">Marketplace</Link>
                    <Link href="/blogs" className="block">Trade Insights</Link>
                    <Link href="/seller" className="block">For Suppliers</Link>
                    <Link href="/dashboard" className="block">Dashboard</Link>

                    {!user && (
                        <Link
                            href="/login"
                            className="block mt-2 bg-white text-blue-600 px-3 py-2 rounded-md text-center"
                        >
                            Login
                        </Link>
                    )}

                </div>
            )}

        </header>
    )
}