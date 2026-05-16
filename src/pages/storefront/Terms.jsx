import { Helmet } from 'react-helmet-async'
import { Navbar } from '../../components/storefront/Navbar'
import { Footer } from '../../components/storefront/Footer'

export function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Terms of Service - OpenShop</title>
        <meta name="description" content="Terms of Service for OpenShop digital products marketplace." />
        <link rel="canonical" href="https://scsc.qzz.io/terms" />
      </Helmet>

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-6">Last updated: May 2026</p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 mb-4">
              By accessing and using OpenShop (scsc.qzz.io), you accept and agree to be bound by the terms 
              and conditions of this agreement. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Digital Products</h2>
            <p className="text-slate-600 mb-4">
              All products sold on OpenShop are digital products. Upon purchase, you will receive download 
              links to access your products. Due to the nature of digital products, all sales are final.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. License Grant</h2>
            <p className="text-slate-600 mb-4">
              When you purchase a product from OpenShop, you are granted a non-exclusive, non-transferable 
              license to use the product for personal and commercial purposes. You may not:
            </p>
            <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
              <li>Redistribute, resell, or share the product with others</li>
              <li>Modify and claim the product as your own</li>
              <li>Use the product in a way that violates applicable laws</li>
              <li>Remove any copyright or proprietary notices</li>
            </ul>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Payment & Pricing</h2>
            <p className="text-slate-600 mb-4">
              All prices are displayed in US dollars. We use Stripe as our payment processor to ensure 
              secure transactions. Your payment information is encrypted and never stored on our servers.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Refund Policy</h2>
            <p className="text-slate-600 mb-4">
              Due to the digital nature of our products, we generally do not offer refunds after purchase. 
              However, if you experience technical issues that prevent you from accessing your purchase, 
              please contact us and we will work to resolve the issue.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Intellectual Property</h2>
            <p className="text-slate-600 mb-4">
              All content on OpenShop, including but not limited to text, graphics, logos, and software, 
              is the property of OpenShop or its content suppliers and is protected by international 
              copyright laws.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">7. Disclaimer</h2>
            <p className="text-slate-600 mb-4">
              Our products are provided "as is" without warranty of any kind, express or implied. We do not 
              guarantee that our products will meet your specific requirements or that they will be 
              error-free.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-slate-600 mb-4">
              OpenShop shall not be liable for any indirect, incidental, special, consequential, or 
              punitive damages resulting from your use or inability to use our products or services.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">9. Changes to Terms</h2>
            <p className="text-slate-600 mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately 
              upon posting on this page. Your continued use of the service constitutes acceptance of the 
              modified terms.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">10. Contact Information</h2>
            <p className="text-slate-600 mb-4">
              For questions about these Terms of Service, please contact us at:
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

export default Terms
