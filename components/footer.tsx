import { SITE_NAME, COMPANY_NAME, COMPANY_EMAIL, COMPANY_PHONE, COMPANY_ADDRESS } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="bg-[#072948] text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-gray-300 leading-relaxed">
              Professional video production services for corporate events, training sessions, and meetings. We handle everything from setup to delivery.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic">
              <ul className="space-y-3">
                <li className="text-gray-300">
                  <span className="block font-semibold text-white">{COMPANY_NAME}</span>
                </li>
                <li className="text-gray-300">
                  <span className="block font-semibold text-white">Address:</span>
                  {COMPANY_ADDRESS}
                </li>
                <li className="text-gray-300">
                  <span className="block font-semibold text-white">Phone:</span>
                  <a href={`tel:${COMPANY_PHONE}`} className="hover:text-white transition-colors">
                    {COMPANY_PHONE}
                  </a>
                </li>
                <li className="text-gray-300">
                  <span className="block font-semibold text-white">Email:</span>
                  <a href={`mailto:${COMPANY_EMAIL}`} className="hover:text-white transition-colors">
                    {COMPANY_EMAIL}
                  </a>
                </li>
              </ul>
            </address>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-gray-300">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 