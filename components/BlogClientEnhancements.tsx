'use client'

import dynamic from 'next/dynamic'
import SmoothAnchorScroll from './SmoothAnchorScroll'
import TocSidebarController from './TocSidebarController'

// Dynamically import BlogPaywall to avoid blocking initial render/hydration
// and to split the bundle. It's an overlay, so it doesn't need to be immediate for SEO/Layout.
const BlogPaywall = dynamic(() => import('./BlogPaywall'), { 
    ssr: false 
})

export default function BlogClientEnhancements() {
    return (
        <>
            <SmoothAnchorScroll />
            <TocSidebarController />
            <BlogPaywall />
        </>
    )
}
