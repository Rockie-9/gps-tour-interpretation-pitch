// GPS Handbook · Service Worker for offline support.
// Cache-first for shell + data, network-first for external (Google Fonts).
// Bump CACHE_NAME on any user-visible change.

const CACHE_NAME = 'gps-handbook-v3.0.0';

const SHELL = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './data/capabilities.json',
  './data/scenarios.json',
  './data/bars.json',
  './data/modules.json',
  './data/tiers.json',
  './README.md',
  './CHANGELOG.md',
  './AUDIT.md',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(SHELL.map((url) => cache.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) {
    // External (e.g. Google Fonts) — network-first with cache fallback
    event.respondWith(
      fetch(event.request).then((resp) => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => caches.match(event.request))
    );
    return;
  }
  // Same origin — cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resp) => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy)).catch(() => {});
        }
        return resp;
      });
    })
  );
});
