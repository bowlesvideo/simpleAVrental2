'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function NavBar() {
  const { data: session, status } = useSession()
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
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-[#072948] border-b border-white/10' : 'bg-white border-b border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src={scrolled ? "/images/videopro_logo_blue.png" : "/images/videopro_logo_black.png"}
            alt="Office Video Pro Logo"
            width={100}
            height={33}
            priority
          />
        </Link>

        <div className="flex items-center space-x-4">
          {status === 'loading' ? (
            <p className={scrolled ? "text-white" : "text-black"}>Loading...</p>
          ) : session ? (
            <>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="ghost" className={scrolled ? "text-white hover:text-white" : "text-black hover:text-black"}>Admin</Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="ghost" className={scrolled ? "text-white hover:text-white" : "text-black hover:text-black"}>Profile</Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => signOut({ callbackUrl: '/' })}
                className={scrolled ? "text-white hover:text-white" : "text-black hover:text-black"}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" className={scrolled ? "text-white hover:text-white" : "text-black hover:text-black"}>Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className={scrolled ? "bg-[#0095ff]" : "bg-[#072948]"}>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 