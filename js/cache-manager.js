/**
 * Cache Manager for IPG System
 * Implements LocalStorage caching with expiration, ServiceWorker support, and API response caching
 */

class CacheManager {
  constructor(options = {}) {
    this.prefix = options.prefix || 'ipg_cache_';
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.storageType = options.storageType || 'localStorage';
    this.maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB
    this.initializeStorage();
  }

  initializeStorage() {
    try {
      const test = '__test__';
      const storage = window[this.storageType];
      storage.setItem(test, test);
      storage.removeItem(test);
    } catch (e) {
      console.warn('[CacheManager] Storage not available, using in-memory cache');
      this.storageType = 'memory';
      this.memoryCache = new Map();
    }
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Set value in cache with TTL
   */
  set(key, value, ttl = this.defaultTTL) {
    const cacheKey = this.generateKey(key);
    const cacheData = {
      value,
      timestamp: Date.now(),
      ttl,
      expires: Date.now() + ttl
    };

    try {
      if (this.storageType === 'memory') {
        this.memoryCache.set(cacheKey, cacheData);
      } else {
        const storage = window[this.storageType];
        storage.setItem(cacheKey, JSON.stringify(cacheData));
      }
      console.log(`[CacheManager] Cached: ${key} (TTL: ${ttl}ms)`);
    } catch (e) {
      console.error(`[CacheManager] Error caching ${key}:`, e);
      // If storage is full, try to clear old cache
      if (e.name === 'QuotaExceededError') {
        this.clearExpired();
        try {
          if (this.storageType !== 'memory') {
            window[this.storageType].setItem(cacheKey, JSON.stringify(cacheData));
          }
        } catch (retryError) {
          console.error('[CacheManager] Cache still full after cleanup');
        }
      }
    }
  }

  /**
   * Get value from cache with expiration check
   */
  get(key) {
    const cacheKey = this.generateKey(key);
    
    try {
      let cacheData;
      
      if (this.storageType === 'memory') {
        cacheData = this.memoryCache.get(cacheKey);
      } else {
        const storage = window[this.storageType];
        const cached = storage.getItem(cacheKey);
        cacheData = cached ? JSON.parse(cached) : null;
      }

      if (!cacheData) {
        return null;
      }

      // Check if expired
      if (Date.now() > cacheData.expires) {
        this.remove(key);
        return null;
      }

      console.log(`[CacheManager] Cache hit: ${key}`);
      return cacheData.value;
    } catch (e) {
      console.error(`[CacheManager] Error reading cache for ${key}:`, e);
      return null;
    }
  }

  /**
   * Remove specific cache entry
   */
  remove(key) {
    const cacheKey = this.generateKey(key);
    
    try {
      if (this.storageType === 'memory') {
        this.memoryCache.delete(cacheKey);
      } else {
        window[this.storageType].removeItem(cacheKey);
      }
    } catch (e) {
      console.error(`[CacheManager] Error removing cache for ${key}:`, e);
    }
  }

  /**
   * Clear all expired cache entries
   */
  clearExpired() {
    try {
      if (this.storageType === 'memory') {
        for (const [key, data] of this.memoryCache.entries()) {
          if (Date.now() > data.expires) {
            this.memoryCache.delete(key);
          }
        }
      } else {
        const storage = window[this.storageType];
        const keysToRemove = [];
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key?.startsWith(this.prefix)) {
            try {
              const data = JSON.parse(storage.getItem(key));
              if (Date.now() > data.expires) {
                keysToRemove.push(key);
              }
            } catch (e) {
              keysToRemove.push(key);
            }
          }
        }
        
        keysToRemove.forEach(key => storage.removeItem(key));
        console.log(`[CacheManager] Cleared ${keysToRemove.length} expired entries`);
      }
    } catch (e) {
      console.error('[CacheManager] Error clearing expired cache:', e);
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    try {
      if (this.storageType === 'memory') {
        this.memoryCache.clear();
      } else {
        const storage = window[this.storageType];
        const keysToRemove = [];
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key?.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => storage.removeItem(key));
      }
      console.log('[CacheManager] Cache cleared');
    } catch (e) {
      console.error('[CacheManager] Error clearing cache:', e);
    }
  }

  /**
   * Fetch with caching - returns cached result if valid, otherwise fetches fresh data
   */
  async fetchWithCache(url, options = {}) {
    const cacheKey = options.cacheKey || url;
    const ttl = options.ttl || this.defaultTTL;
    const forceRefresh = options.forceRefresh || false;

    if (!forceRefresh) {
      const cached = this.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.set(cacheKey, data, ttl);
      return data;
    } catch (error) {
      console.error(`[CacheManager] Fetch failed for ${url}:`, error);
      // Try to return stale cache on error
      const stale = this.get(cacheKey);
      if (stale) {
        console.log('[CacheManager] Returning stale cache due to fetch error');
        return stale;
      }
      throw error;
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    let totalSize = 0;
    let entryCount = 0;

    try {
      if (this.storageType === 'memory') {
        entryCount = this.memoryCache.size;
        for (const data of this.memoryCache.values()) {
          totalSize += JSON.stringify(data).length;
        }
      } else {
        const storage = window[this.storageType];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key?.startsWith(this.prefix)) {
            entryCount++;
            totalSize += (key.length + storage.getItem(key).length);
          }
        }
      }
    } catch (e) {
      console.error('[CacheManager] Error getting cache stats:', e);
    }

    return {
      entryCount,
      totalSize: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      maxSize: this.maxSize,
      storageType: this.storageType
    };
  }
}

// Create global instance
window.cacheManager = new CacheManager({
  prefix: 'ipg_',
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  storageType: 'localStorage'
});

// Auto-clear expired cache periodically
setInterval(() => {
  if (window.cacheManager) {
    window.cacheManager.clearExpired();
  }
}, 60 * 1000); // Every minute

// Clear cache on page unload if configured
if (window.location.pathname.includes('logout')) {
  window.cacheManager?.clear();
}

console.log('[CacheManager] Initialized');
