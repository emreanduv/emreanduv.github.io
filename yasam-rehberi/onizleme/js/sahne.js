// Yaşam Rehberi — Bugün sahnesi: canlı çizilmiş İstanbul ufku.
// Gökyüzü, güneş ve ay o anki gerçek konuma göre (bulunduğun yer, saat; NOAA güneş konumu). Ayın hilali hicri güne göre.
// Katmanlar: gök → yıldızlar → ay/güneş → bulutlar → uzak tepeler → cami silüetleri → Boğaz (yansıma) → vapur → martılar.
// Ramazan ve kandil gecelerinde minareler arasında mahya. Hiçbir dış görsel yok; hepsi kodla çizilir.
import * as V from "./vakit.js";

const lerp = (a, b, t) => a + (b - a) * t;
const kis = (x, a, b) => Math.max(a, Math.min(b, x));
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const karis = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// Güneş yüksekliğine göre gök renkleri: [yükseklik°, tepe, orta, ufuk]
const GOK = [
  [-18, "#060b1c", "#0c1733", "#16264a"],
  [-12, "#0a1430", "#1a2755", "#33386a"],
  [-6, "#18224d", "#45407a", "#b25f78"],
  [-2, "#283a78", "#b0607a", "#f08f58"],
  [3, "#3a66aa", "#d99a78", "#ffc983"],
  [10, "#3b78c4", "#88b3df", "#f0d8b0"],
  [30, "#2d6cbc", "#6ea6dd", "#cfe4f3"],
].map(([a, ...c]) => [a, ...c.map(hex)]);
function gokRenk(alt) {
  if (alt <= GOK[0][0]) return GOK[0].slice(1);
  for (let i = 1; i < GOK.length; i++) if (alt <= GOK[i][0]) {
    const t = (alt - GOK[i - 1][0]) / (GOK[i][0] - GOK[i - 1][0]);
    return [1, 2, 3].map((k) => karis(GOK[i - 1][k], GOK[i][k], t));
  }
  return GOK[GOK.length - 1].slice(1);
}

// Tohumlu rastgele (her açılışta aynı yıldızlar, aynı ufuk)
function tohum(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// ── cami ve şehir silüeti (kodla) ──
export function cami(c, x, zemin, s, o) {
  // o: { minare: 2|4|6, genis: 1 }  — merkez kubbe, yarım kubbeler, kademeli kubbecikler, kalem minareler
  const g = (o.genis || 1) * s;
  const R = 26 * g;                                   // ana kubbe yarıçapı
  const govdeY = zemin - 34 * s;
  c.beginPath();
  c.rect(x - 70 * g, govdeY, 140 * g, 34 * s);        // gövde
  // kademeli yan kubbecikler
  for (const [dx, r, h] of [[-58, 9, 0], [58, 9, 0], [-44, 13, 6], [44, 13, 6]]) {
    const cx = x + dx * g, cy = govdeY - h * s;
    c.rect(cx - r * g, cy, 2 * r * g, h * s + 1);
    c.moveTo(cx - r * g, cy); c.ellipse(cx, cy, r * g, r * 0.8 * g, 0, Math.PI, 0);
  }
  // yarım kubbeler
  for (const dx of [-24, 24]) {
    const cx = x + dx * g, cy = govdeY - 12 * s;
    c.rect(cx - 18 * g, cy, 36 * g, 12 * s + 1);
    c.moveTo(cx - 18 * g, cy); c.ellipse(cx, cy, 18 * g, 15 * g, 0, Math.PI, 0);
  }
  // kasnak + ana kubbe + alem
  const kasnakY = govdeY - 26 * s;
  c.rect(x - R * 0.92, kasnakY, R * 1.84, 26 * s + 1);
  c.moveTo(x - R, kasnakY); c.ellipse(x, kasnakY, R, R * 0.86, 0, Math.PI, 0);
  const tepe = kasnakY - R * 0.86;
  c.rect(x - 0.9 * s, tepe - 10 * s, 1.8 * s, 10 * s);
  c.fill();
  // alem hilali
  c.beginPath(); c.arc(x, tepe - 12 * s, 3.2 * s, 0, Math.PI * 2); c.fill();
  // minareler
  const minX = o.minare >= 4 ? [-80, -66, 66, 80] : [-74, 74];
  if (o.minare >= 6) minX.push(-96, 96);
  const kat = [];
  for (const dx of minX) {
    const mx = x + dx * g, uzun = Math.abs(dx) < 70 || o.minare === 2;
    const H = (uzun ? 118 : 96) * s, w = 4.6 * s;
    c.beginPath();
    c.rect(mx - w / 2, zemin - H, w, H);
    const serefe = uzun ? 3 : 2;
    for (let i = 0; i < serefe; i++) {
      const sy = zemin - H * (0.55 + i * 0.16);
      c.rect(mx - w * 0.95, sy, w * 1.9, 2.2 * s);
      kat.push([mx, sy - 1 * s]);
    }
    // külah (kalem uç)
    c.moveTo(mx - w * 0.62, zemin - H); c.lineTo(mx, zemin - H - 30 * s); c.lineTo(mx + w * 0.62, zemin - H);
    c.fill();
    c.fillRect(mx - 0.5 * s, zemin - H - 36 * s, 1 * s, 6 * s);
  }
  return { tepe, minareler: minX.map((dx) => [x + dx * g, zemin - ((Math.abs(dx) < 70 || o.minare === 2) ? 118 : 96) * s]), serefeler: kat, x, govdeY };
}

function kule(c, x, zemin, s) { // Galata'yı andıran yuvarlak taş kule
  c.beginPath();
  c.rect(x - 9 * s, zemin - 70 * s, 18 * s, 70 * s);
  c.rect(x - 11 * s, zemin - 74 * s, 22 * s, 5 * s);
  c.moveTo(x - 10 * s, zemin - 74 * s); c.lineTo(x, zemin - 98 * s); c.lineTo(x + 10 * s, zemin - 74 * s);
  c.fill();
}

function evler(c, x0, x1, zemin, s, r) {
  const pencere = [];
  c.beginPath();
  let x = x0;
  while (x < x1) {
    const w = (14 + r() * 18) * s, h = (12 + r() * 22) * s;
    c.rect(x, zemin - h, w, h);
    if (r() < 0.6) { c.moveTo(x - 1 * s, zemin - h); c.lineTo(x + w / 2, zemin - h - 6 * s); c.lineTo(x + w + 1 * s, zemin - h); }
    for (let k = 0; k < 3; k++) if (r() < 0.55) pencere.push([x + (3 + r() * (w / s - 6)) * s, zemin - (4 + r() * (h / s - 8)) * s]);
    x += w + r() * 3 * s;
  }
  c.fill();
  return pencere;
}

// Mahya: noktalı ışık yazısı (Ramazan / kandil gecesi)
function mahyaNoktalar(metin, genislik) {
  const cv = document.createElement("canvas"), x = cv.getContext("2d");
  cv.width = 220; cv.height = 14;
  x.fillStyle = "#fff"; x.font = "700 11px 'PT Sans Narrow', 'PT Sans', sans-serif"; x.textBaseline = "middle"; x.textAlign = "center";
  x.fillText(metin, 110, 7);
  const d = x.getImageData(0, 0, 220, 14).data, out = [];
  for (let yy = 0; yy < 14; yy += 2) for (let xx = 0; xx < 220; xx += 2) if (d[(yy * 220 + xx) * 4 + 3] > 120) out.push([xx / 220 * genislik - genislik / 2, yy]);
  return out;
}

export function sahneKur(cv, bilgi) {
  // bilgi: { lat, lon, mahya: "metin"|null, hicriGun }
  const c = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, acik = true, kare = 0;
  const r = tohum(1923);
  const yildiz = Array.from({ length: 140 }, () => [r(), r() * 0.62, 0.3 + r() * 1.1, r() * 6.28]);
  // bulutlar: düz tabanlı kümülüs kümeleri (ortası yüksek), birkaçı ince şerit
  const bulut = Array.from({ length: 5 }, (_, i) => {
    const n = 6 + Math.floor(r() * 4);
    return { x: r(), y: 0.14 + r() * 0.26, s: 0.55 + r() * 0.6, v: 0.5 + r() * 0.8,
      k: Array.from({ length: n }, (_, j) => { const u = j / (n - 1) - 0.5; return [u * 96, (1 - Math.abs(u) * 1.7) * 12 + r() * 6, 11 + (1 - Math.abs(u) * 1.5) * 13 + r() * 5]; }) };
  });
  const marti = Array.from({ length: 4 }, () => ({ x: r(), y: 0.25 + r() * 0.25, v: 0.012 + r() * 0.01, f: r() * 6 }));
  let mahya = null, sehir = null;

  function boyut() {
    const b = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    W = b.width; H = b.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    sehir = null;
  }

  function sehirCiz(ufuk, renkUzak, renkYakin) {
    // Şehir katmanını bir kez önceden çiz (renk değişince yenile)
    const o = document.createElement("canvas"); o.width = cv.width; o.height = cv.height;
    const x = o.getContext("2d"); x.scale(dpr, dpr);
    const s = kis(W / 402, 0.75, 1.6), rr = tohum(53);
    // uzak tepeler (karşı kıyı)
    x.fillStyle = rgb(renkUzak);
    x.beginPath(); x.moveTo(0, ufuk);
    for (let i = 0; i <= 40; i++) { const px = i / 40 * W; x.lineTo(px, ufuk - (10 + 8 * Math.sin(i * 0.7) + 6 * Math.sin(i * 1.9 + 1)) * s); }
    x.lineTo(W, ufuk); x.fill();
    // uzak küçük cami ve evler
    x.fillStyle = rgb(renkUzak, 1);
    evler(x, 0, W, ufuk, s * 0.55, rr);
    cami(x, W * 0.86, ufuk - 2 * s, s * 0.42, { minare: 2 });
    // yakın kıyı: büyük cami, ikinci cami, kule, evler
    x.fillStyle = rgb(renkYakin);
    const pencere = evler(x, -10, W + 10, ufuk + 2 * s, s * 0.95, rr);
    const ana = cami(x, W * 0.36, ufuk + 2 * s, s * 0.9, { minare: 4, genis: 1.05 });
    const ikinci = cami(x, W * 0.78, ufuk + 2 * s, s * 0.62, { minare: 2 });
    kule(x, W * 0.06, ufuk + 2 * s, s * 0.8);
    return { o, pencere, ana, ikinci, s };
  }

  function ciz(now) {
    if (!W) boyut();
    const t = performance.now() / 1000;
    const g = V.gunesKonumu(bilgi.lat, bilgi.lon, now);
    const alt = g.yukseklik, gece = kis((-alt - 2) / 10, 0, 1), alacakaranlik = kis(1 - Math.abs(alt - 1) / 9, 0, 1);
    const [tepe, orta, ufukR] = gokRenk(alt);
    const ufuk = H * 0.56;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    // gök
    let gr = c.createLinearGradient(0, 0, 0, ufuk);
    gr.addColorStop(0, rgb(tepe)); gr.addColorStop(0.62, rgb(orta)); gr.addColorStop(1, rgb(ufukR));
    c.fillStyle = gr; c.fillRect(0, 0, W, ufuk + 1);

    // yıldızlar
    if (gece > 0.02) for (const [x, y, b, f] of yildiz) {
      const a = gece * (0.45 + 0.55 * Math.sin(t * 1.3 + f * 3)) * (1 - y * 0.9);
      c.fillStyle = `rgba(255,248,230,${a})`; c.beginPath(); c.arc(x * W, y * ufuk, b * 0.8, 0, 6.28); c.fill();
    }

    // güneş (doğu solda, batı sağda; yüksekliğe göre)
    const gx = kis((g.azimut - 90) / 180, -0.1, 1.1) * W;
    const gy = ufuk - (alt / 70) * (ufuk - 24);
    if (alt > -5) {
      const ç = 16 + alacakaranlik * 6, sıcak = kis(1 - alt / 25, 0, 1);
      const parlak = karis([255, 248, 225], [255, 168, 90], sıcak);
      const hale = c.createRadialGradient(gx, gy, 0, gx, gy, ç * (5 + alacakaranlik * 4));
      hale.addColorStop(0, rgb(parlak, 0.85)); hale.addColorStop(0.18, rgb(parlak, 0.35)); hale.addColorStop(1, rgb(parlak, 0));
      c.fillStyle = hale; c.fillRect(0, 0, W, ufuk);
      c.fillStyle = rgb(karis(parlak, [255, 255, 255], 0.4)); c.beginPath(); c.arc(gx, gy, ç * 0.62, 0, 6.28); c.fill();
    }

    // ay: hilal hicri güne göre (1 → ince hilal, 14 → dolunay); gece ve alacakaranlıkta
    if (gece > 0.05 && bilgi.hicriGun) {
      const f = ((bilgi.hicriGun - 0.5) / 29.53) % 1, isik = (1 - Math.cos(f * 2 * Math.PI)) / 2;
      const mx = W * 0.8, my = ufuk * 0.24, mr = 13;
      const hale = c.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 5);
      hale.addColorStop(0, `rgba(255,240,200,${0.28 * gece * (0.3 + isik)})`); hale.addColorStop(1, "rgba(255,240,200,0)");
      c.fillStyle = hale; c.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
      const ay = document.createElement("canvas"); ay.width = ay.height = Math.ceil(mr * 2.4 * dpr);
      const a = ay.getContext("2d"); a.scale(dpr, dpr); const m = mr * 1.2;
      a.fillStyle = "#fff4d6"; a.beginPath(); a.arc(m, m, mr, 0, 6.28); a.fill();
      a.globalCompositeOperation = "destination-out";
      const dx = (f < 0.5 ? -1 : 1) * isik * 2 * mr;      // büyüyen ayın aydınlık yüzü sağda
      a.beginPath(); a.arc(m + dx, m, mr * 1.02, 0, 6.28); a.fill();
      c.globalAlpha = kis(gece * 1.3, 0, 1); c.drawImage(ay, mx - m, my - m, mr * 2.4, mr * 2.4); c.globalAlpha = 1;
    }

    // bulutlar: üstü ışık alır (güneş/ay rengi), altı gölgede; düz taban
    const isikR = karis(karis([255, 255, 255], [255, 196, 150], alacakaranlik), [120, 132, 170], gece);
    const golgeR = karis(karis([176, 190, 214], [150, 110, 130], alacakaranlik), [26, 32, 58], gece);
    const bulutA = 0.92 - gece * 0.35;
    for (const b of bulut) {
      const bx = ((b.x * (W + 260) + t * b.v * 2.2) % (W + 260)) - 130, by = b.y * ufuk, sc = b.s * kis(W / 402, 0.85, 1.4);
      c.save(); c.translate(bx, by); c.scale(sc, sc);
      c.beginPath(); c.rect(-80, -60, 160, 66); c.clip();                  // düz taban
      const g2 = c.createLinearGradient(0, -36, 0, 6);
      g2.addColorStop(0, rgb(isikR, bulutA)); g2.addColorStop(0.55, rgb(karis(isikR, golgeR, 0.35), bulutA)); g2.addColorStop(1, rgb(golgeR, bulutA * 0.9));
      c.fillStyle = g2; c.beginPath();
      for (const [ox, oy, rr] of b.k) { c.moveTo(ox + rr, 6 - oy); c.arc(ox, 6 - oy, rr, 0, 6.28); }
      c.fill();
      c.restore();
    }

    // şehir (renk her ~2 dakikada bir güncellenir)
    const kare2 = Math.round(alt * 2);
    if (!sehir || sehir.k !== kare2) {
      const uzak = karis(ufukR, [20, 26, 48], 0.45 + gece * 0.3), yakin = karis(karis(orta, [10, 14, 28], 0.78), [5, 8, 18], gece * 0.6);
      sehir = { ...sehirCiz(ufuk, uzak, yakin), k: kare2 };
      if (bilgi.mahya && !mahya) mahya = mahyaNoktalar(bilgi.mahya, 1);
    }
    c.drawImage(sehir.o, 0, 0, W, H);

    // gece: pencere ışıkları, şerefe kandilleri, mahya
    if (gece > 0.15) {
      for (const [x, y] of sehir.pencere) { c.fillStyle = `rgba(255,205,120,${0.55 * gece})`; c.fillRect(x, y, 1.6, 2); }
      for (const [x, y] of [...sehir.ana.serefeler, ...sehir.ikinci.serefeler]) {
        const k = c.createRadialGradient(x, y, 0, x, y, 6); k.addColorStop(0, `rgba(255,220,150,${0.9 * gece})`); k.addColorStop(1, "rgba(255,220,150,0)");
        c.fillStyle = k; c.fillRect(x - 6, y - 6, 12, 12);
      }
      if (mahya) {
        const [a, b2] = [sehir.ana.minareler[1], sehir.ana.minareler[2]];
        const gen = b2[0] - a[0] - 8, ox = (a[0] + b2[0]) / 2, oy = Math.min(a[1], b2[1]) + 6;
        c.strokeStyle = `rgba(255,220,150,${0.18 * gece})`; c.lineWidth = 0.5; c.beginPath(); c.moveTo(a[0], oy); c.lineTo(b2[0], oy); c.stroke();
        for (const [mx, my] of mahya) {
          const tit = 0.75 + 0.25 * Math.sin(t * 3 + mx * 40);
          c.fillStyle = `rgba(255,226,160,${gece * tit})`; c.beginPath(); c.arc(ox + mx * gen, oy + 3 + my * 0.9, 0.7, 0, 6.28); c.fill();
        }
      }
    }

    // Boğaz: gökten koyulaşan su + yansıma + pırıltı
    gr = c.createLinearGradient(0, ufuk, 0, H);
    gr.addColorStop(0, rgb(karis(ufukR, [16, 40, 60], 0.55))); gr.addColorStop(1, rgb(karis(tepe, [4, 16, 28], 0.7)));
    c.fillStyle = gr; c.fillRect(0, ufuk, W, H - ufuk);
    // şehrin dalgalı yansıması (ince şeritler, aşağı indikçe solar)
    const yansH = Math.min(H - ufuk, ufuk * 0.55);
    for (let y = 0; y < yansH; y += 2) {
      const kay = Math.sin(t * 1.6 + y * 0.35) * (0.6 + y / yansH * 2.4);
      c.globalAlpha = 0.34 * (1 - y / yansH) * (1 - gece * 0.35);
      c.drawImage(sehir.o, 0, (ufuk - y - 2) * dpr, cv.width, 2 * dpr, kay, ufuk + y, W, 2);
    }
    c.globalAlpha = 1;
    if (alt > -4) {   // güneş yolu
      const yol = c.createLinearGradient(gx - 30, 0, gx + 30, 0);
      const yr = karis([255, 236, 190], [255, 160, 90], kis(1 - alt / 25, 0, 1));
      yol.addColorStop(0, rgb(yr, 0)); yol.addColorStop(0.5, rgb(yr, 0.35 * (1 - gece))); yol.addColorStop(1, rgb(yr, 0));
      c.fillStyle = yol; c.fillRect(gx - 30, ufuk + 2, 60, H - ufuk);
    }
    for (let i = 0; i < 26; i++) {
      const y = ufuk + 4 + (i / 26) ** 1.4 * (H - ufuk - 4), w = 10 + (i % 5) * 9;
      const x = ((i * 97.3 + t * (6 + i % 3 * 3)) % (W + 80)) - 40;
      c.fillStyle = gece > 0.5 ? `rgba(255,215,150,${0.10 + 0.08 * Math.sin(t + i)})` : `rgba(255,255,255,${0.10 + 0.06 * Math.sin(t * 1.4 + i)})`;
      c.fillRect(x, y, w, 0.8);
    }

    // vapur: Boğaz'ı yavaşça geçer (yaklaşık 2 dakikada bir tur)
    const vx = ((t / 120 + 0.62) % 1) * (W + 160) - 80, vy = ufuk + (H - ufuk) * 0.2;
    c.save(); c.translate(vx, vy); const vs = kis(W / 402, 0.8, 1.5); c.scale(vs, vs);
    c.fillStyle = gece > 0.5 ? "#0c1220" : "#1b2330";
    c.beginPath(); c.moveTo(-34, 0); c.lineTo(34, 0); c.lineTo(28, 7); c.lineTo(-30, 7); c.fill();    // gövde
    c.fillStyle = gece > 0.5 ? "#141c2c" : "#f3efe4"; c.fillRect(-24, -8, 46, 8);                        // güverte
    c.fillStyle = gece > 0.5 ? "#141c2c" : "#e8e2d2"; c.fillRect(-14, -14, 26, 6);
    c.fillStyle = "#1b2330"; c.fillRect(2, -24, 6, 10); c.fillStyle = "#c8102e"; c.fillRect(2, -24, 6, 3);   // baca
    c.fillStyle = gece > 0.5 ? "rgba(255,210,130,.9)" : "rgba(40,60,80,.55)";
    for (let i = 0; i < 8; i++) c.fillRect(-21 + i * 5.4, -6, 3, 2.6);
    c.restore();
    c.fillStyle = gece > 0.5 ? "rgba(255,210,130,.12)" : "rgba(255,255,255,.12)"; c.fillRect(vx - 30 * vs, vy + 8 * vs, 64 * vs, 1.2);

    // martılar (gündüz)
    if (gece < 0.5) {
      c.strokeStyle = `rgba(30,36,48,${0.65 * (1 - gece * 2)})`; c.lineWidth = 1.2; c.lineCap = "round";
      for (const m of marti) {
        const x = ((m.x + t * m.v * 0.25) % 1.2 - 0.1) * W, y = m.y * ufuk + Math.sin(t * 0.8 + m.f) * 6, kanat = Math.sin(t * 5 + m.f) * 2.5;
        c.beginPath(); c.moveTo(x - 6, y - kanat); c.quadraticCurveTo(x - 3, y - 3 - kanat * 0.5, x, y); c.quadraticCurveTo(x + 3, y - 3 - kanat * 0.5, x + 6, y - kanat); c.stroke();
      }
    }

    // alt kenarda yumuşak karartma (üstteki kart okunaklı olsun)
    gr = c.createLinearGradient(0, H * 0.55, 0, H); gr.addColorStop(0, "rgba(10,14,20,0)"); gr.addColorStop(1, "rgba(10,14,20,.55)");
    c.fillStyle = gr; c.fillRect(0, H * 0.55, W, H * 0.45);
  }

  const azHareket = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let son = 0, sabit = null;
  function dongu(ms) {
    if (!cv.isConnected) { acik = false; removeEventListener("resize", boyut); return; }
    if (!document.hidden && ms - son > 33) { son = ms; ciz(sabit || new Date()); kare++; }
    if (!azHareket) requestAnimationFrame(dongu);
  }
  addEventListener("resize", boyut);
  boyut();
  if (azHareket) ciz(new Date()); else requestAnimationFrame(dongu);
  // mağaza görselleri / deneme için saati sabitle: sahne.saat(new Date(...))
  return { saat: (d) => { sabit = d; sehir = null; ciz(d); }, ciz };
}
