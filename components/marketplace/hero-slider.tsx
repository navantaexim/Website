"use client"

import useEmblaCarousel from "embla-carousel-react"
import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
    {
        image:
            "https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1600",
        title: "Industrial Manufacturing Marketplace",
        description:
            "Discover verified manufacturing suppliers across steel, forging, casting and machining industries.",
        categories: ["Steel", "Fasteners", "Casting", "Machining"],
    },
    {
        image:
            "https://images.pexels.com/photos/8865187/pexels-photo-8865187.jpeg?auto=compress&cs=tinysrgb&w=1600",
        title: "Precision CNC Machining Network",
        description:
            "Connect with certified CNC machining manufacturers delivering high precision components.",
        categories: ["Forging", "Fabrication", "Tooling", "Bearings"],
    },
    {
        image:
            "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1600",
        title: "Industrial Raw Materials Marketplace",
        description:
            "Source steel, forgings, castings and engineering components from trusted suppliers.",
        categories: ["Steel Plates", "Industrial Tools", "Bearings", "Fabrication"],
    },
    {
        image:
            "https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=1600",
        title: "Global Export Network",
        description:
            "Connect with exporters and manufacturers supplying products to international markets.",
        categories: ["Export Suppliers", "Shipping", "Packaging", "Logistics"],
    },
    {
        image:
            "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1600",
        title: "AI Powered Manufacturing Intelligence",
        description:
            "Optimize sourcing, supplier discovery and procurement using intelligent tools.",
        categories: ["AI Sourcing", "Supplier Discovery", "Analytics", "Procurement"],
    },
]

export default function HeroSlider() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
    const autoplayRef = useRef<NodeJS.Timeout | null>(null)

    const startAutoplay = () => {
        if (!emblaApi) return

        autoplayRef.current = setInterval(() => {
            emblaApi.scrollNext()
        }, 7000)
    }

    const stopAutoplay = () => {
        if (autoplayRef.current) {
            clearInterval(autoplayRef.current)
            autoplayRef.current = null
        }
    }

    useEffect(() => {
        if (!emblaApi) return
        startAutoplay()

        return () => stopAutoplay()
    }, [emblaApi])

    const scrollPrev = () => emblaApi?.scrollPrev()
    const scrollNext = () => emblaApi?.scrollNext()

    return (
        <section className="bg-slate-50 py-10">

            <div className="max-w-7xl mx-auto px-6 relative">

                <div
                    className="overflow-hidden rounded-xl"
                    ref={emblaRef}
                    onMouseEnter={stopAutoplay}
                    onMouseLeave={startAutoplay}
                >
                    <div className="flex">

                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className="flex-[0_0_100%] h-[360px] bg-cover bg-center relative"
                                style={{ backgroundImage: `url(${slide.image})` }}
                            >

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />

                                <div className="relative h-full grid grid-cols-3 gap-6 p-10">

                                    {/* Left Text Card */}
                                    <div className="bg-white/95 backdrop-blur rounded-lg p-6 flex flex-col justify-center">

                                        <h3 className="text-xl font-semibold mb-3">
                                            {slide.title}
                                        </h3>

                                        <p className="text-slate-600 text-sm">
                                            {slide.description}
                                        </p>

                                        <button className="mt-5 w-fit bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                                            Explore
                                        </button>

                                    </div>

                                    {/* Category Cards */}
                                    <div className="col-span-2 grid grid-cols-2 gap-4">

                                        {slide.categories.map((cat, i) => (
                                            <div
                                                key={i}
                                                className="bg-white/95 rounded-lg p-6 flex items-center justify-center font-medium text-slate-700 hover:shadow-md transition"
                                            >
                                                {cat}
                                            </div>
                                        ))}

                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                </div>

                {/* Arrows */}
                <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-slate-100"
                >
                    <ChevronLeft size={18} />
                </button>

                <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-slate-100"
                >
                    <ChevronRight size={18} />
                </button>

            </div>

        </section>
    )
}