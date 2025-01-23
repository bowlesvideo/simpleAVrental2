import { Package } from '@/lib/types'

interface StructuredDataProps {
  packages: Package[]
  testimonials: Array<{
    quote: string
    author: string
    role: string
  }>
  additionalSchema?: Record<string, any>
}

export function StructuredData({ packages, testimonials, additionalSchema }: StructuredDataProps) {
  const servicesData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Corporate Video Production',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Simple AV Rental',
      description: 'Professional video production services for corporate meetings and events'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Video Production Packages',
      itemListElement: packages.map((pkg, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          priceCurrency: 'USD'
        },
        position: index + 1
      }))
    }
  }

  const reviewsData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Simple AV Rental',
    review: testimonials.map((testimonial) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5'
      },
      author: {
        '@type': 'Person',
        name: testimonial.author
      },
      reviewBody: testimonial.quote
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsData) }}
      />
      {additionalSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(additionalSchema) }}
        />
      )}
    </>
  )
} 