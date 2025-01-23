'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/cart-context'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function Header() {
  const { items } = useCart()
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0
      setScrolled(isScrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur transition-all duration-200 ${
      scrolled 
        ? "bg-white/95 text-[#072948] border-gray-200" 
        : "bg-white text-[#072948] border-gray-200"
    }`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              width={150}
              height={40}
              alt="VideoPro Logo"
              src="/images/videopro_logo_blue.png"
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/about" 
                className="text-sm font-medium transition-colors hover:text-[#0095ff]"
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-sm font-medium transition-colors hover:text-[#0095ff]"
              >
                Contact
              </Link>
            </div>
            <Link href="/cart">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2 bg-[#0095ff] text-white hover:bg-[#007acc] border-none shadow-sm"
              >
                <span>View Order ({cartItemCount})</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 