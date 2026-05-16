import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export function Footer({ previewSettings }) {
  const [contactEmail, setContactEmail] = useState('contact@example.com')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If preview settings are provided, use them directly
    if (previewSettings) {
      setContactEmail(previewSettings.contactEmail || 'contact@example.com')
      setLoading(false)
      return
    }

    fetchContactEmail()
  }, [previewSettings])

  const fetchContactEmail = async () => {
    try {
      const response = await fetch('/api/contact-email')
      if (response.ok) {
        const data = await response.json()
        setContactEmail(data.email || 'contact@example.com')
      } else {
        setContactEmail('contact@example.com')
      }
    } catch (error) {
      console.error('Error fetching contact email:', error)
      setContactEmail('contact@example.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="storefront-surface border-t border-gray-200">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-32 md:h-24">
          {/* Quick Links - Left */}
          <div className="flex flex-col justify-center items-center text-center space-y-2">
            <h3 className="text-lg font-semibold storefront-heading">Quick Links</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/about" className="storefront-subtle hover:text-slate-900 transition">About</Link>
              <Link to="/faq" className="storefront-subtle hover:text-slate-900 transition">FAQ</Link>
              <Link to="/contact" className="storefront-subtle hover:text-slate-900 transition">Contact</Link>
            </div>
          </div>

          {/* Contact Section - Center */}
          <div className="flex flex-col justify-center items-center text-center space-y-2">
            <h3 className="text-lg font-semibold storefront-heading">Get in Touch</h3>
            <p className="storefront-subtle text-sm">
              Have questions? We'd love to hear from you.
            </p>
            <a
              href={`mailto:${contactEmail && contactEmail !== 'contact@example.com' ? contactEmail : 'contact@example.com'}`}
              className="inline-flex items-center px-4 py-2 storefront-button-outline storefront-radius-sm text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              {loading ? 'Loading...' : 'Contact Us'}
            </a>
          </div>

          {/* Legal Links - Right */}
          <div className="flex flex-col justify-center items-center text-center space-y-2">
            <h3 className="text-lg font-semibold storefront-heading">Legal</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/terms" className="storefront-subtle hover:text-slate-900 transition">Terms</Link>
              <Link to="/privacy" className="storefront-subtle hover:text-slate-900 transition">Privacy</Link>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-6 pt-4 md:mt-3 md:pt-3 border-t border-gray-200">
          <p className="text-center text-sm storefront-subtle">
            Copyright {new Date().getFullYear()} OpenShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
