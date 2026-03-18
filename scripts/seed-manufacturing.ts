import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const engineeringCategories = [
    "Industrial Machinery & Equipment",
    "Auto Components & Precision Parts",
    "Electrical & Power Equipment",
    "Pumps, Valves & Flow Control",
    "Castings, Forgings & Metal Components",
    "Fasteners & Hardware",
    "Industrial Tools & Tooling",
    "EPC & Infrastructure Components",
    "Renewable Energy Equipment",
    "Material Handling Systems",
    "Process Plant Equipment (Pressure vessels, heat exchangers, reactors, boilers)",
    "Automation & Industrial Control Systems (PLC, SCADA, DCS, sensors, robotics)",
    "Instrumentation & Measurement Equipment (Gauges, transmitters, testing instruments)",
    "Hydraulics & Pneumatics (Cylinders, compressors, air systems)",
    "HVAC & Refrigeration Systems",
    "Oil & Gas Equipment",
    "Mining & Construction Equipment",
    "Defense & Aerospace Components",
    "Railway & Transportation Equipment",
    "Marine & Shipbuilding Equipment",
    "Industrial Safety Equipment",
    "Surface Treatment & Coating Systems",
    "Plastic & Polymer Engineering Products",
    "Rubber & Sealing Products",
    "Fabrication & Structural Engineering",
    "Specialty Alloys & Advanced Materials",
    "Energy Storage Systems (Batteries, ESS, hydrogen systems)",
    "Water & Wastewater Treatment Equipment",
    "Electronics & Embedded Systems"
];

const machineCategories = [
    {
        name: "CNC Machining & Metal Cutting",
        machines: [
            "CNC Turning Centers (Lathe)",
            "CNC Vertical Machining Centers (VMC)",
            "CNC Horizontal Machining Centers (HMC)",
            "CNC Milling Machines",
            "CNC Boring Machines",
            "Multi-Axis / 5-Axis CNC Machines"
        ]
    },
    {
        name: "Conventional Machining",
        machines: [
            "Lathe Machines",
            "Milling Machines",
            "Drilling Machines",
            "Shaping & Slotting Machines",
            "Boring Machines"
        ]
    },
    {
        name: "Sheet Metal Fabrication",
        machines: [
            "CNC Laser Cutting Machines",
            "CNC Plasma Cutting Machines",
            "CNC Turret Punch Press",
            "Press Brake Machines",
            "Shearing Machines",
            "Plate Rolling Machines"
        ]
    },
    {
        name: "Grinding & Finishing",
        machines: [
            "Surface Grinding Machines",
            "Cylindrical Grinding Machines",
            "Centerless Grinding Machines",
            "Tool & Cutter Grinders",
            "Lapping Machines",
            "Polishing Machines"
        ]
    },
    {
        name: "Casting, Forging & Forming",
        machines: [
            "Induction Furnaces",
            "Forging Presses (Hydraulic / Mechanical)",
            "Drop Hammer Forging Machines",
            "Die Casting Machines",
            "Injection Molding Machines",
            "Cold Heading Machines"
        ]
    },
    {
        name: "Welding & Joining",
        machines: [
            "MIG / TIG Welding Machines",
            "Arc Welding Machines",
            "Spot Welding Machines",
            "Submerged Arc Welding (SAW) Machines",
            "Robotic Welding Cells",
            "Brazing & Soldering Units"
        ]
    },
    {
        name: "Heat Treatment & Surface Treatment",
        machines: [
            "Heat Treatment Furnaces",
            "Induction Hardening Machines",
            "Quenching Systems",
            "Shot Blasting Machines",
            "Surface Coating & Plating Lines",
            "Galvanizing Plants"
        ]
    },
    {
        name: "Tooling & Precision Manufacturing",
        machines: [
            "Wire EDM Machines",
            "Die Sinking EDM Machines",
            "CNC Tool Grinding Machines",
            "Jig Boring Machines",
            "Mold & Die Making Machines"
        ]
    },
    {
        name: "Assembly & Automation",
        machines: [
            "Assembly Lines",
            "Automated Assembly Systems",
            "Hydraulic & Pneumatic Presses",
            "Robotic Handling Systems",
            "Conveyor Systems"
        ]
    },
    {
        name: "Quality Control & Testing",
        machines: [
            "Coordinate Measuring Machines (CMM)",
            "Optical Measuring Systems",
            "Hardness Testing Machines",
            "Tensile Testing Machines",
            "Surface Roughness Testers",
            "Non-Destructive Testing (UT / RT / MPI / DPI)"
        ]
    },
    {
        name: "Material Handling & Utilities",
        machines: [
            "Overhead Cranes",
            "Forklifts",
            "Material Handling Conveyors",
            "Air Compressors",
            "Industrial Chillers",
            "Power Backup Systems"
        ]
    }
];

async function main() {
    console.log("Seeding Engineering Categories...");
    for (const name of engineeringCategories) {
        await prisma.engineeringCategory.upsert({
            where: { name },
            update: {},
            create: { name }
        });
    }

    console.log("Seeding Machine Categories and Machines...");
    for (const cat of machineCategories) {
        const mc = await prisma.machineCategory.upsert({
            where: { name: cat.name },
            update: {},
            create: { name: cat.name }
        });

        for (const machineName of cat.machines) {
            await prisma.machine.upsert({
                where: {
                    name_machineCategoryId: {
                        name: machineName,
                        machineCategoryId: mc.id
                    }
                },
                update: {},
                create: {
                    name: machineName,
                    machineCategoryId: mc.id
                }
            });
        }
    }

    console.log("Seeding completed successfully.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
