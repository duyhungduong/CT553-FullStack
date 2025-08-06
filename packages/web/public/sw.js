// Service Worker for MelodicBook PWA
const CACHE_NAME = 'melodicbook-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const API_CACHE = `${CACHE_NAME}-api`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first', 
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/offline.html' // Fallback page
];

// API endpoints to cache
const API_PATTERNS = [
  /^\/api\/songs/,
  /^\/api\/albums/, 
  /^\/api\/artists/,
  /^\/api\/playlists/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('SW: Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Static assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('SW: Failed to cache static assets:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Service Worker activated');
        return self.clients.claim(); // Control all clients immediately
      })
  );
});

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different request types
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|html|json|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         API_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Check if request is for image
function isImageRequest(request) {
  return request.destination === 'image' ||
         request.url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/);
}

// Handle static assets - Cache First
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('SW: Static asset fetch failed:', error);
    
    // Return fallback for HTML requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Handle API requests - Stale While Revalidate
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Start network request in background
    const networkPromise = fetch(request)
      .then(networkResponse => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      })
      .catch(error => {
        console.error('SW: API network request failed:', error);
        return null;
      });

    // Return cached version immediately if available
    if (cachedResponse) {
      // Update cache in background
      networkPromise.catch(() => {}); // Ignore errors for background update
      return cachedResponse;
    }

    // Wait for network if no cache
    return await networkPromise || createOfflineResponse();
  } catch (error) {
    console.error('SW: API request failed:', error);
    return createOfflineResponse();
  }
}

// Handle image requests - Cache First with fallback
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('SW: Image request failed:', error);
    
    // Return placeholder image
    return caches.match('/images/placeholder.png') || 
           new Response('', { status: 404 });
  }
}

// Handle dynamic requests - Network First
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('SW: Dynamic request failed:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for HTML requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Create offline response for API requests
function createOfflineResponse() {
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'No internet connection available',
      data: null
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }
  );
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('SW: Background sync triggered');
    event.waitUntil(syncFailedRequests());
  }
});

// Sync failed requests when back online
async function syncFailedRequests() {
  try {
    // Get stored failed requests and retry them
    const failedRequests = await getStoredFailedRequests();
    
    for (const request of failedRequests) {
      try {
        await fetch(request);
        console.log('SW: Successfully synced request:', request.url);
      } catch (error) {
        console.error('SW: Failed to sync request:', request.url, error);
      }
    }
    
    await clearStoredFailedRequests();
  } catch (error) {
    console.error('SW: Background sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'play',
          title: 'Play Now',
          icon: '/icon-play.png'
        },
        {
          action: 'later',
          title: 'Save for Later',
          icon: '/icon-save.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('SW: Push notification error:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  event.waitUntil(
    clients.openWindow(data.url || '/')
      .then(client => {
        if (client) {
          client.postMessage({
            action: action,
            data: data
          });
        }
      })
  );
});

// Utility functions for IndexedDB storage
async function getStoredFailedRequests() {
  // Implementation would use IndexedDB
  return [];
}

async function clearStoredFailedRequests() {
  // Implementation would use IndexedDB
}

// Log service worker version
console.log(`SW: MelodicBook Service Worker ${CACHE_NAME} initialized`);
