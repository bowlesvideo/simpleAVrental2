import './globals.css'
import { CartProvider } from '@/context/cart-context'
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'
import { SITE_NAME, getBaseUrl } from '@/lib/constants'
import Script from 'next/script'

// Force deployment to update environment variables
// Trigger deploy for GA setup - 2024-01-24
const SITE_URL = getBaseUrl()

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Go Video Pro - Professional Corporate Video Production',
    template: `%s | Go Video Pro`,
  },
  description: 'Professional corporate video production at your office. We handle recording, streaming, and next-day delivery of your meetings via Dropbox.',
  keywords: 'corporate video, video production, meeting recording, live streaming, professional video, office video recording, business video',
  authors: [{ name: 'Go Video Pro' }],
  category: 'Video Production',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Go Video Pro',
    title: 'Go Video Pro - Professional Corporate Video Production',
    description: 'Professional corporate video production at your office. We handle recording, streaming, and next-day delivery of your meetings via Dropbox.',
    images: [{
      url: `${SITE_URL}/images/govideopro-opengraph-001.jpg`,
      width: 1200,
      height: 630,
      alt: 'Professional Video Production Services'
    }]
  },
  other: {
    'og:url': SITE_URL
  },
  alternates: {
    canonical: SITE_URL
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="h-full">
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `}
        </Script>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}
