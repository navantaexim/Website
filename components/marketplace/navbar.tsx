import Link from "next/link"

export default function Navbar() {
    return (
        <nav className="bg-white">

            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-center">

                <div className="flex items-center gap-10 text-sm font-medium text-slate-700">

                    <Link href="/about" className="hover:text-blue-700 transition">
                        About Us
                    </Link>

                    <Link href="/why-choose-us" className="hover:text-blue-700 transition">
                        Why Choose Us
                    </Link>

                    <Link href="/industries" className="hover:text-blue-700 transition">
                        Industries
                    </Link>

                    <Link href="/suppliers" className="hover:text-blue-700 transition">
                        For Suppliers
                    </Link>

                    <Link href="/products" className="hover:text-blue-700 transition">
                        Products
                    </Link>

                    <Link href="/exim-learning" className="hover:text-blue-700 transition">
                        Exim Learning
                    </Link>

                </div>

            </div>

        </nav>
    )
}