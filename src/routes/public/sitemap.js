// Dynamic sitemap generator
import { Hono } from 'hono'
import { ProductService } from '../../services/ProductService.js'
import { CollectionService } from '../../services/CollectionService.js'
import { asyncHandler } from '../../middleware/errorHandler.js'

const router = new Hono()

router.get('/', asyncHandler(async (c) => {
  const kvNamespace = c.env.OPENSHOP_KV
  if (!kvNamespace) {
    console.error('Sitemap: OPENSHOP_KV binding not found')
    return c.text('Sitemap unavailable', 500)
  }
  const productService = new ProductService(kvNamespace)
  const collectionService = new CollectionService(kvNamespace)

  const [products, collections] = await Promise.all([
    productService.getAllProducts(),
    collectionService.getAllCollections()
  ])

  const today = new Date().toISOString().split('T')[0]

  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/about', changefreq: 'monthly', priority: '0.8' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
    { loc: '/faq', changefreq: 'monthly', priority: '0.7' },
    { loc: '/terms', changefreq: 'yearly', priority: '0.5' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.5' }
  ]

  const productUrls = products.map(p => {
    const slug = p.slug || p.id
    return {
      loc: `/products/${slug}`,
      lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : today,
      changefreq: 'weekly',
      priority: '0.8'
    }
  })

  const collectionUrls = collections.map(c => ({
    loc: `/collections/${c.slug || c.id}`,
    lastmod: c.updatedAt ? c.updatedAt.split('T')[0] : today,
    changefreq: 'weekly',
    priority: '0.7'
  }))

  const allUrls = [
    ...staticPages.map(p => ({ ...p, lastmod: today })),
    ...productUrls,
    ...collectionUrls
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls.map(url => `  <url>
    <loc>https://scsc.qzz.io${url.loc}</loc>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'no-store'
  })
}))

export default router
