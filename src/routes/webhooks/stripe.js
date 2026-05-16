// Stripe Webhook Handler - processes checkout.session.completed events
import { StripeService } from '../../services/StripeService.js'
import { ProductService } from '../../services/ProductService.js'
import { EmailService } from '../../services/EmailService.js'
import { getKVNamespace } from '../../utils/kv.js'
import { randomHex } from '../../utils/crypto.js'

const DOWNLOAD_TTL_SECONDS = 24 * 60 * 60

async function handleCheckoutSessionCompleted(session, env) {
  const kv = getKVNamespace(env)
  const stripeService = new StripeService(env.STRIPE_SECRET_KEY, env.SITE_URL)

  // Idempotent: check if email already sent
  const emailSentKey = 'email_sent:' + session.id
  if (await kv.get(emailSentKey)) {
    return
  }

  const customerEmail = session.customer_details?.email || session.customer_email
  if (!customerEmail) { console.error('No email for session ' + session.id); return }

  const fullSession = await stripeService.stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items.data.price.product']
  })

  const productService = new ProductService(kv)
  const allProducts = await productService.getAllProductsAdmin()

  // Build price-to-product mapping for download files
  const priceToProduct = new Map()
  for (const product of allProducts) {
    if (product.stripePriceId && product.downloadFile) {
      priceToProduct.set(product.stripePriceId, product)
    }
    if (product.variantPrices) {
      for (const [k, priceId] of Object.entries(product.variantPrices)) {
        if (product.downloadFile) priceToProduct.set(priceId, product)
      }
    }
  }

  // Generate download tokens for items with downloadable files
  const downloads = []
  const lineItems = []
  if (fullSession.line_items?.data) {
    for (const item of fullSession.line_items.data) {
      const priceId = item.price?.id
      const itemDescription = item.description || item.price?.product?.name || 'Unknown item'
      const itemAmount = item.amount_total || 0
      const itemCurrency = item.currency || 'usd'
      lineItems.push({ name: itemDescription, amount: itemAmount, currency: itemCurrency })

      if (!priceId) continue
      const product = priceToProduct.get(priceId)
      if (!product || !product.downloadFile) continue

      const token = randomHex(32)
      const tokenData = {
        productId: product.id,
        productName: product.name,
        downloadFile: product.downloadFile,
        downloadFileName: product.downloadFileName || product.name,
        mimeType: product.downloadMimeType || 'application/pdf',
        sessionId: session.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + DOWNLOAD_TTL_SECONDS * 1000
      }
      await kv.put('download_token:' + token, JSON.stringify(tokenData), { expirationTtl: DOWNLOAD_TTL_SECONDS })
      downloads.push({ token, productName: product.name, fileName: product.downloadFileName || product.name, mimeType: product.downloadMimeType || 'application/pdf' })
    }
  }

  // Send emails (order confirmation + download links if any)
  if (env.RESEND_API_KEY) {
    const emailService = new EmailService(env.RESEND_API_KEY, env.EMAIL_FROM || 'noreply@scsc.qzz.io', env.SITE_URL || 'https://scsc.qzz.io')
    const customerName = session.customer_details?.name || ''
    const totalAmount = fullSession.amount_total || 0

    // Always send order confirmation email
    await emailService.sendOrderConfirmation(customerEmail, customerName, session.id, totalAmount, lineItems)
    // Order confirmation email sent

    // Send download email if there are downloadable items
    if (downloads.length > 0) {
      await emailService.sendDownloadEmail(customerEmail, customerName, downloads, session.id)
      // Download email sent
    }

    // Only mark as sent after ALL emails succeed
    await kv.put(emailSentKey, 'true', { expirationTtl: DOWNLOAD_TTL_SECONDS })
  } else {
    // RESEND_API_KEY not configured, skipping emails
  }
}

export async function handleStripeWebhook(c) {
  const signature = c.req.header('stripe-signature')
  if (!signature) return c.json({ error: 'Missing stripe-signature' }, 400)

  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) return c.json({ error: 'Webhook secret not configured' }, 500)

  try {
    const body = await c.req.text()
    const stripe = new StripeService(c.env.STRIPE_SECRET_KEY, c.env.SITE_URL).stripe
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(event.data.object, c.env)
    }
    return c.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err.message)
    return c.json({ error: err.message }, 400)
  }
}
