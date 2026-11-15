// Tamga Yolu: internetsiz oynamak için önbellek (uçak kipi)
const AD = 'tamga-yolu-v0-27';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(AD).then((c) => c.addAll(['./', './index.html', './icon.png']))); });
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== AD).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request).then((y) => { const k = y.clone(); caches.open(AD).then((c) => c.put(e.request, k)); return y; }).catch(() => caches.match('./index.html'))));
});
