// prisma/seed.js
// Seeds the database with sample companies and a default settings record

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default settings
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      agentName: 'Aisha',
      agentAvatar: '🧕',
    },
    update: {},
  })

  // Seed Sri Lanka insurance companies
  const companies = [
    { name: 'AIA Sri Lanka',           website: 'https://www.aia.com.lk' },
    { name: 'Ceylinco Life',           website: 'https://www.ceylincolife.com' },
    { name: 'Union Assurance',         website: 'https://www.unionassurance.com' },
    { name: 'Sri Lanka Insurance',     website: 'https://www.slic.com.lk' },
    { name: 'Softlogic Life',          website: 'https://www.softlogiclife.lk' },
    { name: 'Allianz Lanka',           website: 'https://www.allianz.lk' },
    { name: 'HNB Assurance',           website: 'https://www.hnbassurance.com' },
    { name: 'Janashakthi Insurance',   website: 'https://www.janashakthi.com' },
  ]

  for (const company of companies) {
    await prisma.company.upsert({
      where: { id: company.name.toLowerCase().replace(/\s/g, '-') },
      create: { id: company.name.toLowerCase().replace(/\s/g, '-'), ...company },
      update: {},
    })
  }

  console.log('✅ Database seeded with', companies.length, 'insurance companies')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
