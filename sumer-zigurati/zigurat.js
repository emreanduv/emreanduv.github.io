// Sümer Ziguratı — Ur Ziguratı'nın tepesinde bir gece. WebXR (Quest, Vision Pro, Android XR) + masaüstü/telefon. Bir Mr. Anduv! yapımıdır.
// Sahne temsilîdir: ölçüler yaklaşık (Ur Ziguratı tabanı ~64 × 46 m, üç kat). Gök bu gecenin gerçek Ay evresi ve gezegenleriyle kurulur (yaklaşık).
import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { yardimKur } from './yardim.js';

const $ = (s) => document.querySelector(s);
const RENK = { ink:'#1c2a44', deep:'#101c33', lapis:'#1f4fa0', clay:'#c4683a', gold:'#e0b04a', paper:'#fbf7ef', navy:'#132545', navy2:'#162b52', muted:'#6b7280', teal:'#0f766e' };
const KIND = { 'Mit':['#1f4fa0','🌌'], 'Destan':['#9b3b2a','⚔️'], 'İlahi':['#b0306a','🎶'], 'Ağıt':['#4b2d5c','🕯️'], 'Bilgelik':['#3f7a3a','🦉'], 'Tartışma':['#2c6b8f','🗣️'],
  'Yasa':['#8a5a2b','⚖️'], 'Mektup':['#d0861a','✉️'], 'Kral Listesi':['#7a4fd1','👑'], 'Belge':['#5d6b72','🧮'], 'Dizi':['#7a2e1f','📺'] };
const ROMA = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const yilYaz = (y) => y < 0 ? `MÖ ${Math.abs(y).toLocaleString('tr-TR')}` : `MS ${y}`;
const CUN = "'Sumer Cuneiform'";
const ISARET = [...'𒀭𒆠𒈗𒂗𒀀𒆳𒌓𒊮𒁹𒌋𒂍𒉣𒈨𒄑𒋗𒁲𒇽𒊩𒌉𒆍𒀊𒅎𒁀𒉡𒈠𒈾𒊑𒋛𒌨𒄀𒆪𒅗'];
const rastIsaret = (n, r = Math.random) => Array.from({ length:n }, () => ISARET[Math.floor(r() * ISARET.length)]).join('');
function tohum(str){ let h = 2166136261; for(const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 1000) / 1000; }

// ── ziguratın ölçüleri (metre). En üst teras y=0; tapınak -z yönünde. ──
const TW = 26, TD = 26, ZEMIN = -22;
const LEVHA_Z = -4.3, RAF_X = -8.2, SUNAK_X = 7.4;

let V = null;
const durum = { kaynak:'g', i:0, si:-1, oto:false, sonraki:0, anim:0 }; // kaynak: 'g' Gılgamış bölümü, 't' tablet
let adim = '';
try { adim = localStorage.getItem('sz_ad') || ''; } catch(e){}

// ── yardımcılar: tuval dokuları ──
function tuval(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function sar(ctx, metin, genislik){ const kel = String(metin).split(/\s+/), sat = []; let cur = '';
  for(const k of kel){ const t = cur ? cur + ' ' + k : k; if(ctx.measureText(t).width > genislik && cur){ sat.push(cur); cur = k; } else cur = t; } if(cur) sat.push(cur); return sat; }
function yuvarlak(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function doku(c, tekrar){ const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if(tekrar){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...tekrar); } return t; }
const gurultu = (x, n, a, renk) => { for(let i = 0; i < n; i++){ x.fillStyle = `rgba(${renk},${Math.random() * a})`; x.fillRect(Math.random() * x.canvas.width, Math.random() * x.canvas.height, 2, 2); } };

function kerpic(w = 512, h = 512, ton = [176, 122, 78]){ // pişmiş kerpiç duvar
  const [c, x] = tuval(w, h); x.fillStyle = '#6b4a30'; x.fillRect(0, 0, w, h);
  const bw = 64, bh = 24;
  for(let r = 0; r * bh < h; r++) for(let k = -1; k * bw < w; k++){
    const ox = (r % 2) * bw / 2, s = .8 + Math.random() * .35;
    x.fillStyle = `rgb(${ton[0] * s | 0},${ton[1] * s | 0},${ton[2] * s | 0})`; x.fillRect(k * bw + ox + 2, r * bh + 2, bw - 4, bh - 4);
  }
  gurultu(x, 6000, .12, '40,25,10'); return c;
}
function kum(){ const [c, x] = tuval(512, 512); x.fillStyle = '#7a6448'; x.fillRect(0, 0, 512, 512); gurultu(x, 9000, .18, '40,30,18'); gurultu(x, 4000, .12, '200,170,120'); return c; }
function kilTablet(id, w = 256, h = 340, satir = 9){ // küçük kil tablet yüzü: çivi işaretli satırlar
  const [c, x] = tuval(w, h), r = tohum(id);
  const g = x.createRadialGradient(w * .35, h * .25, 10, w * .5, h * .5, w); g.addColorStop(0, '#ecc08a'); g.addColorStop(.6, '#c98c52'); g.addColorStop(1, '#a8693a');
  yuvarlak(x, 4, 4, w - 8, h - 8, 28); x.fillStyle = g; x.fill();
  x.fillStyle = '#5a321488'; x.font = `${(h - 40) / satir * .62 | 0}px ${CUN}`;
  for(let i = 0; i < satir; i++){ const y = 30 + (i + .8) * (h - 40) / satir; x.fillText(rastIsaret(6, r), 18, y); x.fillStyle = '#5a321422'; x.fillRect(16, y + 6, w - 32, 2); x.fillStyle = '#5a321488'; }
  return c;
}

// ── Babil göğü: Ay, Güneş ve beş gezegen (JPL yaklaşık yörünge öğeleri, 1800–2050; ±1–2°) ──
const RAD = Math.PI / 180, n360 = (v) => ((v % 360) + 360) % 360, n180 = (v) => { v = n360(v); return v > 180 ? v - 360 : v; };
const ELEM = {
  mercury:[0.38709927,0.20563593,7.00497902,252.25032350,77.45779628,48.33076593, 0.00000037,0.00001906,-0.00594749,149472.67411175,0.16047689,-0.12534081],
  venus:[0.72333566,0.00677672,3.39467605,181.97909950,131.60246718,76.67984255, 0.00000390,-0.00004107,-0.00078890,58517.81538729,0.00268329,-0.27769418],
  earth:[1.00000261,0.01671123,-0.00001531,100.46457166,102.93768193,0, 0.00000562,-0.00004392,-0.01294668,35999.37244981,0.32327364,0],
  mars:[1.52371034,0.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891, 0.00001847,0.00007882,-0.00813131,19140.30268499,0.44441088,-0.29257343],
  jupiter:[5.20288700,0.04838624,1.30439695,34.39644051,14.72847983,100.47390909, -0.00011607,-0.00013253,-0.00183714,3034.74612775,0.21252668,0.20469106],
  saturn:[9.53667594,0.05386179,2.48599187,49.95424423,92.59887831,113.66242448, -0.00125060,-0.00050991,0.00193609,1222.49362201,-0.41897216,-0.28867794]
};
function helio(ad, T){
  const k = ELEM[ad], a = k[0] + k[6] * T, e = k[1] + k[7] * T, I = (k[2] + k[8] * T) * RAD, L = k[3] + k[9] * T, w = k[4] + k[10] * T, O0 = k[5] + k[11] * T, O = O0 * RAD;
  const M = n180(L - w) * RAD, om = (w - O0) * RAD;
  let E = M + e * Math.sin(M); for(let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E), co = Math.cos(om), so = Math.sin(om), cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I);
  return [(co * cO - so * sO * cI) * xp + (-so * cO - co * sO * cI) * yp, (co * sO + so * cO * cI) * xp + (-so * sO + co * cO * cI) * yp];
}
const SYN = 29.530588853, NEW0 = Date.UTC(2000, 0, 6, 18, 14) / 1000;
function gok(t = Date.now() / 1000){
  const JD = t / 86400 + 2440587.5, d = JD - 2451545, T = d / 36525, E = helio('earth', T), gunes = n360(Math.atan2(-E[1], -E[0]) / RAD);
  const yas = (((t - NEW0) / 86400) % SYN + SYN) % SYN, f = yas / SYN, isik = Math.round((1 - Math.cos(2 * Math.PI * f)) / 2 * 100);
  const ad = yas < 1.5 || yas > SYN - 1.5 ? 'Yeni ay' : f < .23 ? 'Büyüyen hilal' : f < .27 ? 'İlk dördün' : f < .48 ? 'Büyüyen ay' : f < .52 ? 'Dolunay' : f < .73 ? 'Küçülen ay' : f < .77 ? 'Son dördün' : 'Küçülen hilal';
  const ayBoylam = n360(218.316 + 13.176396 * d + 6.289 * Math.sin((134.963 + 13.064993 * d) * RAD));
  const out = { gunes, ay:{ yas, f, isik, ad, boylam:ayBoylam, uzanim:n180(ayBoylam - gunes) }, gez:{} };
  for(const p of ['venus', 'jupiter', 'mars', 'saturn', 'mercury']){
    const P = helio(p, T), lon = n360(Math.atan2(P[1] - E[1], P[0] - E[0]) / RAD), el = n180(lon - gunes), lim = p === 'mercury' ? 18 : p === 'venus' ? 10 : 15;
    out.gez[p] = { lon, el, gor:Math.abs(el) < lim ? 'kayip' : el > 0 ? 'aksam' : 'sabah' };
  }
  out.burc = (lon) => Math.floor(n360(lon - 24.2) / 30); // Babil burçları yıldızlara bağlıydı
  return out;
}

// ── adın çivi yazısıyla (Akadca hece işaretleri, yaklaşık) ──
function cuneAd(name){
  const H = (V && V.hece) || {};
  let s = (name || '').toLocaleLowerCase('tr').replace(/[çş]/g, 'š').replace(/c/g, 'z').replace(/ğ/g, '').replace(/ı/g, 'i').replace(/[öüo]/g, 'u').replace(/f/g, 'p').replace(/j/g, 'z').replace(/q/g, 'k').replace(/x/g, 'ks').replace(/[^a-zš]/g, '');
  s = s.replace(/y(?![aeiu])/g, 'i'); s = s.replace(/va/g, 'wa').replace(/v/g, 'b').replace(/w(?!a)/g, 'b');
  const Vk = (ch) => 'aeiu'.includes(ch), Ck = (ch) => ch && !Vk(ch), out = [], it = (k) => { if(H[k]) out.push(k); };
  for(let i = 0; i < s.length;){
    const c = s[i];
    if(Vk(c)){ if(Ck(s[i + 1]) && (i + 2 >= s.length || Ck(s[i + 2])) && H[c + s[i + 1]]){ it(c + s[i + 1]); i += 2; continue; } it(c); i++; continue; }
    if(Vk(s[i + 1])){ const v = s[i + 1]; if(H[c + v]) it(c + v); else it(v); i += 2; if(Ck(s[i]) && (i + 1 >= s.length || Ck(s[i + 1])) && H[v + s[i]]){ it(v + s[i]); i++; } continue; }
    const nv = (s.slice(i).match(/[aeiu]/) || ['u'])[0]; if(H[c + nv]) it(c + nv); else if(H[c + 'u']) it(c + 'u'); i++;
  }
  return { g:out.map(k => H[k]).join(''), h:out.join('-') };
}

// ── taş levha (FM2010 kartı, kil tablet zemini): satırlar önce çivi yazısı, sonra Türkçe ──
const [levC, levX] = tuval(2048, 1536); let levT;
function metin(){ return durum.kaynak === 'g' ? V.gilgamis[durum.i] : V.tabletler[durum.i]; }
function levhaCiz(now = performance.now()){
  const x = levX, Wc = 2048, Hc = 1536, M = metin(), S = M.satirlar, g = durum.kaynak === 'g';
  x.clearRect(0, 0, Wc, Hc);
  // kil zemin
  yuvarlak(x, 10, 10, Wc - 20, Hc - 20, 70);
  const zg = x.createRadialGradient(Wc * .35, Hc * .2, 40, Wc * .5, Hc * .5, Wc * .8); zg.addColorStop(0, '#f6dcae'); zg.addColorStop(.7, '#e3b678'); zg.addColorStop(1, '#c98c52'); x.fillStyle = zg; x.fill();
  x.save(); yuvarlak(x, 10, 10, Wc - 20, Hc - 20, 70); x.clip();
  for(let i = 0; i < Wc; i += 120){ x.fillStyle = i / 120 % 2 ? RENK.navy2 : RENK.navy; x.fillRect(i, 10, 120, 170); }
  const hg = x.createRadialGradient(360, -60, 10, 360, -60, 760); hg.addColorStop(0, '#4a6fb8cc'); hg.addColorStop(1, '#4a6fb800'); x.fillStyle = hg; x.fillRect(0, 10, Wc, 170);
  x.fillStyle = RENK.gold; x.fillRect(0, 180, Wc, 12);
  x.restore();
  x.fillStyle = '#f2c870'; x.font = "900 60px 'DM Sans'";
  x.fillText(g ? `GILGAMIŞ DESTANI · TABLET ${ROMA[M.no - 1]} / 12` : `${(KIND[M.tur] || ['', '📜'])[1]} ${M.tur.toLocaleUpperCase('tr')} · ${M.dil.toLocaleUpperCase('tr')}`, 80, 112);
  x.fillStyle = '#d3def3'; x.font = "700 42px 'DM Sans'"; x.textAlign = 'right';
  x.fillText(g ? 'Ninova · Standart Babil sürümü' : `${M.yer.split(',')[0]} · ${yilYaz(M.yil)} civarı`, Wc - 80, 112); x.textAlign = 'left';
  const L = 110, GEN = Wc - 2 * L;
  if(durum.si < 0){ // başlık kartı
    x.fillStyle = '#5a3214aa'; x.font = `120px ${CUN}`; x.fillText(g ? '𒀭𒄑𒂆𒈦' : (M.isaret || '𒀭'), L, 380);
    x.fillStyle = RENK.deep; x.font = "900 104px 'DM Sans'"; let y = 520;
    for(const l of sar(x, g ? `Bölüm ${M.no}: ${M.baslik}` : M.baslik, GEN).slice(0, 3)){ x.fillText(l, L, y); y += 118; }
    x.fillStyle = '#4a3a22'; x.font = "500 62px 'DM Sans'"; y += 20;
    for(const l of sar(x, g ? (M.gelecek || '').replace(/^Gelecek hafta:\s*/, 'Sıradaki: ') : M.ne, GEN).slice(0, 3)){ x.fillText(l, L, y); y += 72; }
    x.fillStyle = RENK.lapis; x.font = "800 48px 'DM Sans'"; x.fillText(`${S.length} satır · başlamak için ▶ (tetik)`, L, Hc - 170);
  } else {
    // satırlar: geçmiştekiler soluk, son satır parlak; son satır çivi yazısından Türkçeye "çözülür"
    const bas = Math.max(0, durum.si - 4), goster = S.slice(bas, durum.si + 1);
    let boy = 96, sat; const hesap = () => { x.font = `700 ${boy}px 'DM Sans'`; sat = goster.map(s => sar(x, s, GEN - 110)); return sat.reduce((a, b) => a + b.length, 0) * boy * 1.24 + goster.length * 16; };
    while(hesap() > 1040 && boy > 44) boy -= 3;
    let y = 260 + boy;
    const p = Math.min(1, (now - durum.anim) / 1900); // 0 → 1 çözülme
    goster.forEach((s, k) => {
      const son = k === goster.length - 1, no = bas + k + 1;
      x.fillStyle = son ? RENK.clay : '#8a5a2b99'; x.font = "800 40px 'Barlow Condensed'"; x.textAlign = 'right'; x.fillText(String(no), L + 70, y); x.textAlign = 'left';
      for(const l of sat[k]){
        if(!son){ x.fillStyle = '#2a1d0cb0'; x.font = `600 ${boy}px 'DM Sans'`; x.fillText(l, L + 100, y); }
        else {
          const g1 = Math.max(0, Math.min(1, (p - .35) / .55)); // Türkçe görünme oranı
          if(p < .75){ x.save(); x.globalAlpha = p < .35 ? p / .35 : Math.max(0, 1 - (p - .35) / .4); x.fillStyle = '#7a4a10'; x.shadowColor = '#ffd76a'; x.shadowBlur = 30;
            x.font = `${boy * .9 | 0}px ${CUN}`; x.fillText(rastIsaret(Math.max(5, Math.min(18, l.length / 4 | 0)), tohum(l)), L + 100, y - (p > .35 ? (p - .35) * 40 : 0)); x.restore(); }
          if(g1 > 0){ x.font = `800 ${boy}px 'DM Sans'`; const w = x.measureText(l).width; x.save(); x.beginPath(); x.rect(L + 100, y - boy * 1.1, w * g1 + 4, boy * 1.5); x.clip();
            x.fillStyle = RENK.deep; x.shadowColor = '#ffe39a'; x.shadowBlur = 24; x.fillText(l, L + 100, y); x.restore(); }
        }
        y += boy * 1.24;
      }
      y += 16;
    });
  }
  // alt şerit: ilerleme + kumanda ipucu
  x.fillStyle = '#5a32141f'; yuvarlak(x, L, Hc - 112, 900, 24, 12); x.fill();
  const once = durum.si + 1, toplam = S.length;
  const gr = x.createLinearGradient(L, 0, L + 900, 0); gr.addColorStop(0, RENK.lapis); gr.addColorStop(1, RENK.gold); x.fillStyle = gr; yuvarlak(x, L, Hc - 112, Math.max(24, 900 * once / toplam), 24, 12); x.fill();
  x.fillStyle = '#6b3d1c'; x.font = "800 38px 'DM Sans'"; x.fillText(durum.si < 0 ? 'başlık' : `satır ${durum.si + 1}/${toplam}`, L + 930, Hc - 90);
  x.textAlign = 'right'; x.fillText('▶ tetik · ◀ kavrama', Wc - 90, Hc - 90); x.textAlign = 'left';
  levT.needsUpdate = true;
}
function levhaGuncel(){
  levhaCiz(); const M = metin();
  $('#sec').value = `${durum.kaynak}:${durum.i}`;
  $('#alt').textContent = durum.kaynak === 'g' ? `Gılgamış · Tablet ${ROMA[M.no - 1]}: ${M.baslik}` : `${M.baslik} · ${M.yer.split(',')[0]}`;
  vurgu();
}
function git(adim){
  if(!V) return; // veri gelmeden (VR erken açıldıysa) tetik boşa düşsün
  const M = metin(); durum.si += adim;
  if(durum.si >= M.satirlar.length){ // sıradaki metne geç
    if(durum.kaynak === 'g'){ if(durum.i < V.gilgamis.length - 1){ durum.i++; } else { durum.kaynak = 't'; durum.i = 0; } }
    else durum.i = (durum.i + 1) % V.tabletler.length;
    durum.si = -1;
  }
  if(durum.si < -1) durum.si = -1;
  durum.anim = performance.now(); durum.sonraki = performance.now() + sure(); levhaGuncel(); if(adim > 0 && durum.si >= 0) cinla(.5);
}
function ac(kaynak, i){ durum.kaynak = kaynak; durum.i = i; durum.si = -1; durum.anim = performance.now(); durum.sonraki = performance.now() + sure(); levhaGuncel(); cinla(1); }
function sure(){ const M = metin(), s = durum.si >= 0 ? M.satirlar[durum.si] : ''; return Math.max(7000, (s || 'x'.repeat(90)).length * 85); }

// ── panolar (FM2010) ──
function panoZemin(x, Wc, Hc, baslik){
  x.clearRect(0, 0, Wc, Hc); yuvarlak(x, 6, 6, Wc - 12, Hc - 12, 28); x.fillStyle = '#0f1b31'; x.fill(); x.strokeStyle = RENK.gold; x.lineWidth = 6; x.stroke();
  x.fillStyle = RENK.clay; x.fillRect(6, 96, Wc - 12, 8); x.fillStyle = '#f2c870'; x.font = "900 54px 'DM Sans'"; x.fillText(baslik, 40, 72);
}
const VIS = { aksam:'🌆 akşam göğünde', sabah:'🌅 şafakta', kayip:'☀️ Güneş ışığında' };
function gokPanosu(c, x){
  const K = gok(), G = V.gok, B = G.burclar, P = G.gezegenler, Wc = c.width, Hc = c.height; panoZemin(x, Wc, Hc, '🌙 BABİL GÖĞÜ BU GECE');
  const mb = B[K.burc(K.ay.boylam)];
  x.fillStyle = '#fff3cf'; x.font = "900 46px 'DM Sans'"; x.fillText(`Nanna (Ay): ${K.ay.ad} · %${K.ay.isik}`, 40, 170);
  x.fillStyle = '#d3def3'; x.font = "600 34px 'DM Sans'"; x.fillText(`Babil burcu ${mb.bab} · "${mb.anlam}"`, 40, 216);
  let y = 290;
  for(const p of ['venus', 'jupiter', 'mars', 'saturn', 'mercury']){
    const q = K.gez[p], m = P[p];
    x.fillStyle = q.gor === 'kayip' ? '#8a93a8' : RENK.gold; x.font = "800 40px 'Barlow Condensed', 'DM Sans'"; x.fillText(m.ad, 40, y);
    x.fillStyle = q.gor === 'kayip' ? '#8a93a8' : '#e8eefb'; x.font = "500 32px 'DM Sans'"; x.fillText(`${m.bab.split(' (')[0]} · ${m.tanri.split(' (')[0]} · ${VIS[q.gor]}`, 230, y); y += 58;
  }
  const keys = [/Dolunay/.test(K.ay.ad) ? 'dolunay' : /Yeni/.test(K.ay.ad) ? 'yeniay' : /Küçülen hilal/.test(K.ay.ad) ? 'hilal_son' : /hilal/.test(K.ay.ad) ? 'hilal' : /dördün/.test(K.ay.ad) ? 'dordun' : 'genel', 'venus_' + K.gez.venus.gor];
  const om = keys.map(k => G.kehanetler.find(o => o.k === k)).filter(Boolean);
  y += 20; x.fillStyle = RENK.clay; x.fillRect(40, y - 40, Wc - 80, 4);
  x.fillStyle = '#f2c870'; x.font = "900 36px 'DM Sans'"; x.fillText('📜 Kâhinlerin tableti', 40, y + 10); y += 62;
  x.fillStyle = '#fff6e0'; x.font = "italic 600 31px 'DM Sans'";
  for(const o of om){ for(const l of sar(x, o.m, Wc - 90).slice(0, 3)){ if(y > Hc - 70) break; x.fillText(l, 40, y); y += 40; } y += 12; }
  x.fillStyle = '#8a93a8'; x.font = "600 24px 'DM Sans'"; x.fillText('Konumlar yaklaşık · kehanetler eski kalıpta serbest örnektir, gerçek tahmin değildir', 40, Hc - 34);
}
let efI = 0;
function efsanePanosu(c, x){
  const F = V.efsaneler[efI % V.efsaneler.length], Wc = c.width, Hc = c.height; panoZemin(x, Wc, Hc, '🔍 EFSANE Mİ, GERÇEK Mİ?');
  const H = { efsane:['❌ EFSANE', '#e05a5f'], kismen:['🟡 KISMEN DOĞRU', '#e0a93a'], gercek:['✅ GERÇEK', '#3fbf74'] }[F.hukum] || ['?', '#fff'];
  x.fillStyle = '#fff'; x.font = "800 42px 'DM Sans'"; let y = 180;
  for(const l of sar(x, `“${F.iddia}”`, Wc - 80).slice(0, 4)){ x.fillText(l, 40, y); y += 54; }
  y += 10; x.fillStyle = '#f2c870'; x.font = "900 32px 'DM Sans'"; x.fillText('📜 Tabletler', 40, y); y += 44;
  x.fillStyle = '#e8eefb'; x.font = "500 30px 'DM Sans'"; for(const l of sar(x, F.tablet, Wc - 80).slice(0, 4)){ x.fillText(l, 40, y); y += 38; }
  y += 10; x.fillStyle = '#f2c870'; x.font = "900 32px 'DM Sans'"; x.fillText('🔬 Bilim', 40, y); y += 44;
  x.fillStyle = '#e8eefb'; x.font = "500 30px 'DM Sans'"; for(const l of sar(x, F.bilim, Wc - 80).slice(0, 5)){ if(y > Hc - 150) break; x.fillText(l, 40, y); y += 38; }
  x.save(); x.translate(Wc - 300, Hc - 90); x.rotate(-.08); x.strokeStyle = H[1]; x.lineWidth = 8; x.fillStyle = H[1]; x.font = "900 54px 'Barlow Condensed', 'DM Sans'";
  const w = x.measureText(H[0]).width; x.strokeRect(-w / 2 - 22, -56, w + 44, 76); x.textAlign = 'center'; x.fillText(H[0], 0, 0); x.restore();
  x.fillStyle = '#d3def3'; x.font = "700 28px 'DM Sans'"; for(const l of sar(x, F.kisaca, Wc - 560).slice(0, 2)){ x.fillText(l, 40, Hc - 96 + (sar(x, F.kisaca, Wc - 560).length > 1 ? 0 : 20)); break; }
}
function kronoPanosu(c, x, kb){
  const K = V.kronoloji, Wc = c.width, Hc = c.height; panoZemin(x, Wc, Hc, '⏳ KRONOLOJİ'); let y = 170;
  for(let i = 0; i < 6; i++){ const k = K[(kb + i) % K.length]; x.fillStyle = RENK.gold; x.font = "800 40px 'Barlow Condensed', 'DM Sans'"; x.fillText(k.t, 40, y);
    x.fillStyle = '#e8eefb'; x.font = "500 31px 'DM Sans'"; const L = sar(x, `${k.b}: ${k.m}`, Wc - 280).slice(0, 2); L.forEach((l, j) => x.fillText(l, 240, y + j * 40)); y += Math.max(1, L.length) * 40 + 26; }
}

// ── sahne ──
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor');
renderer.xr.setFramebufferScaleFactor(0.9); // Quest performansı: göz başına çözünürlük %90 (gölge haritası yok)
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#050a18'); scene.fog = new THREE.Fog('#0b1630', 60, 420);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 2000);
const rig = new THREE.Group(); rig.add(camera); scene.add(rig);
rig.position.set(0, 0, 2.2); camera.position.set(0, 1.6, 0);
const tiklanir = [];

// ── rehber + nasıl kullanılır + verilerimi sil (yardim.js) ──
const SURUM = '1.0.1';
const Y = yardimKur({ THREE, scene, camera, renderer, tiklanir, ad:'Sümer Ziguratı', anahtar:'sz', surum:SURUM, onek:/^sz[._]/, dugmeOnu:'#vr', girisKart:'#giris .kart',
  eski:() => localStorage.getItem('sz_ad') != null, temelIpuclari:['giris', 'yuru'],
  url:'https://emreanduv.github.io/sumer-zigurati/', paylasMetni:"Sümer Ziguratı: Ur Ziguratı'nın tepesinde bir gece. Kil tabletler önce çivi yazısıyla parlıyor, sonra Türkçeye çözülüyor. VR gözlükte, bilgisayarda ve telefonda.",
  silMetni:'sunaktaki tablete kazınan adın ve rehberde hangi ipuçlarını gördüğün.', ilerleme:() => V ? `${durum.kaynak === 'g' ? 'Gılgamış ' + ROMA[durum.i] : 'tablet ' + (durum.i + 1)}` : '',
  renk:{ bant:'#132545', bant2:'#162b52', vurgu:'#e0b04a', kagit:'#fff3d9', kagit2:'#f3e2bf', murekkep:'#1c2a44', soluk:'#6b4a2a', dugme:'#1f4fa0' },
  temel:{ m:["<b>Sümer Ziguratı</b>: Ur Ziguratı'nın tepesinde, gece. Ortadaki taş levhada kil tabletlerin satırları önce çivi yazısıyla parlar, sonra Türkçeye çözülür.",
      "<b>Başlamak için:</b> ▶ ile sonraki satıra geç, ◀ ile geri dön. Soldaki raftan Gılgamış'ın 12 tabletini, sağdaki sunaktan en sevilen metinleri seç; alttaki listeden de her tablete ulaşırsın. 🔊 gece seslerini açar, 🥽 VR gözlükle zigurata çıkarır."],
    v:["Ur Ziguratı'nın tepesindesin. Taş levhada kil tabletlerin satırları önce çivi yazısıyla parlar, sonra Türkçeye çözülür.",
      "Tetik: sonraki satır · kavrama: önceki satır. Raftaki, sunaktaki tabletlere ya da zemine nişan alıp tetikle. Sağ çubukla dön.",
      "Bu pano: kumandada A, B, X ya da Y tuşu veya bel hizandaki ? düğmesi."] },
  ipuclari:[
    { id:'giris', b:'𒀭 Taş levha', m:'▶ ya da boşluk tuşu sonraki satıra geçer, ◀ geri alır. Levhaya dokunmak da ilerletir. ⏵ Oto satırları kendiliğinden akıtır.', v:'Tetik sonraki satıra geçer, kavrama geri alır. Levhaya ya da altındaki ◀ ⏵ ▶ düğmelerine nişan alıp da tetikleyebilirsin.' },
    { id:'yuru', b:'🚶 Terasta dolaş', m:'Sürükleyerek etrafına bak. Zemine çift dokun ya da W A S D ile yürü; fare tekerleği yakınlaştırır.', v:'Zemine nişan alıp tetikle: oraya yürürsün. Sağ çubuğu yana itince 30° dönersin.' },
    { id:'raf', b:'📺 Gılgamış rafı', m:'Soldaki rafta Gılgamış Destanı\'nın 12 tableti var. Birine dokun: levhada o tablet baştan açılır, bitince sıradaki gelir.', v:'Soldaki rafta Gılgamış Destanı\'nın 12 tableti var. Birine nişan alıp tetikle: levhada o tablet açılır.' },
    { id:'sunak', b:'📜 Tablet sunağı', m:'Sağdaki sunakta en sevilen metinler (İnanna, tufan, Ninkasi, Ur-Nammu…) ve adının kazındığı tablet durur. Birine dokun, levhada okunsun.', v:'Sağdaki sunakta en sevilen metinler ve adının kazındığı tablet durur. Birine nişan alıp tetikle.' },
    { id:'gok', b:'🌙 Bu geceki gök', m:'Yukarı bak: Ay ve gezegenler bu gecenin konumlarıyla kurulur (yaklaşık). Korkuluk panoları gök, efsaneler ve kronoloji anlatır.', v:'Başını kaldır: Ay ve gezegenler bu gecenin konumlarıyla kurulur (yaklaşık).' },
    { id:'ses', b:'🔊 Gece sesleri', m:'Üstteki 🔇/🔊 düğmesi rüzgârı, cırcır böceklerini ve mangal ateşini açıp kapatır. Sesler cihazda üretilir, dosya indirilmez.', v:'Rüzgâr, cırcır böcekleri ve mangal ateşi cihazda üretilir; satır değişince hafif bir çınlama duyulur.' },
    { id:'oto', b:'⏵ Oto', m:'Oto açıkken satırlar uzunluklarına göre kendiliğinden ilerler. ⏸ ile durdurursun.', v:'Oto açıkken satırlar kendiliğinden ilerler. Levhanın altındaki orta düğmeyle durdurursun.' },
    { id:'yardim', b:'❓ Yardım hep yanında', m:'Üstteki ? düğmesi bu rehberi açar: bütün ipuçları, "Rehberi baştan göster", görüş yazma ve Verilerimi sil.', v:'Kumandadaki A, B, X ya da Y tuşu veya bel hizandaki ? düğmesi bu panoyu açar: bütün ipuçları ve Verilerimi sil.' },
  ], sira:['giris', 'yuru', 'raf', 'sunak', 'yardim', 'gok', 'ses'] });
const atesler = []; let tozP, levha, sunakAd, raf = [], sunak = [];

function kutu(w, h, d, mat, x, y, z, ad){ const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); if(ad) m.name = ad; scene.add(m); return m; }
function etiket(metin, alt, gen = 0.5){
  const [c, x] = tuval(640, 160); yuvarlak(x, 4, 4, 632, 152, 26); x.fillStyle = '#0f1b31e6'; x.fill(); x.strokeStyle = '#e0b04a88'; x.lineWidth = 3; x.stroke();
  x.fillStyle = '#f2c870'; x.font = "900 46px 'DM Sans'"; const t = sar(x, metin, 600)[0]; x.fillText(t, 22, alt ? 66 : 96);
  if(alt){ x.fillStyle = '#d3def3'; x.font = "700 32px 'DM Sans'"; x.fillText(sar(x, alt, 600)[0], 22, 122); }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map:doku(c), toneMapped:false, depthWrite:false })); s.scale.set(gen * 1.25, gen * 1.25 * 160 / 640, 1); return s;
}

function kur(){
  // gece ışığı: ay ışığı + mangal ateşleri
  scene.add(new THREE.HemisphereLight('#6d86c4', '#2a1a10', 0.55));
  const K = gok();
  // gökyüzü: kubbe + yıldızlar + Ay + gezegenler
  gokyuzu(K);
  const ayIsik = new THREE.DirectionalLight('#b9cdf5', 0.5 + K.ay.isik / 100 * 0.9); ayIsik.position.copy(gokYonu(K.ay.uzanim)).setLength(40); scene.add(ayIsik);

  // zigurat katları (Ur: üç kat, ön cephede anıtsal merdiven)
  const kerpicT = doku(kerpic(), [6, 2]), kerpicMat = new THREE.MeshStandardMaterial({ map:kerpicT, roughness:.95 });
  const ust = kutu(TW, 7, TD, kerpicMat, 0, -3.5, 0); ust.material = new THREE.MeshStandardMaterial({ map:doku(kerpic(), [5, 1.5]), roughness:.95 });
  kutu(40, 6, 36, new THREE.MeshStandardMaterial({ map:doku(kerpic(512, 512, [160, 108, 68]), [8, 1.5]), roughness:.95 }), 0, -10, 1);
  kutu(64, 9, 46, new THREE.MeshStandardMaterial({ map:doku(kerpic(512, 512, [150, 100, 62]), [12, 2]), roughness:.95 }), 0, -17.5, 3);
  // teras zemini (yürünür)
  const zemin = new THREE.Mesh(new THREE.PlaneGeometry(TW, TD), new THREE.MeshStandardMaterial({ map:doku(kerpic(512, 512, [190, 140, 92]), [8, 8]), roughness:.9 }));
  zemin.rotation.x = -Math.PI / 2; zemin.position.y = 0.002; zemin.name = 'zemin'; scene.add(zemin); tiklanir.push(zemin);
  // korkuluk duvarları (ön ortada merdiven ağzı)
  const korMat = new THREE.MeshStandardMaterial({ map:doku(kerpic(512, 256, [170, 116, 74]), [10, 1]), roughness:.95 });
  kutu(TW, 1, .5, korMat, 0, .5, -TD / 2 + .25); kutu(.5, 1, TD, korMat, -TW / 2 + .25, .5, 0); kutu(.5, 1, TD, korMat, TW / 2 - .25, .5, 0);
  kutu(TW / 2 - 2, 1, .5, korMat, -(TW / 4 + 1), .5, TD / 2 - .25); kutu(TW / 2 - 2, 1, .5, korMat, TW / 4 + 1, .5, TD / 2 - .25);
  // anıtsal merdiven (teras ağzından aşağı)
  const basamak = new THREE.InstancedMesh(new THREE.BoxGeometry(4, .3, .45), new THREE.MeshStandardMaterial({ map:doku(kerpic(256, 128, [184, 132, 86])), roughness:.9 }), 73);
  const mt = new THREE.Matrix4(); for(let i = 0; i < 73; i++){ mt.makeTranslation(0, -.15 - i * .3, TD / 2 + .22 + i * .42); basamak.setMatrixAt(i, mt); } scene.add(basamak);
  for(const sx of [-1, 1]){ const k = kutu(.6, 1, 37.6, korMat, sx * 2.3, -10.4, TD / 2 + 15.3); k.rotation.x = Math.atan2(.3, .42); }
  const kama = kutu(4, 1.2, 37.6, korMat, 0, -11.8, TD / 2 + 15.3); kama.rotation.x = Math.atan2(.3, .42);

  // Nanna tapınağı (terasın arkasında): kerpiç gövde, lapis sırlı bant, ışık sızan kapı
  const tap = new THREE.Group(); tap.position.set(0, 0, -TD / 2 + 4.2); scene.add(tap);
  const tg = new THREE.Mesh(new THREE.BoxGeometry(12, 5.2, 6), new THREE.MeshStandardMaterial({ map:doku(kerpic(512, 512, [196, 146, 98]), [4, 2]), roughness:.9 })); tg.position.y = 2.6; tap.add(tg);
  const [bc, bx] = tuval(1024, 64); for(let i = 0; i < 1024; i += 32){ bx.fillStyle = i / 32 % 2 ? '#1f4fa0' : '#173c80'; bx.fillRect(i, 0, 32, 64); bx.fillStyle = '#e0b04a'; bx.beginPath(); bx.arc(i + 16, 32, 7, 0, 7); bx.fill(); }
  const bant = new THREE.Mesh(new THREE.BoxGeometry(12.1, .6, 6.1), new THREE.MeshStandardMaterial({ map:doku(bc, [3, 1]), roughness:.3, metalness:.2 })); bant.position.y = 4.7; tap.add(bant);
  for(let i = -5; i <= 5; i += 2){ const nis = new THREE.Mesh(new THREE.BoxGeometry(.5, 4.2, .2), new THREE.MeshStandardMaterial({ color:'#8a5a34', roughness:1 })); nis.position.set(i, 2.1, 3.05); tap.add(nis); } // girinti-çıkıntı cephe
  const kapi = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3), new THREE.MeshBasicMaterial({ color:'#ffcf7a' })); kapi.position.set(0, 1.5, 3.12); tap.add(kapi);
  const kapiIsik = new THREE.PointLight('#ffb35a', 12, 12, 1.6); kapiIsik.position.set(0, 1.6, 4); tap.add(kapiIsik);
  // kapının iki yanında boğa başlı sütunlar (yaldızlı)
  const yaldiz = new THREE.MeshStandardMaterial({ color:'#c9a24a', metalness:.75, roughness:.3, emissive:'#2a1a00' });
  for(const sx of [-1.6, 1.6]){ const s = new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, 3.4, 16), yaldiz); s.position.set(sx, 1.7, 3.3); tap.add(s); const b = new THREE.Mesh(new THREE.SphereGeometry(.34, 16, 12), yaldiz); b.position.set(sx, 3.55, 3.3); tap.add(b); }

  // taş levha (vahiy levhası): kil levha + çerçeve + kaide
  levT = doku(levC);
  const lev = new THREE.Group(); lev.position.set(0, 0, LEVHA_Z); scene.add(lev);
  const kaide = new THREE.Mesh(new THREE.BoxGeometry(5.4, .9, 1.2), new THREE.MeshStandardMaterial({ map:doku(kerpic(256, 128, [120, 78, 48])), roughness:.9 })); kaide.position.y = .45; lev.add(kaide);
  const cerceve = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.95, .28), new THREE.MeshStandardMaterial({ color:'#8a5a34', roughness:.8 })); cerceve.position.set(0, 2.9, -.06); lev.add(cerceve);
  levha = new THREE.Mesh(new THREE.PlaneGeometry(4.96, 3.72), new THREE.MeshBasicMaterial({ map:levT, transparent:true, toneMapped:false })); levha.position.set(0, 2.9, .09); levha.name = 'levha'; lev.add(levha); tiklanir.push(levha);
  const dug = (simge, ad, x) => { const [c, cx] = tuval(256, 256); yuvarlak(cx, 8, 8, 240, 240, 40); cx.fillStyle = '#f1eadc'; cx.fill(); cx.strokeStyle = RENK.lapis; cx.lineWidth = 10; cx.stroke(); cx.fillStyle = RENK.ink; cx.font = "900 120px 'DM Sans'"; cx.textAlign = 'center'; cx.fillText(simge, 128, 168);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.36, .36), new THREE.MeshBasicMaterial({ map:doku(c), transparent:true, toneMapped:false })); m.position.set(x, .58, .62); m.rotation.x = -.5; m.name = ad; lev.add(m); tiklanir.push(m); return m; };
  dug('◀', 'geri', -.55); dug('▶', 'ileri', .55); otoDug = dug('⏵', 'oto', 0);
  const isik = new THREE.SpotLight('#ffe7b8', 26, 12, .5, .6, 1.4); isik.position.set(0, 7, LEVHA_Z + 4); isik.target = levha; scene.add(isik);

  // mangallar
  for(const [x, z] of [[-3.6, LEVHA_Z + .6], [3.6, LEVHA_Z + .6], [-10, 9], [10, 9]]) mangal(x, z);

  // Gılgamış rafı (solda): 12 tablet
  const rafG = new THREE.Group(); rafG.position.set(RAF_X, 0, -.6); rafG.rotation.y = Math.PI / 2; scene.add(rafG);
  const tahtaMat = new THREE.MeshStandardMaterial({ color:'#5a3a1e', roughness:.8 });
  for(const y of [.55, 1.15, 1.75]){ const r = new THREE.Mesh(new THREE.BoxGeometry(3.4, .06, .45), tahtaMat); r.position.y = y; rafG.add(r); }
  for(const sx of [-1.72, 1.72]){ const d = new THREE.Mesh(new THREE.BoxGeometry(.08, 2.3, .45), tahtaMat); d.position.set(sx, 1.15, 0); rafG.add(d); }
  const ust1 = etiket('Gılgamış Destanı', '12 tablet · Ninova', 1.1); ust1.position.set(0, 2.55, 0); rafG.add(ust1);
  V.gilgamis.forEach((b, i) => {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(.4, .5, .07), [0, 0, 0, 0, 1, 0].map(k => k ? new THREE.MeshStandardMaterial({ map:doku(kilTablet('g' + b.no, 192, 240, 7)), roughness:.9 }) : new THREE.MeshStandardMaterial({ color:'#b5794a', roughness:.95 })));
    const kol = i % 4, sira = Math.floor(i / 4);
    tab.position.set(-1.2 + kol * .8, 1.75 - sira * .6 + .3, .05); tab.rotation.x = -.12; tab.name = 'raf'; tab.userData.i = i; rafG.add(tab); tiklanir.push(tab);
    const [nc, nx] = tuval(128, 64); nx.fillStyle = '#0f1b31d0'; yuvarlak(nx, 2, 2, 124, 60, 14); nx.fill(); nx.fillStyle = '#f2c870'; nx.font = "900 40px 'Barlow Condensed'"; nx.textAlign = 'center'; nx.fillText(ROMA[i], 64, 46);
    const no = new THREE.Mesh(new THREE.PlaneGeometry(.22, .11), new THREE.MeshBasicMaterial({ map:doku(nc), transparent:true, toneMapped:false })); no.position.set(0, -.2, .045); tab.add(no);
    raf.push(tab);
  });

  // sunak (sağda): en sevilen tabletler + senin adının tableti
  const sunG = new THREE.Group(); sunG.position.set(SUNAK_X, 0, -.6); sunG.rotation.y = -Math.PI / 2; scene.add(sunG);
  const sMat = new THREE.MeshStandardMaterial({ map:doku(kerpic(256, 128, [140, 92, 58])), roughness:.9 });
  const sg = new THREE.Mesh(new THREE.BoxGeometry(3.6, .95, 1.2), sMat); sg.position.y = .475; sunG.add(sg);
  const ust2 = etiket('Tablet Sunağı', 'dokun: taş levhada oku', 1.1); ust2.position.set(0, 2.1, 0); sunG.add(ust2);
  const SECME = ['enmerkar-aratta', 'inanna-inis', 'tufan-sumer', 'enheduanna-ninmesara', 'ninkasi', 'ur-nammu', 'ea-nasir', 'enuma-elis', 'atasozleri', 'kusim'];
  SECME.map(id => V.tabletler.findIndex(t => t.id === id)).filter(i => i >= 0).forEach((ti, k) => {
    const t = V.tabletler[ti], tab = new THREE.Mesh(new THREE.BoxGeometry(.34, .44, .06), [0, 0, 0, 0, 1, 0].map(j => j ? new THREE.MeshStandardMaterial({ map:doku(kilTablet(t.id, 192, 240, 7)), roughness:.9 }) : new THREE.MeshStandardMaterial({ color:'#b5794a', roughness:.95 })));
    tab.position.set(-1.45 + (k % 5) * .72, 1.17, (k < 5 ? -.25 : .25)); tab.rotation.x = -.35; tab.name = 'sunak'; tab.userData.i = ti; sunG.add(tab); tiklanir.push(tab);
    const e = etiket(t.baslik.split(':')[0], `${(KIND[t.tur] || ['', ''])[1]} ${t.tur} · ${yilYaz(t.yil)}`, .5); e.position.set(0, .36, .04); e.visible = false; tab.add(e); tab.userData.et = e; sunak.push(tab);
  });
  sunakAd = new THREE.Mesh(new THREE.PlaneGeometry(.9, .6), new THREE.MeshBasicMaterial({ transparent:true, toneMapped:false })); sunakAd.position.set(0, 1.42, -.62); sunG.add(sunakAd); adTabletiCiz();

  // korkuluk panoları: gök, efsaneler, kronoloji
  const pano = (x, z, ry, cizer) => { const [c, cx] = tuval(1024, 1024), t = doku(c); const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map:t, toneMapped:false })); m.position.set(x, 1.95, z); m.rotation.y = ry; scene.add(m);
    const ayak = new THREE.Mesh(new THREE.BoxGeometry(.12, 1.2, .12), tahtaMat); ayak.position.set(x, .6, z); scene.add(ayak); return { c, cx, t, cizer }; };
  const P1 = pano(-TW / 2 + 1.2, 6.5, Math.PI / 2.6, gokPanosu), P2 = pano(TW / 2 - 1.2, 6.5, -Math.PI / 2.6, efsanePanosu), P3 = pano(-TW / 2 + 1.2, -7.5, Math.PI / 3.4, null);
  let kb = 0; const panolar = () => { P1.cizer(P1.c, P1.cx); P1.t.needsUpdate = true; P2.cizer(P2.c, P2.cx); P2.t.needsUpdate = true; kronoPanosu(P3.c, P3.cx, kb); P3.t.needsUpdate = true; kb++; efI++; };
  panolar(); setInterval(panolar, 14000);
  // giriş levhası (merdiven ağzında)
  const [mc, mx] = tuval(1024, 256); yuvarlak(mx, 6, 6, 1012, 244, 30); mx.fillStyle = '#0f1b31'; mx.fill(); mx.strokeStyle = RENK.gold; mx.lineWidth = 6; mx.stroke();
  mx.fillStyle = '#f2c870'; mx.font = "900 64px 'DM Sans'"; mx.textAlign = 'center'; mx.fillText('Sümer Ziguratı · Ur', 512, 110); mx.fillStyle = '#d3def3'; mx.font = "700 44px 'DM Sans'"; mx.fillText('Bir Mr. Anduv! yapımıdır.', 512, 190);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(2.4, .6), new THREE.MeshBasicMaterial({ map:doku(mc), toneMapped:false })); gl.position.set(0, 1.5, TD / 2 - .55); gl.rotation.y = Math.PI; scene.add(gl);

  ova();
  tozlar();
}
let otoDug;

function mangal(x, z){
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const tunc = new THREE.MeshStandardMaterial({ color:'#7a4a22', metalness:.6, roughness:.45 });
  const ayak = new THREE.Mesh(new THREE.CylinderGeometry(.08, .16, .9, 10), tunc); ayak.position.y = .45; g.add(ayak);
  const kase = new THREE.Mesh(new THREE.CylinderGeometry(.42, .22, .28, 18, 1, true), tunc); kase.position.y = 1.02; g.add(kase);
  const [fc, fx] = tuval(64, 128); const fg = fx.createRadialGradient(32, 96, 2, 32, 80, 60); fg.addColorStop(0, 'rgba(255,240,180,1)'); fg.addColorStop(.35, 'rgba(255,150,40,.9)'); fg.addColorStop(1, 'rgba(255,60,0,0)'); fx.fillStyle = fg; fx.fillRect(0, 0, 64, 128);
  const alev = new THREE.Sprite(new THREE.SpriteMaterial({ map:doku(fc), blending:THREE.AdditiveBlending, depthWrite:false, toneMapped:false })); alev.scale.set(.6, 1.1, 1); alev.position.y = 1.5; g.add(alev);
  const isik = new THREE.PointLight('#ff9a3c', 7, 9, 1.8); isik.position.y = 1.6; g.add(isik);
  atesler.push({ alev, isik, f:Math.random() * 10 });
}

// ── gökyüzü ──
// Temsilî gök: akşam göğündeki cisimler batı (−z) tarafında Güneş'ten uzaklıklarına göre yükselir; şafak göğündekiler doğuda (+z) gösterilir.
let ON_YUZ = 1; // Ay'ın bulunduğu taraf (akşam/şafak) karşımızda dursun
function gokYonu(uzanim, kaydir = 0){
  const ak = (uzanim >= 0) === (ON_YUZ > 0), e = Math.abs(uzanim);
  const alt = Math.min(62, 6 + e * .55) * RAD, az = ((ak ? 1 : -1) * Math.min(80, e * .45) + kaydir) * RAD;
  const v = new THREE.Vector3(Math.sin(az) * Math.cos(alt), Math.sin(alt), -Math.cos(az) * Math.cos(alt));
  if(!ak) v.z *= -1; // şafak: doğu tarafı
  return v.multiplyScalar(800);
}
function ayDokusu(f){
  const [c, x] = tuval(256, 256), r = 110, k = Math.cos(2 * Math.PI * f), rx = Math.abs(k) * r, wax = f < .5;
  x.translate(128, 128);
  const gl = x.createRadialGradient(0, 0, r * .9, 0, 0, r * 1.15); gl.addColorStop(0, 'rgba(255,240,200,.35)'); gl.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = gl; x.beginPath(); x.arc(0, 0, r * 1.15, 0, 7); x.fill();
  x.fillStyle = '#1b2440'; x.beginPath(); x.arc(0, 0, r, 0, 7); x.fill();
  const g = x.createRadialGradient(-30, -30, 10, 0, 0, r); g.addColorStop(0, '#fff8de'); g.addColorStop(1, '#e8cf86'); x.fillStyle = g;
  x.beginPath(); x.moveTo(0, -r); x.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, !wax); x.ellipse(0, 0, rx, r, 0, Math.PI / 2, -Math.PI / 2, wax ? (k > 0) : (k <= 0)); x.fill();
  return c;
}
function gokyuzu(K){
  const [sc, sx] = tuval(16, 512); const sg = sx.createLinearGradient(0, 0, 0, 512); sg.addColorStop(0, '#02040c'); sg.addColorStop(.45, '#071230'); sg.addColorStop(.5, '#1a2a52'); sg.addColorStop(.53, '#2a2a3a'); sg.addColorStop(1, '#0a0806'); sx.fillStyle = sg; sx.fillRect(0, 0, 16, 512);
  const kubbe = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 24), new THREE.MeshBasicMaterial({ map:doku(sc), side:THREE.BackSide, fog:false, depthWrite:false })); scene.add(kubbe);
  const n = 3200, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for(let i = 0; i < n; i++){ const u = Math.random(), v = Math.random() * .98 + .02, th = u * Math.PI * 2, ph = Math.acos(v); // üst yarıküre
    pos.set([Math.sin(ph) * Math.cos(th) * 900, Math.cos(ph) * 900, Math.sin(ph) * Math.sin(th) * 900], i * 3); const b = .6 + Math.random() * .4, s = Math.random(); col.set(s < .1 ? [b, b * .85, b * .7] : s < .2 ? [b * .8, b * .9, b] : [b, b, b], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const [pc, px] = tuval(32, 32); const pg = px.createRadialGradient(16, 16, 0, 16, 16, 16); pg.addColorStop(0, 'rgba(255,255,255,1)'); pg.addColorStop(.3, 'rgba(255,255,255,.6)'); pg.addColorStop(1, 'rgba(255,255,255,0)'); px.fillStyle = pg; px.fillRect(0, 0, 32, 32);
  const yildiz = new THREE.Points(geo, new THREE.PointsMaterial({ map:doku(pc), vertexColors:true, size:5.5, sizeAttenuation:true, transparent:true, depthWrite:false, fog:false })); scene.add(yildiz);
  // Ay
  ON_YUZ = K.ay.uzanim >= 0 ? 1 : -1;
  const ay = new THREE.Sprite(new THREE.SpriteMaterial({ map:doku(ayDokusu(K.ay.f)), fog:false, depthWrite:false, toneMapped:false })); ay.position.copy(gokYonu(K.ay.uzanim)); ay.scale.set(130, 130, 1); scene.add(ay);
  const ae = etiket(`Nanna · ${K.ay.ad}`, `Ay tanrısı · %${K.ay.isik} aydınlık`, 190); ae.material.fog = false; ae.position.copy(ay.position).add(new THREE.Vector3(0, -110, 0)); scene.add(ae);
  // gezegenler
  const P = V.gok.gezegenler, RENKG = { venus:'#fff6d0', jupiter:'#fff0dc', mars:'#ff9a6a', saturn:'#f2deb0', mercury:'#e6e0d6' };
  for(const p of Object.keys(K.gez)){
    const q = K.gez[p]; if(q.gor === 'kayip') continue;
    const [gc, gx] = tuval(64, 64); const gg = gx.createRadialGradient(32, 32, 0, 32, 32, 32); gg.addColorStop(0, '#fff'); gg.addColorStop(.25, RENKG[p]); gg.addColorStop(1, 'rgba(255,255,255,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 64, 64);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map:doku(gc), fog:false, depthWrite:false, toneMapped:false, blending:THREE.AdditiveBlending })); s.position.copy(gokYonu(q.el, { venus:0, jupiter:18, mars:-18, saturn:34, mercury:-34 }[p])); const boy = p === 'venus' ? 44 : p === 'jupiter' ? 36 : 26; s.scale.set(boy, boy, 1); scene.add(s);
    const e = etiket(`${P[p].ad} · ${P[p].bab.split(' (')[0]}`, `${P[p].tanri.split(' (')[0]} · ${q.gor === 'aksam' ? 'akşam yıldızı' : 'şafak yıldızı'}`, 150); e.material.fog = false; e.position.copy(s.position).add(new THREE.Vector3(0, -48, 0)); scene.add(e);
  }
}

// ── ova: Fırat, kamış evler, hurmalar ──
function ova(){
  const kumT = doku(kum(), [60, 60]);
  const z = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshStandardMaterial({ map:kumT, roughness:1, color:'#8a7a66' })); z.rotation.x = -Math.PI / 2; z.position.y = ZEMIN; scene.add(z);
  const nehir = new THREE.Mesh(new THREE.PlaneGeometry(26, 1400), new THREE.MeshStandardMaterial({ color:'#1a2c4a', roughness:.15, metalness:.6, emissive:'#0a1428' })); nehir.rotation.x = -Math.PI / 2; nehir.rotation.z = .25; nehir.position.set(-150, ZEMIN + .05, 0); scene.add(nehir);
  const r = tohum('ur');
  const evMat = new THREE.MeshStandardMaterial({ color:'#c9a273', roughness:1, emissive:'#1a1006' }), ev = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), evMat, 340);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  let k = 0; while(k < 340){ const a = r() * Math.PI * 2, d = 55 + r() * 230, x = Math.cos(a) * d, zz = Math.sin(a) * d; if(Math.abs(x + 150 - zz * .25) < 30 || (Math.abs(x) < 6 && zz > 20)) continue;
    const w = 4 + r() * 6, h = 2.5 + r() * 3; p.set(x, ZEMIN + h / 2, zz); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 3); s.set(w, h, w * (.6 + r() * .6)); m.compose(p, q, s); ev.setMatrixAt(k++, m); }
  scene.add(ev);
  const govde = new THREE.InstancedMesh(new THREE.CylinderGeometry(.18, .28, 1, 6), new THREE.MeshStandardMaterial({ color:'#5a4228', roughness:1 }), 160);
  const yaprak = new THREE.InstancedMesh(new THREE.ConeGeometry(2.6, 1.6, 7), new THREE.MeshStandardMaterial({ color:'#2e4a2a', roughness:1 }), 160);
  for(let i = 0; i < 160; i++){ const t = r(), zz = (r() - .5) * 600, x = -150 + zz * .25 + (r() < .5 ? -1 : 1) * (18 + r() * 28), h = 7 + r() * 5;
    p.set(x, ZEMIN + h / 2, zz); q.identity(); s.set(1, h, 1); m.compose(p, q, s); govde.setMatrixAt(i, m);
    p.set(x, ZEMIN + h + .3, zz); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), t * 6); s.set(1, 1, 1); m.compose(p, q, s); yaprak.setMatrixAt(i, m); }
  scene.add(govde, yaprak);
  // uzakta ateş ışıkları (evlerden sızan)
  const n = 120, pos = new Float32Array(n * 3); for(let i = 0; i < n; i++){ const a = r() * Math.PI * 2, d = 60 + r() * 220; pos.set([Math.cos(a) * d, ZEMIN + 2, Math.sin(a) * d], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ map:noktaDoku(), color:'#ffb060', size:2.2, transparent:true, opacity:.9, depthWrite:false })));
}
function noktaDoku(){ if(noktaDoku.d) return noktaDoku.d; const [c, x] = tuval(32, 32); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return noktaDoku.d = doku(c); }
function tozlar(){
  const n = 300, pos = new Float32Array(n * 3); for(let i = 0; i < n; i++) pos.set([(Math.random() - .5) * TW, Math.random() * 6, (Math.random() - .5) * TD], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  tozP = new THREE.Points(g, new THREE.PointsMaterial({ map:noktaDoku(), color:'#ffd9a0', size:.05, transparent:true, opacity:.55, depthWrite:false, blending:THREE.AdditiveBlending })); scene.add(tozP);
}
function adTabletiCiz(){
  if(!sunakAd) return;
  const [c, x] = tuval(512, 340); const g = x.createRadialGradient(170, 90, 10, 256, 170, 400); g.addColorStop(0, '#ecc08a'); g.addColorStop(.6, '#c98c52'); g.addColorStop(1, '#a8693a');
  yuvarlak(x, 6, 6, 500, 328, 40); x.fillStyle = g; x.fill();
  const a = adim ? cuneAd(adim) : null;
  x.fillStyle = '#6b3d1c'; x.font = "900 26px 'DM Sans'"; x.textAlign = 'center'; x.fillText(a ? '✍️ SENİN TABLETİN' : '✍️ ADIN BURAYA KAZINIR', 256, 50);
  x.fillStyle = '#3b2410'; x.font = `${a && [...a.g].length > 5 ? 64 : 90}px ${CUN}`; x.shadowColor = '#ffe39a'; x.shadowBlur = 18; x.fillText(a ? a.g : '𒀭𒂍', 256, 180); x.shadowBlur = 0;
  x.fillStyle = '#6b3d1c'; x.font = "800 26px 'DM Sans'"; x.fillText(a ? a.h : 'giriş ekranında adını yaz', 256, 240);
  x.fillStyle = '#2a1608'; x.font = "900 44px 'DM Sans'"; x.fillText(a ? adim : '', 256, 300);
  sunakAd.material.map = doku(c); sunakAd.material.needsUpdate = true;
}
function vurgu(){
  raf.forEach((t, i) => { const on = durum.kaynak === 'g' && durum.i === i; t.scale.setScalar(on ? 1.18 : 1); t.material.forEach(m => m.emissive && m.emissive.set(on ? '#3a2400' : '#000')); });
  sunak.forEach(t => { const on = durum.kaynak === 't' && durum.i === t.userData.i; t.scale.setScalar(on ? 1.18 : 1); t.userData.et.visible = on; t.material.forEach(m => m.emissive && m.emissive.set(on ? '#3a2400' : '#000')); });
}

// ── gece sesleri (WebAudio ile üretilir; dosya yok): rüzgâr, cırcır böcekleri, ateş çıtırtısı + satır çınlaması ──
let ses = null, sesAcik = false;
function sesKur(){
  if(ses) return ses;
  const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
  ses = new AC(); const ana = ses.createGain(); ana.gain.value = 0; ana.connect(ses.destination); ses.ana = ana;
  const L = ses.sampleRate * 4, b = ses.createBuffer(1, L, ses.sampleRate), d = b.getChannelData(0); let son = 0; for(let i = 0; i < L; i++){ son = (son + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = son * 3.2; }
  const ruz = ses.createBufferSource(); ruz.buffer = b; ruz.loop = true; const lp = ses.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; const rg = ses.createGain(); rg.gain.value = .5;
  ruz.connect(lp).connect(rg).connect(ana); ruz.start();
  const lfo = ses.createOscillator(), lg = ses.createGain(); lfo.frequency.value = .07; lg.gain.value = 180; lfo.connect(lg).connect(lp.frequency); lfo.start();
  const cir = () => { if(!sesAcik) return setTimeout(cir, 1500); const t = ses.currentTime; for(let k = 0; k < 3 + Math.random() * 4; k++){ const o = ses.createOscillator(), g = ses.createGain(); o.frequency.value = 4200 + Math.random() * 500; g.gain.setValueAtTime(0, t + k * .07); g.gain.linearRampToValueAtTime(.025, t + k * .07 + .01); g.gain.linearRampToValueAtTime(0, t + k * .07 + .04); o.connect(g).connect(ana); o.start(t + k * .07); o.stop(t + k * .07 + .05); } setTimeout(cir, 600 + Math.random() * 2600); };
  const cit = () => { if(!sesAcik) return setTimeout(cit, 1500); const t = ses.currentTime, nb = ses.createBuffer(1, ses.sampleRate * .03, ses.sampleRate), nd = nb.getChannelData(0); for(let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd.length, 4);
    const s = ses.createBufferSource(), g = ses.createGain(); s.buffer = nb; g.gain.value = .05 + Math.random() * .05; s.connect(g).connect(ana); s.start(t); setTimeout(cit, 120 + Math.random() * 900); };
  cir(); cit(); return ses;
}
function sesAyarla(v){ const s = sesKur(); if(!s) return; sesAcik = v; s.resume(); s.ana.gain.setTargetAtTime(v ? .55 : 0, s.currentTime, .4); $('#ses').textContent = v ? '🔊' : '🔇'; }
function cinla(guc){ if(!ses || !sesAcik) return; const t = ses.currentTime; for(const [f, a] of [[523, .05], [784, .03], [1046, .02]]){ const o = ses.createOscillator(), g = ses.createGain(); o.type = 'sine'; o.frequency.value = f * (guc > .8 ? .5 : 1); g.gain.setValueAtTime(a * guc, t); g.gain.exponentialRampToValueAtTime(.0001, t + 2.2); o.connect(g).connect(ses.ana); o.start(t); o.stop(t + 2.3); } }

// ── seçim: fare / dokunma / VR kumandası ──
const ray = new THREE.Raycaster(), fare = new THREE.Vector2();
function etkile(nesne, nokta, kaynak){
  if(ses && sesAcik) ses.resume();
  if(Y.etkile(nesne, nokta)) return;
  if(!nesne){ if(kaynak === 'vr') git(1); return; }
  if(nesne.name === 'raf'){ Y.ipucu('raf'); return ac('g', nesne.userData.i); }
  if(nesne.name === 'sunak'){ Y.ipucu('sunak'); return ac('t', nesne.userData.i); }
  if(nesne.name === 'ileri' || nesne.name === 'levha') return git(1);
  if(nesne.name === 'geri') return git(-1);
  if(nesne.name === 'oto') return otoAyarla(!durum.oto);
  if(nesne.name === 'zemin' && (kaynak === 'vr' || kaynak === 'cift')) yuru(nokta);
}
function yuru(n){
  const x = THREE.MathUtils.clamp(n.x, -TW / 2 + .8, TW / 2 - .8), z = THREE.MathUtils.clamp(n.z, LEVHA_Z + 1.2, TD / 2 - .8);
  const kafa = new THREE.Vector3(); camera.getWorldPosition(kafa); rig.position.x += x - kafa.x; rig.position.z += z - kafa.z;
}
function otoAyarla(v){ if(v) Y.ipucu('oto'); durum.oto = v; durum.sonraki = performance.now() + sure(); $('#oto').classList.toggle('on', v); $('#oto').textContent = v ? '⏸ Oto' : '⏵ Oto'; }

let suruk = null, yaw = 0, pitch = 0.08; const eul = new THREE.Euler(0, 0, 0, 'YXZ');
const el = renderer.domElement;
el.addEventListener('pointerdown', (e) => { suruk = { x:e.clientX, y:e.clientY, t:performance.now(), m:0 }; el.setPointerCapture(e.pointerId); });
el.addEventListener('pointermove', (e) => { if(!suruk || renderer.xr.isPresenting) return; const dx = e.clientX - suruk.x, dy = e.clientY - suruk.y; suruk.m += Math.abs(dx) + Math.abs(dy); suruk.x = e.clientX; suruk.y = e.clientY;
  yaw += dx * 0.004; pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -1.2, 1.45); });
el.addEventListener('pointerup', (e) => { if(suruk && suruk.m < 8 && performance.now() - suruk.t < 400) secFare(e, 'tik'); suruk = null; });
el.addEventListener('dblclick', (e) => secFare(e, 'cift'));
let sonDokun = 0; el.addEventListener('touchend', (e) => { const t = performance.now(); if(t - sonDokun < 320 && e.changedTouches[0]) secFare(e.changedTouches[0], 'cift'); sonDokun = t; });
el.addEventListener('wheel', (e) => { camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.02, 30, 85); camera.updateProjectionMatrix(); }, { passive:true });
function secFare(e, tur){
  fare.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(fare, camera);
  const h = ray.intersectObjects(tiklanir, false)[0];
  if(tur === 'cift'){ if(h && h.object.name === 'zemin') yuru(h.point); return; }
  if(h) etkile(h.object, h.point, 'tik');
}
addEventListener('keydown', (e) => { if(e.target && e.target.tagName === 'INPUT') return;
  if(e.key === 'ArrowRight' || e.key === ' '){ e.preventDefault(); git(1); } if(e.key === 'ArrowLeft') git(-1);
  const hiz = 0.3, ileri = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)), sag = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)), k = e.key.toLowerCase(), b = rig.position.clone();
  if(k === 'w') yuru(b.addScaledVector(ileri, hiz)); if(k === 's') yuru(b.addScaledVector(ileri, -hiz)); if(k === 'a') yuru(b.addScaledVector(sag, -hiz)); if(k === 'd') yuru(b.addScaledVector(sag, hiz)); });

// VR kumandaları: ışın, tetik, kavrama, çubukla dönüş
const kumandalar = [], modelF = new XRControllerModelFactory(), tmp = new THREE.Matrix4();
const isinGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
for(let i = 0; i < 2; i++){
  const k = renderer.xr.getController(i);
  const isin = new THREE.Line(isinGeo, new THREE.LineBasicMaterial({ color:'#f2c870', transparent:true, opacity:.8 })); isin.scale.z = 8; k.add(isin);
  k.addEventListener('select', () => { const h = kumandaIsin(k); etkile(h && h.object, h && h.point, 'vr'); });
  k.addEventListener('squeeze', () => git(-1));
  rig.add(k); kumandalar.push({ k, isin });
  const tut = renderer.xr.getControllerGrip(i); tut.add(modelF.createControllerModel(tut)); rig.add(tut);
}
function kumandaIsin(k){ tmp.identity().extractRotation(k.matrixWorld); ray.ray.origin.setFromMatrixPosition(k.matrixWorld); ray.ray.direction.set(0, 0, -1).applyMatrix4(tmp); return ray.intersectObjects(tiklanir, false)[0]; }
let donusKilit = false;
function cubuk(){
  const s = renderer.xr.getSession(); if(!s) return;
  for(const src of s.inputSources){ const ax = src.gamepad && src.gamepad.axes; if(!ax || ax.length < 4) continue;
    const x = ax[2]; if(Math.abs(x) > 0.7 && !donusKilit){ donusKilit = true; const kafa = new THREE.Vector3(); camera.getWorldPosition(kafa); const a = -Math.sign(x) * Math.PI / 6;
      rig.position.sub(kafa).applyAxisAngle(new THREE.Vector3(0, 1, 0), a).add(kafa); rig.rotation.y += a; } else if(Math.abs(x) < 0.3) donusKilit = false; }
}

// ── döngü ──
const saat = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = saat.getElapsedTime(), now = performance.now();
  if(!renderer.xr.isPresenting){ eul.set(pitch, yaw, 0); camera.quaternion.setFromEuler(eul); }
  else { cubuk(); for(const { k, isin } of kumandalar){ const h = kumandaIsin(k); isin.scale.z = h ? h.distance : 8; isin.material.color.set(h && h.object.name !== 'zemin' ? '#ffffff' : '#f2c870'); } }
  for(const a of atesler){ const f = .8 + Math.sin(t * 9 + a.f) * .12 + Math.sin(t * 23 + a.f * 2) * .08; a.alev.scale.set(.6 * f, 1.1 * (.9 + f * .2), 1); a.isik.intensity = 6 + f * 2.5; }
  if(V && durum.si >= 0 && now - durum.anim < 2000) levhaCiz(now); // satırın çözülme animasyonu
  if(tozP){ tozP.rotation.y = t * 0.01; tozP.position.y = Math.sin(t * 0.2) * 0.1; }
  if(durum.oto && V && now > durum.sonraki) git(1);
  Y.dongu();
  renderer.render(scene, camera);
});
function boyut(){ camera.aspect = innerWidth / innerHeight; camera.fov = camera.aspect < 1 ? 88 : 70; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
addEventListener('resize', boyut); boyut();

// mağaza görselleri için kamera kancası (?cekim=1)
if(new URLSearchParams(location.search).has('cekim')) window.__zigurat = { bak:(y, p) => { yaw = y; pitch = p; }, git:(x, z) => { rig.position.set(x, 0, z); }, ac:(k, i) => ac(k, i), ileri:(n) => { for(let k = 0; k < n; k++) git(1); durum.anim = 0; levhaCiz(); }, fov:(f) => { camera.fov = f; camera.updateProjectionMatrix(); } };

// ── VR düğmesi ──
async function vrHazirla(){
  const b = $('#vr');
  if(!navigator.xr){ b.textContent = '🥽 VR yok'; b.title = 'Bu tarayıcı WebXR desteklemiyor. VR gözlüğün tarayıcısıyla aç.'; return; }
  let ok = false; try { ok = await navigator.xr.isSessionSupported('immersive-vr'); } catch(e){}
  if(!ok){ b.textContent = '🥽 VR yok'; b.title = 'VR gözlük bulunamadı. Gözlüğün tarayıcısında bu sayfayı aç.'; return; }
  b.disabled = false; b.textContent = renderer.xr.isPresenting ? '🚪 Çık' : '🥽 VR\'a gir';
  b.onclick = () => { const s = renderer.xr.getSession(); if(s) s.end(); else vrBaslat(); };
}

// Tek VR giriş kapısı (Nutuk Salonu düzeltmesi): düğme, giriş kartı, mağaza uygulamasının otomatik açılışı hep buradan geçer.
// 'layers' ve 'bounded-floor' istenmez: Quest tarayıcısında bazı sürümlerde ilk karede donmaya yol açabiliyor.
let vrIstek = null;
function vrBaslat(){
  if(!navigator.xr || renderer.xr.isPresenting) return Promise.resolve(false);
  if(vrIstek) return vrIstek;
  vrIstek = navigator.xr.requestSession('immersive-vr', { optionalFeatures:['local-floor', 'hand-tracking'] })
    .then(async s => {
      renderer.xr.setFoveation(1); await renderer.xr.setSession(s);
      try { if(s.updateTargetFrameRate && s.supportedFrameRates && [...s.supportedFrameRates].includes(72)) s.updateTargetFrameRate(72); } catch(e){} // Quest: kararlı 72 Hz
      camera.position.set(0, 0, 0); const b = $('#vr'); if(b) b.textContent = '🚪 Çık';
      const g = $('#giris'); if(g) g.style.display = 'none';
      sesAyarla(true);
      s.addEventListener('end', () => {
        camera.position.set(0, 1.6, 0); const b2 = $('#vr'); if(b2) b2.textContent = '🥽 VR\'a gir';
        if(PWA) kapiGoster(); // mağaza uygulamasında VR'dan çıkınca boş sayfada kalınmasın
      });
      return true;
    })
    .catch(e => { console.warn('VR açılamadı', e); if(PWA) kapiGoster(); return false; })
    .finally(() => { vrIstek = null; });
  return vrIstek;
}
const PWA = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || 'getDigitalGoodsService' in window || document.referrer.startsWith('android-app://');
// VR'a giremezsek ekranda tek, büyük bir "Ziguratın tepesine çık" düğmesi kalsın (tetik/dokunuş = kullanıcı etkileşimi)
function adKaydet(){ const i = $('#adim'); if(!i) return; adim = i.value.trim().slice(0, 16); try { localStorage.setItem('sz_ad', adim); } catch(e){} if(V) adTabletiCiz(); }
function kapiGoster(){
  const g = $('#giris'); if(!g) return;
  g.style.display = ''; const d = $('#basla');
  d.innerHTML = '🥽 Ziguratın tepesine çık'; d.disabled = false; d.onclick = () => { adKaydet(); vrBaslat(); };
}
if(navigator.xr && navigator.xr.addEventListener) navigator.xr.addEventListener('sessiongranted', () => vrBaslat());

// ── başlat ──
(async () => {
  // Mağaza uygulaması (immersive PWA): VR oturumunu hiç beklemeden, veri yüklenmeden önce iste.
  // Simgeye dokunmak kullanıcı etkileşimi sayılır; beklersek bu hak düşüp gözlük yükleme ekranında asılı kalabiliyor.
  if(PWA && navigator.xr) vrBaslat();
  try {
    await Promise.all([document.fonts.load("900 50px 'DM Sans'"), document.fonts.load("500 30px 'DM Sans'"), document.fonts.load("700 30px 'DM Sans'"), document.fonts.load("800 30px 'DM Sans'"),
      document.fonts.load("800 30px 'Barlow Condensed'"), document.fonts.load(`40px ${CUN}`, '𒀭')]).catch(() => {});
    V = await (await fetch('veri.json')).json();
    const sec = $('#sec');
    sec.innerHTML = `<optgroup label="📺 Gılgamış Destanı">${V.gilgamis.map((b, i) => `<option value="g:${i}">${ROMA[i]}. ${b.baslik}</option>`).join('')}</optgroup>`
      + `<optgroup label="📜 Tabletler (eskiden yeniye)">${V.tabletler.map((t, i) => `<option value="t:${i}">${yilYaz(t.yil)} · ${t.baslik}</option>`).join('')}</optgroup>`;
    sec.onchange = (e) => { const [k, i] = e.target.value.split(':'); ac(k, Number(i)); };
    $('#ileri').onclick = () => git(1); $('#geri').onclick = () => git(-1); $('#oto').onclick = () => otoAyarla(!durum.oto);
    $('#ses').onclick = () => sesAyarla(!sesAcik);
    const adIn = $('#adim'); adIn.value = adim;
    const onizle = () => { const a = adIn.value.trim() ? cuneAd(adIn.value.trim()) : null; $('#adOn').innerHTML = a && a.g ? `${a.g}<small>${a.h}</small>` : ''; };
    adIn.oninput = onizle; onizle();
    kur(); levhaGuncel(); vrHazirla();
    if(PWA && navigator.xr){
      // mağaza uygulaması: kart yalnızca VR'a girilemezse görünür, düğmesi doğrudan VR'a sokar
      if(renderer.xr.isPresenting) $('#giris').style.display = 'none'; else if(!vrIstek) kapiGoster();
    } else {
      $('#basla').innerHTML = 'Ziguratın tepesine çık';
      $('#basla').onclick = () => { adKaydet(); $('#giris').remove(); sesAyarla(true); setTimeout(() => $('#ipucu') && $('#ipucu').remove(), 10000); setTimeout(() => Y.basla(), 1200); };
    }
  } catch(e){
    console.error(e);
    if(PWA && navigator.xr) kapiGoster(); // veri yüklenemese de uygulama donmuş görünmesin
    else { const y = $('#yuk'); if(y) y.innerHTML = '<span class="hata">Zigurat açılamadı. Sayfayı yenile.</span>'; }
  }
})();

// çevrimdışı önbellek (PWA: gözlükte internetsiz açılır)
if('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
