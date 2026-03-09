"use client"

import useEmblaCarousel from "embla-carousel-react"
import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function HeroSlider() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
    const autoplayRef = useRef<NodeJS.Timeout | null>(null)

    const startAutoplay = () => {
        if (!emblaApi) return

        autoplayRef.current = setInterval(() => {
            emblaApi.scrollNext()
        }, 8000)
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

                {/* HOVER AREA */}
                <div
                    className="overflow-hidden rounded-xl"
                    ref={emblaRef}
                    onMouseEnter={stopAutoplay}
                    onMouseLeave={startAutoplay}
                >
                    <div className="flex">

                        {/* SLIDE 1 */}
                        <div
                            className="flex-[0_0_100%] h-[360px] bg-cover bg-center relative rounded-xl"
                            style={{
                                backgroundImage:
                                    "url('https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1600')",
                            }}
                        >

                            <div className="absolute inset-0 bg-black/40 rounded-xl" />

                            <div className="relative h-full grid grid-cols-3 gap-6 p-8">

                                {/* AI SAAS */}
                                <div className="bg-white/95 backdrop-blur rounded-lg p-6">

                                    <h3 className="text-xl font-semibold mb-4">
                                        Customized AI SaaS Solution for Manufacturing Operations
                                    </h3>

                                    <p className="text-slate-600 text-sm">
                                        Optimize sourcing, supplier discovery and export
                                        operations using AI powered manufacturing tools.
                                    </p>

                                    <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md">
                                        Learn More
                                    </button>

                                </div>

                                {/* CATEGORY GRID */}
                                <div className="col-span-2 grid grid-cols-2 gap-4">

                                    <div className="bg-white/95 rounded-lg p-6 flex items-center justify-center hover:shadow-md">
                                        Steel
                                    </div>

                                    <div className="bg-white/95 rounded-lg p-6 flex items-center justify-center hover:shadow-md">
                                        Fasteners
                                    </div>

                                    <div className="bg-white/95 rounded-lg p-6 flex items-center justify-center hover:shadow-md">
                                        Casting
                                    </div>

                                    <div className="bg-white/95 rounded-lg p-6 flex items-center justify-center hover:shadow-md">
                                        Machining
                                    </div>

                                </div>

                            </div>
                        </div>

                        {/* SLIDE 2 */}
                        <div
                            className="flex-[0_0_100%] h-[360px] bg-cover bg-center relative rounded-xl"
                            style={{
                                backgroundImage:
                                    "url('https://images.pexels.com/photos/8865187/pexels-photo-8865187.jpeg?auto=compress&cs=tinysrgb&w=1600')",
                            }}
                        >

                            <div className="absolute inset-0 bg-black/40 rounded-xl" />

                            <div className="relative h-full grid grid-cols-3 gap-6 p-8">

                                <div className="bg-white/95 rounded-lg p-6">

                                    <h3 className="text-xl font-semibold mb-4">
                                        CNC Machining Marketplace
                                    </h3>

                                    <p className="text-slate-600 text-sm">
                                        Discover precision machining manufacturers
                                        across verified engineering suppliers.
                                    </p>

                                </div>

                                <div className="col-span-2 grid grid-cols-2 gap-4">

                                    <div className="bg-white/95 rounded-lg p-6 flex items-center justify-center">
                                        Forging
                                    </div>

                                    <div className="bg-white/95 rounded-lg p-6 flex items-center justify-center">
                                        Fabrication
                                    </div>

                                    <div className="bg-white/95 rounded-lg p-6 flex items-center justify-center">
                                        Tooling
                                    </div>

                                    <div className="bg-white/95 rounded-lg p-6 flex items-center justify-center">
                                        Bearings
                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                {/* ARROWS */}
                <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                >
                    <ChevronLeft size={18} />
                </button>

                <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                >
                    <ChevronRight size={18} />
                </button>

            </div>

        </section>
    )
}