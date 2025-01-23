import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { RentalConfig } from '@/lib/types'

export const revalidate = 0 // disable cache for this route

export async function GET() {
  try {
    console.log('Fetching rental config from database...')
    const config = await prisma.rentalConfig.findUnique({
      where: { id: 'default' }
    })

    if (!config) {
      console.log('No configuration found')
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      )
    }

    try {
      console.log('Raw config from DB:', config)
      // Parse JSON fields
      const parsedConfig: RentalConfig = {
        packages: typeof config.packages === 'string' ? JSON.parse(config.packages) : config.packages,
        addOns: typeof config.addOns === 'string' ? JSON.parse(config.addOns) : config.addOns,
        keyFeatures: typeof config.keyFeatures === 'string' ? JSON.parse(config.keyFeatures) : config.keyFeatures,
        addonGroups: typeof config.addonGroups === 'string' ? JSON.parse(config.addonGroups) : config.addonGroups
      }
      console.log('Parsed config:', parsedConfig)

      // Set cache control headers
      const headers = {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Content-Type': 'application/json',
      }

      return NextResponse.json(parsedConfig, { headers })
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError)
      return NextResponse.json(
        { error: 'Invalid configuration format' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching rental config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
} 