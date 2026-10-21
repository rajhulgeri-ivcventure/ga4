const CACHE_NAME = 'supersave-static-v2';
const OFFLINE_URL = './index.html';
const APP_SHELL = [
  './',
  './index.html',
  './about.html',
  './services.html',
  './contact.html',
  './pricing.html',
  './signin.html',
  './dashboard.html',
  './style.css',
  './script.js',
  './posthog.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).then(() => self.skipWaiting()))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const isSameOrigin = new URL(event.request.url).origin === self.location.origin;
      if (isSameOrigin) {
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        }).catch(() => cached || caches.match(OFFLINE_URL));
      }

      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(OFFLINE_URL));
    })
  );
});
