"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/layout/header"

export default function ConditionalHeader() {
    const pathname = usePathname()

    if (pathname.startsWith("/marketplace")) {
        return null
    }

    return <Header />
}