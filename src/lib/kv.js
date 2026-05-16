// Cloudflare KV operations
// This will be used by Cloudflare Functions to interact with KV storage

export class KVManager {
  constructor(namespace) {
    this.namespace = namespace
  }

  // Product operations
  async createProduct(product) {
    const key = `product:${product.id}`
    // Ensure images is always an array
    const productData = {
      ...product,
      images: Array.isArray(product.images) ? product.images : (product.imageUrl ? [product.imageUrl] : [])
    }
    await this.namespace.put(key, JSON.stringify(productData))
    
    // Also update the products list
    const productIds = await this.namespace.get('products:all')
    let existingIds = []
    if (productIds) {
      try {
        existingIds = JSON.parse(productIds)
      } catch {
        existingIds = productIds.trim().split(/\s+/)
      }
    }
    existingIds.push(product.id)
    await this.namespace.put('products:all', JSON.stringify(existingIds))

    // Update collection index if present
    if (productData.collectionId) {
      const collKey = `collection:products:${productData.collectionId}`
      const collProductIds = await this.namespace.get(collKey)
      let existingCollIds = []
      if (collProductIds) {
        try {
          existingCollIds = JSON.parse(collProductIds)
        } catch {
          existingCollIds = collProductIds.trim().split(/\s+/)
        }
      }
      if (!existingCollIds.includes(productData.id)) {
        existingCollIds.push(productData.id)
        await this.namespace.put(collKey, JSON.stringify(existingCollIds))
      }
    }
    
    return productData
  }

  async getProduct(id) {
    const key = `product:${id}`
    const product = await this.namespace.get(key)
    if (!product) return null
    // Handle UTF-8 BOM that wrangler sometimes adds when writing
    const cleaned = product.startsWith('\ufeff') ? product.slice(1) : product
    return JSON.parse(cleaned)
  }

  async updateProduct(id, updates) {
    const existing = await this.getProduct(id)
    if (!existing) throw new Error('Product not found')
    
    const updated = { 
      ...existing, 
      ...updates,
      // Ensure images is always an array
      images: Array.isArray(updates.images) ? updates.images : 
              (updates.imageUrl ? [updates.imageUrl] : existing.images || [])
    }
    const key = `product:${id}`
    await this.namespace.put(key, JSON.stringify(updated))

    // Update collection index if collectionId changed
    if (existing.collectionId !== updated.collectionId) {
      // Remove from old collection index
      if (existing.collectionId) {
        const oldCollKey = `collection:products:${existing.collectionId}`
        const oldCollProductIds = await this.namespace.get(oldCollKey)
        if (oldCollProductIds) {
          let ids
          try {
            ids = JSON.parse(oldCollProductIds)
          } catch {
            ids = oldCollProductIds.trim().split(/\s+/)
          }
          ids = ids.filter(pid => pid !== id)
          await this.namespace.put(oldCollKey, JSON.stringify(ids))
        }
      }
      // Add to new collection index
      if (updated.collectionId) {
        const newCollKey = `collection:products:${updated.collectionId}`
        const newCollProductIds = await this.namespace.get(newCollKey)
        let ids = []
        if (newCollProductIds) {
          try {
            ids = JSON.parse(newCollProductIds)
          } catch {
            ids = newCollProductIds.trim().split(/\s+/)
          }
        }
        if (!ids.includes(id)) {
          ids.push(id)
          await this.namespace.put(newCollKey, JSON.stringify(ids))
        }
      }
    }

    return updated
  }

  async deleteProduct(id) {
    const product = await this.getProduct(id)
    const key = `product:${id}`
    await this.namespace.delete(key)
    
    // Remove from products list
    const productIds = await this.namespace.get('products:all')
    if (productIds) {
      let existingIds
      try {
        existingIds = JSON.parse(productIds)
      } catch {
        existingIds = productIds.trim().split(/\s+/)
      }
      const filtered = existingIds.filter(pid => pid !== id)
      await this.namespace.put('products:all', JSON.stringify(filtered))
    }

    // Remove from collection index
    if (product && product.collectionId) {
      const collKey = `collection:products:${product.collectionId}`
      const collProductIds = await this.namespace.get(collKey)
      if (collProductIds) {
        let ids
        try {
          ids = JSON.parse(collProductIds)
        } catch {
          ids = collProductIds.trim().split(/\s+/)
        }
        const filtered = ids.filter(pid => pid !== id)
        await this.namespace.put(collKey, JSON.stringify(filtered))
      }
    }
  }

  async getAllProducts() {
    const productIds = await this.namespace.get('products:all')
    if (!productIds) return []
    
    let ids
    try {
      // Try JSON first (new format)
      ids = JSON.parse(productIds)
    } catch {
      // Fallback to space-separated (old format)
      ids = productIds.trim().split(/\s+/)
    }
    
    const products = await Promise.all(
      ids.map(id => this.getProduct(id))
    )
    return products.filter(Boolean)
  }

  // Collection operations
  async createCollection(collection) {
    const key = `collection:${collection.id}`
    await this.namespace.put(key, JSON.stringify(collection))
    
    // Also update the collections list
    const collectionIds = await this.namespace.get('collections:all')
    let existingIds = []
    if (collectionIds) {
      try {
        existingIds = JSON.parse(collectionIds)
      } catch {
        existingIds = collectionIds.trim().split(/\s+/)
      }
    }
    existingIds.push(collection.id)
    await this.namespace.put('collections:all', JSON.stringify(existingIds))
    
    return collection
  }

  async getCollection(id) {
    const key = `collection:${id}`
    const collection = await this.namespace.get(key)
    return collection ? JSON.parse(collection) : null
  }

  async updateCollection(id, updates) {
    const existing = await this.getCollection(id)
    if (!existing) throw new Error('Collection not found')
    
    const updated = { ...existing, ...updates }
    const key = `collection:${id}`
    await this.namespace.put(key, JSON.stringify(updated))
    return updated
  }

  async deleteCollection(id) {
    const key = `collection:${id}`
    await this.namespace.delete(key)
    
    // Remove from collections list
    const collectionIds = await this.namespace.get('collections:all')
    if (collectionIds) {
      let existingIds
      try {
        existingIds = JSON.parse(collectionIds)
      } catch {
        existingIds = collectionIds.trim().split(/\s+/)
      }
      const filtered = existingIds.filter(cid => cid !== id)
      await this.namespace.put('collections:all', JSON.stringify(filtered))
    }

    // Clean up the index
    await this.namespace.delete(`collection:products:${id}`)
  }

  async getAllCollections() {
    const collectionIds = await this.namespace.get('collections:all')
    console.log('getAllCollections: raw collectionIds:', collectionIds)
    if (!collectionIds) return []
    
    let ids
    let raw = collectionIds
    
    // Handle Cloudflare API response wrapper: {"value":"[...]"}
    if (typeof raw === 'string' && raw.startsWith('{"value":')) {
      try {
        const wrapper = JSON.parse(raw)
        if (wrapper.value) {
          raw = wrapper.value
          console.log('getAllCollections: unwrapped value:', raw)
        }
      } catch (e) {
        console.log('getAllCollections: failed to unwrap:', e.message)
      }
    }
    
    try {
      // Try JSON first (new format)
      ids = JSON.parse(raw)
    } catch {
      // Fallback to space-separated (old format)
      ids = raw.trim().split(/\s+/)
    }
    
    console.log('getAllCollections: parsed ids:', ids, 'isArray:', Array.isArray(ids))
    
    // Ensure ids is an array
    if (!Array.isArray(ids)) {
      console.error('getAllCollections: ids is not an array, got:', typeof ids, ids)
      // If it's a string, try to parse it as JSON again
      if (typeof ids === 'string') {
        try {
          ids = JSON.parse(ids)
        } catch {
          ids = ids.trim().split(/\s+/)
        }
      }
      // If still not an array, return empty
      if (!Array.isArray(ids)) {
        console.error('getAllCollections: failed to parse ids as array, returning empty')
        return []
      }
    }
    
    const collections = await Promise.all(
      ids.map(id => this.getCollection(id))
    )
    console.log('getAllCollections: fetched collections count:', collections.filter(Boolean).length)
    return collections.filter(Boolean)
  }

  async getProductsByCollection(collectionId) {
    const collKey = `collection:products:${collectionId}`
    const productIds = await this.namespace.get(collKey)
    console.log('getProductsByCollection: raw productIds for', collectionId, ':', productIds)
    if (!productIds) return []

    let ids
    let raw = productIds
    
    // Handle Cloudflare API response wrapper: {"value":"[...]"}
    if (typeof raw === 'string' && raw.startsWith('{"value":')) {
      try {
        const wrapper = JSON.parse(raw)
        if (wrapper.value) {
          raw = wrapper.value
          console.log('getProductsByCollection: unwrapped value:', raw)
        }
      } catch (e) {
        console.log('getProductsByCollection: failed to unwrap:', e.message)
      }
    }

    try {
      // Try JSON first (new format)
      ids = JSON.parse(raw)
    } catch {
      // Fallback to space-separated (old format)
      ids = raw.trim().split(/\s+/)
    }
    
    console.log('getProductsByCollection: parsed ids:', ids, 'isArray:', Array.isArray(ids))
    
    // Ensure ids is an array
    if (!Array.isArray(ids)) {
      console.error('getProductsByCollection: ids is not an array, got:', typeof ids, ids)
      if (typeof ids === 'string') {
        try {
          ids = JSON.parse(ids)
        } catch {
          ids = ids.trim().split(/\s+/)
        }
      }
      if (!Array.isArray(ids)) {
        console.error('getProductsByCollection: failed to parse ids as array, returning empty')
        return []
      }
    }
    
    const products = await Promise.all(
      ids.map(id => this.getProduct(id))
    )
    console.log('getProductsByCollection: fetched products count:', products.filter(Boolean).length)
    return products.filter(Boolean)
  }

  // Media operations
  async createMediaItem(item) {
    const id = item.id
    if (!id) throw new Error('Media item missing id')
    const key = `media:${id}`
    const record = {
      id,
      url: String(item.url || ''),
      source: item.source || 'unknown',
      filename: item.filename || '',
      mimeType: item.mimeType || '',
      driveFileId: item.driveFileId || '',
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      updatedAt: Date.now(),
    }
    await this.namespace.put(key, JSON.stringify(record))

    const listKey = 'media:all'
    const existing = await this.namespace.get(listKey)
    let ids = []
    if (existing) {
      try {
        ids = JSON.parse(existing)
      } catch {
        ids = existing.trim().split(/\s+/)
      }
    }
    if (!ids.includes(id)) ids.push(id)
    await this.namespace.put(listKey, JSON.stringify(ids))
    return record
  }

  async getMediaItem(id) {
    const key = `media:${id}`
    const raw = await this.namespace.get(key)
    return raw ? JSON.parse(raw) : null
  }

  async deleteMediaItem(id) {
    const key = `media:${id}`
    await this.namespace.delete(key)
    const listKey = 'media:all'
    const existing = await this.namespace.get(listKey)
    if (existing) {
      let ids
      try {
        ids = JSON.parse(existing)
      } catch {
        ids = existing.trim().split(/\s+/)
      }
      const next = ids.filter(mid => mid !== id)
      await this.namespace.put(listKey, JSON.stringify(next))
    }
  }

  async getAllMediaItems() {
    const listKey = 'media:all'
    const existing = await this.namespace.get(listKey)
    if (!existing) return []
    let ids
    try {
      ids = JSON.parse(existing)
    } catch {
      ids = existing.trim().split(/\s+/)
    }
    const items = await Promise.all(ids.map(id => this.getMediaItem(id)))
    return items.filter(Boolean)
  }
}
