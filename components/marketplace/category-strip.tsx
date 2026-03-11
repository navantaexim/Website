import CategoryCircle from "./category-circle"

const categories = [
    { name: "Steel", icon: "/categories/steel.svg" },
    { name: "Fasteners", icon: "/categories/fasteners.svg" },
    { name: "Casting", icon: "/categories/casting.svg" },
    { name: "Machining", icon: "/categories/machining.svg" },
    { name: "Forging", icon: "/categories/forging.svg" },
]

export default function CategoryStrip() {
    return (
        <section className="bg-slate-50 py-12">

            <div className="max-w-7xl mx-auto px-6">

                <h2 className="text-lg font-semibold text-slate-800 mb-8 text-center">
                    Browse Categories
                </h2>

                <div className="flex justify-center gap-10">

                    {categories.map((cat) => (
                        <CategoryCircle
                            key={cat.name}
                            name={cat.name}
                            icon={cat.icon}
                        />
                    ))}

                </div>

            </div>

        </section>
    )
}