"use client"

import { useState, useRef } from "react"

type Media = {
    id: string
    url: string
}

export default function ProductGallery({ media }: { media: Media[] }) {

    const [activeImage, setActiveImage] = useState(media?.[0]?.url)
    const [zoomStyle, setZoomStyle] = useState({})
    const [lensStyle, setLensStyle] = useState({})
    const containerRef = useRef<HTMLDivElement>(null)

    function handleMouseMove(e: React.MouseEvent) {

        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const percentX = (x / rect.width) * 100
        const percentY = (y / rect.height) * 100

        setZoomStyle({
            transformOrigin: `${percentX}% ${percentY}%`,
            transform: "scale(2)"
        })

        setLensStyle({
            left: x - 60,
            top: y - 60
        })
    }

    function handleMouseLeave() {
        setZoomStyle({ transform: "scale(1)" })
        setLensStyle({ display: "none" })
    }

    function handleMouseEnter() {
        setLensStyle({ display: "block" })
    }

    return (
        <div className="flex gap-4">

            {/* THUMBNAILS */}
            <div className="flex flex-col gap-2">

                {media.map((img) => (

                    <button
                        key={img.id}
                        onClick={() => setActiveImage(img.url)}
                        className={`w-16 h-16 border rounded-md overflow-hidden
              ${activeImage === img.url
                                ? "border-primary"
                                : "border-slate-200 hover:border-slate-400"
                            }`}
                    >
                        <img
                            src={img.url}
                            className="w-full h-full object-cover"
                        />
                    </button>

                ))}

            </div>


            {/* MAIN IMAGE */}
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                className="relative flex-1 border rounded-lg overflow-hidden bg-white h-[450px] flex items-center justify-center cursor-zoom-in"
            >

                {/* ZOOM LENS */}
                <div
                    style={lensStyle}
                    className="absolute w-[120px] h-[120px] bg-white/30 border border-white pointer-events-none"
                />

                {activeImage && (
                    <img
                        src={activeImage}
                        className="w-full h-full object-contain transition-transform duration-200"
                        style={zoomStyle}
                    />
                )}

            </div>

        </div>
    )
}