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

            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">

                {/* Logo */}
                <Logo />

                {/* Location */}
                <div className="hidden lg:block text-xs leading-tight cursor-pointer">
                    <p className="text-slate-500">Deliver to</p>
                    <p className="font-medium">Select location</p>
                </div>

                {/* Search */}
                <div className="flex-1 flex justify-center">
                    <div className="w-full max-w-3xl">
                        <SearchBar />
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-5">

                    <Link
                        href="/orders"
                        className="text-sm text-slate-700 hover:text-black"
                    >
                        Track Order
                    </Link>

                    <Link
                        href="/cart"
                        className="text-sm text-slate-700 hover:text-black"
                    >
                        Cart
                    </Link>

                    {loading && (
                        <span className="text-sm text-slate-500">
                            Loading...
                        </span>
                    )}

                    {!loading && !user && (
                        <Link
                            href="/login"
                            className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md hover:bg-slate-100"
                        >
                            Login
                        </Link>
                    )}

                    {!loading && user && (
                        <div className="relative" ref={menuRef}>

                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center"
                            >
                                <img
                                    src={
                                        (user as any).picture ||
                                        `https://ui-avatars.com/api/?name=${user.email}`
                                    }
                                    alt="profile"
                                    className="w-9 h-9 rounded-full object-cover border"
                                />
                            </button>

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