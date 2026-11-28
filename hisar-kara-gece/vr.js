// Hisar — Masadaki Savaş (WebXR)
// Savaş alanı masanın üstünde minyatür bir maket olarak durur. Kamera hiç hareket ettirilmez
// (yürüme, dönme, sarsıntı yok): mide bulantısı yapacak yapay hareket yoktur.
// Meta Quest'te karma gerçeklik (odanın görüntüsü) desteklenir; diğer başlıklarda sanal oda.
import * as THREE from './lib/three.module.min.js';

const H = window.HISAR;
const S = H.S;
const GY = H.GY;
const PX = 0.001;            // 1 oyun pikseli = 1 mm (alan 96 cm)
const LANE = 0.0035;         // şerit derinliği
const F = 1.6;               // atlas çözünürlüğü (piksel/oyun pikseli)
const US = 1.35;             // askerler oyuncak asker boyunda: biraz büyütülmüş

/* ---------------- yardımcılar ---------------- */
const X = px => (px - 480) * PX;              // oyun x → maket x
const Yh = py => (GY - py) * PX;              // oyun y (ekran) → yükseklik
let laneMul = 1;
const Z = lane => lane * LANE * laneMul;
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function texOf(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const FONT = 'Tahoma,Verdana,"Segoe UI",sans-serif';

/* ---------------- sahne ---------------- */
let renderer, scene, camera, board, ui, session = null, mode = 'vr', placed = false;
let env, hudPanel, resPanel, pausePanel, mapPanel, banner, bars = {}, decoGroup, unitLayer, projLayer;
let preview = false, previewAr = false; // masaüstü önizleme (ekran görüntüleri ve test için)
let mapOpen = false, mapSel = 0, mapTab = 'map', mapDressT = -1; // VR içi sefer haritası ve ordugâh

function initRenderer() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local-floor');
  renderer.domElement.style.cssText = 'position:fixed;inset:0;z-index:50;display:none';
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 50);
  camera.position.set(0, 1.2, 0);
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x2a3324, 1.6));
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.6); sun.position.set(-1, 3, 2); scene.add(sun);
  board = new THREE.Group(); scene.add(board); ui = new THREE.Group(); scene.add(ui);
  buildEnv(); buildBoardBase(); buildPanels(); buildControllers();
  addEventListener('resize', () => { if (!session) { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); } });
}

/* Sanal oda (karma gerçeklikte gizlenir): gece göğü, zemin, ahşap masa */
function buildEnv() {
  env = new THREE.Group(); scene.add(env); env.userData.poles = [];
  const sc = canvas(2048, 1024), c = sc.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 1024); g.addColorStop(0, '#05080d'); g.addColorStop(0.55, '#16202a'); g.addColorStop(1, '#2a2418');
  c.fillStyle = g; c.fillRect(0, 0, 2048, 1024);
  for (let k = 0; k < 1400; k++) { c.fillStyle = 'rgba(255,250,235,' + (0.3 + Math.random() * 0.7) + ')'; c.fillRect(Math.random() * 2048, Math.random() * 520, 1.5, 1.5); }
  const sky = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ map: texOf(sc), side: THREE.BackSide, depthWrite: false }));
  env.add(sky);
  const fl = new THREE.Mesh(new THREE.CircleGeometry(6, 48), new THREE.MeshStandardMaterial({ color: 0x2a2a22, roughness: 1 }));
  fl.rotation.x = -Math.PI / 2; env.add(fl); env.userData.floor = fl;
  // ufukta tepeler (karanlık siluet halkaları)
  const hills = new THREE.Group(); env.add(hills); env.userData.hills = hills;
  for (const [r, h0, h1, col, sd] of [[17, 0.6, 2.6, 0x141a1c, 7], [13, 0.2, 1.3, 0x1c221e, 31]]) {
    const N = 96, pos = [], idx = []; let sd2 = sd; const rnd = () => (sd2 = (sd2 * 16807) % 2147483647) / 2147483647;
    const hs = []; for (let i = 0; i < N; i++) hs.push(h0 + rnd() * (h1 - h0));
    for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, hh = (hs[i % N] + hs[(i + 1) % N] + hs[(i + N - 1) % N]) / 3; pos.push(Math.cos(a) * r, -0.5, Math.sin(a) * r, Math.cos(a) * r, hh, Math.sin(a) * r); }
    for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    hills.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })));
  }
  // çadır direkleri ve meşaleler: hareketsiz, uzakta
  for (const a of [-0.9, 0.9]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0x4a3420 }));
    pole.position.set(a * 2.4, 1.1, -2.6); env.add(pole); env.userData.poles.push(pole);
    const fire = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffa040 }));
    fire.position.set(a * 2.4, 2.25, -2.6); env.add(fire); env.userData.poles.push(fire);
    const pl = new THREE.PointLight(0xffa040, 1.2, 4); pl.position.copy(fire.position); env.add(pl); env.userData.poles.push(pl);
  }
}

/* Maket: ahşap kaide + üst zemin + arka fon */
let baseTop, backdrop, plinth, hisarModel, kuleModel, fogGroup, wxPoints, wxData = [];
function buildBoardBase() {
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 0.8 });
  plinth = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.05, 0.38), wood);
  plinth.position.set(0, -0.026, -0.03); board.add(plinth);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.008, 0.40), new THREE.MeshStandardMaterial({ color: 0xa8822a, roughness: 0.5, metalness: 0.4 }));
  trim.position.set(0, -0.0055, -0.03); board.add(trim); plinth.userData.trim = trim;
  baseTop = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.34), new THREE.MeshStandardMaterial({ roughness: 1 }));
  baseTop.rotation.x = -Math.PI / 2; baseTop.position.set(0, 0.001, -0.03); board.add(baseTop);
  backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.3), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  backdrop.position.set(0, 0.15, -0.2); board.add(backdrop);
  decoGroup = new THREE.Group(); board.add(decoGroup);
  unitLayer = new THREE.Group(); board.add(unitLayer);
  projLayer = new THREE.Group(); board.add(projLayer);
  hisarModel = makeHisar(); hisarModel.position.set(X(62), 0, 0.0); board.add(hisarModel);
  kuleModel = makeKule(); kuleModel.position.set(X(900), 0, 0.0); board.add(kuleModel);
  bars.p = makeBar('#5fae4f'); bars.p.mesh.position.set(X(62), 0.2, 0); board.add(bars.p.mesh);
  bars.e = makeBar('#b04ad0'); bars.e.mesh.position.set(X(900), 0.24, 0); board.add(bars.e.mesh);
  fogGroup = new THREE.Group(); board.add(fogGroup);
  {
    const fc = canvas(256, 128), c = fc.getContext('2d'); const g = c.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, 'rgba(200,210,205,0)'); g.addColorStop(0.5, 'rgba(190,200,196,.75)'); g.addColorStop(1, 'rgba(180,190,186,.95)');
    c.fillStyle = g; c.fillRect(0, 0, 256, 128);
    const m = new THREE.MeshBasicMaterial({ map: texOf(fc), transparent: true, depthWrite: false, side: THREE.DoubleSide });
    for (let k = 0; k < 5; k++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.16), m); p.position.set(0.22, 0.07, -0.14 + k * 0.06); fogGroup.add(p); }
  }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(240 * 3), 3));
  wxPoints = new THREE.Points(wg, new THREE.PointsMaterial({ size: 0.004, transparent: true, depthWrite: false }));
  board.add(wxPoints);
}

function makeHisar() {
  const g = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0x8a8576, roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x6e6a5c, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.15, 0.08), stone); body.position.y = 0.075; g.add(body);
  for (let k = 0; k < 5; k++) for (const z of [-0.034, 0.034]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.013, 0.012), dark); m.position.set(-0.04 + k * 0.02, 0.157, z); g.add(m); }
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.046, 0.004), new THREE.MeshStandardMaterial({ color: 0x2a1c12 })); door.position.set(0.0, 0.023, 0.041); g.add(door);
  for (const [x, y] of [[-0.024, 0.105], [0.024, 0.105], [0, 0.065]]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.014, 0.002), new THREE.MeshBasicMaterial({ color: 0xffc864 })); w.position.set(x, y, 0.0405); g.add(w); }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.05, 6), new THREE.MeshStandardMaterial({ color: 0x3a2a1a })); pole.position.set(0, 0.188, 0); g.add(pole);
  const fc = canvas(128, 80), c = fc.getContext('2d'); c.fillStyle = '#b8282a'; c.fillRect(0, 0, 128, 80);
  c.fillStyle = '#f2ecd6'; c.beginPath(); c.arc(50, 40, 22, 0, Math.PI * 2); c.fill(); c.fillStyle = '#b8282a'; c.beginPath(); c.arc(58, 40, 18, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#f2ecd6'; star(c, 86, 40, 11);
  const flagGeo = new THREE.PlaneGeometry(0.04, 0.024, 8, 1);
  const flag = new THREE.Mesh(flagGeo, new THREE.MeshBasicMaterial({ map: texOf(fc), side: THREE.DoubleSide }));
  flag.position.set(0.021, 0.2, 0); g.add(flag); g.userData.pole = pole; g.userData.flag = flag; g.userData.flagBase = Float32Array.from(flagGeo.attributes.position.array);
  return g;
}
function star(c, x, y, r) { c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr2 = k % 2 ? r * 0.42 : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fill(); }
function makeKule() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x2a2433, roughness: 0.7 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.19, 7), m); body.position.y = 0.095; g.add(body);
  for (let k = 0; k < 5; k++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.04 + (k % 2) * 0.02, 5), m); const a = k / 5 * Math.PI * 2; sp.position.set(Math.cos(a) * 0.022, 0.2, Math.sin(a) * 0.022); g.add(sp); }
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.011, 16, 8), new THREE.MeshBasicMaterial({ color: 0xc060ff })); eye.position.set(0, 0.14, 0.035); eye.scale.set(1.3, 0.6, 0.5); g.add(eye);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 6), new THREE.MeshBasicMaterial({ color: 0x1a0820 })); pupil.position.set(0, 0.14, 0.04); g.add(pupil);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.004), new THREE.MeshBasicMaterial({ color: 0x5a2a7a })); door.position.set(0, 0.02, 0.047); g.add(door);
  const pl = new THREE.PointLight(0xc060ff, 0.3, 0.3); pl.position.set(0, 0.14, 0.08); g.add(pl);
  g.userData.eye = eye;
  return g;
}

/* Üs can çubuğu (yazılı) */
function makeBar(col) {
  const c = canvas(256, 48), t = texOf(c);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.02), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  return { c, t, mesh, col, last: -1 };
}
function drawBar(b, base) {
  const v = Math.ceil(base.hp); if (v === b.last && !(base.hitT > 0)) return; b.last = v;
  const c = b.c.getContext('2d'); c.clearRect(0, 0, 256, 48);
  rr(c, 2, 22, 252, 22, 6); c.fillStyle = 'rgba(0,0,0,.75)'; c.fill();
  c.fillStyle = '#3a1a1a'; c.fillRect(8, 27, 240, 12);
  c.fillStyle = base.hitT > 0 ? '#fff' : b.col; c.fillRect(8, 27, 240 * Math.max(0, base.hp / base.max), 12);
  c.font = 'bold 18px ' + FONT; c.textAlign = 'center'; c.fillStyle = '#f2ecd6'; c.strokeStyle = 'rgba(0,0,0,.8)'; c.lineWidth = 4;
  const txt = v + ' / ' + base.max; c.strokeText(txt, 128, 18); c.fillText(txt, 128, 18); b.t.needsUpdate = true;
}

/* Bölge görünümü: zemin dokusu, arka fon, süsler, hava */
let curBoardKey = '';
function dressBoard(i) {
  const L = H.LEVELS[i], R = H.REGIONS[L.region], key = L.region + ':' + (i % 3);
  fogGroup.visible = L.mod === 'sis';
  setupWeather(R.wx);
  if (key === curBoardKey) return; curBoardKey = key;
  const st = R.st, P = H.RPAL[st][i % 3];
  // zemin
  const gc = canvas(1024, 352), c = gc.getContext('2d');
  c.fillStyle = H.shade(P[3], -0.15); c.fillRect(0, 0, 1024, 352);
  const rnd = H.srand(31 + i * 7);
  for (let k = 0; k < 900; k++) { c.fillStyle = 'rgba(0,0,0,' + (0.05 + rnd() * 0.12) + ')'; c.fillRect(rnd() * 1024, rnd() * 352, 2 + rnd() * 5, 1 + rnd() * 3); }
  for (let k = 0; k < 500; k++) { c.fillStyle = st === 3 ? 'rgba(120,50,60,.35)' : st === 2 ? 'rgba(200,205,210,.25)' : 'rgba(110,140,70,.35)'; c.fillRect(rnd() * 1024, rnd() * 352, 1, 3 + rnd() * 3); }
  // yol (birliklerin yürüdüğü şerit): z −0.012..+0.05 → doku y
  const zy = z => (z + 0.03 + 0.17) / 0.34 * 352;
  const g = c.createLinearGradient(0, zy(-0.03), 0, zy(0.05));
  const road = st === 2 ? 'rgba(160,160,160,' : st === 3 ? 'rgba(80,40,50,' : 'rgba(130,105,70,';
  g.addColorStop(0, road + '0)'); g.addColorStop(0.3, road + '.55)'); g.addColorStop(0.7, road + '.55)'); g.addColorStop(1, road + '0)');
  c.fillStyle = g; c.fillRect(0, zy(-0.03), 1024, zy(0.05) - zy(-0.03));
  if (R.tint) { c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.45; c.fillStyle = R.tint; c.fillRect(0, 0, 1024, 352); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
  const old = baseTop.material.map; baseTop.material.map = texOf(gc); baseTop.material.needsUpdate = true; if (old) old.dispose();
  // arka fon: oyunun kendi arka planından gökyüzü ve dağlar
  const bg = H.makeBg(i), bc = canvas(960, 300), b2 = bc.getContext('2d');
  b2.drawImage(bg, 0, 0, 960, 300, 0, 0, 960, 300);
  const o2 = backdrop.material.map; backdrop.material.map = texOf(bc); backdrop.material.needsUpdate = true; if (o2) o2.dispose();
  // süsler: ağaç, kaya, diken
  while (decoGroup.children.length) { const m = decoGroup.children.pop(); m.geometry.dispose(); }
  const col = new THREE.Color(H.shade(P[3], st === 1 ? -0.25 : -0.15));
  const treeM = new THREE.MeshStandardMaterial({ color: col, roughness: 1 });
  const rockM = new THREE.MeshStandardMaterial({ color: st === 2 ? 0x8a8e96 : st === 3 ? 0x1a1018 : 0x6a6252, roughness: 1, flatShading: true });
  const n = st === 1 ? 70 : st === 0 ? 34 : st === 2 ? 26 : 22;
  for (let k = 0; k < n; k++) {
    const back = rnd() < 0.72, z = back ? -0.19 + rnd() * 0.15 : 0.065 + rnd() * 0.06, x = -0.42 + rnd() * 0.84;
    if (Math.abs(x - X(62)) < 0.07 || Math.abs(x - X(900)) < 0.06) continue;
    let m;
    if (st === 3) { m = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.02 + rnd() * 0.05, 4), rockM); m.position.y = 0.012; }
    else if (st === 2 && rnd() < 0.6) { const s2 = 0.008 + rnd() * 0.016; m = new THREE.Mesh(new THREE.DodecahedronGeometry(s2, 0), rockM); m.position.y = s2 * 0.6; }
    else { const h = (0.025 + rnd() * 0.03) * (st === 1 ? 1.5 : 1); m = new THREE.Mesh(new THREE.ConeGeometry(h * 0.32, h, 6), treeM); m.position.y = h / 2; }
    m.position.x = x; m.position.z = z; decoGroup.add(m);
  }
}
function setupWeather(wx) {
  wxPoints.visible = !!wx; if (!wx) return;
  wxPoints.material.color.set(wx === 'snow' ? 0xf0f5ff : wx === 'ash' ? 0x999999 : wx === 'rain' ? 0xaabedc : wx === 'sand' ? 0xdcb478 : 0xff8c32);
  wxPoints.material.size = wx === 'rain' ? 0.003 : 0.004;
  wxData = []; for (let k = 0; k < 240; k++) wxData.push({ x: -0.48 + Math.random() * 0.96, y: Math.random() * 0.32, z: -0.19 + Math.random() * 0.32, s: 0.5 + Math.random() });
  wxPoints.userData.wx = wx;
}
function tickWeather(dt) {
  if (!wxPoints.visible) return; const wx = wxPoints.userData.wx, a = wxPoints.geometry.attributes.position;
  const vy = wx === 'rain' ? -0.5 : wx === 'ember' ? 0.035 : wx === 'snow' ? -0.03 : wx === 'ash' ? -0.02 : -0.01;
  const vx = wx === 'sand' ? 0.08 : wx === 'rain' ? -0.03 : 0.006;
  wxData.forEach((p, k) => { p.y += vy * p.s * dt; p.x += vx * p.s * dt; if (p.y < 0) p.y = 0.32; if (p.y > 0.32) p.y = 0; if (p.x > 0.48) p.x = -0.48; if (p.x < -0.48) p.x = 0.48; a.setXYZ(k, p.x, p.y, p.z); });
  a.needsUpdate = true;
}

/* ---------------- birlik atlası ---------------- */
// Oyunun kendi 2D çizimleri (drawFig) kare kare bir dokuya basılır; maketteki her asker bu karelerden birini gösterir.
const ATLAS = {};
const WALK_N = 8, ATK_N = 3;
function atlasFor(key, look, mounted) {
  if (ATLAS[key]) return ATLAS[key];
  const dragon = !!look.dragon;
  const cw = dragon ? 256 : 128, ch = dragon ? 224 : 128, ox = dragon ? 120 : 50, oy = dragon ? 214 : 124;
  const c = canvas(cw * WALK_N, ch * ATK_N), x = c.getContext('2d');
  for (let a = 0; a < ATK_N; a++) for (let w = 0; w < WALK_N; w++) {
    x.save(); x.translate(w * cw + ox, a * ch + oy); x.scale(F, F);
    const walk = w / WALK_N * Math.PI * 2, atk = a / (ATK_N - 1);
    if (mounted) { H.drawHorse(x, walk, look.horse, w > 0); x.translate(-2, -23); }
    H.drawFig(x, look, walk, atk, w > 0 && !mounted);
    x.restore();
  }
  const tex = texOf(c); tex.magFilter = THREE.LinearFilter;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide });
  const hit = mat.clone(); hit.color.set(0xff9090);
  // dünya boyutu (oyun pikseli): hücre / F
  return (ATLAS[key] = { tex, mat, hit, cw, ch, ox, oy, wPx: cw / F, hPx: ch / F, dxPx: (cw / 2 - ox) / F, dyPx: (oy - ch / 2) / F });
}

const unitViews = new Map();
const shadowGeo = new THREE.CircleGeometry(1, 16), shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false });
const barBg = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.65, depthWrite: false });
const barMats = { 0: new THREE.MeshBasicMaterial({ color: 0x6ac05a }), 1: new THREE.MeshBasicMaterial({ color: 0xd04a4a }), h: new THREE.MeshBasicMaterial({ color: 0xf5d36b }) };
function viewFor(u) {
  let v = unitViews.get(u); if (v) return v;
  const key = u.isHero ? 'alp' + (u.tier || 0) : u.id, A = atlasFor(key + (u.mounted ? '_m' : ''), u.look, u.mounted);
  const g = new THREE.Group();
  const sh = new THREE.Mesh(shadowGeo, shadowMat); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.0015;
  const r = (u.look.dragon ? 50 : 11 * (u.mounted ? 1.7 : 1)) * u.sc * PX * US; sh.scale.set(r, u.look.dragon ? 0.006 : 3 * u.sc * PX * 1.6, 1); g.add(sh);
  const bb = new THREE.Group(); g.add(bb);
  const ss = u.sc * US;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(A.wPx * PX * ss, A.hPx * PX * ss), A.mat);
  plane.position.set(A.dxPx * PX * ss, A.dyPx * PX * ss, 0); bb.add(plane);
  // can çubuğu
  const w = (u.isHero ? 34 : 22) * Math.min(u.sc, 1.6) * PX, top = (u.look.dragon ? 104 * u.sc : 46 * u.sc + (u.mounted ? 23 : 0) + (u.look.float ? 8 : 0) + 4) * PX * US;
  const hb = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.001, 0.003), barBg); hb.position.y = top; bb.add(hb);
  const hf = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.002), u.isHero ? barMats.h : barMats[u.side]); hf.position.set(0, top, 0.0003); bb.add(hf);
  v = { g, bb, plane, hb, hf, w, A, fr: -1 }; unitViews.set(u, v); unitLayer.add(g);
  return v;
}
function setFrame(v, wi, ai) {
  const f = ai * WALK_N + wi; if (f === v.fr) return; v.fr = f;
  const u0 = wi / WALK_N, u1 = (wi + 1) / WALK_N, v0 = 1 - (ai + 1) / ATK_N, v1 = 1 - ai / ATK_N, uv = v.plane.geometry.attributes.uv;
  uv.setXY(0, u0, v1); uv.setXY(1, u1, v1); uv.setXY(2, u0, v0); uv.setXY(3, u1, v0); uv.needsUpdate = true;
}
function dropView(u, v) { unitLayer.remove(v.g); v.plane.geometry.dispose(); v.hb.geometry.dispose(); v.hf.geometry.dispose(); unitViews.delete(u); }

/* ---------------- mermiler, parçacıklar, yazılar ---------------- */
const PROJ = {
  arrow: [new THREE.BoxGeometry(0.016, 0.0012, 0.0012), new THREE.MeshBasicMaterial({ color: 0xe8dcc0 })],
  bomb: [new THREE.SphereGeometry(0.0045, 10, 8), new THREE.MeshStandardMaterial({ color: 0x111111 })],
  fire: [new THREE.SphereGeometry(0.006, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffb347 })],
  orb: [new THREE.SphereGeometry(0.004, 10, 8), null],
  rain: [new THREE.SphereGeometry(0.005, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffcc55 })],
};
const projPool = { arrow: [], bomb: [], fire: [], orb: [], rain: [] };
const coinPool = [], coinGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.0012, 14), coinMat = new THREE.MeshBasicMaterial({ color: 0xf5d36b });
function projMesh(kind, idx, col) {
  const pool = projPool[kind]; let m = pool[idx];
  if (!m) { const [geo, mat] = PROJ[kind]; m = new THREE.Mesh(geo, mat || new THREE.MeshBasicMaterial({ color: 0xb48aff })); pool.push(m); projLayer.add(m); }
  if (kind === 'orb' && col) m.material.color.set(col);
  m.visible = true; return m;
}
let partPts, flashMesh;
function buildParticles() {
  const n = 800, geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  partPts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.004, vertexColors: true, transparent: true, depthWrite: false }));
  board.add(partPts);
  flashMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.11, 0.2), new THREE.MeshBasicMaterial({ color: 0xff8c28, transparent: true, opacity: 0, depthWrite: false }));
  board.add(flashMesh);
}
const tmpCol = new THREE.Color();
const textPool = [];
function textSprite(i) {
  let t = textPool[i];
  if (!t) { const c = canvas(128, 40), tex = texOf(c); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.0125), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); t = { c, tex, m, txt: '' }; textPool.push(t); board.add(m); }
  t.m.visible = true; return t;
}
function makeBanner() {
  const c = canvas(1024, 96), tex = texOf(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.056), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.position.set(0, 0.3, -0.05); board.add(m);
  return { c, tex, m, txt: '' };
}

/* ---------------- paneller (HUD, sonuç, mola) ---------------- */
function makePanel(w, h, pw, ph) {
  const c = canvas(w, h), tex = texOf(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  return { c, tex, m, w, h, btns: [] };
}
function buildPanels() {
  hudPanel = makePanel(1280, 236, 0.84, 0.155);
  hudPanel.m.position.set(0, 0.012, 0.22); hudPanel.m.rotation.x = -0.95; ui.add(hudPanel.m);
  resPanel = makePanel(900, 520, 0.5, 0.289); resPanel.m.position.set(0, 0.22, 0.02); resPanel.m.visible = false; ui.add(resPanel.m);
  pausePanel = makePanel(900, 360, 0.44, 0.176); pausePanel.m.position.set(0, 0.2, 0.03); pausePanel.m.visible = false; ui.add(pausePanel.m);
  mapPanel = makePanel(900, 640, 0.5, 0.356); mapPanel.m.position.set(0, 0.215, 0.04); mapPanel.m.visible = false; ui.add(mapPanel.m);
  banner = makeBanner(); buildParticles();
}
const ICONS = {};
function unitIcon(U) {
  if (ICONS[U.id]) return ICONS[U.id];
  const c = canvas(120, 100), x = c.getContext('2d'); x.translate(U.mounted ? 52 : 58, 94); x.scale(1.45, 1.45);
  if (U.mounted) { H.drawHorse(x, 0, H.LOOK[U.id].horse, false); x.translate(-2, -23); }
  H.drawFig(x, H.LOOK[U.id], 0, 0, false);
  return (ICONS[U.id] = c);
}
let hudKey = '';
function drawHud(force) {
  const B = H.B; if (!B) return;
  const k = [Math.floor(B.food), Math.floor(B.mana), B.cds.map(v => Math.ceil(v * 4)).join(','), B.speed, B.paused, B.heroIn, B.slots.join(','), B.pw.join(',')].join('|');
  if (k === hudKey && !force) return; hudKey = k;
  const P = hudPanel, c = P.c.getContext('2d'); P.btns = [];
  c.clearRect(0, 0, P.w, P.h);
  rr(c, 4, 4, P.w - 8, P.h - 8, 22); const g = c.createLinearGradient(0, 0, 0, P.h); g.addColorStop(0, '#3a5240'); g.addColorStop(1, '#1a2a1c'); c.fillStyle = g; c.fill();
  c.strokeStyle = '#c8a23a'; c.lineWidth = 5; c.stroke();
  const btn = (id, x, y, w, h, fn) => { P.btns.push({ id, x, y, w, h, fn }); };
  const card = (x, y, w, h, on, glow) => { rr(c, x, y, w, h, 12); c.fillStyle = on ? '#f2ecd6' : '#8a8570'; c.fill(); c.strokeStyle = glow ? '#ffb347' : '#8a7f5c'; c.lineWidth = glow ? 6 : 3; c.stroke(); };
  // Alp Er ◀ ▶
  for (const [d, x] of [[-1, 22], [1, 132]]) {
    card(x, 30, 98, 176, true, B.heroIn === d);
    c.fillStyle = '#2c3e2f'; c.font = 'bold 54px ' + FONT; c.textAlign = 'center'; c.fillText(d < 0 ? '◀' : '▶', x + 49, 132);
    c.font = 'bold 18px ' + FONT; c.fillText('Alp Er', x + 49, 190);
    btn('hero' + d, x, 30, 98, 176, null);
  }
  // erzak
  c.textAlign = 'center'; c.fillStyle = '#f2ecd6'; c.font = '18px ' + FONT; c.fillText('ERZAK', 296, 70);
  c.fillStyle = '#f5d36b'; c.font = 'bold 56px ' + FONT; c.fillText(Math.floor(B.food), 296, 132);
  c.fillStyle = '#f2ecd6'; c.font = '18px ' + FONT; c.fillText('+' + (B.foodRate * (B.moral || 1)).toFixed(1) + '/sn', 296, 166);
  // birlik kartları
  B.slots.forEach((ui, k) => {
    const U = H.UNITS[ui], x = 366 + k * 128, un = H.unitUnlocked(U), ban = H.unitBanned(U), poor = B.food < U.cost;
    card(x, 30, 118, 176, un && !ban);
    c.save(); if (!un || ban) c.globalAlpha = 0.4; c.drawImage(unitIcon(U), x - 1, 52); c.restore();
    c.fillStyle = '#1d2a1f'; c.font = 'bold ' + (U.ad.length > 10 ? 15 : 18) + 'px ' + FONT; c.textAlign = 'left'; c.fillText(U.ad, x + 8, 52);
    if (U.unique) { c.fillStyle = '#c8a23a'; c.font = 'bold 22px ' + FONT; c.textAlign = 'right'; c.fillText('★', x + 112, 78); }
    c.textAlign = 'center'; c.font = 'bold 20px ' + FONT; c.fillStyle = (un && !ban && poor) ? '#a8322a' : '#1d2a1f';
    c.fillText(ban ? 'Yok' : un ? U.cost + ' erzak' : 'Bölüm ' + U.unlock, x + 59, 196);
    if (B.cds[k] > 0) { c.fillStyle = 'rgba(20,30,20,.55)'; const hh = 176 * B.cds[k] / U.cd; c.fillRect(x, 30 + 176 - hh, 118, hh); }
    btn('unit' + k, x, 30, 118, 176, () => H.trySpawn(k));
  });
  // seçilen iki güç
  const SH = { ates: 'Ateş', ok: 'Ok', mancinik: 'Mancınık', boru: 'Boru', gurz: 'Gürz', kurt: 'Kurtlar' };
  B.pw.forEach((id, k) => { const x = 1138, y = 30 + k * 64, P = H.PW(id), cost = H.pwCost(id), rd = B.mana >= cost;
    card(x, y, 118, 58, true, rd);
    c.save(); rr(c, x, y, 118, 58, 12); c.clip(); const fw = 118 * Math.min(1, B.mana / cost); const fg = c.createLinearGradient(x, 0, x + 118, 0); fg.addColorStop(0, '#c8401f'); fg.addColorStop(1, '#ffb347'); c.fillStyle = fg; c.globalAlpha = 0.8; c.fillRect(x, y, fw, 58); c.restore();
    c.fillStyle = '#1d2a1f'; c.textAlign = 'left'; c.font = '26px ' + FONT; c.fillText(P.ic, x + 6, y + 38); c.font = 'bold 18px ' + FONT; c.fillText(SH[id], x + 40, y + 26); c.font = '15px ' + FONT; c.fillText(cost + ' ocak', x + 40, y + 47);
    btn('pw' + k, x, y, 118, 58, () => H.power(k)); });
  // hız, mola, konum
  const sm = (id, x, label, fn) => { card(x, 162, 36, 44, true); c.fillStyle = '#1d2a1f'; c.font = 'bold 17px ' + FONT; c.textAlign = 'center'; c.fillText(label, x + 18, 191); btn(id, x, 162, 36, 44, fn); };
  const smY = 160;
  sm('speed', 1138, '×' + B.speed, () => { B.speed = B.speed >= 3 ? 1 : B.speed + 1; });
  sm('pause', 1179, '❚❚', () => setVrPause(true));
  sm('place', 1220, '⌖', () => { placed = false; });
  P.tex.needsUpdate = true;
}
function panelButtons(P, list) { P.btns = list; }
function drawResult(r) {
  const P = resPanel, c = P.c.getContext('2d'); c.clearRect(0, 0, P.w, P.h);
  rr(c, 4, 4, P.w - 8, P.h - 8, 18); c.fillStyle = '#f2ecd6'; c.fill(); c.strokeStyle = '#b9ad84'; c.lineWidth = 4; c.stroke();
  c.save(); rr(c, 4, 4, P.w - 8, 64, 18); c.clip(); const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#4a6450'); g.addColorStop(1, '#2c3e2f'); c.fillStyle = g; c.fillRect(0, 0, P.w, 70); c.restore();
  c.fillStyle = '#c8a23a'; c.fillRect(4, 66, P.w - 8, 4);
  c.fillStyle = '#f2ecd6'; c.font = 'bold 26px ' + FONT; c.textAlign = 'left'; c.fillText('Gelen Kutusu · Hisar Divanı', 30, 46);
  c.fillStyle = '#1d2a1f'; c.font = 'bold 42px ' + FONT;
  c.fillText(r.endless ? 'Sonsuz Dalga: ' + r.wave + ' dalga' : r.win ? (r.last ? 'Kara Kule yıkıldı!' : 'Zafer: ' + r.ad) : 'Hisar düştü', 30, 130);
  if (r.endless) { c.font = 'bold 26px ' + FONT; c.fillStyle = r.rec ? '#3f7a3a' : '#5a5444'; c.fillText((r.rec ? 'Yeni rekor! ' : '') + 'En iyi: ' + r.best + ' dalga', 30, 176); }
  if (r.win) { c.font = '52px ' + FONT; for (let k = 0; k < 3; k++) { c.fillStyle = k < r.stars ? '#c8a23a' : '#cfc6a6'; c.fillText('★', 30 + k * 58, 196); } }
  c.fillStyle = '#1d2a1f'; c.font = '26px ' + FONT;
  const rows = [['Leş', r.kills], ['Ganimet', r.gold + ' akçe']]; if (r.win || r.endless) rows.push([r.endless ? 'Dalga ödülü' : 'Zafer ödülü', r.bonus + ' akçe']); rows.push(['Hazine', r.hazine + ' akçe']);
  rows.forEach(([a, b], k) => { const y = (r.win || r.endless ? 250 : 200) + k * 38; c.textAlign = 'left'; c.fillText(a, 30, y); c.textAlign = 'right'; c.font = 'bold 26px ' + FONT; c.fillText(b, P.w - 30, y); c.font = '26px ' + FONT; c.strokeStyle = '#d4c9a4'; c.lineWidth = 2; c.beginPath(); c.moveTo(30, y + 12); c.lineTo(P.w - 30, y + 12); c.stroke(); });
  if (r.rk) { c.fillStyle = '#3f7a3a'; c.font = 'bold 22px ' + FONT; c.textAlign = 'left'; c.fillText('Yeni rütbe: ' + r.rk.ad, 300, 186); }
  const btns = [];
  const B2 = (label, x, w, primary, fn) => { rr(c, x, 432, w, 64, 10); const gg = c.createLinearGradient(0, 432, 0, 496); gg.addColorStop(0, primary ? '#5f9152' : '#8a8570'); gg.addColorStop(1, primary ? '#3a6232' : '#5f5a48'); c.fillStyle = gg; c.fill(); c.fillStyle = '#fff'; c.font = 'bold 28px ' + FONT; c.textAlign = 'center'; c.fillText(label, x + w / 2, 474); btns.push({ id: label, x, y: 432, w, h: 64, fn }); };
  B2('Haritaya Dön', 30, 260, false, () => openMap(r.win ? r.i + 1 : r.i));
  if (r.endless) { B2('Tekrar ▸', 550, 320, true, () => startVrEndless()); panelButtons(P, btns); P.tex.needsUpdate = true; P.m.visible = true; return; }
  B2('Tekrar', 310, 220, false, () => startVrLevel(r.i));
  if (r.win && !r.last) B2('Devam ▸', 550, 320, true, () => { H.setCurReg(Math.floor((r.i + 1) / H.PG)); startVrLevel(r.i + 1); });
  else if (!r.win) B2('Tekrar ▸', 550, 320, true, () => startVrLevel(r.i));
  panelButtons(P, btns); P.tex.needsUpdate = true; P.m.visible = true;
}
function drawPause() {
  const P = pausePanel, c = P.c.getContext('2d'); c.clearRect(0, 0, P.w, P.h);
  rr(c, 4, 4, P.w - 8, P.h - 8, 18); c.fillStyle = '#f2ecd6'; c.fill(); c.strokeStyle = '#b9ad84'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#1d2a1f'; c.textAlign = 'center'; c.font = 'bold 44px ' + FONT; c.fillText('Mola', P.w / 2, 90);
  c.font = '24px ' + FONT; c.fillText('Ordu bekliyor. Yerini değiştirdiysen ⌖ ile alanı önüne getir.', P.w / 2, 136);
  const btns = [];
  const B2 = (label, x, w, primary, fn) => { rr(c, x, 230, w, 80, 12); const gg = c.createLinearGradient(0, 230, 0, 310); gg.addColorStop(0, primary ? '#5f9152' : '#b84a3c'); gg.addColorStop(1, primary ? '#3a6232' : '#7c2a21'); c.fillStyle = gg; c.fill(); c.fillStyle = '#fff'; c.font = 'bold 32px ' + FONT; c.fillText(label, x + w / 2, 282); btns.push({ id: label, x, y: 230, w, h: 80, fn }); };
  { rr(c, 250, 158, 400, 56, 12); c.fillStyle = '#c8a23a'; c.fill(); c.fillStyle = '#1d2a1f'; c.font = 'bold 26px ' + FONT; c.fillText('👁 Görünüm: ' + VIEWS[view].ad + ' ▸', 450, 196); btns.push({ id: 'view', x: 250, y: 158, w: 400, h: 56, fn: () => { cycleView(); drawPause(); } }); }
  B2('Haritaya Dön', 60, 360, false, () => openMap(H.B ? H.B.i : null));
  B2('Devam', 480, 360, true, () => setVrPause(false));
  panelButtons(P, btns); P.tex.needsUpdate = true;
}
function setVrPause(p) {
  const B = H.B; if (!B || B.over) return; B.paused = p; B.heroIn = 0; heroTarget = null; H.ambience(!p);
  pausePanel.m.visible = p; if (p) drawPause();
}


/* ---------------- VR içi sefer haritası + ordugâh (gözlüğü çıkarmadan bölüm seçimi ve geliştirme) ---------------- */
function wrap(c, txt, x, y, maxW, lh, maxLines) {
  const words = String(txt).split(' '); let line = '', n = 0;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { c.fillText(line, x, y + n * lh); n++; line = w; if (n >= maxLines) return; } else line = t; }
  if (line && n < maxLines) c.fillText(line, x, y + n * lh);
}
function topLv() { return Math.max(0, Math.min(S.unlocked, H.NLV) - 1); }
function drawMap() {
  const P = mapPanel, c = P.c.getContext('2d'), btns = []; c.clearRect(0, 0, P.w, P.h);
  rr(c, 4, 4, P.w - 8, P.h - 8, 18); c.fillStyle = '#f2ecd6'; c.fill(); c.strokeStyle = '#b9ad84'; c.lineWidth = 4; c.stroke();
  c.save(); rr(c, 4, 4, P.w - 8, 70, 18); c.clip(); const g = c.createLinearGradient(0, 0, 0, 70); g.addColorStop(0, '#4a6450'); g.addColorStop(1, '#2c3e2f'); c.fillStyle = g; c.fillRect(0, 0, P.w, 76); c.restore();
  c.fillStyle = '#c8a23a'; c.fillRect(4, 72, P.w - 8, 4);
  const tab = (id, label, x, w) => { const on = mapTab === id; rr(c, x, 14, w, 48, 10); c.fillStyle = on ? '#f2ecd6' : 'rgba(242,236,214,.18)'; c.fill(); c.fillStyle = on ? '#2c3e2f' : '#f2ecd6'; c.font = 'bold 24px ' + FONT; c.textAlign = 'center'; c.fillText(label, x + w / 2, 46); btns.push({ id: 'tab' + id, x, y: 14, w, h: 48, fn: () => { mapTab = id; } }); };
  tab('map', 'Sefer Haritası', 20, 230); tab('camp', 'Ordugâh', 262, 170);
  { rr(c, 444, 14, 236, 48, 10); c.fillStyle = '#c8a23a'; c.fill(); c.fillStyle = '#1d2a1f'; c.font = 'bold 21px ' + FONT; c.textAlign = 'center'; c.fillText('👁 ' + VIEWS[view].ad + ' ▸', 562, 45); btns.push({ id: 'view', x: 444, y: 14, w: 236, h: 48, fn: () => { cycleView(); } }); }
  c.fillStyle = '#f5d36b'; c.font = 'bold 26px ' + FONT; c.textAlign = 'right'; c.fillText(S.gold + ' akçe', P.w - 26, 47);
  const B2 = (label, x, y, w, h, kind, fn, dis) => { rr(c, x, y, w, h, 12); const gg = c.createLinearGradient(0, y, 0, y + h); const col = dis ? ['#cfc6a6', '#b9ad84'] : kind === 1 ? ['#5f9152', '#3a6232'] : kind === 2 ? ['#b84a3c', '#7c2a21'] : ['#8a8570', '#5f5a48']; gg.addColorStop(0, col[0]); gg.addColorStop(1, col[1]); c.fillStyle = gg; c.fill(); c.fillStyle = dis ? '#8a8570' : '#fff'; c.font = 'bold ' + Math.round(h * 0.42) + 'px ' + FONT; c.textAlign = 'center'; c.fillText(label, x + w / 2, y + h * 0.66); if (!dis) btns.push({ id: label, x, y, w, h, fn }); };
  if (mapTab === 'map') {
    const i = mapSel, L = H.LEVELS[i], R = H.REGIONS[L.region], M = H.MODS[L.mod], top = topLv();
    c.textAlign = 'left'; c.fillStyle = '#5a5444'; c.font = '24px ' + FONT; c.fillText((L.region + 1) + '. bölge · ' + R.ad, 30, 116);
    c.fillStyle = '#1d2a1f'; c.font = 'bold 50px ' + FONT; c.fillText('Bölüm ' + (i + 1), 30, 172);
    c.font = 'bold 30px ' + FONT; c.fillText(L.ad, 30, 214);
    c.font = '46px ' + FONT; const st = S.stars[i] || 0; for (let k = 0; k < 3; k++) { c.fillStyle = k < st ? '#c8a23a' : '#d4c9a4'; c.fillText('★', 640 + k * 74, 172); }
    let y = 258; c.font = '22px ' + FONT; c.fillStyle = '#3a3a2a';
    if (L.boss) { c.fillStyle = '#7c2a21'; c.font = 'bold 23px ' + FONT; c.fillText('☠ Dev: ' + H.FOES[L.boss].ad + (L.boss2 ? ' ve ' + H.FOES[L.boss2].ad : ''), 30, y); y += 34; }
    if (M) { c.fillStyle = '#2c3e2f'; c.font = 'bold 23px ' + FONT; c.fillText(M.ic + ' ' + M.ad + ':', 30, y); c.font = '22px ' + FONT; const w0 = c.measureText(M.ic + ' ' + M.ad + ': ').width; wrap(c, M.d, 30 + w0, y, P.w - 60 - w0, 28, 1); y += 34; }
    c.fillStyle = '#3a3a2a'; c.font = '22px ' + FONT; wrap(c, L.brief, 30, y, P.w - 60, 28, Math.max(1, Math.floor((404 - y) / 28)));
    const nav = [['« 10', -10], ['‹', -1], ['›', 1], ['10 »', 10]];
    nav.forEach(([lb, d], k) => { const j = Math.max(0, Math.min(top, i + d)); B2(lb, 30 + k * 132, 440, 120, 66, 0, () => { mapSel = j; mapDressT = 0.35; }, j === i); });
    B2('Son bölüm', 568, 440, 140, 66, 0, () => { mapSel = top; mapDressT = 0.35; }, i === top);
    if (S.unlocked >= H.ENDLESS_AT) B2('♾ Sonsuz', 718, 440, 152, 66, 2, () => startVrEndless());
    B2('Oyundan Çık', 30, 534, 300, 76, 2, () => endXR());
    B2('Sefere Çık ▸', 350, 534, 520, 76, 1, () => playFromMap());
  } else {
    H.UPS.forEach((u, k) => {
      const y = 84 + k * 48, l = S.up[u.id], mx = H.upMax(u), max = l >= mx, cost = H.upCost(u, l);
      c.textAlign = 'left'; c.fillStyle = '#1d2a1f'; c.font = 'bold 21px ' + FONT; c.fillText(u.ad + (u.id === 'silah' ? ' · ' + H.SILAH[l].ad : ''), 30, y + 22);
      c.fillStyle = '#5a5444'; c.font = '14px ' + FONT; wrap(c, u.desc, 30, y + 40, 420, 16, 1);
      c.fillStyle = '#1d2a1f'; c.font = 'bold 20px ' + FONT; c.textAlign = 'center'; c.fillText(l + ' / ' + mx, 530, y + 24);
      c.fillStyle = '#d4c9a4'; c.fillRect(470, y + 32, 120, 7); c.fillStyle = '#c8a23a'; c.fillRect(470, y + 32, 120 * l / mx, 7);
      B2(max ? 'Tamam' : 'Geliştir · ' + cost, 620, y + 4, 250, 40, 1, () => { if (S.up[u.id] >= mx || S.gold < cost) return; S.gold -= cost; S.up[u.id]++; H.save(); H.SFX.upgrade(); }, max || S.gold < cost);
      c.strokeStyle = '#d4c9a4'; c.lineWidth = 2; c.beginPath(); c.moveTo(30, y + 47); c.lineTo(P.w - 30, y + 47); c.stroke();
    });
    B2('Sefer Haritası ▸', 350, 534, 520, 76, 1, () => { mapTab = 'map'; });
  }
  panelButtons(P, btns); P.tex.needsUpdate = true;
}
function openMap(i) {
  const B = H.B; if (B && !B.over) { B.paused = true; H.ambience(false); }
  mapOpen = true; mapTab = 'map';
  mapSel = Math.max(0, Math.min(topLv(), i == null ? topLv() : i));
  resPanel.m.visible = false; pausePanel.m.visible = false; hudPanel.m.visible = false; banner.m.visible = false;
  for (const [u, v] of unitViews) dropView(u, v);
  unitLayer.visible = projLayer.visible = false; heroTarget = null; holdHero.clear();
  dressBoard(mapSel); mapDressT = -1;
  drawMap(); mapPanel.m.visible = true;
}
function playFromMap() {
  mapOpen = false; mapPanel.m.visible = false; hudPanel.m.visible = true; banner.m.visible = true; unitLayer.visible = projLayer.visible = true;
  H.setCurReg(Math.floor(mapSel / H.PG)); startVrLevel(mapSel);
}

/* ---------------- girdi: el / kumanda ışını ---------------- */
const ctrls = [], ray = new THREE.Raycaster(), tmpM = new THREE.Matrix4();
let heroTarget = null, holdHero = new Map();
function buildControllers() {
  for (let k = 0; k < 2; k++) {
    const c = renderer.xr.getController(k); scene.add(c);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xf5d36b, transparent: true, opacity: 0.6 })); line.scale.z = 0.6; c.add(line);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.004, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe08a })); dot.visible = false; scene.add(dot);
    c.userData = { line, dot };
    c.addEventListener('selectstart', () => onSelect(c, true));
    c.addEventListener('selectend', () => onSelect(c, false));
    c.addEventListener('connected', e => { c.userData.hand = !!e.data.hand; });
    ctrls.push(c);
  }
}
function hitTargets() {
  if (mapOpen) return [mapPanel.m];
  const list = [hudPanel.m];
  if (resPanel.m.visible) list.unshift(resPanel.m);
  if (pausePanel.m.visible) list.unshift(pausePanel.m);
  list.push(baseTop);
  return list;
}
function castFrom(obj) {
  tmpM.identity().extractRotation(obj.matrixWorld);
  ray.ray.origin.setFromMatrixPosition(obj.matrixWorld);
  ray.ray.direction.set(0, 0, -1).applyMatrix4(tmpM);
  const hits = ray.intersectObjects(hitTargets(), false);
  return hits[0] || null;
}
function panelOf(mesh) { return mesh === mapPanel.m ? mapPanel : mesh === hudPanel.m ? hudPanel : mesh === resPanel.m ? resPanel : mesh === pausePanel.m ? pausePanel : null; }
function onSelect(c, down) {
  const h = castFrom(c);
  if (!down) { const d = holdHero.get(c); if (d) { holdHero.delete(c); if (H.B && H.B.heroIn === d) H.B.heroIn = 0; drawHud(true); } return; }
  if (!h) return;
  const P = panelOf(h.object);
  if (P) {
    const px = h.uv.x * P.w, py = (1 - h.uv.y) * P.h;
    const b = P.btns.find(b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h);
    if (!b) return;
    H.SFX.click();
    if (b.id === 'hero-1' || b.id === 'hero1') { const d = b.id === 'hero1' ? 1 : -1; if (H.B && !H.B.paused) { H.B.heroIn = d; heroTarget = null; holdHero.set(c, d); } drawHud(true); return; }
    if (b.fn) b.fn(); if (mapOpen) drawMap(); else drawHud(true); return;
  }
  if (h.object === baseTop && H.B && !H.B.over && !H.B.paused) {
    // maketin üstüne dokunmak: Alp Er oraya yürür
    const local = board.worldToLocal(h.point.clone());
    heroTarget = Math.max(118, Math.min(826, local.x / PX + 480));
    H.SFX.click();
  }
}
function updatePointers() {
  for (const c of ctrls) {
    const { line, dot } = c.userData; if (!line) continue;
    const h = castFrom(c);
    if (h) { line.scale.z = h.distance; dot.visible = true; dot.position.copy(h.point); }
    else { line.scale.z = 0.6; dot.visible = false; }
  }
}

/* ---------------- maketi yerleştir ---------------- */
const camPos = new THREE.Vector3(), camDir = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _zAx = new THREE.Vector3(0, 0, 1), _q = new THREE.Quaternion();
/* Görünümler: Masa (maket masada), Oda (savaş odanın zemininde), Sur Başı (Hisar'ın burcunda durursun, ordular ayağının dibinden ufka uzanır).
   Kamera hiçbir görünümde oyun tarafından hareket ettirilmez; sadece maketin ölçeği ve yeri değişir. */
const VIEWS = {
  // Harp Masası: alan önünden uzağa uzanır, sana doğru eğik büyük bir masada (Hisar yakında, Kara Kule karşı uçta)
  harp: { ad: 'Harp Masası', s: 1.35, lane: 4, ar: false, turn: 0, tilt: 18 * Math.PI / 180, ahead: 0.95, below: 0.22, uiAhead: 0.42 },
  sur: { ad: 'Sur Başı', s: 14, lane: 4, ar: false, turn: 0.3 },
  oda: { ad: 'Oda', s: 5, lane: 2, ar: true, turn: 0.2 },
};
const VIEW_ORDER = ['harp', 'sur', 'oda'];
let view = 'harp';
try { const v = localStorage.getItem('hisar_vr_gorunum2'); if (VIEWS[v]) view = v; } catch (e) {}
function applyView() {
  const V = VIEWS[view], big = V.s > 2, table = !!V.tilt;
  laneMul = V.lane;
  plinth.visible = plinth.userData.trim.visible = !big; backdrop.visible = false;
  // burçta bayrak gözünün dibinde dalgalanmasın
  hisarModel.userData.flag.visible = hisarModel.userData.pole.visible = view !== 'sur';
  for (const o of env.userData.poles) o.visible = !big;
  partPts.material.size = 0.004 * Math.max(1, V.s * 0.6); wxPoints.material.size = 0.004 * Math.max(1, V.s * 0.6);
  bars.p.mesh.position.set(big ? X(62) + 0.07 : X(62), big ? 0.17 : table ? 0.13 : 0.2, 0);
  hisarModel.scale.setScalar(view === 'harp' ? 0.55 : 1);
  env.userData.hills.visible = !V.ar || preview;
  const passthrough = mode === 'immersive-ar' && V.ar;
  env.visible = preview ? !(previewAr && V.ar) : !passthrough;
  if (renderer) renderer.setClearColor(0x000000, passthrough ? 0 : 1);
  for (const [u, v] of unitViews) dropView(u, v);
  placed = false;
}
function cycleView() {
  view = VIEW_ORDER[(VIEW_ORDER.indexOf(view) + 1) % VIEW_ORDER.length];
  try { localStorage.setItem('hisar_vr_gorunum2', view); } catch (e) {}
  applyView();
}
function placeBoard(cam) {
  cam.getWorldPosition(camPos); cam.getWorldDirection(camDir);
  camDir.y = 0; if (camDir.lengthSq() < 1e-4) camDir.set(0, 0, -1); camDir.normalize();
  const yaw = Math.atan2(camDir.x, camDir.z);
  // paneller her görünümde elinin altında: önünde, bel hizasında
  const V = VIEWS[view], ua = V.uiAhead || 0.62;
  ui.position.set(camPos.x + camDir.x * ua, Math.max(0.45, camPos.y - (V.tilt ? 0.5 : 0.42)), camPos.z + camDir.z * ua);
  ui.rotation.set(0, yaw + Math.PI, 0);
  if (V.tilt) {
    // Harp Masası: masanın ortası önünde ve göz hizasının biraz altında; uzak kenar sana doğru kalkık
    board.scale.setScalar(V.s);
    board.quaternion.setFromAxisAngle(_up, Math.atan2(-camDir.z, camDir.x));
    board.quaternion.multiply(_q.setFromAxisAngle(_zAx, V.tilt));
    board.position.set(camPos.x + camDir.x * V.ahead, Math.max(0.55, camPos.y - V.below), camPos.z + camDir.z * V.ahead);
    const fl = env.userData.floor; fl.position.set(0, 0, 0); fl.scale.setScalar(1);
  }
  else {
    // alan bakış yönünde uzanır: Hisar ayağının altında (Sur Başı) ya da hemen arkanda (Oda), Kara Kule ufukta
    board.scale.setScalar(V.s);
    // alan hafif çaprazdan uzanır: savaşı tam karşıdan değil, burcun köşesinden izler gibi (birlikler üst üste binmez)
    const fx = camDir.x * Math.cos(V.turn) - camDir.z * Math.sin(V.turn), fz = camDir.x * Math.sin(V.turn) + camDir.z * Math.cos(V.turn);
    board.rotation.set(0, Math.atan2(-fz, fx), 0);
    const hx = X(62) * V.s;                       // Hisar'ın yerel x'i (ölçekli)
    const ahead = view === 'sur' ? 0.3 : 0.9;     // oyuncu Hisar'ın merkezinden ne kadar önde
    const groundY = view === 'sur' ? -0.15 * V.s : 0; // Sur Başı: Hisar'ın damında durursun
    board.position.set(camPos.x - fx * (hx + ahead), groundY, camPos.z - fz * (hx + ahead));
    const fl = env.userData.floor; fl.position.set(camPos.x, groundY - 0.02, camPos.z); fl.scale.setScalar(view === 'sur' ? 5 : 1);
  }
  if (false) { const fl = env.userData.floor; fl.position.set(0, 0, 0); fl.scale.setScalar(1); }
  placed = true;
}

/* ---------------- sahneyi oyunla eşitle ---------------- */
const camLocal = new THREE.Vector3();
function sync(dt) {
  const B = H.B; if (!B) return;
  const cam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
  cam.getWorldPosition(camLocal); board.worldToLocal(camLocal);
  // Alp Er hedefe yürür
  if (heroTarget != null && !holdHero.size) { const d = heroTarget - B.hero.x; if (Math.abs(d) < 5 || B.hero.hp <= 0 || B.over) { B.heroIn = 0; heroTarget = null; } else B.heroIn = Math.sign(d); }
  // birlikler
  const seen = new Set();
  for (const u of B.units) {
    if (u.isHero && u.hp <= 0) continue;
    const v = viewFor(u); seen.add(u);
    const fy = u.look.float ? 7 + Math.sin(H.T * 3 + u.lane) * 2 : 0;
    v.g.position.set(X(u.x), fy * PX, Z(u.lane));
    v.bb.rotation.y = Math.atan2(camLocal.x - v.g.position.x, camLocal.z - v.g.position.z);
    const moving = u.state === 'walk' && !u.mounted ? 1 : (u.mounted && u.state === 'walk' ? 1 : 0);
    const wi = moving ? (Math.floor((((u.walk % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * WALK_N) || 1) : 0;
    const ai = Math.min(ATK_N - 1, Math.round(u.atkA * (ATK_N - 1)));
    setFrame(v, wi, ai);
    v.plane.scale.x = u.dir; v.plane.position.x = Math.abs(v.plane.position.x) * u.dir;
    v.plane.material = u.hitT > 0 ? v.A.hit : v.A.mat;
    const showBar = u.hp < u.max || u.isHero; v.hb.visible = v.hf.visible = showBar;
    if (showBar) { const p = Math.max(0, u.hp / u.max); v.hf.scale.x = Math.max(0.001, p); v.hf.position.x = -v.w * (1 - p) / 2; }
  }
  for (const [u, v] of unitViews) if (!seen.has(u)) dropView(u, v);
  // mermiler
  for (const k in projPool) for (const m of projPool[k]) m.visible = false;
  const cnt = { arrow: 0, bomb: 0, fire: 0, orb: 0, rain: 0 };
  for (const p of B.proj) {
    if (p.e < 0) continue;
    const q = p.e / p.dur, x = p.sx + (p.tx - p.sx) * q, y = p.sy + (p.ty - p.sy) * q - p.arc * 4 * q * (1 - q);
    const m = projMesh(p.kind, cnt[p.kind]++, p.col);
    m.position.set(X(x), Yh(y), 0.004);
    if (p.kind === 'arrow') { const q2 = Math.min(1, q + 0.03), x2 = p.sx + (p.tx - p.sx) * q2, y2 = p.sy + (p.ty - p.sy) * q2 - p.arc * 4 * q2 * (1 - q2); m.rotation.z = Math.atan2(-(y2 - y), x2 - x); }
  }
  for (const f of B.fires) for (const b of f.balls) { if (b.hit) continue; const m = projMesh('rain', cnt.rain++); m.position.set(X(b.x), Math.max(0, Yh(b.y)) * 0.5 + (b.y < 0 ? 0.25 : 0), 0); }
  let fl = 0; for (const f of B.fires) if (f.t > 0.5 && f.t < 0.9) { fl = 0.35 * (1 - (f.t - 0.5) / 0.4); flashMesh.position.set(X(f.cx), 0.055, 0); }
  flashMesh.material.opacity = fl; flashMesh.visible = fl > 0;
  // yerdeki ganimet
  for (let k = 0; k < B.coins.length && k < 80; k++) { const cn = B.coins[k]; let m = coinPool[k];
    if (!m) { m = new THREE.Mesh(coinGeo, coinMat); m.rotation.x = Math.PI / 2; coinPool[k] = m; projLayer.add(m); }
    m.visible = true; m.scale.setScalar(cn.big ? 1.6 : 1); m.position.set(X(cn.x), 0.004 + Math.abs(Math.sin(cn.t * 3 + cn.x)) * 0.002, Z(cn.lane)); m.rotation.z = cn.t * 3; }
  for (let k = Math.min(80, B.coins.length); k < coinPool.length; k++) coinPool[k].visible = false;
  // parçacıklar
  const pa = partPts.geometry.attributes.position, pc = partPts.geometry.attributes.color; let n = 0;
  for (const p of B.parts) { if (n >= 800) break; pa.setXYZ(n, X(p.x), Math.max(0.001, Yh(p.y)), ((n * 37) % 21 - 10) * LANE); tmpCol.set(p.col); const a = Math.min(1, p.life * 2); pc.setXYZ(n, tmpCol.r * a, tmpCol.g * a, tmpCol.b * a); n++; }
  for (let k = n; k < 800; k++) pa.setXYZ(k, 0, -10, 0);
  pa.needsUpdate = true; pc.needsUpdate = true;
  // uçan yazılar (+akçe)
  textPool.forEach(t => t.m.visible = false);
  B.texts.slice(0, 12).forEach((t, k) => { const s = textSprite(k); if (s.txt !== t.txt) { const c = s.c.getContext('2d'); c.clearRect(0, 0, 128, 40); c.font = 'bold 28px ' + FONT; c.textAlign = 'center'; c.lineWidth = 5; c.strokeStyle = '#000'; c.strokeText(t.txt, 64, 30); c.fillStyle = t.col; c.fillText(t.txt, 64, 30); s.tex.needsUpdate = true; s.txt = t.txt; }
    s.m.position.set(X(t.x), Yh(t.y), 0.02); s.m.rotation.y = Math.atan2(camLocal.x - s.m.position.x, camLocal.z - s.m.position.z); s.m.material.opacity = Math.min(1, t.life * 2); });
  // duyuru
  const bn = B.banner, bt = bn ? bn.txt : '';
  if (bt !== banner.txt) { const c = banner.c.getContext('2d'); c.clearRect(0, 0, 1024, 96); if (bn) { c.font = 'bold 60px ' + FONT; c.textAlign = 'center'; c.lineWidth = 9; c.strokeStyle = 'rgba(0,0,0,.85)'; c.strokeText(bt, 512, 70); c.fillStyle = bn.col; c.fillText(bt, 512, 70); } banner.tex.needsUpdate = true; banner.txt = bt; }
  banner.m.material.opacity = bn ? Math.min(1, bn.life * 2, (bn.max - bn.life) * 4 + 0.2) : 0;
  banner.m.rotation.y = Math.atan2(camLocal.x - banner.m.position.x, camLocal.z - banner.m.position.z);
  // üsler
  drawBar(bars.p, B.pBase); drawBar(bars.e, B.eBase);
  for (const b of [bars.p.mesh, bars.e.mesh]) b.rotation.y = Math.atan2(camLocal.x - b.position.x, camLocal.z - b.position.z);
  const fg = hisarModel.userData.flag.geometry.attributes.position, fb = hisarModel.userData.flagBase;
  for (let k = 0; k < fg.count; k++) { const x0 = fb[k * 3]; fg.setZ(k, Math.sin(H.T * 5 + x0 * 160) * 0.003 * (x0 + 0.02) / 0.04); }
  fg.needsUpdate = true;
  kuleModel.userData.eye.material.color.setHSL(0.78, 1, 0.45 + Math.sin(H.T * 3) * 0.15);
  const hs = view === 'harp' ? 0.55 : 1; hisarModel.scale.set(hs, hs * (view === 'sur' ? 1 : 0.75 + 0.25 * Math.max(0, B.pBase.hp / B.pBase.max)), hs); // burçtayken zemin ayağının altından kaymasın
  kuleModel.scale.y = 0.6 + 0.4 * Math.max(0, B.eBase.hp / B.eBase.max);
  tickWeather(dt);
  drawHud(false);
}

/* ---------------- döngü ---------------- */
let lastT = 0;
function frame() {
  const now = performance.now(); let dt = lastT ? (now - lastT) / 1000 : 0.016; lastT = now;
  if (!(dt > 0)) dt = 0.001; if (dt > 0.05) dt = 0.05;
  if (!placed && (renderer.xr.isPresenting || preview)) placeBoard(renderer.xr.isPresenting ? renderer.xr.getCamera() : camera);
  const B = H.B;
  if (mapOpen) { H.tick(dt); if (mapDressT > 0 && (mapDressT -= dt) <= 0) dressBoard(mapSel); }
  else if (B) {
    H.tick(dt);
    if (!B.paused) { for (let k = 0; k < B.speed; k++) H.step(dt); H.ambienceTick(dt); }
    sync(dt);
  }
  if (renderer.xr.isPresenting) updatePointers();
  renderer.render(scene, camera);
}

/* ---------------- giriş / çıkış ---------------- */
function startVrLevel(i) {
  resPanel.m.visible = false; pausePanel.m.visible = false; heroTarget = null; holdHero.clear();
  for (const [u, v] of unitViews) dropView(u, v);
  H.startLevel(i);                 // oyunun kendi bölüm kurulumu
  H.B.shake = 0;
  dressBoard(i); hudKey = ''; drawHud(true);
}
function startVrEndless() {
  mapOpen = false; mapPanel.m.visible = false; hudPanel.m.visible = true; banner.m.visible = true; unitLayer.visible = projLayer.visible = true;
  resPanel.m.visible = false; pausePanel.m.visible = false; heroTarget = null; holdHero.clear();
  for (const [u, v] of unitViews) dropView(u, v);
  H.startEndless(); H.B.shake = 0; dressBoard(H.B.i); hudKey = ''; drawHud(true);
}
async function enterXR(i, opts) {
  initRenderer();
  const modes = H.xrModes || {};
  mode = modes.ar ? 'immersive-ar' : 'immersive-vr';
  const opt = { optionalFeatures: ['local-floor', 'hand-tracking'] };
  try { session = await navigator.xr.requestSession(mode, opt); }
  catch (e) { if (mode === 'immersive-ar') { mode = 'immersive-vr'; session = await navigator.xr.requestSession(mode, opt); } else throw e; }
  window.__XR_ON = true; placed = false;
  scene.background = null; applyView();
  await renderer.xr.setSession(session);
  session.addEventListener('end', onEnd);
  if (opts && opts.map) openMap(i); else if (opts && opts.endless) startVrEndless(); else startVrLevel(i);
  renderer.setAnimationLoop(frame);
}
function onEnd() {
  mapOpen = false; if (mapPanel) mapPanel.m.visible = false; if (hudPanel) hudPanel.m.visible = true; if (unitLayer) unitLayer.visible = projLayer.visible = true; if (banner) banner.m.visible = true;
  session = null; window.__XR_ON = false; renderer.setAnimationLoop(null);
  const B = H.B; if (B && !B.over) { H.setPause(true); }
  for (const [u, v] of unitViews) dropView(u, v);
  if (!preview) H.show('levels');
  window.dispatchEvent(new Event('hisar-xr-end'));
}
function endXR() { if (session) session.end(); else if (preview) onEnd(); }

/* Masaüstü önizleme: ?masa=önizleme — ekran görüntüleri ve test için (kamera sabit, oturan oyuncu gözünden) */
function startPreview(i, opts) {
  preview = true; initRenderer(); window.__XR_ON = true;
  renderer.domElement.style.display = 'block';
  previewAr = !!(opts && opts.ar); if (opts && opts.view && VIEWS[opts.view]) view = opts.view; applyView();
  if (previewAr && VIEWS[view].ar) renderer.setClearColor(0x8a8478, 1);
  camera.position.set(0, 1.5, 0); camera.lookAt(0, VIEWS[view].tilt ? 1.0 : 0.4, VIEWS[view].tilt ? -0.9 : -4);
  placeBoard(camera);
  if (opts && opts.map) openMap(i); else if (opts && opts.endless) startVrEndless(); else startVrLevel(i);
  renderer.setAnimationLoop(frame);
}

/* 2D menüye bağla */
function bindUi() {
  const go = i => enterXR(i).catch(e => { console.warn(e); alert('Masadaki Savaş başlatılamadı: ' + (e && e.message || e)); });
  const lv = document.getElementById('lvVR');
  if (lv) lv.addEventListener('click', () => { document.getElementById('ovLv').classList.remove('on'); const i = H.selLv; if (i != null) go(i); });
  const pv = document.getElementById('prVR');
  if (pv) pv.addEventListener('click', () => { if (!H.prepCommit()) return; const e = H.prEnd; enterXR(H.prI, e ? { endless: true } : null).catch(err => console.warn(err)); });
  const mb = document.getElementById('bVR');
  if (mb) mb.addEventListener('click', () => { H.show('levels'); document.getElementById('bCur').click(); });
}
bindUi();
/* Meta Horizon Store uygulaması (?quest=1): açılır açılmaz masaya oturur (simgeye dokunuş kullanıcı etkileşimi sayılır).
   Olmazsa ekranı kaplayan tek bir "Masaya Otur" düğmesi çıkar. */
if (/[?&]quest=1/.test(location.search) && H.xrModes) {
  const gate = () => {
    if (document.getElementById('questGate')) return;
    const d = document.createElement('div'); d.id = 'questGate';
    d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:radial-gradient(#2c3e2f,#0d1410);color:#f2ecd6;font:bold 28px ' + FONT + ';cursor:pointer;text-align:center';
    d.innerHTML = '<div style="font-size:54px;color:#f5d36b">Hisar: Kara Gece</div><div style="padding:22px 44px;border-radius:16px;background:linear-gradient(#5f9152,#3a6232);border:3px solid #c8a23a">🥽 Masaya Otur</div><div style="font-size:18px;opacity:.7">Bir Mr. Anduv! yapımıdır.</div>';
    d.onclick = () => enterXR(null, { map: true }).then(() => d.remove()).catch(e => console.warn(e));
    document.body.appendChild(d);
  };
  enterXR(null, { map: true }).catch(gate);
  window.addEventListener('hisar-xr-end', gate);
}
window.HISAR_VR = { enterXR, startPreview, startVrLevel, placeBoard: () => placeBoard(renderer.xr.isPresenting ? renderer.xr.getCamera() : camera), get scene() { return scene; }, get renderer() { return renderer; }, get board() { return board; }, ctrls, drawHud, onSelect, cycleView, get view() { return view; }, castFrom, sync, setVrPause, openMap, get resPanel() { return resPanel; }, get mapPanel() { return mapPanel; }, get mapOpen() { return mapOpen; }, get mapSel() { return mapSel; } };
H.onResult = r => { if (window.__XR_ON) { H.B.shown = true; drawResult(r); } };
