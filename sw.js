/**
 * Service Worker for IPG System
 * Handles offline support and cache-first strategy for static assets
 */

const CACHE_NAME = 'ipg-cache-v1';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/css/index.css',
  '/js/firebase-config.js',
  '/js/cache-manager.js',
  '/images/logo.png'
];

// Install event
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Cache-first strategy
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Firebase requests
  if (request.url.includes('firebaseio.com') || request.url.includes('googleapis.com')) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first strategy for static assets
  if (request.url.includes('.css') || request.url.includes('.js') || request.url.includes('/images/')) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // Network-first strategy for HTML and data
  event.respondWith(
    fetch(request).then(response => {
      if (!response || response.status !== 200) {
        return caches.match(request);
      }
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, responseToCache);
      });
      return response;
    }).catch(() => {
      return caches.match(request);
    })
  );
});

// Message handler for cache control
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});
