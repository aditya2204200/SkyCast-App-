

const CACHE_NAME = "skycast-v8";

self.addEventListener("install", (event) => {
  // ❌ यहाँ skipWaiting नहीं
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting(); // ✅ only manual update
  }
});
