"use client"

import useEmblaCarousel from "embla-carousel-react"
import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
    // 🔹 CORE VALUE (KEEP FIRST)
    {
        image: "https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg",
        title: "Customized AI SaaS Solution for Manufacturing Operations",
        description:
            "AI-powered platform helping manufacturers discover suppliers, analyze engineering products and streamline procurement workflows.",
        features: [
            "Explore Engineering Categories",
            "Verified Manufacturing Suppliers",
            "Global Export Network",
            "Industrial Procurement Intelligence",
        ],
    },

    {
        image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
        title: "Discover Verified Engineering Manufacturers",
        description:
            "Connect with trusted manufacturers supplying precision components, machinery and industrial systems.",
        features: [
            "Supplier Discovery Engine",
            "Export Ready Manufacturers",
            "Industrial Product Catalog",
            "Manufacturing Capabilities",
        ],
    },

    {
        image: "https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg",
        title: "Source Engineering Products Across Industries",
        description:
            "Explore fasteners, castings, automation systems, industrial machinery and engineering materials.",
        features: [
            "Fasteners & Hardware",
            "Castings & Forgings",
            "Automation Systems",
            "Industrial Machinery",
        ],
    },

    // 🔹 INDUSTRY SLIDES (NEW — CLEAN + FOCUSED)

    {
        image: "https://images.pexels.com/photos/190574/pexels-photo-190574.jpeg",
        title: "Automobile Industry Suppliers & Components",
        description:
            "Source OEM components, assemblies and precision parts for automotive manufacturing.",
        features: [
            "OEM & Tier-1 Suppliers",
            "Precision Components",
            "Assembly Solutions",
            "Automotive Supply Chain",
        ],
    },

    {
        image: "https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg",
        title: "Industrial Machinery & Equipment Marketplace",
        description:
            "Explore heavy machinery, production systems and engineering equipment from verified manufacturers.",
        features: [
            "Heavy Machinery",
            "Production Equipment",
            "Industrial Systems",
            "Global Manufacturers",
        ],
    },

    {
        image: "https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg",
        title: "Defense & Aerospace Engineering Components",
        description:
            "Connect with specialized manufacturers supplying high-precision aerospace and defense components.",
        features: [
            "Aerospace Components",
            "High Precision Manufacturing",
            "Compliance Standards",
            "Defense Supply Chain",
        ],
    },

    // 🔹 SUPPORTING VALUE (LAST)

    {
        image: "https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg",
        title: "Global Export Network for Engineering Manufacturers",
        description:
            "Discover suppliers exporting engineering products across international markets.",
        features: [
            "Export Ready Suppliers",
            "Global Manufacturing Network",
            "Shipping & Logistics",
            "International Procurement",
        ],
    },

    {
        image: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg",
        title: "AI Powered Industrial Procurement Intelligence",
        description:
            "Optimize sourcing decisions using AI insights across manufacturing data and supplier performance.",
        features: [
            "AI Supplier Discovery",
            "Manufacturing Intelligence",
            "Procurement Analytics",
            "Engineering Data Insights",
        ],
    },
]

export default function HeroSlider() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
    const autoplayRef = useRef<NodeJS.Timeout | null>(null)

    const startAutoplay = () => {
        if (!emblaApi) return
        autoplayRef.current = setInterval(() => {
            emblaApi.scrollNext()
        }, 5000)
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

    return (
        <section className="relative w-full bg-slate-50">

            <div
                ref={emblaRef}
                className="overflow-hidden"
                onMouseEnter={stopAutoplay}
                onMouseLeave={startAutoplay}
            >

                <div className="flex">

                    {slides.map((slide, index) => (

                        <div
                            key={index}
                            className="flex-[0_0_100%] h-[480px] relative"
                        >

                            {/* BACKGROUND */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${slide.image})` }}
                            />

                            {/* OVERLAY */}
                            <div className="absolute inset-0 bg-black/60" />

                            {/* CONTENT */}
                            <div className="relative max-w-7xl mx-auto h-full px-6 flex flex-col justify-center">

                                {/* TITLE */}
                                <h1 className="text-3xl md:text-4xl font-semibold text-white max-w-2xl leading-tight">
                                    {slide.title}
                                </h1>

                                {/* DESCRIPTION */}
                                <p className="text-white/80 mt-3 max-w-xl text-sm">
                                    {slide.description}
                                </p>

                                {/* FEATURES */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 max-w-3xl">

                                    {slide.features.map((feature, i) => (

                                        <div
                                            key={i}
                                            className="bg-white/95 rounded-md px-3 py-2 text-xs font-medium text-slate-700 hover:shadow transition"
                                        >
                                            {feature}
                                        </div>

                                    ))}

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            {/* LEFT ARROW */}
            <button
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
            >
                <ChevronLeft size={18} />
            </button>

            {/* RIGHT ARROW */}
            <button
                onClick={() => emblaApi?.scrollNext()}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
            >
                <ChevronRight size={18} />
            </button>

        </section>
    )
}