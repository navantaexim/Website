'use client'

import { useEffect, useState } from 'react'
import TocSidebarController from '@/components/TocSidebarController'

export default function BlogClient({
    content,
}: {
    content: string
}) {
    const [ready, setReady] = useState(false)

    useEffect(() => {
        setReady(true)
    }, [])

    if (!ready) return null

    return (
        <>
            <main className="w-full flex gap-6 px-6 lg:px-8">
                <article
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </main>

            <TocSidebarController />
        </>
    )
}
