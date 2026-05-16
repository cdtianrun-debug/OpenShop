// Collection service - handles collection business logic
import { KVManager } from '../lib/kv.js'
import { NotFoundError } from '../utils/errors.js'

export class CollectionService {
  constructor(kvNamespace) {
    this.kv = new KVManager(kvNamespace)
  }

  /**
   * Get all collections (excluding archived)
   */
  async getAllCollections() {
    const collections = await this.kv.getAllCollections()
    const filtered = collections.filter(col => !col.archived)
    // Add productCount for each collection by reading collection:products index
    const withCounts = await Promise.all(filtered.map(async (col) => {
      const products = await this.kv.getProductsByCollection(col.id)
      return {
        ...col,
        productCount: products.filter(p => !p.archived).length
      }
    }))
    return withCounts
  }

  /**
   * Get all collections including archived (for admin)
   */
  async getAllCollectionsAdmin() {
    return await this.kv.getAllCollections()
  }

  /**
   * Get single collection by ID or slug
   */
  async getCollection(idOrSlug) {
    // Try ID first (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(idOrSlug)) {
      const collection = await this.kv.getCollection(idOrSlug)
      if (collection && !collection.archived) {
        const products = await this.kv.getProductsByCollection(idOrSlug)
        return { ...collection, productCount: products.filter(p => !p.archived).length }
      }
      return collection
    }
    // Fall back to slug lookup
    return await this.getCollectionBySlug(idOrSlug)
  }

  /**
   * Get collection by slug (scans all collections - use sparingly)
   */
  async getCollectionBySlug(slug) {
    const all = await this.kv.getAllCollections()
    const match = all.find(c => c.slug === slug && !c.archived)
    if (!match) {
      throw new NotFoundError('Collection not found')
    }
    const products = await this.kv.getProductsByCollection(match.id)
    return { ...match, productCount: products.filter(p => !p.archived).length }
  }

  /**
   * Create a new collection
   */
  async createCollection(collectionData) {
    return await this.kv.createCollection(collectionData)
  }

  /**
   * Update an existing collection
   */
  async updateCollection(id, updates) {
    const existing = await this.kv.getCollection(id)
    if (!existing) {
      throw new NotFoundError('Collection not found')
    }
    return await this.kv.updateCollection(id, updates)
  }

  /**
   * Delete a collection
   */
  async deleteCollection(id) {
    const existing = await this.kv.getCollection(id)
    if (!existing) {
      throw new NotFoundError('Collection not found')
    }
    await this.kv.deleteCollection(id)
  }

  /**
   * Get products in a collection (with archived check)
   */
  async getProductsInCollection(collectionId) {
    const collection = await this.kv.getCollection(collectionId)
    if (!collection) {
      throw new NotFoundError('Collection not found')
    }
    
    const products = await this.kv.getProductsByCollection(collectionId)
    
    // If collection is archived, hide all products regardless of product flag
    if (collection.archived) {
      return []
    }
    
    return products.filter(p => !p.archived)
  }
}

