// Route registration - imports and registers all routes
import { Hono } from 'hono'

// SSR SEO routes — injects per-page meta tags server-side (must be before SPA catch-all)
import ssrSeoRouter from './public/ssrSeo.js'

// Public routes
import productsRouter from './public/products.js'
import collectionsRouter from './public/collections.js'
import storefrontRouter from './public/storefront.js'
import checkoutRouter from './public/checkout.js'
import imageProxyRouter from './public/imageProxy.js'
import storeSettingsRouter, { contactEmailRouter } from './public/storeSettings.js'
import imagesRouter from './public/images.js'
import downloadRouter from './public/download.js'
import sitemapRouter from './public/sitemap.js'

// Admin routes
import authRouter from './admin/auth.js'
import adminProductsRouter from './admin/products.js'
import adminCollectionsRouter from './admin/collections.js'
import analyticsRouter from './admin/analytics.js'
import mediaRouter from './admin/media.js'
import storageRouter from './admin/storage.js'
import settingsRouter from './admin/settings.js'
import aiRouter from './admin/ai.js'

// Webhook routes
import { handleStripeWebhook } from './webhooks/stripe.js'

/**
 * Register all routes on the app
 * @param {Hono} app - Hono app instance
 */
export function registerRoutes(app) {
  // Health check
  app.get('/api/health', (c) => {
    return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
  })

  // Public API routes — ALL must be registered BEFORE ssrSeoRouter
  app.route('/api/products', productsRouter)
  app.route('/api/collections', collectionsRouter)
  app.route('/api/storefront', storefrontRouter)
  app.route('/api', checkoutRouter)
  app.route('/api/image-proxy', imageProxyRouter)
  app.route('/api/store-settings', storeSettingsRouter)
  app.route('/api/contact-email', contactEmailRouter)
  app.route('/api/images', imagesRouter)
  app.route('/sitemap.xml', sitemapRouter)
  app.route('/api/sitemap.xml', sitemapRouter)
  app.route('/api', downloadRouter)
  app.post('/api/webhooks/stripe', handleStripeWebhook)

  // Cache purge endpoint (admin only - protected by auth middleware)
  app.post('/api/admin/purge-cache', async (c) => {
    try {
      const cache = caches.default
      if (cache) {
        // Purge known SSR cache keys
        const hostname = new URL(c.req.url).hostname
        const keys = [
          `https://${hostname}/__ssr__/home`,
          `https://${hostname}/__ssr__/sitemap`,
        ]
        // Also purge product and collection SSR caches by listing all
        const kvNamespace = c.env.OPENSHOP_KV
        if (kvNamespace) {
          try {
            const { ProductService } = await import('../services/ProductService.js')
            const { CollectionService } = await import('../services/CollectionService.js')
            const ps = new ProductService(kvNamespace)
            const cs = new CollectionService(kvNamespace)
            const [products, collections] = await Promise.all([ps.getAllProducts(), cs.getAllCollections()])
            for (const p of products) {
              const slug = p.slug || p.id
              keys.push(`https://${hostname}/__ssr__/p/${slug}`)
              keys.push(`https://${hostname}/__ssr__/p/${p.id}`)
            }
            for (const col of collections) {
              const slug = col.slug || col.id
              keys.push(`https://${hostname}/__ssr__/c/${slug}`)
              keys.push(`https://${hostname}/__ssr__/c/${col.id}`)
            }
          } catch (e) {
            console.error('Failed to enumerate KV for cache purge:', e)
          }
        }
        let purged = 0
        for (const key of keys) {
          try {
            await cache.delete(new Request(key))
            purged++
          } catch (_) { /* ignore */ }
        }
        return c.json({ success: true, purged, message: `Purged ${purged} cache entries from Workers Cache API` })
      }
      return c.json({ success: true, message: 'No Workers Cache API available' })
    } catch (e) {
      console.error('Cache purge error:', e)
      return c.json({ success: false, error: e.message }, 500)
    }
  })

  // Admin API routes
  app.route('/api/admin', authRouter)
  app.route('/api/admin/products', adminProductsRouter)
  app.route('/api/admin/collections', adminCollectionsRouter)
  app.route('/api/admin/analytics', analyticsRouter)
  app.route('/api/admin/media', mediaRouter)
  app.route('/api/admin/storage', storageRouter)
  app.route('/api/admin', settingsRouter)
  app.route('/api/admin/ai', aiRouter)

  // SSR SEO pages — must come AFTER all API routes (catch-all)
  app.route('/', ssrSeoRouter)


}
