import { useEffect, useState } from 'react'
import { useCart } from '@/context/cart-context'
import { scrollToElement } from '@/lib/scroll-utils'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function StickyHeader() {
  const [isVisible, setIsVisible] = useState(false)
  const { items } = useCart()
  const cartCount = items.length
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling past 300px
      const show = window.scrollY > 300
      setIsVisible(show)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-[#072948]/95 backdrop-blur-sm z-50 transform transition-all duration-300 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="bg-white rounded-lg p-2">
              <Image
                width={120}
                height={32}
                alt="VideoPro Logo"
                src="/images/videopro_logo_blue.png"
                className="h-8 w-auto"
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-4">
              <a 
                href="/inventory"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                Browse Gear
              </a>
              <a 
                href="/about"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                About
              </a>
              <a 
                href="/blog"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                Blog
              </a>
              <a 
                href="/contact"
                className="text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Cart Status */}
            {cartCount > 0 && (
              <a 
                href="/cart"
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-sm font-medium">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
              </a>
            )}

            {/* Contact Button */}
            <button 
              onClick={() => router.push('/contact')}
              className="text-white/90 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Contact Us
            </button>

            {/* Primary CTA */}
            <button 
              onClick={() => scrollToElement('packages')}
              className="bg-[#0095ff] hover:bg-[#007acc] text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              View Packages
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
