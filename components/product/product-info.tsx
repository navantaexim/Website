export default function ProductInfo({ product }: any) {

    return (
        <div className="space-y-4">

            {/* PRODUCT TITLE */}
            <h1 className="text-2xl lg:text-3xl font-semibold leading-snug text-slate-900">
                {product.name}
            </h1>

            {/* CATEGORY + ORIGIN */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">

                {product.category?.name && (
                    <span>
                        Category: <span className="text-slate-700 font-medium">
                            {product.category.name}
                        </span>
                    </span>
                )}

                {product.originCountry?.name && (
                    <span>
                        Origin: <span className="text-slate-700 font-medium">
                            {product.originCountry.name}
                        </span>
                    </span>
                )}

            </div>

            {/* HS CODE */}
            {product.hsCode && (
                <p className="text-sm text-slate-500">
                    HS Code: <span className="font-medium text-slate-700">
                        {product.hsCode}
                    </span>
                </p>
            )}

            {/* SUPPLIER */}
            <div className="pt-4 border-t">

                <p className="text-sm text-slate-500">
                    Supplier
                </p>

                <p className="font-medium text-slate-800">
                    {product.seller?.legalName}
                </p>

            </div>

            {/* TRUST BADGES */}
            <div className="flex flex-wrap gap-3 pt-4">

                <span className="text-xs border px-3 py-1 rounded-full">
                    ✔ IEC Verified
                </span>

                <span className="text-xs border px-3 py-1 rounded-full">
                    ✔ GST Registered
                </span>

                <span className="text-xs border px-3 py-1 rounded-full">
                    ✔ Export Ready
                </span>

            </div>

        </div>
    )
}