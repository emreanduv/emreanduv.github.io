// Yaşam Rehberi VR — Ayasofya. WebXR (Quest, Vision Pro, Android XR) + masaüstü/telefon. Bir Mr. Anduv! yapımıdır.
// Model temsilîdir: ölçüler yaklaşık (kubbe çapı ~31 m, tepe ~55 m). Kur'an metni içermez.
import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

const $ = (s) => document.querySelector(s);
const RENK = { panel:'#efe8d4', panel2:'#e7dfc8', ink:'#1f2328', ink2:'#5e5645', band:'#1d4d36', head:'#2f3e4c', go:'#2e7d46', gold:'#c9a227', gold2:'#e9c766', bar:'#14171a' };

// ── ölçüler (metre). Apsis ve mihrap -z yönünde. ──
const R = 15.5;            // kubbe ve büyük kemer yarıçapı
const S = 24.5;            // kemer/pandantif başlangıç yüksekliği
const KT = S + R;          // kubbe tabanı (40 m)
const GAL = 12.5;          // galeri döşemesi
const DIS = 31;            // yan nef dış duvarı (x)
const APS_Z = -29.6, APS_R = 6.5, APS_H = 19;   // apsis
const BATI = 30;           // batı duvarı (z)
const KIBLE = 0.24;        // mihrabın yapı eksenine göre sapması (radyan, sağa): kıbleye dönük

// ── yardımcılar ──
function tuval(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function doku(c, tekrar){ const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if(tekrar){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...tekrar); } return t; }
function sar(ctx, metin, genislik){ const kel = String(metin).split(/\s+/), sat = []; let cur = '';
  for(const k of kel){ const t = cur ? cur + ' ' + k : k; if(ctx.measureText(t).width > genislik && cur){ sat.push(cur); cur = k; } else cur = t; } if(cur) sat.push(cur); return sat; }
function yuvarlak(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
const gurultu = (x, n, a, renk) => { x.save(); x.fillStyle = `rgb(${renk})`; for(let i = 0; i < n; i++){ x.globalAlpha = Math.random() * a; x.fillRect(Math.random() * x.canvas.width, Math.random() * x.canvas.height, 2, 2); } x.restore(); };

// sıva / mermer / altın mozaik / halı dokuları
function sivaDokusu(){ const [c, x] = tuval(512, 512); x.fillStyle = '#d9c9a4'; x.fillRect(0, 0, 512, 512); gurultu(x, 5000, .07, '90,70,40');
  for(let i = 0; i < 30; i++){ x.fillStyle = `rgba(150,120,80,${Math.random() * .05})`; x.beginPath(); x.arc(Math.random() * 512, Math.random() * 512, 20 + Math.random() * 60, 0, 7); x.fill(); } return c; }
function mermerDokusu(ton = '#ece6da', damar = '120,110,100'){ const [c, x] = tuval(512, 512); x.fillStyle = ton; x.fillRect(0, 0, 512, 512); gurultu(x, 3000, .05, damar);
  for(let i = 0; i < 18; i++){ x.strokeStyle = `rgba(${damar},${.08 + Math.random() * .12})`; x.lineWidth = .6 + Math.random() * 1.6; x.beginPath(); let px = Math.random() * 512, py = 0; x.moveTo(px, py);
    while(py < 512){ px += (Math.random() - .5) * 40; py += 20 + Math.random() * 30; x.lineTo(px, py); } x.stroke(); } return c; }
function yesilMermer(){ return mermerDokusu('#2f5a49', '20,40,30'); }
function mozaikDokusu(w = 1024, h = 512, koyu = false){ // 4 px'lik altın tesseralar (ImageData ile hızlı)
  const [c, x] = tuval(w, h), im = x.createImageData(w, h), d = im.data, T = koyu ? .72 : 1;
  for(let ty = 0; ty < h; ty += 4) for(let tx = 0; tx < w; tx += 4){
    const k = (.82 + Math.random() * .3) * T, r = 200 * k, g = 158 * k, b = 60 * k;
    for(let yy = ty; yy < ty + 4 && yy < h; yy++) for(let xx = tx; xx < tx + 4 && xx < w; xx++){
      const i = (yy * w + xx) * 4, ara = (yy - ty === 3 || xx - tx === 3);
      d[i] = ara ? r * .55 : r; d[i + 1] = ara ? g * .55 : g; d[i + 2] = ara ? b * .55 : b; d[i + 3] = 255; } }
  x.putImageData(im, 0, 0); return c; }
function kubbeDokusu(){ // ekvator → tepe: altın mozaik, 40 kaburga, tepede madalyon (yazısız süsleme)
  const [c, x] = tuval(2048, 1024); x.drawImage(mozaikDokusu(2048, 1024), 0, 0);
  for(let i = 0; i < 40; i++){ const u = i / 40 * 2048; const g = x.createLinearGradient(u - 14, 0, u + 14, 0); g.addColorStop(0, 'rgba(90,60,20,0)'); g.addColorStop(.5, 'rgba(90,60,20,.55)'); g.addColorStop(1, 'rgba(90,60,20,0)'); x.fillStyle = g; x.fillRect(u - 14, 0, 28, 1024); }
  // tepedeki madalyon (v = 0 tepe): koyu yeşil zemin + altın rozet
  x.fillStyle = '#1d4d36'; x.fillRect(0, 0, 2048, 150); x.fillStyle = '#c9a227'; x.fillRect(0, 150, 2048, 14);
  for(let i = 0; i < 80; i++){ x.fillStyle = i % 2 ? '#e9c766' : '#c9a227'; x.beginPath(); const u = i / 80 * 2048; x.moveTo(u, 0); x.lineTo(u + 12.8, 120); x.lineTo(u + 25.6, 0); x.fill(); }
  // pencere bandı (v ≈ 1 taban)
  x.fillStyle = '#7a5a20'; x.fillRect(0, 930, 2048, 94);
  return c; }
function haliDokusu(){ // turkuaz halı, saf çizgileri + küçük göbekler
  const [c, x] = tuval(512, 512); x.fillStyle = '#1e7f86'; x.fillRect(0, 0, 512, 512); gurultu(x, 4000, .08, '0,40,40');
  x.fillStyle = '#145e64'; x.fillRect(0, 0, 512, 40); x.fillStyle = '#c9a227'; x.fillRect(0, 40, 512, 4);
  for(let i = 0; i < 4; i++){ const cx = 64 + i * 128, cy = 280; x.strokeStyle = '#2aa3a9'; x.lineWidth = 6; x.beginPath(); x.moveTo(cx, cy - 150); x.lineTo(cx + 44, cy - 80); x.lineTo(cx + 44, cy + 160); x.lineTo(cx - 44, cy + 160); x.lineTo(cx - 44, cy - 80); x.closePath(); x.stroke();
    x.fillStyle = '#0f4f55'; x.beginPath(); x.arc(cx, cy, 16, 0, 7); x.fill(); }
  return c; }

// ── namaz vakitleri (Diyanet yöntemi; Yaşam Rehberi ile aynı hesap) ──
const AYASOFYA = { lat:41.0086, lon:28.9802 };
const VAKIT = [['imsak','İmsak'],['gunes','Güneş'],['ogle','Öğle'],['ikindi','İkindi'],['aksam','Akşam'],['yatsi','Yatsı']];
const DR = Math.PI / 180, sn = (d) => Math.sin(d * DR), cs = (d) => Math.cos(d * DR), tn = (d) => Math.tan(d * DR);
const fix = (a, b) => { a -= b * Math.floor(a / b); return a < 0 ? a + b : a; };
function julian(y, m, d){ if(m <= 2){ y -= 1; m += 12; } const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5; }
function gunes(jd){ const D = jd - 2451545, g = fix(357.529 + .98560028 * D, 360), q = fix(280.459 + .98564736 * D, 360), L = fix(q + 1.915 * sn(g) + .02 * sn(2 * g), 360), e = 23.439 - .00000036 * D;
  return { decl: Math.asin(sn(e) * sn(L)) / DR, eqt: q / 15 - fix(Math.atan2(cs(e) * sn(L), cs(L)) / DR / 15, 24) }; }
const TEMKIN = { imsak:0, gunes:-7, ogle:5, ikindi:4, aksam:7, yatsi:0 }, YUV = { imsak:0, gunes:0, ogle:0, ikindi:.6, aksam:.6, yatsi:.6 };
function vakitler(y, m, d, lat, lon){
  const jd0 = julian(y, m, d) - lon / 360, noon = (t) => fix(12 - gunes(jd0 + t / 24).eqt, 24);
  const aci = (a, t, ccw) => { const { decl } = gunes(jd0 + t / 24); const v = Math.acos(Math.max(-1, Math.min(1, (-sn(a) - sn(decl) * sn(lat)) / (cs(decl) * cs(lat))))) / DR / 15; return noon(t) + (ccw ? -v : v); };
  const asr = (t) => { const { decl } = gunes(jd0 + t / 24); return aci(-Math.atan(1 / (1 + tn(Math.abs(lat - decl)))) / DR, t, false); };
  let t = { imsak:5, gunes:6, ogle:12, ikindi:13, aksam:18, yatsi:18 };
  for(let i = 0; i < 2; i++) t = { imsak:aci(18, t.imsak, true), gunes:aci(.833, t.gunes, true), ogle:noon(t.ogle), ikindi:asr(t.ikindi), aksam:aci(.833, t.aksam, false), yatsi:aci(17, t.yatsi, false) };
  const o = {}; for(const k in t) o[k] = Math.round((t[k] + 3 - lon / 15) * 60 + TEMKIN[k] + YUV[k]); return o;
}
const trGun = (ms) => { const d = new Date(ms + 3 * 3600e3); return { y:d.getUTCFullYear(), m:d.getUTCMonth() + 1, d:d.getUTCDate() }; };
const gunBasi = (g) => Date.UTC(g.y, g.m - 1, g.d) - 3 * 3600e3;
const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function vakitDurum(now = Date.now()){
  const g = trGun(now), v = vakitler(g.y, g.m, g.d, AYASOFYA.lat, AYASOFYA.lon), b = gunBasi(g);
  let i = VAKIT.findIndex(([k]) => b + v[k] * 6e4 > now), ms, yarin = false;
  if(i < 0){ const y = trGun(now + 864e5); ms = gunBasi(y) + vakitler(y.y, y.m, y.d, AYASOFYA.lat, AYASOFYA.lon).imsak * 6e4; i = 0; yarin = true; } else ms = b + v[VAKIT[i][0]] * 6e4;
  // şu anki vakit dilimi (ışık için): 0 gece, 1 sabah, 2 öğle, 3 ikindi, 4 akşam
  const dk = (now - b) / 6e4; const dilim = dk < v.imsak ? 0 : dk < v.gunes ? 1 : dk < v.ogle ? 1 : dk < v.ikindi ? 2 : dk < v.aksam ? 3 : dk < v.yatsi ? 4 : 0;
  return { v, b, i, ms, yarin, dilim };
}

// ── hikâye noktaları (doğrulanmış, kısa) ──
const HIKAYE = [
  { id:'kubbe', p:[0, 0, 0], baslik:'Kubbe', alt:'537 · Justinianus', metin:'Ayasofya, Bizans İmparatoru Justinianus döneminde 532–537 yılları arasında, mimar Anthemios ve İsidoros tarafından yapıldı. Kubbe yaklaşık 31 metre çapındadır; tepesi yerden 55 metreyi aşar. İlk kubbe 558 depreminden sonra çöktü, 562\'de daha yüksek olarak yeniden yapıldı.', not:'Kubbenin tabanını çepeçevre 40 pencere sarar; kubbe ışığın üstünde süzülüyormuş gibi görünür.' },
  { id:'fetih', p:[0, 0, 24], baslik:'Fetih ve cami', alt:'29 Mayıs 1453 · Fatih', metin:'Fatih Sultan Mehmed İstanbul\'u fethettikten sonra Ayasofya camiye çevrildi. Burada kılınan ilk cuma namazı 1 Haziran 1453 tarihindedir. Apsise mihrap, yanına minber eklendi; dışarıya minareler yükseldi.', not:'Ayasofya, yaklaşık beş asır İstanbul\'un en büyük camisi oldu.' },
  { id:'mihrap', p:[1.2, 0, -31.5], baslik:'Mihrap', alt:'Kıbleye dönük', metin:'Yapının ekseni kıbleye tam olarak bakmaz. Bu yüzden mihrap apsisin ortasına değil, kıbleye dönecek şekilde hafifçe yana döndürülerek yerleştirildi. Halıdaki saf çizgileri de yapıya değil, kıbleye göre uzanır.', not:'Bu yüzden içeride saflar duvarlara göre çapraz görünür.' },
  { id:'minber', p:[6.5, 0, -27], baslik:'Minber', alt:'16. yüzyıl · III. Murad', metin:'Mermer minber, Sultan III. Murad döneminde yapıldı. Hutbe, basamaklarla çıkılan bu yüksek kürsüden okunur; üstündeki külah, minberin en tepesidir.', not:'Minberin hemen solundaki mihrap ile birlikte caminin kıble duvarını oluşturur.' },
  { id:'levha', p:[-12.5, 0, 12.5], baslik:'Hat levhaları', alt:'19. yüzyıl · Kazasker Mustafa İzzet Efendi', metin:'Sultan Abdülmecid döneminde (1847–1849 onarımı) yerleştirilen sekiz dev levhada Allah, Hz. Muhammed, dört halife ve Hz. Hasan ile Hz. Hüseyin\'in isimleri yazılıdır. Çapları yaklaşık 7,5 metredir; İslam dünyasının en büyük hat levhaları arasında sayılır.', not:'Hattat Kazasker Mustafa İzzet Efendi, aynı zamanda sarayın musiki ve hat hocalarındandır.' },
  { id:'sinan', p:[24, 0, -4], baslik:'Mimar Sinan', alt:'16. yüzyıl · güçlendirme', metin:'Mimar Sinan, 16. yüzyılda Ayasofya\'yı dıştan destek duvarlarıyla (payandalarla) güçlendirdi ve minarelerden ikisini yaptı. Sinan\'ın bu dev kubbeyi incelemesi, kendi camilerindeki kubbe arayışına da ilham verdi.', not:'Sinan, ustalık eserim dediği Selimiye\'nin kubbesini Ayasofya\'nınkiyle yarıştırmıştı.' },
  { id:'kup', p:[-11, 0, 22], baslik:'Bergama küpleri', alt:'16. yüzyıl · III. Murad', metin:'Girişin iki yanında duran dev mermer küpler, III. Murad döneminde Bergama\'dan getirildi. Bayramlarda ve kandillerde şerbet ya da su doldurularak cemaate ikram edildiği anlatılır.', not:'Her biri tek parça mermerden oyulmuştur.' },
  { id:'gunumuz', p:[-24, 0, -4], baslik:'Müze ve yeniden cami', alt:'1934 · 2020', metin:'Ayasofya 1934 yılında alınan kararla müzeye dönüştürüldü ve 1935\'te ziyarete açıldı. 2020 yılında yeniden cami olarak ibadete açıldı; ilk cuma namazı 24 Temmuz 2020\'de kılındı.', not:'Bugün namaz vakitleri dışında ziyaretçilere de açıktır.' },
];
const LEVHALAR = ['الله', 'محمد', 'أبو بكر', 'عمر', 'عثمان', 'علي', 'حسن', 'حسين'];
const ZIKIR = [['Sübhânallah', 33], ['Elhamdülillah', 33], ['Allâhu Ekber', 34], ['Lâ ilâhe illallah', 100], ['Estağfirullah', 100], ['Salavat', 100]];

// ── sahne ──
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor');
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#2a2418'); scene.fog = new THREE.Fog('#3a3020', 40, 120);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 200);
const rig = new THREE.Group(); rig.add(camera); scene.add(rig);
const BAS = new THREE.Vector3(0, 0, 21); rig.position.copy(BAS); camera.position.set(0, 1.6, 0);
const tiklanir = [];
const isiklar = {};
const M = {}; // malzemeler

function mal(){
  M.siva = new THREE.MeshStandardMaterial({ map:doku(sivaDokusu(), [6, 3]), roughness:.95, side:THREE.DoubleSide });
  M.mermer = new THREE.MeshStandardMaterial({ map:doku(mermerDokusu(), [2, 2]), roughness:.45 });
  M.mermerT = new THREE.MeshStandardMaterial({ map:doku(mermerDokusu('#d8cdb8', '100,80,60'), [8, 3]), roughness:.6, side:THREE.DoubleSide });
  M.yesil = new THREE.MeshStandardMaterial({ map:doku(yesilMermer(), [1, 3]), roughness:.3 });
  M.altin = new THREE.MeshStandardMaterial({ color:'#c9a227', metalness:.7, roughness:.35 });
  M.mozaik = new THREE.MeshStandardMaterial({ map:doku(mozaikDokusu(), [3, 2]), roughness:.5, metalness:.25, side:THREE.DoubleSide });
  M.kubbe = new THREE.MeshStandardMaterial({ map:doku(kubbeDokusu()), roughness:.5, metalness:.25, side:THREE.DoubleSide, emissive:'#3a2a08', emissiveIntensity:.35 });
  const hd = doku(haliDokusu(), [16, 18]); hd.center.set(.5, .5); hd.rotation = -KIBLE;
  M.hali = new THREE.MeshStandardMaterial({ map:hd, roughness:1 });
  M.pencere = new THREE.MeshBasicMaterial({ color:'#fff3d6' });
  M.koyu = new THREE.MeshStandardMaterial({ color:'#3a2a18', roughness:.8 });
  M.tas = new THREE.MeshStandardMaterial({ color:'#cdbf9f', roughness:.9 });
}

function pencereSekli(w, h){ const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0); return new THREE.ShapeGeometry(s, 12); }
function ekle(geo, mat, x = 0, y = 0, z = 0, ry = 0){ const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); return m; }

function kur(){
  mal();
  // ışıklar
  isiklar.hemi = new THREE.HemisphereLight('#fff1d6', '#4a3a24', 1.0); scene.add(isiklar.hemi);
  isiklar.gun = new THREE.DirectionalLight('#ffe6b8', 1.2); isiklar.gun.position.set(-20, 60, 10); scene.add(isiklar.gun);
  isiklar.kubbe = new THREE.PointLight('#ffe2a8', 600, 70, 1.4); isiklar.kubbe.position.set(0, 38, 0); scene.add(isiklar.kubbe);
  isiklar.avize = new THREE.PointLight('#ffc978', 120, 30, 1.6); isiklar.avize.position.set(0, 5, 0); scene.add(isiklar.avize);
  isiklar.apsis = new THREE.PointLight('#ffe7c0', 80, 22, 1.5); isiklar.apsis.position.set(0, 10, APS_Z - 2); scene.add(isiklar.apsis);

  // zemin (halı) — nef, apsis ve yan nefler
  const zemin = ekle(new THREE.PlaneGeometry(DIS * 2, BATI - (APS_Z - APS_R) + 2), M.hali, 0, 0, (BATI + APS_Z - APS_R) / 2);
  zemin.rotation.x = -Math.PI / 2; zemin.name = 'zemin'; tiklanir.push(zemin);

  // ana kubbe
  const kubbe = ekle(new THREE.SphereGeometry(R, 72, 28, 0, Math.PI * 2, 0, Math.PI / 2), M.kubbe, 0, KT, 0);
  // kubbe tabanı pencereleri (40) + korniş
  const pg = pencereSekli(1.1, 2.6);
  for(let i = 0; i < 40; i++){ const a = (i + .5) / 40 * Math.PI * 2, p = new THREE.Mesh(pg, M.pencere);
    p.position.set(Math.sin(a) * (R - .15), KT + .25, Math.cos(a) * (R - .15)); p.lookAt(0, KT + .25, 0); scene.add(p); }
  const kornis = ekle(new THREE.TorusGeometry(R, .45, 8, 96), M.tas, 0, KT, 0); kornis.rotation.x = Math.PI / 2;

  // pandantifler: yarıçapı R√2 olan kürenin kare içinde kalan, kubbe tabanının altındaki parçası
  pandantif();

  // büyük kemerler (dört yanda) — kemer bantları
  for(const [x, z, ry] of [[0, -R, 0], [0, R, 0], [R, 0, Math.PI / 2], [-R, 0, Math.PI / 2]]){
    const k = new THREE.Mesh(new THREE.TorusGeometry(R, .9, 8, 64, Math.PI), M.mozaik); k.position.set(x, S, z); k.rotation.y = ry; scene.add(k); }

  // doğu ve batı yarım kubbeleri + altındaki duvarlar
  for(const yon of [-1, 1]){
    const yk = new THREE.Mesh(new THREE.SphereGeometry(R, 56, 20, yon < 0 ? Math.PI : 0, Math.PI, 0, Math.PI / 2), M.mozaik);
    yk.position.set(0, S, yon * R); scene.add(yk);
    duvarYarim(yon);
  }
  apsis();

  // kuzey ve güney: alt revak, galeri, üst revak, kemer alınlığı
  for(const sx of [-1, 1]) yanCephe(sx);
  // payeler (dört köşe)
  for(const sx of [-1, 1]) for(const sz of [-1, 1]){ const p = ekle(new THREE.BoxGeometry(4, S, 4), M.mermerT, sx * (R + 1.6), S / 2, sz * (R + 1.6)); p.rotation.y = 0; }
  // yan nefler: dış duvarlar, galeri döşemesi, tavan
  for(const sx of [-1, 1]){
    const dd = ekle(new THREE.PlaneGeometry(BATI - (-R - 14), S), M.siva, sx * DIS, S / 2, (BATI + (-R - 14)) / 2, -sx * Math.PI / 2);
    const gd = ekle(new THREE.BoxGeometry(DIS - R, .5, BATI + R + 14), M.tas, sx * (R + DIS) / 2, GAL, (BATI - R - 14) / 2);
    const tv = ekle(new THREE.PlaneGeometry(DIS - R, BATI + R + 14), M.siva, sx * (R + DIS) / 2, S - .05, (BATI - R - 14) / 2); tv.rotation.x = Math.PI / 2;
    for(let i = 0; i < 9; i++){ const z = -R - 10 + i * 6.2; for(const y of [4, GAL + 4]){ const p = new THREE.Mesh(pencereSekli(1.6, 4), M.pencere); p.position.set(sx * (DIS - .05), y, z); p.rotation.y = -sx * Math.PI / 2; scene.add(p); } }
    // galeri korkuluğu
    const kk = ekle(new THREE.BoxGeometry(.25, 1.1, 2 * R), M.mermer, sx * (R + .3), GAL + .8, 0);
  }
  // batı duvarı ve imparator kapısı, yan nef uç duvarları
  const bd = ekle(new THREE.PlaneGeometry(DIS * 2, S), M.siva, 0, S / 2, BATI, Math.PI);
  const kapi = ekle(new THREE.PlaneGeometry(4, 7.5), new THREE.MeshStandardMaterial({ color:'#4a2d16', roughness:.6 }), 0, 3.75, BATI - .06, Math.PI);
  const kapiCerceve = ekle(new THREE.BoxGeometry(5, 8.5, .3), M.mermer, 0, 4.25, BATI - .02); kapiCerceve.scale.z = .5;
  for(const sx of [-1, 1]){ const k2 = ekle(new THREE.PlaneGeometry(3, 6), new THREE.MeshStandardMaterial({ color:'#4a2d16', roughness:.6 }), sx * 9, 3, BATI - .06, Math.PI); }
  for(const sx of [-1, 1]){ const u = ekle(new THREE.PlaneGeometry(DIS - R, S), M.siva, sx * (R + DIS) / 2, S / 2, -R - 14); }

  // hat levhaları
  levhalar();
  // mihrap, minber, küpler, avize halkaları
  mihrap(); minber(); kupler(); avizeler();
  // giriş levhası
  const [mc, mx] = tuval(1024, 256); yuvarlak(mx, 6, 6, 1012, 244, 18); mx.fillStyle = RENK.band; mx.fill(); mx.strokeStyle = RENK.gold; mx.lineWidth = 6; mx.stroke();
  mx.fillStyle = RENK.gold2; mx.font = "900 70px 'DM Sans'"; mx.textAlign = 'center'; mx.fillText('Ayasofya', 512, 112); mx.fillStyle = '#cfe6d9'; mx.font = "italic 700 42px 'DM Sans'"; mx.fillText('Bir Mr. Anduv! yapımıdır.', 512, 190);
  ekle(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map:doku(mc), toneMapped:false }), 0, 9.2, BATI - .08, Math.PI);

  hikayeNoktalari();
  vakitLevhasi();
  tozlar();
  isikAyarla();
}

function pandantif(){
  const Rp = R * Math.SQRT2, n = 90, pos = [], idx = [], uv = [];
  const yH = (x, z) => S + Math.sqrt(Math.max(0, Rp * Rp - x * x - z * z));
  for(let i = 0; i <= n; i++) for(let j = 0; j <= n; j++){ const x = -R + 2 * R * i / n, z = -R + 2 * R * j / n; pos.push(x, Math.min(yH(x, z), KT + .3), z); uv.push(i / n * 3, j / n * 3); }
  for(let i = 0; i < n; i++) for(let j = 0; j < n; j++){
    const a = i * (n + 1) + j, b = a + n + 1, c = a + 1, d = b + 1;
    const ic = (k) => { const x = pos[k * 3], z = pos[k * 3 + 2]; return x * x + z * z < (R - .2) * (R - .2); };
    if(ic(a) && ic(b) && ic(c) && ic(d)) continue;
    idx.push(a, b, c, c, b, d);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  scene.add(new THREE.Mesh(g, M.mozaik));
}

function duvarYarim(yon){ // yarım kubbenin altındaki yarım silindir duvar; doğuda apsis için açıklık
  const merkez = yon * R, aB = Math.asin(APS_R / R);
  const parca = (t0, t1, y0, y1) => { const g = new THREE.CylinderGeometry(R, R, y1 - y0, 48, 1, true, t0, t1 - t0); const m = new THREE.Mesh(g, M.siva); m.position.set(0, (y0 + y1) / 2, merkez); scene.add(m); };
  if(yon < 0){ parca(Math.PI / 2, Math.PI - aB, 0, S); parca(Math.PI + aB, Math.PI * 1.5, 0, S); parca(Math.PI - aB, Math.PI + aB, APS_H + APS_R, S); }
  else parca(-Math.PI / 2, Math.PI / 2, 0, S);
  // köşe eksedraları hissi: yarım duvarda iki katlı sütunlu revak (pencere + sütun)
  for(const a of [Math.PI * .62, Math.PI * .78, Math.PI * 1.22, Math.PI * 1.38]){
    const aa = yon < 0 ? a : a - Math.PI, x = R * Math.sin(aa) * .985, z = merkez + R * Math.cos(aa) * .985;
    for(const y of [0]){ const s = new THREE.Mesh(new THREE.CylinderGeometry(.45, .5, 8.5, 14), M.yesil); s.position.set(x, y + 4.25, z); scene.add(s); }
    const p = new THREE.Mesh(pencereSekli(1.8, 4.2), M.pencere); p.position.set(R * Math.sin(aa) * .99, GAL + 7, merkez + R * Math.cos(aa) * .99); p.lookAt(0, GAL + 7, merkez); scene.add(p);
  }
}

function apsis(){
  const g = new THREE.CylinderGeometry(APS_R, APS_R, APS_H, 40, 1, true, Math.PI / 2, Math.PI);
  ekle(g, M.siva, 0, APS_H / 2, APS_Z);
  const yk = new THREE.Mesh(new THREE.SphereGeometry(APS_R, 40, 14, Math.PI, Math.PI, 0, Math.PI / 2), M.mozaik); yk.position.set(0, APS_H, APS_Z); scene.add(yk);
  const kemer = new THREE.Mesh(new THREE.TorusGeometry(APS_R, .5, 8, 40, Math.PI), M.mozaik); kemer.position.set(0, APS_H, APS_Z); scene.add(kemer);
  // apsis pencereleri: iki sıra
  for(const [y, n, w, h] of [[8, 5, 1.6, 4.2], [14, 3, 1.8, 3.6]]) for(let i = 0; i < n; i++){
    const a = Math.PI + (i - (n - 1) / 2) * (Math.PI * .7 / n), p = new THREE.Mesh(pencereSekli(w, h), M.pencere);
    p.position.set(Math.sin(a) * (APS_R - .08), y, APS_Z + Math.cos(a) * (APS_R - .08)); p.lookAt(0, y, APS_Z); scene.add(p); }
}

function yanCephe(sx){
  const x = sx * R;
  // alt revak: 4 yeşil mermer sütun + kemerler
  for(const z of [-9, -3, 3, 9]){ ekle(new THREE.CylinderGeometry(.6, .7, 9, 16), M.yesil, x, 4.5, z); ekle(new THREE.BoxGeometry(1.6, .7, 1.6), M.mermer, x, 9.3, z); }
  for(const [z0, z1] of [[-R, -9], [-9, -3], [-3, 3], [3, 9], [9, R]]){ const k = new THREE.Mesh(new THREE.TorusGeometry((z1 - z0) / 2, .35, 6, 24, Math.PI), M.mermer); k.position.set(x, 9.6, (z0 + z1) / 2); k.rotation.y = Math.PI / 2; scene.add(k); }
  ekle(new THREE.BoxGeometry(.6, GAL - 12.6 + 2.4, 2 * R), M.mermerT, x, (9.6 + 3 + GAL) / 2, 0);
  // üst revak: 6 sütun
  for(let i = 0; i < 6; i++){ const z = -12.5 + i * 5; ekle(new THREE.CylinderGeometry(.42, .48, 7, 14), M.yesil, x, GAL + 3.5, z); }
  ekle(new THREE.BoxGeometry(.6, 2, 2 * R), M.mermerT, x, GAL + 8, 0);
  // kemer alınlığı (tympanum): kemer eğrisine kadar duvar + iki sıra pencere
  const sh = new THREE.Shape(); sh.moveTo(-R, GAL + 9); sh.lineTo(R, GAL + 9); sh.lineTo(R, S);
  for(let i = 0; i <= 48; i++){ const t = i / 48 * Math.PI; sh.lineTo(R * Math.cos(t), S + R * Math.sin(t)); } sh.lineTo(-R, GAL + 9);
  const tg = new THREE.ShapeGeometry(sh, 24); const t = new THREE.Mesh(tg, M.siva); t.position.x = x; t.rotation.y = Math.PI / 2; scene.add(t);
  for(let i = 0; i < 7; i++){ const p = new THREE.Mesh(pencereSekli(1.7, 4.4), M.pencere); p.position.set(x - sx * .06, GAL + 11, -10.5 + i * 3.5); p.rotation.y = -sx * Math.PI / 2; scene.add(p); }
  for(let i = 0; i < 5; i++){ const p = new THREE.Mesh(pencereSekli(1.5, 3.4), M.pencere); p.position.set(x - sx * .06, S + 6, -7 + i * 3.5); p.rotation.y = -sx * Math.PI / 2; scene.add(p); }
}

function levhaDokusu(isim){
  const [c, x] = tuval(1024, 1024);
  x.fillStyle = '#c9a227'; x.beginPath(); x.arc(512, 512, 510, 0, 7); x.fill();
  x.fillStyle = '#123a2a'; x.beginPath(); x.arc(512, 512, 470, 0, 7); x.fill();
  x.strokeStyle = '#e9c766'; x.lineWidth = 6; x.beginPath(); x.arc(512, 512, 450, 0, 7); x.stroke();
  x.fillStyle = '#e9c766'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'rtl';
  let boy = isim.length > 4 ? 300 : 420; x.font = `700 ${boy}px Amiri`; while(x.measureText(isim).width > 760 && boy > 120){ boy -= 20; x.font = `700 ${boy}px Amiri`; }
  x.shadowColor = '#00000088'; x.shadowBlur = 12; x.fillText(isim, 512, 540);
  return c;
}
function levhalar(){
  const yerler = [
    // doğu: apsisin iki yanında (Allah, Muhammed)
    [-9.5, 17, -R - 6.5, .55], [9.5, 17, -R - 6.5, -.55],
    // dört paye (halifeler)
    [-R + .2, 17, -R + 2.6, Math.PI / 4], [R - .2, 17, -R + 2.6, -Math.PI / 4], [-R + .2, 17, R - 2.6, Math.PI * .75], [R - .2, 17, R - 2.6, -Math.PI * .75],
    // batı: girişin iki yanında (Hasan, Hüseyin)
    [-9.5, 17, R + 6.5, Math.PI - .55], [9.5, 17, R + 6.5, Math.PI + .55],
  ];
  yerler.forEach(([x, y, z, ry], i) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(3.75, 64), (() => { const t = doku(levhaDokusu(LEVHALAR[i])); return new THREE.MeshStandardMaterial({ map:t, roughness:.6, metalness:0, emissive:'#ffffff', emissiveMap:t, emissiveIntensity:.55 }); })());
    m.position.set(x, y, z); m.rotation.y = ry; scene.add(m);
  });
}

function mihrap(){
  const g = new THREE.Group(); g.position.set(0, 0, APS_Z - APS_R + .9); g.rotation.y = -KIBLE; scene.add(g);
  const cerceve = new THREE.Mesh(new THREE.BoxGeometry(3.6, 7.2, .7), M.mermer); cerceve.position.y = 3.6; g.add(cerceve);
  // niş: sivri kemerli, içi altın
  const sh = new THREE.Shape(); sh.moveTo(-1.1, 0); sh.lineTo(1.1, 0); sh.lineTo(1.1, 3.6); sh.quadraticCurveTo(1.1, 5.4, 0, 6.1); sh.quadraticCurveTo(-1.1, 5.4, -1.1, 3.6); sh.lineTo(-1.1, 0);
  const nis = new THREE.Mesh(new THREE.ShapeGeometry(sh, 16), new THREE.MeshStandardMaterial({ map:doku(mozaikDokusu(256, 512, true)), roughness:.5, metalness:.3 })); nis.position.set(0, .2, .36); g.add(nis);
  // mukarnas kuşağı hissi
  for(let i = 0; i < 7; i++){ const k = new THREE.Mesh(new THREE.ConeGeometry(.16, .4, 6), M.altin); k.position.set(-.9 + i * .3, 5.2 + Math.sin(i / 6 * Math.PI) * .6, .45); k.rotation.x = Math.PI; g.add(k); }
  const ust = new THREE.Mesh(new THREE.BoxGeometry(4, .35, .9), M.altin); ust.position.y = 7.3; g.add(ust);
  // iki yanda büyük şamdanlar
  for(const sx of [-1, 1]){ const s = new THREE.Mesh(new THREE.CylinderGeometry(.12, .3, 2.6, 12), M.altin); s.position.set(sx * 2.4, 1.3, .6); g.add(s);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .9, 10), new THREE.MeshStandardMaterial({ color:'#fff6e0', emissive:'#ffd890', emissiveIntensity:.6 })); m.position.set(sx * 2.4, 3, .6); g.add(m); }
}

function minber(){
  const g = new THREE.Group(); g.position.set(5.2, 0, APS_Z + 1.8); g.rotation.y = -KIBLE + Math.PI / 2; scene.add(g);
  // yan profil: merdiven üçgeni (uzunluk 6, yükseklik 4.4), genişlik 1.3
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(6, 0); sh.lineTo(6, 4.4); sh.lineTo(5, 4.4); sh.lineTo(0, 1.2); sh.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth:1.3, bevelEnabled:false }); geo.translate(-3, 0, -.65);
  g.add(new THREE.Mesh(geo, M.mermer));
  // köşk + külah
  for(const [x, z] of [[2.1, -.6], [2.9, -.6], [2.1, .6], [2.9, .6]]){ const s = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 2.4, 8), M.mermer); s.position.set(x, 5.6, z); g.add(s); }
  const kulah = new THREE.Mesh(new THREE.ConeGeometry(.75, 2.6, 8), M.altin); kulah.position.set(2.5, 8.1, 0); kulah.rotation.y = Math.PI / 8; g.add(kulah);
  const alem = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), M.altin); alem.position.set(2.5, 9.5, 0); g.add(alem);
  // giriş kapısı
  const kapi = new THREE.Mesh(new THREE.BoxGeometry(.4, 2.8, 1.5), M.mermer); kapi.position.set(-3.1, 1.4, 0); g.add(kapi);
}

function kupler(){
  const pts = []; for(let i = 0; i <= 20; i++){ const t = i / 20; pts.push(new THREE.Vector2(.25 + Math.sin(t * Math.PI) * .95 + (t > .9 ? .1 : 0), t * 2.4)); }
  const geo = new THREE.LatheGeometry(pts, 32);
  for(const sx of [-1, 1]){ ekle(geo, M.mermer, sx * 11, 0, BATI - 8); ekle(new THREE.CylinderGeometry(1.1, 1.2, .3, 24), M.mermer, sx * 11, .15, BATI - 8); }
}

let lambalar;
function avizeler(){
  // Ayasofya'nın alçak asılı büyük kandil halkası + yan neflerde küçük halkalar
  const halka = (x, z, r, y, n) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(r, .06, 6, 96), M.altin); t.position.set(x, y, z); t.rotation.x = Math.PI / 2; scene.add(t);
    const t2 = new THREE.Mesh(new THREE.TorusGeometry(r * .985, .03, 6, 96), M.altin); t2.position.set(x, y + .35, z); t2.rotation.x = Math.PI / 2; scene.add(t2);
    const kablolar = []; for(let i = 0; i < 8; i++){ const a = i / 8 * Math.PI * 2; kablolar.push(x + Math.cos(a) * r, y, z + Math.sin(a) * r, x + Math.cos(a) * r * .2, KT - 2, z + Math.sin(a) * r * .2); }
    const kg = new THREE.BufferGeometry(); kg.setAttribute('position', new THREE.Float32BufferAttribute(kablolar, 3));
    scene.add(new THREE.LineSegments(kg, new THREE.LineBasicMaterial({ color:'#3a2a18', transparent:true, opacity:.6 })));
    return Array.from({ length:n }, (_, i) => { const a = i / n * Math.PI * 2; return [x + Math.cos(a) * r, y + .08, z + Math.sin(a) * r]; });
  };
  const noktalar = [...halka(0, 0, 9.5, 5.2, 96), ...halka(-23, -8, 3.2, 4.6, 24), ...halka(23, -8, 3.2, 4.6, 24), ...halka(-23, 10, 3.2, 4.6, 24), ...halka(23, 10, 3.2, 4.6, 24)];
  lambalar = new THREE.InstancedMesh(new THREE.SphereGeometry(.075, 8, 6), new THREE.MeshBasicMaterial({ color:'#ffd98a' }), noktalar.length);
  const m = new THREE.Matrix4(); noktalar.forEach((p, i) => { m.makeTranslation(...p); lambalar.setMatrixAt(i, m); }); scene.add(lambalar);
}

let tozP;
function tozlar(){ // pencerelerden süzülen ışıkta toz
  const n = 900, pos = new Float32Array(n * 3); for(let i = 0; i < n; i++){ const a = Math.random() * Math.PI * 2, r = Math.random() * R; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.random() * KT; pos[i * 3 + 2] = Math.sin(a) * r; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const [pc, px] = tuval(32, 32); const g = px.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); px.fillStyle = g; px.fillRect(0, 0, 32, 32);
  tozP = new THREE.Points(geo, new THREE.PointsMaterial({ map:doku(pc), color:'#ffe9b8', size:.06, transparent:true, opacity:.45, depthWrite:false, blending:THREE.AdditiveBlending })); scene.add(tozP);
  // kubbe pencerelerinden inen ışık huzmeleri
  const [hc, hx] = tuval(64, 256); const hg = hx.createLinearGradient(0, 0, 0, 256); hg.addColorStop(0, 'rgba(255,236,190,.5)'); hg.addColorStop(1, 'rgba(255,236,190,0)'); hx.fillStyle = hg; hx.fillRect(0, 0, 64, 256);
  const hm = new THREE.MeshBasicMaterial({ map:doku(hc), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, opacity:.16 });
  isiklar.huzme = hm;
  for(let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2 + .2, h = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 34), hm);
    h.position.set(Math.sin(a) * 8, KT - 16, Math.cos(a) * 8); h.lookAt(0, KT - 16, 0); h.rotateX(-.42); scene.add(h); }
}

// ── zamana göre ışık: vakit dilimine göre renk ve parlaklık ──
function isikAyarla(){
  const d = vakitDurum().dilim;
  const P = [ // gece, sabah, öğle, ikindi, akşam
    { hemi:.35, gun:0, kubbe:120, avize:220, pencere:'#2a3550', huzme:0, renk:'#ffd9a0', exp:.95 },
    { hemi:.8, gun:.7, kubbe:420, avize:120, pencere:'#ffe6c8', huzme:.12, renk:'#ffd9b0', exp:1.05 },
    { hemi:1.1, gun:1.3, kubbe:650, avize:60, pencere:'#fff6e0', huzme:.18, renk:'#fff1d8', exp:1.1 },
    { hemi:1.0, gun:1.1, kubbe:560, avize:80, pencere:'#ffe9c0', huzme:.16, renk:'#ffe2b0', exp:1.08 },
    { hemi:.6, gun:.4, kubbe:260, avize:180, pencere:'#f0a868', huzme:.08, renk:'#ffc890', exp:1.0 },
  ][d];
  isiklar.hemi.intensity = P.hemi; isiklar.gun.intensity = P.gun; isiklar.kubbe.intensity = P.kubbe; isiklar.avize.intensity = P.avize;
  isiklar.gun.color.set(P.renk); M.pencere.color.set(P.pencere); if(isiklar.huzme) isiklar.huzme.opacity = P.huzme; renderer.toneMappingExposure = P.exp;
  if(lambalar) lambalar.material.color.set(d === 0 || d === 4 ? '#ffe2a0' : '#d8b878');
}

// ── FM2010 kartları (canvas) ──
function kartCiz(x, Wc, Hc, baslik, sag, govde){
  x.clearRect(0, 0, Wc, Hc); yuvarlak(x, 4, 4, Wc - 8, Hc - 8, 14); x.fillStyle = RENK.panel; x.fill();
  x.save(); yuvarlak(x, 4, 4, Wc - 8, Hc - 8, 14); x.clip(); x.fillStyle = RENK.head; x.fillRect(0, 0, Wc, 92); x.fillStyle = RENK.gold; x.fillRect(0, 92, Wc, 6); x.restore();
  x.strokeStyle = '#c8bc9a'; x.lineWidth = 4; yuvarlak(x, 4, 4, Wc - 8, Hc - 8, 14); x.stroke();
  x.fillStyle = '#fff'; x.font = "800 42px 'DM Sans'"; x.fillText(baslik.toLocaleUpperCase('tr'), 36, 62);
  if(sag){ x.textAlign = 'right'; x.fillStyle = '#c4cbd1'; x.font = "700 34px 'DM Sans'"; x.fillText(sag, Wc - 36, 60); x.textAlign = 'left'; }
  govde(x);
}

// vakit levhası (girişte ayakta pano) + sol el mini levha
const [vlC, vlX] = tuval(1024, 1024); let vlT;
const [elC, elX] = tuval(768, 384); let elT;
function vakitLevhasi(){
  vlT = doku(vlC); elT = doku(elC);
  const g = new THREE.Group(); g.position.set(-5.5, 0, 16.5); g.rotation.y = .5; scene.add(g);
  const ayak = new THREE.Mesh(new THREE.CylinderGeometry(.05, .2, 1.3, 10), M.altin); ayak.position.y = .65; g.add(ayak);
  const pano = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map:vlT, transparent:true, toneMapped:false })); pano.position.y = 2.1; g.add(pano);
  vakitCiz();
}
function vakitCiz(){
  const d = vakitDurum(), now = Date.now(), s = Math.max(0, Math.floor((d.ms - now) / 1000));
  const sayac = `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const dkAn = Math.round((d.ms - gunBasi(trGun(d.ms))) / 6e4);
  kartCiz(vlX, 1024, 1024, 'Vakitler', 'Ayasofya', (x) => {
    x.fillStyle = RENK.go; x.fillRect(4, 98, 1016, 64); x.fillStyle = '#fff'; x.font = "800 34px 'DM Sans'"; x.fillText(`SIRADAKİ VAKİT${d.yarin ? ' · YARIN' : ''}`, 36, 142);
    x.fillStyle = RENK.ink; x.font = "800 96px 'Barlow Condensed'"; x.fillText(VAKIT[d.i][1], 36, 262); x.fillStyle = RENK.ink2; x.font = "500 40px 'DM Sans'"; x.fillText(`${hhmm(dkAn)}'de`, 40, 314);
    x.textAlign = 'right'; x.fillStyle = RENK.ink2; x.font = "800 30px 'DM Sans'"; x.fillText('KALAN', 988, 190); x.fillStyle = RENK.ink; x.font = "800 120px 'Barlow Condensed'"; x.fillText(sayac, 988, 300); x.textAlign = 'left';
    VAKIT.forEach(([k, ad], i) => { const y = 360 + i * 98, t = d.b + d.v[k] * 6e4, on = !d.yarin && i === d.i, gecti = t <= now;
      x.fillStyle = on ? '#e9c766' : i % 2 ? RENK.panel2 : RENK.panel; x.fillRect(8, y, 1008, 98);
      x.fillStyle = gecti && !on ? '#8a8270' : RENK.ink; x.font = `${on ? 800 : 500} 54px 'DM Sans'`; x.fillText(ad, 40, y + 66);
      x.textAlign = 'right'; x.font = `${on || !gecti ? 800 : 500} 58px 'Barlow Condensed'`; x.fillText(hhmm(d.v[k]), 984, y + 68); x.textAlign = 'left'; });
    x.fillStyle = '#9a7a14'; x.font = "italic 700 30px 'DM Sans'"; x.textAlign = 'center'; x.fillText('Bir Mr. Anduv! yapımıdır.', 512, 1000); x.textAlign = 'left';
  });
  vlT.needsUpdate = true;
  // sol el: tesbih + sıradaki vakit
  const [ad, hedef] = ZIKIR[tes.z];
  kartCiz(elX, 768, 384, 'Tesbih', `${VAKIT[d.i][1]} ${sayac}`, (x) => {
    x.fillStyle = RENK.band; x.font = "800 54px 'DM Sans'"; x.fillText(ad, 36, 178);
    x.fillStyle = RENK.ink; x.font = "800 150px 'Barlow Condensed'"; x.fillText(String(tes.n), 36, 330);
    x.fillStyle = RENK.ink2; x.font = "700 52px 'DM Sans'"; x.fillText(`/ ${hedef}`, 36 + x.measureText(String(tes.n)).width * 1.9 + 30, 320);
    x.textAlign = 'right'; x.fillStyle = '#7d7461'; x.font = "700 28px 'DM Sans'"; x.fillText('tetik: say · kavra: zikir', 732, 340); x.textAlign = 'left';
  });
  elT.needsUpdate = true;
  $('#say').textContent = `📿 ${tes.n}/${hedef}`; $('#zikir').textContent = ad;
}

// ── tesbih ──
const tes = (() => { try { return Object.assign({ z:0, n:0 }, JSON.parse(localStorage.getItem('yrvr-tesbih') || '{}')); } catch { return { z:0, n:0 }; } })();
const kaydet = () => { try { localStorage.setItem('yrvr-tesbih', JSON.stringify(tes)); } catch {} };
let ses = null;
function tik(guclu){
  try {
    if(!ses){ ses = new AudioContext(); const L = ses.sampleRate * 2.6, b = ses.createBuffer(2, L, ses.sampleRate); for(let c = 0; c < 2; c++){ const d = b.getChannelData(c); for(let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 3.2); }
      ses.yanki = ses.createConvolver(); ses.yanki.buffer = b; const yg = ses.createGain(); yg.gain.value = .5; ses.yanki.connect(yg).connect(ses.destination); }
    const o = ses.createOscillator(), g = ses.createGain(); o.type = 'triangle'; o.frequency.value = guclu ? 660 : 1700;
    g.gain.setValueAtTime(guclu ? .22 : .12, ses.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ses.currentTime + (guclu ? .5 : .06));
    o.connect(g); g.connect(ses.destination); g.connect(ses.yanki); o.start(); o.stop(ses.currentTime + .6);
  } catch {}
}
function titres(src, guclu){ try { const h = src && src.gamepad && src.gamepad.hapticActuators && src.gamepad.hapticActuators[0]; if(h) h.pulse(guclu ? .9 : .35, guclu ? 180 : 28); } catch {} }
function say(src){
  const hedef = ZIKIR[tes.z][1];
  if(tes.n >= hedef) tes.n = 0; tes.n++;
  const tamam = tes.n === hedef; tik(tamam); titres(src, tamam); kaydet(); vakitCiz(); taneGuncelle();
}
function zikirDegis(){ tes.z = (tes.z + 1) % ZIKIR.length; tes.n = 0; kaydet(); vakitCiz(); taneGuncelle(); }

// tesbih modeli (sol elde): 33 tane + imame
let taneler = [];
function tesbihModeli(){
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color:'#7a3a1a', roughness:.35 }), on = new THREE.MeshStandardMaterial({ color:'#e9c766', roughness:.3, emissive:'#5a4000' });
  for(let i = 0; i < 33; i++){ const a = i / 33 * Math.PI * 2, t = new THREE.Mesh(new THREE.SphereGeometry(.0105, 10, 8), mat); t.position.set(Math.cos(a) * .065, Math.sin(a) * .065 - .09, 0); t.userData.on = on; t.userData.mat = mat; g.add(t); taneler.push(t); }
  const imame = new THREE.Mesh(new THREE.CylinderGeometry(.006, .012, .05, 10), mat); imame.position.set(0, -.18, 0); g.add(imame);
  const pano = new THREE.Mesh(new THREE.PlaneGeometry(.22, .11), new THREE.MeshBasicMaterial({ map:elT, transparent:true, toneMapped:false })); pano.position.set(0, .08, -.02); pano.rotation.x = -.5; g.add(pano);
  g.rotation.x = -.6; return g;
}
function taneGuncelle(){ const k = (tes.n - 1 + 33) % 33; taneler.forEach((t, i) => { t.material = i === k ? t.userData.on : t.userData.mat; }); }

// ── hikâye noktaları ve kartı ──
const noktalar = []; let acikKart = null;
const [hkC, hkX] = tuval(1280, 900); let hkT, hkMesh;
function hikayeNoktalari(){
  const [ic, ix] = tuval(128, 128); const g = ix.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,240,180,1)'); g.addColorStop(.35, 'rgba(233,199,102,.9)'); g.addColorStop(1, 'rgba(233,199,102,0)'); ix.fillStyle = g; ix.fillRect(0, 0, 128, 128);
  ix.fillStyle = '#1d4d36'; ix.font = "900 56px 'DM Sans'"; ix.textAlign = 'center'; ix.textBaseline = 'middle'; ix.fillText('i', 64, 66);
  const im = new THREE.SpriteMaterial({ map:doku(ic), toneMapped:false, depthWrite:false });
  for(const h of HIKAYE){ const s = new THREE.Sprite(im); s.scale.set(.55, .55, 1); s.position.set(h.p[0], 1.45, h.p[2]); s.name = 'nokta'; s.userData.h = h; scene.add(s); tiklanir.push(s); noktalar.push(s);
    const halka = new THREE.Mesh(new THREE.RingGeometry(.35, .42, 40), new THREE.MeshBasicMaterial({ color:'#e9c766', transparent:true, opacity:.55, side:THREE.DoubleSide })); halka.rotation.x = -Math.PI / 2; halka.position.set(h.p[0], .02, h.p[2]); scene.add(halka); }
  hkT = doku(hkC); hkMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.125), new THREE.MeshBasicMaterial({ map:hkT, transparent:true, toneMapped:false, depthTest:false }));
  hkMesh.renderOrder = 10; hkMesh.visible = false; hkMesh.name = 'kart'; scene.add(hkMesh); tiklanir.push(hkMesh);
}
function kartAc(h){
  acikKart = h;
  if(!renderer.xr.isPresenting){ eul.set(pitch, yaw, 0); camera.quaternion.setFromEuler(eul); camera.updateMatrixWorld(true); }
  kartCiz(hkX, 1280, 900, h.baslik, h.alt, (x) => {
    x.fillStyle = RENK.ink; x.font = "500 44px 'DM Sans'"; let y = 180; for(const l of sar(x, h.metin, 1180).slice(0, 10)){ x.fillText(l, 50, y); y += 58; }
    x.fillStyle = RENK.go; x.fillRect(36, y + 4, 1208, 4); y += 60; x.fillStyle = RENK.band; x.font = "800 34px 'DM Sans'"; x.fillText('BİLİYOR MUYDUN?', 50, y); y += 50;
    x.fillStyle = RENK.ink2; x.font = "italic 500 38px 'DM Sans'"; for(const l of sar(x, h.not, 1180).slice(0, 3)){ x.fillText(l, 50, y); y += 50; }
    x.textAlign = 'right'; x.fillStyle = '#7d7461'; x.font = "700 30px 'DM Sans'"; x.fillText('kapatmak için karta dokun', 1230, 870); x.textAlign = 'left';
  });
  hkT.needsUpdate = true;
  // kartı bakış yönünde 1,6 m öne koy
  const kafa = new THREE.Vector3(), yon = new THREE.Vector3(); camera.getWorldPosition(kafa); camera.getWorldDirection(yon); yon.y = 0; yon.normalize();
  hkMesh.position.copy(kafa).addScaledVector(yon, 1.6); hkMesh.position.y = kafa.y - .1; hkMesh.lookAt(kafa.x, hkMesh.position.y, kafa.z); hkMesh.visible = true;
}
function kartKapat(){ acikKart = null; hkMesh.visible = false; }

// ── seçim: fare / dokunma / VR kumandası ──
const ray = new THREE.Raycaster(), fare = new THREE.Vector2();
function etkile(nesne, nokta, kaynak){
  if(acikKart){ kartKapat(); return; }
  if(!nesne) return;
  if(nesne.name === 'nokta'){ kartAc(nesne.userData.h); return; }
  if(nesne.name === 'zemin' && (kaynak === 'vr' || kaynak === 'cift')) yuru(nokta);
}
function yuru(n){
  // sınırlar: nef + apsis + yan nefler (payelerin içine girme)
  let x = THREE.MathUtils.clamp(n.x, -DIS + .8, DIS - .8), z = THREE.MathUtils.clamp(n.z, APS_Z - APS_R + 2.2, BATI - 1);
  if(z < -R && Math.abs(x) < R && Math.hypot(x, z + R) > R - 1 && Math.abs(x) > APS_R - 1) return; // yarım duvarın arkası
  for(const sx of [-1, 1]) for(const sz of [-1, 1]) if(Math.abs(x - sx * (R + 1.6)) < 2.6 && Math.abs(z - sz * (R + 1.6)) < 2.6) return; // paye
  const kafa = new THREE.Vector3(); camera.getWorldPosition(kafa);
  rig.position.x += x - kafa.x; rig.position.z += z - kafa.z;
}

// masaüstü/telefon: sürükleyerek bak, çift tıkla yürü
let suruk = null, yaw = 0, pitch = .12; const eul = new THREE.Euler(0, 0, 0, 'YXZ');
const el = renderer.domElement;
el.addEventListener('pointerdown', (e) => { suruk = { x:e.clientX, y:e.clientY, t:performance.now(), m:0 }; el.setPointerCapture(e.pointerId); });
el.addEventListener('pointermove', (e) => { if(!suruk || renderer.xr.isPresenting) return; const dx = e.clientX - suruk.x, dy = e.clientY - suruk.y; suruk.m += Math.abs(dx) + Math.abs(dy); suruk.x = e.clientX; suruk.y = e.clientY;
  yaw += dx * .004; pitch = THREE.MathUtils.clamp(pitch + dy * .004, -1.5, 1.5); });
el.addEventListener('pointerup', (e) => { if(suruk && suruk.m < 8 && performance.now() - suruk.t < 400) secFare(e, 'tik'); suruk = null; });
el.addEventListener('dblclick', (e) => secFare(e, 'cift'));
let sonDokun = 0; el.addEventListener('touchend', (e) => { const t = performance.now(); if(t - sonDokun < 320 && e.changedTouches[0]) secFare(e.changedTouches[0], 'cift'); sonDokun = t; });
el.addEventListener('wheel', (e) => { camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * .02, 30, 90); camera.updateProjectionMatrix(); }, { passive:true });
function secFare(e, tur){
  fare.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(fare, camera);
  const h = ray.intersectObjects(tiklanir.filter(o => o.visible), false)[0];
  if(tur === 'cift'){ if(h && h.object.name === 'zemin') yuru(h.point); return; }
  etkile(h && h.object, h && h.point, 'tik');
}
addEventListener('keydown', (e) => {
  const hiz = .6, ileri = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)), sag = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)), k = e.key.toLowerCase();
  const kafa = new THREE.Vector3(); camera.getWorldPosition(kafa);
  if(k === 'w' || e.key === 'ArrowUp') yuru(kafa.addScaledVector(ileri, hiz)); if(k === 's' || e.key === 'ArrowDown') yuru(kafa.addScaledVector(ileri, -hiz));
  if(k === 'a') yuru(kafa.addScaledVector(sag, -hiz)); if(k === 'd') yuru(kafa.addScaledVector(sag, hiz));
  if(e.key === ' '){ e.preventDefault(); say(null); } if(k === 'z') zikirDegis(); if(e.key === 'Escape') kartKapat();
});

// VR kumandaları: sağ el ışın/yürü/seç, sol el tesbih
const kumandalar = [], modelF = new XRControllerModelFactory(), tmp = new THREE.Matrix4();
const isinGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
let tesbihG = null;
for(let i = 0; i < 2; i++){
  const k = renderer.xr.getController(i); k.userData.el = null;
  const isin = new THREE.Line(isinGeo, new THREE.LineBasicMaterial({ color:'#e9c766', transparent:true, opacity:.85 })); isin.scale.z = 8; k.add(isin);
  k.addEventListener('connected', (e) => { k.userData.el = e.data.handedness; k.userData.src = e.data;
    if(e.data.handedness === 'left'){ isin.visible = false; if(!tesbihG){ tesbihG = tesbihModeli(); taneGuncelle(); } k.add(tesbihG); } else isin.visible = true; });
  k.addEventListener('disconnected', () => { if(tesbihG && tesbihG.parent === k) k.remove(tesbihG); });
  k.addEventListener('select', () => { if(k.userData.el === 'left'){ say(k.userData.src); return; } const h = kumandaIsin(k); etkile(h && h.object, h && h.point, 'vr'); });
  k.addEventListener('squeeze', () => { if(k.userData.el === 'left') zikirDegis(); else kartKapat(); });
  rig.add(k); kumandalar.push({ k, isin });
  const tut = renderer.xr.getControllerGrip(i); tut.add(modelF.createControllerModel(tut)); rig.add(tut);
}
function kumandaIsin(k){ tmp.identity().extractRotation(k.matrixWorld); ray.ray.origin.setFromMatrixPosition(k.matrixWorld); ray.ray.direction.set(0, 0, -1).applyMatrix4(tmp); return ray.intersectObjects(tiklanir.filter(o => o.visible), false)[0]; }
let donusKilit = false;
function cubuk(){
  const s = renderer.xr.getSession(); if(!s) return;
  for(const src of s.inputSources){ const ax = src.gamepad && src.gamepad.axes; if(!ax || ax.length < 4 || src.handedness === 'left') continue;
    const x = ax[2]; if(Math.abs(x) > .7 && !donusKilit){ donusKilit = true; const kafa = new THREE.Vector3(); camera.getWorldPosition(kafa); const a = -Math.sign(x) * Math.PI / 6;
      rig.position.sub(kafa).applyAxisAngle(new THREE.Vector3(0, 1, 0), a).add(kafa); rig.rotation.y += a; } else if(Math.abs(x) < .3) donusKilit = false; }
}

// ── döngü ──
const saat = new THREE.Clock(); let sonVakit = 0, sonIsik = 0;
renderer.setAnimationLoop(() => {
  const t = saat.getElapsedTime();
  if(!renderer.xr.isPresenting){ eul.set(pitch, yaw, 0); camera.quaternion.setFromEuler(eul); }
  else { cubuk(); for(const { k, isin } of kumandalar){ if(!isin.visible) continue; const h = kumandaIsin(k); isin.scale.z = h ? h.distance : 8; isin.material.color.set(h && h.object.name !== 'zemin' ? '#ffffff' : '#e9c766'); } }
  noktalar.forEach((s, i) => { s.position.y = 1.45 + Math.sin(t * 1.6 + i) * .05; });
  if(tozP){ tozP.rotation.y = t * .008; }
  const now = performance.now(); if(now - sonVakit > 1000){ sonVakit = now; vakitCiz(); } if(now - sonIsik > 60000){ sonIsik = now; isikAyarla(); }
  renderer.render(scene, camera);
});
function boyut(){ camera.aspect = innerWidth / innerHeight; camera.fov = camera.aspect < 1 ? 88 : 70; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
addEventListener('resize', boyut); boyut();

// mağaza görselleri için kamera kancası (?cekim=1)
if(new URLSearchParams(location.search).has('cekim')) window.__cami = { bak:(y, p) => { yaw = y; pitch = p; }, git:(x, z) => { rig.position.set(x, 0, z); }, fov:(f) => { camera.fov = f; camera.updateProjectionMatrix(); }, kart:(i) => kartAc(HIKAYE[i]), kapat:kartKapat, dilim:(d) => { const o = vakitDurum; window.__d = d; } };

// ── VR düğmesi ──
const VR_OZ = { optionalFeatures:['local-floor', 'bounded-floor', 'hand-tracking', 'layers'] };
async function vrHazirla(){
  const b = $('#vr');
  if(!navigator.xr){ b.textContent = 'VR yok'; b.title = 'Bu tarayıcı WebXR desteklemiyor. VR gözlüğün tarayıcısıyla aç.'; return; }
  let ok = false; try { ok = await navigator.xr.isSessionSupported('immersive-vr'); } catch {}
  if(!ok){ b.textContent = 'VR yok'; b.title = 'VR gözlük bulunamadı. Gözlüğün tarayıcısında bu sayfayı aç.'; return; }
  b.disabled = false; b.textContent = "VR'a gir"; let oturum = null;
  b.onclick = async () => {
    if(oturum){ oturum.end(); return; }
    oturum = await navigator.xr.requestSession('immersive-vr', VR_OZ); renderer.xr.setFoveation(1); await renderer.xr.setSession(oturum);
    camera.position.set(0, 0, 0); b.textContent = 'Çık';
    oturum.addEventListener('end', () => { oturum = null; b.textContent = "VR'a gir"; camera.position.set(0, 1.6, 0); });
  };
}

// ── başlat ──
(async () => {
  try {
    await Promise.all(["900 50px 'DM Sans'", "500 30px 'DM Sans'", "700 30px 'DM Sans'", "800 30px 'DM Sans'", "800 30px 'Barlow Condensed'", "700 60px Amiri"].map(f => document.fonts.load(f))).catch(() => {});
    // erken istenen VR oturumu (Quest uygulaması) varsa ona bağlan
    const erken = window.__erkenXR ? await window.__erkenXR : null;
    if(erken){ renderer.xr.setFoveation(1); await renderer.xr.setSession(erken); camera.position.set(0, 0, 0); erken.addEventListener('end', () => camera.position.set(0, 1.6, 0)); }
    kur(); vakitCiz(); vrHazirla();
    $('#say').onclick = () => say(null); $('#zikir').onclick = zikirDegis;
    $('#kubbe').onclick = () => { if(!renderer.xr.isPresenting){ pitch = 1.2; } };
    $('#basla').innerHTML = 'İçeri gir'; $('#basla').onclick = () => { $('#giris').remove(); setTimeout(() => $('#ipucu') && $('#ipucu').remove(), 10000); };
    // Quest uygulamasıyken oturum açılamadıysa: giriş düğmesi doğrudan VR'a soksun
    if(window.__pwa && !erken && navigator.xr){
      $('#basla').innerHTML = "🥽 VR'a gir";
      $('#basla').onclick = async () => { try { const s = await navigator.xr.requestSession('immersive-vr', VR_OZ); renderer.xr.setFoveation(1); await renderer.xr.setSession(s); camera.position.set(0, 0, 0); $('#giris').remove(); s.addEventListener('end', () => camera.position.set(0, 1.6, 0)); } catch(e){ $('#yuk') && ($('#yuk').textContent = 'VR açılamadı'); } };
    } else if(erken) $('#giris').remove();
  } catch(e){ console.error(e); window.__hataGoster ? __hataGoster((e && e.message) || e) : ($('#yuk').innerHTML = '<span class="hata">Açılamadı. Sayfayı yenile.</span>'); }
})();

if('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
