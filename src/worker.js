// Main Cloudflare Worker with Hono framework
import { Hono } from 'hono'
import { createCorsMiddleware } from './middleware/cors.js'
import { errorHandler } from './middleware/errorHandler.js'
import { verifyAdminAuth } from './middleware/auth.js'
import { productLimitMiddleware } from './middleware/productLimit.js'
import { registerRoutes } from './routes/index.js'

const app = new Hono()

// Google Search Console Verification - returns native Response to bypass middleware
app.get('/google-site-verification=HiKfI-NGA143JWXOxU4i1O4JzFqoNJYeyer6n_OvCUU', (c) => {
  return new Response('google-site-verification=HiKfI-NGA143JWXOxU4i1O4JzFqoNJYeyer6n_OvCUU', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  })
})

// Security headers middleware (applied to all routes)
// This must run AFTER the handler, so headers are added to the response
app.use('*', async (c, next) => {
  await next()
  
  // Only add headers if response hasn't been sent yet
  // Check if we can modify headers
  try {
    c.header('X-Content-Type-Options', 'nosniff', { append: false })
    c.header('X-Frame-Options', 'DENY', { append: false })
    c.header('X-XSS-Protection', '1; mode=block', { append: false })
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin', { append: false })
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()', { append: false })
    
    // Content Security Policy
    const csp = [
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
    
    c.header('Content-Security-Policy', csp, { append: false })
    
    // Strict Transport Security (only on HTTPS)
    const url = new URL(c.req.url)
    if (url.protocol === 'https:') {
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload', { append: false })
    }
  } catch (e) {
    // Headers may already be sent for native Response objects
    console.log('Could not set security headers:', e.message)
  }
})

// CORS middleware (needs env for proper configuration)
// Note: We create it per-request since env is request-specific
app.use('*', async (c, next) => {
  const corsMiddleware = createCorsMiddleware(c.env)
  return await corsMiddleware(c, next)
})

// Admin authentication middleware
app.use('/api/admin/*', async (c, next) => {
  // Skip auth for login and Drive OAuth endpoints (popup has no headers)
  const unauthenticatedPaths = new Set([
    '/api/admin/login',
    '/api/admin/drive/oauth/start',
    '/api/admin/drive/oauth/callback'
  ])
  if (unauthenticatedPaths.has(c.req.path)) {
    return next()
  }

  try {
    const authResult = await verifyAdminAuth(c.req, c.env)
    if (!authResult.isValid) {
      console.error('Auth failed:', authResult.error)
      return c.json({ error: authResult.error, status: authResult.status }, authResult.status)
    }

    return next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({ error: 'Authentication middleware failed', status: 500 }, 500)
  }
})

// Product limit middleware (applied to admin routes, but only checks product creation)
app.use('/api/admin/*', productLimitMiddleware)

// Register all routes
registerRoutes(app)

// Error handler (must be last)
app.onError(errorHandler)

app.get('*', async (c) => {
  const url = new URL(c.req.url)
  const pathname = url.pathname
  
  // All other routes: let ASSETS handle (returns correct files or SPA fallback)
  // With run_worker_first=false, Assets already handles static files with correct MIME
  // Worker only gets requests that Assets can't serve
  return c.env.ASSETS.fetch(c.req)
})

export default app
