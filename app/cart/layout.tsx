import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shopping Cart - Simple AV Rental',
  description: 'Review and complete your AV equipment rental order. Secure checkout with flexible payment options.',
  robots: 'noindex',
  openGraph: {
    title: 'Shopping Cart - Simple AV Rental',
    description: 'Complete your AV equipment rental order',
    type: 'website',
  }
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 