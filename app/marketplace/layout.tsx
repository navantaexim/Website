import Header from "@/components/marketplace/header"

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-slate-50 min-h-screen">

            <Header />

            {children}

        </div>
    )
}