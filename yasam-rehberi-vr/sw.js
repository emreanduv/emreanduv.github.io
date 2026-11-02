// Yaşam Rehberi VR: çevrimdışı önbellek (gözlükte internetsiz açılsın)
const SURUM = 'yrvr-2';
const DOSYALAR = ['./', 'index.html', 'cami.js', 'manifest.webmanifest', 'simge-192.png', 'simge-512.png',
  'vendor/three.module.js', 'vendor/addons/webxr/XRControllerModelFactory.js', 'vendor/addons/loaders/GLTFLoader.js',
  'vendor/addons/libs/motion-controllers.module.js', 'vendor/addons/utils/BufferGeometryUtils.js',
  'fonts/dm-sans-latin-500-normal.woff2', 'fonts/dm-sans-latin-700-normal.woff2', 'fonts/dm-sans-latin-800-normal.woff2', 'fonts/dm-sans-latin-900-normal.woff2',
  'fonts/dm-sans-latin-ext-500-normal.woff2', 'fonts/dm-sans-latin-ext-700-normal.woff2', 'fonts/dm-sans-latin-ext-800-normal.woff2', 'fonts/dm-sans-latin-ext-900-normal.woff2',
  'fonts/barlow-condensed-latin-800-normal.woff2', 'fonts/barlow-condensed-latin-ext-800-normal.woff2', 'fonts/amiri-arabic-700-normal.woff2'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x)))).then(() => self.clients.claim())));
// Önce ağ (güncellemeler hemen gelsin), ağ yoksa önbellek
self.addEventListener('fetch', (e) => {
  if(e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { if(r.ok){ const k = r.clone(); caches.open(SURUM).then(c => c.put(e.request, k)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch:true })));
});
