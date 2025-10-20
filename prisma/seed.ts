import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Priorities
  await prisma.priority.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Low', targetHours: 168 }
  })
  
  await prisma.priority.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'Normal', targetHours: 72 }
  })
  
  await prisma.priority.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: 'High', targetHours: 24 }
  })

  // Statuses
  await prisma.status.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Submitted' }
  })
  
  await prisma.status.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'Under Review' }
  })
  
  await prisma.status.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: 'In Progress' }
  })
  
  await prisma.status.upsert({
    where: { id: 4 },
    update: {},
    create: { id: 4, name: 'On Hold' }
  })
  
  await prisma.status.upsert({
    where: { id: 5 },
    update: {},
    create: { id: 5, name: 'Resolved' }
  })
  
  await prisma.status.upsert({
    where: { id: 6 },
    update: {},
    create: { id: 6, name: 'Rejected' }
  })

  // Sample Province
  const province = await prisma.province.upsert({
    where: { name: 'Sample Province' },
    update: {},
    create: { name: 'Sample Province' }
  })

  // Sample Municipality
  const municipality = await prisma.municipality.upsert({
    where: { provinceId_name: { provinceId: province.id, name: 'Sample Town' } },
    update: {},
    create: { provinceId: province.id, name: 'Sample Town' }
  })

  // Sample Barangay
  await prisma.barangay.upsert({
    where: { municipalityId_name: { municipalityId: municipality.id, name: 'Central Barangay' } },
    update: {},
    create: { municipalityId: municipality.id, name: 'Central Barangay' }
  })

  // Departments
  const engineeringDept = await prisma.department.upsert({
    where: { code: 'ENG' },
    update: {},
    create: { code: 'ENG', name: 'Engineering' }
  })
  
  const environmentDept = await prisma.department.upsert({
    where: { code: 'ENRO' },
    update: {},
    create: { code: 'ENRO', name: 'Environment' }
  })
  
  const healthDept = await prisma.department.upsert({
    where: { code: 'HEALTH' },
    update: {},
    create: { code: 'HEALTH', name: 'Health' }
  })

  // Categories
  await prisma.category.upsert({
    where: { name: 'Road & Drainage' },
    update: {},
    create: { name: 'Road & Drainage', departmentId: engineeringDept.id }
  })
  
  await prisma.category.upsert({
    where: { name: 'Waste Management' },
    update: {},
    create: { name: 'Waste Management', departmentId: environmentDept.id }
  })
  
  await prisma.category.upsert({
    where: { name: 'Water Supply' },
    update: {},
    create: { name: 'Water Supply', departmentId: engineeringDept.id }
  })
  
  await prisma.category.upsert({
    where: { name: 'Public Health' },
    update: {},
    create: { name: 'Public Health', departmentId: healthDept.id }
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })