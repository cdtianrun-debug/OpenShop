import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { CartProvider } from './contexts/CartContext'
import { StorefrontThemeProvider } from './contexts/StorefrontThemeContext'
import { Storefront } from './pages/storefront/Storefront'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { CollectionPage } from './pages/storefront/CollectionPage'
import { Templates } from './pages/storefront/Templates'

import { Success } from './pages/storefront/Success'
import { Cart } from './components/storefront/Cart'
import { ProductPage } from './pages/storefront/ProductPage'
import { About } from './pages/storefront/About'
import { Contact } from './pages/storefront/Contact'
import { FAQ } from './pages/storefront/FAQ'
import { Terms } from './pages/storefront/Terms'
import { Privacy } from './pages/storefront/Privacy'

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <Router>
          <StorefrontThemeProvider>
            <div className="min-h-screen storefront-surface">
              <Routes>
                {/* Storefront Routes */}
                <Route path="/" element={<Storefront />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/collections/:collectionId" element={<CollectionPage />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/products/:id" element={<ProductPage />} />
                <Route path="/success" element={<Success />} />

                {/* Admin Routes */}
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Routes>
              
              {/* Cart Overlay */}
              <Cart />
            </div>
          </StorefrontThemeProvider>
        </Router>
      </CartProvider>
    </HelmetProvider>
  )
}

export default App
