const CACHE_VERSION = 'v8-dashboard-fix';
const STATIC_CACHE = `ordina-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ordina-dynamic-${CACHE_VERSION}`;
const CORE_ASSETS = [
  '/ORDINA.github.io/',
  '/ORDINA.github.io/index.html',
  '/ORDINA.github.io/manifest.webmanifest',
  '/ORDINA.github.io/sw.js'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(err => {
        console.warn('Failed to cache some core assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Skip non-GET requests
  if (req.method !== 'GET') return;
  
  const url = new URL(req.url);
  
  // Skip caching for API calls and external services
  const noCacheHosts = new Set([
    'firestore.googleapis.com',
    'securetoken.googleapis.com',
    'www.googleapis.com',
    'firebaseinstallations.googleapis.com',
    'stream.zeno.fm',
    'api.allorigins.win',
    'corsproxy.io',
    'api.codetabs.com',
    'proxy.cors.sh',
    'www.bfb.az',
    'tradingeconomics.com'
  ]);
  
  if (noCacheHosts.has(url.hostname)) {
    return; // Pass through to network without interception
  }
  
  // Cache-first strategy for static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(req).then((res) => {
          // Don't cache if not successful
          if (!res || res.status !== 200 || res.type === 'error') {
            return res;
          }
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(req, copy);
          });
          return res;
        }).catch(() => {
          // Return offline fallback if available
          if (req.destination === 'image') {
            return new Response('', { status: 404 });
          }
        });
      })
    );
    return;
  }
  
  // Network-first strategy for HTML pages
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(req, copy);
        });
        return res;
      }).catch(() => {
        return caches.match(req).then((cached) => {
          if (cached) {
            return cached;
          }
          // Return offline page if available
          return caches.match('/ORDINA.github.io/index.html') || caches.match('/');
        });
      })
    );
    return;
  }
  
  // Network-first with cache fallback for other resources
  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(req, copy);
        });
      }
      return res;
    }).catch(() => {
      return caches.match(req).then((cached) => {
        if (cached) {
          return cached;
        }
        // Return offline page for HTML requests
        if (req.headers.get('accept')?.includes('text/html')) {
          return caches.match('/ORDINA.github.io/index.html') || caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Handle offline status
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
