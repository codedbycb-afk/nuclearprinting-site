/* Minimal service worker — makes the Studio installable to the home screen
   and lets it open offline (shell only; data always fetches live from Supabase). */
const CACHE = "nuclear-stories-v2";   // bump on every shell change or Joe keeps the old app
const SHELL = ["./index.html", "./app.js", "./editor.js", "./manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Never cache Supabase API/storage — always live.
  if (url.hostname.endsWith("supabase.co")) return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
