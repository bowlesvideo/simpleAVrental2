import { Metadata, Viewport } from 'next'
import { HomeContent } from '@/components/home-content'
import { getBaseUrl } from '@/lib/constants'

const SITE_URL = getBaseUrl()

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Go Video Pro - Professional Corporate Video Production',
  description: 'Professional corporate video production at your office. We handle recording, streaming, and next-day delivery of your meetings via Dropbox.',
  keywords: 'corporate video production, video services, meeting recording, live streaming, professional video, office video recording, business video',
  openGraph: {
    title: 'Go Video Pro - Professional Corporate Video Production',
    description: 'Professional corporate video production at your office. We handle recording, streaming, and next-day delivery of your meetings via Dropbox.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Go Video Pro',
    images: [
      {
        url: `${SITE_URL}/images/govideopro-opengraph-001.jpg`,
        width: 1200,
        height: 630,
        alt: 'Professional Video Production Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Go Video Pro - Professional Corporate Video Production',
    description: 'Professional corporate video production at your office. We handle recording, streaming, and next-day delivery of your meetings via Dropbox.',
    images: [`${SITE_URL}/images/govideopro-opengraph-001.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function Home() {
  return <HomeContent />
} 