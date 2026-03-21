"use client"

import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import CategoryCircle from "./category-circle"
import { categoryIcons } from "./category-icons"

const categories = [
    "Industrial Machinery",
    "Auto Components",
    "Electrical Equipment",
    "Pumps & Valves",
    "Castings & Forgings",
    "Fasteners",
    "Industrial Tools",
    "EPC Components",
    "Renewable Energy",
    "Material Handling",
    "Process Equipment",
    "Automation",
    "Instrumentation",
    "Hydraulics",
    "HVAC",
    "Oil & Gas",
    "Mining Equipment",
    "Aerospace",
    "Railway Equipment",
    "Marine Equipment",
    "Safety Equipment",
    "Coating Systems",
    "Polymers",
    "Rubber Products",
    "Fabrication",
    "Specialty Alloys",
    "Energy Storage",
    "Water Treatment",
    "Electronics",
]

export default function CategoryStrip() {

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        dragFree: true,
    })

    return (
        <section className="bg-white border-b border-slate-200 py-4">

            <div className="max-w-7xl mx-auto px-6 relative">

                {/* ARROWS */}
                <button
                    onClick={() => emblaApi?.scrollPrev()}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow"
                >
                    <ChevronLeft size={16} />
                </button>

                <button
                    onClick={() => emblaApi?.scrollNext()}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow"
                >
                    <ChevronRight size={16} />
                </button>

                {/* SCROLLER */}
                <div ref={emblaRef} className="overflow-hidden">

                    <div className="flex gap-5">

                        {categories.map((cat) => (
                            <div key={cat} className="flex-[0_0_auto]">

                                <CategoryCircle
                                    name={cat}
                                    icon={categoryIcons[cat] || "/categories/default.svg"}
                                />

                            </div>
                        ))}

                    </div>

                </div>

            </div>

        </section>
    )
}