// Development service worker - minimal caching
const DEV_CACHE = 'ordina-dev-cache';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith('ordina-')) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Basic fetch passthrough for development
self.addEventListener('fetch', (event) => {
  // Only cache static assets in development
  const url = new URL(event.request.url);
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(DEV_CACHE).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return res;
        });
      })
    );
  }
});
