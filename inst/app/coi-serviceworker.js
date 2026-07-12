/* ChartForge 0.6.6 retirement worker.
 * Earlier releases registered this worker to add cross-origin-isolation
 * headers. WebR now uses its PostMessage channel, so the worker unregisters
 * itself and leaves requests unchanged.
 */
(function () {
  if (typeof self === "undefined" || !self.registration) return;
  self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));
  self.addEventListener("activate", event => {
    event.waitUntil((async () => {
      await self.registration.unregister();
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach(client => client.navigate(client.url));
    })());
  });
  self.addEventListener("fetch", event => event.respondWith(fetch(event.request)));
}());
