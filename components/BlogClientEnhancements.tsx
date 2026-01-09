'use client'

import SmoothAnchorScroll from './SmoothAnchorScroll'
import TocSidebarController from './TocSidebarController'
import BlogPaywall from './BlogPaywall'

export default function BlogClientEnhancements() {
    return (
        <>
            <SmoothAnchorScroll />
            <TocSidebarController />
            <BlogPaywall />
        </>
    )
}
