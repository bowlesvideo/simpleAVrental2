import Image from "next/image";
import { Metadata } from 'next'
import { SITE_NAME, COMPANY_NAME, COMPANY_EMAIL, COMPANY_ADDRESS } from '@/lib/constants'
import { JsonLd } from '@/components/json-ld'

export const metadata: Metadata = {
  title: `About ${SITE_NAME} - Professional Video Production Services`,
  description: `Learn about ${SITE_NAME}'s 20+ years of experience in corporate video production, live events, and professional videography. Discover our mission, approach, and commitment to quality.`,
  openGraph: {
    title: `About ${SITE_NAME} - Professional Video Production Services`,
    description: `Learn about ${SITE_NAME}'s 20+ years of experience in corporate video production, live events, and professional videography. Discover our mission, approach, and commitment to quality.`,
    type: 'website',
    images: ['/images/office2.jpg'],
  },
  alternates: {
    canonical: '/about'
  }
}

export default function AboutPage() {
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "VideoProductionCompany"],
    "name": COMPANY_NAME,
    "image": "/images/office2.jpg",
    "email": COMPANY_EMAIL,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "824 HIGHLAND AVE",
      "addressLocality": "ORLANDO",
      "addressRegion": "FL",
      "postalCode": "32803",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "28.5549",
      "longitude": "-81.3644"
    },
    "description": "Professional video production services for corporate events, meetings, and training sessions. Over 20 years of experience in live events and video production.",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      process.env.NEXT_PUBLIC_LINKEDIN_URL,
      process.env.NEXT_PUBLIC_FACEBOOK_URL,
      process.env.NEXT_PUBLIC_TWITTER_URL,
      process.env.NEXT_PUBLIC_INSTAGRAM_URL,
      process.env.NEXT_PUBLIC_YOUTUBE_URL
    ].filter(Boolean),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Video Production Services",
      "itemListElement": [
        {
          "@type": "Service",
          "name": "Corporate Event Video Production",
          "description": "Professional video recording and live streaming for corporate events and meetings",
          "serviceType": "Video Production"
        },
        {
          "@type": "Service",
          "name": "Live Event Streaming",
          "description": "High-quality live streaming services for corporate events and webinars",
          "serviceType": "Live Streaming"
        },
        {
          "@type": "Service",
          "name": "Commercial Video Production",
          "description": "Professional video production for marketing and internal communications",
          "serviceType": "Video Production"
        },
        {
          "@type": "Service",
          "name": "Corporate Training Videos",
          "description": "Professional video production for training and educational content",
          "serviceType": "Video Production"
        }
      ]
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Sarah Johnson"
        },
        "reviewBody": "The team was incredibly professional and the video quality exceeded our expectations."
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Michael Chen"
        },
        "reviewBody": "Setup was quick and the live streaming worked flawlessly for our global audience."
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Lisa Rodriguez"
        },
        "reviewBody": "Next-day delivery of edited content helped us maintain momentum after the event."
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "3",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  return (
    <>
      <JsonLd data={businessSchema} />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-[#072948]">About {SITE_NAME}</h1>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-[#072948]">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                At {SITE_NAME}, we're dedicated to making professional video production accessible and hassle-free for businesses of all sizes. With over 20 years of experience in live events and video production, our mission is to help companies create high-quality video content that enhances their corporate communications, training, and events.
              </p>
              <p className="text-gray-600 mb-6">
                We believe event production shouldn't be complicated or mysterious. That's why we've simplified everything - from transparent package options to end-to-end event management. Every package includes professional operators and comprehensive support, so you can focus on your event while we handle all the technical details.
              </p>
            </section>

            <section className="mb-12">
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8 group">
                <div className="absolute inset-0 bg-[#072948]/30 z-10" />
                <Image
                  src="/images/office2.jpg"
                  alt={`${SITE_NAME} Workspace`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-[#072948]">Our Approach</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border mb-8 hover:border-[#0095ff] transition-colors">
                <h3 className="text-xl font-semibold mb-3 text-[#072948]">Simplified Event Production</h3>
                <p className="text-gray-600 mb-4">
                  We've removed the complexity from event production. No more worrying about technical details or wondering if you've chosen the right equipment. Each package is carefully designed to include everything needed for a successful event, backed by our experienced team of professionals.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Clear, straightforward package options</li>
                  <li>Professional operators included with every package</li>
                  <li>Complete technical setup and management</li>
                  <li>End-to-end event support from planning to delivery</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-[#072948]">Our Experience</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:border-[#0095ff] transition-colors">
                  <h3 className="text-xl font-semibold mb-3 text-[#072948]">Broadcast Production</h3>
                  <p className="text-gray-600">
                    Our team brings extensive broadcast experience to every project, ensuring studio-quality production values for your corporate events and live streams.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:border-[#0095ff] transition-colors">
                  <h3 className="text-xl font-semibold mb-3 text-[#072948]">Corporate Events</h3>
                  <p className="text-gray-600">
                    From intimate board meetings to large-scale town halls, we've handled thousands of corporate events with meticulous attention to detail and flawless execution.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:border-[#0095ff] transition-colors">
                  <h3 className="text-xl font-semibold mb-3 text-[#072948]">Commercial Video</h3>
                  <p className="text-gray-600">
                    Our commercial video expertise ensures your message is delivered with impact, whether it's for marketing, training, or internal communications.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:border-[#0095ff] transition-colors">
                  <h3 className="text-xl font-semibold mb-3 text-[#072948]">Corporate Videography</h3>
                  <p className="text-gray-600">
                    Two decades of corporate videography experience means we understand the unique needs and high standards of business video production.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-[#072948]">Why Choose Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:border-[#0095ff] transition-colors">
                  <h3 className="text-xl font-semibold mb-3 text-[#072948]">Professional Equipment</h3>
                  <p className="text-gray-600">
                    We use only professional-grade equipment, including BlackMagic cameras and ATEM switchers, ensuring the highest quality output for your events.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:border-[#0095ff] transition-colors">
                  <h3 className="text-xl font-semibold mb-3 text-[#072948]">Experienced Team</h3>
                  <p className="text-gray-600">
                    Our seasoned team of videographers and technicians brings decades of combined experience across broadcast, corporate, and commercial video production.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:border-[#0095ff] transition-colors">
                  <h3 className="text-xl font-semibold mb-3 text-[#072948]">Reliable Service</h3>
                  <p className="text-gray-600">
                    We pride ourselves on being punctual, professional, and prepared. We always bring backup equipment and arrive early to ensure everything runs smoothly.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border hover:border-[#0095ff] transition-colors">
                  <h3 className="text-xl font-semibold mb-3 text-[#072948]">Quick Turnaround</h3>
                  <p className="text-gray-600">
                    Get your edited videos the next business day, with same-day rush delivery available when needed. We understand that timing is crucial in business.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-[#072948]">Our Process</h2>
              <p className="text-gray-600 mb-6">
                We've streamlined our booking and delivery process to make it as simple as possible:
              </p>
              <ol className="list-decimal list-inside space-y-4 text-gray-600">
                <li className="pl-2">Choose your package and any add-ons you need</li>
                <li className="pl-2">Submit your event details and requirements</li>
                <li className="pl-2">We'll arrive early on event day to handle all setup</li>
                <li className="pl-2">Receive your professionally edited videos the next business day</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#072948]">Contact Us</h2>
              <div className="bg-gray-50 p-6 rounded-lg border">
                <p className="text-gray-600 mb-4">
                  Have questions or need a custom quote? We're here to help!
                </p>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong className="text-[#072948]">Email:</strong> {COMPANY_EMAIL}
                  </p>
                  <p className="text-gray-600">
                    <strong className="text-[#072948]">Address:</strong><br />
                    {COMPANY_ADDRESS}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
} 