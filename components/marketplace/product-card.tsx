import Image from "next/image"
import Link from "next/link"

type ProductCardType = {
    id: string
    name: string
    media: {
        url: string
    }[]
    seller: {
        legalName: string
    }
}

export default function ProductCard({ product }: { product: ProductCardType }) {

    const image = product.media[0]

    return (
        <Link
            href={`/products/${product.id}`}
            className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition"
        >

            <div className="relative h-48 bg-slate-100 overflow-hidden">

                <Image
                    src={image?.url || "/placeholder.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

            </div>

            <div className="p-4">

                <h3 className="text-sm font-medium text-slate-800 line-clamp-2">
                    {product.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                    {product.seller.legalName}
                </p>

                <p className="text-xs text-blue-600 mt-2">
                    View Product →
                </p>

            </div>

        </Link>
    )
}