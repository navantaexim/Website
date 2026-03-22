type Props = {
    name: string
    city?: string
    country?: string
}

export default function SupplierCard({ name, city, country }: Props) {

    return (
        <div className="border rounded-xl p-6 bg-white mt-10 shadow-sm">

            {/* Header */}
            <h3 className="text-lg font-semibold text-slate-900">
                Supplier Information
            </h3>

            {/* Supplier Identity */}
            <div className="mt-3">

                <p className="text-xl font-semibold text-slate-800">
                    {name}
                </p>

                {(city || country) && (
                    <p className="text-sm text-slate-500 mt-1">
                        {[city, country].filter(Boolean).join(", ")}
                    </p>
                )}

            </div>

            {/* Verification Badges */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">

                <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-slate-50">
                    ✔ IEC Verified
                </div>

                <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-slate-50">
                    ✔ GST Verified
                </div>

                <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-slate-50">
                    ✔ Manufacturer
                </div>

                <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-slate-50">
                    ✔ Exporter
                </div>

            </div>

            {/* CTA */}
            <button className="mt-6 w-full border px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                View Supplier Profile
            </button>

        </div>
    )
}