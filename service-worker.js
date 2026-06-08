const CACHE_NAME = "skycast-v19";

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // OLD CACHE DELETE
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      );

      // TAKE CONTROL
      await self.clients.claim();

      //  SHOW UPDATE NOTIFICATION
      self.registration.showNotification("SkyCast Updated ", {
        body: "New AI Assistant feature added!",
        icon: "logo.png",
        badge: "logo.png",

        vibrate: [200, 100, 200],

        data: {
          url: "/SkyCast-App-/",
        },
      });
    })(),
  );
});

// CLICK NOTIFICATION
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url));
});
