

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <main className="pt-24">
                {children}
            </main>
        </>
    )
}
