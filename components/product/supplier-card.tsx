type Props = {
    name: string
    city?: string
    country?: string
}

export default function SupplierCard({ name, city, country }: Props) {

    return (
        <div className="border rounded-xl p-6 bg-white mt-10">

            <h3 className="text-lg font-semibold">
                Supplier Information
            </h3>

            <p className="text-xl font-medium mt-2">
                {name}
            </p>

            <p className="text-sm text-slate-500">
                {city} {country}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                <div className="flex items-center gap-2">
                    ✔ IEC Verified
                </div>

                <div className="flex items-center gap-2">
                    ✔ GST Verified
                </div>

                <div className="flex items-center gap-2">
                    ✔ Manufacturer
                </div>

                <div className="flex items-center gap-2">
                    ✔ Exporter
                </div>

            </div>

            <button className="mt-6 border px-4 py-2 rounded-lg text-sm hover:bg-slate-50">
                View Supplier Profile
            </button>

        </div>
    )
}