import prisma from "@/lib/db"
import ProductCard from "./product-card"
import Link from "next/link"

export const revalidate = 60

export default async function TrendingProducts() {

    const products = await prisma.product.findMany({
        where: {
            status: "active",
        },
        select: {
            id: true,
            name: true,
            media: {
                where: { type: "image" },
                take: 1,
                select: {
                    url: true,
                },
            },
            seller: {
                select: {
                    legalName: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 8,
    })

    return (
        <section className="bg-white py-10 md:py-16">

            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* 🔹 HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-10">

                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                            Latest Engineering Products
                        </h2>

                        <p className="text-xs md:text-sm text-slate-500 mt-1">
                            Discover newly added products from verified manufacturers
                        </p>
                    </div>

                    <Link
                        href="/products"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 self-start sm:self-auto"
                    >
                        View All →
                    </Link>

                </div>

                {/* 🔹 PRODUCTS GRID */}
                {products.length === 0 ? (

                    <div className="text-center py-10 md:py-12">
                        <p className="text-sm md:text-base text-slate-500">
                            No products available yet.
                        </p>
                    </div>

                ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">

                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}

                    </div>

                )}

            </div>

        </section>
    )
}