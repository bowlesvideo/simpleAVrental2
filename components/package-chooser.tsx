'use client'

import { useState, useEffect, memo, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { cn } from '@/lib/utils'
import type { Package, AddOn, PackageFeature } from '@/lib/types'
import { featureIcons } from '@/lib/constants'
import Image from 'next/image'
import { PackageDetailsModal } from './package-details-modal'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from 'next/navigation'
import { marked } from 'marked'
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { X } from "lucide-react"

// Configure marked for GitHub Flavored Markdown
marked.setOptions({
  gfm: true,
  breaks: true
});

const formatPrice = (price: number | undefined): string => {
  if (typeof price === 'undefined') return '$0'
  return `$${price.toLocaleString()}`
}

interface FeatureValue {
  value: string
  available: boolean
}

function getPackageFeatures(pkg: Package): Record<string, FeatureValue> {
  return pkg.keyFeatures.reduce((acc, feature) => ({
    ...acc,
    [feature.icon]: {
      value: feature.value,
      available: true
    }
  }), {} as Record<string, FeatureValue>)
}

interface PackageChooserProps {
  packages: Package[];
  addOns: AddOn[];
  addonGroups: { id: string; label: string }[];
  onPackageSelect: (packageId: string) => void;
  onChoosePackage: (packageId: string) => void;
  onAddOnToggle: (addOnId: string) => void;
  selectedPackageId: string | null;
  selectedAddOnIds: string[];
}

const PackageButtons = memo(({ 
  packages, 
  selectedPackageId, 
  onPackageSelect 
}: { 
  packages: Package[], 
  selectedPackageId: string | null, 
  onPackageSelect: (pkg: Package) => void 
}) => {
  return (
    <div className="lg:col-span-3 space-y-3">
      {packages.map((pkg) => (
        <button
          key={pkg.id}
          onClick={() => onPackageSelect(pkg)}
          className={cn(
            "w-full text-left px-5 py-4 rounded-lg transition-all duration-200",
            selectedPackageId === pkg.id
              ? "bg-[#0095ff] text-white"
              : "bg-white/5 hover:bg-white/10"
          )}
        >
          <h3 className="text-lg font-semibold text-white mb-1">
            {pkg.name}
          </h3>
          <p className="text-sm text-white/70">
            Starting at {formatPrice(pkg.price)}
          </p>
        </button>
      ))}
    </div>
  )
})

const AddOnItem = memo(({ 
  addon,
  isSelected,
  onToggle
}: { 
  addon: AddOn,
  isSelected: boolean,
  onToggle: () => void
}) => (
  <div
    className={cn(
      "relative rounded-lg transition-all duration-200",
      isSelected
        ? "bg-[#0095ff]/10 border-transparent shadow-md"
        : "bg-white/5 hover:bg-white/10 border-white/10"
    )}
  >
    <label className="flex items-start p-4 cursor-pointer">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0095ff] focus:ring-[#0095ff]"
      />
      <div className="ml-4">
        <h4 className="text-base font-semibold text-white">{addon.name}</h4>
        <p className="text-sm text-white/70 mt-1 leading-relaxed">{addon.description}</p>
        <p className="text-base font-medium text-[#0095ff] mt-2">{formatPrice(addon.price)}</p>
      </div>
    </label>
  </div>
))

const AddOnSection = memo(({ 
  addOns, 
  selectedPackageId, 
  selectedAddOnIds, 
  onAddOnToggle 
}: { 
  addOns: AddOn[], 
  selectedPackageId: string, 
  selectedAddOnIds: string[], 
  onAddOnToggle: (id: string) => void 
}) => {
  const filteredAddOns = addOns.filter(addon => addon.packages?.includes(selectedPackageId))
  
  return (
    <div className="border-t border-white/10 px-6 py-6 bg-[#072948]/50 rounded-b-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Available Add-ons</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAddOns.map((addon) => (
          <AddOnItem
            key={addon.id}
            addon={addon}
            isSelected={selectedAddOnIds.includes(addon.id)}
            onToggle={() => onAddOnToggle(addon.id)}
          />
        ))}
      </div>
    </div>
  )
})

const PackageDetails = memo(({ 
  selectedPackage,
  onChoosePackage,
  selectedAddOnIds,
  addOns
}: { 
  selectedPackage: Package | null,
  onChoosePackage: (pkg: Package) => void,
  selectedAddOnIds: string[],
  addOns: AddOn[]
}) => {
  if (!selectedPackage) {
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center text-white/70">
          <h3 className="text-xl font-medium mb-2">Select a Package</h3>
          <p className="text-base">Choose a package from the left to view its details</p>
        </div>
      </div>
    )
  }

  // Calculate total price including selected add-ons
  const addOnTotal = selectedAddOnIds.reduce((total, id) => {
    const addon = addOns.find(a => a.id === id)
    return total + (addon?.price || 0)
  }, 0)
  const totalPrice = selectedPackage.price + addOnTotal

  return (
    <div className="bg-white rounded-xl">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {selectedPackage.image && (
              <>
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-3">
                  <Image
                    src={selectedPackage.image}
                    alt={selectedPackage.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(selectedPackage.additionalImages || []).slice(0, 4).map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative aspect-[4/3] rounded-md overflow-hidden border border-gray-100 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Image
                        src={img}
                        alt={`${selectedPackage.name} preview ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div className="flex flex-col mt-5 pt-5 border-t">
              <div>
                <p className="text-3xl font-bold text-[#072948]">{formatPrice(totalPrice)}</p>
                {addOnTotal > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Base package: {formatPrice(selectedPackage.price)}
                    <br />
                    Add-ons: +{formatPrice(addOnTotal)}
                  </p>
                )}
              </div>
              <Button
                size="lg"
                className="bg-[#0095ff] hover:bg-[#007acc] text-white w-full mt-5 py-6 text-base font-semibold"
                onClick={() => onChoosePackage(selectedPackage)}
              >
                Choose Package
              </Button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#072948] mb-3">{selectedPackage.name}</h2>
                <p className="text-base text-gray-600 leading-relaxed">{selectedPackage.description}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#072948] mb-4">Key Features</h3>
              <div className="space-y-4">
                {selectedPackage.keyFeatures.map((feature) => (
                  <div key={feature.icon} className="flex items-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 mr-3 flex-shrink-0 text-[#0095ff]"
                      fill="currentColor"
                    >
                      <path d={featureIcons[feature.icon as keyof typeof featureIcons]} />
                    </svg>
                    <span className="text-base text-gray-700">{feature.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

PackageButtons.displayName = 'PackageButtons'
AddOnItem.displayName = 'AddOnItem'
AddOnSection.displayName = 'AddOnSection'
PackageDetails.displayName = 'PackageDetails'

const PackageChooserContent = memo(({
  packages,
  addOns,
  selectedPackageId,
  selectedAddOnIds,
  selectedPackage,
  onPackageSelect,
  onAddOnToggle,
  onChoosePackage
}: {
  packages: Package[],
  addOns: AddOn[],
  selectedPackageId: string | null,
  selectedAddOnIds: string[],
  selectedPackage: Package | null,
  onPackageSelect: (pkg: Package) => void,
  onAddOnToggle: (id: string) => void,
  onChoosePackage: (pkg: Package) => void
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <PackageButtons 
      packages={packages} 
      selectedPackageId={selectedPackageId} 
      onPackageSelect={onPackageSelect} 
    />
    <div className="lg:col-span-9">
      <PackageDetails 
        selectedPackage={selectedPackage} 
        onChoosePackage={onChoosePackage}
        selectedAddOnIds={selectedAddOnIds}
        addOns={addOns}
      />
      {selectedPackage && (
        <AddOnSection
          addOns={addOns}
          selectedPackageId={selectedPackage.id}
          selectedAddOnIds={selectedAddOnIds}
          onAddOnToggle={onAddOnToggle}
        />
      )}
    </div>
  </div>
))

PackageChooserContent.displayName = 'PackageChooserContent'

export function PackageChooser({
  packages,
  addOns,
  addonGroups,
  onPackageSelect,
  onChoosePackage,
  onAddOnToggle,
  selectedPackageId,
  selectedAddOnIds
}: PackageChooserProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const router = useRouter()
  const { addPackage } = useCart()

  const selectedPackage = useMemo(() => 
    selectedPackageId ? packages.find(p => p.id === selectedPackageId) || null : null
  , [selectedPackageId, packages])

  const handlePackageSelect = (pkg: Package) => {
    onPackageSelect(pkg.id)
  }

  const handleChoosePackage = (pkg: Package) => {
    onChoosePackage(pkg.id)
    router.push('/cart')
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PackageChooserContent
        packages={packages}
        addOns={addOns}
        selectedPackageId={selectedPackageId}
        selectedAddOnIds={selectedAddOnIds}
        selectedPackage={selectedPackage}
        onPackageSelect={handlePackageSelect}
        onAddOnToggle={onAddOnToggle}
        onChoosePackage={handleChoosePackage}
      />
    </div>
  )
}

// Helper function to get ideal use cases based on package ID
function getIdealForList(packageId: string): string[] {
  switch (packageId) {
    case 'meeting':
      return [
        'Board Meetings',
        'Client Presentations',
        'Team Updates',
        'Small Group Discussions'
      ]
    case 'webinar':
      return [
        'Online Workshops',
        'Product Launches',
        'Educational Sessions',
        'Interactive Presentations'
      ]
    case 'training':
      return [
        'Employee Training',
        'Skill Development Workshops',
        'Technical Training',
        'Certification Programs'
      ]
    case 'townhall':
      return [
        'Company-Wide Meetings',
        'Annual Gatherings',
        'Executive Presentations',
        'Large Scale Events'
      ]
    default:
      return []
  }
} 