/* Kaptan Mecit — Gerçekçi görünüm: iskeletli 3B futbolcular (tamamen kendi üretimimiz, dış model/lisans yok).
   Tek çizimlik SkinnedMesh: kapsül ve tornalanmış gövde parçaları kemiklere bağlı; renkler köşelere işli (forma, şort, tozluk, krampon, ten, saç).
   Hareketler yordamsal: yürüme/koşu/depar, şut, kayarak müdahale, düşme, kaleci hazır duruşu, gol sevinci, nefes. */
import * as THREE from 'three';

const KEMIK = ['kok', 'kalca', 'bel', 'gogus', 'boyun', 'bas', 'omuzL', 'dirsekL', 'omuzR', 'dirsekR', 'bacakL', 'dizL', 'bilekL', 'bacakR', 'dizR', 'bilekR'];
const K = Object.fromEntries(KEMIK.map((k, i) => [k, i]));
/* bağlanma duruşu (metre): kemiklerin dünya konumu */
const BAG = {
  kok: [0, 0, 0], kalca: [0, 0.95, 0], bel: [0, 1.08, 0], gogus: [0, 1.28, 0], boyun: [0, 1.5, 0], bas: [0, 1.6, 0],
  omuzL: [-0.2, 1.44, 0], dirsekL: [-0.23, 1.15, 0], omuzR: [0.2, 1.44, 0], dirsekR: [0.23, 1.15, 0],
  bacakL: [-0.095, 0.93, 0], dizL: [-0.1, 0.5, 0.01], bilekL: [-0.1, 0.085, 0], bacakR: [0.095, 0.93, 0], dizR: [0.1, 0.5, 0.01], bilekR: [0.1, 0.085, 0],
};
const EBEVEYN = { kalca: 'kok', bel: 'kalca', gogus: 'bel', boyun: 'gogus', bas: 'boyun', omuzL: 'gogus', dirsekL: 'omuzL', omuzR: 'gogus', dirsekR: 'omuzR',
  bacakL: 'kalca', dizL: 'bacakL', bilekL: 'dizL', bacakR: 'kalca', dizR: 'bacakR', bilekR: 'dizR' };

/* ---------- geometri: parçaları tek tamponda topla (konum, normal, kemik, renk bölgesi) ---------- */
const pos = [], nor = [], ski = [], bol = [], idx = [];
/* bölge kodları: 0 forma, 1 forma şeridi, 2 şort, 3 tozluk, 4 krampon, 5 ten, 6 saç, 7 eldiven/kaleci kol */
function ekle(geo, kemik, bolgeF, donus) {
  const g = geo.toNonIndexed ? geo : geo; if (donus) g.applyMatrix4(donus);
  const p = g.attributes.position, n = g.attributes.normal, taban = pos.length / 3;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    pos.push(x, y, z); nor.push(n.getX(i), n.getY(i), n.getZ(i));
    const kb = typeof kemik === 'function' ? kemik(x, y, z) : [[kemik, 1]];
    const s = [0, 0, 0, 0], w = [0, 0, 0, 0]; kb.slice(0, 4).forEach(([k, a], j) => { s[j] = K[k]; w[j] = a; });
    ski.push(s, w); bol.push(typeof bolgeF === 'function' ? bolgeF(x, y, z) : bolgeF);
  }
  const ix = g.index ? g.index.array : [...Array(p.count).keys()]; for (const v of ix) idx.push(taban + v);
}
const M4 = () => new THREE.Matrix4();
/* iki nokta arasında konik kapsül */
function kapsul(a, b, r0, r1, kemik, bolge, seg = 10) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), boy = A.distanceTo(B);
  const g = new THREE.CylinderGeometry(r1, r0, boy, seg, 4, false);
  const yon = new THREE.Vector3().subVectors(B, A).normalize(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), yon);
  g.applyMatrix4(M4().compose(new THREE.Vector3().addVectors(A, B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
  ekle(g, kemik, bolge);
  const k0 = new THREE.SphereGeometry(r0, seg, 6); k0.translate(...a); ekle(k0, Array.isArray(kemik) ? kemik : kemik, bolge);
  const k1 = new THREE.SphereGeometry(r1, seg, 6); k1.translate(...b); ekle(k1, kemik, typeof bolge === 'function' ? bolge : bolge);
}
/* gövde: profil boyunca eliptik kesit (göğüs geniş, bel ince, kalça); yüksekliğe göre üç kemiğe yumuşak dağılır */
{
  const prof = [[0.86, 0.15], [0.95, 0.165], [1.05, 0.15], [1.18, 0.165], [1.3, 0.195], [1.4, 0.205], [1.46, 0.19], [1.5, 0.1]];
  const g = new THREE.LatheGeometry(prof.map(([y, r]) => new THREE.Vector2(r, y)), 14);
  g.scale(1, 1, 0.66);
  ekle(g, (x, y) => y < 1.0 ? [['kalca', 1]] : y < 1.12 ? [['kalca', (1.12 - y) / 0.12], ['bel', (y - 1.0) / 0.12]] : y < 1.26 ? [['bel', (1.26 - y) / 0.14], ['gogus', (y - 1.12) / 0.14]] : [['gogus', 1]],
    (x, y, z) => y < 0.97 ? 2 : (y > 1.45 && Math.abs(x) < 0.06 && z > 0) ? 1 : 0);
}
kapsul([0, 1.48, 0], [0, 1.6, 0], 0.055, 0.05, 'boyun', 5, 8);
{ /* baş: yüz ten, arkası ve tepesi saç */
  const g = new THREE.SphereGeometry(0.11, 14, 10); g.scale(0.9, 1.08, 1); g.translate(0, 1.7, 0.005);
  ekle(g, 'bas', (x, y, z) => (y > 1.735 || (z < -0.03 && y > 1.62)) ? 6 : 5);
  const k = new THREE.SphereGeometry(0.025, 6, 4); k.translate(-0.1, 1.69, 0); ekle(k, 'bas', 5); const k2 = k.clone(); k2.translate(0.2, 0, 0); ekle(k2, 'bas', 5);
}
for (const [s, o, d] of [[-1, 'omuzL', 'dirsekL'], [1, 'omuzR', 'dirsekR']]) {
  kapsul([s * 0.2, 1.44, 0], [s * 0.23, 1.15, 0], 0.062, 0.05, o, (x, y) => y > 1.3 ? 0 : 7, 8);      // üst kol: yarısı kol
  kapsul([s * 0.23, 1.15, 0], [s * 0.245, 0.9, 0.02], 0.046, 0.035, d, 7, 8);                       // ön kol
  const el = new THREE.SphereGeometry(0.045, 8, 6); el.scale(0.8, 1.2, 0.6); el.translate(s * 0.25, 0.85, 0.025); ekle(el, d, 7);
}
for (const [s, b, d, a] of [[-1, 'bacakL', 'dizL', 'bilekL'], [1, 'bacakR', 'dizR', 'bilekR']]) {
  kapsul([s * 0.095, 0.93, 0], [s * 0.1, 0.5, 0.01], 0.088, 0.058, b, (x, y) => y > 0.7 ? 2 : 5, 10);  // uyluk: üstü şort
  kapsul([s * 0.1, 0.5, 0.01], [s * 0.1, 0.1, 0], 0.056, 0.038, d, (x, y) => y > 0.44 ? 5 : 3, 10);    // baldır: tozluk
  const ay = new THREE.BoxGeometry(0.1, 0.075, 0.26, 2, 1, 3); ay.translate(s * 0.1, 0.04, 0.055); ekle(ay, a, 4);
}
const TABAN = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  const si = [], sw = []; for (let i = 0; i < ski.length; i += 2) { si.push(...ski[i]); const w = ski[i + 1], t = w.reduce((a, b) => a + b, 0) || 1; sw.push(...w.map(v => v / t)); }
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  g.setIndex(idx); g.computeBoundingSphere(); return g;
})();
const BOLGE = new Uint8Array(bol);

/* sırt numarası dokusu (takım başına önbellek) */
const numaraOnbellek = new Map();
function numaraDoku(no, renk) {
  const k = no + renk; if (numaraOnbellek.has(k)) return numaraOnbellek.get(k);
  const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = renk; g.font = "900 46px 'Arial Black',Arial,sans-serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(no), 32, 35);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; numaraOnbellek.set(k, t); return t;
}
const lum = h => { const c = new THREE.Color(h); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; };

/* bir futbolcu üret: renkler { forma, serit, sort, tozluk, ten, sac, eldiven }, numara */
export function futbolcu(renk, no, boy = 1) {
  const g = new THREE.BufferGeometry();
  for (const a of ['position', 'normal', 'skinIndex', 'skinWeight']) g.setAttribute(a, TABAN.attributes[a]);
  g.setIndex(TABAN.index); g.boundingSphere = TABAN.boundingSphere;
  const R = [renk.forma, renk.serit, renk.sort, renk.tozluk, '#151515', renk.ten, renk.sac, renk.eldiven || renk.ten].map(c => new THREE.Color(c));
  const col = new Float32Array(BOLGE.length * 3); for (let i = 0; i < BOLGE.length; i++) { const c = R[BOLGE[i]]; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const kemikler = KEMIK.map(k => { const b = new THREE.Bone(); b.name = k; return b; });
  KEMIK.forEach((k, i) => { const e = EBEVEYN[k], p = BAG[k]; if (e) { const q = BAG[e]; kemikler[i].position.set(p[0] - q[0], p[1] - q[1], p[2] - q[2]); kemikler[K[e]].add(kemikler[i]); } else kemikler[i].position.set(...p); });
  const iskelet = new THREE.Skeleton(kemikler);
  const m = new THREE.SkinnedMesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0 }));
  m.add(kemikler[0]); m.updateMatrixWorld(true); m.bind(iskelet); m.castShadow = true; m.frustumCulled = false;
  /* sırt numarası */
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: numaraDoku(no, lum(renk.forma) > 0.6 ? '#141414' : '#f4f4f4'), transparent: true, depthWrite: false }));
  nm.position.set(0, 0.08, -0.137); nm.rotation.y = Math.PI; kemikler[K.gogus].add(nm);
  const B = Object.fromEntries(KEMIK.map((k, i) => [k, kemikler[i]]));
  const kap = new THREE.Group(); kap.add(m); kap.scale.setScalar(boy);
  return { grup: kap, B, yaw: 0, faz: Math.random() * 6 };
}

/* ---------- hareket: Kaptan Mecit oyuncusunun durumundan duruş ---------- */
const sat = (v, a, b) => v < a ? a : v > b ? b : v;
export function poz(F, p, M, now, golTakim) {
  const B = F.B, dx = p.dx || 0, dy = p.dy || 0;
  if (dx || dy) { const t = Math.atan2(dx, dy); let d = t - F.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); F.yaw += d * 0.3; }
  B.kok.rotation.set(0, F.yaw, 0); B.kok.position.set(0, 0, 0);
  for (const k of KEMIK) if (k !== 'kok') B[k].rotation.set(0, 0, 0);
  B.omuzL.rotation.z = -0.12; B.omuzR.rotation.z = 0.12;
  const spd = Math.hypot(p.vx || 0, p.vy || 0), a = sat(spd / 7.5, 0, 1), faz = (p.anim || 0) * 3.9;
  const sL = Math.sin(faz), sR = -sL;
  /* yerde: kayarak müdahale (ayaklar önde) ya da düşmüş */
  if (p.slide > 0 || p.stun > 0.3) {
    const kay = p.slide > 0;
    B.kok.position.y = kay ? 0.16 : 0.12; B.kalca.rotation.x = kay ? -1.25 : -1.5;
    B.bacakR.rotation.x = kay ? -0.25 : 0.1; B.dizR.rotation.x = kay ? 0.08 : 0.4; B.bacakL.rotation.x = kay ? 0.35 : 0.2; B.dizL.rotation.x = kay ? 1.1 : 0.5;
    B.omuzL.rotation.set(-0.6, 0, -1.0); B.omuzR.rotation.set(-0.2, 0, 1.1); B.dirsekL.rotation.x = -0.5; B.bas.rotation.x = kay ? 0.6 : 0.3;
    return;
  }
  const kaleci = p.role === 'G', top = M.ball, topYakin = Math.hypot(top.x - p.x, top.y - p.y);
  /* bacaklar: kalça bükülmesi, diz (salınımda bükülür), bilek */
  const adim = 0.12 + 0.78 * a;
  B.bacakL.rotation.x = -sL * adim; B.bacakR.rotation.x = -sR * adim;
  B.dizL.rotation.x = 0.06 + a * (0.25 + 1.25 * Math.max(0, Math.sin(faz - 1.2)));
  B.dizR.rotation.x = 0.06 + a * (0.25 + 1.25 * Math.max(0, Math.sin(faz + Math.PI - 1.2)));
  B.bilekL.rotation.x = -0.25 * a * Math.max(0, -sL); B.bilekR.rotation.x = -0.25 * a * Math.max(0, -sR);
  /* gövde: öne eğilme, kalça-göğüs karşıt dönüşü, başı sabit tut */
  B.kalca.rotation.y = sL * 0.12 * a; B.gogus.rotation.y = -sL * 0.18 * a; B.bel.rotation.x = 0.06 + 0.22 * a; B.bas.rotation.x = -0.18 * a;
  /* kollar: bacakların tersine salınım, dirsek bükük */
  B.omuzL.rotation.x = sL * (0.18 + 0.75 * a); B.omuzR.rotation.x = sR * (0.18 + 0.75 * a);
  B.dirsekL.rotation.x = B.dirsekR.rotation.x = -(0.25 + 1.2 * a);
  B.kok.position.y = Math.abs(Math.cos(faz)) * 0.055 * a - 0.02 * a;
  if (spd < 0.5) {                                                          // dururken nefes ve hafif ağırlık aktarımı
    const n = Math.sin(now / 900 + F.faz); B.gogus.rotation.x = 0.02 * n; B.kalca.rotation.z = 0.02 * Math.sin(now / 1600 + F.faz);
    B.dirsekL.rotation.x = B.dirsekR.rotation.x = -0.15;
  }
  /* kaleci: top yaklaşınca hazır duruş (dizler bükük, kollar önde) */
  if (kaleci && topYakin < 22 && spd < 3) {
    B.kok.position.y = -0.1; B.bacakL.rotation.x = B.bacakR.rotation.x = -0.45; B.dizL.rotation.x = B.dizR.rotation.x = 0.8; B.bel.rotation.x = 0.35;
    B.bacakL.rotation.z = -0.12; B.bacakR.rotation.z = 0.12; B.omuzL.rotation.set(-0.9, 0, -0.45); B.omuzR.rotation.set(-0.9, 0, 0.45); B.dirsekL.rotation.x = B.dirsekR.rotation.x = -0.6;
  }
  /* şut / pas: sağ bacak geriye kurulur, öne savrulur; karşı kol açılır */
  if (top.kicker === p && p.cd > 0.1) {
    const k = sat((p.cd - 0.1) / 0.25, 0, 1), sav = Math.sin(k * Math.PI);
    B.bacakR.rotation.x = -1.35 * sav + 0.5 * (1 - k); B.dizR.rotation.x = 0.2 + 0.9 * (1 - k) * k * 2; B.bacakL.rotation.x = 0.15; B.dizL.rotation.x = 0.25;
    B.omuzL.rotation.set(-0.3, 0, -0.9); B.omuzR.rotation.set(0.4, 0, 0.3); B.bel.rotation.x = -0.05; B.gogus.rotation.y = 0.25 * sav;
  }
  /* gol sevinci / üzüntü */
  if (golTakim === p.team) { B.omuzL.rotation.set(-2.8, 0, -0.35); B.omuzR.rotation.set(-2.8, 0, 0.35); B.dirsekL.rotation.x = B.dirsekR.rotation.x = -0.2; B.bas.rotation.x = -0.3; }
  else if (golTakim >= 0) { B.bel.rotation.x = 0.45; B.bas.rotation.x = 0.35; B.omuzL.rotation.x = B.omuzR.rotation.x = 0.1; }
}

/* ---------- gerçekçi top dokusu: klasik beyaz-siyah beşgenler ---------- */
export function topDokusu() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#f7f7f4'; g.fillRect(0, 0, 512, 256);
  const nok = [[0.5, 0], [0.5, 1]]; for (let i = 0; i < 5; i++) { nok.push([i / 5, 0.32], [(i + 0.5) / 5, 0.68]); }
  g.fillStyle = '#161616';
  for (const [u, v] of nok) for (const du of [-1, 0, 1]) { const x = (u + du) * 512, y = v * 256, r = v === 0 || v === 1 ? 46 : 30;
    g.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; g.lineTo(x + Math.cos(a) * r * (v % 1 ? 1 : 3), y + Math.sin(a) * r); } g.closePath(); g.fill(); }
  g.strokeStyle = '#c9c9c4'; g.lineWidth = 2; for (let x = 0; x < 512; x += 51) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 25, 256); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
/* ---------- gerçekçi çim: biçme izleri (iki yönlü), ince doku gürültüsü ---------- */
export function cimDokusu(ciz) {
  /* ciz(g, X, Y, S): çizgileri çizen fonksiyon dışarıdan gelir (saha ölçüleri tek yerde) */
  const xs = -8, ys = -9, w = 84, h = 123, S = 22, c = document.createElement('canvas'); c.width = w * S; c.height = h * S; const g = c.getContext('2d');
  const X = x => (x - xs) * S, Y = y => (y - ys) * S;
  g.fillStyle = '#2c6a2a'; g.fillRect(0, 0, c.width, c.height);
  const SW = 105 / 18; for (let i = -2; i < 20; i++) { g.fillStyle = (i + 60) % 2 ? '#3f8f39' : '#4c9e43'; g.fillRect(X(-3), Y(i * SW), (68 + 6) * S, SW * S + 1); }
  g.globalAlpha = 0.18; const SW2 = 68 / 8; for (let i = 0; i < 9; i++) { if (i % 2) continue; g.fillStyle = '#ffffff'; g.fillRect(X(-3 + i * SW2), Y(-3), SW2 * S, 111 * S); } g.globalAlpha = 1;
  /* ince doku: binlerce kısa çim izi */
  const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 22; d[i] += n * 0.5; d[i + 1] += n; d[i + 2] += n * 0.4; }
  g.putImageData(im, 0, 0);
  ciz(g, X, Y, S);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { t, xs, ys, w, h };
}
