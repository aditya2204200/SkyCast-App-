// const CACHE_NAME = "skycast-v2"; // 🔥 change karo

// const urlsToCache = [
//   "/SkyCast-App-/",
//   "/SkyCast-App-/index.html",
//   "/SkyCast-App-/style.css",
//   "/SkyCast-App-/script.js",
//   "/SkyCast-App-/logo.png",
// ];

// self.addEventListener("install", (event) => {
//   self.skipWaiting(); // 🔥 new version activate fast
// });
// self.addEventListener("activate", (event) => {
//   event.waitUntil(self.clients.claim());
// });
// self.addEventListener("message", (event) => {
//   if (event.data.action === "skipWaiting") {
//     self.skipWaiting();
//   }
// });

const CACHE_NAME = "skycast-v7";

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
