// Public collection routes
import { Hono } from 'hono'
import { CollectionService } from '../../services/CollectionService.js'
import { ProductService } from '../../services/ProductService.js'
import { KVManager } from '../../lib/kv.js'
import { getKVNamespace } from '../../utils/kv.js'
import { asyncHandler } from '../../middleware/errorHandler.js'

const router = new Hono()

// Debug endpoint to check KV data (must be BEFORE /:id route)
router.get('/debug', asyncHandler(async (c) => {
  const kvNamespace = getKVNamespace(c.env)
  const kv = new KVManager(kvNamespace)
  
  // Get raw collections:all value
  const rawCollectionsAll = await kvNamespace.get('collections:all')
  
  // Parse with detailed logging
  let collectionIds
  let parseMethod
  try {
    collectionIds = JSON.parse(rawCollectionsAll)
    parseMethod = 'JSON.parse'
  } catch (e) {
    collectionIds = rawCollectionsAll ? rawCollectionsAll.trim().split(/\s+/) : []
    parseMethod = 'split'
  }
  
  return c.json({
    rawCollectionsAll,
    rawType: typeof rawCollectionsAll,
    rawLength: rawCollectionsAll ? rawCollectionsAll.length : 0,
    parsedValue: collectionIds,
    parsedType: typeof collectionIds,
    isArray: Array.isArray(collectionIds),
    parseMethod,
    debug: true
  })
}))

// Get all collections
router.get('/', asyncHandler(async (c) => {
  const kvNamespace = getKVNamespace(c.env)
  const collectionService = new CollectionService(kvNamespace)
  const collections = await collectionService.getAllCollections()
  return c.json(collections)
}))

// Get single collection
router.get('/:id', asyncHandler(async (c) => {
  const kvNamespace = getKVNamespace(c.env)
  const collectionService = new CollectionService(kvNamespace)
  const collection = await collectionService.getCollection(c.req.param('id'))
  return c.json(collection)
}))

// Get products in collection
router.get('/:id/products', asyncHandler(async (c) => {
  const kvNamespace = getKVNamespace(c.env)
  const collectionService = new CollectionService(kvNamespace)
  const products = await collectionService.getProductsInCollection(c.req.param('id'))
  return c.json(products)
}))

export default router

