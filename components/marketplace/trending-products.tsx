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
        <section className="bg-white py-12">

            <div className="max-w-7xl mx-auto px-6">

                <h2 className="text-2xl font-semibold mb-8">
                    Latest Products
                </h2>

                {products.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                        No products available yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

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