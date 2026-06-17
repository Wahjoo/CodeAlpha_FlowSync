import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// This is the injection point where vite-plugin-pwa will inject the manifest
precacheAndRoute(self.__WB_MANIFEST || []);

// 1. Background Sync Configuration
const bgSyncPlugin = new BackgroundSyncPlugin('flowsync-queue', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

// Register background sync for POST, PUT, DELETE requests to the API
const syncMethods = ['POST', 'PUT', 'DELETE'];
syncMethods.forEach((method) => {
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkOnly({
      plugins: [bgSyncPlugin]
    }),
    method
  );
});

// 2. Periodic Background Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Custom logic to sync data periodically can go here
    console.log('Periodic background sync executed!');
  } catch (err) {
    console.error('Periodic background sync failed:', err);
  }
}

// 3. Push Notifications
self.addEventListener('push', function (event) {
  if (event.data) {
    let data = {};
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'FlowSync Notification', body: event.data.text() };
    }
    
    const options = {
      body: data.body || 'You have a new update!',
      icon: data.icon || '/icon-192.png',
      badge: '/favicon.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || '1',
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'FlowSync', options)
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Listen for the skip_waiting event to force the waiting service worker to become the active service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
