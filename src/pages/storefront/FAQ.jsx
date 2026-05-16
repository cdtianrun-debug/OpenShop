import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navbar } from '../../components/storefront/Navbar'
import { Footer } from '../../components/storefront/Footer'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    category: 'Products & Downloads',
    questions: [
      {
        q: 'What types of digital products do you offer?',
        a: 'We offer a wide range of digital products including resume templates, pitch deck templates, UI icon packs, design assets, e-books, video courses, and productivity tools. All our products are designed to help professionals and creators work more efficiently.'
      },
      {
        q: 'How do I download my purchased products?',
        a: 'After completing your purchase, you will receive an email with download links. You can also download your products directly from the order confirmation page. Download links are valid for 24 hours.'
      },
      {
        q: 'What format are the products in?',
        a: 'Most of our products are in PDF, PNG, or digital format suitable for their intended use. Templates are typically provided in editable formats compatible with popular software like Microsoft Office, Google Docs, Figma, or Notion.'
      },
      {
        q: 'Can I use the products for commercial purposes?',
        a: 'Yes, all our products come with a commercial license that allows you to use them for your business or client projects. However, reselling or redistributing the original products is not permitted.'
      }
    ]
  },
  {
    category: 'Payments & Pricing',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, MasterCard, American Express) through Stripe, our secure payment processor. All transactions are encrypted and secure.'
      },
      {
        q: 'Is there a refund policy?',
        a: 'Due to the digital nature of our products, we generally do not offer refunds. However, if you experience any issues with your purchase, please contact us and we will do our best to resolve the problem.'
      },
      {
        q: 'Are there any hidden fees?',
        a: 'No, the price you see is the price you pay. All taxes are included where applicable, and there are no additional fees or subscriptions required.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        q: 'What if I have trouble downloading my files?',
        a: 'If you experience any download issues, please try using a different browser or check your internet connection. If problems persist, contact us at cdtianrun@gmail.com and we will assist you promptly.'
      },
      {
        q: 'Do you provide technical support for your products?',
        a: 'Yes, we provide email support for all our products. If you have questions about how to use a product or need technical assistance, feel free to reach out to us.'
      },
      {
        q: 'Will I receive updates for my purchased products?',
        a: 'Yes, when we update our products, we will notify you via email and provide access to the updated version at no additional cost.'
      }
    ]
  },
  {
    category: 'Account & Privacy',
    questions: [
      {
        q: 'Do I need an account to make a purchase?',
        a: 'No account is required. You can make purchases as a guest. We only need your email address to deliver your digital products.'
      },
      {
        q: 'How do you protect my personal information?',
        a: 'We take your privacy seriously. We only collect the information necessary to process your order and deliver your products. We never share your data with third parties. Read our Privacy Policy for more details.'
      }
    ]
  }
]

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-slate-200">
      <button
        className="w-full py-4 flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-slate-900 pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-slate-600">
          {answer}
        </div>
      )}
    </div>
  )
}

export function FAQ() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>FAQ - OpenShop</title>
        <meta name="description" content="Frequently asked questions about OpenShop digital products, payments, downloads, and more." />
        <meta property="og:title" content="FAQ - OpenShop" />
        <meta property="og:description" content="Find answers to common questions about our digital products and services." />
        <link rel="canonical" href="https://scsc.qzz.io/faq" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.flatMap(section =>
            section.questions.map(item => ({
              "@type": "Question",
              "name": item.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
              }
            }))
          )
        }) }} />
      </Helmet>

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-600">
            Find answers to common questions about our products and services.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((section, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{section.category}</h2>
              <div className="divide-y divide-slate-200">
                {section.questions.map((item, qIdx) => (
                  <FAQItem key={qIdx} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Still have questions?</h2>
          <p className="text-slate-600 mb-4">We're happy to help. Contact us and we'll get back to you within 24 hours.</p>
          <a 
            href="/contact" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Contact Us
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default FAQ
