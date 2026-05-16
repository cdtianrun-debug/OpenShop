// Download routes - digital product delivery
import { Hono } from 'hono'
import { StripeService } from '../../services/StripeService.js'
import { ProductService } from '../../services/ProductService.js'
import { R2Service } from '../../services/R2Service.js'
import { getKVNamespace } from '../../utils/kv.js'
import { randomHex } from '../../utils/crypto.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { ValidationError } from '../../utils/errors.js'

const router = new Hono()

const DOWNLOAD_TTL_SECONDS = 24 * 60 * 60 // 24 hours

/**
 * POST /create-download-tokens
 * Verify a paid checkout session and generate download tokens for purchased products
 * Body: { sessionId: string }
 */
router.post('/create-download-tokens', asyncHandler(async (c) => {
  const { sessionId } = await c.req.json()

  if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    throw new ValidationError('Valid session ID is required')
  }

  const stripeService = new StripeService(c.env.STRIPE_SECRET_KEY, c.env.SITE_URL)
  const kvNamespace = getKVNamespace(c.env)

  // Retrieve full session with line items
  const session = await stripeService.stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price.product']
  })

  if (session.payment_status !== 'paid') {
    throw new ValidationError('Payment not completed')
  }

  // Check if tokens already generated for this session (idempotent)
  const existingTokensKey = `download_tokens_session:${sessionId}`
  const existing = await kvNamespace.get(existingTokensKey)
  if (existing) {
    return c.json({ downloads: JSON.parse(existing), orderId: session.id })
  }

  const productService = new ProductService(kvNamespace)
  const allProducts = await productService.getAllProductsAdmin()

  // Build a map from stripePriceId to product
  const priceToProduct = new Map()
  for (const product of allProducts) {
    if (product.stripePriceId && product.downloadFile) {
      priceToProduct.set(product.stripePriceId, product)
    }
    // Also check variant prices
    if (product.variantPrices) {
      for (const [variantKey, priceId] of Object.entries(product.variantPrices)) {
        if (product.downloadFile) {
          priceToProduct.set(priceId, product)
        }
      }
    }
  }

  // Generate download tokens for each purchased product
  const downloads = []

  if (session.line_items && session.line_items.data) {
    for (const item of session.line_items.data) {
      const priceId = item.price?.id
      if (!priceId) continue

      const product = priceToProduct.get(priceId)
      if (!product || !product.downloadFile) continue

      // Generate a unique download token
      const token = randomHex(32)

      // Store token in KV with TTL
      const tokenData = {
        productId: product.id,
        productName: product.name,
        downloadFile: product.downloadFile,
        downloadFileName: product.downloadFileName || product.name,
        mimeType: product.downloadMimeType || 'application/pdf',
        sessionId: session.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + (DOWNLOAD_TTL_SECONDS * 1000)
      }

      await kvNamespace.put(`download_token:${token}`, JSON.stringify(tokenData), {
        expirationTtl: DOWNLOAD_TTL_SECONDS
      })

      downloads.push({
        token,
        productName: product.name,
        fileName: product.downloadFileName || product.name,
        mimeType: product.downloadMimeType || 'application/pdf'
      })
    }
  }

  // Cache the result for this session
  await kvNamespace.put(existingTokensKey, JSON.stringify(downloads), {
    expirationTtl: DOWNLOAD_TTL_SECONDS
  })

  return c.json({ downloads, orderId: session.id })
}))

/**
 * GET /download/:token
 * Download a digital product file using a valid token
 */
router.get('/download/:token', asyncHandler(async (c) => {
  const token = c.req.param('token')
  const kvNamespace = getKVNamespace(c.env)

  // Validate token format
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return c.json({ error: 'Invalid download token' }, 400)
  }

  // Look up token in KV
  const tokenDataRaw = await kvNamespace.get(`download_token:${token}`)
  if (!tokenDataRaw) {
    return c.json({ error: 'Download link expired or invalid' }, 410)
  }

  const tokenData = JSON.parse(tokenDataRaw)

  // Check expiration
  if (Date.now() > tokenData.expiresAt) {
    return c.json({ error: 'Download link has expired' }, 410)
  }

  // Fetch file from R2
  const r2Service = new R2Service(c.env)
  const file = await r2Service.getFile(tokenData.downloadFile)

  if (!file) {
    return c.json({ error: 'File not found' }, 404)
  }

  // Increment download count
  const countKey = `download_count:${tokenData.productId}`
  const currentCount = await kvNamespace.get(countKey)
  const newCount = (currentCount ? parseInt(currentCount, 10) : 0) + 1
  await kvNamespace.put(countKey, String(newCount))

  // Serve the file with download header
  const headers = new Headers()
  headers.set('Content-Type', tokenData.mimeType || 'application/octet-stream')
  headers.set('Content-Disposition', `attachment; filename="${tokenData.downloadFileName || 'download'}"`)
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

  return new Response(file.body, { headers })
}))

export default router
