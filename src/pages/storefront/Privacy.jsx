import { Helmet } from 'react-helmet-async'
import { Navbar } from '../../components/storefront/Navbar'
import { Footer } from '../../components/storefront/Footer'

export function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Privacy Policy - OpenShop</title>
        <meta name="description" content="Privacy Policy for OpenShop digital products marketplace. Learn how we protect your data." />
        <link rel="canonical" href="https://scsc.qzz.io/privacy" />
      </Helmet>

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-6">Last updated: May 2026</p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
              <li><strong>Contact Information:</strong> Email address when you make a purchase or contact us</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store your card details)</li>
              <li><strong>Transaction Data:</strong> Order history and purchase details</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
              <li>Process and deliver your digital products</li>
              <li>Send purchase confirmations and download links</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send important updates about your purchases</li>
              <li>Improve our products and services</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-slate-600 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
              <li><strong>Payment Processors:</strong> Stripe processes your payments securely</li>
              <li><strong>Email Services:</strong> To deliver your digital products and confirmations</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-slate-600 mb-4">
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
              <li>All transactions are encrypted using SSL/TLS technology</li>
              <li>Payment data is handled by Stripe, which is PCI DSS compliant</li>
              <li>We use secure cloud infrastructure (Cloudflare) to host our services</li>
              <li>Access to personal data is restricted to authorized personnel only</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Cookies</h2>
            <p className="text-slate-600 mb-4">
              Our website uses essential cookies to ensure proper functionality of the shopping cart 
              and user session. We do not use tracking cookies or third-party advertising cookies.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Your Rights</h2>
            <p className="text-slate-600 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
            <p className="text-slate-600 mb-4">
              To exercise these rights, please contact us at cdtianrun@gmail.com.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">7. Children's Privacy</h2>
            <p className="text-slate-600 mb-4">
              Our services are not directed to children under 18. We do not knowingly collect personal 
              information from children. If you believe a child has provided us with personal information, 
              please contact us immediately.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">8. Changes to This Policy</h2>
            <p className="text-slate-600 mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by 
              posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">9. Contact Us</h2>
            <p className="text-slate-600 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-slate-600">
              Email: cdtianrun@gmail.com<br />
              Website: https://scsc.qzz.io
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Privacy
