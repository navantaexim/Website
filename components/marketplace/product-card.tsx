'use client'

import Image from "next/image"
import Link from "next/link"
import { MapPin } from "lucide-react"

type ProductCardType = {
    id: string
    name: string
    media: { url: string }[]
    seller: {
        legalName: string
        location?: string
    }
    moq?: number
}

export default function ProductCard({ product }: { product: ProductCardType }) {

    const image = product.media?.[0]?.url || "/placeholder.png"

    return (
        <Link
            href={`/products/${product.id}`}
            className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >

            {/* 🔹 IMAGE (responsive aspect ratio) */}
            <div className="relative w-full aspect-square sm:aspect-[4/3] bg-slate-100">
                <Image
                    src={image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-3 sm:p-4 group-hover:scale-105 transition"
                />
            </div>

            {/* 🔹 CONTENT */}
            <div className="p-3 sm:p-4 flex flex-col flex-1 gap-1.5 sm:gap-2">

                {/* TITLE */}
                <h3 className="text-sm sm:text-base font-medium text-slate-800 line-clamp-2 group-hover:text-blue-700 leading-tight">
                    {product.name}
                </h3>

                {/* SELLER */}
                <div className="text-xs sm:text-sm text-slate-600 line-clamp-1">
                    {product.seller.legalName}
                </div>

                {/* LOCATION */}
                {product.seller.location && (
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{product.seller.location}</span>
                    </div>
                )}

                {/* MOQ */}
                {product.moq && (
                    <div className="text-[11px] sm:text-xs text-slate-500">
                        MOQ: {product.moq}
                    </div>
                )}

                {/* CTA */}
                <button className="mt-auto w-full border border-blue-600 text-blue-600 text-xs sm:text-sm py-2.5 sm:py-2 rounded-md hover:bg-blue-600 hover:text-white transition active:scale-95">
                    Get Best Price
                </button>

            </div>
        </Link>
    )
}