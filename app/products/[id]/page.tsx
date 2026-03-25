import { notFound } from "next/navigation"
import prisma from "@/lib/db"

import ProductGallery from "@/components/product/product-gallery"
import ProductInfo from "@/components/product/product-info"
import InquiryBox from "@/components/product/product-inquiry-box"
import SupplierCard from "@/components/product/supplier-card"
import ProductNav from "@/components/product/product-nav"

async function getProduct(id: string) {
    return prisma.product.findFirst({
        where: { id, status: "active" },
        include: {
            seller: true,
            specs: true,
            commercial: true,
            compliance: { include: { standards: true } },
            media: true,
            category: true,
            originCountry: true
        }
    })
}

export default async function ProductPage({
    params
}: { params: { id: string } }) {

    const resolvedParams = await Promise.resolve(params)
    const product = await getProduct(resolvedParams.id)

    if (!product) notFound()

    const images = product.media.filter(m => m.type === "image")
    const drawings = product.media.filter(m => m.type === "drawing")
    const certificates = product.media.filter(m => m.type === "certificate")

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            {/* PRODUCT HERO */}
            <div className="grid lg:grid-cols-12 gap-10">

                <div className="lg:col-span-5">
                    <ProductGallery media={images} />
                </div>

                <div className="lg:col-span-4">
                    <ProductInfo product={product} />
                </div>

                {/* INQUIRY BOX */}
                <div className="lg:col-span-3">
                    <InquiryBox
                        productId={product.id}
                        sellerName={product.seller.legalName}
                    />
                </div>

            </div>


            {/* SUPPLIER CARD */}
            <SupplierCard
                name={product.seller.legalName}
                city="Mumbai"
                country={product.originCountry?.name}
            />


            {/* STICKY PRODUCT NAV */}
            <div className="mt-12">
                <ProductNav />
            </div>


            {/* OVERVIEW */}
            <section id="overview" className="mt-10">

                <h2 className="text-xl font-semibold mb-4">
                    Product Overview
                </h2>

                <p className="text-slate-600 leading-relaxed">
                    {product.name} manufactured by {product.seller.legalName}.
                    Designed for industrial use and export markets.
                </p>

            </section>


            {/* SPECIFICATIONS */}
            <section id="specs" className="mt-14">

                <h2 className="text-2xl font-semibold mb-6">
                    Specifications
                </h2>

                {product.specs && (() => {

                    const groups: Record<string, any[]> = {
                        general: [],
                        physical: [],
                        packaging: [],
                        other: []
                    }

                    Object.entries(product.specs)
                        .filter(([key]) =>
                            !["id", "productId", "createdAt", "updatedAt"].includes(key)
                        )
                        .forEach(([key, value]) => {

                            let displayValue: any = value
                            let label = key.replace(/([A-Z])/g, " $1")

                            if (key === "dimensions" && typeof value === "object" && value !== null) {
                                const { length, width, height } = value as any
                                displayValue = `${length} × ${width} × ${height} cm`
                            }

                            if (key === "weight") {
                                displayValue = `${value} kg`
                            }

                            if (key === "capacity") {
                                displayValue = `${value} units`
                            }

                            const item = { label, value: displayValue }

                            if (["material", "grade"].includes(key))
                                groups.general.push(item)

                            else if (["weight", "dimensions"].includes(key))
                                groups.physical.push(item)

                            else if (["packaging", "cartonSize"].includes(key))
                                groups.packaging.push(item)

                            else
                                groups.other.push(item)
                        })

                    return Object.entries(groups).map(([groupName, specs]) => {

                        if (!specs.length) return null

                        return (
                            <div key={groupName} className="mb-10">

                                <h3 className="text-lg font-semibold capitalize mb-4">
                                    {groupName}
                                </h3>

                                <div className="grid md:grid-cols-2 border rounded-lg divide-y md:divide-y-0 md:divide-x">

                                    {specs.map((spec, i) => (

                                        <div
                                            key={i}
                                            className="flex justify-between px-5 py-3 text-sm"
                                        >

                                            <span className="text-slate-500">
                                                {spec.label}
                                            </span>

                                            <span className="font-medium text-slate-900">
                                                {spec.value}
                                            </span>

                                        </div>

                                    ))}

                                </div>

                            </div>
                        )

                    })

                })()}

            </section>


            {/* TECHNICAL DRAWING */}
            {drawings.length > 0 && (

                <section id="drawing" className="mt-12">

                    <h2 className="text-xl font-semibold mb-4">
                        Technical Drawing
                    </h2>

                    <div className="space-y-2">

                        {drawings.map(drawing => (

                            <a
                                key={drawing.id}
                                href={drawing.url}
                                target="_blank"
                                className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-slate-50"
                            >
                                View Technical Drawing
                            </a>

                        ))}

                    </div>

                </section>

            )}


            {/* MANUFACTURING DETAILS */}
            <section id="manufacturing" className="mt-12">

                <h2 className="text-xl font-semibold mb-4">
                    Manufacturing Details
                </h2>

                <div className="text-sm space-y-2 text-slate-600">

                    {product.commercial?.capacityPerMonth && (
                        <p>
                            Production Capacity: {product.commercial.capacityPerMonth} / month
                        </p>
                    )}

                    {product.commercial?.leadTimeDays && (
                        <p>
                            Lead Time: {product.commercial.leadTimeDays} days
                        </p>
                    )}

                    {product.commercial?.portOfDispatch && (
                        <p>
                            Port of Dispatch: {product.commercial.portOfDispatch}
                        </p>
                    )}

                </div>

            </section>


            {/* COMPLIANCE */}
            <section id="compliance" className="mt-12">

                <h2 className="text-xl font-semibold mb-4">
                    Certifications & Compliance
                </h2>

                <div className="flex flex-wrap gap-3 mb-4">

                    {product.compliance?.standards?.map((c: any) => (

                        <span
                            key={c.id}
                            className="border px-3 py-1 rounded-full text-sm"
                        >
                            {c.name}
                        </span>

                    ))}

                </div>

                {certificates.length > 0 && (

                    <div className="space-y-2">

                        <h3 className="text-sm font-semibold">
                            Certificates
                        </h3>

                        {certificates.map(cert => (

                            <a
                                key={cert.id}
                                href={cert.url}
                                target="_blank"
                                className="block text-sm text-blue-600 underline"
                            >
                                View Certificate
                            </a>

                        ))}

                    </div>

                )}

            </section>

        </div>
    )
}