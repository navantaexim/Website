import Header from "@/components/marketplace/header"
import Navbar from "@/components/marketplace/navbar"

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-slate-50 min-h-screen">

            <Header />

            <Navbar />

            {children}

        </div>
    )
}