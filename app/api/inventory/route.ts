import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PackageData {
  id: string
  name: string
  description: string
  price: number
  image?: string
  keyFeatures?: string[]
  includes?: string[]
}

interface AddonData {
  id: string
  name: string
  description: string
  price: number
  image?: string
}

export async function GET() {
  try {
    console.log('Fetching rental config...')
    const config = await prisma.rentalConfig.findFirst()
    console.log('Raw config:', config)

    if (!config) {
      console.log('No config found')
      return NextResponse.json({ items: [] })
    }

    // Parse JSON fields if they're strings
    const packagesData = typeof config.packages === 'string' 
      ? JSON.parse(config.packages) 
      : config.packages

    const addOnsData = typeof config.addOns === 'string' 
      ? JSON.parse(config.addOns) 
      : config.addOns

    console.log('Parsed packages data:', packagesData)
    console.log('Parsed addOns data:', addOnsData)

    // Transform packages and add-ons into inventory items
    const packageItems = (packagesData || []).map((pkg: any) => ({
      id: pkg.id || '',
      name: pkg.name || '',
      description: pkg.description || '',
      price: typeof pkg.price === 'number' ? pkg.price : 0,
      image: pkg.image || '',
      category: 'Package',
      inStock: true,
      tags: Array.isArray(pkg.keyFeatures) 
        ? pkg.keyFeatures.map((feature: any) => {
            if (typeof feature === 'string') return feature;
            if (typeof feature === 'object' && feature !== null) {
              return feature.value || feature.text || '';
            }
            return String(feature);
          }).filter(Boolean)
        : [],
      specifications: {
        includes: Array.isArray(pkg.includes) ? pkg.includes : []
      }
    }))

    const addonItems = (addOnsData || []).map((addon: any) => ({
      id: addon.id || '',
      name: addon.name || '',
      description: addon.description || '',
      price: typeof addon.price === 'number' ? addon.price : 0,
      image: addon.image || '',
      category: 'Add-on',
      inStock: true,
      tags: [],
      specifications: {}
    }))

    const items = [...packageItems, ...addonItems]
    console.log('Final transformed items:', items)

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
} 
