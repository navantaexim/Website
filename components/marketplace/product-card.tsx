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
            className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
            {/* IMAGE */}
            <div className="relative h-52 bg-slate-100">
                <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition"
                />
            </div>

            {/* CONTENT */}
            <div className="p-4 flex flex-col gap-2">

                {/* TITLE */}
                <h3 className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-blue-700">
                    {product.name}
                </h3>

                {/* SELLER */}
                <div className="text-xs text-slate-600 line-clamp-1">
                    {product.seller.legalName}
                </div>

                {/* LOCATION */}
                {product.seller.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {product.seller.location}
                    </div>
                )}

                {/* MOQ */}
                {product.moq && (
                    <div className="text-xs text-slate-500">
                        MOQ: {product.moq}
                    </div>
                )}

                {/* CTA */}
                <button className="mt-3 w-full border border-blue-600 text-blue-600 text-sm py-2 rounded-md hover:bg-blue-600 hover:text-white transition">
                    Get Best Price
                </button>

            </div>
        </Link>
    )
}