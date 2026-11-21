// Tulpar çevrimdışı önbelleği: bir kez internetle açıldıktan sonra oyun uçakta da oynanır.
const SURUM='tulpar-v3';
const DOSYALAR=['./','index.html','manifest.webmanifest','ikon-512.png','pano.js',
 'fonts/bungee-latin-400-normal.woff2','fonts/bungee-latin-ext-400-normal.woff2',
 'fonts/rubik-latin-500-normal.woff2','fonts/rubik-latin-800-normal.woff2','fonts/rubik-latin-ext-500-normal.woff2','fonts/rubik-latin-ext-800-normal.woff2',
 'fonts/pixelify-sans-latin-700-normal.woff2','fonts/pixelify-sans-latin-ext-700-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SURUM).then(c=>Promise.all(DOSYALAR.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==SURUM).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
// önce ağ (güncel sürüm), ağ yoksa önbellek
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const k=r.clone();caches.open(SURUM).then(c=>c.put(e.request,k));return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));});
