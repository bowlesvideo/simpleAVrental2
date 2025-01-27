import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { RentalConfig, Package, AddOn } from '@/lib/types'
import { Prisma } from '@prisma/client'

// Route Segment Config
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('Starting config update...')
    
    if (!request.body) {
      throw new Error('Request body is empty')
    }
    
    let updatedConfig: RentalConfig
    try {
      // First try the standard way
      updatedConfig = await request.json()
    } catch (error) {
      console.log('Standard parsing failed, trying stream reading...')
      // Fallback to stream reading if the payload is too large
      const chunks = []
      const reader = request.body.getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      
      const buffer = Buffer.concat(chunks)
      updatedConfig = JSON.parse(buffer.toString())
    }
    
    // Log the full request data
    console.log('Received update request:', {
      timestamp: new Date().toISOString(),
      packagesCount: updatedConfig.packages?.length || 0,
      addOnsCount: updatedConfig.addOns?.length || 0,
      keyFeaturesCount: updatedConfig.keyFeatures?.length || 0,
      addonGroupsCount: updatedConfig.addonGroups?.length || 0
    })
    
    // Validate the data before serialization
    if (!updatedConfig.packages || !Array.isArray(updatedConfig.packages)) {
      console.error('Invalid packages data received:', updatedConfig.packages)
      throw new Error('Invalid packages data: expected array')
    }
    
    // Get current config to compare changes
    console.log('Fetching current config from database...')
    const currentConfig = await prisma.rentalConfig.findUnique({
      where: { id: 'default' }
    })
    
    let currentPackages: Package[] = []
    if (currentConfig?.packages) {
      try {
        // Handle the case where packages might be a string or already parsed
        currentPackages = typeof currentConfig.packages === 'string' 
          ? JSON.parse(currentConfig.packages)
          : currentConfig.packages
      } catch (e) {
        console.warn('Failed to parse current packages:', e)
      }
    }
    
    console.log('Changes in packages:', {
      current: currentPackages.map(p => ({ id: p.id, name: p.name })),
      updated: updatedConfig.packages.map(p => ({ id: p.id, name: p.name }))
    })
    
    // Ensure all arrays exist with defaults
    const packages = updatedConfig.packages || []
    const addOns = updatedConfig.addOns || []
    const keyFeatures = updatedConfig.keyFeatures || []
    const addonGroups = updatedConfig.addonGroups || []
    
    // Prepare data for database storage - ensure proper JSON serialization
    const serializedData = {
      packages: JSON.stringify(packages),
      addOns: JSON.stringify(addOns),
      keyFeatures: JSON.stringify(keyFeatures),
      addonGroups: JSON.stringify(addonGroups)
    }
    
    console.log('Saving configuration to database...')
    const result = await prisma.rentalConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ...serializedData
      },
      update: serializedData
    })
    
    // Verify the saved data
    console.log('Database operation completed. Verifying saved data...')
    const savedConfig = await prisma.rentalConfig.findUnique({
      where: { id: 'default' }
    })

    if (!savedConfig) {
      throw new Error('Failed to verify saved configuration')
    }

    // Parse the saved data to verify it's valid JSON
    const verifiedData = {
      packages: JSON.parse(savedConfig.packages as string),
      addOns: JSON.parse(savedConfig.addOns as string),
      keyFeatures: JSON.parse(savedConfig.keyFeatures as string),
      addonGroups: JSON.parse(savedConfig.addonGroups as string)
    }

    console.log('Configuration saved and verified successfully')
    
    return NextResponse.json({ 
      success: true,
      data: verifiedData
    })
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 }
    )
  }
} 