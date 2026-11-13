// Offline-first service worker.
const CACHE = 'wb-quotes-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k !== CACHE && k.startsWith('wb-quotes')).map(k => caches.delete(k)));
  await self.clients.claim(); })()); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  e.respondWith((async () => {
    const cached = await caches.match(req); if (cached) return cached;
    try {
      const res = await fetch(req); const url = new URL(req.url);
      const ok = url.origin === location.origin || /jsdelivr\.net|huggingface\.co|hf\.co|cdn-lfs|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.host);
      if (ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy).catch(() => {})); }
      return res;
    } catch (err) { return (await caches.match('index.html')) || Response.error(); }
  })());
});
