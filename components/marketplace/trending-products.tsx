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
        <section className="bg-white py-16">

            <div className="max-w-7xl mx-auto px-6">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-10">

                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Latest Engineering Products
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Discover newly added products from verified manufacturers
                        </p>
                    </div>

                    <Link
                        href="/products"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        View All →
                    </Link>

                </div>


                {/* PRODUCTS GRID */}

                {products.length === 0 ? (

                    <div className="text-center py-12">

                        <p className="text-slate-500">
                            No products available yet.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

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