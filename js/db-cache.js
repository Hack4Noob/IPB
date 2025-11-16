/**
 * Firebase Firestore Caching Layer
 * Implements aggressive caching for Firestore queries
 */

class FirestoreCacheLayer {
  constructor(firebaseApp, cacheDuration = 5 * 60 * 1000) {
    this.cache = new Map();
    this.cacheDuration = cacheDuration;
    this.pendingRequests = new Map();
  }

  /**
   * Get collection with caching
   */
  async getCollection(db, collectionName, queryConstraints = []) {
    const cacheKey = `${collectionName}_${JSON.stringify(queryConstraints)}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      console.log(`[FirestoreCache] Cache hit: ${collectionName}`);
      return cached;
    }

    // Prevent duplicate requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const promise = (async () => {
      try {
        const q = firebase.firestore.query(
          firebase.firestore.collection(db, collectionName),
          ...queryConstraints
        );
        const snapshot = await firebase.firestore.getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        this.setInCache(cacheKey, data);
        this.pendingRequests.delete(cacheKey);
        return data;
      } catch (error) {
        console.error(`[FirestoreCache] Error fetching ${collectionName}:`, error);
        this.pendingRequests.delete(cacheKey);
        throw error;
      }
    })();

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  /**
   * Get document with caching
   */
  async getDocument(db, collectionName, docId) {
    const cacheKey = `${collectionName}/${docId}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      console.log(`[FirestoreCache] Cache hit: ${cacheKey}`);
      return cached;
    }

    try {
      const docRef = firebase.firestore.doc(db, collectionName, docId);
      const docSnap = await firebase.firestore.getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = { id: docSnap.id, ...docSnap.data() };
      this.setInCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`[FirestoreCache] Error fetching ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Cache helpers
   */
  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.cacheDuration) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  setInCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
    console.log(`[FirestoreCache] Invalidated cache matching: ${pattern}`);
  }

  clear() {
    this.cache.clear();
    console.log('[FirestoreCache] Cache cleared');
  }
}

// Create global instance after Firebase is ready
window.addEventListener('firebaseReady', () => {
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    window.firestoreCache = new FirestoreCacheLayer(
      firebase.firestore(),
      5 * 60 * 1000 // 5 minutes
    );
  }
});
