import { featureIcons } from './constants'

export type PackageFeature = {
  value: string
  icon: keyof typeof featureIcons
}

export interface Package {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image: string
  additionalImages?: string[]
  keyFeatures: PackageFeature[]
  includedItems: string[]
}

export interface AddOn {
  id: string
  name: string
  description: string
  value: string
  price: number
  image?: string
  packages?: string[]
}

export interface RentalConfig {
  packages: Package[]
  addOns: AddOn[]
  keyFeatures: string[]
  addonGroups: { id: string; label: string }[]
} 