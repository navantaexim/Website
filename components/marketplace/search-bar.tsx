"use client"

import { Search } from "lucide-react"

export default function SearchBar() {
    return (
        <div className="relative flex items-center">

            <input
                type="text"
                placeholder="Search products, suppliers, categories..."
                className="w-full h-12 border border-slate-300 rounded-l-md pl-4 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <button className="h-12 px-5 bg-blue-700 text-white rounded-r-md hover:bg-blue-800 flex items-center justify-center transition">
                <Search size={18} />
            </button>

        </div>
    )
}