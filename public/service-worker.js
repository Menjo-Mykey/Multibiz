const STATIC_CACHE = "pos-static-v2";
const DYNAMIC_CACHE = "pos-dynamic-v2";
const urlsToCache = ["/", "/index.html", "/manifest.json", "/offline.html"];

// Install service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Fetch resources
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle http(s) requests; skip browser extensions and others
  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  // Network-first for API calls
  if (req.url.includes("/rest/") || req.url.includes("/v1/")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for static assets
  if (
    req.destination === "style" ||
    req.destination === "script" ||
    req.destination === "image" ||
    req.destination === "font" ||
    req.url.endsWith("/manifest.json")
  ) {
    event.respondWith(
      caches.match(req).then((cacheRes) => {
        return (
          cacheRes ||
          fetch(req).then((res) => {
            const resClone = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, resClone));
            return res;
          })
        );
      })
    );
    return;
  }

  // Stale-while-revalidate for pages and semi-dynamic content
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          caches
            .open(DYNAMIC_CACHE)
            .then((cache) => cache.put(req, networkRes.clone()));
          return networkRes;
        })
        .catch(() => cached || caches.match("/offline.html"));
      return cached || fetchPromise;
    })
  );
});

// Activate service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Listen for skipWaiting message to enable in-app update
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
