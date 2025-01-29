import { useState } from 'react'
import type { Package, AddOn } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

interface PackageComparisonProps {
  packages: Package[]
  addOns: AddOn[]
  selectedPackageId: string | null
  onPackageSelect: (packageId: string) => void
  onChoosePackage: (packageId: string, selectedAddOnIds?: string[]) => void
}

export function PackageComparison({ 
  packages, 
  addOns,
  selectedPackageId, 
  onPackageSelect,
  onChoosePackage 
}: PackageComparisonProps) {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [focusedImage, setFocusedImage] = useState<string | null>(null)
  const [showAddOns, setShowAddOns] = useState(false)
  const [selectedPackageForAddOns, setSelectedPackageForAddOns] = useState<Package | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<{ [packageId: string]: string[] }>({})

  const handleViewDetails = (pkg: Package) => {
    setSelectedPackage(pkg)
    onPackageSelect(pkg.id)
  }

  const handleCloseDetails = () => {
    setSelectedPackage(null)
    setFocusedImage(null)
  }

  const handleChoosePackage = (packageId: string) => {
    const packageAddOns = selectedAddOns[packageId] || []
    onChoosePackage(packageId, packageAddOns)
    router.push('/cart')
  }

  const handleViewAddOns = (pkg: Package) => {
    setSelectedPackageForAddOns(pkg)
    setShowAddOns(true)
  }

  const handleAddOnToggle = (packageId: string, addOnId: string) => {
    setSelectedAddOns(prev => {
      const packageAddOns = prev[packageId] || []
      const isSelected = packageAddOns.includes(addOnId)
      
      const updatedPackageAddOns = isSelected
        ? packageAddOns.filter(id => id !== addOnId)
        : [...packageAddOns, addOnId]
      
      return {
        ...prev,
        [packageId]: updatedPackageAddOns
      }
    })
  }

  const getPackageTotal = (pkg: Package) => {
    const packageAddOns = selectedAddOns[pkg.id] || []
    const addOnsTotal = packageAddOns.reduce((total, addOnId) => {
      const addon = addOns.find(a => a.id === addOnId)
      return total + (addon?.price || 0)
    }, 0)
    return pkg.price + addOnsTotal
  }

  const getSelectedAddOnsForPackage = (packageId: string) => {
    const packageAddOns = selectedAddOns[packageId] || []
    return addOns.filter(addon => packageAddOns.includes(addon.id))
  }

  const filteredAddOns = selectedPackageForAddOns
    ? addOns.filter(addon => addon.packages?.includes(selectedPackageForAddOns.id))
    : []

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg) => (
          <div 
            key={pkg.id}
            className={cn(
              "bg-white rounded-lg border transition-all duration-300",
              pkg.id === 'webinar' && "relative",
              selectedPackageId === pkg.id ? "border-[#0095ff]" : "border-gray-200",
              showAddOns && selectedPackageForAddOns && selectedPackageForAddOns.id !== pkg.id && "opacity-30"
            )}
          >
            {pkg.id === 'webinar' && (
              <div className="absolute -top-3 right-4 bg-[#0095ff] text-white px-3 py-1 text-sm font-medium rounded-md">
                Most Popular
              </div>
            )}
            <div className="p-6">
              {pkg.image && (
                <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-[#072948] mb-2">{pkg.name}</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{pkg.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="text-2xl font-bold text-[#072948]">
                  {formatCurrency(pkg.price).replace('.00', '')}
                  <span className="text-sm font-normal text-gray-500">/event</span>
                </div>
                
                {/* Selected Add-ons */}
                {getSelectedAddOnsForPackage(pkg.id).length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    {getSelectedAddOnsForPackage(pkg.id).map(addon => (
                      <div key={addon.id} className="flex justify-between text-sm text-gray-600">
                        <span>{addon.name}</span>
                        <span>{formatCurrency(addon.price).replace('.00', '')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 mt-2 border-t border-gray-100 font-semibold text-[#072948]">
                      <span>Total</span>
                      <span>{formatCurrency(getPackageTotal(pkg)).replace('.00', '')}</span>
                    </div>
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {pkg.keyFeatures.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-[#0095ff] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{feature.value}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <button
                  onClick={() => handleChoosePackage(pkg.id)}
                  className="w-full bg-[#0095ff] hover:bg-[#007acc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Choose Package
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleViewDetails(pkg)}
                    className="w-full text-[#072948] hover:text-[#0095ff] text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleViewAddOns(pkg)}
                    className="w-full text-[#072948] hover:text-[#0095ff] text-sm font-medium transition-colors"
                  >
                    View Add-ons
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Package Details Dialog */}
      <Dialog open={selectedPackage !== null} onOpenChange={() => handleCloseDetails()}>
        <DialogContent className="max-w-3xl">
          {selectedPackage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                {selectedPackage.image && (
                  <>
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-3">
                      <Image
                        src={focusedImage || selectedPackage.image}
                        alt={selectedPackage.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div 
                        className={cn(
                          "relative aspect-[4/3] rounded-md overflow-hidden border cursor-pointer transition-all",
                          focusedImage === selectedPackage.image 
                            ? "border-[#0095ff] opacity-100 shadow-md" 
                            : "border-gray-100 opacity-80 hover:opacity-100"
                        )}
                        onClick={() => setFocusedImage(selectedPackage.image)}
                      >
                        <Image
                          src={selectedPackage.image}
                          alt={`${selectedPackage.name} main preview`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {(selectedPackage.additionalImages || []).slice(0, 3).map((img, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "relative aspect-[4/3] rounded-md overflow-hidden border cursor-pointer transition-all",
                            focusedImage === img 
                              ? "border-[#0095ff] opacity-100 shadow-md" 
                              : "border-gray-100 opacity-80 hover:opacity-100"
                          )}
                          onClick={() => setFocusedImage(img)}
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
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#072948] mb-2">{selectedPackage.name}</h2>
                <p className="text-gray-600 mb-6">{selectedPackage.description}</p>
                
                <div className="text-3xl font-bold text-[#072948] mb-6">
                  {formatCurrency(selectedPackage.price).replace('.00', '')}
                  <span className="text-base font-normal text-gray-500">/event</span>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[#072948] mb-4">Key Features</h3>
                  <ul className="space-y-3">
                    {selectedPackage.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[#0095ff] flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    handleChoosePackage(selectedPackage.id)
                    handleCloseDetails()
                  }}
                  className="w-full bg-[#0095ff] hover:bg-[#007acc] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Choose Package
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add-ons Expandable Section with Overlay */}
      {showAddOns && selectedPackageForAddOns && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddOns(false)
              setSelectedPackageForAddOns(null)
            }
          }}
        >
          <div className="min-h-screen px-4 text-center">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <div className="inline-block w-full max-w-5xl p-6 my-8 text-left align-middle bg-gray-50 rounded-lg border border-gray-200 shadow-xl transition-all">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#072948]">
                  Add-ons for {selectedPackageForAddOns.name}
                </h3>
                <button
                  onClick={() => {
                    setShowAddOns(false)
                    setSelectedPackageForAddOns(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {filteredAddOns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAddOns.map((addon) => (
                    <div 
                      key={addon.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-[#0095ff] transition-colors cursor-pointer"
                    >
                      <label className="flex items-start gap-3 w-full">
                        <input
                          type="checkbox"
                          checked={selectedAddOns[selectedPackageForAddOns.id]?.includes(addon.id) || false}
                          onChange={() => handleAddOnToggle(selectedPackageForAddOns.id, addon.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0095ff] focus:ring-[#0095ff] cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-[#072948]">{addon.name}</h4>
                            <div className="text-lg font-bold text-[#072948]">
                              {formatCurrency(addon.price).replace('.00', '')}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{addon.description}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No add-ons available for this package
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
