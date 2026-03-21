"use client"

import { Search } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SearchBar() {

    const [query, setQuery] = useState("")
    const router = useRouter()

    const handleSearch = () => {
        if (!query.trim()) return
        router.push(`/products?search=${encodeURIComponent(query)}`)
    }

    return (
        <div className="relative flex items-center">

            <input
                type="text"
                placeholder="Search products, suppliers, categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full h-12 border border-slate-300 rounded-l-md pl-4 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <button
                onClick={handleSearch}
                className="h-12 px-5 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 flex items-center justify-center transition"
            >
                <Search size={18} />
            </button>

        </div>
    )
}