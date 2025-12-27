'use client'

import { useEffect } from 'react'

export default function TocSidebarController() {
    useEffect(() => {
        const toggle = document.getElementById('toc-toggle')
        const sidebar = document.getElementById('toc-sidebar')
        const overlay = document.getElementById('toc-overlay')
        const closeBtn = document.getElementById('toc-close')

        if (!toggle || !sidebar || !overlay) return

        const openSidebar = () => {
            sidebar.classList.remove('-translate-x-full')
            overlay.classList.remove('hidden', 'pointer-events-none')
            document.body.style.overflow = 'hidden' // 🔒 lock scroll
        }

        const closeSidebar = () => {
            sidebar.classList.add('-translate-x-full')
            overlay.classList.add('hidden', 'pointer-events-none')
            document.body.style.overflow = '' // ✅ RESTORE SCROLL
        }

        toggle.addEventListener('click', openSidebar)
        overlay.addEventListener('click', closeSidebar)
        closeBtn?.addEventListener('click', closeSidebar)

        // ✅ IMPORTANT FIX: restore scroll on TOC link click
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    closeSidebar()
                }
            })
        })

        return () => {
            toggle.removeEventListener('click', openSidebar)
            overlay.removeEventListener('click', closeSidebar)
            closeBtn?.removeEventListener('click', closeSidebar)
        }
    }, [])

    return null
}
