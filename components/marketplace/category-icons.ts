export const categoryIcons: Record<string, string> = {
    "Industrial Machinery": "/categories/industrial-machinery.svg",
    "Auto Components": "/categories/auto-components.svg",
    "Electrical Equipment": "/categories/electrical-equipment.svg",
    "Pumps & Valves": "/categories/pumps-valves.svg",
    "Castings & Forgings": "/categories/castings-forgings.svg",
    "Fasteners": "/categories/fasteners.svg",
    "Industrial Tools": "/categories/industrial-tools.svg",
    "EPC Components": "/categories/epc-components.svg",
    "Renewable Energy": "/categories/renewable-energy.svg",
    "Material Handling": "/categories/material-handling.svg",
    "Process Equipment": "/categories/process-equipment.svg",
    "Automation": "/categories/automation.svg",
    "Instrumentation": "/categories/instrumentation.svg",
    "Hydraulics": "/categories/hydraulics.svg",
    "HVAC": "/categories/hvac.svg",
    "Oil & Gas": "/categories/oil-gas.svg",
    "Mining Equipment": "/categories/mining-equipment.svg",
    "Aerospace": "/categories/aerospace.svg",
    "Railway Equipment": "/categories/railway-equipment.svg",
    "Marine Equipment": "/categories/marine-equipment.svg",
    "Safety Equipment": "/categories/safety-equipments.svg", // ⚠️ IMPORTANT FIX
    "Coating Systems": "/categories/coating-systems.svg",
    "Polymers": "/categories/polymers.svg",
    "Rubber Products": "/categories/rubber-products.svg",
    "Fabrication": "/categories/fabrication.svg",
    "Specialty Alloys": "/categories/specialty-alloys.svg",
    "Energy Storage": "/categories/energy-storage.svg",
    "Water Treatment": "/categories/water-treatment.svg",
    "Electronics": "/categories/electronics.svg",
}

export function getCategoryIcon(categoryName?: string) {
    if (!categoryName) return "/categories/default.svg"
    return categoryIcons[categoryName] || "/categories/default.svg"
}