/**
 * Ferrow Service Worker
 * 
 * Provides offline functionality, background sync, and push notifications
 * for the Ferrow PWA.
 */

const CACHE_NAME = 'ferrow-v1.1.0';
const OFFLINE_URL = '/offline';

// Resources to cache for offline functionality
const STATIC_RESOURCES = [
  '/',
  '/offline',
  '/manifest.json',
  // Add other critical static resources
];

// API routes to cache
const API_CACHE_ROUTES = [
  '/api/health',
  '/api/feature-flags',
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Clean up old caches
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Take control of all pages
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Serve offline page if network fails
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for specific routes
          if (response.ok && API_CACHE_ROUTES.some(route => url.pathname.includes(route))) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Serve cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static resources
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone));
            }
            return response;
          });
      })
  );
});

// Background Sync for failed transfers
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'retry-failed-transfers') {
    event.waitUntil(retryFailedTransfers());
  }
});

// Push notifications for transfer updates
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event.data?.text());

  const options = {
    title: 'Ferrow',
    body: 'Transfer update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'ferrow-notification',
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      options.body = payload.message || options.body;
      options.data = { ...options.data, ...payload.data };
    } catch (error) {
      console.error('Error parsing push payload:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);

  event.notification.close();

  if (event.action === 'view') {
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll()
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window/tab
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Periodic background sync (when supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag);

  if (event.tag === 'health-check') {
    event.waitUntil(performHealthCheck());
  }
});

// Background functions
async function retryFailedTransfers() {
  try {
    console.log('Retrying failed transfers...');
    
    // Get failed transfers from IndexedDB or localStorage
    const failedTransfers = await getFailedTransfers();
    
    for (const transfer of failedTransfers) {
      try {
        const response = await fetch('/api/rules/execute-now', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transfer)
        });

        if (response.ok) {
          await removeFailedTransfer(transfer.id);
          console.log('Successfully retried transfer:', transfer.id);
        }
      } catch (error) {
        console.error('Failed to retry transfer:', transfer.id, error);
      }
    }
  } catch (error) {
    console.error('Error in retryFailedTransfers:', error);
  }
}

async function performHealthCheck() {
  try {
    const response = await fetch('/api/health');
    if (response.ok) {
      const health = await response.json();
      
      // Show notification if system is unhealthy
      if (health.status !== 'healthy') {
        await self.registration.showNotification('Ferrow System Alert', {
          body: `System status: ${health.status}`,
          icon: '/icons/icon-192x192.png',
          tag: 'health-alert'
        });
      }
    }
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getFailedTransfers() {
  // Implementation would use IndexedDB to store/retrieve failed transfers
  return [];
}

async function removeFailedTransfer(id) {
  // Implementation would remove the transfer from IndexedDB
  console.log('Removing failed transfer:', id);
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CACHE_TRANSFER':
        // Cache transfer data for offline retry
        cacheTransferForRetry(event.data.transfer);
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
    }
  }
});

async function cacheTransferForRetry(transfer) {
  // Store failed transfer for background retry
  console.log('Caching transfer for retry:', transfer.id);
}