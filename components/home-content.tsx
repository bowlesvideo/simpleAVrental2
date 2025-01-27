'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Package, AddOn } from '@/lib/types'
import { PackageChooser } from '@/components/package-chooser'
import { useCart } from '@/context/cart-context'
import { StructuredData } from '@/components/structured-data'
import { SITE_NAME } from '@/lib/constants'

export function HomeContent() {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [addonGroups, setAddonGroups] = useState<{ id: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addPackage, addAddOn, removeItem } = useCart()

  // Memoize callbacks
  const handlePackageSelect = useCallback((packageId: string) => {
    setSelectedPackageId(packageId)
  }, [])

  const handleAddOnToggle = useCallback((addOnId: string) => {
    const addon = addOns.find(a => a.id === addOnId)
    if (!addon) return

    setSelectedAddOnIds(prev => {
      const isSelected = prev.includes(addOnId)
      if (isSelected) {
        return prev.filter(id => id !== addOnId)
      } else {
        return [...prev, addOnId]
      }
    })
  }, [addOns])

  const handleChoosePackage = useCallback((packageId: string) => {
    const selectedPackage = packages.find(p => p.id === packageId)
    if (selectedPackage) {
      // Add the package first
      addPackage(selectedPackage)
      
      // Then add all selected add-ons
      selectedAddOnIds.forEach(addOnId => {
        const addon = addOns.find(a => a.id === addOnId)
        if (addon) {
          addAddOn(addon)
        }
      })
    }
  }, [packages, addOns, selectedAddOnIds, addPackage, addAddOn])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/rental-config?' + new Date().getTime(), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch configuration')
        }
        const config = await response.json()
        setPackages(config.packages || [])
        setAddOns(config.addOns || [])
        setAddonGroups(config.addonGroups || [])
        
        // Set initial selected package
        if (config.packages?.length > 0 && !selectedPackageId) {
          setSelectedPackageId(config.packages[0].id)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load packages and add-ons')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, []) // Only run on mount

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "mainEntity": {
      "@type": "Organization",
      "name": SITE_NAME,
      "description": "Professional video production services with over 20 years of experience",
      "knowsAbout": [
        {
          "@type": "DefinedTerm",
          "name": "Broadcast Production",
          "description": "Studio-quality production values from experienced broadcast team"
        },
        {
          "@type": "DefinedTerm",
          "name": "Corporate Events",
          "description": "Professional video recording and streaming for corporate meetings and events"
        },
        {
          "@type": "DefinedTerm",
          "name": "Commercial Production",
          "description": "High-impact video content for marketing and communications"
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Video Production Services",
        "itemListElement": [
          {
            "@type": "Service",
            "name": "Broadcast Production",
            "description": "Studio-quality production values from our experienced broadcast team"
          },
          {
            "@type": "Service",
            "name": "Corporate Events",
            "description": "Thousands of successful corporate events delivered flawlessly"
          },
          {
            "@type": "Service",
            "name": "Commercial Production",
            "description": "High-impact video content for marketing and communications"
          }
        ]
      }
    },
    "review": [
      {
        quote: "The team was incredibly professional and the video quality exceeded our expectations.",
        author: "Sarah Johnson",
        role: "Director of Communications"
      },
      {
        quote: "Setup was quick and the live streaming worked flawlessly for our global audience.",
        author: "Michael Chen",
        role: "Event Manager"
      },
      {
        quote: "Next-day delivery of edited content helped us maintain momentum after the event.",
        author: "Lisa Rodriguez",
        role: "VP of Marketing"
      }
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#072948]" role="status" aria-label="Loading content">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-400 border-r-blue-400 border-b-transparent border-l-transparent rounded-full animate-spin mb-6" aria-hidden="true"></div>
          <p className="text-gray-200">Loading packages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#072948]" role="alert" aria-label="Error message">
        <div className="text-center">
          <p className="text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <StructuredData 
        packages={packages}
        testimonials={[
          {
            quote: "The team was incredibly professional and the video quality exceeded our expectations.",
            author: "Sarah Johnson",
            role: "Director of Communications"
          },
          {
            quote: "Setup was quick and the live streaming worked flawlessly for our global audience.",
            author: "Michael Chen",
            role: "Event Manager"
          },
          {
            quote: "Next-day delivery of edited content helped us maintain momentum after the event.",
            author: "Lisa Rodriguez",
            role: "VP of Marketing"
          }
        ]}
        additionalSchema={structuredData}
      />
      <main className="min-h-screen bg-[#072948] py-6" role="main">
        <header className="pt-16 pb-8 bg-[#072948]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-4">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white tracking-tight">
                Orlando Corporate Video Production
              </h1>              
              <p className="text-lg sm:text-xl text-gray-200 leading-relaxed">
                From booking to delivery, we make corporate video production simple. Our Orlando-based team handles everything - setup, recording, streaming, and next-day delivery of your content. Just book online and we'll take care of the rest.
              </p>
            </div>
          </div>
        </header>

        <section className="py-8 bg-[#072948]" aria-labelledby="packages-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="packages-heading" className="sr-only">Available Packages</h2>
            <PackageChooser
              packages={packages}
              addOns={addOns}
              addonGroups={addonGroups}
              onPackageSelect={handlePackageSelect}
              onChoosePackage={handleChoosePackage}
              onAddOnToggle={handleAddOnToggle}
              selectedPackageId={selectedPackageId}
              selectedAddOnIds={selectedAddOnIds}
            />
          </div>
        </section>

        <section 
          className="py-16 bg-white" 
          aria-labelledby="experience-heading"
          itemScope 
          itemType="https://schema.org/Organization"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 
                id="experience-heading" 
                className="text-3xl sm:text-4xl font-bold text-[#072948] mb-6"
                itemProp="slogan"
              >
                Over 20 Years of Professional Experience
              </h2>
              <p 
                className="text-lg text-gray-600 mb-8"
                itemProp="description"
              >
                From broadcast studios to corporate boardrooms, we bring decades of expertise to every project.
              </p>
            </div>
            
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              role="list"
              aria-label="Our expertise areas"
            >
              <div 
                className="bg-gray-50 rounded-xl p-6 text-center shadow-sm"
                role="listitem"
                itemScope
                itemProp="knowsAbout"
                itemType="https://schema.org/DefinedTerm"
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" aria-hidden="true">
                  <svg className="w-10 h-10 text-[#0095ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#072948] mb-2" itemProp="name">Broadcast Production</h3>
                <p className="text-gray-600" itemProp="description">
                  Studio-quality production values from our experienced broadcast team.
                </p>
              </div>

              <div 
                className="bg-gray-50 rounded-xl p-6 text-center shadow-sm"
                role="listitem"
                itemScope
                itemProp="knowsAbout"
                itemType="https://schema.org/DefinedTerm"
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" aria-hidden="true">
                  <svg className="w-10 h-10 text-[#0095ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#072948] mb-2" itemProp="name">Corporate Events</h3>
                <p className="text-gray-600" itemProp="description">
                  Thousands of successful corporate events delivered flawlessly.
                </p>
              </div>

              <div 
                className="bg-gray-50 rounded-xl p-6 text-center shadow-sm"
                role="listitem"
                itemScope
                itemProp="knowsAbout"
                itemType="https://schema.org/DefinedTerm"
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" aria-hidden="true">
                  <svg className="w-10 h-10 text-[#0095ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#072948] mb-2" itemProp="name">Commercial Production</h3>
                <p className="text-gray-600" itemProp="description">
                  High-impact video content for marketing and communications.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white border-t border-gray-100" aria-labelledby="process-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="process-heading" className="text-3xl sm:text-4xl font-bold text-center text-[#072948] mb-20">
              Guided Event Experience
            </h2>
            
            <div className="relative max-w-5xl mx-auto px-4">
              <div className="absolute top-[60px] left-8 right-8 h-0.5 bg-[#0095ff] -translate-y-1/2" aria-hidden="true"></div>
              
              <ol className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-12 sm:gap-6 relative">
                {[
                  { step: 1, title: 'Reserve', desc: 'Choose your package and select any add-ons you need' },
                  { step: 2, title: '5 Days Before', desc: 'Submit room photos and confirm event schedule & details' },
                  { step: 3, title: 'Day Before', desc: 'Final checklist review and tech setup confirmation' },
                  { step: 4, title: 'Event Day', desc: 'We arrive 1hr early, handle all setup, and capture your event' },
                  { step: 5, title: 'Next Day', desc: 'Receive your edited video files via secure Dropbox link' }
                ].map(({ step, title, desc }) => (
                  <li key={step} className="text-center relative">
                    <div className="relative bg-white py-2">
                      <div className="w-12 h-12 rounded-full bg-[#0095ff] text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg transform transition-transform hover:scale-110 duration-300" aria-hidden="true">
                        {step}
                      </div>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-[#072948] font-semibold text-lg mb-3">{title}</h3>
                      <p className="text-gray-600 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#072948]" aria-labelledby="testimonials-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-bold text-center text-white mb-16">
              What Our Clients Say
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  quote: "The team was incredibly professional and the video quality exceeded our expectations.",
                  author: "Sarah Johnson",
                  role: "Director of Communications"
                },
                {
                  quote: "Setup was quick and the live streaming worked flawlessly for our global audience.",
                  author: "Michael Chen",
                  role: "Event Manager"
                },
                {
                  quote: "Next-day delivery of edited content helped us maintain momentum after the event.",
                  author: "Lisa Rodriguez",
                  role: "VP of Marketing"
                }
              ].map((testimonial, idx) => (
                <figure key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 space-y-4">
                  <div className="flex gap-1 text-[#0095ff]" aria-label={`5 out of 5 stars`} role="img">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote>
                    <p className="text-white/90 text-lg leading-relaxed">"{testimonial.quote}"</p>
                  </blockquote>
                  <figcaption>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-white/70">{testimonial.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
} 