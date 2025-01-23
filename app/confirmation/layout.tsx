import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmation - Go Video Pro',
  description: 'Thank you for your order with Go Video Pro. Your payment has been processed successfully.',
  robots: 'noindex',
  openGraph: {
    title: 'Order Confirmation - Go Video Pro',
    description: 'Thank you for your order with Go Video Pro',
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