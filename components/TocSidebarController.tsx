// components/TocSidebarController.tsx
'use client'

import { useEffect } from 'react'

export default function TocSidebarController() {
    useEffect(() => {
        const toggle = document.getElementById('toc-toggle')
        const sidebar = document.getElementById('toc-sidebar')
        const overlay = document.getElementById('toc-overlay')
        const closeBtn = document.getElementById('toc-close')

        if (!toggle || !sidebar || !overlay) return

        const open = () => {
            sidebar.classList.remove('-translate-x-full')
            overlay.classList.remove('hidden')
        }

        const close = () => {
            sidebar.classList.add('-translate-x-full')
            overlay.classList.add('hidden')
        }

        toggle.addEventListener('click', open)
        overlay.addEventListener('click', close)
        closeBtn?.addEventListener('click', close)

        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) close()
            })
        })

        return () => {
            toggle.removeEventListener('click', open)
            overlay.removeEventListener('click', close)
            closeBtn?.removeEventListener('click', close)
        }
    }, [])

    return null
}
