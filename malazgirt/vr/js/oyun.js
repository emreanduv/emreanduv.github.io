/* Malazgirt Akıncıları — çizim, ses, ekranlar ve kayıt. Oyun kuralları js/mantik.js içinde. */
(function () {
'use strict';
const M = window.MANTIK;
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* Champion Battle Manager maç modu: ?mac=1 ile lig maçı olarak açılır, sonucu ana oyuna yollar (tek başına oyunda etkisiz) */
const MQ = new URLSearchParams(location.search);
const MAC = MQ.get('mac') === '1' ? { lv: Math.max(0, Math.min(M.NL - 1, +MQ.get('lv') || 0)), up: Math.max(0, Math.min(10, +MQ.get('up') || 0)), ud: MQ.has('ud') ? +MQ.get('ud') || 0 : null, ben: MQ.get('ben') || 'Takımın', bk: MQ.get('bk') || 'EV', b1: MQ.get('b1') || '#1fa3a8', b2: MQ.get('b2') || '#f0b232',
  rakip: MQ.get('rakip') || 'Rakip', rk: MQ.get('rk') || 'DEP', r1: MQ.get('r1') || '#8e1f2a', r2: MQ.get('r2') || '#e7c56a', lig: MQ.get('lig') || 'Lig', hafta: MQ.get('hafta') || '', saha: MQ.get('saha') || 'ic', ses: MQ.get('ses') !== '0' } : null;
const hx = (c, d) => { const n = parseInt(String(c || '').replace('#', ''), 16); return isNaN(n) ? d : n; };
const dk = (n, f) => (Math.round((n >> 16 & 255) * f) << 16) | (Math.round((n >> 8 & 255) * f) << 8) | Math.round((n & 255) * f);
const ARMY1 = MAC ? hx(MAC.b1, 0x1aa3a8) : 0x1aa3a8, ARMY1D = MAC ? dk(ARMY1, .72) : 0x15727b, ARMY2 = MAC ? hx(MAC.b2, 0xe3a92b) : 0xe3a92b;
const FOE1 = MAC ? hx(MAC.r1, 0xb8323a) : 0xb8323a, FOE2 = MAC ? hx(MAC.r2, 0x9b1f27) : 0x9b1f27;
const macScore = (win, stars, prog) => win ? (stars >= 3 ? [3, 0] : stars === 2 ? [2, 1] : [1, 0]) : (prog >= .8 ? [1, 1] : prog >= .5 ? [1, 2] : [0, 3]);
function macPost(d) { try { (window.parent && window.parent !== window ? window.parent : window).postMessage(Object.assign({ ccm: 'sonuc' }, d), '*'); } catch (e) {} }
const FONT = '"Baloo 2","Arial Rounded MT Bold","Trebuchet MS",system-ui,sans-serif';
const NL = M.NL, NSF = M.SEFERLER.length;

/* ================= KAYIT ================= */
const SKEY = 'malazgirt-akincilari-v1';
const D = window.DIL, t = D.t, HOST = D.HOST;
const FREE_LIMIT = 100;   // mobilde yeni oyuncu için ücretsiz bölüm sayısı (ilk iki sefer); gerisi Tam Sürüm
// 1.5'ten önce oynayanlar bulundukları yerden bir sonraki eşiğe kadar ücretsiz devam eder (ör. 244. bölümdeki oyuncu 250'ye kadar)
const FREE_STEPS = [100, 250, 500, 1000];
let S = { coins: 0, unlocked: 1, stars: [], up: { start: 0, dmg: 0, rate: 0, zirh: 0 }, sound: true, seen: 0, lang: D.lang, vol: { sfx: 80, mus: 80 }, q: D.platform === 'web' || D.platform === 'steam' ? 'yuksek' : 'orta', fs: 1 };
try { const raw = HOST && HOST.load ? HOST.load() : null; const s = JSON.parse(raw || localStorage.getItem(SKEY)); if (s && typeof s === 'object') { S = Object.assign(S, s); S.up = Object.assign({ start: 0, dmg: 0, rate: 0, zirh: 0 }, s.up || {}); S.vol = Object.assign({ sfx: 80, mus: 80 }, s.vol || {}); } } catch (e) {}
if (S.lang !== D.lang) D.setLang(S.lang);
// tam sürüm: masaüstü (Steam) satın alınmış oyundur; mobilde ücretsiz sınır FREE_STEPS'e göre (aşağıda, sürüm göçünden sonra)
const DEMO = !!(HOST && HOST.demo);   // Steam ücretsiz demosu: ilk 100 bölüm, sonra mağaza sayfası
const PAID = D.platform === 'android' || D.platform === 'ios' || D.platform === 'quest';   // ücretsiz sınır + Tam Sürüm satın alımı olan mağazalar
if (DEMO) S.full = false;
else if (!PAID) S.full = true;
// sürüm göçü: önceki sürümün son bölümünü bitirmiş oyuncu yeni seferi açık bulsun
for (let i = S.stars.length - 1; i >= 0; i--) if (S.stars[i]) { if (S.unlocked < i + 2) S.unlocked = Math.min(NL, i + 2); break; }
// mobil ücretsiz sınır bir kez belirlenir: yeni oyuncu 100, eski oyuncu bulunduğu yerin üstündeki ilk eşik (250 / 500 / 1000; 1000'i geçmişse hepsi)
if (DEMO) S.freeLim = FREE_LIMIT;
else if (!S.freeLim) { S.freeLim = FREE_STEPS.find(m => m >= S.unlocked) || NL; setTimeout(persist, 0); }
const freeLim = () => S.freeLim || FREE_LIMIT;
function persist() { const j = JSON.stringify(S); try { localStorage.setItem(SKEY, j); } catch (e) {} if (HOST && HOST.save) try { HOST.save(j); } catch (e) {} }
if (MAC) { const sf = M.seferOf(MAC.lv), i = MAC.lv, nom = i < 50 ? i * 0.2 : Math.min(M.upCap(sf), i < 500 ? 10 + (i - 50) * 0.09 : 50.5 + (i - 500) * 0.03);
  const u = MAC.ud === null ? MAC.up : Math.max(0, Math.min(M.upCap(sf), Math.round(nom + MAC.ud))); MAC.up = u;
  S = { coins: 0, unlocked: M.NL, stars: [], up: { start: u, dmg: u, rate: u, zirh: u }, sound: MAC.ses, seen: 0 }; persist = () => {}; }
const totalStars = () => S.stars.reduce((a, b) => a + (b || 0), 0);
const fmt = n => n >= 10000 ? D.dec((n / 1000).toFixed(n >= 100000 ? 0 : 1)) + (D.lang === 'en' ? 'K' : 'B') : String(Math.max(0, Math.ceil(n)));

/* ================= SES ================= */
// Bütün sesler WebAudio ile anlık üretilir: dosya yok, internet yok.
let AC = null, MASTER = null, SFXG = null, MUSG = null, OUT = null, NOISE = null, drumT = 0, drumOn = false;
function audio() {
  if (AC) return AC;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  const comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; comp.connect(AC.destination);
  MASTER = AC.createGain(); MASTER.gain.value = 0.8; MASTER.connect(comp);
  SFXG = AC.createGain(); SFXG.connect(MASTER); MUSG = AC.createGain(); MUSG.connect(MASTER); applyVolume();
  NOISE = AC.createBuffer(1, AC.sampleRate * 1.0, AC.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return AC;
}
function unlockAudio() { if (!S.sound) return; const a = audio(); if (a && a.state === 'suspended') a.resume(); }
window.SesKurtarici && SesKurtarici.yenidenKur(() => { AC = null; });
function tone(f, d = 0.12, type = 'square', v = 0.04, slide = 0, delay = 0) {
  if (!S.sound || !audio()) return; const t0 = AC.currentTime + delay; const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t0 + d);
  g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(g); g.connect(OUT || SFXG); o.start(t0); o.stop(t0 + d + 0.03);
}
function noise(d = 0.15, v = 0.12, freq = 900, delay = 0, q = 0.8) {
  if (!S.sound || !audio()) return; const t0 = AC.currentTime + delay; const s = AC.createBufferSource(); s.buffer = NOISE;
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq; f.Q.value = q; const g = AC.createGain();
  g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); s.connect(f); f.connect(g); g.connect(OUT || SFXG); s.start(t0); s.stop(t0 + d + 0.02);
}
function applyVolume() { if (!SFXG) return; SFXG.gain.value = (S.vol.sfx / 100) ** 1.5; MUSG.gain.value = (S.vol.mus / 100) ** 1.5 * 1.2; }
const mus = fn => function () { const o = OUT; OUT = MUSG; try { fn.apply(this, arguments); } finally { OUT = o; } };
const davul = mus(function (delay = 0, big = false) { tone(big ? 70 : 95, big ? 0.32 : 0.16, 'sine', big ? 0.22 : 0.12, 0.5, delay); noise(0.08, big ? 0.1 : 0.05, 500, delay); });
let lastTick = 0;
const SFX = {
  tick() { const n = performance.now(); if (n - lastTick < 60) return; lastTick = n; tone(900 + Math.random() * 300, 0.04, 'triangle', 0.025); },
  gain() { tone(880, 0.06, 'triangle', 0.04); },
  good() { tone(660, 0.09, 'triangle', 0.05); tone(990, 0.14, 'triangle', 0.05, 0, 0.08); },
  bad() { tone(220, 0.25, 'sawtooth', 0.05, 0.5); },
  crash() { noise(0.25, 0.18, 400); tone(140, 0.2, 'sawtooth', 0.04, 0.6); },
  break() { noise(0.18, 0.12, 1400); },
  weapon() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, 'square', 0.04, 0, i * 0.07)); },
  hero() { [392, 523, 659, 784].forEach((f, i) => tone(f, 0.16, 'square', 0.045, 0, i * 0.09)); },
  click() { tone(520, 0.05, 'triangle', 0.04); },
  buy() { tone(660, 0.08, 'triangle', 0.05); tone(990, 0.12, 'triangle', 0.05, 0, 0.07); noise(0.1, 0.05, 3000, 0.05); },
  star(k) { tone(784 + k * 196, 0.18, 'triangle', 0.06); },
};
// Hicaz dizisi (Re): zurna havası
const HICAZ = [293.66, 311.13, 369.99, 392, 440, 466.16, 523.25, 587.33];
const fanfare = mus(function () { davul(0, true); davul(0.26); davul(0.39); [0, 2, 3, 4, 3, 4, 6, 7].forEach((n, i) => tone(HICAZ[n] * 2, 0.17, 'square', 0.035, 0, 0.1 + i * 0.13)); davul(1.2, true); });
const sadHorn = mus(function () { [4, 3, 2, 1, 0].forEach((n, i) => tone(HICAZ[n], 0.24, 'sawtooth', 0.035, 0, i * 0.18)); davul(0.95, true); });
function drumLoop(dt) {   // savaş sırasında ağır mehter davulu
  if (!drumOn || !S.sound || !AC) return; drumT -= dt;
  if (drumT <= 0) { drumT += 1.6; davul(0, true); davul(0.4); davul(0.8, true); davul(1.0); davul(1.2); }
}
const SND_ON = '<svg viewBox="0 0 24 24"><path fill="#fff" d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const SND_OFF = '<svg viewBox="0 0 24 24"><path fill="#fff" d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l6 6M22 9l-6 6" stroke="#ff8a8f" stroke-width="2.2" stroke-linecap="round"/></svg>';
function drawSnd() { $('sndBtn').innerHTML = S.sound ? SND_ON : SND_OFF; $('sndBtn').setAttribute('aria-label', S.sound ? t('Sesi kapat') : t('Sesi aç')); }
$('sndBtn').addEventListener('click', () => { S.sound = !S.sound; persist(); drawSnd(); if (S.sound) { unlockAudio(); SFX.click(); } });
drawSnd();

/* ================= THREE SAHNE ================= */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
function applyQuality(first) { const q = S.q; renderer.setPixelRatio(q === 'dusuk' ? 1 : Math.min(window.devicePixelRatio || 1, q === 'orta' ? 1.5 : 2)); renderer.shadowMap.enabled = q !== 'dusuk'; renderer.shadowMap.needsUpdate = true; if (!first) resize(); }
applyQuality(true);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xead09a); scene.fog = new THREE.Fog(0xead09a, 70, 200);
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
const hemi = new THREE.HemisphereLight(0xfff4dc, 0x9c7a4a, 0.78); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d2, 0.82);
sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 26, bottom: -26, near: 1, far: 90 });
scene.add(sun); scene.add(sun.target);
function resize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.8 ? 58 : 44; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();

/* Bölge renkleri: kum, yayla, göl, vadi, ova (gün batımı) */
const THEMES = [
  { sky: 0xead09a, ground: 0xd9b673, hill: [0xcfa765, 0xc69c5a, 0xd8b878, 0xbf9452], mt: 0xb99068, bush: 0x8a8a4a, sun: 0xfff0d2, hemiG: 0x9c7a4a },
  { sky: 0xd6dfc8, ground: 0xa9b07a, hill: [0x8f9d63, 0x9fa96f, 0x7f8f58, 0xb0b27c], mt: 0x8a8070, bush: 0x5d7a3e, sun: 0xfff6e2, hemiG: 0x6d7a4a },
  { sky: 0xcfe0e6, ground: 0xc7b68a, hill: [0xb3a479, 0xa7a07c, 0xbcae84, 0x9e9474], mt: 0x8b8f99, bush: 0x6f8450, sun: 0xfff4e6, hemiG: 0x7d8a8a, lake: 0x2f7fa8 },
  { sky: 0xdde6cf, ground: 0x9db06e, hill: [0x7f9a55, 0x8ea760, 0x718c4b, 0x9bb06b], mt: 0x7c7a6a, bush: 0x4f6e36, sun: 0xfff2d8, hemiG: 0x5f7a40, river: 0x4d9cc0 },
  { sky: 0xf0c48e, ground: 0xd8b46a, hill: [0xc99a55, 0xbd8f4e, 0xd2a660, 0xb5884a], mt: 0x9b6f5a, bush: 0x7d7a3e, sun: 0xffd9a0, hemiG: 0x8a5e3a },
  // 2. sefer: Kapadokya, Konya Ovası, Frigya, Bitinya, İznik
  { sky: 0xf1dcc0, ground: 0xd9b48a, hill: [0xd8a982, 0xe0b993, 0xcf9d78, 0xe6c4a0], mt: 0xc49a7a, bush: 0x8a8a5a, sun: 0xfff0dc, hemiG: 0x9c7a5a, peri: 1 },
  { sky: 0xe8e2c8, ground: 0xcdbb84, hill: [0xc2b077, 0xd1bf86, 0xb8a66c, 0xc9b67e], mt: 0xa89880, bush: 0x8e8a4e, sun: 0xfff4dc, hemiG: 0x8f7d50 },
  { sky: 0xdfe3d0, ground: 0xb9ad80, hill: [0xa99b6e, 0xb5a878, 0x9c8f64, 0xc0b384], mt: 0x9a8a7a, bush: 0x6d7a45, sun: 0xfff4e0, hemiG: 0x7a7050, peri: 2 },
  { sky: 0xd4e4d0, ground: 0x8fae68, hill: [0x6f9a50, 0x7fa85c, 0x628c48, 0x8cb066], mt: 0x6d7a6a, bush: 0x3f6a32, sun: 0xfff6e2, hemiG: 0x4f6a3a, forest: 1, river: 0x4a8fb5 },
  { sky: 0xcfe2ea, ground: 0xb9b884, hill: [0x9aa66e, 0xa8b07a, 0x8e9a64, 0xb4b886], mt: 0x8a8f96, bush: 0x5f7a42, sun: 0xfff4e6, hemiG: 0x6a7a5a, lake: 0x3a86b0, forest: 0.4 },
  // 3. sefer: Marmara, Sakarya, Dorylaion, Orta Anadolu, Ereğli
  { sky: 0xd2e6ee, ground: 0xc8c08e, hill: [0xa8b07a, 0xb6ba84, 0x9aa46c, 0xc0c08e], mt: 0x8a919a, bush: 0x5f7a42, sun: 0xfff6ea, hemiG: 0x6a7a62, lake: 0x2a74a8 },
  { sky: 0xd6e4d2, ground: 0x96b06c, hill: [0x739a52, 0x84a65e, 0x668e4a, 0x90b26a], mt: 0x6f7c6e, bush: 0x3f6a32, sun: 0xfff4e0, hemiG: 0x52703c, forest: 1, river: 0x4d94bb },
  { sky: 0xf3e2b0, ground: 0xd8c27a, hill: [0xccb06a, 0xd6bc74, 0xc2a462, 0xdcc480], mt: 0xa88f6a, bush: 0x8a8a44, sun: 0xffeccc, hemiG: 0x957a48, river: 0x5a9cc0 },
  { sky: 0xf2d9a8, ground: 0xdcbf80, hill: [0xcfa86c, 0xd8b478, 0xc49c62, 0xe0bf86], mt: 0xb08a68, bush: 0x9a8a4e, sun: 0xffe4b8, hemiG: 0x9a7448 },
  { sky: 0xf0c0a0, ground: 0xcfae78, hill: [0xbf9a66, 0xc8a46e, 0xb48e5c, 0xd2ae78], mt: 0x987062, bush: 0x7a7a42, sun: 0xffd6a8, hemiG: 0x8a5e44, river: 0x5a9cc0 },
  // 4. sefer: Konya, Göller, Sultan Dağları, Tzivritze, Miryokefalon
  { sky: 0xe6d6b8, ground: 0xc8b080, hill: [0xb89a6a, 0xc4a674, 0xae9060, 0xcab07e], mt: 0x8f7a68, bush: 0x8a6e3a, sun: 0xffeccc, hemiG: 0x8a6a44 },
  { sky: 0xcfe3ec, ground: 0xb3b685, hill: [0x93a26c, 0xa2ac78, 0x86965f, 0xaeb482], mt: 0x7f8a96, bush: 0x5a7440, sun: 0xfff6ea, hemiG: 0x667a62, lake: 0x2f88b8 },
  { sky: 0xdde4ea, ground: 0xa9a27e, hill: [0x8f9278, 0x9a9c82, 0x84886e, 0xa4a48a], mt: 0x8a8c94, bush: 0x5f6e48, sun: 0xfff6ee, hemiG: 0x6a6e66, mtN: 46, cliff: 1 },
  { sky: 0xd8d8d0, ground: 0x9e9474, hill: [0x8f877a, 0x9a9184, 0x847c70, 0xa49a8c], mt: 0x77726a, bush: 0x5f6a48, sun: 0xfff0e0, hemiG: 0x6a645a, mtN: 52, cliff: 2 },
  { sky: 0xf0b890, ground: 0xc9a070, hill: [0xb88e60, 0xc29868, 0xae8458, 0xcca272], mt: 0x8a6a5a, bush: 0x7a6a3a, sun: 0xffd2a0, hemiG: 0x8a5a40, cliff: 1 },
  // 5. sefer: Antalya, Sinop, Alanya, Kervan Yolları, Suğdak
  { sky: 0xd8ecf4, ground: 0xd8c08a, hill: [0xb8a870, 0xc4b27a, 0xa89a66, 0xcabc88], mt: 0x9a9488, bush: 0x5f7a3e, sun: 0xfff6e8, hemiG: 0x7a7a5a, lake: 0x2a86c0, forest: 0.4 },
  { sky: 0xd0dce0, ground: 0x8fa868, hill: [0x6f9450, 0x7ea25c, 0x628a48, 0x8aac66], mt: 0x6a786a, bush: 0x3f6a32, sun: 0xfff4e4, hemiG: 0x4f6a40, lake: 0x2a5a80, forest: 1 },
  { sky: 0xe0eef4, ground: 0xc8a878, hill: [0xb89a6a, 0xc4a474, 0xae8e60, 0xcab07e], mt: 0x9a7a62, bush: 0x5a7a3a, sun: 0xfff6ea, hemiG: 0x7a6a50, lake: 0x2a90c8, cliff: 1 },
  { sky: 0xeedcb0, ground: 0xd4bc84, hill: [0xc8ae74, 0xd2b880, 0xbea468, 0xdac288], mt: 0xae9070, bush: 0x8a8a4a, sun: 0xfff0d0, hemiG: 0x957a4a },
  { sky: 0xd4e0e8, ground: 0xa8b47a, hill: [0x96a26a, 0xa4ae76, 0x8a9660, 0xb0b882], mt: 0x84888e, bush: 0x5a7040, sun: 0xfff4e6, hemiG: 0x6a7058, lake: 0x2a6a98, cliff: 0.5 },
  // 6. sefer: Söğüt, Sakarya, Bursa Ovası, İznik Yolu, Koyunhisar
  { sky: 0xdbe8d4, ground: 0x98b06a, hill: [0x7a9c56, 0x88a862, 0x6e904c, 0x94b06c], mt: 0x7a8070, bush: 0x46703a, sun: 0xfff6e2, hemiG: 0x56723e, forest: 0.6 },
  { sky: 0xd6e4d2, ground: 0x94ae6a, hill: [0x709850, 0x80a45c, 0x648c48, 0x8cae68], mt: 0x6f7c6e, bush: 0x3f6a32, sun: 0xfff4e0, hemiG: 0x52703c, forest: 1, river: 0x4d94bb },
  { sky: 0xd8e6ee, ground: 0x9cb46c, hill: [0x7a9e58, 0x88aa62, 0x6e924e, 0x94b06e], mt: 0x8a96a0, bush: 0x46703a, sun: 0xfff6ea, hemiG: 0x5a7448, mtN: 44, forest: 0.5 },
  { sky: 0xd0e4ec, ground: 0xb4b880, hill: [0x98a46c, 0xa6ae78, 0x8c9862, 0xb0b682], mt: 0x8a9096, bush: 0x5a7440, sun: 0xfff4e8, hemiG: 0x667a5a, lake: 0x3a86b0, forest: 0.4 },
  { sky: 0xf2c896, ground: 0xd2b06c, hill: [0xc49c5c, 0xceaa66, 0xb89052, 0xd6b272], mt: 0x9a7460, bush: 0x7d7a3e, sun: 0xffdcaa, hemiG: 0x8a603e },
  // 7. sefer: Bursa, Pelekanon, İznik ve İzmit, Gelibolu, Edirne
  { sky: 0xd8e6ee, ground: 0x9cb46c, hill: [0x7a9e58, 0x88aa62, 0x6e924e, 0x94b06e], mt: 0x8a96a0, bush: 0x46703a, sun: 0xfff6ea, hemiG: 0x5a7448, mtN: 40, forest: 0.7 },
  { sky: 0xd2e6ee, ground: 0xc4be8c, hill: [0xa8b07a, 0xb4b884, 0x9aa46c, 0xbebe8e], mt: 0x8a919a, bush: 0x5f7a42, sun: 0xfff6ea, hemiG: 0x6a7a62, lake: 0x2a74a8 },
  { sky: 0xcfe2ea, ground: 0xa8b47c, hill: [0x8a9e66, 0x98a872, 0x7e925c, 0xa4ae7c], mt: 0x7f8a92, bush: 0x4f7040, sun: 0xfff4e8, hemiG: 0x5e7254, lake: 0x3580b0, forest: 0.8 },
  { sky: 0xd4e6ee, ground: 0xc8bc88, hill: [0xb0a874, 0xbcb27e, 0xa49c6a, 0xc4b888], mt: 0x8e8a86, bush: 0x6a7a44, sun: 0xfff6ea, hemiG: 0x707a5a, lake: 0x2a78b0, cliff: 0.5 },
  { sky: 0xe6e2c4, ground: 0xc4b87c, hill: [0xb0a46a, 0xbcae74, 0xa49860, 0xc4b67e], mt: 0x9a907a, bush: 0x6a7a40, sun: 0xfff2d8, hemiG: 0x7a7248, river: 0x5a9cc0 },
  // 8. sefer: Trakya, Balkan Dağları, Makedonya, Sırp Toprakları, Kosova
  { sky: 0xeee2bc, ground: 0xcab878, hill: [0xbaa868, 0xc6b272, 0xae9c60, 0xceba7c], mt: 0x9e8e72, bush: 0x7a7a40, sun: 0xfff0d0, hemiG: 0x857448, river: 0x5a9cc0 },
  { sky: 0xd6e2ea, ground: 0x8ea46c, hill: [0x6e8c56, 0x7c9860, 0x62804e, 0x88a26a], mt: 0x7a8088, bush: 0x3f6036, sun: 0xfff4e8, hemiG: 0x56684a, mtN: 52, cliff: 1, forest: 0.8 },
  { sky: 0xd2e4ec, ground: 0xa4ae7a, hill: [0x8a9a66, 0x98a672, 0x7e8e5c, 0xa2ac7c], mt: 0x84888e, bush: 0x56703e, sun: 0xfff4e8, hemiG: 0x667058, lake: 0x2f7fb0, mtN: 40 },
  { sky: 0xd8e4d4, ground: 0x92ac68, hill: [0x709850, 0x7ea45c, 0x648c48, 0x8aae66], mt: 0x6f7c6e, bush: 0x3f6a32, sun: 0xfff4e0, hemiG: 0x52703c, forest: 0.9, river: 0x4d94bb },
  { sky: 0xf0bf92, ground: 0xc8a46c, hill: [0xb8925c, 0xc29c66, 0xae8854, 0xcca670], mt: 0x8e6e5c, bush: 0x7a6e3a, sun: 0xffd4a0, hemiG: 0x8a5c40 },
  // 9. sefer: Tuna Boyu, Eflak, Haçlı Ordusu, Niğbolu Kuşatması, Niğbolu Meydanı
  { sky: 0xd6e4e8, ground: 0xa8b07c, hill: [0x8e9e68, 0x9caa74, 0x82925e, 0xa6ae7e], mt: 0x84888a, bush: 0x56703e, sun: 0xfff4e8, hemiG: 0x667058, lake: 0x4a8ab0 },
  { sky: 0xcfdcd0, ground: 0x7a9658, hill: [0x5e8044, 0x6c8c4e, 0x547840, 0x789652], mt: 0x667060, bush: 0x34582c, sun: 0xfff0dc, hemiG: 0x4a6038, forest: 1.2, river: 0x4a7a90 },
  { sky: 0xe4e0c8, ground: 0xbcb27a, hill: [0xa8a068, 0xb4aa72, 0x9c9460, 0xbcb27c], mt: 0x948a78, bush: 0x6a7240, sun: 0xfff2dc, hemiG: 0x787048 },
  { sky: 0xd8e2e6, ground: 0xb0aa7e, hill: [0x9a9a6c, 0xa6a476, 0x8e8e62, 0xaeac80], mt: 0x868684, bush: 0x5e6c42, sun: 0xfff2e4, hemiG: 0x6c6a54, river: 0x4d8cb0, cliff: 0.5 },
  { sky: 0xf2c48e, ground: 0xceaa6a, hill: [0xbe965a, 0xc8a064, 0xb28a50, 0xd0aa6e], mt: 0x94705a, bush: 0x7a6e3a, sun: 0xffd6a2, hemiG: 0x8a5e3e },
  // 10. sefer: İzladi (kış), Barış Bozuluyor (güz), Boğazlar, Karadeniz Kıyısı, Varna
  { sky: 0xe6edf4, ground: 0xeef2f6, hill: [0xdde4ec, 0xe6ecf2, 0xd2dae4, 0xeaeff4], mt: 0xc8d0dc, bush: 0x5a6a5a, sun: 0xf6f8ff, hemiG: 0xb8c2cc, mtN: 50, forest: 0.7 },
  { sky: 0xe8d8b8, ground: 0xc0a070, hill: [0xb08a58, 0xbc9662, 0xa47e4e, 0xc49e6a], mt: 0x8a7462, bush: 0x9a6a2a, sun: 0xffe8c4, hemiG: 0x8a6440, forest: 0.6 },
  { sky: 0xd2e6ee, ground: 0xc4be8c, hill: [0xa8b07a, 0xb4b884, 0x9aa46c, 0xbebe8e], mt: 0x8a919a, bush: 0x5f7a42, sun: 0xfff6ea, hemiG: 0x6a7a62, lake: 0x2a70a8, cliff: 0.4 },
  { sky: 0xd4e2ea, ground: 0xb8b47e, hill: [0x9ea46c, 0xaaae78, 0x929a62, 0xb2b482], mt: 0x868c92, bush: 0x5a7040, sun: 0xfff4e8, hemiG: 0x687058, lake: 0x2a6aa0 },
  { sky: 0xeeb08a, ground: 0xc29a6a, hill: [0xb08a5c, 0xba9466, 0xa48052, 0xc29c6e], mt: 0x86665a, bush: 0x6a5e36, sun: 0xffcc98, hemiG: 0x84563c, lake: 0x2a6098 },
  // 11. sefer: Boğazkesen, Şahi Toplar, Kara Surları, Haliç, Son Hücum
  { sky: 0xd4e8f0, ground: 0xa8b47e, hill: [0x8aa26a, 0x98ac74, 0x7e9660, 0xa4b27e], mt: 0x84909a, bush: 0x4f7040, sun: 0xfff6ea, hemiG: 0x627a5a, lake: 0x2a78b8, forest: 0.5 },
  { sky: 0xe6e0c8, ground: 0xbcb07a, hill: [0xaaa06a, 0xb6aa74, 0x9e9460, 0xbeb27e], mt: 0x948a7a, bush: 0x6a7240, sun: 0xfff2dc, hemiG: 0x787048, sur: 0.6 },
  { sky: 0xe2d8c4, ground: 0xb8a67a, hill: [0xa8966a, 0xb2a074, 0x9c8a60, 0xbaa87e], mt: 0x8e8478, bush: 0x6a6a40, sun: 0xfff0dc, hemiG: 0x76684a, sur: 1 },
  { sky: 0xd2e4ee, ground: 0xb0b07e, hill: [0x94a06c, 0xa2aa76, 0x889462, 0xaab082], mt: 0x868e96, bush: 0x56703e, sun: 0xfff4e8, hemiG: 0x667058, lake: 0x2a6aa8, sur: 0.7 },
  { sky: 0xf2c08e, ground: 0xc8a46a, hill: [0xb8945a, 0xc29e64, 0xac8852, 0xcaa66e], mt: 0x907060, bush: 0x76683a, sun: 0xffd2a0, hemiG: 0x8a5c3e, sur: 1 },
  // 12. sefer: Semendire, Mora, Trabzon, Bosna, Eğriboz ve Otranto
  { sky: 0xd6e4e8, ground: 0xa4ae7a, hill: [0x8a9c66, 0x98a872, 0x7e905c, 0xa2ac7c], mt: 0x84888a, bush: 0x56703e, sun: 0xfff4e8, hemiG: 0x667058, lake: 0x4a8ab0 },
  { sky: 0xe4e8e0, ground: 0xc4b07a, hill: [0xb49c66, 0xbea670, 0xa8905c, 0xc6ae7a], mt: 0x9a8a78, bush: 0x6a7a3a, sun: 0xfff2dc, hemiG: 0x7a6e48, mtN: 44, cliff: 0.8 },
  { sky: 0xd0dcd8, ground: 0x84a462, hill: [0x648a4a, 0x729654, 0x588042, 0x7e9e5a], mt: 0x667468, bush: 0x34602e, sun: 0xfff0e0, hemiG: 0x4a6440, lake: 0x2a5a80, forest: 1.2, mtN: 48 },
  { sky: 0xd4e0dc, ground: 0x8aa666, hill: [0x6a8e4e, 0x789a58, 0x5e8446, 0x84a260], mt: 0x6e7a70, bush: 0x3a6230, sun: 0xfff2e2, hemiG: 0x4e6842, forest: 1, river: 0x4a8aa8, cliff: 0.5 },
  { sky: 0xd8ecf4, ground: 0xd0bc88, hill: [0xb8a670, 0xc4b07a, 0xac9a66, 0xccb886], mt: 0x9a948a, bush: 0x5f7a3e, sun: 0xfff6ea, hemiG: 0x7a7a5a, lake: 0x2a8ac4 },
  // 13. sefer: Sava Kıyısı, Belgrad, Ege Yolu, Rodos Surları, Rodos
  { sky: 0xd6e4e0, ground: 0x9cae72, hill: [0x7e9a5c, 0x8ca666, 0x728e52, 0x96aa6e], mt: 0x7a8278, bush: 0x46683a, sun: 0xfff4e4, hemiG: 0x5a7048, river: 0x4d8cb0, forest: 0.5 },
  { sky: 0xe0dcc8, ground: 0xb4a87a, hill: [0xa29a6c, 0xae9f74, 0x968c60, 0xb4a87e], mt: 0x8a8478, bush: 0x626a40, sun: 0xfff0dc, hemiG: 0x726a4c, river: 0x4a86a8, sur: 0.6 },
  { sky: 0xd4ecf6, ground: 0xd4be88, hill: [0xbaa46e, 0xc6b078, 0xae9864, 0xcebc84], mt: 0x9e9688, bush: 0x6a7a3e, sun: 0xfff6ea, hemiG: 0x7e7a5a, lake: 0x2a90cc, cliff: 0.4 },
  { sky: 0xdcecf2, ground: 0xc8b484, hill: [0xb29c6c, 0xbea676, 0xa69062, 0xc4ac80], mt: 0x948a7e, bush: 0x667a3e, sun: 0xfff4e6, hemiG: 0x7a7258, lake: 0x2a88c4, sur: 1 },
  { sky: 0xe8c8a8, ground: 0xc0a478, hill: [0xae9068, 0xb89a70, 0xa28660, 0xc0a27a], mt: 0x8c7464, bush: 0x6a6a3a, sun: 0xffe0c0, hemiG: 0x806448, lake: 0x2a70a8, sur: 0.8 },
  // 14. sefer: Tuna Boyunca, Drava Köprüsü, Macar Ordugâhı, Mohaç Ovası, Mohaç
  { sky: 0xd6e4e8, ground: 0xa8b07c, hill: [0x8e9e68, 0x9caa74, 0x82925e, 0xa6ae7e], mt: 0x84888a, bush: 0x56703e, sun: 0xfff4e8, hemiG: 0x667058, lake: 0x4a8ab0, forest: 0.4 },
  { sky: 0xd4e0d4, ground: 0x8ea66a, hill: [0x6e8e52, 0x7c9a5c, 0x62844a, 0x88a264], mt: 0x6e7a6e, bush: 0x3e6634, sun: 0xfff2e2, hemiG: 0x50683e, river: 0x4a86a0, forest: 0.8 },
  { sky: 0xece2bc, ground: 0xc8b676, hill: [0xb8a666, 0xc4b070, 0xac9a5e, 0xccb87a], mt: 0x9c8e70, bush: 0x787a40, sun: 0xfff0d0, hemiG: 0x847446 },
  { sky: 0xeee4c0, ground: 0xb8b474, hill: [0xa4a466, 0xb0ae70, 0x98985e, 0xb8b47a], mt: 0x908c70, bush: 0x667a3c, sun: 0xfff2d6, hemiG: 0x7a7646, river: 0x5a8a90 },
  { sky: 0xf0b88e, ground: 0xc4a068, hill: [0xb48e58, 0xbe9862, 0xa88450, 0xc6a06c], mt: 0x8c6a58, bush: 0x6e6438, sun: 0xffd0a0, hemiG: 0x86583c, river: 0x4a7088 },
  // 15. sefer: Viyana Yolu (güz), Güns, Slavonya, Peşte, Budin
  { sky: 0xe6d6b8, ground: 0xb89c6a, hill: [0xa88a5a, 0xb49464, 0x9c7e52, 0xbc9a6c], mt: 0x8a7462, bush: 0x9a6a2a, sun: 0xffe6c0, hemiG: 0x8a6440, forest: 0.7 },
  { sky: 0xd8e2e4, ground: 0x96a26c, hill: [0x7a8c58, 0x889862, 0x6e8050, 0x929e6a], mt: 0x7a8088, bush: 0x46603a, sun: 0xfff2e4, hemiG: 0x5a6a4a, mtN: 46, forest: 0.9, cliff: 0.4 },
  { sky: 0xd6e2d6, ground: 0x8aa466, hill: [0x6a8c4e, 0x789858, 0x5e8246, 0x84a060], mt: 0x6c786e, bush: 0x3a6230, sun: 0xfff2e2, hemiG: 0x4e6842, forest: 1.1, river: 0x4a88a8 },
  { sky: 0xe2e0cc, ground: 0xb8ae7c, hill: [0xa69e6c, 0xb2a876, 0x9a9262, 0xbaae80], mt: 0x8e887a, bush: 0x626c40, sun: 0xfff2de, hemiG: 0x746c4c, river: 0x4a86b0 },
  { sky: 0xf2c494, ground: 0xc8a66c, hill: [0xb8965c, 0xc2a066, 0xac8a54, 0xcaa870], mt: 0x92725e, bush: 0x76683a, sun: 0xffd4a4, hemiG: 0x8a5e40, river: 0x4a7aa0, sur: 0.8 }
];
// 16–22. seferler: önceki paletlerden türetilir (her bölümde gün saati / hava / mevsim ayrıca değişir: MOODS)
const BATAKLIK = { sky: 0xd2dcd4, ground: 0x7e9a64, hill: [0x6a8a52, 0x76945a, 0x5e7e4a, 0x82a062], mt: 0x6a746c, bush: 0x3e5e34, sun: 0xfff0e0, hemiG: 0x4a6040, lake: 0x4a6a5e, forest: 0.6, river: 0x4a6a5e };
[[60], [66], [-1], [61], [69, { sur: 0.8 }],                       // Zigetvar
 [62], [13, { sur: 0.7 }], [56, { lake: 0x2a8ac4 }], [63], [64],     // Kıbrıs
 [65], [71, { sur: 0.5 }], [-1], [68], [69],                        // Haçova
 [62, { cliff: 0.6 }], [56], [63], [62], [64],                       // Girit
 [73], [61], [67], [18, { river: 0x4a86a8 }], [19],                  // Uyvar ve Kamaniçe
 [45], [46], [48, { river: 0x4a86a8 }], [47], [49],                  // Prut
 [30], [2], [4],                                                     // Malazgirt'e Dönüş
 [56], [63], [56, { cliff: 1 }], [59], [64],                         // Mora
 [60], [71], [61], [65], [61, { sur: 0.8 }],                         // Belgrad
 [65], [71], [67], [-1, { mood: 'gece' }], [69],                     // Şebeş
 [23], [20], [63, { lake: 0x2a8ac4 }], [22], [4, { sur: 0.8 }],      // Akka
 [45], [40], [42], [43, { sur: 0.6 }], [44],                         // Silistre
 [42], [68], [41], [43], [45],                                       // Plevne
 [56], [42], [18], [68], [19],                                       // Dömeke
 [30], [50], [54]                                                    // Fetih Yolu
].forEach(([k, o]) => THEMES.push(Object.assign({}, k < 0 ? BATAKLIK : THEMES[k], o || {})));

/* geometri yardımcıları: renkli parçaları tek geometriye birleştir (az çizim çağrısı) */
const _q = new THREE.Quaternion(), _e = new THREE.Euler();
function Mx(x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) { return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), _q.clone().setFromEuler(_e.set(rx, ry, rz)), new THREE.Vector3(sx, sy, sz)); }
function P(geo, color, m) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m); const n = g.attributes.position.count, c = new Float32Array(n * 3), col = new THREE.Color(color);
  for (let i = 0; i < n; i++) { c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g;
}
function merge(parts) {
  let n = 0; parts.forEach(p => n += p.attributes.position.count);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
  parts.forEach(p => { pos.set(p.attributes.position.array, o * 3); nor.set(p.attributes.normal.array, o * 3); col.set(p.attributes.color.array, o * 3); o += p.attributes.position.count; });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeBoundingSphere(); return g;
}
const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d), CYL = (a, b, h, s) => new THREE.CylinderGeometry(a, b, h, s), SPH = (r, a, b) => new THREE.SphereGeometry(r, a, b), CONE = (r, h, s) => new THREE.ConeGeometry(r, h, s);

// Akıncı: firuze kaftan, sarık-miğfer, kırmızı tepelik, sırtında sadak, elinde yay
const akinciG = merge([
  P(BOX(.3, .42, .2), 0x3a2a1f, Mx(0, .21, 0)),
  P(CYL(.17, .27, .52, 7), ARMY1, Mx(0, .66, 0)),
  P(CYL(.215, .215, .07, 7), ARMY2, Mx(0, .5, 0)),
  P(BOX(.38, .12, .22), ARMY1D, Mx(0, .88, 0)),
  P(SPH(.14, 7, 5), 0xe2b68c, Mx(0, 1.03, 0)),
  P(CYL(.18, .18, .07, 7), 0xf3ead6, Mx(0, 1.1, 0)),
  P(CONE(.17, .36, 7), 0xd5dbe0, Mx(0, 1.3, 0)),
  P(CONE(.035, .14, 4), 0xc8303a, Mx(0, 1.52, 0)),
  P(new THREE.TorusGeometry(.3, .025, 4, 10, Math.PI), 0x6b3e1f, Mx(-.27, .74, -.06, 1, 1, 1, 0, -Math.PI / 2, Math.PI / 2)),
  P(BOX(.012, .6, .012), 0xf2efe6, Mx(-.27, .74, -.06)),
  P(BOX(.1, .38, .1), 0x7a4a24, Mx(.09, .8, .17, 1, 1, 1, 0.3, 0, 0))
]);
// Bizans piyadesi: kızıl tunik, pullu zırh, tüylü miğfer, kalkan
function piyadeG(body = FOE1, armor = 0x8e9aa3) {
  return merge([
    P(BOX(.3, .42, .2), 0x2a2226, Mx(0, .21, 0)),
    P(CYL(.18, .27, .52, 7), body, Mx(0, .66, 0)),
    P(BOX(.36, .3, .24), armor, Mx(0, .8, 0)),
    P(SPH(.14, 7, 5), 0xe0b08a, Mx(0, 1.03, 0)),
    P(new THREE.SphereGeometry(.17, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0x6f7880, Mx(0, 1.06, 0)),
    P(BOX(.03, .13, .28), 0xc8303a, Mx(0, 1.23, 0)),
    P(BOX(.07, .52, .4), FOE2, Mx(.3, .66, -.04)),
    P(SPH(.06, 6, 4), 0xe3a92b, Mx(.35, .66, -.04))
  ]);
}
const okcuG = merge([
  P(BOX(.28, .42, .2), 0x3a2d22, Mx(0, .21, 0)),
  P(CYL(.16, .25, .52, 7), MAC ? FOE1 : 0x9e3a2e, Mx(0, .66, 0)),
  P(SPH(.14, 7, 5), 0xe0b08a, Mx(0, 1.03, 0)),
  P(CYL(.12, .17, .12, 7), 0x6b4a2b, Mx(0, 1.12, 0)),
  P(new THREE.TorusGeometry(.32, .025, 4, 10, Math.PI), 0x4a2a14, Mx(.25, .8, -.12, 1, 1, 1, 0, Math.PI / 2, Math.PI / 2)),
  P(BOX(.1, .4, .1), 0x5b3a1e, Mx(-.1, .82, .16, 1, 1, 1, .3, 0, 0))
]);
const varangG = merge([
  P(BOX(.34, .46, .22), 0x24262b, Mx(0, .23, 0)),
  P(CYL(.2, .3, .58, 8), MAC ? dk(FOE1, .8) : 0x7a2030, Mx(0, .72, 0)),
  P(BOX(.42, .34, .28), 0x5c6670, Mx(0, .88, 0)),
  P(SPH(.15, 7, 5), 0xd9a882, Mx(0, 1.12, 0)),
  P(CONE(.19, .34, 8), 0x8d98a3, Mx(0, 1.33, 0)),
  P(BOX(.05, .1, .02), 0x8d98a3, Mx(0, 1.12, -.16)),
  P(BOX(.06, 1.1, .06), 0x5b3a1e, Mx(.36, .9, -.1)),
  P(BOX(.05, .3, .32), 0xb9c2cc, Mx(.36, 1.38, -.22))
]);
// Katafrakt: zırhlı at ve süvari
const katafraktG = merge([
  P(BOX(.46, .5, 1.2), 0x3b2a20, Mx(0, .95, 0)),
  P(BOX(.5, .36, 1.24), 0x8a949e, Mx(0, 1.02, 0)),
  ...[[-.16, .45], [.16, .45], [-.16, -.45], [.16, -.45]].map(([x, z]) => P(BOX(.12, .7, .12), 0x2b1f18, Mx(x, .35, z))),
  P(BOX(.24, .5, .3), 0x3b2a20, Mx(0, 1.35, -.62, 1, 1, 1, -.5, 0, 0)),
  P(BOX(.2, .22, .44), 0x8a949e, Mx(0, 1.58, -.8, 1, 1, 1, -.2, 0, 0)),
  P(CYL(.15, .2, .5, 7), MAC ? FOE1 : 0x8e2a35, Mx(0, 1.55, .05)),
  P(BOX(.32, .26, .24), 0xaab3bb, Mx(0, 1.62, .05)),
  P(SPH(.13, 7, 5), 0xe0b08a, Mx(0, 1.9, .05)),
  P(CONE(.15, .3, 7), 0x8a949e, Mx(0, 2.08, .05)),
  P(BOX(.04, .04, 1.6), 0x6b4a2b, Mx(.24, 1.55, -.5)),
  P(CONE(.04, .18, 4), 0xd5dbe0, Mx(.24, 1.55, -1.38, 1, 1, 1, -Math.PI / 2, 0, 0))
]);
// Hafif süvari (Akrit ve benzerleri): at, tunik, yuvarlak kalkan, mızrak
function hafifAtliG(c) {
  c = Object.assign({ at: 0x7a4a2a, bacak: 0x4a2e1c, bas: 0x6a3e22, tunik: 0xa83a2e, kalkan: 0xd8b040, mig: 0x8a949e }, c);
  return merge([
    P(BOX(.42, .46, 1.15), c.at, Mx(0, .92, 0)),
    ...[[-.15, .43], [.15, .43], [-.15, -.43], [.15, -.43]].map(([x, z]) => P(BOX(.11, .7, .11), c.bacak, Mx(x, .35, z))),
    P(BOX(.22, .46, .28), c.at, Mx(0, 1.3, -.6, 1, 1, 1, -.5, 0, 0)),
    P(BOX(.18, .2, .4), c.bas, Mx(0, 1.52, -.78, 1, 1, 1, -.2, 0, 0)),
    P(BOX(.5, .1, .5), c.tunik, Mx(0, 1.2, .05)),
    P(CYL(.15, .2, .5, 7), c.tunik, Mx(0, 1.5, .05)),
    P(SPH(.13, 7, 5), 0xe0b08a, Mx(0, 1.85, .05)),
    P(CYL(.1, .15, .16, 7), c.mig, Mx(0, 1.98, .05)),
    P(CYL(.24, .24, .05, 10), c.kalkan, Mx(-.24, 1.5, .05, 1, 1, 1, 0, 0, Math.PI / 2)),
    P(BOX(.035, .035, 1.7), 0x6b4a2b, Mx(.22, 1.55, -.45)),
    P(CONE(.04, .18, 4), 0xd5dbe0, Mx(.22, 1.55, -1.38, 1, 1, 1, -Math.PI / 2, 0, 0))
  ]);
}
// Ağır süvari (Şövalye ve benzerleri): örtülü at, kova miğfer, uzun kalkan, mızrak
function agirAtliG(c) {
  c = Object.assign({ ortu: 0xe8e2d2, tunik: 0x2c4f8f, kalkan: 0x2c4f8f, arma: 0xf0b232 }, c);
  return merge([
    P(BOX(.48, .52, 1.25), 0x4a3020, Mx(0, .96, 0)),
    P(BOX(.56, .5, 1.34), c.ortu, Mx(0, .9, 0)),
    ...[[-.17, .46], [.17, .46], [-.17, -.46], [.17, -.46]].map(([x, z]) => P(BOX(.12, .66, .12), 0x2b1f18, Mx(x, .33, z))),
    P(BOX(.24, .5, .3), c.ortu, Mx(0, 1.36, -.64, 1, 1, 1, -.5, 0, 0)),
    P(BOX(.2, .22, .44), c.ortu, Mx(0, 1.6, -.82, 1, 1, 1, -.2, 0, 0)),
    P(CYL(.16, .21, .52, 7), c.tunik, Mx(0, 1.58, .05)),
    P(BOX(.3, .26, .24), 0x9aa3ad, Mx(0, 1.68, .05)),
    P(BOX(.26, .3, .26), 0xaab3bb, Mx(0, 1.98, .05)),
    P(BOX(.27, .04, .04), 0x1a1a1a, Mx(0, 2.0, -.08)),
    P(BOX(.06, .5, .34), c.kalkan, Mx(-.27, 1.55, -.02)),
    P(BOX(.065, .2, .1), c.arma, Mx(-.3, 1.62, -.02)),
    P(BOX(.04, .04, 1.8), 0x6b4a2b, Mx(.24, 1.6, -.55)),
    P(CONE(.045, .2, 4), 0xd5dbe0, Mx(.24, 1.6, -1.5, 1, 1, 1, -Math.PI / 2, 0, 0)),
    ...(c.kanat ? [P(BOX(.05, 1.0, .12), 0x6b4a2b, Mx(0, 2.15, .24, 1, 1, 1, .25, 0, 0)), P(BOX(.12, .9, .26), 0xf4f0e6, Mx(0, 2.25, .34, 1, 1, 1, .25, 0, 0))] : [])
  ]);
}
// Batılı piyade (Haçlı, Latin, Katalan, Sırp): tunik, örme zırh, burun korumalı miğfer, uzun kalkan
function batiPiyadeG(c) {
  c = Object.assign({ tunik: 0x2c4f8f, zirh: 0x9aa3ad, kalkan: 0xe8e2d2, arma: 0xc8303a, mig: 0x9aa3ad }, c);
  return merge([
    P(BOX(.3, .42, .2), 0x2a2226, Mx(0, .21, 0)),
    P(CYL(.18, .27, .52, 7), c.tunik, Mx(0, .66, 0)),
    P(BOX(.36, .3, .24), c.zirh, Mx(0, .82, 0)),
    P(SPH(.14, 7, 5), 0xe6c09a, Mx(0, 1.03, 0)),
    c.sapka ? P(CYL(.24, .24, .04, 10), c.mig, Mx(0, 1.14, 0)) : P(CONE(.17, .28, 7), c.mig, Mx(0, 1.2, 0)),
    c.sapka ? P(CYL(.13, .15, .14, 8), c.mig, Mx(0, 1.2, 0)) : P(BOX(.03, .12, .03), c.mig, Mx(0, 1.04, -.14)),
    P(BOX(.06, .62, .34), c.kalkan, Mx(.3, .62, -.04)),
    P(BOX(.065, .16, .1), c.arma, Mx(.33, .7, -.04))
  ]);
}
// Uzaktan atıcı (arbaletçi, tüfekçi)
function aticiG(c) {
  c = Object.assign({ tunik: 0x3a5a8a, silah: 'arbalet' }, c);
  return merge([
    P(BOX(.28, .42, .2), 0x2e2a26, Mx(0, .21, 0)),
    P(CYL(.16, .25, .52, 7), c.tunik, Mx(0, .66, 0)),
    P(SPH(.14, 7, 5), 0xe6c09a, Mx(0, 1.03, 0)),
    P(new THREE.SphereGeometry(.16, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0x8a949e, Mx(0, 1.06, 0)),
    ...(c.silah === 'tufek'
      ? [P(CYL(.035, .045, .9, 6), 0x3a3a40, Mx(0, .9, -.35, 1, 1, 1, Math.PI / 2, 0, 0)), P(BOX(.08, .1, .3), 0x5b3a1e, Mx(0, .86, .05))]
      : [P(BOX(.1, .1, .6), 0x5b3a1e, Mx(0, .86, -.3)), P(BOX(.62, .05, .05), 0x3a2a1a, Mx(0, .88, -.56))])
  ]);
}
const akritG = hafifAtliG({}), sovalyeG = agirAtliG({}), frankG = batiPiyadeG({}), arbaletG = aticiG({});
// Kalkanlı ağır piyade: büyük dikdörtgen kalkan, uzun mızrak
const kalkanliG = merge([
  P(BOX(.32, .44, .22), 0x24262b, Mx(0, .22, 0)),
  P(CYL(.19, .28, .54, 7), (MAC ? FOE1 : 0x8e2a35), Mx(0, .68, 0)),
  P(BOX(.4, .32, .26), 0xa8925a, Mx(0, .84, 0)),
  P(SPH(.14, 7, 5), 0xd9a882, Mx(0, 1.06, 0)),
  P(CONE(.18, .3, 8), 0xa8925a, Mx(0, 1.25, 0)),
  P(BOX(.62, .82, .06), (MAC ? FOE2 : 0x9b1f27), Mx(0, .66, -.26)),
  P(BOX(.5, .08, .07), 0xe3a92b, Mx(0, .66, -.29)),
  P(BOX(.08, .7, .07), 0xe3a92b, Mx(0, .66, -.29)),
  P(BOX(.04, 1.6, .04), 0x5b3a1e, Mx(.3, .95, -.1))
]);
const alanG = hafifAtliG({ at: 0x5a4030, tunik: 0x4a6a3a, kalkan: 0x8a6a3a, mig: 0x6a6a70 });
const macarG = hafifAtliG({ at: 0x3a2a20, tunik: 0x2a7a3a, kalkan: 0xc8303a, mig: 0x9aa3ad });
const sirpSovalyeG = agirAtliG({ ortu: 0xa02a2a, tunik: 0xe8e2d2, kalkan: 0xa02a2a, arma: 0xe8e2d2 });
const latinG = batiPiyadeG({ tunik: 0x8a2a2a, kalkan: 0xd8b040, arma: 0x8a2a2a, sapka: 1 });
const katalanG = batiPiyadeG({ tunik: 0xd8a020, zirh: 0x7a7a80, kalkan: 0xd8a020, arma: 0xb02020 });
const sirpPiyadeG = batiPiyadeG({ tunik: 0xb02a2a, kalkan: 0xa02a2a, arma: 0xe8e2d2, mig: 0x8a949e });
const tufekciG = aticiG({ tunik: 0x5a4a3a, silah: 'tufek' });
const cenevizG = batiPiyadeG({ tunik: 0xe8e2d2, zirh: 0x7a7a80, kalkan: 0xb02a3a, arma: 0xe8e2d2, mig: 0x7a7a80 });
const venedikG = batiPiyadeG({ tunik: 0xa0202a, kalkan: 0xd8b040, arma: 0xa0202a, sapka: 1, mig: 0x5a1a1a });
const arkebuzG = aticiG({ tunik: 0x3a4a6a, silah: 'tufek' });
const hirvatG = batiPiyadeG({ tunik: 0xb02030, zirh: 0x9aa3ad, kalkan: 0xe8e2d2, arma: 0xb02030 });
const rodosG = batiPiyadeG({ tunik: 0x8a1a24, zirh: 0xaab3bb, kalkan: 0x8a1a24, arma: 0xe8e2d2, mig: 0xaab3bb });
const landsknechtG = batiPiyadeG({ tunik: 0xd8b040, zirh: 0x2a2a2a, kalkan: 0x2a2a2a, arma: 0xd8b040, sapka: 1, mig: 0xb02030 });
const zirhliG = agirAtliG({ ortu: 0x9aa3ad, tunik: 0x2a7a3a, kalkan: 0xb02030, arma: 0xe8e2d2 });
const husarG = hafifAtliG({ at: 0x5a3a20, tunik: 0x2a6a3a, kalkan: 0xb02030, mig: 0xc8a040 });
const kirasiyerG = agirAtliG({ ortu: 0x3a3a40, tunik: 0xd8b040, kalkan: 0x1a1a1a, arma: 0xd8b040 });
const muskeciG = aticiG({ tunik: 0x2a3a5a, silah: 'tufek' });
const stradiotG = hafifAtliG({ at: 0x6a4a2a, tunik: 0xa0202a, kalkan: 0xd8b040, mig: 0x8a949e });
const kanatliG = agirAtliG({ ortu: 0xa02a2a, tunik: 0xe8e2d2, kalkan: 0xe8e2d2, arma: 0xa02a2a, kanat: 1 });
const kazakG = hafifAtliG({ at: 0x4a3020, tunik: 0x2a4a8a, kalkan: 0x6a4a2a, mig: 0x2a2a2a });
const rusaskerG = batiPiyadeG({ tunik: 0x2a5a3a, zirh: 0x2a5a3a, kalkan: 0x2a5a3a, arma: 0xb02030, sapka: 1, mig: 0x1a1a1a });
const grenadiyerG = batiPiyadeG({ tunik: 0x2a4a2a, zirh: 0xb02030, kalkan: 0x2a4a2a, arma: 0xd8b040, mig: 0xb02030 });
const avusturyaG = batiPiyadeG({ tunik: 0xece6d6, zirh: 0xece6d6, kalkan: 0xece6d6, arma: 0xb02030, sapka: 1, mig: 0x1a1a1a });
const fransizG = batiPiyadeG({ tunik: 0x2a3a9a, zirh: 0xece6d6, kalkan: 0x2a3a9a, arma: 0xb02030, sapka: 1, mig: 0x1a1a1a });
const fransizSuvariG = agirAtliG({ ortu: 0x2a3a9a, tunik: 0x2a3a9a, kalkan: 0xd8b040, arma: 0xb02030 });
const nisanciG = aticiG({ tunik: 0x3a4a3a, silah: 'tufek' });
const yunanG = batiPiyadeG({ tunik: 0x2a5aa8, zirh: 0x2a5aa8, kalkan: 0x2a5aa8, arma: 0xece6d6, sapka: 1, mig: 0x2a2a3a });
const FOE_GEO = { piyade: piyadeG(), okcu: okcuG, katafrakt: katafraktG, varang: varangG, akrit: akritG, frank: frankG, arbalet: arbaletG, sovalye: sovalyeG, kalkanli: kalkanliG,
  latin: latinG, alan: alanG, katalan: katalanG, sirppiyade: sirpPiyadeG, sirpsovalye: sirpSovalyeG, macar: macarG, tufekci: tufekciG,
  ceneviz: cenevizG, venedik: venedikG, arkebuz: arkebuzG, hirvat: hirvatG, rodos: rodosG, landsknecht: landsknechtG, zirhli: zirhliG, husar: husarG,
  kirasiyer: kirasiyerG, muskeci: muskeciG, stradiot: stradiotG, kanatlihusar: kanatliG, kazak: kazakG, rusasker: rusaskerG, grenadiyer: grenadiyerG,
  avusturyapiyade: avusturyaG, fransizpiyade: fransizG, fransizsuvari: fransizSuvariG, nisanci: nisanciG, yunanpiyade: yunanG };
const ATLI_GEO = { katafrakt: katafraktG, akrit: akritG, sovalye: sovalyeG, alan: alanG, sirpsovalye: sirpSovalyeG, macar: macarG, zirhli: zirhliG, husar: husarG,
  kirasiyer: kirasiyerG, stradiot: stradiotG, kanatlihusar: kanatliG, kazak: kazakG, fransizsuvari: fransizSuvariG };

// Sipahi: kızıl-altın çullu doru at, firuze kaftan, sorguçlu miğfer, yuvarlak kalkan, flamalı mızrak.
// rider=false: binicisiz (Sipahi Gözü görünümünde oyuncu bu atın üstündedir; yalnızca eller ve dizginler görünür)
function sipahiParts(rider) {
  return [
    P(BOX(.44, .48, 1.2), 0x6a3a1e, Mx(0, .94, 0)),
    P(BOX(.5, .24, .78), 0xb3202a, Mx(0, 1.08, .1)), P(BOX(.51, .04, .79), 0xe3a92b, Mx(0, .96, .1)),
    ...[[-.15, .45], [.15, .45], [-.15, -.45], [.15, -.45]].map(([x, z]) => P(BOX(.11, .72, .11), 0x3a2416, Mx(x, .36, z))),
    P(BOX(.22, .5, .3), 0x6a3a1e, Mx(0, 1.34, -.62, 1, 1, 1, -.5, 0, 0)),
    P(BOX(.18, .21, .42), 0x5a301a, Mx(0, 1.58, -.82, 1, 1, 1, -.2, 0, 0)),
    P(BOX(.19, .07, .3), 0xd5dbe0, Mx(0, 1.7, -.84, 1, 1, 1, -.2, 0, 0)),
    P(BOX(.06, .44, .12), 0x1a1210, Mx(0, 1.44, -.5, 1, 1, 1, -.5, 0, 0)),
    P(BOX(.07, .5, .08), 0x1a1210, Mx(0, .86, .66, 1, 1, 1, .35, 0, 0)),
    P(SPH(.07, 6, 4), 0xc8303a, Mx(0, 1.5, -.72)),
    P(BOX(.035, .035, 2.0), 0x6b4a2b, Mx(.24, 1.5, -.5)),
    P(CONE(.04, .2, 4), 0xd5dbe0, Mx(.24, 1.5, -1.6, 1, 1, 1, -Math.PI / 2, 0, 0)),
    P(BOX(.012, .16, .34), 0xc8303a, Mx(.24, 1.58, -1.3)),
    ...[-.1, .1].map(x => P(BOX(.02, .02, .5), 0x3a2416, Mx(x, 1.48, -.42, 1, 1, 1, .32, 0, 0))),
    ...(rider ? [
      P(BOX(.5, .14, .36), ARMY1D, Mx(0, 1.22, .02)),
      P(CYL(.16, .21, .5, 7), ARMY1, Mx(0, 1.52, .02)),
      P(CYL(.2, .2, .06, 7), ARMY2, Mx(0, 1.33, .02)),
      P(SPH(.13, 7, 5), 0xe2b68c, Mx(0, 1.88, .02)),
      P(CYL(.17, .17, .08, 7), 0xf3ead6, Mx(0, 1.96, .02)),
      P(CONE(.15, .34, 7), 0xd5dbe0, Mx(0, 2.15, .02)),
      P(BOX(.04, .24, .04), 0xc8303a, Mx(0, 2.4, .07, 1, 1, 1, .3, 0, 0)),
      P(CYL(.24, .24, .05, 12), ARMY2, Mx(-.27, 1.5, .02, 1, 1, 1, 0, 0, Math.PI / 2)),
      P(SPH(.06, 6, 4), 0xc8303a, Mx(-.3, 1.5, .02))
    ] : [
      ...[-.13, .13].map(x => P(SPH(.055, 6, 4), 0xe2b68c, Mx(x, 1.44, -.24))),
      ...[-.13, .13].map(x => P(BOX(.09, .09, .3), ARMY1, Mx(x * 1.3, 1.48, -.08, 1, 1, 1, .4, 0, 0)))
    ])
  ];
}
const sipahiG = merge(sipahiParts(true)), binekG = merge(sipahiParts(false));
// Serdar: ordunun önünde sancak taşıyan sipahi
const serdarG = merge([...sipahiParts(true), P(BOX(.04, 2.3, .04), 0x5b3a1e, Mx(-.34, 2.3, .2)), P(BOX(.02, .6, .9), 0xb3202a, Mx(-.34, 3.05, .66)),
  P(BOX(.022, .07, .91), 0xe3a92b, Mx(-.34, 2.72, .66)), P(SPH(.07, 6, 4), 0xe3a92b, Mx(-.34, 3.48, .2))]);
const armyMat = new THREE.MeshLambertMaterial({ vertexColors: true });
const goldMat = new THREE.MeshPhongMaterial({ color: 0xe8b33a, specular: 0xfff2b0, shininess: 90, emissive: 0x3d2800 });
const dummy = new THREE.Object3D();
function inst(g, m, n) { const im = new THREE.InstancedMesh(g, m, n); im.castShadow = true; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; im.count = 0; scene.add(im); return im; }
const MAXC = 220, MAXE = 500, MAXA = 280;
const crowdMesh = inst(akinciG, armyMat, MAXC);
const heroMesh = inst(akinciG, goldMat, M.MAX_HERO);
const MAXS = 36, sipahiMesh = inst(sipahiG, armyMat, MAXS);   // ordunun dış halkasında atlı sipahiler
const serdar = new THREE.Mesh(serdarG, armyMat), binek = new THREE.Mesh(binekG, armyMat);   // önde sancaklı serdar; Sipahi Gözü'nde oyuncunun atı
serdar.castShadow = binek.castShadow = true; binek.visible = false; scene.add(serdar); scene.add(binek);
const foeMesh = {}; for (const k in FOE_GEO) foeMesh[k] = inst(FOE_GEO[k], armyMat, MAXE);
const arrowMat = new THREE.MeshBasicMaterial({ color: M.WEAPONS[0].c });
const arrowMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(.07, .07, .8), arrowMat, MAXA); arrowMesh.frustumCulled = false; arrowMesh.count = 0; scene.add(arrowMesh);
const foeArrowMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(.06, .06, .7), new THREE.MeshBasicMaterial({ color: 0x6b1a14 }), 60); foeArrowMesh.frustumCulled = false; foeArrowMesh.count = 0; scene.add(foeArrowMesh);
const OFF = []; for (let i = 0; i < MAXC; i++) { const r = 0.34 * Math.sqrt(i), a = i * 2.39996; OFF.push({ x: Math.cos(a) * r * 0.85, z: Math.sin(a) * r * 1.15, ph: (i * 1.7) % 6.28 }); }

/* tuval dokuları */
function makeLabel(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; return { c, ctx: c.getContext('2d'), tex }; }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function drawBig(L, text, fill = '#fff', stroke = '#16202e', size = 96) {
  const { ctx, c } = L; ctx.clearRect(0, 0, c.width, c.height); let s = size; ctx.font = `800 ${s}px ${FONT}`;
  while (ctx.measureText(text).width > c.width - 30 && s > 30) { s -= 6; ctx.font = `800 ${s}px ${FONT}`; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = stroke; ctx.strokeText(text, c.width / 2, c.height / 2 + 8); ctx.fillStyle = fill; ctx.fillText(text, c.width / 2, c.height / 2 + 8); L.tex.needsUpdate = true;
}
function drawCount(L, n) {
  const { ctx, c } = L; ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = 'rgba(14,14,20,.86)'; rr(ctx, 8, 22, 240, 84, 20); ctx.fill();
  ctx.fillStyle = '#d8323c'; rr(ctx, 24, 44, 40, 40, 8); ctx.fill(); ctx.font = `800 62px ${FONT}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(fmt(n), 152, 70); L.tex.needsUpdate = true;
}
function drawBossBar(L, name, hp, max) {
  const { ctx, c } = L; ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = 'rgba(14,14,20,.88)'; rr(ctx, 6, 6, c.width - 12, c.height - 12, 22); ctx.fill();
  ctx.font = `800 40px ${FONT}`; ctx.fillStyle = '#ffd36b'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name, c.width / 2, 40);
  ctx.fillStyle = '#3a1418'; rr(ctx, 24, 70, c.width - 48, 34, 12); ctx.fill();
  ctx.fillStyle = '#e0343f'; rr(ctx, 24, 70, Math.max(0, (c.width - 48) * hp / max), 34, 12); ctx.fill();
  ctx.font = `800 28px ${FONT}`; ctx.fillStyle = '#fff'; ctx.fillText(fmt(hp), c.width / 2, 89); L.tex.needsUpdate = true;
}
const texCache = {};
function cachedText(text) { if (!texCache[text]) { const L = makeLabel(256, 128); drawBig(L, text); texCache[text] = L.tex; } return texCache[text]; }
function tileTexture() {
  const L = makeLabel(256, 256), { ctx } = L; ctx.fillStyle = '#cbc5bb'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(${90 + Math.random() * 60 | 0},${85 + Math.random() * 50 | 0},${70 + Math.random() * 40 | 0},${Math.random() * 0.08})`; ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3); }
  ctx.strokeStyle = 'rgba(120,112,100,.55)'; ctx.lineWidth = 3; for (let k = 0; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 128, 0); ctx.lineTo(k * 128, 256); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, k * 128); ctx.lineTo(256, k * 128); ctx.stroke(); }
  // Selçuklu yıldızı kakması
  ctx.save(); ctx.translate(128, 128); ctx.fillStyle = 'rgba(31,163,168,.22)';
  for (let r = 0; r < 2; r++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-26, -26, 52, 52); } ctx.restore();
  L.tex.wrapS = L.tex.wrapT = THREE.RepeatWrapping; L.tex.generateMipmaps = true; L.tex.minFilter = THREE.LinearMipmapLinearFilter; L.tex.anisotropy = 4; L.tex.needsUpdate = true; return L.tex;
}
function glowTexture() { const L = makeLabel(128, 128), { ctx } = L; const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(255,240,170,1)'); g.addColorStop(.35, 'rgba(255,200,80,.6)'); g.addColorStop(1, 'rgba(255,180,40,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128); L.tex.needsUpdate = true; return L.tex; }
function puffTexture() { const L = makeLabel(64, 64), { ctx } = L; const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(255,250,235,.95)'); g.addColorStop(1, 'rgba(230,210,170,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64); L.tex.needsUpdate = true; return L.tex; }
const roadTex = tileTexture(), glowTex = glowTexture(), puffTex = puffTexture();
// sancak dokusu: firuze zemin, altın hilal
function flagTexture(bg, fg) { const L = makeLabel(128, 192), { ctx } = L; ctx.fillStyle = bg; ctx.fillRect(0, 0, 128, 192); ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(60, 80, 36, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(74, 74, 31, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = fg; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(0, 150 + i * 14); ctx.lineTo(128, 150 + i * 14); ctx.lineTo(128, 156 + i * 14); ctx.lineTo(0, 156 + i * 14); ctx.fill(); } L.tex.needsUpdate = true; return L.tex; }
// düşman sancağı: hilalsiz; Bizans kızıl-altın baklava, Haçlı mavi-beyaz bölümlü
function enemyFlag(bg, fg, kind) {
  const L = makeLabel(128, 192), { ctx } = L; ctx.fillStyle = bg; ctx.fillRect(0, 0, 128, 192);
  ctx.fillStyle = fg;
  if (kind === 'parti') { ctx.fillRect(0, 0, 64, 96); ctx.fillRect(64, 96, 64, 96); }
  else if (kind === 'serit') { for (let k = 0; k < 4; k++) ctx.fillRect(0, 24 + k * 44, 128, 22); }
  else { ctx.beginPath(); ctx.moveTo(64, 34); ctx.lineTo(100, 84); ctx.lineTo(64, 134); ctx.lineTo(28, 84); ctx.closePath(); ctx.fill(); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(64, 58); ctx.lineTo(82, 84); ctx.lineTo(64, 110); ctx.lineTo(46, 84); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = fg; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 120, 184); L.tex.needsUpdate = true; return L.tex;
}
const flagTex = MAC ? flagTexture(MAC.b1, MAC.b2) : flagTexture('#1fa3a8', '#f0b232');
const ENEMY_FLAG_ASIL = () => [enemyFlag('#8e1f2a', '#e7c56a'), enemyFlag('#6a1b5a', '#e7c56a'), enemyFlag('#2c4f8f', '#ece6d6', 'parti'), enemyFlag('#7a1b2a', '#e7c56a'),
  enemyFlag('#8a2a2a', '#d8b040', 'parti'), enemyFlag('#8e1f2a', '#e7c56a'), enemyFlag('#5a1b4a', '#e7c56a'), enemyFlag('#a02a2a', '#ece6d6', 'serit'),
  enemyFlag('#2c4f8f', '#ece6d6', 'parti'), enemyFlag('#b02030', '#ece6d6', 'serit'),
  enemyFlag('#7a1b2a', '#e7c56a'), enemyFlag('#2a4a8a', '#e7c56a', 'parti'), enemyFlag('#a01a24', '#ece6d6', 'serit'),
  enemyFlag('#2a6a3a', '#ece6d6', 'serit'), enemyFlag('#e0c040', '#1a1a1a', 'parti'),
  enemyFlag('#e0c040', '#1a1a1a', 'parti'), enemyFlag('#a01a24', '#e7c56a'), enemyFlag('#1a1a1a', '#e0c040', 'serit'), enemyFlag('#a01a24', '#e7c56a', 'parti'),
  enemyFlag('#b02030', '#ece6d6', 'serit'), enemyFlag('#2a5a3a', '#ece6d6', 'parti'), enemyFlag('#6a1b5a', '#e7c56a'),
  enemyFlag('#a01a24', '#e7c56a'), enemyFlag('#1a1a1a', '#e0c040', 'serit'), enemyFlag('#e0c040', '#1a1a1a', 'parti'), enemyFlag('#2a3a9a', '#ece6d6', 'serit'),
  enemyFlag('#ece6d6', '#2a4a9a', 'serit'), enemyFlag('#2a5a3a', '#ece6d6', 'parti'), enemyFlag('#2a5aa8', '#ece6d6', 'serit'), enemyFlag('#6a1b5a', '#e7c56a')];
const ENEMY_FLAG = MAC ? ENEMY_FLAG_ASIL().map(() => enemyFlag(MAC.r1, MAC.r2)) : ENEMY_FLAG_ASIL();

/* ================= HAVA, GÜN SAATİ, MEVSİM ================= */
const MOODS = {
  ogle: {},
  sabah: { sky: 0xf4d8c4, tint: 0xffe2cc, t: .2, sun: 0xffd6b0, light: .9, fog: [55, 175] },
  ikindi: { sky: 0xf2d6a2, tint: 0xffe4a8, t: .18, sun: 0xffe2a0, light: .95 },
  aksam: { sky: 0xf0a474, tint: 0xff9a60, t: .3, sun: 0xff9a58, light: .82, fog: [50, 165] },
  gece: { sky: 0x22305a, tint: 0x2a3a6a, t: .55, sun: 0x9ab0f0, light: .5, hemi: .5, fog: [40, 140], torch: 1 },
  bulut: { sky: 0xbcc2c8, tint: 0xa0a6ae, t: .22, sun: 0xe0e6ec, light: .66, fog: [50, 155] },
  yagmur: { sky: 0x939ba4, tint: 0x6a7480, t: .32, sun: 0xc8d0d8, light: .55, hemi: .7, fog: [35, 125], rain: 1 },
  sis: { sky: 0xd8dcdc, tint: 0xd4d8d8, t: .3, sun: 0xf0f0f0, light: .7, fog: [14, 85] },
  bahar: { tint: 0x7ac050, t: .16, bush: 0x5aa03a, crown: 0x3a7a2e, flower: 1 },
  guz: { tint: 0xd08a3a, t: .24, bush: 0xc0702a, crown: 0xb8601e, sky: 0xeedcc0 },
  kis: { sky: 0xdfe6ee, tint: 0xf2f5f8, t: .62, sun: 0xf4f8ff, light: .9, bush: 0x6a7a6a, crown: 0x3a5a4a, snow: 1, fog: [45, 160] }
};
const MOOD_W = [['ogle', 3], ['sabah', 1.1], ['ikindi', 1.1], ['aksam', 1], ['gece', .8, 25], ['bulut', 1, 15], ['yagmur', .8, 20], ['sis', .6, 40], ['bahar', .9, 10], ['guz', .9, 40], ['kis', .7, 60]];
function moodOf(i, T) {
  if (Q.get('hava')) return Q.get('hava');
  if (i === M.NL - 1) return 'sabah';      // fetih şafakta
  if (i === 1070) return 'aksam';            // Malazgirt'e dönüş gün batımında
  if (T.mood) return T.mood;
  if (i < 8) return 'ogle';
  if (T.ground === 0xeef2f6) return 'kis';                     // karlı bölgeler
  const kum = ((T.ground >> 16) & 255) - ((T.ground >> 8) & 255) > 22;   // kumlu, sıcak bölgeler: kar yok
  const opts = MOOD_W.filter(o => i >= (o[2] || 0) && !(kum && (o[0] === 'kis' || o[0] === 'yagmur')));
  const r = mulberry(i * 9973 + 5)() * opts.reduce((a, o) => a + o[1], 0);
  let x = r; for (const o of opts) { x -= o[1]; if (x <= 0) return o[0]; }
  return 'ogle';
}
const _ca = new THREE.Color(), _cb = new THREE.Color();
const mix = (a, b, t) => b === undefined || !t ? a : _ca.set(a).lerp(_cb.set(b), t).getHex();
// yağmur çizgileri ve kar taneleri: kameranın etrafında döner
const PN = 900, precipPos = new Float32Array(PN * 6), precipSeed = [];
for (let k = 0; k < PN; k++) precipSeed.push({ x: (Math.random() - .5) * 60, y: Math.random() * 26, z: -Math.random() * 80 + 14, v: .8 + Math.random() * .4, ph: Math.random() * 6 });
const precipGeo = new THREE.BufferGeometry(); precipGeo.setAttribute('position', new THREE.BufferAttribute(precipPos, 3));
const rainLines = new THREE.LineSegments(precipGeo, new THREE.LineBasicMaterial({ color: 0xb8c8dc, transparent: true, opacity: .55 }));
const snowPts = new THREE.Points(precipGeo, new THREE.PointsMaterial({ color: 0xffffff, size: .32, transparent: true, opacity: .9, depthWrite: false }));
[rainLines, snowPts].forEach(o => { o.frustumCulled = false; o.visible = false; scene.add(o); });
let curMood = 'ogle';
// görüş: 'kus' (kuşbakışı) ya da 'sipahi' (Sipahi Gözü); yalnız bölüm oynanırken at sırtına geçilir
// Sipahi darbesi: at sırtındayken önündeki düşmana kılıç / mızrak vurur (VR'da kumandayı savurarak, ekranda Boşluk / A tuşu / dokunarak).
// Okların yanında ek hasar: bir darbe aşağı yukarı beş ok yaylımı kadardır. Hedef: ordunun önünde, menzildeki en yakın düşman ya da engel.
let darbeT = 0, darbeK = 0;
function darbe(guc) {
  if (!G || mode !== 'play' || paused || darbeT > 0) return null;
  const front = G.z - G.Rz; let best = null, bd = 1e9;
  for (const o of G.objs) {
    if (!o.alive || o.t === 'gecit' || o.t === 'gulle' || o.t === 'tas' || o.t === 'pedestal') continue;
    const dz = front - (o.z + (o.d || 1) / 2), dx = Math.abs(o.x - G.x) - (o.w || 1) / 2;
    if (dz < -1.5 || dz > 9 || dx > 3.5) continue;
    if (dz < bd) { bd = dz; best = o; }
  }
  darbeT = 0.3; darbeK = 1;
  if (!best) { noise(0.06, 0.05, 1400); return false; }
  M.hitObj(G, best, M.totalPow(G) * 0.5 * (guc || 1));
  const hx = best.t === 'squad' ? best.x : G.x, hz = Math.min(front - 1, best.z + (best.d || 1) / 2);
  puff(hx, 1.2, hz, 1.6); SFX.tick(); noise(0.09, 0.09, 420);
  return true;
}
const sipahiGozu = () => window.VR && VR.on ? !!VR.ride : S.view === 'sipahi' && (mode === 'play' || mode === 'dying');
function updatePrecip(dt, cx, cz) {
  const rain = rainLines.visible, snow = snowPts.visible; if (!rain && !snow) return;
  for (let k = 0; k < PN; k++) {
    const p = precipSeed[k]; p.y -= (rain ? 34 : 2.6) * p.v * dt; if (p.y < 0) p.y += 26;
    if (snow) p.ph += dt;
    const x = cx + p.x + (snow ? Math.sin(p.ph) * .6 : 0), z = cz + p.z, o = k * 6;
    precipPos[o] = x; precipPos[o + 1] = p.y; precipPos[o + 2] = z;
    precipPos[o + 3] = x + (rain ? .15 : 0); precipPos[o + 4] = p.y + (rain ? .9 : .01); precipPos[o + 5] = z + (rain ? .3 : 0);
  }
  precipGeo.attributes.position.needsUpdate = true;
}

/* ================= DÜNYA ================= */
const world = new THREE.Group(); scene.add(world);
const levelGroup = new THREE.Group(); scene.add(levelGroup);
let curTheme = -1;
function buildWorld(ti, mood, road) {
  const key = ti + '|' + mood + '|' + road; if (key === curTheme) return; curTheme = key; curMood = mood;
  while (world.children.length) { const c = world.children.pop(); if (c.geometry) c.geometry.dispose(); }
  const B = THEMES[ti], Mo = MOODS[mood] || {}, tt = Mo.t || 0, ro = road - 6;
  const T = Object.assign({}, B, { sky: Mo.sky ? mix(B.sky, Mo.sky, .8) : B.sky, ground: mix(B.ground, Mo.tint, tt), hill: B.hill.map(c => mix(c, Mo.tint, tt)),
    mt: mix(B.mt, Mo.tint, tt * .8), bush: Mo.bush !== undefined ? Mo.bush : mix(B.bush, Mo.tint, tt * .6), sun: Mo.sun || B.sun, hemiG: mix(B.hemiG, Mo.tint, tt) });
  scene.background.set(T.sky); scene.fog.color.set(T.sky); sun.color.set(T.sun); hemi.groundColor.set(T.hemiG);
  const fg = Mo.fog || [70, 200]; scene.fog.near = fg[0]; scene.fog.far = fg[1];
  sun.intensity = 0.82 * (Mo.light || 1); hemi.intensity = 0.78 * (Mo.hemi || Mo.light || 1);
  rainLines.visible = !!Mo.rain; snowPts.visible = !!Mo.snow;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 1600), new THREE.MeshLambertMaterial({ color: T.ground }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.05, -650); world.add(ground);
  if (T.lake) { const lake = new THREE.Mesh(new THREE.PlaneGeometry(260, 1500), new THREE.MeshPhongMaterial({ color: T.lake, shininess: 80, specular: 0x9fd8ff })); lake.rotation.x = -Math.PI / 2; lake.position.set(-170, 0, -650); world.add(lake); }
  if (T.river) { const riv = new THREE.Mesh(new THREE.PlaneGeometry(14, 1500), new THREE.MeshPhongMaterial({ color: T.river, shininess: 60 })); riv.rotation.x = -Math.PI / 2; riv.position.set(24 + ro, 0, -650); world.add(riv); }
  const rnd = mulberry(42 + ti * 11);
  const hillGeo = SPH(1, 12, 8);
  for (let i = 0; i < 70; i++) {
    const side = rnd() < .5 ? -1 : 1; if (T.lake && side < 0 && rnd() < .8) continue; const r = 8 + rnd() * 22;
    const h = new THREE.Mesh(hillGeo, new THREE.MeshLambertMaterial({ color: T.hill[i % 4] })); h.scale.set(r, r * (0.18 + rnd() * 0.22), r * (0.8 + rnd() * 0.6)); h.position.set(side * (30 + rnd() * 120), 0, 40 - rnd() * 1300); world.add(h);
  }
  const mtGeo = CONE(1, 1, 6);
  for (let i = 0; i < (T.mtN || 26); i++) { const side = rnd() < .5 ? -1 : 1; const r = 40 + rnd() * 50; const m = new THREE.Mesh(mtGeo, new THREE.MeshLambertMaterial({ color: T.mt })); m.scale.set(r, r * (0.5 + rnd() * 0.6), r); m.position.set(side * (160 + rnd() * 160), 0, -100 - rnd() * 1300); world.add(m); }
  if (T.peri) {   // peri bacaları / kaya kuleleri
    const coneM = new THREE.MeshLambertMaterial({ color: T.hill[3] }), capM = new THREE.MeshLambertMaterial({ color: T.mt });
    for (let i = 0; i < 46 * T.peri; i++) { const side = rnd() < .5 ? -1 : 1, h = 5 + rnd() * 9, x = side * (14 + ro + rnd() * 60), z = 20 - rnd() * 1300;
      const c = new THREE.Mesh(CONE(1.6 + rnd(), h, 8), coneM); c.position.set(x, h / 2, z); world.add(c);
      const k = new THREE.Mesh(CONE(1.3, 1.4, 8), capM); k.position.set(x, h + 0.3, z); world.add(k); }
  }
  if (T.forest) {   // çam ormanı
    const n = Math.round(260 * T.forest), trunk = new THREE.InstancedMesh(CYL(.18, .22, 1.4, 5), new THREE.MeshLambertMaterial({ color: 0x5a3a22 }), n);
    const crown = new THREE.InstancedMesh(CONE(1.3, 3.4, 7), new THREE.MeshLambertMaterial({ color: Mo.crown || mix(0x2f5a2c, Mo.tint, tt * .5) }), n);
    for (let i = 0; i < n; i++) { const side = rnd() < .5 ? -1 : 1; if (T.lake && side < 0) continue; const x = side * (10 + ro + rnd() * 70), z = 30 - rnd() * 1300, s = 0.8 + rnd() * 0.9;
      dummy.position.set(x, .7 * s, z); dummy.scale.set(s, s, s); dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 2.6 * s, z); dummy.updateMatrix(); crown.setMatrixAt(i, dummy.matrix); }
    world.add(trunk); world.add(crown); dummy.scale.set(1, 1, 1);
  }
  if (T.cliff) {   // yol kenarında kayalıklar
    const rockM = new THREE.MeshLambertMaterial({ color: T.mt });
    for (let i = 0; i < 70 * T.cliff; i++) { const side = rnd() < .5 ? -1 : 1, s = 3 + rnd() * 7; const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), rockM);
      r.scale.set(s, s * (0.8 + rnd() * 1.2), s); r.rotation.set(rnd(), rnd() * 6, rnd()); r.position.set(side * (11 + ro + s * 0.6 + rnd() * 30), s * 0.4, 20 - rnd() * 1300); world.add(r); }
  }
  if (T.sur) {   // uzakta şehir surları ve burçlar
    const wm = new THREE.MeshLambertMaterial({ color: 0xb8a88a }), tm = new THREE.MeshLambertMaterial({ color: 0xa8987a });
    const sx = -(17 + ro + 12 * (1 - T.sur)), n = 26;
    const w = new THREE.Mesh(BOX(2.5, 9, 1300), wm); w.position.set(sx, 4.5, -630); w.receiveShadow = true; world.add(w);
    const w2 = new THREE.Mesh(BOX(2, 6, 1300), wm); w2.position.set(sx + 5, 3, -630); world.add(w2);
    for (let k = 0; k < n; k++) { const z = 30 - k * 50 - rnd() * 8, t = new THREE.Mesh(BOX(5, 14, 5), tm); t.position.set(sx, 7, z); t.castShadow = true; world.add(t);
      for (let c = -1; c <= 1; c += 2) { const m = new THREE.Mesh(BOX(1.2, 1.2, 1.2), tm); m.position.set(sx + c * 1.9, 14.6, z); world.add(m); } }
  }
  const bush = new THREE.InstancedMesh(SPH(.6, 6, 4), new THREE.MeshLambertMaterial({ color: T.bush }), 220);
  for (let i = 0; i < 220; i++) { const side = rnd() < .5 ? -1 : 1; dummy.position.set(side * (8 + ro + rnd() * 26), 0.15, 30 - rnd() * 1300); const s = 0.5 + rnd() * 1.1; dummy.scale.set(s * 1.3, s * 0.6, s); dummy.rotation.set(0, rnd() * 6, 0); dummy.updateMatrix(); bush.setMatrixAt(i, dummy.matrix); }
  world.add(bush); dummy.scale.set(1, 1, 1); dummy.rotation.set(0, 0, 0);
  if (Mo.flower) {   // bahar çiçekleri
    const fl = new THREE.InstancedMesh(SPH(.18, 5, 3), new THREE.MeshLambertMaterial({ color: 0xffffff }), 260), cols = [0xf2d23a, 0xe8505a, 0xf4f0f6, 0xb070e0];
    for (let i = 0; i < 260; i++) { const side = rnd() < .5 ? -1 : 1; dummy.position.set(side * (7.5 + ro + rnd() * 20), .12, 30 - rnd() * 1300); dummy.updateMatrix(); fl.setMatrixAt(i, dummy.matrix); fl.setColorAt(i, new THREE.Color(cols[i % 4])); }
    world.add(fl);
  }
}
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const blockGeo = BOX(1.6, 1.1, 1.0), blockMat = new THREE.MeshLambertMaterial({ color: 0x1fa3a8 }), blockTopMat = new THREE.MeshLambertMaterial({ color: 0x5fd0d4 });
const pedGeo = BOX(2.4, 1.5, 1.5), pedMat = new THREE.MeshLambertMaterial({ color: 0x3f4756 });
const postGeo = CYL(.16, .2, 3.2, 8), postMat = new THREE.MeshLambertMaterial({ color: 0x6b4a2b }), capGeo = SPH(.26, 8, 6);
const capMat = new THREE.MeshPhongMaterial({ color: 0xe8b33a, specular: 0xfff2b0, shininess: 80 });
const hilalGeo = new THREE.TorusGeometry(.32, .07, 6, 14, Math.PI * 1.35);
const stoneMat = new THREE.MeshLambertMaterial({ color: 0x9c8b74 }), stoneDark = new THREE.MeshLambertMaterial({ color: 0x857560 });
const woodMat = new THREE.MeshLambertMaterial({ color: 0x7a5232 }), stakeGeo = CONE(.13, 1.5, 5);

function labelPlane(L, w, h) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, depthWrite: false })); }
function labelSprite(L, sx, sy) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: L.tex, transparent: true, depthWrite: false })); s.scale.set(sx, sy, 1); s.renderOrder = 5; return s; }
function hilalPost(x) {
  const g = new THREE.Group(); const p = new THREE.Mesh(postGeo, postMat); p.position.y = 1.6; p.castShadow = true; g.add(p);
  const c = new THREE.Mesh(capGeo, capMat); c.position.y = 3.3; g.add(c);
  const h = new THREE.Mesh(hilalGeo, capMat); h.position.y = 3.85; h.rotation.z = Math.PI * 0.82; g.add(h);
  g.position.x = x; return g;
}

const VIEW = { objs: new Map(), gates: [] };
function buildLevelView(G) {
  while (levelGroup.children.length) levelGroup.remove(levelGroup.children[0]);
  VIEW.objs.clear(); VIEW.gates = [];
  const mood = moodOf(G.L.i, THEMES[G.L.reg]); buildWorld(G.L.reg, mood, G.road);
  for (const o of G.objs) {
    if (o.t === 'block') {
      const g = new THREE.Group(); const b = new THREE.Mesh(blockGeo, blockMat); b.position.y = .55; b.castShadow = true; b.receiveShadow = true; g.add(b);
      const top = new THREE.Mesh(BOX(1.62, .12, 1.02), blockTopMat); top.position.y = 1.1; g.add(top);
      const lab = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .7), new THREE.MeshBasicMaterial({ map: cachedText('+' + o.reward), transparent: true, depthWrite: false })); lab.position.set(0, .6, .51); g.add(lab);
      g.position.set(o.x, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g });
    } else if (o.t === 'pedestal') {
      const g = new THREE.Group(); const b = new THREE.Mesh(pedGeo, pedMat); b.position.y = .75; b.castShadow = true; b.receiveShadow = true; g.add(b);
      const L = makeLabel(256, 128); drawBig(L, fmt(o.hp)); const lab = labelPlane(L, 2.0, 1.0); lab.position.set(0, .72, .76); g.add(lab);
      const item = new THREE.Group(); item.position.y = 1.5; g.add(item);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 })); glow.scale.set(3.2, 3.2, 1); glow.position.y = o.kind === 'hero' ? 1.6 : 1.0; item.add(glow);
      if (o.kind === 'hero') { const s = new THREE.Mesh(akinciG, goldMat); s.scale.set(2.1, 2.1, 2.1); s.rotation.y = Math.PI; s.castShadow = true; item.add(s); }
      else if (o.kind === 'weapon') {
        const bow = new THREE.Group(); const arc = new THREE.Mesh(new THREE.TorusGeometry(.6, .07, 6, 16, Math.PI), capMat); arc.rotation.z = Math.PI / 2; bow.add(arc);
        bow.add(new THREE.Mesh(BOX(.03, 1.2, .03), new THREE.MeshBasicMaterial({ color: 0xfff6d8 })));
        const ar = new THREE.Mesh(BOX(1.3, .06, .06), new THREE.MeshBasicMaterial({ color: M.WEAPONS[Math.min(o.val, M.WEAPONS.length - 1)].c })); ar.position.x = -.2; bow.add(ar); bow.position.y = 1.0; item.add(bow);
      } else {
        const pole = new THREE.Mesh(CYL(.06, .06, 2.4, 6), postMat); pole.position.y = 1.2; item.add(pole);
        const hair = new THREE.Mesh(CONE(.35, 1.0, 8), new THREE.MeshLambertMaterial({ color: 0x2a1a12 })); hair.position.y = 2.0; hair.rotation.x = Math.PI; item.add(hair);
        const h = new THREE.Mesh(hilalGeo, capMat); h.position.y = 2.7; h.rotation.z = Math.PI * 0.82; item.add(h);
      }
      g.position.set(o.x, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g, L, item, shown: o.hp });
    } else if (o.t === 'barricade' && o.araba) {     // araba tabyası
      const g = new THREE.Group(), tente = new THREE.MeshLambertMaterial({ color: 0x8a7a5a }), teker = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
      for (let k = 0; k < 3; k++) { const x = -o.w / 2 + 1 + k * 2;
        const body = new THREE.Mesh(BOX(1.8, .8, 1.1), woodMat); body.position.set(x, .85, 0); body.castShadow = true; g.add(body);
        const kalkan = new THREE.Mesh(BOX(1.9, .7, .12), tente); kalkan.position.set(x, 1.5, .5); g.add(kalkan);
        [-.65, .65].forEach(dx => { const w = new THREE.Mesh(CYL(.4, .4, .14, 10), teker); w.rotation.x = Math.PI / 2; w.position.set(x + dx, .42, .58); g.add(w); }); }
      const ch = new THREE.Mesh(BOX(o.w, .06, .06), new THREE.MeshLambertMaterial({ color: 0x55585e })); ch.position.set(0, .6, .6); g.add(ch);
      const L = makeLabel(256, 128); drawBig(L, fmt(o.hp), '#ffd9a0'); const lab = labelSprite(L, 2.2, 1.1); lab.position.set(0, 2.6, 0); g.add(lab);
      g.position.set(o.x, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g, L, shown: o.hp });
    } else if (o.t === 'hendek') {      // hendek ve köprü
      const g = new THREE.Group(), hm = new THREE.MeshLambertMaterial({ color: 0x3a2e22 });
      const l = o.bx - o.bw, r = o.bx + o.bw;
      [[-G.road - .2, l], [r, G.road + .2]].forEach(([a, b]) => { if (b - a < .05) return; const t = new THREE.Mesh(BOX(b - a, .08, 2.6), hm); t.position.set((a + b) / 2, .03, 0); g.add(t);
        const su = new THREE.Mesh(BOX(b - a, .02, 2.2), new THREE.MeshPhongMaterial({ color: 0x3a6a80, shininess: 60 })); su.position.set((a + b) / 2, .09, 0); g.add(su); });
      const kopru = new THREE.Mesh(BOX(o.bw * 2, .18, 3.0), woodMat); kopru.position.set(o.bx, .12, 0); kopru.receiveShadow = true; g.add(kopru);
      [-1, 1].forEach(sd => { const rl = new THREE.Mesh(BOX(.1, .5, 3.0), woodMat); rl.position.set(o.bx + sd * o.bw, .4, 0); g.add(rl); });
      const L = makeLabel(256, 128); drawBig(L, t('KÖPRÜ'), '#ffe08a', '#16202e', 80); const lab = labelSprite(L, 2.0, 1.0); lab.position.set(o.bx, 1.6, 0); g.add(lab);
      g.position.set(0, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g });
    } else if (o.t === 'barricade') {
      const g = new THREE.Group(); const beam = new THREE.Mesh(BOX(o.w, .35, .35), woodMat); beam.position.y = .5; beam.castShadow = true; g.add(beam);
      for (let x = -o.w / 2 + .3; x <= o.w / 2 - .2; x += .55) {
        const a = new THREE.Mesh(stakeGeo, woodMat); a.position.set(x, .7, -.1); a.rotation.x = -1.0; a.castShadow = true; g.add(a);
        const b = new THREE.Mesh(stakeGeo, woodMat); b.position.set(x + .27, .7, .1); b.rotation.x = 1.0; g.add(b);
      }
      const L = makeLabel(256, 128); drawBig(L, fmt(o.hp), '#ffd9a0'); const lab = labelSprite(L, 2.2, 1.1); lab.position.set(0, 2.2, 0); g.add(lab);
      g.position.set(o.x, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g, L, shown: o.hp });
    } else if (o.t === 'kervan') {     // ganimet arabası
      const g = new THREE.Group(), body = new THREE.Mesh(BOX(1.9, .9, 2.8), woodMat); body.position.y = 1.0; body.castShadow = true; g.add(body);
      const tent = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.6, 10, 1, false, 0, Math.PI), new THREE.MeshLambertMaterial({ color: 0xe8dcc0 })); tent.rotation.set(Math.PI / 2, 0, Math.PI / 2); tent.position.y = 1.45; g.add(tent);
      [[-1, .9], [1, .9], [-1, -.9], [1, -.9]].forEach(([x, z]) => { const w = new THREE.Mesh(CYL(.45, .45, .16, 10), new THREE.MeshLambertMaterial({ color: 0x3a2a1a })); w.rotation.z = Math.PI / 2; w.position.set(x, .45, z); g.add(w); });
      const chest = new THREE.Mesh(BOX(.9, .5, .7), capMat); chest.position.set(0, 1.7, -1.6); g.add(chest);
      const L = makeLabel(256, 128); drawBig(L, fmt(o.hp), '#ffe08a'); const lab = labelSprite(L, 2.2, 1.1); lab.position.set(0, 3.4, 0); g.add(lab);
      g.position.set(o.x, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g, L, shown: o.hp });
    } else if (o.t === 'tas') {        // mancınık halkası ve düşen taş
      const g = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.RingGeometry(o.r - .25, o.r, 28), new THREE.MeshBasicMaterial({ color: 0xe0343f, transparent: true, opacity: .85, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = .05; g.add(ring);
      const fill = new THREE.Mesh(new THREE.CircleGeometry(o.r - .25, 28), new THREE.MeshBasicMaterial({ color: 0xe0343f, transparent: true, opacity: .18, depthWrite: false }));
      fill.rotation.x = -Math.PI / 2; fill.position.y = .04; g.add(fill);
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), stoneDark); rock.castShadow = true; rock.visible = false; g.add(rock);
      g.position.set(o.x, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g, ring, fill, rock });
    } else if (o.t === 'sur') {        // yolu kesen sur duvarı
      const g = new THREE.Group(); const w = new THREE.Mesh(BOX(o.w + .8, 3.2, 1.4), stoneMat); w.position.y = 1.6; w.castShadow = true; w.receiveShadow = true; g.add(w);
      for (let x = -o.w / 2; x <= o.w / 2 + .01; x += 1.2) { const c = new THREE.Mesh(BOX(.7, .7, 1.45), stoneMat); c.position.set(x, 3.55, 0); g.add(c); }
      const kapi = new THREE.Mesh(BOX(2.2, 2.4, .2), new THREE.MeshLambertMaterial({ color: 0x3a2a20 })); kapi.position.set(0, 1.2, .72); g.add(kapi);
      [-1, 1].forEach(sd => { const t = new THREE.Mesh(CYL(1.0, 1.1, 4.6, 8), stoneDark); t.position.set(sd * (o.w / 2 + .6), 2.3, 0); t.castShadow = true; g.add(t); });
      const L = makeLabel(256, 128); drawBig(L, fmt(o.hp), '#ffd9a0'); const lab = labelSprite(L, 2.6, 1.3); lab.position.set(0, 5.0, 0); g.add(lab);
      g.position.set(0, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g, L, shown: o.hp });
    } else if (o.t === 'gulle') {      // top güllesi ve uyarı şeridi
      const g = new THREE.Group();
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(o.r * 2, 34), new THREE.MeshBasicMaterial({ color: 0xe0343f, transparent: true, opacity: 0, depthWrite: false }));
      lane.rotation.x = -Math.PI / 2; lane.position.set(o.x, .05, o.z + 17); levelGroup.add(lane);
      const ball = new THREE.Mesh(SPH(o.r * .75, 12, 9), new THREE.MeshPhongMaterial({ color: 0x2a2a30, shininess: 70, specular: 0x777777 })); ball.position.y = o.r * .75; ball.castShadow = true; g.add(ball);
      g.position.set(o.x, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g, lane, ball });
    } else if (o.t === 'gecit') {      // dar geçit: iki yanda kaya duvarı
      const g = new THREE.Group(), rockM = new THREE.MeshLambertMaterial({ color: 0x8a7e6e });
      const ww = G.road - o.w + 2.5; [-1, 1].forEach(sd => { const w = new THREE.Mesh(BOX(ww, 4.5, o.len), rockM); w.position.set(sd * (o.w + ww / 2), 2.25, -o.len / 2); w.castShadow = true; w.receiveShadow = true; g.add(w);
        for (let k = 0; k < 5; k++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4 + (k % 2) * .5, 0), stoneDark); r.position.set(sd * (o.w + .9 + (k % 2) * .5), 4.6 + (k % 3) * .3, -k * o.len / 4.5); g.add(r); } });
      const L = makeLabel(512, 128); drawBig(L, t('DAR GEÇİT · {n} kişi sığar', { n: M.gecitCap(o.w) }), '#ffd9a0', '#16202e', 64); const lab = labelSprite(L, 5.4, 1.35); lab.position.set(0, 5.2, 0); g.add(lab);
      g.position.set(0, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g });
    } else if (o.t === 'squad') {
      const L = makeLabel(256, 128); drawCount(L, o.n); const spr = labelSprite(L, o.final ? 3.2 : 2.4, o.final ? 1.6 : 1.2); levelGroup.add(spr);
      VIEW.objs.set(o, { spr, L, shown: o.n, seed: Math.random() * 100 });
    } else if (o.t === 'boss') {
      const B = M.BOSSES[o.id];
      const atli = !!M.FOES[B.tip].atli;
      const geo = atli ? ATLI_GEO[B.tip] : B.tip === 'piyade' ? piyadeG(MAC ? dk(FOE1, .8) : B.renk, 0xc9a24a) : FOE_GEO[B.tip];
      const m = new THREE.Mesh(geo, armyMat); const sc = atli ? 2.6 : 3.4; m.scale.set(sc, sc, sc); m.rotation.y = Math.PI; m.castShadow = true;
      const g = new THREE.Group(); g.add(m);
      const crown = new THREE.Mesh(CYL(.5, .4, .3, 8), capMat); crown.position.y = (atli ? 2.3 : 1.55) * sc; g.add(crown);
      const L = makeLabel(512, 128); drawBossBar(L, B.ad, o.hp, o.max); const spr = labelSprite(L, 5.2, 1.3); spr.position.y = (atli ? 2.3 : 1.6) * sc + 1.6; g.add(spr);
      g.position.set(o.x, 0, o.z); levelGroup.add(g); VIEW.objs.set(o, { g, L, shown: o.hp, m, base: sc });
    }
  }
  for (const gt of G.gates) {
    const g = new THREE.Group(); const panels = [];
    const n = gt.opts.length, lw = 2 * G.road / n;
    gt.opts.forEach((op, k) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(lw - .4, 2.6), new THREE.MeshBasicMaterial({ map: gateTex(op), transparent: true, depthWrite: false, side: THREE.DoubleSide })); p.position.set(-G.road + (k + .5) * lw, 1.7, 0); g.add(p); panels.push(p); });
    for (let k = 0; k <= n; k++) g.add(hilalPost(-G.road + k * lw));
    g.position.z = gt.z; levelGroup.add(g); VIEW.gates.push({ gt, panels, anim: -1, t: 0 });
  }
  // Bizans kalesi (bölüm sonu)
  const fz = G.L.endZ - 12, f = new THREE.Group();
  const wall = new THREE.Mesh(BOX(34, 6, 2.2), stoneMat); wall.position.y = 3; wall.castShadow = true; wall.receiveShadow = true; f.add(wall);
  const cg = BOX(.8, .8, 2.3); for (let x = -16.5; x <= 16.6; x += 1.5) { const c = new THREE.Mesh(cg, stoneMat); c.position.set(x, 6.4, 0); f.add(c); }
  [-8, 8].forEach(x => { const t = new THREE.Mesh(CYL(2.4, 2.6, 9, 10), stoneDark); t.position.set(x, 4.5, 0); t.castShadow = true; f.add(t); for (let a = 0; a < 10; a++) { const c = new THREE.Mesh(BOX(.7, .8, .7), stoneDark); const an = a / 10 * Math.PI * 2; c.position.set(x + Math.cos(an) * 2.2, 9.4, Math.sin(an) * 2.2); f.add(c); } });
  const gate = new THREE.Mesh(BOX(4.4, 4.4, .3), new THREE.MeshLambertMaterial({ color: 0x3a2a20 })); gate.position.set(0, 2.2, 1.15); f.add(gate);
  const banners = [];[-4, 4, -12.5, 12.5].forEach(x => { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.6), new THREE.MeshLambertMaterial({ map: ENEMY_FLAG[G.L.sf], side: THREE.DoubleSide })); b.position.set(x, 4.2, 1.15); f.add(b); banners.push(b); });
  f.position.z = fz; levelGroup.add(f); VIEW.fort = { gate, banners };
  // yol ve kenar taşları
  const len = G.L.len + 60, cz = 20 - len / 2;
  roadTex.repeat.set(3, len / 4);
  roadTex.repeat.set(G.lanes * 1.5, len / 4);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(G.road * 2, len), new THREE.MeshLambertMaterial({ map: roadTex, color: mood === 'gece' ? 0x8a96b8 : mood === 'yagmur' ? 0xb8bcc4 : mood === 'kis' ? 0xf0f4f8 : 0xffffff })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, cz); road.receiveShadow = true; levelGroup.add(road);
  [-1, 1].forEach(s => { const w = new THREE.Mesh(BOX(.6, .7, len), stoneMat); w.position.set(s * (G.road + .3), .35, cz); w.receiveShadow = true; levelGroup.add(w); });
  // yol boyu sancaklar
  for (let z = -10; z > G.L.endZ; z -= 40) [-1, 1].forEach(s => { const p = new THREE.Group(); const pole = new THREE.Mesh(CYL(.07, .07, 4, 6), postMat); pole.position.y = 2; p.add(pole); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.6), new THREE.MeshLambertMaterial({ map: flagTex, side: THREE.DoubleSide })); fl.position.set(s * -.6, 3.1, 0); p.add(fl);
    if ((MOODS[mood] || {}).torch && S.q !== 'dusuk') { const fire = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffa040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fire.scale.set(2.4, 2.4, 1); fire.position.y = 4.2; p.add(fire); }
    p.position.set(s * (G.road + 1.4), 0, z); levelGroup.add(p); });
  arrowMat.color.set(M.WEAPONS[0].c);
  DEAD.length = 0; lostSeen = G.lost; lossPop = 0;
}
const GULLE_SPIN = 14;
const SYM = { '+': '+', 'x': '×', '-': '−', '/': '÷' };
const gateCache = {};
function gateTex(o) {
  const key = o.op + o.v; if (gateCache[key]) return gateCache[key];
  const good = o.op === '+' || o.op === 'x'; const L = makeLabel(256, 128), { ctx } = L;
  ctx.fillStyle = good ? 'rgba(31,163,168,0.62)' : 'rgba(200,48,58,0.62)'; rr(ctx, 4, 4, 248, 120, 16); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,.85)'; rr(ctx, 6, 6, 244, 116, 14); ctx.stroke();
  ctx.font = `800 84px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(16,32,46,.75)'; const t = SYM[o.op] + o.v; ctx.strokeText(t, 128, 72); ctx.fillStyle = '#fff'; ctx.fillText(t, 128, 72); L.tex.needsUpdate = true;
  return gateCache[key] = L.tex;
}

/* toz bulutları */
const puffs = []; for (let i = 0; i < 70; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; scene.add(s); puffs.push({ s, life: 0, size: 1 }); }
let puffI = 0;
function puff(x, y, z, size = 1.2) { const p = puffs[puffI++ % puffs.length]; p.s.position.set(x, y, z); p.life = 0.45; p.size = size; p.s.visible = true; }

/* ================= EKRAN YARDIMCILARI ================= */
const pops = $('pops'); const _v = new THREE.Vector3();
function toScreen(x, y, z) { _v.set(x, y, z).project(camera); return { x: (_v.x * 0.5 + 0.5) * window.innerWidth, y: (-_v.y * 0.5 + 0.5) * window.innerHeight, vis: _v.z < 1 }; }
function popup(text, x, y, z, cls = '') { const p = toScreen(x, y, z); const d = document.createElement('div'); d.className = 'pop ' + cls; d.textContent = text; d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; pops.appendChild(d); setTimeout(() => d.remove(), 1150); }
function banner(text, sub) { const old = $('banner'); if (old) old.remove(); const d = document.createElement('div'); d.id = 'banner'; d.innerHTML = text + (sub ? '<small>' + sub + '</small>' : ''); document.body.appendChild(d); setTimeout(() => d.remove(), 2300); }
const starHtml = (n, total = 3) => { let s = ''; for (let k = 0; k < total; k++) s += '<i class="star' + (k < n ? '' : ' off') + '" style="animation-delay:' + (0.25 + k * 0.25) + 's"></i>'; return s; };

/* ================= OYUN DURUMU ================= */
let G = null, mode = 'menu', paused = false, hintT = 0, camX = 0, camZ = 0, lastRes = null, firstWin = false;
function startGame(i) {
  G = M.newGame(i, S.up); buildLevelView(G); camX = 0; camZ = 0;
  mode = 'play'; paused = false; hintT = i === 0 ? 3.2 : 0;
  show(null); $('hLvl').textContent = t('Bölüm {n}', { n: i + 1 }); updateWeapon();
  drumOn = true; drumT = 0.3; unlockAudio();
  if (MAC) { $('hLvl').textContent = MAC.bk + ' – ' + MAC.rk; banner(MAC.bk + ' ordusu', MAC.rk + ' kalesine'); } else banner(G.L.ad, M.REGIONS[G.L.reg].ad);
}
function previewLevel(i) { G = M.newGame(i, S.up); buildLevelView(G); camX = 0; camZ = 0; mode = 'menu'; drumOn = false; }
function updateWeapon() { const w = M.WEAPONS[G.wTier]; $('weapon').innerHTML = w.ad + '<small>×' + D.dec(w.m) + '</small>'; arrowMat.color.set(w.c); }

/* girdi: parmağını kaydır */
let drag = false, lx = 0, keyDir = 0;
let tapT = 0, tapX = 0;
window.addEventListener('pointerdown', e => { unlockAudio(); if (mode !== 'play' || paused) return; drag = true; lx = e.clientX; tapT = performance.now(); tapX = e.clientX; });
// Sipahi Gözü'nde kısa dokunuş (kaydırmadan) = darbe
window.addEventListener('pointerup', e => { if (sipahiGozu() && performance.now() - tapT < 220 && Math.abs(e.clientX - tapX) < 10 && e.target.tagName !== 'BUTTON') darbe(); });
window.addEventListener('pointermove', e => { if (!drag || !G) return; const dx = e.clientX - lx; lx = e.clientX; G.tx += dx / Math.min(window.innerWidth, 520) * 13; });
['pointerup', 'pointercancel'].forEach(t => window.addEventListener(t, () => drag = false));
window.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'a') keyDir = -1; if (e.key === 'ArrowRight' || e.key === 'd') keyDir = 1; if (e.key === 'Escape') { if (mode === 'play' && !paused) pause(true); else if (curScr && curScr !== 'menu') padBack(); } if (e.key === 'F11' && HOST) { e.preventDefault(); S.fs = S.fs ? 0 : 1; persist(); applyFullscreen(); } });
window.addEventListener('keyup', e => { if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) keyDir = 0; });
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'play' && !paused) pause(true); });

function handleEvents() {
  for (const e of G.events) {
    switch (e.type) {
      case 'gain': popup('+' + e.v, e.x, 1.8, e.z); SFX.gain(); break;
      case 'loot': popup(t('+{n} akçe', { n: e.v }), e.x, 3, e.z, 'gold'); SFX.buy(); break;
      case 'tas': { const v = VIEW.objs.get(e.o); if (v) { v.g.visible = false; } puff(e.o.x, .8, e.o.z, 3.4); puff(e.o.x + 1, 1.2, e.o.z, 2.4); noise(0.3, 0.2, 300); tone(90, 0.3, 'sine', 0.15, 0.5);
        if (e.v) { lossShown += e.v; popup('−' + e.v, G.x, 2.6, G.z, 'bad'); if (navigator.vibrate) try { navigator.vibrate(40); } catch (x) {} } break; }
      case 'gate': { popup((e.d >= 0 ? '+' : '') + e.d, e.x, 2.5, e.z - 1, e.d >= 0 ? '' : 'bad'); e.d >= 0 ? SFX.good() : SFX.bad(); const v = VIEW.gates.find(v => v.gt === e.g); if (v) { v.anim = e.g.idx; v.t = 0; } break; }
      case 'weapon': popup(M.WEAPONS[e.w].ad + '!', e.x, 3, e.z, 'gold'); SFX.weapon(); updateWeapon(); break;
      case 'hero': popup(t('Altın Alp katıldı!'), e.x, 3.2, e.z, 'gold'); if (G.heroes >= 3) achieve('ALP3'); SFX.hero(); break;
      case 'troops': popup(t('+{n} akıncı', { n: e.v }), e.x, 3, e.z, 'gold'); SFX.good(); break;
      case 'gulleWarn': tone(70, 0.25, 'sine', 0.12, 0.4); noise(0.2, 0.12, 200); break;
      case 'crash': lossShown += e.v; popup((e.gecit ? t('Sıkıştı −') : e.hendek ? t('Hendek −') : e.gulle ? t('Gülle −') : '−') + e.v, e.x, 2.4, e.z, 'bad'); SFX.crash(); if (navigator.vibrate) try { navigator.vibrate(30); } catch (x) {} break;
      case 'break': { const v = VIEW.objs.get(e.o); if (v) v.die = 0.3; puff(e.o.x, 1, e.o.z, 2.4); puff(e.o.x + .6, 1.4, e.o.z, 1.8); SFX.break(); break; }
      case 'hit': SFX.tick(); if (Math.random() < .4) puff(e.x + (Math.random() - .5) * 2, .8, e.z, .9); break;
      case 'clash': SFX.tick(); if (Math.random() < .5) puff(e.x + (Math.random() - .5) * 2.5, .9, e.z, 1.4); break;
      case 'bossHit': if (Math.random() < .3) { puff(e.x + (Math.random() - .5) * 2, 1, e.z, 1.6); noise(0.1, 0.06, 600); } break;
      case 'win': VIEW.fort.banners.forEach(b => { b.material.map = flagTex; b.material.needsUpdate = true; }); VIEW.fort.gate.visible = false; davul(0, true); break;
    }
  }
}

function macFinish(win) {
  mode = 'over'; drumOn = false;
  const stars = win ? M.starsOf(G) : 0, prog = win ? 1 : M.progress(G), [f, a] = macScore(win, stars, prog);
  const line = '<b>' + MAC.bk + ' ' + f + ' - ' + a + ' ' + MAC.rk + '</b>';
  MAC.res = { win, stars, prog };
  if (win) {
    $('wTitle').textContent = 'ZAFER!'; $('wStars').innerHTML = starHtml(stars);
    $('wStats').innerHTML = line + '<br>' + MAC.rakip + ' kalesi düştü.<br>Sağ kalan akıncı: <b>' + G.count + '</b> · Dağıtılan rakip askeri: <b>' + fmt(G.kills) + '</b>';
    show('win'); fanfare(); for (let k = 0; k < stars; k++) setTimeout(() => SFX.star(k), 300 + k * 250);
  } else {
    $('lTip').innerHTML = line + '<br>Kaleye %' + Math.round(prog * 100) + ' yaklaştın. ' + (prog >= .8 ? 'Kıl payı: maç berabere yazıldı.' : 'Bir dahaki hafta takım konuşmasıyla odağı yükselt.');
    show('lose'); sadHorn();
  }
}
function finish(win) {
  if (MAC) { macFinish(win); return; }
  mode = 'over'; drumOn = false;
  const i = G.i, before = S.stars[i] || 0;
  firstWin = win && !before;
  const gain = M.rewardOf(G, win, firstWin);
  S.coins += gain;
  let stars = 0;
  if (win) { stars = M.starsOf(G); S.stars[i] = Math.max(before, stars); if (S.unlocked < i + 2) S.unlocked = Math.min(NL, i + 2); }
  persist();
  lastRes = { i, win, stars, gain };
  if (win) {
    const sfi = M.seferOf(i), SF = M.SEFERLER[sfi], last = i === M.SEF0[sfi] + SF.n - 1;
    $('wTitle').textContent = last ? SF.zafer : t('ZAFER!');
    $('wStars').innerHTML = starHtml(stars);
    $('wStats').innerHTML = (last ? '' : t('{a} geçildi.', { a: G.L.ad }) + '<br>') + t('Sağ kalan akıncı') + ': <b>' + G.count + '</b>' + (G.heroes ? ' · ' + t('Altın Alp') + ': <b>' + G.heroes + '</b>' : '') + '<br>' + t('Dağıtılan düşman askeri') + ': <b>' + fmt(G.kills) + '</b>' + (G.loot ? '<br>' + t('Kervan ganimeti') + ': <b>' + G.loot + ' ' + t('akçe') + '</b>' : '') + (!last && canUpgrade() ? '<br><span class="hint">' + t('Ordugâh\'ta yeni geliştirme alabilirsin!') + '</span>' : '');
    winAchievements(i, stars, last, sfi);
    $('wEpi').hidden = !last;
    if (last) $('wEpi').textContent = SF.epilog + (i < NL - 1 ? t(' Sıradaki sefer: {a}!', { a: M.SEFERLER[sfi + 1].ad }) : t(' Yeni seferler pek yakında: hedef 1923 bölüm.'));
    $('wGain').textContent = gain;
    $('wNext').textContent = t(i === NL - 1 ? 'SEFER HARİTASI' : last ? 'YENİ SEFER' : 'DEVAM');
    show('win'); fanfare(); for (let k = 0; k < stars; k++) setTimeout(() => SFX.star(k), 300 + k * 250);
  } else {
    let tip;
    if (G.wTier === 0 && G.L.objs.some(o => o.t === 'pedestal')) tip = t('Kaideleri okla sıfırla: daha güçlü bir yay, ordunun gücünü katlar.');
    else if (G.peak < 30) tip = t('Kapılarda doğru tarafı seç. Ordun büyük olmadan bölüm sonuna varma.');
    else if (G.L.boss) tip = t('Dev, ok gücünle eriyor. Ordugâh\'ta Ok Ucu ve Kemankeşhane\'yi geliştir.');
    else tip = t('Ordugâh\'ta akıncılarını güçlendir ya da eski bölümleri yıldızlayıp akçe topla.');
    $('lTip').textContent = tip; $('lGain').textContent = gain;
    show('lose'); sadHorn();
  }
}

/* ================= EKRANLAR ================= */
const SCR = { menu: 'scrMenu', levels: 'scrLevels', camp: 'scrCamp', brief: 'scrBrief', pause: 'scrPause', win: 'scrWin', lose: 'scrLose', set: 'scrSet', full: 'scrFull' };
let curScr = 'menu';
function show(n) {
  for (const k in SCR) $(SCR[k]).hidden = k !== n;
  curScr = n;
  const playing = n === null || n === 'pause';
  $('hud').hidden = !playing; $('weapon').hidden = !playing; $('sndBtn').hidden = !(n === 'menu' || n === 'pause'); $('setBtn').hidden = !(n === 'menu' || n === 'pause') || !!MAC;
  if (n === 'set') renderSet();
  setTimeout(() => { const sc = n && $(SCR[n]); if (sc && padActive) { const b = sc.querySelector('.big:not([hidden]),button:not([disabled]):not([hidden])'); if (b) b.focus(); } }, 30);
  if (n === 'menu') renderMenu(); if (n === 'levels') renderLevels(); if (n === 'camp') renderCamp();
}
const upCapNow = () => M.upCap(M.seferOf(Math.min(NL, S.unlocked) - 1));
const canUpgrade = () => M.UPG.some(u => S.up[u.k] < upCapNow() && S.coins >= M.upCost(u, S.up[u.k]));
let campFrom = 'menu';
function openCamp(from) { campFrom = from; show('camp'); }
const nextLevel = () => Math.min(NL - 1, S.unlocked - 1);
function renderMenu() {
  const i = nextLevel(); $('mCoins').textContent = S.coins; $('mStars').textContent = t('{a} / {b} yıldız', { a: totalStars(), b: NL * 3 });
  $('bPlaySub').textContent = t('Bölüm {n}', { n: i + 1 }) + ' · ' + M.LEVELS[i].ad; $('creditEn').textContent = D.lang === 'en' ? 'A Mr. Anduv! production.' : '';
  $('bCamp').classList.toggle('notify', canUpgrade());
}
let regionSel = -1, seferSel = -1;
const sefOfReg = r => M.seferOf(M.REG0[r]);
function renderLevels() {
  if (regionSel < 0) regionSel = M.regionOf(nextLevel());
  if (seferSel < 0) seferSel = sefOfReg(regionSel);
  $('lStars').textContent = totalStars() + ' / ' + NL * 3;
  $('sPrev').disabled = seferSel === 0; $('sNext').disabled = seferSel >= NSF;
  const grid = $('grid'), tabs = $('tabs'); grid.innerHTML = ''; tabs.innerHTML = '';
  if (seferSel >= NSF) {     // yakında
    $('sName').textContent = M.SOON.ad; $('sSub').textContent = t('Sıradaki sefer');
    $('regionHead').textContent = '';
    grid.innerHTML = '<div class="soon" style="grid-column:1/-1"><h3>' + t('Pek yakında') + '</h3><p>' + t('Bin dört yüz elli üç bölümün hepsini bitirdin! Yeni seferler güncellemelerle geliyor: hedef 1923 bölüm. Bu arada eski bölümleri yıldızla, Ordugâh\'ı güçlendir.') + '</p></div>';
    return;
  }
  const SF = M.SEFERLER[seferSel];
  $('sName').textContent = t('{n}. Sefer: {a}', { n: seferSel + 1, a: SF.ad }); $('sSub').textContent = SF.yil + ' · ' + SF.alt;
  if (sefOfReg(regionSel) !== seferSel) regionSel = M.SEFR0[seferSel];
  for (let r = M.SEFR0[seferSel]; r < M.SEFR0[seferSel] + SF.nb; r++) {
    const R = M.REGIONS[r], r0 = M.REG0[r], rn = M.regLen(r), lock = r0 + 1 > S.unlocked; let st = 0; for (let k = 0; k < rn; k++) st += S.stars[r0 + k] || 0;
    const b = document.createElement('button'); b.className = 'tab' + (lock ? ' locked' : ''); b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', r === regionSel);
    b.innerHTML = R.ad + '<small>' + (lock ? t('Kilitli') : t('{a} / {b} yıldız', { a: st, b: rn * 3 })) + '</small>';
    b.addEventListener('click', () => { SFX.click(); regionSel = r; renderLevels(); });
    tabs.appendChild(b);
  }
  $('regionHead').textContent = M.REGIONS[regionSel].alt;
  const selTab = tabs.querySelector('[aria-selected="true"]'); if (selTab) tabs.scrollLeft = Math.max(0, selTab.offsetLeft - (tabs.clientWidth - selTab.offsetWidth) / 2);
  for (let k = 0; k < M.regLen(regionSel); k++) {
    const i = M.REG0[regionSel] + k, L = M.LEVELS[i], lock = i + 1 > S.unlocked;
    const b = document.createElement('button'); b.className = 'lv' + (lock ? ' lock' : '') + (i === nextLevel() && !lock ? ' cur' : '');
    let inner = '';
    if (L.boss) { const bo = L.objs.find(o => o.t === 'boss'); inner += '<span class="tag">' + M.BOSSES[bo.id].ad.toLocaleUpperCase(D.lang) + '</span>'; }
    inner += '<span class="n">' + (lock ? '<svg width="22" height="26" viewBox="0 0 22 26" aria-label="' + t('kilitli') + '"><rect x="2" y="11" width="18" height="14" rx="3" fill="currentColor"/><path d="M6 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="3" fill="none"/></svg>' : (i + 1)) + '</span><span class="nm">' + L.ad + '</span><span class="st">' + starHtml(S.stars[i] || 0).replace(/ style="[^"]*"/g, '') + '</span>';
    b.innerHTML = inner; b.disabled = lock; b.setAttribute('aria-label', t('Bölüm {n}', { n: i + 1 }) + ', ' + L.ad + (lock ? ', ' + t('kilitli') : '')); if (!lock && !canPlay(i)) b.classList.add('pay');
    if (!lock) b.addEventListener('click', () => { SFX.click(); openBrief(i); });
    grid.appendChild(b);
  }
}
function renderCamp() {
  $('cCoins').textContent = S.coins;
  const camp = $('camp'); camp.innerHTML = '';
  M.UPG.forEach(u => {
    const cap = upCapNow(), l = S.up[u.k], max = l >= cap, cost = max ? 0 : M.upCost(u, l);
    const card = document.createElement('div'); card.className = 'card';
    let pips = ''; for (let k = 0; k < cap; k++) pips += '<i' + (k < l ? ' class="on"' : '') + '></i>';
    card.innerHTML = '<h3>' + u.ad + '</h3><div class="lvl">' + t('SEVİYE {a} / {b}', { a: l, b: cap }) + '</div><div class="pips">' + pips + '</div><div class="d">' + u.desc(l) + (max ? '' : '<br><b>' + t('Sonraki: ') + u.desc(l + 1) + '</b>') + '</div>';
    const b = document.createElement('button'); b.className = 'buy'; b.disabled = max || S.coins < cost;
    const capTxt = t(cap < M.UPMAX ? 'YENİ SEFERDE AÇILIR' : 'EN ÜST SEVİYE');
    b.innerHTML = max ? capTxt : '<b class="akce"></b>' + fmt(cost); b.setAttribute('aria-label', max ? u.ad + ': ' + capTxt.toLocaleLowerCase(D.lang) : t('{a} geliştir, {b} akçe', { a: u.ad, b: cost }));
    b.addEventListener('click', () => { if (max || S.coins < cost) return; S.coins -= cost; S.up[u.k]++; if (S.up[u.k] >= M.UPMAX) achieve('ORDUGAH'); persist(); SFX.buy(); renderCamp(); if (mode === 'menu') previewLevel(nextLevel()); });
    card.appendChild(b); camp.appendChild(card);
  });
}
let briefI = 0;
function canPlay(i) { return S.full || i < freeLim() || !!MAC; }
function openBrief(i) {
  if (!canPlay(i)) { openFull(); return; }
  briefI = i; const L = M.LEVELS[i], R = M.REGIONS[L.reg];
  $('scrBrief').querySelector('.topbar h2').textContent = t('Bölüm {a} / {b}', { a: i + 1, b: NL });
  $('brReg').textContent = M.SEFERLER[L.sf].ad + ' · ' + R.ad; $('brName').textContent = L.ad; $('brText').textContent = L.brief;
  $('brStars').innerHTML = starHtml(S.stars[i] || 0).replace(/ style="[^"]*"/g, '');
  const kinds = new Set(); let boss = null; L.objs.forEach(o => { if (o.t === 'squad') kinds.add(o.ft); if (o.t === 'boss') boss = o; });
  let chips = ''; kinds.forEach(k => chips += '<span class="chip">' + M.FOES[k].ad + '</span>'); if (boss) chips += '<span class="chip boss">' + M.BOSSES[boss.id].ad + '</span>';
  $('brFoes').innerHTML = chips;
  $('brCamp').hidden = !canUpgrade();
  previewLevel(i); show('brief');
}
function pause(on) { if (mode !== 'play') return; paused = on; drag = false; show(on ? 'pause' : null); drumOn = !on; }

document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { SFX.click(); const g = b.dataset.go; if (g === 'menu') { previewLevel(nextLevel()); } show(g); }));
$('bPlay').addEventListener('click', () => { unlockAudio(); SFX.click(); openBrief(nextLevel()); });
$('bLevels').addEventListener('click', () => { SFX.click(); regionSel = -1; seferSel = -1; show('levels'); });
$('sPrev').addEventListener('click', () => { SFX.click(); seferSel = Math.max(0, seferSel - 1); regionSel = M.SEFR0[seferSel]; renderLevels(); });
$('sNext').addEventListener('click', () => { SFX.click(); seferSel = Math.min(NSF, seferSel + 1); regionSel = M.SEFR0[Math.min(seferSel, NSF - 1)]; renderLevels(); });
$('bCamp').addEventListener('click', () => { SFX.click(); openCamp('menu'); });
$('brCamp').addEventListener('click', () => { SFX.click(); openCamp('brief'); });
$('cBack').addEventListener('click', () => { SFX.click(); if (campFrom === 'brief') openBrief(briefI); else { previewLevel(nextLevel()); show('menu'); } });
$('bStart').addEventListener('click', () => { unlockAudio(); startGame(briefI); });
$('pauseBtn').addEventListener('click', () => { SFX.click(); pause(true); });
// görüş değiştir: Kuşbakışı ⇄ Sipahi Gözü (oyun sırasında da)
function setView(v) { S.view = v; persist(); drawViewBtn(); if (curScr === 'set') renderSet(); }
function drawViewBtn() { const fp = S.view === 'sipahi'; $('viewBtn').textContent = fp ? '🦅' : '🐎'; $('viewBtn').setAttribute('aria-label', t(fp ? 'Kuşbakışı görüş' : 'Sipahi Gözü')); }
$('viewBtn').addEventListener('click', e => { e.stopPropagation(); SFX.click(); setView(S.view === 'sipahi' ? 'kus' : 'sipahi'); });
$('viewBtn').addEventListener('pointerdown', e => e.stopPropagation());
$('setView').addEventListener('click', e => { const v = e.target.dataset && e.target.dataset.v; if (!v) return; SFX.click(); setView(v); });
window.addEventListener('keydown', e => { if ((e.key === 'v' || e.key === 'V') && mode === 'play') setView(S.view === 'sipahi' ? 'kus' : 'sipahi'); if (e.key === ' ' && sipahiGozu()) { e.preventDefault(); darbe(); } });
drawViewBtn();
$('pResume').addEventListener('click', () => { SFX.click(); pause(false); });
$('pRestart').addEventListener('click', () => { SFX.click(); startGame(G.i); });
$('pMenu').addEventListener('click', () => { SFX.click(); previewLevel(nextLevel()); show('menu'); });
$('wNext').addEventListener('click', () => { SFX.click(); if (lastRes.i >= NL - 1) { seferSel = NSF; show('levels'); } else openBrief(lastRes.i + 1); });
$('wRetry').addEventListener('click', () => { SFX.click(); startGame(lastRes.i); });
$('wMenu').addEventListener('click', () => { SFX.click(); previewLevel(nextLevel()); show('menu'); });
$('lRetry').addEventListener('click', () => { SFX.click(); startGame(lastRes.i); });
$('lCamp').addEventListener('click', () => { SFX.click(); briefI = lastRes.i; openCamp('brief'); });
$('lMenu').addEventListener('click', () => { SFX.click(); previewLevel(nextLevel()); show('menu'); });

/* ================= AYARLAR ================= */
let setFrom = 'menu';
$('setBtn').addEventListener('click', () => { SFX.click(); setFrom = curScr || 'menu'; show('set'); });
function segOn(id, v) { $(id).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === String(v))); }
function renderSet() {
  segOn('setLang', D.lang); segOn('setView', S.view === 'sipahi' ? 'sipahi' : 'kus'); segOn('setQ', S.q); segOn('setFs', S.fs ? 1 : 0);
  $('setSfx').value = S.vol.sfx; $('setMus').value = S.vol.mus;
  $('setFsRow').hidden = !(HOST || document.fullscreenEnabled) || D.platform === 'android' || D.platform === 'ios';
  $('setFullRow').hidden = !PAID;
  $('setBuy').hidden = !!S.full;
  $('setQuit').hidden = !(HOST && HOST.quit);
}
$('setLang').addEventListener('click', e => { const v = e.target.dataset && e.target.dataset.v; if (!v) return; SFX.click(); S.lang = v; D.setLang(v); persist(); drawSnd(); renderSet(); if (G && mode === 'menu') previewLevel(nextLevel()); });
$('setQ').addEventListener('click', e => { const v = e.target.dataset && e.target.dataset.v; if (!v) return; SFX.click(); S.q = v; persist(); applyQuality(); renderSet(); curTheme = -1; if (G && mode === 'menu') previewLevel(nextLevel()); });
$('setFs').addEventListener('click', e => { const v = e.target.dataset && e.target.dataset.v; if (v === undefined) return; SFX.click(); S.fs = +v; persist(); applyFullscreen(); renderSet(); });
$('setSfx').addEventListener('input', e => { S.vol.sfx = +e.target.value; applyVolume(); });
$('setMus').addEventListener('input', e => { S.vol.mus = +e.target.value; applyVolume(); });
['setSfx', 'setMus'].forEach(id => $(id).addEventListener('change', () => { persist(); unlockAudio(); id === 'setSfx' ? SFX.good() : davul(0, true); }));
$('setOk').addEventListener('click', () => { SFX.click(); persist(); if (setFrom === 'pause') show('pause'); else { previewLevel(nextLevel()); show('menu'); } });
$('setBack').addEventListener('click', () => $('setOk').click());
$('setQuit').addEventListener('click', () => { persist(); HOST && HOST.quit && HOST.quit(); });
// Verilerimi sil: cihazdaki bütün ilerleme ve ayarları siler (gizlilik politikası, Meta VRC.Quest.Privacy). Tam Sürüm mağazadan geri yüklenebilir.
let eraseArm = 0;
function eraseData() {
  if (Date.now() - eraseArm > 4000) { eraseArm = Date.now(); return false; }   // ilk dokunuş: onay iste
  try { localStorage.removeItem(SKEY); } catch (e) {}
  if (HOST && HOST.save) try { HOST.save(''); } catch (e) {}
  setTimeout(() => location.reload(), 150); return true;
}
$('setErase').addEventListener('click', () => { SFX.click(); const done = eraseData(); $('setErase').textContent = done ? t('Silindi') : t('Emin misin? Tekrar dokun'); if (!done) setTimeout(() => { $('setErase').textContent = t('Verilerimi sil'); }, 4000); });
$('setRestore').addEventListener('click', () => restorePurchases(true));
function applyFullscreen() {
  if (HOST && HOST.setFullscreen) { HOST.setFullscreen(!!S.fs); return; }
  try { if (S.fs && !document.fullscreenElement && document.fullscreenEnabled) document.documentElement.requestFullscreen(); else if (!S.fs && document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
}
if (HOST) applyFullscreen();

/* ================= TAM SÜRÜM (mobil: tek seferlik 1,99 $ · Steam demo: mağaza sayfası) ================= */
const PRODUCT = 'com.anduv.malazgirt.tamsurum';
const IAP = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativePurchases;
// Meta Quest (Horizon Store PWA): Digital Goods API + PaymentRequest; ürün (SKU) Meta panelinde kalıcı (durable) eklenti
const MQ_BILL = 'https://quest.meta.com/billing', MQ_SKU = 'tamsurum';
const QIAP = () => D.platform === 'quest' && 'getDigitalGoodsService' in window;
const mqSvc = () => window.getDigitalGoodsService(MQ_BILL);
let fullFrom = 'menu';
function openFull() {
  fullFrom = curScr || 'menu'; $('fMsg').textContent = '';
  if (!DEMO) $('fInfo').textContent = freeLim() === FREE_LIMIT ? t('İlk iki sefer, yani 100 bölüm ücretsiz. Tam sürümle 1453 bölümün, 30 seferin hepsi tek seferlik ödemeyle açılır. Reklam yok, abonelik yok.')
    : t('İlk {n} bölüm ücretsiz. Tam sürümle 1453 bölümün, 30 seferin hepsi tek seferlik ödemeyle açılır. Reklam yok, abonelik yok.', { n: freeLim() });
  if (DEMO) {
    $('fInfo').textContent = t('Bu ücretsiz demo ilk iki seferi, yani 100 bölümü içerir. Tam sürümde 1453 bölüm ve 30 sefer seni bekliyor. İlerlemen tam sürüme aktarılır.');
    $('fBuy').firstElementChild.textContent = t("STEAM'DE TAM SÜRÜM"); $('fRestore').hidden = true;
  }
  show('full'); loadPrice();
}
async function loadPrice() {
  if (QIAP()) { try { const d = (await (await mqSvc()).getDetails([MQ_SKU])).find(x => x.itemId === MQ_SKU); if (d && d.price) $('fPrice').textContent = new Intl.NumberFormat(D.lang === 'en' ? 'en-US' : 'tr-TR', { style: 'currency', currency: d.price.currency }).format(+d.price.value); } catch (e) {} return; }
  const P = IAP(); if (!P) return;
  try { const r = await P.getProducts({ productIdentifiers: [PRODUCT], productType: 'inapp' }); const pr = r && r.products && r.products[0]; if (pr) $('fPrice').textContent = pr.priceString || ''; } catch (e) {}
}
function unlockFull(msg) { S.full = true; persist(); drawFullChip(); if (msg) $('fMsg').textContent = t('Tam sürüm açıldı. Hayırlı seferler!'); SFX.weapon(); setTimeout(() => { if (curScr === 'full') { previewLevel(nextLevel()); show(fullFrom === 'levels' ? 'levels' : 'menu'); } }, 1400); }
$('fBuy').addEventListener('click', async () => {
  if (DEMO) { SFX.click(); if (HOST.openStore) HOST.openStore(); return; }
  SFX.click(); $('fBuy').disabled = true;
  const ok = await buyFull(); if (!ok && !$('fMsg').textContent) $('fMsg').textContent = t('Satın alma tamamlanamadı. Bağlantını kontrol edip yeniden dene.');
  else if (ok) unlockFull(true);
  $('fBuy').disabled = false;
});
// satın alma: başarılıysa true (tam sürümü açmak çağırana kalır)
async function buyFull() {
  $('fMsg').textContent = '';
  if (D.platform === 'quest') {
    if (!QIAP()) { $('fMsg').textContent = t('Tam Sürüm\'ü Quest\'te Meta Horizon Store uygulamasından alabilirsin.'); return false; }
    try {
      const req = new PaymentRequest([{ supportedMethods: MQ_BILL, data: { sku: MQ_SKU } }], { total: { label: 'Total', amount: { currency: 'USD', value: '0' } } });
      const res = await req.show(); const tok = res.details && res.details.purchaseToken; await res.complete(tok ? 'success' : 'fail'); return !!tok;
    } catch (e) { return false; }
  }
  const P = IAP(); if (!P) return false;
  try { const r = await P.purchaseProduct({ productIdentifier: PRODUCT, productType: 'inapp', quantity: 1 }); return !!(r && r.transactionId); }
  catch (e) { return false; }
}
async function restorePurchases(loud) {
  if (QIAP()) { try { const ok = (await (await mqSvc()).listPurchases()).some(p => p.itemId === MQ_SKU); if (ok) { if (!S.full) unlockFull(curScr === 'full'); } else if (loud) $('fMsg').textContent = t('Geri yüklenecek satın alım bulunamadı.'); } catch (e) {} return; }
  const P = IAP(); if (!P) return;
  try {
    try { await P.restorePurchases(); } catch (e) {}
    const r = await P.getPurchases({ productType: 'inapp' });
    const ok = (r && r.purchases || []).some(p => p.productIdentifier === PRODUCT && (p.purchaseState === undefined || p.purchaseState === 'PURCHASED' || p.purchaseState === '1'));
    if (ok) { if (!S.full) unlockFull(curScr === 'full'); }
    else if (loud) $(curScr === 'full' ? 'fMsg' : 'fMsg').textContent = t('Geri yüklenecek satın alım bulunamadı.');
  } catch (e) {}
}
$('fRestore').addEventListener('click', () => { SFX.click(); restorePurchases(true); });
$('fLater').addEventListener('click', () => { SFX.click(); if (fullFrom === 'set') { show('set'); return; } previewLevel(nextLevel()); show(fullFrom === 'levels' ? 'levels' : 'menu'); });
// tam sürüm her zaman bulunabilsin: ana menüde ★ Tam Sürüm, Ayarlar'da Satın al (mobil, henüz alınmadıysa)
$('setBuy').addEventListener('click', () => { SFX.click(); openFull(); });
$('bFull').addEventListener('click', () => { SFX.click(); openFull(); });
function drawFullChip() { $('bFull').hidden = !PAID || !!S.full || freeLim() >= NL; }
drawFullChip();
if (!S.full && (IAP() || QIAP())) setTimeout(() => restorePurchases(false), 2500);

/* ================= BAŞARIMLAR (Steam) ================= */
function achieve(id) { if (MAC || !HOST || !HOST.achieve) return; try { HOST.achieve(id); } catch (e) {} }
function winAchievements(i, stars, last, sfi) {
  achieve('ILK_ZAFER');
  if (last) achieve('SEFER_' + (sfi + 1));
  const ts = totalStars(); [100, 500, 1000, 2000, 3000].forEach(n => { if (ts >= n) achieve('YILDIZ_' + n); });
  if (ts >= NL * 3) achieve('YILDIZ_TUM');
  if (G.peak >= 999) achieve('ORDU_999');
  if (G.wTier >= M.WEAPONS.length - 1) achieve('CIHAN_YAYI');
  if (stars >= 3 && G.L.boss) achieve('DEV_3YILDIZ');
  if (HOST && HOST.stat) try { HOST.stat('BOLUM', S.stars.filter(Boolean).length); } catch (e) {}
}

/* ================= OYUN KOLU ================= */
let padActive = false, padPrev = {};
function focusables() { const sc = curScr ? $(SCR[curScr]) : null; return sc ? [...sc.querySelectorAll('button:not([disabled]),input')].filter(b => b.offsetParent && !b.closest('[hidden]')) : []; }
function moveFocus(dir) {
  const els = focusables(); if (!els.length) return; const cur = document.activeElement, i = els.indexOf(cur);
  if (i < 0) { els[0].focus(); return; }
  const r0 = cur.getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2; let best = null, bd = 1e9;
  for (const e of els) { if (e === cur) continue; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, dx = x - cx, dy = y - cy;
    const ok = dir === 'l' ? dx < -4 : dir === 'r' ? dx > 4 : dir === 'u' ? dy < -4 : dy > 4; if (!ok) continue;
    const d = (dir === 'l' || dir === 'r' ? Math.abs(dx) + Math.abs(dy) * 2.5 : Math.abs(dy) + Math.abs(dx) * 2.5); if (d < bd) { bd = d; best = e; } }
  if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); }
}
function padBack() {
  if (mode === 'play' && !paused) { pause(true); return; }
  const back = { levels: () => $('scrLevels').querySelector('.back').click(), camp: () => $('cBack').click(), brief: () => $('scrBrief').querySelector('.back').click(), pause: () => $('pResume').click(), set: () => $('setOk').click(), full: () => $('fLater').click(), win: () => $('wMenu').click(), lose: () => $('lMenu').click() }[curScr];
  if (back) back();
}
function pollPad(dt) {
  const pads = navigator.getGamepads ? navigator.getGamepads() : []; let p = null; for (const g of pads) if (g && g.connected) { p = g; break; }
  if (!p) return;
  const b = k => !!(p.buttons[k] && p.buttons[k].pressed), edge = k => { const v = b(k), was = padPrev[k]; padPrev[k] = v; return v && !was; };
  const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
  const stick = { l: ax < -0.6 || b(14), r: ax > 0.6 || b(15), u: ay < -0.6 || b(12), d: ay > 0.6 || b(13) };
  if (!padActive && (Math.abs(ax) > 0.5 || p.buttons.some(x => x.pressed))) { padActive = true; }
  if (mode === 'play' && !paused && G) {
    const v = Math.abs(ax) > 0.15 ? ax : b(14) ? -1 : b(15) ? 1 : 0; G.tx += v * 14 * dt;
    if (edge(9) || edge(1)) pause(true);
    if (edge(3)) setView(S.view === 'sipahi' ? 'kus' : 'sipahi');   // Y / △: görüş
    if (edge(0) && sipahiGozu()) darbe();   // A / ✕: sipahi darbesi
    return;
  }
  for (const k of ['l', 'r', 'u', 'd']) { const v = stick[k], was = padPrev['s' + k]; padPrev['s' + k] = v; if (v && !was) {
    const el = document.activeElement; if (el && el.type === 'range' && (k === 'l' || k === 'r')) { el.value = +el.value + (k === 'l' ? -10 : 10); el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); } else moveFocus(k); } }
  if (edge(0)) { const el = document.activeElement; if (el && el.tagName === 'BUTTON' && !el.closest('[hidden]')) el.click(); else { const f = focusables()[0]; if (f) f.focus(); } }
  if (edge(1)) padBack();
  if (edge(9)) { if (curScr === 'menu') $('bPlay').click(); }
  if (curScr === 'levels') { if (edge(4)) $('sPrev').click(); if (edge(5)) $('sNext').click(); } else { edge(4); edge(5); }
}
window.addEventListener('gamepadconnected', () => { padActive = true; setTimeout(() => { const f = focusables()[0]; if (f) f.focus(); }, 50); });

/* ================= DÜŞEN AKINCILAR ================= */
const MAXD = 70, deadMesh = inst(akinciG, armyMat, MAXD), DEAD = [];
let lostSeen = 0, lossPop = 0, lossShown = 0, lossT = 0;
function updateDead(dt) {
  if (!G) return;
  const nw = G.lost - lostSeen; lostSeen = G.lost;
  if (nw > 0 && mode !== 'menu') {
    lossPop += nw;
    const m = Math.min(G.count + nw, MAXC);
    for (let k = 0; k < Math.min(nw, 5); k++) { if (DEAD.length >= MAXD) DEAD.shift(); const o = OFF[Math.max(0, m - 1 - Math.floor(Math.random() * Math.min(m, 25)))];
      DEAD.push({ x: G.x + o.x, z: G.z + o.z, t: 0, ry: (Math.random() - .5) * 1.2, side: Math.random() < .5 ? -1 : 1 }); }
  }
  lossT += dt;
  if (lossT > 0.7) { const v = lossPop - lossShown; if (v >= 2 && G.state === 'play') popup('−' + v, G.x + (Math.random() - .5) * 2, 2.2, G.z - G.Rz, 'bad small'); lossPop = 0; lossShown = 0; lossT = 0; }
  let n = 0;
  for (let k = DEAD.length - 1; k >= 0; k--) { const d = DEAD[k]; d.t += dt; if (d.t > 1.6) { DEAD.splice(k, 1); continue; } }
  for (const d of DEAD) { const f = Math.min(1, d.t / .35), sink = Math.max(0, d.t - 1.0) * .8;
    dummy.position.set(d.x, -sink, d.z); dummy.rotation.set(0, d.ry, d.side * f * 1.45); dummy.updateMatrix(); deadMesh.setMatrixAt(n++, dummy.matrix); }
  deadMesh.count = n; deadMesh.instanceMatrix.needsUpdate = true; dummy.rotation.set(0, 0, 0);
}

/* ================= ÇİZİM ================= */
function renderCrowd(t) {
  const m = Math.min(G.count, MAXC), moving = mode === 'play' && !paused || G.state === 'march';
  // her 7 askerden biri atlı sipahidir; atlılar ordunun dış halkasında (kanatlarda) gider
  const ns = m < 8 ? 0 : Math.min(MAXS, Math.floor(m / 7)), na = m - ns;
  for (let i = 0; i < m; i++) {
    const o = OFF[i], atli = i >= na; const bob = moving ? Math.abs(Math.sin(t * (atli ? 9 : 11) + o.ph)) * (atli ? 0.16 : 0.12) : Math.sin(t * 2 + o.ph) * 0.02;
    dummy.position.set(G.x + o.x * (atli ? 1.12 : 1), bob, G.z + o.z * (atli ? 1.08 : 1)); dummy.rotation.set(moving ? (atli ? Math.sin(t * 9 + o.ph) * 0.07 : -0.1) : 0, 0, moving && !atli ? Math.sin(t * 11 + o.ph) * 0.06 : 0);
    const k = atli ? 0.82 : 1; dummy.scale.set(k, k, k); dummy.updateMatrix();
    if (atli) sipahiMesh.setMatrixAt(i - na, dummy.matrix); else crowdMesh.setMatrixAt(i, dummy.matrix);
  }
  dummy.scale.set(1, 1, 1);
  crowdMesh.count = na; crowdMesh.instanceMatrix.needsUpdate = true; sipahiMesh.count = ns; sipahiMesh.instanceMatrix.needsUpdate = true;
  // serdar (ya da Sipahi Gözü'nde oyuncunun bineği) ordunun önünde
  const fp = sipahiGozu(), lead = fp ? binek : serdar; serdar.visible = !fp && G.count > 0; binek.visible = fp && G.count > 0;
  const gal = moving ? Math.sin(t * 9) : 0; lead.position.set(G.x, moving ? Math.abs(gal) * 0.12 : 0, G.z - G.Rz - (fp ? 0.7 : -0.1)); lead.rotation.set(gal * 0.05, 0, (G.tx - G.x) * -0.02);
  const h = G.heroes; for (let i = 0; i < h; i++) { dummy.position.set(G.x + (fp ? (i % 2 ? 1 : -1) * (1.7 + Math.floor(i / 2) * 1.4) : (i - (h - 1) / 2) * 1.4), moving ? Math.abs(Math.sin(t * 8 + i)) * 0.15 : 0, G.z - G.Rz - 1.0); dummy.rotation.set(0, 0, 0); dummy.scale.set(2, 2, 2); dummy.updateMatrix(); heroMesh.setMatrixAt(i, dummy.matrix); }
  heroMesh.count = h; heroMesh.instanceMatrix.needsUpdate = true; dummy.scale.set(1, 1, 1);
}
function renderFoes(t) {
  const idx = {}; for (const k in foeMesh) idx[k] = 0;
  for (const o of G.objs) {
    if (o.t !== 'squad') continue; const v = VIEW.objs.get(o);
    if (!o.alive || o.z < G.z - 110 || o.z > G.z + 14) { v.spr.visible = false; continue; }
    if (!o.cols) { o.cols = 1; o.rows = 1; o.w = 1; o.d = 1; }
    const atli = !!M.FOES[o.ft].atli, cap = atli ? 90 : 160, m = Math.min(o.n, cap), mesh = foeMesh[o.ft];
    const sx = atli ? 0.8 : 0.55, sz = atli ? 1.1 : 0.6;
    const cols = Math.max(1, Math.min(atli ? 8 : 12, Math.ceil(Math.sqrt(m * 1.3)))), rows = Math.ceil(m / cols);
    const moving = M.FOES[o.ft].v > 0 && (G.z - o.z) < 42;
    for (let j = 0; j < m && idx[o.ft] < MAXE; j++) {
      const r = Math.floor(j / cols), c = j % cols; const jx = Math.sin(j * 12.9898 + v.seed) * 0.12, jz = Math.cos(j * 78.233 + v.seed) * 0.12;
      dummy.position.set(o.x + (c - (cols - 1) / 2) * sx + jx, moving ? Math.abs(Math.sin(t * 10 + j)) * 0.1 : 0, o.z + (r - (rows - 1) / 2) * sz + jz); dummy.rotation.set(0, Math.PI, 0); dummy.updateMatrix(); mesh.setMatrixAt(idx[o.ft]++, dummy.matrix);
    }
    v.spr.visible = true; v.spr.position.set(o.x, atli ? 3.3 : 2.5, o.z + rows * sz / 2);
    if (o.n !== v.shown) { v.shown = o.n; drawCount(v.L, o.n); }
  }
  for (const k in foeMesh) { foeMesh[k].count = idx[k]; foeMesh[k].instanceMatrix.needsUpdate = true; }
}
function renderArrows() {
  const fpz = sipahiGozu() ? binek.position.z - 5.5 : 1e9; let i = 0; for (const a of G.arrows) { if (i >= MAXA) break; if (a.z > fpz) continue; dummy.position.set(a.x, a.y, a.z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); arrowMesh.setMatrixAt(i++, dummy.matrix); }
  arrowMesh.count = i; arrowMesh.instanceMatrix.needsUpdate = true;
  let j = 0; for (const s of G.foeShots) { if (j >= 60) break; const x = s.x + (s.tx - s.x) * s.t, z = s.z + (s.tz - s.z) * s.t, y = 1 + Math.sin(s.t * Math.PI) * 3;
    dummy.position.set(x, y, z); dummy.rotation.set(Math.cos(s.t * Math.PI) * -0.9, 0, 0); dummy.updateMatrix(); foeArrowMesh.setMatrixAt(j++, dummy.matrix); }
  foeArrowMesh.count = j; foeArrowMesh.instanceMatrix.needsUpdate = true;
}
function renderObjs(dt, t) {
  for (const [o, v] of VIEW.objs) {
    if (o.t === 'squad') continue;
    if (o.alive) {
      if (v.L && Math.ceil(o.hp) !== v.shown) { v.shown = Math.ceil(o.hp); if (o.t === 'boss') drawBossBar(v.L, M.BOSSES[o.id].ad, o.hp, o.max); else drawBig(v.L, fmt(o.hp), (o.t === 'barricade' || o.t === 'sur') ? '#ffd9a0' : '#fff'); }
      if (o.flash !== undefined) { const s = 1 + o.flash * 1.2; v.g.scale.set(s, s, s); }
      if (v.item) v.item.rotation.y += dt * 1.6;
      if (o.t === 'boss') { v.g.position.z = o.z; v.m.rotation.z = Math.sin(t * 6) * 0.04; }
      if (o.t === 'kervan') { v.g.position.x = o.x; v.g.rotation.z = Math.sin(t * 9) * 0.02; }
      if (o.t === 'gulle') { v.g.position.z = o.z; v.ball.rotation.x += dt * GULLE_SPIN; v.lane.material.opacity = o.warn && !o.done ? .25 + .25 * Math.abs(Math.sin(t * 7)) : 0; if (o.done) v.lane.visible = false; }
      if (o.t === 'tas') { const dz = G.z - o.z; v.ring.material.opacity = .5 + .4 * Math.abs(Math.sin(t * 6)); if (dz < 16) { v.rock.visible = true; v.rock.position.y = Math.max(.6, 18 * dz / 16); v.rock.rotation.x += dt * 4; } }
    } else if (v.die !== undefined && v.die > 0) { v.die -= dt; const s = Math.max(0.01, v.die / 0.3); v.g.scale.set(s, s, s); if (v.die <= 0) v.g.visible = false; }
    else if (v.g && !o.alive && v.die === undefined) { v.g.visible = false; if (v.lane) v.lane.visible = false; }
  }
  for (const gv of VIEW.gates) if (gv.anim >= 0 && gv.t < 1) { gv.t = Math.min(1, gv.t + dt * 3); const p = gv.panels[gv.anim]; p.scale.set(1 + gv.t * .3, Math.max(.01, 1 - gv.t), 1); p.material.opacity = 1 - gv.t; }
  for (const p of puffs) if (p.life > 0) { p.life -= dt; const k = 1 - p.life / 0.45; p.s.scale.setScalar(p.size * (0.6 + k * 1.2)); p.s.material.opacity = Math.max(0, 0.85 * (1 - k)); p.s.position.y += dt * 1.2; if (p.life <= 0) p.s.visible = false; }
}

let last = performance.now(), T = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  pollPad(dt);
  if (G) {
    if (darbeT > 0) darbeT -= dt; darbeK = Math.max(0, darbeK - dt * 5);
    if (mode === 'play' && !paused) {
      G.tx += keyDir * 12 * dt;
      M.step(G, dt); handleEvents(); drumLoop(dt);
      if (hintT > 0) { hintT -= dt; } $('hint').hidden = !(hintT > 0);
      if (G.state === 'win' && mode === 'play') finish(true);
      else if (G.state === 'lose' && mode === 'play') { mode = 'dying'; setTimeout(() => finish(false), 700); }
    } else $('hint').hidden = true;
    renderCrowd(T); renderFoes(T); renderArrows(); renderObjs(dt, T); updateDead(dt);
    const tx = G.x * 0.55, tz = G.z;
    camX += (tx - camX) * Math.min(1, dt * 5); camZ += (tz - camZ) * Math.min(1, dt * 8);
    if (window.VR && VR.on) { VR.update(dt); if (VR.test) VR.testCam(); }   // VR: savaş alanı harp masasının üstünde (js/vr.js)
    else if (sipahiGozu()) {   // Sipahi Gözü: ordunun önündeki atın sırtından
      const b = binek.position, sw = (G.tx - G.x) * 0.012 + darbeK * 0.05;
      camera.fov = window.innerWidth / window.innerHeight < 0.8 ? 84 : 70; camera.updateProjectionMatrix();
      camera.position.set(b.x, 2.2 + b.y * 0.8 - darbeK * 0.12, b.z + 0.3 - darbeK * 0.6);   // darbede öne atılış camera.up.set(Math.sin(sw), 1, 0); camera.lookAt(b.x + sw * 6, 0.7, b.z - 14);
    }
    else {
      if (camera.fov > 60 && window.innerWidth / window.innerHeight >= 0.8 || camera.fov > 80) { camera.up.set(0, 1, 0); resize(); }
      const far = mode === 'menu' ? 1 : 0, ck = 1 + (G.road - 6) * 0.075;   // geniş yolda kamera geri çekilir
      camera.position.set(camX + (far ? Math.sin(T * 0.25) * 1.5 : 0), (12.5 + far * 1.5) * ck, camZ + (12.5 + far * 2) * ck); camera.lookAt(camX * 0.7, 0, camZ - 12 * ck);
    }
    updatePrecip(dt, camX, camZ - 20);
    sun.position.set(G.x + 8, 24, G.z + 8); sun.target.position.set(G.x, 0, G.z - 8);
    const showBubble = !(window.VR && VR.on) && (mode === 'play' || mode === 'menu' || mode === 'dying') && G.count + G.heroes > 0 && $('scrLevels').hidden && $('scrCamp').hidden;
    const b = $('bubble');
    if (showBubble) { const p = sipahiGozu() ? { vis: true, x: window.innerWidth * 0.3, y: window.innerHeight * 0.88 } : toScreen(G.x, 2.4 + (G.heroes ? 2.6 : 0), G.z); b.hidden = !p.vis; b.style.left = p.x + 'px'; b.style.top = p.y + 'px'; const label = fmt(G.count) + (G.heroes ? '<small>+' + G.heroes + ' Alp</small>' : ''); if (b.innerHTML !== label) b.innerHTML = label; } else b.hidden = true;
    $('progFill').style.width = (M.progress(G) * 100).toFixed(1) + '%';
  }
  renderer.render(scene, camera);
  if (!renderer.xr.isPresenting) requestAnimationFrame(frame);
}
// VR (Harp Masası) modülüne oyunun sahnesini ve durumunu ver
if (window.VR_KUR) window.VR_KUR({ scene, renderer, camera, $, t, fmt, D, SFX, NL, canPlay, startGame, previewLevel, show, unlockAudio, nextLevel, resize, frame,
  binek: () => binek, paused: () => paused, eraseData, darbe, S: () => S, persist, upCapNow, totalStars: () => totalStars(), setView, achieve: id => achieve(id), pause, fmtN: fmt, buyFull: PAID ? () => buyFull().then(ok => { if (ok) { S.full = true; persist(); drawFullChip(); } return ok; }) : null, G: () => G, mode: () => mode, mood: () => curMood, MOODS, precip: [rainLines, snowPts], lastRes: () => lastRes, setMode: v => { mode = v; }, setPaused: v => { paused = v; }, setLast: v => { last = v; } });

// Mağaza görselleri için sahne modu: ?kare=BÖLÜM&hiz=2 (araclar/magaza-gorselleri.js kullanır)
const Q = new URLSearchParams(location.search);
function autoSteer() {
  if (!G || mode !== 'play') return;
  const g = G.gates.find(g => !g.passed && G.z - g.z < 30 && G.z - g.z > -1);
  if (g) { const v = g.opts.map(o => M.applyOp(G.count, o)); G.tx = M.laneX(G, v.indexOf(Math.max(...v)), v.length); return; }
  const o = G.objs.filter(o => o.alive && o.z < G.z && G.z - o.z < 30 && o.t !== 'barricade' && o.t !== 'block').sort((a, b) => b.z - a.z)[0];
  G.tx = o ? o.x : 0;
}
function macBoot() {
  document.body.classList.add('mac');
  const st = document.createElement('style');
  st.textContent = '.mac #wNext,.mac #wRetry,.mac #wMenu,.mac #lRetry,.mac #lCamp,.mac #lMenu,.mac .gain,.mac #scrBrief .back,.mac #brStars,.mac #pRestart,.mac #wEpi,.mac #brCamp{display:none!important}.mac .vs{display:flex;align-items:center;justify-content:center;gap:10px;margin:2px 0 4px}.mac .vs i{width:26px;height:26px;border-radius:50%;border:3px solid #fff;display:inline-block;box-shadow:0 2px 0 rgba(0,0,0,.25)}';
  document.head.appendChild(st);
  [['scrWin', 'wNext'], ['scrLose', 'lRetry']].forEach(([sc, ref]) => {
    const b = document.createElement('button'); b.className = 'big'; b.textContent = 'MAÇ MERKEZİNE DÖN';
    b.addEventListener('click', () => { SFX.click(); macPost(MAC.res); });
    $(ref).parentNode.insertBefore(b, $(ref));
  });
  const pm = $('pMenu'), nb = pm.cloneNode(true); pm.replaceWith(nb); nb.textContent = 'Maçtan çekil';
  nb.addEventListener('click', () => { SFX.click(); macPost({ win: false, stars: 0, prog: 0, quit: true }); });
  openBrief(MAC.lv);
  $('scrBrief').querySelector('.topbar h2').textContent = MAC.lig + (MAC.hafta ? ' · ' + MAC.hafta + '. hafta' : '');
  $('brReg').textContent = (MAC.saha === 'ic' ? 'İç saha' : 'Deplasman') + ' · ' + M.SEFERLER[M.seferOf(MAC.lv)].ad + ' cephesi';
  $('brName').innerHTML = '<span class="vs"><i style="background:' + MAC.b1 + '"></i>' + MAC.bk + ' → ' + MAC.rk + '<i style="background:' + MAC.r1 + '"></i></span>';
  $('brText').textContent = MAC.ben + ' akıncıları ' + MAC.rakip + ' kalesine yürüyor. Kapılardan doğru tarafı seç, ordunu büyüt, sondaki ' + MAC.rakip + ' birliğini dağıt. Zafer yıldızı skoru belirler: ★★★ 3-0, ★★ 2-1, ★ 1-0. Yenilsen bile kaleye ne kadar yaklaştığın sayılır.';
  $('bStart').textContent = 'MAÇA BAŞLA';
}
function boot() {
  if (MAC) { macBoot(); requestAnimationFrame(t => { last = t; frame(t); }); return; }
  if (Q.has('temiz')) document.body.classList.add('temiz');
  if (D.platform === 'steam') $('hint').textContent = t('← → ya da A / D ile yönlendir');
  if (Q.has('kare')) {
    if (Q.get('gorus')) S.view = Q.get('gorus');
    S.sound = false; S.unlocked = NL; const kq = +Q.get('kare') || 0, uq = Math.round(kq < 50 ? Math.max(8, kq * 0.2 + 2) : Math.min(M.upCap(M.seferOf(kq)), 12 + (kq - 50) * 0.1)); S.up = { start: uq, dmg: uq, rate: uq, zirh: uq }; S.coins = 1840;
    S.stars = [3, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 1, 3, 3]; persist = () => {};
    const sc = +Q.get('hiz') || 1, ekran = Q.get('ekran');
    if (ekran) { previewLevel(+Q.get('kare') || 0); if (ekran === 'brief') openBrief(+Q.get('kare')); else { regionSel = +(Q.get('bolge') || 0); seferSel = sefOfReg(regionSel); show(ekran); } }
    else {
      startGame(+Q.get('kare')); $('banner') && $('banner').remove(); hintT = 0;
      if (Q.has('ileri')) { const stopZ = G.L.endZ + (+Q.get('ileri')); let n = 0; while (G.z > stopZ && G.state === 'play' && n++ < 20000) { autoSteer(); M.step(G, 1 / 30); handleEvents(); } $('pops').innerHTML = ''; }
      if (Q.has('yay')) G.wTier = Math.min(M.WEAPONS.length - 1, +Q.get('yay')); updateWeapon();
    }
    const step0 = M.step; M.step = (g, dt) => { autoSteer(); for (let k = 0; k < sc; k++) step0(g, dt); };
    requestAnimationFrame(t => { last = t; frame(t); });
    return;
  }
  previewLevel(nextLevel()); show('menu');
  requestAnimationFrame(t => { last = t; frame(t); });
}
// yazı tipi yüklenince başla (tuval etiketleri doğru yazı tipiyle çizilsin)
const ready = document.fonts && document.fonts.load ? Promise.race([Promise.all([document.fonts.load('800 64px "Baloo 2"'), document.fonts.load('600 16px "Baloo 2"')]), new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
ready.then(boot, boot);
})();
