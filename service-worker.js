const CACHE_NAME = "skycast-v17"; 

self.addEventListener("install", (event) => {
  self.skipWaiting(); //  auto activate new version
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim()); //  old clients ko control le lo
});
