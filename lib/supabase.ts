import { createClient } from '@supabase/supabase-js'
import type { RentalConfig } from './types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function getRentalConfigFromDB() {
  const { data, error } = await supabase
    .from('rental_config')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching rental config:', error)
    return null
  }

  return data as RentalConfig
}

export async function updateRentalConfigInDB(config: RentalConfig) {
  const { error } = await supabase
    .from('rental_config')
    .upsert({
      id: 'default',
      packages: config.packages,
      addOns: config.addOns,
      keyFeatures: config.keyFeatures,
      addonGroups: config.addonGroups,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error updating rental config:', error)
    throw error
  }
} 