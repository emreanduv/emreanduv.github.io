/* Malazgirt Akıncıları — VR "Harp Masası" (WebXR, Meta Quest)
   Bütün savaş alanı oyuncunun önündeki, ona doğru eğik bir harp masasının üstünde minyatür olarak oynanır.
   Oyuncu açık bir otağın (sefer çadırı) altındadır; çevrede ordugâh, tepeler ve bölümün havası (gün batımı, gece, yağmur, kar…) vardır.
   oyun.js'ten sonra çağrılır (VR_KUR köprüsü); oyun.js'in sahnesini, oyun durumunu (G, mode) ve işlevlerini kullanır.
   Denetim: çubuk sağa-sola ya da tetik basılıyken eli sağa-sola çekmek. Tetik: başla · devam · yeniden dene.
   B / Y: masayı bakılan yöne ve göz hizasına göre yeniden yerleştir. Sol çubuk yukarı-aşağı: masa yüksekliği. */
window.VR_KUR = function (O) {
  'use strict';
  const xr = navigator.xr;
  const M = window.MANTIK;
  const { scene, renderer, camera, $, t, fmt, D, SFX, NL, canPlay, startGame, previewLevel, show, unlockAudio, nextLevel, resize, frame } = O;
  // ölçek (1 oyun birimi = 1,8 cm), masa genişliği / derinliği, gözden uzaklığı ve göz hizasının altında kalışı, eğimi; ordunun masadaki yeri
  const TABLE = { s: 0.018, w: 1.15, d: 1.3, ahead: 0.8, below: 0.22, tilt: 18 * Math.PI / 180, army: 0.22 };
  const VR = window.VR = { on: false, test: new URLSearchParams(location.search).has('vrtest'), update, TABLE };
  const V3 = THREE.Vector3, M4 = THREE.Matrix4;

  /* ================= dünya ölçeğindeki her şey: W grubu (sahnenin dönüşümü her karede geri alınır) ================= */
  const W = new THREE.Group(); W.matrixAutoUpdate = false;
  const tableG = new THREE.Group(), yawG = new THREE.Group(), room = new THREE.Group();
  for (const g of [tableG, yawG, room]) { g.matrixAutoUpdate = false; W.add(g); }

  const lam = c => new THREE.MeshLambertMaterial({ color: c });
  const basic = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, fog: false }, o || {}));
  const wood = lam(0x6a4326), darkWood = lam(0x3e2716), brass = new THREE.MeshPhongMaterial({ color: 0xd4a33e, shininess: 70, specular: 0x7a5a24 });
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const tx = new THREE.CanvasTexture(c); return tx; };
  const glowTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const puffTex = canvasTex(128, 128, (g) => { for (let k = 0; k < 7; k++) { const x = 30 + Math.random() * 68, y = 44 + Math.random() * 40, rr = 18 + Math.random() * 22; const r = g.createRadialGradient(x, y, 0, x, y, rr); r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); } });
  const glow = (c, sz, add) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: c, transparent: true, depthWrite: false, fog: false, blending: add === false ? THREE.NormalBlending : THREE.AdditiveBlending })); s.scale.set(sz, sz, 1); return s; };

  /* ---------- harp masası (eğik yüzey: tableG) ---------- */
  const TW2 = TABLE.w / 2, TD2 = TABLE.d / 2;
  { const top = new THREE.Mesh(new THREE.BoxGeometry(TABLE.w + 0.1, 0.05, TABLE.d + 0.1), wood); top.position.y = -0.027; tableG.add(top);
    const under = new THREE.Mesh(new THREE.BoxGeometry(TABLE.w + 0.02, 0.06, TABLE.d + 0.02), darkWood); under.position.y = -0.08; tableG.add(under);
    // çerçeve: koyu ahşap kenar ve üstünde pirinç şerit
    for (const [w, d, x, z] of [[TABLE.w + 0.16, 0.06, 0, -TD2 - 0.05], [TABLE.w + 0.16, 0.06, 0, TD2 + 0.05], [0.06, TABLE.d + 0.04, -TW2 - 0.05, 0], [0.06, TABLE.d + 0.04, TW2 + 0.05, 0]]) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), darkWood); f.position.set(x, 0.0, z); tableG.add(f);
      const b = new THREE.Mesh(new THREE.BoxGeometry(w * (d > w ? 0.5 : 1), 0.012, d * (w > d ? 0.5 : 1)), brass); b.position.set(x, 0.03, z); tableG.add(b);
    }
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), brass); k.position.set(x * (TW2 + 0.05), 0.03, z * (TD2 + 0.05)); tableG.add(k); }
  }
  /* ---------- ayak, tabela (yalnızca yöne dönük: yawG; masanın ortası) ---------- */
  const legs = [];
  for (const x of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1, 10), darkWood); l.position.x = x * (TW2 - 0.12); yawG.add(l); legs.push(l); }
  const foot = new THREE.Mesh(new THREE.BoxGeometry(TABLE.w * 0.9, 0.05, 0.36), darkWood); yawG.add(foot);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(TABLE.w * 0.8, 0.04, 0.04), wood); yawG.add(bar);
  // tabela: bölüm, ordu sayısı, iletiler (masanın uzak kenarının üstünde, gözün biraz üstünde)
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256; const cx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.18), basic(0xffffff, { map: tex, transparent: true }));
  board.position.set(0, 0.36, -TD2 - 0.06); board.rotation.x = -0.08; yawG.add(board);
  let lastTxt = '';
  function drawBoard(l1, l2) {
    const k = l1 + '|' + l2; if (k === lastTxt) return; lastTxt = k;
    cx.clearRect(0, 0, 1024, 256);
    cx.fillStyle = 'rgba(12,28,52,.86)'; roundRect(8, 8, 1008, 240, 36); cx.fill();
    cx.strokeStyle = '#f0b232'; cx.lineWidth = 8; roundRect(8, 8, 1008, 240, 36); cx.stroke();
    cx.textAlign = 'center'; cx.fillStyle = '#fff'; cx.font = '800 76px "Baloo 2", sans-serif'; cx.fillText(l1, 512, 112);
    cx.fillStyle = '#ffe9a8'; cx.font = '700 46px "Baloo 2", sans-serif'; cx.fillText(l2, 512, 196);
    tex.needsUpdate = true;
  }
  function roundRect(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }

  /* ================= otağ, ordugâh, gökyüzü (room: oyuncunun durduğu yerin zemininde) ================= */
  // gökyüzü kubbesi: ufuktan tepeye renk geçişi (bölümün gök rengine göre boyanır)
  const domeGeo = new THREE.SphereGeometry(70, 32, 16); domeGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(domeGeo.attributes.position.count * 3), 3));
  const dome = new THREE.Mesh(domeGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); dome.renderOrder = -10; room.add(dome);
  const stars = (() => { const n = 500, p = new Float32Array(n * 3); for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, e = 0.08 + Math.random() * 1.45, r = 66; p[k * 3] = Math.cos(a) * Math.cos(e) * r; p[k * 3 + 1] = Math.sin(e) * r; p[k * 3 + 2] = Math.sin(a) * Math.cos(e) * r; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.85, fog: false, depthWrite: false })); })();
  room.add(stars);
  const sunS = glow(0xfff2c0, 9), sunCore = glow(0xffffff, 3.2); room.add(sunS); room.add(sunCore);
  // uzak dağlar ve yakın tepeler: tırtıklı bir halka
  function ring(r, hMin, hMax, seed) {
    const N = 96, pos = [], idx = []; let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const hs = []; for (let i = 0; i < N; i++) hs.push(hMin + rnd() * (hMax - hMin));
    for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, h = (hs[i % N] + hs[(i + 1) % N] + hs[(i + N - 1) % N]) / 3; pos.push(Math.cos(a) * r, -0.5, Math.sin(a) * r, Math.cos(a) * r, h, Math.sin(a) * r); }
    for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    return new THREE.Mesh(g, basic(0x888888, { side: THREE.DoubleSide }));
  }
  const mountains = ring(62, 5, 14, 7), hills = ring(44, 1.5, 5.5, 3); room.add(mountains); room.add(hills);
  const groundM = lam(0x8aa05a), ground = new THREE.Mesh(new THREE.CircleGeometry(66, 48), groundM); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; room.add(ground);
  // uzak katmanlar önce ve derinlik yazmadan çizilir: masanın, çadırların önüne hiçbir koşulda geçmezler
  mountains.renderOrder = -9; hills.renderOrder = -8; ground.renderOrder = -7; for (const m of [mountains, hills, ground]) m.material.depthWrite = false;
  // bulutlar: yavaşça dönen yumuşak öbekler
  const clouds = [];
  for (let k = 0; k < 9; k++) {
    const g = new THREE.Group(), a = k / 9 * Math.PI * 2 + Math.random() * 0.4;
    for (let j = 0; j < 4; j++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false, fog: false })); const sc = 8 + Math.random() * 7; sp.scale.set(sc, sc * 0.55, 1); sp.position.set((j - 1.5) * 4.5, Math.random() * 1.5, Math.random() * 2); g.add(sp); }
    g.userData = { a, r: 46 + Math.random() * 10, y: 15 + Math.random() * 10, v: 0.004 + Math.random() * 0.006 }; room.add(g); clouds.push(g);
  }
  // otağ: dört direk, çizgili kubbe, saçaklı etek, halı
  const PR = 2.1, CANOPY_Y = 3.0;
  const stripe = canvasTex(512, 64, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#f3e7cc' : '#b3202a'; g.fillRect(i * w / 16, 0, w / 16 + 1, h); } g.fillStyle = '#d4a33e'; g.fillRect(0, h - 6, w, 6); });
  stripe.wrapS = THREE.RepeatWrapping;
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(PR * 1.32, 1.1, 16, 1, true), new THREE.MeshLambertMaterial({ map: stripe, side: THREE.DoubleSide }));
  canopy.position.y = CANOPY_Y + 0.55; room.add(canopy);
  const fringe = canvasTex(512, 64, (g, w, h) => { g.fillStyle = '#b3202a'; g.fillRect(0, 0, w, 22); g.fillStyle = '#d4a33e'; g.fillRect(0, 18, w, 5); for (let i = 0; i < 32; i++) { g.fillStyle = i % 2 ? '#b3202a' : '#1f8f94'; g.beginPath(); g.moveTo(i * 16, 22); g.lineTo(i * 16 + 16, 22); g.lineTo(i * 16 + 8, 60); g.closePath(); g.fill(); } });
  const valance = new THREE.Mesh(new THREE.CylinderGeometry(PR * 1.32, PR * 1.32, 0.42, 32, 1, true), new THREE.MeshLambertMaterial({ map: fringe, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5 }));
  fringe.repeat.set(3, 1); fringe.wrapS = THREE.RepeatWrapping; valance.position.y = CANOPY_Y - 0.21; room.add(valance);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), brass); finial.position.y = CANOPY_Y + 1.15; room.add(finial);
  const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 16, Math.PI * 1.5), brass); crescent.position.y = CANOPY_Y + 1.42; crescent.rotation.z = Math.PI * 0.75; room.add(crescent);
  const poles = [];
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, CANOPY_Y, 10), darkWood); p.position.set(x * PR, CANOPY_Y / 2, z * PR); room.add(p); poles.push(p);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), brass); cap.position.set(x * PR, CANOPY_Y, z * PR); room.add(cap);
  }
  const rug = canvasTex(256, 256, (g) => { g.fillStyle = '#7a1e28'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#d4a33e'; g.lineWidth = 10; g.strokeRect(14, 14, 228, 228); g.strokeStyle = '#1f6f74'; g.lineWidth = 6; g.strokeRect(32, 32, 192, 192);
    g.fillStyle = '#d4a33e'; for (let i = 0; i < 4; i++) { g.save(); g.translate(128, 128); g.rotate(i * Math.PI / 2); g.beginPath(); g.moveTo(0, -70); g.lineTo(22, -30); g.lineTo(0, -10); g.lineTo(-22, -30); g.closePath(); g.fill(); g.restore(); } g.beginPath(); g.arc(128, 128, 12, 0, 7); g.fill(); });
  const rugM = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshLambertMaterial({ map: rug })); rugM.rotation.x = -Math.PI / 2; rugM.position.y = 0.004; room.add(rugM); rugM.renderOrder = -6; rugM.material.depthWrite = false;
  // meşaleler: ön direklerde ve masanın iki yanında (gece ve akşam yanar)
  const torches = [];
  for (const [x, y, z] of [[-PR, 1.85, -PR], [PR, 1.85, -PR], [-PR, 1.85, PR], [PR, 1.85, PR]]) {
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.22, 8), brass); holder.position.set(x * 0.97, y, z * 0.97); room.add(holder);
    const f = glow(0xffa040, 0.55), c = glow(0xfff0b0, 0.18); f.position.set(x * 0.97, y + 0.18, z * 0.97); c.position.copy(f.position); room.add(f); room.add(c); torches.push({ f, c, ph: Math.random() * 9 });
  }
  // ordugâh: çevrede çadırlar, sancaklar ve ateşler
  const tents = [], fires = [];
  { let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const cols = [0xf3e7cc, 0xb3202a, 0x1f8f94, 0xe8d6a8, 0x8a2a1e];
    for (let k = 0; k < 26; k++) {
      const a = rnd() * Math.PI * 2, r = 8.5 + rnd() * 16;
      if (Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))) < 0.55 && r < 14) continue;   // masanın baktığı yönü açık bırak
      const x = Math.cos(a) * r, z = Math.sin(a) * r, sc = 0.7 + rnd() * 0.6, c = cols[k % cols.length];
      const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(sc);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.9, 10), lam(c)); body.position.y = 0.45; g.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.1, 10), lam(k % 2 ? 0xb3202a : 0xf3e7cc)); roof.position.y = 1.45; g.add(roof);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), brass); tip.position.y = 2.05; g.add(tip);
      room.add(g); tents.push(g);
      if (k % 3 === 0) { const fp = new V3(x * 0.85, 0.25, z * 0.85); const fl = glow(0xff8a30, 1.2), wood2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.1, 8), lam(0x3a2a20)); fl.position.copy(fp); wood2.position.set(fp.x, 0.05, fp.z); room.add(fl); room.add(wood2); fires.push({ fl, ph: rnd() * 9 }); }
    }
  }
  // sancaklar: otağın önünde ve ordugâhta dalgalanan bayraklar
  const flagTex = (bg) => canvasTex(256, 160, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = '#d4a33e'; g.fillRect(0, 0, 14, h);
    g.fillStyle = '#f4e3b0'; g.beginPath(); g.arc(110, 80, 44, 0, 7); g.fill(); g.fillStyle = bg; g.beginPath(); g.arc(126, 80, 36, 0, 7); g.fill();
    g.fillStyle = '#f4e3b0'; g.save(); g.translate(170, 80); g.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? 9 : 22, aa = i * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.closePath(); g.fill(); g.restore(); });
  const flags = [];
  const flagMats = [flagTex('#b3202a'), flagTex('#1f8f94'), flagTex('#2a6a3a')].map(m => new THREE.MeshLambertMaterial({ map: m, side: THREE.DoubleSide }));
  for (const [x, z, h, mi] of [[-3.3, -2.8, 4.2, 0], [3.3, -2.8, 4.2, 1], [-6, 3.5, 4.6, 2], [7, 1.5, 4.8, 0], [-9, -7, 5, 1], [10, -8, 5, 0], [0, 9, 5.2, 0]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, h, 8), darkWood); pole.position.set(x, h / 2, z); room.add(pole);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), brass); top.position.set(x, h + 0.05, z); room.add(top);
    const geo = new THREE.PlaneGeometry(1.25, 0.78, 12, 4); geo.translate(0.625, 0, 0);
    const f = new THREE.Mesh(geo, flagMats[mi]); f.position.set(x, h - 0.45, z); room.add(f);
    flags.push({ f, base: Float32Array.from(geo.attributes.position.array), ph: Math.random() * 6 });
  }
  // otağın dışındaki yağmur ve kar (bölümün havasına göre)
  const RN = 900, rainPos = new Float32Array(RN * 6), rainSeed = [];
  for (let k = 0; k < RN; k++) { let x, z; do { x = (Math.random() - 0.5) * 30; z = (Math.random() - 0.5) * 30; } while (Math.abs(x) < PR * 1.4 && Math.abs(z) < PR * 1.4); rainSeed.push({ x, z, y: Math.random() * 10, v: 0.8 + Math.random() * 0.4, ph: Math.random() * 6 }); }
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainL = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xc8d4e4, transparent: true, opacity: 0.5, fog: false }));
  const snowP = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.95, depthWrite: false, fog: false }));
  for (const o of [rainL, snowP]) { o.frustumCulled = false; o.visible = false; room.add(o); }
  // sis günlerinde yere yakın sis bulutları
  const mist = [];
  for (let k = 0; k < 14; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false, fog: false })); const a = Math.random() * 6.283, r = 7 + Math.random() * 18; sp.position.set(Math.cos(a) * r, 1 + Math.random(), Math.sin(a) * r); sp.scale.set(14, 4, 1); sp.visible = false; room.add(sp); mist.push(sp); }

  /* ---------- performans: otağın ve ordugâhın kıpırdamayan parçaları birkaç çizime birleştirilir ----------
     (Quest'te her nesne her göz için ayrı çizilir; çadır, direk, pirinç süsler tek tek 100'ü aşkın çizim tutuyordu) */
  function bake(meshes, mat, colorize) {
    room.updateMatrixWorld(true);
    const pos = [], nor = [], col = [], nm = new THREE.Matrix3(), v = new V3(), c = new THREE.Color();
    for (const m of meshes) {
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry, P = g.attributes.position, N = g.attributes.normal;
      nm.getNormalMatrix(m.matrixWorld); c.copy(m.material.color);
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i).applyMatrix4(m.matrixWorld); pos.push(v.x, v.y, v.z);
        v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor.push(v.x, v.y, v.z);
        if (colorize) col.push(c.r, c.g, c.b);
      }
      m.parent.remove(m);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    if (colorize) geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const out = new THREE.Mesh(geo, mat); out.matrixAutoUpdate = false; room.add(out); return out;
  }
  {
    const brassL = [], woodL = [], colL = [];
    room.traverse(o => { if (!o.isMesh || o.parent === null) return;
      if (o.material === brass) brassL.push(o);
      else if (o.material === darkWood && !legs.includes(o)) woodL.push(o);
      else if (o.material.isMeshLambertMaterial && !o.material.map && !o.material.vertexColors && (tents.includes(o.parent) || o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.height === 0.1)) colL.push(o);
    });
    bake(brassL, brass, false); bake(woodL, darkWood, false); bake(colL, new THREE.MeshLambertMaterial({ vertexColors: true }), true);
    for (const g of tents) room.remove(g);
  }

  /* ---------- bölümün havasına göre boya ---------- */
  const _a = new THREE.Color(), _b = new THREE.Color(), _c = new THREE.Color();
  const SUN = { ogle: [0.4, 0.95, 0xfff6d8], sabah: [0.9, 0.2, 0xffd0a0], ikindi: [-0.8, 0.45, 0xffe2a0], aksam: [-0.6, 0.1, 0xff8040], gece: [0.7, 0.62, 0xd8e4ff], bulut: [0.4, 0.8, 0xffffff], yagmur: [0.4, 0.8, 0xffffff], sis: [0.4, 0.6, 0xffffff], bahar: [0.4, 0.9, 0xfff6d8], guz: [-0.5, 0.5, 0xffd8a0], kis: [0.5, 0.5, 0xfff8f0] };
  let moodKey = '';
  function paint() {
    const mood = O.mood ? O.mood() : 'ogle', Mo = (O.MOODS && O.MOODS[mood]) || {}, sky = scene.background;
    const key = mood + sky.getHex(); if (key === moodKey) return; moodKey = key;
    const night = !!Mo.torch, wet = !!Mo.rain, cloudy = mood === 'bulut' || wet || mood === 'sis';
    // gökyüzü: ufuk açık, tepe koyu ve maviye kayık
    const hor = _a.copy(sky).lerp(_c.set(night ? 0x3a4a7a : 0xffffff), night ? 0.25 : 0.28), zen = _b.copy(sky).multiplyScalar(night ? 0.45 : 0.78).lerp(_c.set(night ? 0x070c22 : 0x4a86c8), cloudy ? 0.12 : night ? 0.6 : 0.42);
    if (mood === 'aksam' || mood === 'sabah') hor.lerp(_c.set(mood === 'aksam' ? 0xff9a50 : 0xffc8a0), 0.4);
    const p = domeGeo.attributes.position, col = domeGeo.attributes.color;
    for (let i = 0; i < p.count; i++) { const k = Math.max(0, p.getY(i) / 70), m = Math.pow(k, 0.55); _c.copy(hor).lerp(zen, m); col.setXYZ(i, _c.r, _c.g, _c.b); }
    col.needsUpdate = true;
    // zemin ve tepeler: bölümün renk tonu
    const gc = _c.set(0x86a057); if (Mo.tint !== undefined && Mo.t) gc.lerp(_b.set(Mo.tint), Math.min(0.85, Mo.t * 1.4)); if (Mo.snow) gc.set(0xe8eef4); if (night) gc.multiplyScalar(0.5);
    groundM.color.copy(gc); groundM.emissive.copy(gc).multiplyScalar(night ? 0.55 : 0.12);
    hills.material.color.copy(gc).multiplyScalar(0.82).lerp(hor, mood === 'sis' ? 0.7 : wet ? 0.45 : 0.25);
    mountains.material.color.copy(gc).lerp(_b.set(Mo.snow ? 0xdfe8f0 : 0x6a7a96), 0.5).lerp(hor, mood === 'sis' ? 0.85 : wet ? 0.6 : 0.45);
    // güneş / ay
    const S = SUN[mood] || SUN.ogle, el = S[1], az = S[0];
    const dir = new V3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).multiplyScalar(60);
    sunS.position.copy(dir); sunCore.position.copy(dir); sunS.material.color.set(S[2]); sunCore.material.color.set(night ? 0xf4f6ff : 0xffffff);
    sunS.material.opacity = cloudy ? 0.25 : 0.9; sunCore.material.opacity = cloudy ? 0.2 : 1; sunS.scale.setScalar(night ? 5 : mood === 'aksam' ? 14 : 9); sunCore.scale.setScalar(night ? 2.4 : 3.4);
    stars.visible = night;
    for (const g of clouds) for (const sp of g.children) { sp.material.color.copy(night ? _c.set(0x4a5680) : wet ? _c.set(0x9aa2ac) : mood === 'aksam' ? _c.set(0xffc8a0) : _c.set(0xffffff)); sp.material.opacity = night ? 0.35 : cloudy ? 0.95 : 0.8; }
    clouds.forEach((g, i) => { g.visible = cloudy || i % 2 === 0 || night; });
    for (const tc of torches) { tc.f.visible = tc.c.visible = night || mood === 'aksam'; }
    for (const f of fires) f.fl.visible = night || mood === 'aksam' || mood === 'kis';
    rainL.visible = wet; snowP.visible = !!Mo.snow;
    mist.forEach(m => { m.visible = mood === 'sis' || wet; m.material.opacity = mood === 'sis' ? 0.55 : 0.3; });
    rainL.material.color.set(night ? 0x8090b0 : 0xc8d4e4);
  }
  let clock = 0;
  function animateRoom(dt) {
    clock += dt;
    for (const g of clouds) { g.userData.a += g.userData.v * dt; const u = g.userData; g.position.set(Math.cos(u.a) * u.r, u.y, Math.sin(u.a) * u.r); }
    for (const tc of torches) if (tc.f.visible) { const k = 1 + Math.sin(clock * 13 + tc.ph) * 0.12 + Math.sin(clock * 7.3 + tc.ph) * 0.1; tc.f.scale.setScalar(0.55 * k); tc.c.scale.setScalar(0.18 * k); }
    for (const fi of fires) if (fi.fl.visible) fi.fl.scale.setScalar(1.2 * (1 + Math.sin(clock * 11 + fi.ph) * 0.15));
    const wind = rainL.visible ? 1.6 : 1;
    for (const fl of flags) { const a = fl.f.geometry.attributes.position, b = fl.base;
      for (let i = 0; i < a.count; i++) { const x = b[i * 3], y = b[i * 3 + 1]; a.setZ(i, Math.sin(x * 5 - clock * 4.5 * wind + fl.ph) * 0.09 * x * wind + Math.sin(y * 3 + clock * 2) * 0.02 * x); }
      a.needsUpdate = true; fl.f.geometry.computeVertexNormals(); }
    if (rainL.visible || snowP.visible) {
      const rain = rainL.visible;
      for (let k = 0; k < RN; k++) { const p = rainSeed[k]; p.y -= (rain ? 9 : 0.7) * p.v * dt; if (p.y < 0) p.y += 10; if (!rain) p.ph += dt;
        const x = p.x + (rain ? 0 : Math.sin(p.ph) * 0.3), o = k * 6;
        rainPos[o] = x; rainPos[o + 1] = p.y; rainPos[o + 2] = p.z; rainPos[o + 3] = x + (rain ? 0.03 : 0); rainPos[o + 4] = p.y + (rain ? 0.32 : 0.005); rainPos[o + 5] = p.z; }
      rainGeo.attributes.position.needsUpdate = true;
    }
  }

  /* ================= masa yerleşimi: oyuncunun başına göre ================= */
  const rig = { pos: new V3(0, 1.2, 0), yaw: 0, floor: new V3(0, 0, 0), hAdj: 0 };
  let needCal = true, calT = 0;
  function calibrate() {
    const h = camera.position, f = new V3(0, 0, -1).applyQuaternion(camera.quaternion); f.y = 0;
    const ok = h.y > 0.3 && f.lengthSq() > 1e-4;
    const head = ok ? h.clone() : new V3(0, 1.2, 0), yaw = ok ? Math.atan2(-f.x, -f.z) : 0;
    rig.yaw = yaw; rig.floor.set(head.x, 0, head.z); rig.head = head; rig.hAdj = 0;
    needCal = false;
  }
  const mTable = new M4(), mYaw = new M4(), mRoom = new M4(), mScene = new M4(), _m = new M4(), _q = new THREE.Quaternion();
  function placeRig() {
    const fx = -Math.sin(rig.yaw), fz = -Math.cos(rig.yaw), h = rig.head || new V3(0, 1.2, 0);
    const c = new V3(h.x + fx * TABLE.ahead, Math.max(0.45, h.y - TABLE.below + rig.hAdj), h.z + fz * TABLE.ahead);
    mYaw.makeRotationY(rig.yaw).setPosition(c);
    mTable.copy(mYaw).multiply(_m.makeRotationX(TABLE.tilt));
    mRoom.makeRotationY(rig.yaw).setPosition(rig.floor);
    // ayaklar masanın altından yere
    const below = c.y - 0.1; for (const l of legs) { l.scale.y = below; l.position.y = -0.1 - below / 2; l.position.z = 0; }
    foot.position.y = -c.y + 0.025; bar.position.y = -c.y * 0.55;
    return c;
  }

  // minyatürü masanın sınırlarında kes (masanın kendi eksenlerinde, dünyaya çevrilerek)
  const clipLocal = [new THREE.Plane(new V3(1, 0, 0), TW2), new THREE.Plane(new V3(-1, 0, 0), TW2), new THREE.Plane(new V3(0, 0, 1), TD2), new THREE.Plane(new V3(0, 0, -1), TD2), new THREE.Plane(new V3(0, 1, 0), 0.004)];
  const clip = clipLocal.map(p => p.clone());
  function setClip() { for (let i = 0; i < clip.length; i++) clip[i].copy(clipLocal[i]).applyMatrix4(mTable); }
  // kırpma yalnızca savaş alanına: masa, otağ ve kumandalar kırpılmaz
  const clipped = new Set(); let clipT = 0;
  function clipAll() {
    scene.traverse(o => {
      if (o === W) return; let p = o.parent; while (p) { if (p === W) return; p = p.parent; }
      const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of ms) if (!clipped.has(m)) { m.clippingPlanes = clip; m.needsUpdate = true; clipped.add(m); }
    });
  }
  function unclipAll() { for (const m of clipped) { m.clippingPlanes = null; m.needsUpdate = true; } clipped.clear(); }

  /* ---------- performans: masanın dışında kalan (kırpılacak) nesneleri hiç çizme ----------
     Masa savaş alanının ~64 × 72 birimlik bir penceresini gösterir; at sırtında sis 110 birimden ötesini zaten yutar.
     Görünürlüğü oyun.js yönettiği için (ölen nesne gizlenir) burada katman (layer) kullanılır: 3. katmanı hiçbir kamera görmez. */
  const HIDE = 3, cullCache = new Map();
  function meshesOf(o) { let l = cullCache.get(o); if (!l) { l = []; o.traverse(m => { if (m.isMesh || m.isSprite || m.isPoints || m.isLine) l.push(m); }); cullCache.set(o, l); } return l; }
  // nesnenin oyun düzlemindeki kapladığı alan (bir kez hesaplanır; taşınan nesneler için konum farkı eklenir)
  const _bx = new THREE.Box3(), _mi = new M4(), _mm = new M4();
  function extentOf(o, grp) {
    let e = o.userData.vrExt;
    if (!e) {
      _bx.makeEmpty(); _mi.copy(grp.matrixWorld).invert(); let any = false;
      o.updateMatrixWorld(true);
      o.traverse(m => { if (!m.geometry) return; if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox.clone().applyMatrix4(_mm.multiplyMatrices(_mi, m.matrixWorld)); _bx.union(bb); any = true; });
      if (!any || !isFinite(_bx.min.x)) return null;
      e = o.userData.vrExt = { x0: _bx.min.x, x1: _bx.max.x, z0: _bx.min.z, z1: _bx.max.z, px: o.position.x, pz: o.position.z };
    }
    const dx = o.position.x - e.px, dz = o.position.z - e.pz;
    return dx || dz ? { x0: e.x0 + dx, x1: e.x1 + dx, z0: e.z0 + dz, z1: e.z1 + dz } : e;
  }
  function setHidden(o, h) { if (!!o.userData.vrHid === h) return; o.userData.vrHid = h; for (const m of meshesOf(o)) h ? m.layers.set(HIDE) : m.layers.set(0); }
  function cull(win) {
    const g = O.G(); if (!g) return;
    for (const grp of [O.levelGroup, O.world]) {
      if (!grp) continue;
      for (const o of grp.children) {
        if (o.isInstancedMesh) continue;   // yol boyu tek parça (orman, çalılar): her zaman
        const e = extentOf(o, grp); if (!e) continue;
        let hide;
        if (win) hide = e.z0 > win[1] + 36 + 2 || e.z1 < win[1] - 36 - 2 || e.x0 > win[0] + 32 + 2 || e.x1 < win[0] - 32 - 2;
        else hide = e.z1 < g.z - 120 || e.z0 > g.z + 25;
        setHidden(o, hide);
      }
    }
    if (cullCache.size > 4000) cullCache.clear();
  }
  function uncull() { for (const grp of [O.levelGroup, O.world]) if (grp) for (const o of grp.children) if (o.userData.vrHid) setHidden(o, false); cullCache.clear(); }

  /* ---------- her kare ---------- */
  // görüş kenarı karartması (yalnız at sırtında): kameraya bağlı halka
  const vigTex = canvasTex(256, 256, (g) => { const r = g.createRadialGradient(128, 128, 40, 128, 128, 128); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(0.55, 'rgba(0,0,0,.6)'); r.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); });
  const vig = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: vigTex, color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false }));
  vig.position.z = -0.2; vig.renderOrder = 20; vig.visible = false; camera.add(vig);
  let rideX = null;
  function toggleRide() { VR.ride = !VR.ride; rideX = null; say(t(VR.ride ? 'At sırtı: sipahinin gözünden' : 'Harp masasına dönüldü'), 2.5); if (!VR.ride) unclipAll(); clipT = 0; }
  let boardT = 0, camXv = 0, camZv = 0, grab = null, btnPrev = {}, msgT = 0, msg = '';
  function update(dt) {
    if (needCal && !VR.test) { calT += dt; if ((calT > 0.25 && renderer.xr.isPresenting && camera.position.y > 0.3 && camera.position.y < 2.4) || calT > 1.5) calibrate(); }
    const s = TABLE.s, g = O.G();
    camXv += (g.x * 0.6 - camXv) * Math.min(1, dt * 4); camZv += (g.z - camZv) * Math.min(1, dt * 6);
    const c = placeRig();
    if (VR.ride) {
      // at sırtı: savaş alanı gerçek boyda, oyuncunun başı sipahinin eyerinde (göz 2,2 m)
      const b = O.binek().position, h = rig.head || new V3(0, 1.2, 0);
      mScene.makeTranslation(h.x, h.y - 2.2 - b.y * 0.6, h.z).multiply(_m.makeRotationY(rig.yaw)).multiply(_m.makeTranslation(-b.x, 0, -(b.z + 0.3)));
      const fx = -Math.sin(rig.yaw), fz = -Math.cos(rig.yaw);
      mYaw.makeRotationY(rig.yaw).setPosition(h.x + fx * 1.5, h.y - 0.26, h.z + fz * 1.5);
      // yanlara kayarken görüş kenarları kararır (mide bulantısına karşı)
      const vx = Math.abs(b.x - (rideX === null ? b.x : rideX)) / Math.max(dt, 1e-3); rideX = b.x;
      vig.material.opacity += (Math.min(0.8, vx * 0.09) - vig.material.opacity) * Math.min(1, dt * 8);
    } else {
    // sahne = masa · ölçek · (savaş alanında masanın ortasına gelecek nokta)
    const ax = camXv, ay = -0.4, az = camZv - TABLE.army / s;
    mScene.copy(mTable).multiply(_m.makeScale(s, s, s)).multiply(_m.makeTranslation(-ax, -ay, -az));
    }
    tableG.visible = room.visible = !VR.ride; for (const o of [...legs, foot, bar]) o.visible = !VR.ride;
    board.visible = !VR.ride || msgT > 0 || O.mode() !== 'play'; vig.visible = !!VR.ride && vig.material.opacity > 0.02;
    renderer.localClippingEnabled = !VR.ride;
    scene.matrixAutoUpdate = false; scene.matrix.copy(mScene); scene.matrixWorldNeedsUpdate = true;
    W.matrix.copy(mScene).invert(); W.matrixWorldNeedsUpdate = true;
    tableG.matrix.copy(mTable); yawG.matrix.copy(mYaw); room.matrix.copy(mRoom);
    for (const o of [tableG, yawG, room]) o.matrixWorldNeedsUpdate = true;
    setClip();
    if (VR.ride) { const Mo = (O.MOODS && O.MOODS[O.mood()]) || {}, fg = Mo.fog || [70, 200]; scene.fog.near = fg[0]; scene.fog.far = fg[1]; if (O.precip) { O.precip[0].visible = !!Mo.rain; O.precip[1].visible = !!Mo.snow; } }
    else {
    scene.fog.near = 1e5; scene.fog.far = 2e5;   // minyatürde sis yok
    if (O.precip) for (const p of O.precip) p.visible = false;   // yağmur/kar otağın dışında, gerçek boyda yağar
    }
    if ((clipT -= dt) <= 0) { clipT = 0.5; clipAll(); }
    cull(VR.ride ? null : [camXv, camZv - TABLE.army / s]);
    paint(); animateRoom(dt);
    if (!VR.test) { readInput(dt); swing(dt); }
    const pv = updatePanel(dt);
    for (const sw of swords) sw.visible = !!VR.ride && O.mode() === 'play' && !pv;
    for (const c of [VR.ctrl0, VR.ctrl1]) { const lb = c && c.userData.lab && c.userData.lab(); if (lb) lb.visible = !VR.ride || pv; }
    board.visible = board.visible && !pv;
    // tabela
    const lv = t('Bölüm {n}', { n: g.i + 1 });
    if (msgT > 0) { msgT -= dt; drawBoard(lv, msg); }
    else if (O.mode() === 'play') { if ((boardT -= dt) <= 0) { boardT = 0.25; drawBoard(lv + ' · ' + fmt(g.count) + (g.heroes ? ' +' + g.heroes : ''), g.L.ad); } }   // tabela en çok saniyede 4 kez yeniden çizilir
    else if (O.mode() === 'over') drawBoard(O.lastRes() && O.lastRes().win ? t('ZAFER!') + ' ' + '★'.repeat(O.lastRes().stars) : t('GERİ ÇEKİL!'), O.lastRes() && O.lastRes().win ? t('Tetiğe bas: devam') : t('Tetiğe bas: yeniden dene'));
    else drawBoard(lv, t('Menüden seç'));
  }
  function say(m, sec) { msg = m; msgT = sec || 2.5; }

  // VR'da öğrenirken daha kolay: her bölüm başında ordu biraz daha büyük başlar
  let boosted = null;
  function easyStart() {
    const g = O.G(); if (!g || O.mode() !== 'play' || boosted === g) return;
    boosted = g; const k = g.i < 20 ? 2 : 1.4; g.count = Math.round(g.count * k) + (g.i < 20 ? 6 : 3);
  }
  const right = new V3();
  function readInput(dt) {
    easyStart();
    const session = renderer.xr.getSession(); if (!session) return;
    for (const src of session.inputSources) {
      const gp = src.gamepad; if (!gp) continue;
      const ax = gp.axes.length >= 4 ? gp.axes[2] : gp.axes[0] || 0, ay = gp.axes.length >= 4 ? gp.axes[3] : gp.axes[1] || 0;
      if (O.mode() === 'play' && Math.abs(ax) > 0.15) O.G().tx += ax * 14 * dt;
      // sol çubuk yukarı-aşağı: masa yüksekliği
      // A / X: at sırtı ⇄ harp masası
      const ax4 = gp.buttons[4] && gp.buttons[4].pressed, k4 = src.handedness + '4';
      if (ax4 && !btnPrev[k4]) toggleRide();
      btnPrev[k4] = ax4;
      if (!VR.ride && src.handedness === 'left' && Math.abs(ay) > 0.5) rig.hAdj = Math.max(-0.5, Math.min(0.4, rig.hAdj - ay * 0.35 * dt));
      // yan tuş (tutamak): duraklat ⇄ devam
      const gr = gp.buttons[1] && gp.buttons[1].pressed, k1 = src.handedness + '1';
      if (gr && !btnPrev[k1] && O.mode() === 'play') { const pz = O.paused && O.paused(); if (pz) O.pause(false); else O.pause(true); }
      btnPrev[k1] = gr;
      // B / Y: masayı bakılan yöne ve göz hizasına göre yeniden yerleştir
      const by = gp.buttons[5] && gp.buttons[5].pressed, key = src.handedness + '5';
      if (by && !btnPrev[key]) { calibrate(); say(t('Masa önüne alındı'), 1.5); }
      btnPrev[key] = by;
    }
    // tetik/çimdik basılıyken elle sürükle (masanın sağ-sol ekseninde)
    if (grab && O.mode() === 'play') {
      right.set(Math.cos(rig.yaw), 0, -Math.sin(rig.yaw));
      const p = grab.ctrl.position, d = (p.x - grab.p.x) * right.x + (p.z - grab.p.z) * right.z;
      O.G().tx += d * (VR.ride ? 2.2 : 0.9 / TABLE.s); grab.p.copy(p);
    }
  }

  function labelPlane(lines) {
    const c2 = document.createElement('canvas'); c2.width = 512; c2.height = 64 + 56 * lines.length; const g = c2.getContext('2d');
    g.fillStyle = 'rgba(12,28,52,.85)'; g.fillRect(0, 0, c2.width, c2.height); g.strokeStyle = '#f0b232'; g.lineWidth = 6; g.strokeRect(3, 3, c2.width - 6, c2.height - 6);
    g.fillStyle = '#fff'; g.font = '700 40px "Baloo 2", sans-serif'; g.textAlign = 'center';
    lines.forEach((l, i) => g.fillText(l, 256, 70 + i * 56));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12 * c2.height / 512), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c2), transparent: true, depthTest: false, fog: false }));
    m.renderOrder = 10; return m;
  }

  /* ---------- kumandalar ve eller ---------- */
  const swords = [], prevP = [new V3(), new V3()], hasPrev = [false, false];
  for (let k = 0; k < 2; k++) {
    const c = renderer.xr.getController(k);
    c.addEventListener('selectstart', () => {
      unlockAudio();
      if (panelClick(c)) return;
      if (O.mode() === 'play') { grab = { ctrl: c, p: c.position.clone() }; return; }
      act();
    });
    c.addEventListener('selectend', () => { if (grab && grab.ctrl === c) grab = null; });
    // kumanda ucunda küçük altın ok
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.05, 8), brass); tip.rotation.x = -Math.PI / 2; tip.position.z = -0.03; c.add(tip);
    // kumandanın üstünde ne işe yaradığını yazan küçük etiket (hangi elde olduğu bilinince)
    let lab = null; const sw = makeSword(); c.add(sw); swords.push(sw); c.userData.lab = () => lab;
    c.addEventListener('connected', e => {
      c.userData.src = e.data;
      if (lab) c.remove(lab);
      const left = e.data && e.data.handedness === 'left';
      lab = labelPlane(left ? [t('Tetik: seç / sürükle'), t('Çubuk ↕: masa yüksekliği'), t('X: at sırtı ⇄ masa'), t('Y: masayı önüne al'), t('Yan tuş: duraklat')] : [t('Tetik: seç / sürükle'), t('Çubuk: yönlendir'), t('A: at sırtı ⇄ masa'), t('B: masayı önüne al'), t('At sırtında: savur, vur!')]);
      lab.position.set(0, 0.07, -0.02); lab.rotation.x = -0.7; c.add(lab);
    });
    VR['ctrl' + k] = c;
  }
  // kilitli bölüm: mağaza destekliyorsa (Quest) ödeme ekranı gözlükte açılır, alınınca bölüm başlar
  let buying = false;
  function locked(i) {
    if (!O.buyFull) { say(t('Tam Sürüm gerekli: ana menüden alabilirsin'), 4); return; }
    if (buying) return; buying = true; say(t('Tam Sürüm: ödeme ekranı açılıyor…'), 3);
    O.buyFull().then(ok => { buying = false; if (ok) { say(t('Tam sürüm açıldı. Hayırlı seferler!'), 3); startGame(i); } else say(t('Tam Sürüm\'ü Quest\'te Meta Horizon Store uygulamasından alabilirsin.'), 4); });
  }
  function act() {
    if (O.mode() === 'over' && O.lastRes()) {
      const i = O.lastRes().win ? Math.min(NL - 1, O.lastRes().i + 1) : O.lastRes().i;
      if (!canPlay(i)) { locked(i); return; }
      startGame(i); return;
    }
    if (O.mode() === 'menu' || O.mode() === 'over') { const i = nextLevel(); if (!canPlay(i)) { locked(i); return; } startGame(i); }
  }
  /* ================= VR menüsü: havada duran pano (ana menü, bölümler, ordugâh, ayarlar, duraklat, sonuç) =================
     Kumandadan çıkan ışınla seçilir, tetikle tıklanır. Oyun sırasında gizlidir; yan tuş (tutamak) oyunu duraklatıp panoyu açar. */
  const PW = 1024, PH = 768, pcv = document.createElement('canvas'); pcv.width = PW; pcv.height = PH; const px = pcv.getContext('2d');
  const ptex = new THREE.CanvasTexture(pcv);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), basic(0xffffff, { map: ptex, transparent: true, depthTest: false }));   // masanın ve atın önünde kalsın
  const panelG = new THREE.Group(); panelG.matrixAutoUpdate = false; panelG.add(panel); W.add(panelG); panel.renderOrder = 30;
  let eraseTxt = '';
  let pScr = 'ana', pDirty = true, pHover = -1, pBtns = [], lvSef = -1, lvPage = 0, pRedrawT = 0;
  const S_ = () => O.S();
  function rr(x, y, w, h, r) { px.beginPath(); px.moveTo(x + r, y); px.arcTo(x + w, y, x + w, y + h, r); px.arcTo(x + w, y + h, x, y + h, r); px.arcTo(x, y + h, x, y, r); px.arcTo(x, y, x + w, y, r); px.closePath(); }
  function btn(x, y, w, h, l1, l2, cb, o) {
    o = o || {}; const i = pBtns.length; pBtns.push({ x, y, w, h, cb: o.dis ? null : cb });
    const hov = i === pHover && !o.dis;
    px.fillStyle = o.dis ? 'rgba(80,90,105,.55)' : o.gold ? (hov ? '#ffd86a' : '#f0b232') : o.sel ? '#2bb9be' : hov ? '#2a5a92' : 'rgba(29,63,110,.95)';
    rr(x, y, w, h, 18); px.fill(); px.lineWidth = hov ? 6 : 3; px.strokeStyle = hov ? '#fff2b0' : 'rgba(240,178,50,.8)'; rr(x, y, w, h, 18); px.stroke();
    px.textAlign = 'center'; px.fillStyle = o.gold ? '#3a2200' : o.dis ? '#c8ced6' : '#fff';
    px.font = '800 ' + (o.fs || 40) + 'px "Baloo 2", sans-serif'; px.fillText(l1, x + w / 2, y + (l2 ? h / 2 + 2 : h / 2 + (o.fs || 40) * 0.36));
    if (l2) { px.font = '700 ' + (o.fs2 || 26) + 'px "Baloo 2", sans-serif'; px.fillStyle = o.gold ? '#5a3a00' : '#ffe9a8'; px.fillText(l2, x + w / 2, y + h / 2 + 34); }
  }
  function head(title, back) {
    px.textAlign = 'center'; px.fillStyle = '#fff'; px.font = '800 50px "Baloo 2", sans-serif'; px.fillText(title, PW / 2, 78);
    if (back) btn(26, 26, 110, 70, '‹', '', () => go(back), { fs: 56 });
    const s = S_(); px.textAlign = 'right'; px.font = '700 30px "Baloo 2", sans-serif'; px.fillStyle = '#ffe9a8'; px.fillText(fmt(s.coins) + ' ' + t('akçe'), PW - 34, 72);
  }
  function go(s) { pScr = s; pDirty = true; SFX.click(); }
  function play(i) { if (!canPlay(i)) { locked(i); return; } SFX.click(); startGame(i); }
  function drawPanel() {
    pBtns = []; px.clearRect(0, 0, PW, PH);
    px.fillStyle = 'rgba(10,24,46,.93)'; rr(6, 6, PW - 12, PH - 12, 40); px.fill(); px.strokeStyle = '#f0b232'; px.lineWidth = 8; rr(6, 6, PW - 12, PH - 12, 40); px.stroke();
    const s = S_(), g = O.G(), m = O.mode(), r = O.lastRes();
    if (pScr === 'ana') {
      px.textAlign = 'center'; px.fillStyle = '#f0b232'; px.font = '800 30px "Baloo 2", sans-serif'; px.fillText('☾ 1071 · 1453 ✸', PW / 2, 70);
      px.fillStyle = '#fff'; px.font = '800 92px "Baloo 2", sans-serif'; px.fillText('MALAZGİRT', PW / 2, 160);
      px.fillStyle = '#2bb9be'; rr(PW / 2 - 190, 178, 380, 62, 14); px.fill(); px.fillStyle = '#fff'; px.font = '800 40px "Baloo 2", sans-serif'; px.fillText('AKINCILARI', PW / 2, 224);
      px.fillStyle = '#ffe9a8'; px.font = '700 30px "Baloo 2", sans-serif'; px.fillText(fmt(s.coins) + ' ' + t('akçe') + '   ·   ' + t('{a} / {b} yıldız', { a: O.totalStars(), b: NL * 3 }), PW / 2, 290);
      const i = nextLevel(); btn(162, 316, 700, 120, t('SEFERE ÇIK'), t('Bölüm {n}', { n: i + 1 }) + ' · ' + M.LEVELS[i].ad, () => play(i), { gold: 1, fs: 52, fs2: 28 });
      btn(162, 456, 340, 92, t('Bölümler'), '', () => { lvSef = M.seferOf(nextLevel()); lvPage = -1; go('bolum'); });
      btn(522, 456, 340, 92, t('Ordugâh'), '', () => go('ordu'));
      const paid = O.buyFull && !s.full;
      btn(162, 566, paid ? 340 : 700, 82, t('Ayarlar'), '', () => go('ayar'));
      if (paid) btn(522, 566, 340, 82, '★ ' + t('Tam Sürüm'), '', () => locked(nextLevel()), { gold: 1 });
      px.fillStyle = 'rgba(255,255,255,.6)'; px.font = '600 24px "Baloo 2", sans-serif'; px.fillText(t('A / X: at sırtı ⇄ harp masası') + '   ·   ' + t('Yan tuş: duraklat'), PW / 2, 696);
      px.fillText('Bir Mr. Anduv! yapımıdır.', PW / 2, 734);
    } else if (pScr === 'bolum') {
      const SF = M.SEFERLER[lvSef], a0 = M.SEF0[lvSef], n = SF.n, per = 40, pages = Math.ceil(n / per);
      if (lvPage < 0) lvPage = Math.max(0, Math.min(pages - 1, Math.floor((nextLevel() - a0) / per)));
      head('', 'ana');
      btn(150, 30, 80, 70, '◀', '', () => { lvSef--; lvPage = 0; pDirty = true; SFX.click(); }, { dis: lvSef <= 0, fs: 40 });
      btn(PW - 330, 30, 80, 70, '▶', '', () => { lvSef++; lvPage = 0; pDirty = true; SFX.click(); }, { dis: lvSef >= M.SEFERLER.length - 1 || M.SEF0[lvSef + 1] + 1 > s.unlocked, fs: 40 });
      px.textAlign = 'center'; px.fillStyle = '#fff'; px.font = '800 36px "Baloo 2", sans-serif'; px.fillText(t('{n}. Sefer: {a}', { n: lvSef + 1, a: SF.ad }), PW / 2 - 70, 64);
      px.fillStyle = '#ffe9a8'; px.font = '600 24px "Baloo 2", sans-serif'; px.fillText(SF.yil + ' · ' + SF.alt, PW / 2 - 70, 96);
      const k0 = lvPage * per;
      for (let k = k0; k < Math.min(n, k0 + per); k++) {
        const i = a0 + k, j = k - k0, cx2 = 40 + (j % 8) * 118, cy2 = 124 + Math.floor(j / 8) * 112, lock = i + 1 > s.unlocked, st = s.stars[i] || 0;
        btn(cx2, cy2, 104, 98, lock ? '🔒' : String(i + 1), lock ? '' : '★'.repeat(st) + '☆'.repeat(3 - st), () => play(i), { dis: lock, sel: i === nextLevel(), fs: 34, fs2: 22 });
      }
      if (pages > 1) {
        btn(300, 690, 140, 60, '◀', '', () => { lvPage--; pDirty = true; SFX.click(); }, { dis: lvPage <= 0, fs: 34 });
        px.fillStyle = '#fff'; px.font = '700 28px "Baloo 2", sans-serif'; px.textAlign = 'center'; px.fillText((lvPage + 1) + ' / ' + pages, PW / 2, 730);
        btn(PW - 440, 690, 140, 60, '▶', '', () => { lvPage++; pDirty = true; SFX.click(); }, { dis: lvPage >= pages - 1, fs: 34 });
      }
    } else if (pScr === 'ordu') {
      head(t('Ordugâh'), 'ana'); const cap = O.upCapNow();
      M.UPG.forEach((u, k) => {
        const l = s.up[u.k], max = l >= cap, cost = max ? 0 : M.upCost(u, l), y = 128 + k * 150;
        px.fillStyle = 'rgba(29,63,110,.6)'; rr(40, y, PW - 80, 136, 20); px.fill();
        px.textAlign = 'left'; px.fillStyle = '#fff'; px.font = '800 36px "Baloo 2", sans-serif'; px.fillText(u.ad, 68, y + 48);
        px.fillStyle = '#ffe9a8'; px.font = '700 24px "Baloo 2", sans-serif'; px.fillText(t('SEVİYE {a} / {b}', { a: l, b: cap }), 68, y + 84);
        px.fillStyle = 'rgba(255,255,255,.75)'; px.font = '600 22px "Baloo 2", sans-serif'; px.fillText(String(u.desc(l)).slice(0, 52), 68, y + 116);
        btn(PW - 330, y + 28, 270, 82, max ? t(cap < M.UPMAX ? 'YENİ SEFERDE' : 'EN ÜST') : fmt(cost) + ' ' + t('akçe'), '', () => {
          const s2 = S_(); if (s2.coins < cost) return; s2.coins -= cost; s2.up[u.k]++; if (s2.up[u.k] >= M.UPMAX) O.achieve('ORDUGAH'); O.persist(); SFX.buy(); pDirty = true;
          if (O.mode() === 'menu') previewLevel(nextLevel());
        }, { dis: max || s.coins < cost, gold: !max && s.coins >= cost, fs: 32 });
      });
    } else if (pScr === 'ayar') {
      head(t('Ayarlar'), 'ana');
      const row = (y, label) => { px.textAlign = 'left'; px.fillStyle = '#fff'; px.font = '700 34px "Baloo 2", sans-serif'; px.fillText(label, 70, y + 52); };
      const click = sel => () => { const el = document.querySelector(sel); if (el) el.click(); pDirty = true; };
      row(130, t('Dil')); btn(440, 130, 240, 80, 'Türkçe', '', click('#setLang [data-v="tr"]'), { sel: D.lang === 'tr' }); btn(700, 130, 240, 80, 'English', '', click('#setLang [data-v="en"]'), { sel: D.lang === 'en' });
      row(240, t('Ses')); btn(440, 240, 240, 80, t('Açık'), '', () => { if (!S_().sound) click('#sndBtn')(); }, { sel: s.sound }); btn(700, 240, 240, 80, t('Kapalı'), '', () => { if (S_().sound) click('#sndBtn')(); }, { sel: !s.sound });
      row(350, t('Mehter (müzik)') + '  ' + s.vol.mus);
      const vol = d => () => { const el = document.getElementById('setMus'); el.value = Math.max(0, Math.min(100, S_().vol.mus + d)); el.dispatchEvent(new Event('input')); O.persist(); pDirty = true; SFX.click(); };
      btn(440, 350, 240, 80, '−', '', vol(-20), { fs: 50 }); btn(700, 350, 240, 80, '+', '', vol(20), { fs: 50 });
      row(460, t('Görüş')); btn(440, 460, 240, 80, t('Harp masası'), '', () => { if (VR.ride) toggleRide(); pDirty = true; }, { sel: !VR.ride, fs: 32 }); btn(700, 460, 240, 80, t('At sırtı'), '', () => { if (!VR.ride) toggleRide(); pDirty = true; }, { sel: !!VR.ride, fs: 32 });
      row(660, t('Oyun verileri')); btn(440, 660, 500, 72, eraseTxt || t('Verilerimi sil'), '', () => { const done = O.eraseData && O.eraseData(); eraseTxt = done ? t('Silindi') : t('Emin misin? Tekrar dokun'); if (!done) setTimeout(() => { eraseTxt = ''; pDirty = true; }, 4000); pDirty = true; }, { fs: 30 });
      if (O.buyFull && !s.full) { row(570, t('Tam Sürüm')); btn(440, 570, 500, 80, '★ ' + t('Satın al'), '', () => locked(nextLevel()), { gold: 1 }); }
    } else if (pScr === 'durak') {
      head(t('Duraklatıldı'));
      btn(212, 170, 600, 120, t('DEVAM'), g ? t('Bölüm {n}', { n: g.i + 1 }) + ' · ' + g.L.ad : '', () => { SFX.click(); O.pause(false); }, { gold: 1, fs: 52 });
      btn(212, 320, 600, 96, t('Bölümü yeniden başlat'), '', () => { SFX.click(); startGame(g.i); });
      btn(212, 436, 290, 96, t('Ordugâh'), '', () => go('ordu'));
      btn(522, 436, 290, 96, t('Ayarlar'), '', () => go('ayar'));
      btn(212, 552, 600, 96, t('Ana menü'), '', () => { SFX.click(); O.setPaused(false); previewLevel(nextLevel()); O.setMode('menu'); show(null); pScr = 'ana'; pDirty = true; });
    } else if (pScr === 'sonuc' && r) {
      const win = r.win; px.textAlign = 'center'; px.fillStyle = win ? '#f0b232' : '#ff8a8f'; px.font = '800 86px "Baloo 2", sans-serif'; px.fillText(win ? t('ZAFER!') : t('GERİ ÇEKİL!'), PW / 2, 130);
      if (win) { px.font = '800 70px "Baloo 2", sans-serif'; px.fillStyle = '#ffd86a'; px.fillText('★'.repeat(r.stars) + '☆'.repeat(3 - r.stars), PW / 2, 220); }
      px.fillStyle = '#fff'; px.font = '700 34px "Baloo 2", sans-serif'; px.fillText('+' + fmt(r.gain || 0) + ' ' + t('akçe') + '  ·  ' + t('Bölüm {n}', { n: r.i + 1 }), PW / 2, win ? 284 : 220);
      const nx = win ? Math.min(NL - 1, r.i + 1) : r.i;
      btn(212, 320, 600, 120, win ? t('DEVAM') : t('YENİDEN DENE'), t('Bölüm {n}', { n: nx + 1 }) + ' · ' + M.LEVELS[nx].ad, () => play(nx), { gold: 1, fs: 52 });
      if (win) btn(212, 456, 600, 90, t('Yeniden oyna'), '', () => play(r.i));
      btn(212, win ? 562 : 456, 290, 90, t('Ordugâh'), '', () => go('ordu'));
      btn(522, win ? 562 : 456, 290, 90, t('Ana menü'), '', () => go('ana'));
    }
    ptex.needsUpdate = true; pDirty = false;
  }
  // hangi pano görünsün
  let lastMode = '';
  function panelState() {
    const m = O.mode(), paused = O.paused && O.paused();
    if (m !== lastMode) { if (m === 'over') pScr = 'sonuc'; else if (m === 'menu' && (pScr === 'sonuc' || pScr === 'durak')) pScr = 'ana'; lastMode = m; pDirty = true; }
    if (m === 'play' && paused && pScr !== 'durak' && pScr !== 'ordu' && pScr !== 'ayar') { pScr = 'durak'; pDirty = true; }
    if (m === 'play' && !paused && pScr === 'durak') pScr = 'ana';
    return m === 'menu' || m === 'over' || (m === 'play' && paused);
  }
  const ray = new THREE.Raycaster(), _o = new V3(), _d = new V3(), _mq = new THREE.Quaternion();
  function rayHit(c) {
    c.updateMatrixWorld(); _o.setFromMatrixPosition(c.matrixWorld); c.matrixWorld.decompose(_d, _mq, new V3()); _d.set(0, 0, -1).applyQuaternion(_mq);
    ray.set(_o, _d); const h = ray.intersectObject(panel, false)[0]; return h || null;
  }
  function btnAt(uv) { const x = uv.x * PW, y = (1 - uv.y) * PH; for (let i = 0; i < pBtns.length; i++) { const b = pBtns[i]; if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return i; } return -1; }
  const lasers = [0, 1].map(() => { const g = new THREE.BufferGeometry().setFromPoints([new V3(0, 0, 0), new V3(0, 0, -1)]); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffd86a, fog: false, depthTest: false })); l.renderOrder = 31; l.visible = false; return l; });
  const dots = [0, 1].map(() => { const d = glow(0xfff2b0, 0.04); d.visible = false; W.add(d); return d; });
  function updatePanel(dt) {
    const vis = panelState(); panel.visible = vis;
    const h = rig.head || new V3(0, 1.2, 0), fx = -Math.sin(rig.yaw), fz = -Math.cos(rig.yaw);
    panelG.matrix.makeRotationY(rig.yaw).multiply(_m.makeRotationX(-0.08)).setPosition(h.x + fx * 1.35, h.y - 0.05, h.z + fz * 1.35); panelG.matrixWorldNeedsUpdate = true;
    let hov = -1;
    [VR.ctrl0, VR.ctrl1].forEach((c, k) => {
      const L = lasers[k]; if (!c) return; if (L.parent !== c) c.add(L);
      L.visible = vis; dots[k].visible = false; if (!vis) return;
      const hh = rayHit(c); L.scale.z = hh ? hh.distance : 1.2;
      if (hh) { dots[k].position.copy(hh.point); dots[k].visible = true; const b = btnAt(hh.uv); if (b >= 0 && pBtns[b].cb) hov = b; }
    });
    if (hov !== pHover) { pHover = hov; pDirty = true; }
    if ((pRedrawT -= dt) <= 0) { pRedrawT = 1; if (vis) pDirty = true; }
    if (vis && pDirty) drawPanel();
    return vis;
  }
  function panelClick(c) {
    if (!panel.visible) return false;
    const hh = rayHit(c); if (!hh) return true;
    const b = btnAt(hh.uv); if (b >= 0 && pBtns[b].cb) { const cb = pBtns[b].cb; cb(); pDirty = true; }
    return true;
  }

  /* ---------- sipahi kılıcı: at sırtında kumandayı savurunca önündeki düşmana darbe ---------- */
  function makeSword() {
    const g = new THREE.Group(), steel = new THREE.MeshPhongMaterial({ color: 0xdfe6ee, shininess: 90, specular: 0xffffff });
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.12, 8), lam(0x3a2416)); grip.rotation.x = Math.PI / 2; grip.position.z = 0.02; g.add(grip);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.018, 0.02), brass); guard.position.z = -0.045; g.add(guard);
    const pom = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), brass); pom.position.z = 0.085; g.add(pom);
    for (let i = 0; i < 6; i++) { const seg = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.034 - i * 0.003, 0.13), steel); const a = i * 0.07; seg.position.set(0, i * i * 0.0045, -0.11 - i * 0.125); seg.rotation.x = a; g.add(seg); }
    g.rotation.x = -0.35; g.visible = false; return g;
  }
  function swing(dt) {
    [VR.ctrl0, VR.ctrl1].forEach((c, k) => {
      if (!c) return; const p = c.position, sp = hasPrev[k] ? p.distanceTo(prevP[k]) / Math.max(dt, 1e-3) : 0; prevP[k].copy(p); hasPrev[k] = true;
      if (!VR.ride || O.mode() !== 'play' || sp < 1.9 || !O.darbe) return;
      const r = O.darbe(Math.min(1.6, sp / 2.4)); if (r === null) return;
      const src = c.userData.src, ha = src && src.gamepad && src.gamepad.hapticActuators && src.gamepad.hapticActuators[0];
      if (ha && ha.pulse) try { ha.pulse(r ? 0.9 : 0.25, r ? 80 : 25); } catch (e) {}
    });
  }


  /* ---------- oturum ---------- */
  let fogNear = 70, fogFar = 200, camNear = 0.1;
  let shadowWas = true;
  function enter(session) {
    VR.on = true; document.body.classList.add('vr-on'); const gt = document.getElementById('vrGate'); if (gt) gt.hidden = true;
    renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor');
    renderer.localClippingEnabled = true;
    scene.add(W); W.add(VR.ctrl0); W.add(VR.ctrl1); W.add(camera); VR.ride = false;
    fogNear = scene.fog.near; fogFar = scene.fog.far; camNear = camera.near; camera.near = 0.03; camera.updateProjectionMatrix();
    moodKey = ''; needCal = true; calT = 0;
    // performans (VRC.Quest.Performance.1): gölge yok (minyatürde zaten görünmez), çözünürlük %80, kenarlarda sabit foveation, 72 Hz
    shadowWas = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; if (O.sun) O.sun.castShadow = false;
    renderer.xr.setFramebufferScaleFactor(0.8);
    renderer.xr.setSession(session);
    try { const bl = session.renderState.baseLayer; if (bl && 'fixedFoveation' in bl) bl.fixedFoveation = 1; } catch (e) {}
    try { if (session.updateTargetFrameRate && session.supportedFrameRates && Array.from(session.supportedFrameRates).includes(72)) session.updateTargetFrameRate(72); } catch (e) {}
    renderer.setAnimationLoop(frame);
    session.addEventListener('end', leave);
    camXv = O.G() ? O.G().x * 0.6 : 0; camZv = O.G() ? O.G().z : 0;
    say(t('Tetiğe bas: sefere çık · Çubukla yönlendir'), 6);
  }
  function leave() {
    VR.on = false; document.body.classList.remove('vr-on'); grab = null; const gt = document.getElementById('vrGate'); if (gt) gt.hidden = false;
    renderer.setAnimationLoop(null); renderer.xr.enabled = false; renderer.shadowMap.enabled = shadowWas; if (O.sun) O.sun.castShadow = true; uncull();
    unclipAll(); W.remove(VR.ctrl0); W.remove(VR.ctrl1); W.remove(camera); camera.up.set(0, 1, 0); VR.ride = false; vig.visible = false; renderer.localClippingEnabled = false; scene.remove(W);
    scene.matrixAutoUpdate = true; scene.scale.setScalar(1); scene.position.set(0, 0, 0); scene.quaternion.identity(); scene.updateMatrix();
    scene.fog.near = fogNear; scene.fog.far = fogFar; camera.near = camNear; camera.updateProjectionMatrix();
    if (O.precip) { const Mo = (O.MOODS && O.MOODS[O.mood()]) || {}; O.precip[0].visible = !!Mo.rain; O.precip[1].visible = !!Mo.snow; }
    resize();
    if (O.mode() === 'play') { O.setPaused(true); show('pause'); } else { previewLevel(nextLevel()); show('menu'); }
    requestAnimationFrame(ts => { O.setLast(ts); frame(ts); });
  }
  VR.state = () => ({ mode: O.mode(), lvl: O.G() && O.G().i, count: O.G() && O.G().count, x: O.G() && O.G().x, mood: O.mood && O.mood(), yaw: +rig.yaw.toFixed(2), head: rig.head && rig.head.toArray().map(v => +v.toFixed(2)) });
  VR.toggleRide = toggleRide; VR.darbe = O.darbe; VR.G = O.G; VR.groups = { tableG, yawG, room }; VR.pClick = (x, y) => { drawPanel(); for (const b of pBtns) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h && b.cb) { b.cb(); pDirty = true; return true; } return false; }; VR.pScr = () => pScr;
  VR.dbg = () => ({ ride: !!VR.ride, table: new V3().setFromMatrixPosition(mTable).toArray(), cam: camera.position.toArray(), clip: clip.map(p => [p.normal.toArray(), p.constant]), nClipped: clipped.size, pres: renderer.xr.isPresenting, lce: renderer.localClippingEnabled });
  VR.start = async function () {
    try {
      const session = await xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'hand-tracking'] });
      if (!O.G()) previewLevel(nextLevel());
      if (O.mode() !== 'play') O.setMode('menu');
      show(null); $('hud').hidden = true; $('weapon').hidden = true;
      enter(session);
    } catch (e) { console.log('VR açılamadı', e); }
  };

  /* ---------- ana menüde "VR" düğmesi (yalnızca gözlük destekliyorsa) ---------- */
  function addButton() {
    const b = document.createElement('button'); b.id = 'bVR'; b.className = 'fullchip'; b.innerHTML = '🥽 <span data-t>Harp Masası (VR)</span>';
    b.addEventListener('click', () => { SFX.click(); VR.start(); });
    const row = $('bLevels').parentElement; row.parentElement.insertBefore(b, row.nextSibling);
    D.applyStatic();
  }
  // Quest'te (gözlük tarayıcısı ya da mağaza uygulaması) oyun doğrudan harp masasına açılsın: tek dokunuşluk büyük giriş ekranı
  function addGate() {
    const d = document.createElement('div'); d.id = 'vrGate';
    d.innerHTML = '<div class="vg"><div class="vgT">MALAZGİRT</div><div class="vgR">AKINCILARI</div><button id="vgGo">🥽 <span>' + t('Harp Masasına Gir') + '</span></button><p>' + t('Tetiğe bas · Oturarak oyna') + '</p><p class="vgC">Bir Mr. Anduv! yapımıdır.</p></div>';
    document.body.appendChild(d);
    d.querySelector('#vgGo').addEventListener('click', () => { SFX.click(); VR.start(); });
  }
  const quest = /OculusBrowser|Quest|Meta Quest/i.test(navigator.userAgent);
  // Meta Horizon Store uygulaması (immersive PWA): açılır açılmaz VR oturumu istenmeli, yoksa gözlük yükleme ekranında bekler.
  // Uygulama simgesine tıklamak kullanıcı etkileşimi sayılır; başarısız olursa giriş ekranındaki düğme kalır.
  const pwa = !!window.QUEST_SURUM && ('getDigitalGoodsService' in window || (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || document.referrer.startsWith('android-app://'));
  if (xr && xr.isSessionSupported) xr.isSessionSupported('immersive-vr').then(ok => { if (ok) { addButton(); if (quest || pwa || new URLSearchParams(location.search).has('vr')) addGate(); if (pwa) VR.start(); } }).catch(() => {});

  /* ---------- gözlüksüz deneme: ?vrtest=1 (masayı oturan bir oyuncunun gözünden gösterir; &bak=sol|sag|arka|yukari) ---------- */
  if (VR.test) {
    VR.on = true; scene.add(W); renderer.localClippingEnabled = true;
    rig.head = new V3(0, 1.2, 0); rig.yaw = 0; rig.floor.set(0, 0, 0); needCal = false;
    const bak = new URLSearchParams(location.search).get('bak');
    if (new URLSearchParams(location.search).has('atsirti')) VR.ride = true;
    VR.testCam = () => {
      const h = rig.head; camera.position.copy(h); camera.fov = 90; camera.near = 0.03; camera.updateProjectionMatrix();
      const tg = { sol: [-3, 1.2, -0.5], sag: [3, 1.4, -0.8], arka: [0.4, 1.3, 3], yukari: [0, 3.6, -0.6] }[bak] || (VR.ride ? [0, h.y - 0.35, -3] : [0, h.y - 0.3, -0.75]);
      camera.lookAt(tg[0], tg[1], tg[2]);
    };
  }
};
