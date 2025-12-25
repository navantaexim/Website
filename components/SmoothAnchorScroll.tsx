// components/SmoothAnchorScroll.tsx
'use client'

import { useEffect } from 'react'

export default function SmoothAnchorScroll() {
    useEffect(() => {
        const handler = (e: Event) => {
            const link = (e.target as HTMLElement).closest('a[href^="#"]')
            if (!link) return

            const id = link.getAttribute('href')
            if (!id || id === '#') return

            const target = document.querySelector(id)
            if (!target) return

            e.preventDefault()

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })

            // 🔑 THIS FIXES BACK BUTTON
            history.replaceState(null, '', location.pathname)
        }

        document.addEventListener('click', handler)
        return () => document.removeEventListener('click', handler)
    }, [])

    return null
}
