const CACHE_NAME = "treadmill810-cache-v11"; // increment version
const ASSETS = [
  "./",
  "./index.html",
  "./app.js?v=999",
  "./manifest.json"
];

// Install: network-first for HTML/JS
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, { cache: "reload" });
            await cache.put(asset, response.clone());
          } catch (err) { console.error("Failed to cache", asset, err); }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML/JS, cache-first for others
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.url.endsWith("index.html") || req.url.includes("app.js")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for other files
  event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
