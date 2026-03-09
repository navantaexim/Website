"use client"

import Logo from "@/components/common/logo"
import SearchBar from "./search-bar"
import { useAuth } from "@/providers/auth-provider"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function Header() {
    const { user, loading } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const handleLogout = async () => {
        await signOut(auth)
    }

    // Close dropdown when clicking outside
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
        <header className="bg-white border-b border-slate-200">

            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-8">

                {/* Logo */}
                <Logo />

                {/* Search */}
                <div className="flex-1 flex justify-center">
                    <div className="w-full max-w-2xl">
                        <SearchBar />
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">

                    {/* Loading */}
                    {loading && (
                        <span className="text-sm text-slate-500">
                            Loading...
                        </span>
                    )}

                    {/* Logged Out */}
                    {!loading && !user && (
                        <Link
                            href="/login"
                            className="px-5 py-2 text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-100"
                        >
                            Login
                        </Link>
                    )}

                    {/* Logged In */}
                    {!loading && user && (
                        <div className="relative" ref={menuRef}>

                            {/* Avatar Button */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center"
                            >
                                <img
                                    src={
                                        user.picture ||
                                        `https://ui-avatars.com/api/?name=${user.email}&background=random`
                                    }
                                    alt="profile"
                                    className="w-9 h-9 rounded-full object-cover border"
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {menuOpen && (
                                <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">

                                    <div className="px-4 py-2 text-xs text-slate-500 border-b">
                                        {user.email}
                                    </div>

                                    <Link
                                        href="/dashboard"
                                        className="block px-4 py-2 text-sm hover:bg-slate-100"
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        href="/products"
                                        className="block px-4 py-2 text-sm hover:bg-slate-100"
                                    >
                                        My Products
                                    </Link>

                                    <Link
                                        href="/seller/profile"
                                        className="block px-4 py-2 text-sm hover:bg-slate-100"
                                    >
                                        Seller Profile
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

        </header>
    )
}