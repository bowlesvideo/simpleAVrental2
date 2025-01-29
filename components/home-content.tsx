'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Package, AddOn } from '@/lib/types'
import { PackageChooser } from '@/components/package-chooser'
import { useCart } from '@/context/cart-context'
import { StructuredData } from '@/components/structured-data'
import { SITE_NAME } from '@/lib/constants'
import { StickyHeader } from '@/components/sticky-header'
import { scrollToElement } from '@/lib/scroll-utils'
import { useRouter } from 'next/navigation'
import { PackageComparison } from '@/components/package-comparison'

export function HomeContent() {
  const router = useRouter()
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

  const handleChoosePackage = useCallback((packageId: string, selectedAddOnIds?: string[]) => {
    const selectedPackage = packages.find(p => p.id === packageId)
    if (selectedPackage) {
      // Add the package first
      addPackage(selectedPackage)
      
      // Then add all selected add-ons
      if (selectedAddOnIds?.length) {
        selectedAddOnIds.forEach(addOnId => {
          const addon = addOns.find(a => a.id === addOnId)
          if (addon) {
            addAddOn(addon)
          }
        })
      }
    }
  }, [packages, addOns, addPackage, addAddOn])

  const handleScroll = useCallback((elementId: string) => {
    scrollToElement(elementId)
  }, [])

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
      <StickyHeader />
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
      <main className="min-h-screen bg-[#072948]" role="main">
        <header className="relative pt-12 pb-24 bg-white overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 z-0 opacity-10">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/hero-background.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-[#072948] tracking-tight leading-tight">
                Professional Video Production <br />
                <span className="text-[#0095ff]">At Your Office</span>
              </h1>              
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed mb-6">
                From setup to delivery, we make corporate video production simple. 
                Our Orlando-based team handles everything - just book online and we'll take care of the rest.
              </p>
              
              {/* Enhanced CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <button 
                  onClick={() => handleScroll('packages')}
                  className="group relative bg-[#0095ff] hover:bg-[#007acc] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    View Packages & Pricing
                    <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                <button 
                  onClick={() => handleScroll('process')}
                  className="group bg-[#072948] hover:bg-[#0a3761] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    See How It Works
                    <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Quick Contact CTA */}
              <div 
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#072948] transition-colors cursor-pointer mb-12"
                onClick={() => router.push('/contact')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Need to talk? Contact our team</span>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { number: "20+", label: "Years Experience" },
                { number: "1000+", label: "Events Filmed" },
                { number: "98%", label: "Client Satisfaction" },
                { number: "24hr", label: "Delivery Time" }
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-2xl sm:text-3xl font-bold text-[#072948] mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section 
          id="packages" 
          className="relative py-24 bg-[#072948]" 
          aria-labelledby="packages-heading"
        >
          {/* Add subtle pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
            }}
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <span className="inline-block text-[#0095ff] font-semibold text-sm uppercase tracking-wider mb-4">Our Packages</span>
              <h2 id="packages-heading" className="text-3xl sm:text-5xl font-bold text-white mb-6">
                Choose Your Package
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Select the package that best fits your event needs. Each package includes professional operators and comprehensive support.
              </p>
            </div>

            <div className="mt-16">
              <PackageComparison
                packages={packages}
                addOns={addOns}
                selectedPackageId={selectedPackageId}
                onPackageSelect={handlePackageSelect}
                onChoosePackage={handleChoosePackage}
              />
            </div>
          </div>
        </section>

        <section 
          className="py-16 bg-white border-t border-gray-100" 
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
                className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                role="listitem"
                itemScope
                itemProp="knowsAbout"
                itemType="https://schema.org/DefinedTerm"
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#f5f9ff] rounded-full" aria-hidden="true">
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
                className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                role="listitem"
                itemScope
                itemProp="knowsAbout"
                itemType="https://schema.org/DefinedTerm"
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#f5f9ff] rounded-full" aria-hidden="true">
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
                className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                role="listitem"
                itemScope
                itemProp="knowsAbout"
                itemType="https://schema.org/DefinedTerm"
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#f5f9ff] rounded-full" aria-hidden="true">
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

        {/* Process Section - How It Works */}
        <section 
          id="process" 
          className="py-24 bg-white border-t border-gray-100" 
          aria-labelledby="process-heading"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <span className="text-[#0095ff] font-semibold text-sm uppercase tracking-wider">Simple Process</span>
              <h2 id="process-heading" className="text-3xl sm:text-4xl font-bold text-[#072948] mt-4 mb-6">
                How VideoPRO Works
              </h2>
              <p className="text-xl text-gray-600">
                From booking to delivery, we've streamlined every step to make professional video production effortless.
              </p>
            </div>
            
            <div className="relative max-w-6xl mx-auto">
              {/* Timeline connector */}
              <div className="absolute top-[60px] left-8 right-8 h-0.5 bg-[#0095ff] hidden lg:block" aria-hidden="true"></div>
              
              <ol className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8 relative">
                {[
                  {
                    step: 1,
                    title: 'Choose & Book',
                    desc: 'Select your package and any add-ons you need. Book instantly online.',
                    icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ),
                  },
                  {
                    step: 2,
                    title: 'Share Details',
                    desc: 'Submit your venue photos and event schedule through our simple online form.',
                    icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ),
                  },
                  {
                    step: 3,
                    title: 'Pre-Event Check',
                    desc: "We'll review everything and confirm technical requirements the day before.",
                    icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    ),
                  },
                  {
                    step: 4,
                    title: 'Event Day',
                    desc: 'We arrive early, handle all setup, and deliver professional video coverage.',
                    icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    ),
                  },
                  {
                    step: 5,
                    title: 'Next-Day Delivery',
                    desc: 'Receive your edited video content via secure Dropbox link within 24 hours.',
                    icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    ),
                  },
                ].map(({ step, title, desc, icon }) => (
                  <li key={step} className="relative">
                    <div className="flex flex-col items-center">
                      {/* Step number with icon */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-[#0095ff] text-white flex items-center justify-center mx-auto shadow-lg transform transition-transform hover:scale-110 duration-300">
                          {icon}
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#072948] text-white text-sm font-bold flex items-center justify-center">
                          {step}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="mt-6 text-center">
                        <h3 className="text-[#072948] font-semibold text-lg mb-2">{title}</h3>
                        <p className="text-gray-600 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              {/* CTA Button */}
              <div className="text-center mt-16">
                <button
                  onClick={() => handleScroll('packages')}
                  className="inline-flex items-center gap-2 bg-[#0095ff] hover:bg-[#007acc] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started Now
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
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