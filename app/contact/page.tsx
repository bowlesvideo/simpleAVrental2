import { Metadata } from 'next'
import { ContactForm } from '@/components/contact-form'
import { JsonLd } from '@/components/json-ld'
import { SITE_NAME, COMPANY_NAME, COMPANY_EMAIL, COMPANY_PHONE, COMPANY_ADDRESS } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Contact ${SITE_NAME} - Get in Touch for Professional Video Services`,
  description: `Contact ${SITE_NAME} for professional video production services, corporate events, and live streaming. Get a custom quote or discuss your project needs with our experienced team.`,
  openGraph: {
    title: `Contact ${SITE_NAME} - Get in Touch for Professional Video Services`,
    description: `Contact ${SITE_NAME} for professional video production services, corporate events, and live streaming. Get a custom quote or discuss your project needs with our experienced team.`,
    type: 'website'
  },
  alternates: {
    canonical: '/contact'
  }
}

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": `Contact ${COMPANY_NAME}`,
    "description": "Contact us for professional video production services, corporate events, and live streaming. Get a custom quote or discuss your project needs.",
    "mainEntity": {
      "@type": "Organization",
      "name": COMPANY_NAME,
      "email": COMPANY_EMAIL,
      "telephone": COMPANY_PHONE,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "824 HIGHLAND AVE",
        "addressLocality": "ORLANDO",
        "addressRegion": "FL",
        "postalCode": "32803",
        "addressCountry": "US"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "telephone": COMPANY_PHONE,
        "email": COMPANY_EMAIL,
        "availableLanguage": "English",
        "hoursAvailable": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "18:00"
          }
        ]
      }
    }
  }

  return (
    <>
      <JsonLd data={contactSchema} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Office Location</h3>
                  <p className="text-gray-600">
                    824 HIGHLAND AVE<br />
                    ORLANDO, FL 32803
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <strong>Email:</strong><br />
                      {COMPANY_EMAIL}
                    </p>
                    <p>
                      <strong>Address:</strong><br />
                      {COMPANY_ADDRESS}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                  <div className="space-y-1 text-gray-600">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: By appointment</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 