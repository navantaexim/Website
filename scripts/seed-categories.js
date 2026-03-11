const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const categories = [
  'Industrial Machinery & Equipment',
  'Auto Components & Precision Parts',
  'Electrical & Power Equipment',
  'Pumps, Valves & Flow Control',
  'Castings, Forgings & Metal Components',
  'Fasteners & Hardware',
  'Industrial Tools & Tooling',
  'EPC & Infrastructure Components',
  'Renewable Energy Equipment',
  'Material Handling Systems',
]

async function main() {
  console.log('Seeding categories...')
  for (const name of categories) {
    const existing = await prisma.category.findFirst({ where: { name } })
    if (!existing) {
      await prisma.category.create({ data: { name } })
    }
  }
  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
