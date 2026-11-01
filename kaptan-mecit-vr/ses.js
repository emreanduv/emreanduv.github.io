/* Kaptan Mecit VR — 3B ses (tamamen yordamsal, dosya yok): tribün uğultusu, heyecan, düdük, top vuruşu, "ooo", gol sevinci.
   Dinleyici her karede gözlüğe eşitlenir; sesler sahadaki yerlerinden gelir. Ölçek: gerçek boyda metre, makette küçültülmüş. */
let ctx = null, ana = null, tribunKazanc = null, acik = true, gurultu = null, REF = 8;
const yeni = () => {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  ana = ctx.createGain(); ana.gain.value = acik ? 0.9 : 0; ana.connect(ctx.destination);
  const n = ctx.sampleRate * 2, b = ctx.createBuffer(2, n, ctx.sampleRate);           // 2 sn pembe gürültü
  for (let k = 0; k < 2; k++) { const d = b.getChannelData(k); let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11; } }
  gurultu = b;
  /* tribün: her yönden gelen, konumsuz uğultu (stadyumun içindesin) */
  const src = ctx.createBufferSource(); src.buffer = b; src.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 0.55;
  tribunKazanc = ctx.createGain(); tribunKazanc.gain.value = 0.1;
  src.connect(bp); bp.connect(tribunKazanc); tribunKazanc.connect(ana); src.start();
};
function konum(x, y, z) {
  const p = ctx.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = REF; p.rolloffFactor = 0.9;
  if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; } else p.setPosition(x, y, z);
  p.connect(ana); return p;
}
const kalabalik = (sure, tepe, frek, t0 = 0) => {
  if (!ctx || !acik || !gurultu) return; const t = ctx.currentTime + t0, g = ctx.createGain(), s = ctx.createBufferSource(), f = ctx.createBiquadFilter();
  s.buffer = gurultu; s.loop = true; f.type = 'bandpass'; f.frequency.value = frek; f.Q.value = 0.5; s.connect(f); f.connect(g); g.connect(ana);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(tepe, t + 0.25); g.gain.setTargetAtTime(0, t + sure, sure * 0.35); s.start(t, Math.random()); s.stop(t + sure * 2.6 + 0.5);
};
export const Ses = {
  baslat() { try { if (!ctx) yeni(); if (ctx.state === 'suspended') ctx.resume(); } catch { /* ses yok */ } },
  get acik() { return acik; },
  ac(v) { acik = v; try { if (ana) ana.gain.setTargetAtTime(v ? 0.9 : 0, ctx.currentTime, 0.05); localStorage.setItem('kmvr.ses', v ? '1' : '0'); } catch { /* */ } },
  olcek(ref) { REF = ref; },
  dinleyici(cam) {
    if (!ctx) return; const L = ctx.listener, e = cam.matrixWorld.elements, t = ctx.currentTime;
    const px = e[12], py = e[13], pz = e[14], fx = -e[8], fy = -e[9], fz = -e[10], ux = e[4], uy = e[5], uz = e[6];
    if (L.positionX) { L.positionX.setValueAtTime(px, t); L.positionY.setValueAtTime(py, t); L.positionZ.setValueAtTime(pz, t);
      L.forwardX.setValueAtTime(fx, t); L.forwardY.setValueAtTime(fy, t); L.forwardZ.setValueAtTime(fz, t); L.upX.setValueAtTime(ux, t); L.upY.setValueAtTime(uy, t); L.upZ.setValueAtTime(uz, t); }
    else { L.setPosition(px, py, pz); L.setOrientation(fx, fy, fz, ux, uy, uz); }
  },
  /* heyecan 0–1: top bir kaleye yaklaştıkça tribün yükselir */
  heyecan(h) { if (tribunKazanc) tribunKazanc.gain.setTargetAtTime(0.08 + 0.2 * Math.max(0, Math.min(1, h)), ctx.currentTime, 0.4); },
  duduk(uzun = false, x = 0, y = 1, z = 0, kez = 1) {
    if (!ctx || !acik) return; const p = konum(x, y, z);
    for (let k = 0; k < kez; k++) {
      const t = ctx.currentTime + k * 0.45, g = ctx.createGain(); g.connect(p);
      const sure = uzun ? 0.9 : 0.32, o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'square'; o.frequency.value = 2900; lfo.frequency.value = 32; lg.gain.value = 140; lfo.connect(lg); lg.connect(o.frequency);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2900; f.Q.value = 4; o.connect(f); f.connect(g);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.02); g.gain.setValueAtTime(0.16, t + sure - 0.05); g.gain.linearRampToValueAtTime(0, t + sure);
      o.start(t); lfo.start(t); o.stop(t + sure + 0.05); lfo.stop(t + sure + 0.05);
    }
  },
  vurus(x, y, z, guc = 1) {
    if (!ctx || !acik || !gurultu) return; const t = ctx.currentTime, p = konum(x, y, z), g = ctx.createGain(), s = ctx.createBufferSource(), f = ctx.createBiquadFilter();
    s.buffer = gurultu; f.type = 'lowpass'; f.frequency.value = 900; s.connect(f); f.connect(g); g.connect(p);
    g.gain.setValueAtTime(0.6 * Math.min(1, guc), t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09); s.start(t, Math.random()); s.stop(t + 0.1);
  },
  ooo() { kalabalik(0.9, 0.35, 420); },
  tik() {
    if (!ctx || !acik) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(1320, t + 0.04); o.connect(g); g.connect(ana);
    g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.07); o.start(t); o.stop(t + 0.08);
  },
  gol() { kalabalik(2.4, 0.95, 900); kalabalik(1.6, 0.5, 1500, 0.15); },
};
try { if (localStorage.getItem('kmvr.ses') === '0') acik = false; } catch { /* */ }
