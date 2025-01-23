'use server'

import { getRentalConfig, updateRentalConfig } from '@/lib/rental-config'

export async function updateAddOnPrice(value: string, newPrice: number) {
  const config = await getRentalConfig()
  const addonIndex = config.addOns.findIndex(addon => addon.value === value)
  
  if (addonIndex === -1) {
    throw new Error('Add-on not found')
  }

  config.addOns[addonIndex].price = newPrice
  updateRentalConfig(config)
  
  return config.addOns[addonIndex]
} 