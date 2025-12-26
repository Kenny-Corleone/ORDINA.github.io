const CACHE_NAME = 'ordina-cache-v1';
const CORE_ASSETS = [
  '/',
  '/ORDINA.github.io/',
  '/ORDINA.github.io/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : undefined))))
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  try {
    const url = new URL(req.url);
    const noCacheHosts = new Set([
      'firestore.googleapis.com',
      'securetoken.googleapis.com',
      'www.googleapis.com',
      'firebaseinstallations.googleapis.com',
      'stream.zeno.fm'
    ]);
    if (noCacheHosts.has(url.hostname)) {
      event.respondWith(fetch(req));
      return;
    }
  } catch (_) {}
  event.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => cached)
    )
  );
});
