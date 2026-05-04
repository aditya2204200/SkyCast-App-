const CACHE_NAME = "skycast-v11";

self.addEventListener("install", (event) => {
  console.log("SW Installed");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 🔥 Only update when user clicks button
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
