/* Service Worker – force latest files and safe cache updates */

const CACHE_NAME = "treadmill810-cache-v10"; // bump version on each deploy
const ASSETS = [
  "./",
  "./index.html",
  "./app.js?v=999",
  "./manifest.json"
];

// Install: fetch all assets fresh, bypass cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, { cache: "reload" });
            await cache.put(asset, response.clone());
          } catch (err) {
            console.error("Failed to cache", asset, err);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first strategy for HTML/JS, fallback to cache
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  // Force network for HTML and JS files to always get latest
  if (req.url.endsWith("index.html") || req.url.includes("app.js")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // For other assets: cache-first, network fallback
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
