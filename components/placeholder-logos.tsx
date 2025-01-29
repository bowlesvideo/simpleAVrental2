import React from 'react'

interface LogoProps {
  name: string
  className?: string
}

const Logo1 = ({ className = "h-12" }: LogoProps) => (
  <svg className={className} viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="60" rx="4" fill="currentColor" fillOpacity="0.1"/>
    <path d="M40 20h10v20H40zM55 20h10v20H55zM70 20h10v20H70z" fill="currentColor"/>
    <text x="90" y="35" fill="currentColor" fontFamily="system-ui" fontSize="16" fontWeight="600">TECH</text>
  </svg>
)

const Logo2 = ({ className = "h-12" }: LogoProps) => (
  <svg className={className} viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="60" rx="4" fill="currentColor" fillOpacity="0.1"/>
    <circle cx="50" cy="30" r="15" fill="currentColor"/>
    <text x="75" y="35" fill="currentColor" fontFamily="system-ui" fontSize="16" fontWeight="600">GLOBAL</text>
  </svg>
)

const Logo3 = ({ className = "h-12" }: LogoProps) => (
  <svg className={className} viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="60" rx="4" fill="currentColor" fillOpacity="0.1"/>
    <path d="M45 20l15 20L75 20H45z" fill="currentColor"/>
    <text x="85" y="35" fill="currentColor" fontFamily="system-ui" fontSize="16" fontWeight="600">PEAK</text>
  </svg>
)

const Logo4 = ({ className = "h-12" }: LogoProps) => (
  <svg className={className} viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="60" rx="4" fill="currentColor" fillOpacity="0.1"/>
    <rect x="45" y="20" width="20" height="20" rx="10" fill="currentColor"/>
    <text x="75" y="35" fill="currentColor" fontFamily="system-ui" fontSize="16" fontWeight="600">SQUARE</text>
  </svg>
)

export const PlaceholderLogos = {
  Logo1,
  Logo2,
  Logo3,
  Logo4
} 