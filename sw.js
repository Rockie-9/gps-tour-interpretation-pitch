// V2 F6 (item 25): Service worker for offline support.
// Version pinned to deck <meta name="version">. Bump CACHE_NAME on any user-visible change
// or the cache will not invalidate.
//
// Strategy: cache-first for shell assets (deck shell + spec + curriculum + artifacts),
// network-first for everything else (fonts CDN, citation links).

const CACHE_NAME = 'gps-deck-v2.0.0';

const SHELL_ASSETS = [
  './',
  './index.html',
  './CHANGELOG.md',
  './STATUS.md',
  './README.md',
  './spec/README.md',
  './spec/audit-events.json',
  './spec/logging.md',
  './spec/dependencies.md',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache best-effort; non-existent assets (curriculum/, artifacts/ added later)
      // are tolerated — cache.add will fail individually but Promise.all gives us the partial.
      return Promise.all(
        SHELL_ASSETS.map((url) => cache.add(url).catch(() => null))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only intercept GET to same origin
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) {
    // External (e.g. Google Fonts CDN) — network-first with cache fallback
    event.respondWith(
      fetch(event.request).then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'cors') {
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
