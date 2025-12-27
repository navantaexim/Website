'use client'

import SmoothAnchorScroll from './SmoothAnchorScroll'
import TocSidebarController from './TocSidebarController'

export default function BlogClientEnhancements() {
    return (
        <>
            <SmoothAnchorScroll />
            <TocSidebarController />
        </>
    )
}
