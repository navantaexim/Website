'use client'
import { useEffect } from 'react'

export default function SmoothAnchorScroll() {
    useEffect(() => {
        const handler = (e: Event) => {
            const link = (e.target as HTMLElement)?.closest('a[href^="#"]')
            if (!link) return

            const rawId = link.getAttribute('href')
            if (!rawId || rawId === '#') return

            let target: Element | null = null

            try {
                target = document.querySelector(decodeURIComponent(rawId))
            } catch {
                return // invalid selector → ignore
            }

            if (!target) return

            e.preventDefault()

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })

            history.replaceState(null, '', location.pathname)
        }

        document.addEventListener('click', handler)
        return () => document.removeEventListener('click', handler)
    }, [])

    return null
}
