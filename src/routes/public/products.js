// Public product routes
import { Hono } from 'hono'
import { ProductService } from '../../services/ProductService.js'
import { getKVNamespace } from '../../utils/kv.js'
import { asyncHandler } from '../../middleware/errorHandler.js'

const router = new Hono()

// Get all products
router.get('/', asyncHandler(async (c) => {
  const kvNamespace = getKVNamespace(c.env)
  const productService = new ProductService(kvNamespace)
  const products = await productService.getAllProducts()
  // Strip internal fields from public response
  return c.json(products.map(stripInternalFields))
}))

// Get single product
router.get('/:id', asyncHandler(async (c) => {
  const kvNamespace = getKVNamespace(c.env)
  const productService = new ProductService(kvNamespace)
  const product = await productService.getProduct(c.req.param('id'))
  return c.json(stripInternalFields(product))
}))

/** Remove internal-only fields from public product responses */
function stripInternalFields(product) {
  if (!product) return product
  // Keep download fields so frontend can show download links after purchase
  // Only strip what customers should never see
  const { stripeProductId, variantPrices, ...public_ } = product
  return public_
}

export default router

