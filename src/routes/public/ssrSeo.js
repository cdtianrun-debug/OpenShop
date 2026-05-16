// SSR SEO route - injects per-page meta tags server-side so crawlers see them
import { Hono } from 'hono'
import { ProductService } from '../../services/ProductService.js'
import { CollectionService } from '../../services/CollectionService.js'
import { asyncHandler } from '../../middleware/errorHandler.js'

const router = new Hono()
const BASE_URL = 'https://scsc.qzz.io'

// Cache rendered SEO pages for 5 minutes
const SEO_CACHE_TTL = 60 * 5

/**
 * Inject SEO meta tags into index.html
 * Uses INSERT mode: removes existing placeholders then prepends all tags before </head>
 */
function injectSeoIntoHtml(html, meta) {
  const {
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    canonical,
    twitterCard = 'summary_large_image',
    twitterTitle,
    twitterDescription,
    twitterImage,
    ogType = 'website',
    ogUrl,
    schema,
    keywords
  } = meta

  // Escape for HTML attribute values
  const esc = (s) => s ? s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) : ''

  let result = html

  // Replace <title>
  if (title) {
    result = result.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  }

  // Remove any existing meta/canonical/link tags we manage to avoid duplicates
  result = result.replace(/<meta name="title"[^>]*>/gi, '')
  result = result.replace(/<meta name="description"[^>]*>/gi, '')
  result = result.replace(/<meta name="keywords"[^>]*>/gi, '')
  result = result.replace(/<link rel="canonical"[^>]*>/gi, '')
  result = result.replace(/<meta property="og:[^"]+"[^>]*>/gi, '')
  result = result.replace(/<meta name="twitter:[^"]+"[^>]*>/gi, '')

  // Build meta tags to inject before </head>
  const tags = []
  if (description) tags.push(`<meta name="description" content="${esc(description)}">`)
  if (keywords)    tags.push(`<meta name="keywords" content="${esc(keywords)}">`)
  if (canonical)   tags.push(`<link rel="canonical" href="${esc(canonical)}">`)
  if (ogType)      tags.push(`<meta property="og:type" content="${esc(ogType)}">`)
  if (ogUrl)       tags.push(`<meta property="og:url" content="${esc(ogUrl)}">`)
  if (ogTitle)     tags.push(`<meta property="og:title" content="${esc(ogTitle)}">`)
  if (ogDescription) tags.push(`<meta property="og:description" content="${esc(ogDescription)}">`)
  if (ogImage)     tags.push(`<meta property="og:image" content="${esc(ogImage)}">`)
  if (ogImage)     tags.push(`<meta property="og:image:width" content="1200">`)
  if (ogImage)     tags.push(`<meta property="og:image:height" content="630">`)
  if (twitterCard) tags.push(`<meta name="twitter:card" content="${esc(twitterCard)}">`)
  if (ogUrl)       tags.push(`<meta name="twitter:url" content="${esc(ogUrl)}">`)
  if (twitterTitle || ogTitle) tags.push(`<meta name="twitter:title" content="${esc(twitterTitle || ogTitle)}">`)
  if (twitterDescription || ogDescription) tags.push(`<meta name="twitter:description" content="${esc(twitterDescription || ogDescription)}">`)
  if (ogImage)     tags.push(`<meta name="twitter:image" content="${esc(ogImage)}">`)

  // Append schema JSON-LD + all meta tags before </head>
  let append = ''
  if (schema) append += `  <script type="application/ld+json">${JSON.stringify(schema)}</script>\n`
  if (tags.length) append += '  ' + tags.join('\n  ') + '\n'

  if (append) {
    result = result.replace('</head>', append + '</head>')
  }

  return result
}

/**
 * Security headers for SSR responses
 */
function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://*.stripe.com https://oauth2.googleapis.com https://www.googleapis.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
}

/**
 * Fetch index.html from ASSETS and inject SEO meta
 */
async function serveSeoPage(c, meta, cacheKey) {
  const secHeaders = getSecurityHeaders()

  try {
    // Check cache first
    const cache = caches.default
    if (cache && cacheKey) {
      const cached = await cache.match(cacheKey)
      if (cached) {
        return new Response(cached.body, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-SSR-Cache': 'HIT',
            ...secHeaders
          }
        })
      }
    }

    // Fetch index.html from Workers Assets binding
    const indexReq = new Request(new URL('/index.html', c.req.url))
    const indexRes = await c.env.ASSETS.fetch(indexReq)
    if (!indexRes.ok) {
      return c.notFound()
    }

    const html = await indexRes.text()
    const rendered = injectSeoIntoHtml(html, meta)

    const response = new Response(rendered, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-SSR-Cache': 'MISS',
        ...secHeaders
      }
    })

    // Cache the response
    if (cache && cacheKey) {
      try {
        await cache.put(cacheKey, response.clone())
      } catch (_) { /* ignore cache errors */ }
    }

    return response
  } catch (e) {
    console.error('SSR SEO error:', e)
    return c.notFound()
  }
}

// Helper: product meta from KV data
async function getProductMeta(c, id) {
  const kvNamespace = c.env.OPENSHOP_KV
  if (!kvNamespace) {
    console.error('SSR: OPENSHOP_KV binding not found')
    return null
  }
  const productService = new ProductService(kvNamespace)
  const product = await productService.getProduct(id)
  if (!product || product.archived) return null

  const desc = product.description
    ? (product.description.length > 155 ? product.description.substring(0, 152) + '...' : product.description)
    : `Buy ${product.name} at OpenShop. Instant download after purchase.`

  const image = product.images?.[0] || product.imageUrl || `${BASE_URL}/og-image.png`
  const price = product.price ? (product.price / 100).toFixed(2) : null
  const productSlug = product.slug || id
  const productUrl = `${BASE_URL}/products/${productSlug}`

  return {
    title: `${product.name} - OpenShop | Instant Download`,
    description: desc,
    keywords: `${product.name}, ${product.tagline || ''}, digital download, instant download, OpenShop`,
    ogTitle: `${product.name} - OpenShop`,
    ogDescription: desc,
    ogImage: image,
    ogType: 'product',
    ogUrl: productUrl,
    canonical: productUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: `${product.name} - OpenShop`,
    twitterDescription: desc,
    twitterImage: image,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: image,
      brand: { '@type': 'Brand', name: 'OpenShop' },
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: product.currency || 'USD',
        price: price,
        availability: product.stripePriceId ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      }
    }
  }
}

// Helper: collection meta from KV data
async function getCollectionMeta(c, id) {
  const kvNamespace = c.env.OPENSHOP_KV
  if (!kvNamespace) {
    console.error('SSR: OPENSHOP_KV binding not found')
    return null
  }
  const collectionService = new CollectionService(kvNamespace)
  const collection = await collectionService.getCollection(id)
  if (!collection || collection.archived) return null

  const desc = collection.description || `${collection.name} - Premium digital products for creators`
  const collectionSlug = collection.slug || id
  const collectionUrl = `${BASE_URL}/collections/${collectionSlug}`

  return {
    title: `${collection.name} - OpenShop | Premium ${collection.name}`,
    description: desc,
    keywords: `${collection.name}, digital ${collection.name.toLowerCase()}, digital products, templates, design assets`,
    ogTitle: `${collection.name} - OpenShop`,
    ogDescription: desc,
    ogImage: collection.heroImage || `${BASE_URL}/og-image.png`,
    ogType: 'website',
    ogUrl: collectionUrl,
    canonical: collectionUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: `${collection.name} - OpenShop`,
    twitterDescription: desc,
    twitterImage: collection.heroImage || `${BASE_URL}/og-image.png`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.name,
      description: desc,
      url: collectionUrl
    }
  }
}

// Static page SEO meta definitions
const STATIC_PAGES = {
  '/about': {
    title: 'About Us - OpenShop | Premium Digital Products for Creators',
    description: 'Learn about OpenShop -- your trusted destination for premium digital products. We offer templates, design assets, e-books, and courses for creators and professionals.',
    keywords: 'about OpenShop, digital products store, creator tools, templates',
  },
  '/contact': {
    title: 'Contact Us - OpenShop | Get in Touch',
    description: 'Have questions about our digital products or your order? Contact the OpenShop team and we\'ll get back to you quickly.',
    keywords: 'contact OpenShop, support, digital products questions',
  },
  '/faq': {
    title: 'FAQ - OpenShop | Frequently Asked Questions',
    description: 'Find answers to common questions about OpenShop digital products, instant downloads, payment methods, and customer support.',
    keywords: 'FAQ, frequently asked questions, digital download help',
  },
  '/terms': {
    title: 'Terms of Service - OpenShop',
    description: 'Read the OpenShop Terms of Service. By using our digital products store, you agree to our terms and conditions.',
    keywords: 'terms of service, OpenShop terms',
  },
  '/privacy': {
    title: 'Privacy Policy - OpenShop',
    description: 'OpenShop Privacy Policy. We respect your privacy and are committed to protecting your personal information.',
    keywords: 'privacy policy, data protection, OpenShop',
  },
  '/cart': {
    title: 'Shopping Cart - OpenShop | Your Digital Products',
    description: 'Review and complete your purchase of premium digital products at OpenShop. Secure checkout with instant download.',
    keywords: 'cart, shopping cart, digital products checkout',
  },
  '/collections': {
    title: 'Browse Collections - OpenShop | Digital Templates, E-Books & Courses',
    description: 'Browse our curated collections of premium digital products. Find templates, design assets, e-books, video courses, and productivity tools.',
    keywords: 'collections, digital products, templates, design assets, e-books, courses, productivity tools',
  },
}

// Homepage SSR route
router.get('/', asyncHandler(async (c) => {
  const cacheKey = `https://${new URL(c.req.url).hostname}/__ssr__/home`
  try {
    const settings = await c.env.OPENSHOP_KV.get('store_settings')
    let storeName = 'OpenShop'
    let storeDescription = 'Premium digital products for creators -- templates, design assets, e-books, and more. Instant download after purchase.'
    if (settings) {
      const parsed = JSON.parse(settings)
      storeName = parsed.storeName || storeName
      storeDescription = parsed.storeDescription || parsed.heroSubtitle || storeDescription
    }
    const meta = {
      title: `${storeName} | Premium Digital Products Store`,
      description: storeDescription,
      ogTitle: storeName,
      ogDescription: storeDescription,
      ogImage: `${BASE_URL}/og-image.png`,
      ogType: 'website',
      ogUrl: BASE_URL,
      canonical: BASE_URL,
      twitterCard: 'summary_large_image',
      twitterTitle: storeName,
      twitterDescription: storeDescription,
      twitterImage: `${BASE_URL}/og-image.png`,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: storeName,
        description: storeDescription,
        url: BASE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/?q={search_term_string}` },
          'query-input': 'required name=search_term_string'
        }
      }
    }
    return serveSeoPage(c, meta, cacheKey)
  } catch (e) {
    console.error('[SSR-HOME] Error:', e)
    return c.notFound()
  }
}))

/**
 * Catch-all SSR route - intercepts all HTML page requests (NOT /api/*)
 */
router.all('/:path{.*}', asyncHandler(async (c, next) => {
  const fullPath = c.req.path

  // Skip API routes
  if (fullPath.startsWith('/api/')) {
    return await next()
  }

  // Handle static pages with SEO meta
  const staticPage = STATIC_PAGES[fullPath]
  if (staticPage) {
    const pageUrl = `${BASE_URL}${fullPath}`
    const meta = {
      title: staticPage.title,
      description: staticPage.description,
      keywords: staticPage.keywords,
      ogTitle: staticPage.title,
      ogDescription: staticPage.description,
      ogImage: `${BASE_URL}/og-image.png`,
      ogType: 'website',
      ogUrl: pageUrl,
      canonical: pageUrl,
      twitterCard: 'summary_large_image',
      twitterTitle: staticPage.title,
      twitterDescription: staticPage.description,
      twitterImage: `${BASE_URL}/og-image.png`,
    }
    const cacheKey = `https://${new URL(c.req.url).hostname}/__ssr__/static${fullPath}`
    return serveSeoPage(c, meta, cacheKey)
  }

  // Handle product and collection pages
  const productMatch = fullPath.match(/^\/(?:products?|product)\/(.+)$/)
  const collectionMatch = fullPath.match(/^\/(?:collections?|collection)\/(.+)$/)

  if (productMatch) {
    const idOrSlug = productMatch[1]
    const cacheKey = `https://${new URL(c.req.url).hostname}/__ssr__/p/${idOrSlug}`
    try {
      const meta = await getProductMeta(c, idOrSlug)
      if (meta) {
        console.log('[SSR-ALL] Product meta found, serving SEO page')
        return serveSeoPage(c, meta, cacheKey)
      }
    } catch (e) {
      console.error('[SSR-ALL] Product meta error:', e)
    }
  } else if (collectionMatch) {
    const idOrSlug = collectionMatch[1]
    const cacheKey = `https://${new URL(c.req.url).hostname}/__ssr__/c/${idOrSlug}`
    try {
      const meta = await getCollectionMeta(c, idOrSlug)
      if (meta) {
        console.log('[SSR-ALL] Collection meta found, serving SEO page')
        return serveSeoPage(c, meta, cacheKey)
      }
    } catch (e) {
      console.error('[SSR-ALL] Collection meta error:', e)
    }
  }

  // SPA fallback: serve index.html for client-side routes (about, contact, etc.)
  // NOT for static assets (those are excluded in _routes.json)
  const secHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://*.stripe.com https://oauth2.googleapis.com https://www.googleapis.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
  try {
    const indexReq = new Request(new URL('/index.html', c.req.url))
    const indexRes = await c.env.ASSETS.fetch(indexReq)
    if (indexRes.ok) {
      return new Response(indexRes.body, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...secHeaders }
      })
    }
  } catch (e) {
    console.error('[SSR-ALL] SPA fallback error:', e)
  }
  return c.notFound()
}))

export default router
