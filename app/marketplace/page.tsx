import CategoryStrip from "@/components/marketplace/category-strip"
import HeroSlider from "@/components/marketplace/hero-slider"
import TrendingProducts from "@/components/marketplace/trending-products"

export default function MarketplacePage() {

    return (

        <div className="bg-slate-50">

            {/* CATEGORY STRIP */}
            <CategoryStrip />

            {/* MAIN HERO */}
            <HeroSlider />

            {/* SUB BANNERS (NEW SECTION) */}
            <section className="max-w-7xl mx-auto px-6 mt-6 grid md:grid-cols-3 gap-4">

                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <p className="text-sm text-slate-500">AI Powered</p>
                    <h3 className="font-semibold mt-1">
                        Smart Manufacturing Solutions
                    </h3>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <p className="text-sm text-slate-500">Top Categories</p>
                    <h3 className="font-semibold mt-1">
                        Explore Industrial Products
                    </h3>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <p className="text-sm text-slate-500">Fast Delivery</p>
                    <h3 className="font-semibold mt-1">
                        Nationwide Supplier Network
                    </h3>
                </div>

            </section>

            {/* PRODUCTS */}
            <TrendingProducts />

        </div>

    )
}