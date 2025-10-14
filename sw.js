// Service Worker для ORDINA PWA
// Версия: 2.3.4

const CACHE_NAME = 'ordina-v2.3.4';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
    // CDN ресурсы не кэшируем из-за CORS
];

// Установка Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[SW] Cache failed:', error);
            })
    );
    self.skipWaiting();
});

// Активация Service Worker
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

// Fetch - минимальная стратегия, только для офлайн
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Игнорируем все кроме GET запросов
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Игнорируем сторонние домены полностью
    const blockedDomains = ['hesab.az', 'facebook.net', 'adroll.com', 'hotjar.com', 'cdn.tailwindcss.com'];
    if (blockedDomains.some(domain => url.hostname.includes(domain))) {
        return;
    }
    
    // Игнорируем все внешние ресурсы (CDN и т.д.)
    if (url.origin !== self.location.origin) {
        return;
    }
    
    // Обрабатываем только свои ресурсы
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Просто возвращаем ответ, не кэшируем
                return response;
            })
            .catch(() => {
                // Офлайн - пробуем кэш
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        
                        // Для навигации возвращаем index.html
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        
                        // Для остального - 503
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Обработка сообщений от клиента
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker loaded successfully');
