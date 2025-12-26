const CACHE_NAME = 'ordina-v2.1.0';
const STATIC_CACHE = 'ordina-static-v2.1.0';
const DYNAMIC_CACHE = 'ordina-dynamic-v2.1.0';

// Статические ресурсы для кеширования
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/assets/favicons/favicon-16.png',
    '/assets/favicons/favicon-32.png',
    '/assets/favicons/favicon-180.png'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('Some static assets failed to cache:', err);
            });
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Удаляем старые кеши
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Стратегия кеширования: Cache First для статики, Network First для API
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Пропускаем внешние запросы и запросы к Firebase
    if (url.origin !== self.location.origin) {
        // Для внешних ресурсов используем Network First
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Кешируем успешные ответы
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Если сеть недоступна, пробуем кеш
                    return caches.match(request);
                })
        );
        return;
    }

    // Для статических ресурсов используем Cache First
    if (request.destination === 'image' || 
        request.destination === 'style' || 
        request.destination === 'script' ||
        request.destination === 'font' ||
        url.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then((response) => {
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(STATIC_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Для HTML и других ресурсов используем Network First
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Fallback для навигационных запросов
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});
