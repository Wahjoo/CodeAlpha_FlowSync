import { precacheAndRoute } from 'workbox-precaching';

// This is the injection point where vite-plugin-pwa will inject the manifest
precacheAndRoute(self.__WB_MANIFEST || []);

// Listen for the skip_waiting event to force the waiting service worker to become the active service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Add any other custom service worker logic here
