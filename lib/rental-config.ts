import { prisma } from './prisma'
import type { Package, AddOn, RentalConfig } from './types'

export const DEFAULT_GROUPS = [
  {
    id: "recording-streaming",
    label: "Recording & Streaming"
  },
  {
    id: "equipment-staff",
    label: "Equipment & Staff"
  },
  {
    id: "production-enhancements",
    label: "Production Enhancements"
  },
  {
    id: "delivery-options",
    label: "Delivery Options"
  }
]

let cachedConfig: RentalConfig | null = null

export async function getRentalConfig(): Promise<RentalConfig> {
  if (cachedConfig) return cachedConfig
  
  const config = await prisma.rentalConfig.findUnique({
    where: { id: 'default' }
  })
  
  if (!config) {
    throw new Error('No rental configuration found')
  }
  
  return {
    packages: config.packages as unknown as Package[],
    addOns: config.addOns as unknown as AddOn[],
    keyFeatures: config.keyFeatures as unknown as string[],
    addonGroups: config.addonGroups as unknown as { id: string; label: string }[]
  }
}

export async function getPackages(): Promise<Package[]> {
  const config = await getRentalConfig()
  return config.packages
}

export async function getAddOns(): Promise<AddOn[]> {
  const config = await getRentalConfig()
  return config.addOns
}

export async function getPackageBySlug(slug: string): Promise<Package | undefined> {
  const packages = await getPackages()
  return packages.find(p => p.slug === slug)
}

export async function getFilteredAddOns(packageId: string): Promise<AddOn[]> {
  const addOns = await getAddOns()
  return addOns.filter(addon => !addon.packages || addon.packages.includes(packageId))
}

export async function getAddOnByValue(value: string): Promise<AddOn | undefined> {
  const addOns = await getAddOns()
  return addOns.find(a => a.value === value)
}

export async function updateRentalConfig(config: RentalConfig) {
  await prisma.rentalConfig.update({
    where: { id: 'default' },
    data: {
      packages: JSON.parse(JSON.stringify(config.packages)),
      addOns: JSON.parse(JSON.stringify(config.addOns)),
      keyFeatures: JSON.parse(JSON.stringify(config.keyFeatures)),
      addonGroups: JSON.parse(JSON.stringify(config.addonGroups))
    }
  })
  
  // Update the cache
  cachedConfig = config
}