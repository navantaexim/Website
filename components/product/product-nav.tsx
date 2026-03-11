"use client"

export default function ProductNav() {

    const sections = [
        "overview",
        "specs",
        "manufacturing",
        "compliance"
    ]

    return (
        <div className="sticky top-16 bg-white border-b z-10">

            <div className="max-w-7xl mx-auto flex gap-8 px-6 py-3 text-sm">

                {sections.map(section => (
                    <a
                        key={section}
                        href={`#${section}`}
                        className="hover:text-primary"
                    >
                        {section}
                    </a>
                ))}

            </div>

        </div>
    )
}