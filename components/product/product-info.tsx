export default function ProductInfo({ product }: any) {

    return (
        <div>

            <h1 className="text-xl font-semibold leading-snug">
                {product.name}
            </h1>

            <div className="flex items-center gap-2 mt-2">

                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                    4.7
                </span>

                <span className="text-sm text-slate-500">
                    30 Reviews
                </span>

            </div>

            <p className="text-sm text-slate-500 mt-4">
                HS Code: {product.hsCode}
            </p>

            <p className="text-sm text-slate-500">
                Category: {product.category?.name}
            </p>

            <p className="text-sm text-slate-500">
                Origin: {product.originCountry?.name}
            </p>

            <div className="mt-6">

                <p className="font-medium text-sm mb-2">
                    Size
                </p>

                <div className="flex gap-2 flex-wrap">

                    {[6, 7, 8, 9, 10, 11].map(size => (
                        <button
                            key={size}
                            className="border px-3 py-1 rounded text-sm hover:border-primary"
                        >
                            {size}
                        </button>
                    ))}

                </div>

            </div>

        </div>
    )
}