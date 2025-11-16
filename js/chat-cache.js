// Chat Cache Manager - Otimiza queries ao Firestore com caching local

class ChatCache {
    constructor() {
        this.db = firebase.firestore();
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
        this.initIndexedDB();
    }

    initIndexedDB() {
        const request = indexedDB.open('ChatDB', 1);

        request.onerror = () => {
            console.warn('[ChatCache] IndexedDB not available');
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('messages')) {
                db.createObjectStore('messages', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('turmas')) {
                db.createObjectStore('turmas', { keyPath: 'id' });
            }
        };
    }

    async getCachedMessages(turmaId, limit = 50) {
        const cacheKey = `messages-${turmaId}`;
        const now = Date.now();

        // Check memory cache
        if (this.cache.has(cacheKey)) {
            const expiry = this.cacheExpiry.get(cacheKey);
            if (expiry && now < expiry) {
                console.log('[ChatCache] Returning cached messages');
                return this.cache.get(cacheKey);
            } else {
                this.cache.delete(cacheKey);
                this.cacheExpiry.delete(cacheKey);
            }
        }

        // Fetch from Firestore with pagination
        try {
            const snapshot = await this.db
                .collection('turmas')
                .doc(turmaId)
                .collection('chats')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() });
            });

            // Cache results
            this.cache.set(cacheKey, messages);
            this.cacheExpiry.set(cacheKey, now + this.cacheTTL);

            // Store in IndexedDB for offline
            this.storeInIndexedDB('messages', messages);

            return messages;
        } catch (error) {
            console.error('[ChatCache] Error fetching messages:', error);
            // Return from IndexedDB if offline
            return this.getFromIndexedDB('messages');
        }
    }

    invalidateCache(turmaId) {
        const cacheKey = `messages-${turmaId}`;
        this.cache.delete(cacheKey);
        this.cacheExpiry.delete(cacheKey);
    }

    storeInIndexedDB(storeName, data) {
        const request = indexedDB.open('ChatDB', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            if (Array.isArray(data)) {
                data.forEach((item) => store.put(item));
            } else {
                store.put(data);
            }
        };
    }

    getFromIndexedDB(storeName) {
        return new Promise((resolve) => {
            const request = indexedDB.open('ChatDB', 1);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    resolve(getAllRequest.result || []);
                };
            };
            request.onerror = () => resolve([]);
        });
    }

    clearCache() {
        this.cache.clear();
        this.cacheExpiry.clear();
    }

    getStats() {
        return {
            cached: this.cache.size,
            expired: Array.from(this.cacheExpiry.entries()).filter(
                ([_, expiry]) => expiry < Date.now()
            ).length,
        };
    }
}

// Export for use in chat-manager.js
const chatCache = new ChatCache();
