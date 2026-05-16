import { useState, useEffect } from 'react'
import { normalizeImageUrl } from '../../lib/utils'
import { Helmet } from 'react-helmet-async'
import { Navbar } from '../../components/storefront/Navbar'
import { Footer } from '../../components/storefront/Footer'
import { ProductCard } from '../../components/storefront/ProductCard'

// Templates collection ID
const TEMPLATES_COLLECTION_ID = '76619029'

export function Templates() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplatesProducts()
  }, [])

  const fetchTemplatesProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/collections/${TEMPLATES_COLLECTION_ID}/products`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Professional Templates | scsc.qzz.io</title>
        <meta name="description" content="Download professional resume, business card, and design templates. High-quality templates for Word, PSD, AI formats." />
        <link rel="canonical" href="https://scsc.qzz.io/templates" />
      </Helmet>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Professional Templates</h1>
        <p className="text-slate-600 mb-8">High-quality templates for resume, business card, and more</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg h-72 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg">No templates available at the moment.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
