const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const countries = [
  { name: 'India', isoCode: 'IN' },
]

async function main() {
  console.log('Seeding countries...')
  for (const country of countries) {
    const existing = await prisma.country.findFirst({ 
      where: { 
        OR: [
          { name: country.name },
          { isoCode: country.isoCode }
        ]
      } 
    })
    
    if (!existing) {
      await prisma.country.create({ data: country })
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
