import { NextResponse } from 'next/server'
import { getPackages, updateRentalConfig, getRentalConfig } from '@/lib/rental-config'

export async function GET() {
  try {
    const packages = getPackages()
    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, price } = await request.json()
    const config = await getRentalConfig()
    const packageIndex = config.packages.findIndex(p => p.id === id)
    
    if (packageIndex === -1) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    config.packages[packageIndex].price = price
    updateRentalConfig(config)

    return NextResponse.json(config.packages[packageIndex])
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    )
  }
} 