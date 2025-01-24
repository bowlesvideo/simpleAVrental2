import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Orders - Go Video Pro',
  description: 'View your order history and event details',
}

export default function CustomerOrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="container max-w-5xl mx-auto py-8 px-4">
      {children}
    </main>
  )
} 