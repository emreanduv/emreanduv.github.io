// Namaz vakitleri, hicri tarih ve vakit bildirimleri. Hepsi cihazda; internet ve sunucu yok.
// Hesap: adhan-js, "Turkey" yöntemi (imsak 18°, yatsı 17°, Diyanet temkinleri).
import { Coordinates, CalculationMethod, PrayerTimes } from "./vendor/adhan.js";

export const VAKITLER = [
  { key: "imsak", ad: "İmsak", src: "fajr" },
  { key: "gunes", ad: "Güneş", src: "sunrise" },
  { key: "ogle", ad: "Öğle", src: "dhuhr" },
  { key: "ikindi", ad: "İkindi", src: "asr" },
  { key: "aksam", ad: "Akşam", src: "maghrib" },
  { key: "yatsi", ad: "Yatsı", src: "isha" },
];

export function times(lat, lon, day = new Date()) {
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12);
  const t = new PrayerTimes(new Coordinates(lat, lon), d, CalculationMethod.Turkey());
  const out = {};
  for (const v of VAKITLER) out[v.key] = t[v.src];
  return out;
}

export const hhmm = (d) => d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

// Sıradaki vakit (gerekirse yarının imsakı)
export function nextVakit(lat, lon, now = new Date()) {
  const today = times(lat, lon, now);
  for (const v of VAKITLER) if (today[v.key] > now) return { ...v, at: today[v.key] };
  const tom = new Date(now); tom.setDate(tom.getDate() + 1);
  return { ...VAKITLER[0], at: times(lat, lon, tom).imsak };
}

// Al Fajr tarzı büyük sayaç: SS:DD:ss
export function sayac(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export function kalan(ms) {
  const m = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(m / 60), d = m % 60;
  return h ? `${h} sa ${String(d).padStart(2, "0")} dk` : `${d} dk`;
}

// ---------------------------------------------------------------------------
// Hicri tarih (telefonun takvimi, Ümmü'l-Kurâ). Diyanet takvimiyle 1 gün fark olabilir.
// ---------------------------------------------------------------------------
const AYLAR = ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir",
  "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"];

export function hicri(date = new Date()) {
  for (const cal of ["islamic-umalqura", "islamic-civil", "islamic"]) {
    try {
      const parts = new Intl.DateTimeFormat(`en-u-ca-${cal}-nu-latn`, { day: "numeric", month: "numeric", year: "numeric" })
        .formatToParts(date);
      const get = (t) => Number(parts.find((p) => p.type === t)?.value);
      const gun = get("day"), ay = get("month"), yil = parseInt(parts.find((p) => p.type === "year")?.value, 10);
      if (gun && ay && yil) return { gun, ay, yil, ayAdi: AYLAR[ay - 1], ramazan: ay === 9 };
    } catch { /* bu takvim yok, sıradakini dene */ }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Bildirim planı: önümüzdeki günlerin vakitleri → yerel bildirim listesi
// iOS en fazla 64 bekleyen bildirime izin verir. Bütçe: namaz 36 + Saat 20 + tesbihat 6 + deneme 1 = 63.
// ---------------------------------------------------------------------------
export const ID_BASE = 1000;
export const MAX_BEKLEYEN = 36;

export function plan(lat, lon, ayar, now = new Date()) {
  const secili = VAKITLER.filter((v) => ayar.keys[v.key]);
  const out = [];
  if (!ayar.on) return out;
  const once = (ayar.once || 0) * 60000;
  for (let g = 0; g < 21 && out.length < MAX_BEKLEYEN; g++) {
    const day = new Date(now); day.setDate(day.getDate() + g);
    const t = times(lat, lon, day);
    const h = hicri(t.ogle);
    const ram = !!h?.ramazan;
    const gunluk = [];
    // Ramazan: imsaktan 45 dk önce sahur hatırlatması
    if (ram && ayar.sahur) gunluk.push({ slot: 9, at: new Date(t.imsak - 45 * 60000), title: `Sahur · imsak ${hhmm(t.imsak)}`, body: "İmsaka 45 dakika kaldı. Hayırlı sahurlar." });
    for (const v of secili) {
      // 1) vakit girince (ezan sesi burada)
      let title = `${v.ad} vakti · ${hhmm(t[v.key])}`, body = `${v.ad} vakti girdi.`;
      if (v.key === "gunes") body = "Güneş doğdu; kerahat vakti.";
      if (ram && v.key === "aksam") { title = `İftar vakti · ${hhmm(t.aksam)}`; body = "İftar vakti. Hayırlı iftarlar!"; }
      if (ram && v.key === "imsak") { title = `İmsak · ${hhmm(t.imsak)}`; body = "İmsak vakti girdi; oruç başladı."; }
      gunluk.push({ slot: VAKITLER.indexOf(v), at: t[v.key], title, body, ezan: v.key !== "gunes" });   // güneşte ezan okunmaz
      // 2) önceden hatırlatma (ör. "Öğle ezanına 15 dakika kaldı"), kısa sesle
      if (once) {
        const dk = ayar.once;
        let ot = `${v.ad} ezanına ${dk} dk · ${hhmm(t[v.key])}`, ob = `${v.ad} ezanına ${dk} dakika kaldı.`;
        if (v.key === "gunes") { ot = `Güneş doğuşuna ${dk} dk · ${hhmm(t.gunes)}`; ob = `Güneşin doğmasına ${dk} dakika kaldı; sabah namazını kılmadıysan vakit daralıyor.`; }
        if (ram && v.key === "aksam") { ot = `İftara ${dk} dk · ${hhmm(t.aksam)}`; ob = `İftara ${dk} dakika kaldı.`; }
        if (ram && v.key === "imsak") { ot = `İmsaka ${dk} dk · ${hhmm(t.imsak)}`; ob = `İmsaka ${dk} dakika kaldı; sahuru bitirme vakti yaklaşıyor.`; }
        gunluk.push({ slot: 10 + VAKITLER.indexOf(v), at: new Date(t[v.key] - once), title: ot, body: ob, ezan: false });
      }
    }
    for (const n of gunluk.sort((a, b) => a.at - b.at)) {
      if (n.at <= now) continue;
      if (out.length >= MAX_BEKLEYEN) break;
      out.push({ id: ID_BASE + g * 20 + n.slot, at: n.at, title: n.title, body: n.body, ezan: !!n.ezan });
    }
  }
  return out;
}

// Planın kaç gün ileriyi kapsadığı (ekranda "bildirimler 9 Kasım'a kadar kurulu" demek için)
export const sonGun = (list) => (list.length ? list[list.length - 1].at : null);

// ---------------------------------------------------------------------------
// Kerahat vakitleri (Diyanet: güneş doğarken ~45 dk, öğleden önce ~45 dk, akşamdan önce ~45 dk)
// ---------------------------------------------------------------------------
export const KERAHAT_DK = 45;
export function kerahatler(lat, lon, day = new Date()) {
  const t = times(lat, lon, day), dk = KERAHAT_DK * 60000;
  return [
    { ad: "Güneş doğarken", bas: t.gunes, bit: new Date(+t.gunes + dk) },
    { ad: "Güneş tepedeyken", bas: new Date(+t.ogle - dk), bit: t.ogle },
    { ad: "Güneş batarken", bas: new Date(+t.aksam - dk), bit: t.aksam },
  ];
}
export function kerahatSimdi(lat, lon, now = new Date()) {
  return kerahatler(lat, lon, now).find((k) => now >= k.bas && now < k.bit) || null;
}

// ---------------------------------------------------------------------------
// Kıble saati: güneşin tam kıble yönünde olduğu an. O an güneşe dönen Kâbe'ye dönmüş olur;
// pusula gerekmez (gölge tam arkanda kalır). NOAA güneş konumu formülleri.
// ---------------------------------------------------------------------------
const RAD = Math.PI / 180;
export function gunesKonumu(lat, lon, date) {
  const jd = date / 864e5 + 2440587.5, T = (jd - 2451545) / 36525;
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C = Math.sin(M * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * RAD) * 0.000289;
  const lam = L0 + C - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * T) * RAD);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos((125.04 - 1934.136 * T) * RAD);
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lam * RAD));
  const y = Math.tan((eps / 2) * RAD) ** 2;
  const eqt = 4 / RAD * (y * Math.sin(2 * L0 * RAD) - 2 * e * Math.sin(M * RAD) + 4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) - 0.5 * y * y * Math.sin(4 * L0 * RAD) - 1.25 * e * e * Math.sin(2 * M * RAD));
  const utcDk = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const ha = ((utcDk + eqt + 4 * lon) / 4 - 180) * RAD;
  const la = lat * RAD;
  const zen = Math.acos(Math.sin(la) * Math.sin(decl) + Math.cos(la) * Math.cos(decl) * Math.cos(ha));
  let az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(la) - Math.tan(decl) * Math.cos(la)) / RAD + 180;
  return { azimut: (az + 360) % 360, yukseklik: 90 - zen / RAD };
}
export function kibleSaati(lat, lon, kibleAci, day = new Date()) {
  const t = times(lat, lon, day);
  const fark = (d) => (((gunesKonumu(lat, lon, d).azimut - kibleAci) % 360) + 540) % 360 - 180;
  let onceki = null;
  for (let m = +t.gunes; m <= +t.aksam; m += 60000) {
    const d = new Date(m), f = fark(d);
    if (onceki && onceki.f < 0 && f >= 0 && gunesKonumu(lat, lon, d).yukseklik > 5) {
      // dakika içinde doğrusal ara değer
      const oran = -onceki.f / (f - onceki.f);
      return new Date(+onceki.d + oran * 60000);
    }
    onceki = { d, f };
  }
  return null;   // bugün güneş kıble yönüne gelmiyor (ör. kıble kuzeyde kalıyorsa)
}

// ---------------------------------------------------------------------------
// İmsakiye: bugünden itibaren N günün vakitleri
// ---------------------------------------------------------------------------
export function imsakiye(lat, lon, from = new Date(), gun = 30) {
  const out = [];
  for (let i = 0; i < gun; i++) { const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 12); out.push({ gun: d, t: times(lat, lon, d), h: hicri(d) }); }
  return out;
}

// ---------------------------------------------------------------------------
// Dinî günler. Tarihler Diyanet takviminden (kandiller: o günün akşamı başlayan gece).
// Listede olmayan sonraki yıllar telefonun hicri takviminden tahmin edilir ("tahmini").
// ---------------------------------------------------------------------------
export const DINI_GUNLER = [
  ["2026-08-24", "Mevlid Kandili"],
  ["2026-12-10", "Üç Ayların Başlangıcı ve Regaib Kandili"],
  ["2027-01-05", "Miraç Kandili"],
  ["2027-01-22", "Berat Kandili"],
  ["2027-02-08", "Ramazan Başlangıcı"],
  ["2027-03-05", "Kadir Gecesi"],
  ["2027-03-08", "Ramazan Bayramı Arifesi"],
  ["2027-03-09", "Ramazan Bayramı (3 gün)"],
  ["2027-05-15", "Kurban Bayramı Arifesi"],
  ["2027-05-16", "Kurban Bayramı (4 gün)"],
];
// tahmin için hicri ay/gün → ad (kandiller bir önceki akşam)
const TAHMINI = [[1, 1, "Hicri Yılbaşı", 0], [1, 10, "Aşure Günü", 0], [3, 12, "Mevlid Kandili", -1], [7, 1, "Üç Ayların Başlangıcı", 0],
  [7, 27, "Miraç Kandili", -1], [8, 15, "Berat Kandili", -1], [9, 1, "Ramazan Başlangıcı", 0], [9, 27, "Kadir Gecesi", -1],
  [10, 1, "Ramazan Bayramı (3 gün)", 0], [12, 10, "Kurban Bayramı (4 gün)", 0]];
const gunAnahtar = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function diniGunler(now = new Date(), adet = 8) {
  const bugun = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const liste = DINI_GUNLER.map(([s, ad]) => { const [y, m, d] = s.split("-").map(Number); return { gun: new Date(y, m - 1, d), ad, tahmini: false }; })
    .filter((x) => x.gun >= bugun);
  const son = DINI_GUNLER.length ? new Date(DINI_GUNLER[DINI_GUNLER.length - 1][0]) : bugun;
  // resmî listenin bittiği yerden itibaren ~1 yıl tahmin
  for (let i = 1; i < 400 && liste.length < adet; i++) {
    const d = new Date(Math.max(+son, +bugun) + i * 864e5); const h = hicri(d); if (!h) break;
    for (const [ay, gun, ad, kayma] of TAHMINI) if (h.ay === ay && h.gun === gun) {
      const g = new Date(d.getFullYear(), d.getMonth(), d.getDate() + kayma);
      if (g > son && !liste.some((x) => x.ad === ad && Math.abs(x.gun - g) < 20 * 864e5)) liste.push({ gun: g, ad, tahmini: true });
    }
    // Regaib: Recep'in ilk cumasına bağlanan gece (perşembe akşamı)
    if (h.ay === 7 && h.gun === 1) {
      const c = new Date(d.getFullYear(), d.getMonth(), d.getDate()); while (c.getDay() !== 5) c.setDate(c.getDate() + 1); c.setDate(c.getDate() - 1);
      if (c > son && !liste.some((x) => x.ad === "Regaib Kandili" && Math.abs(x.gun - c) < 20 * 864e5)) liste.push({ gun: c, ad: "Regaib Kandili", tahmini: true });
    }
  }
  return liste.sort((a, b) => a.gun - b.gun).slice(0, adet).map((x) => ({ ...x, kalanGun: Math.round((x.gun - bugun) / 864e5), anahtar: gunAnahtar(x.gun) }));
}
