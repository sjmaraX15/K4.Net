
// Remove the old KaMoRaLe / ReFaluwash app service worker
// and clear previously cached website files.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete old application and website caches.
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );

      // Take control of open pages, then unregister this worker.
      await self.clients.claim();
      await self.registration.unregister();
    })()
  );
});

