import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmation - VideoPRO',
  description: 'Thank you for your order with VideoPRO. Your payment has been processed successfully.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Order Confirmation - VideoPRO',
    description: 'Thank you for your order with VideoPRO',
    type: 'website',
  }
}

export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 