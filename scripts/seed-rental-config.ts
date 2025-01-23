import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function seedRentalConfig() {
  try {
    // Read the initial configuration from the JSON file
    const configPath = join(process.cwd(), 'data/rental-config.json')
    const configData = readFileSync(configPath, 'utf8')
    const initialConfig = JSON.parse(configData)

    // Update or create the rental configuration
    const result = await prisma.rentalConfig.upsert({
      where: { id: 'default' },
      update: {
        packages: initialConfig.packages,
        addOns: initialConfig.addOns,
        keyFeatures: initialConfig.keyFeatures || [],
        addonGroups: initialConfig.addonGroups || []
      },
      create: {
        id: 'default',
        packages: initialConfig.packages,
        addOns: initialConfig.addOns,
        keyFeatures: initialConfig.keyFeatures || [],
        addonGroups: initialConfig.addonGroups || []
      }
    })

    console.log('Rental configuration seeded successfully:', result)
  } catch (error) {
    console.error('Error seeding rental configuration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedRentalConfig() 