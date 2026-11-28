// Kıble: konum + pusula ile Kâbe yönü. Hepsi cihazda hesaplanır; konum hiçbir yere gönderilmez.
import { declination } from "./vendor/wmm.js";

export const KABE = { lat: 21.422487, lon: 39.826206 };
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const norm = (d) => ((d % 360) + 360) % 360;

// Büyük daire başlangıç açısı: kuzeyden saat yönünde derece
export function qiblaBearing(lat, lon) {
  const f1 = rad(lat), f2 = rad(KABE.lat), dl = rad(KABE.lon - lon);
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return norm(deg(Math.atan2(y, x)));
}

export function distanceKm(lat, lon) {
  const f1 = rad(lat), f2 = rad(KABE.lat);
  const a = Math.sin((f2 - f1) / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(rad(KABE.lon - lon) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const YONLER = ["kuzey", "kuzeydoğu", "doğu", "güneydoğu", "güney", "güneybatı", "batı", "kuzeybatı"];
export const yonAdi = (b) => YONLER[Math.round(norm(b) / 45) % 8];

// ---------------------------------------------------------------------------
// Konum: Capacitor Geolocation (telefonda), yoksa tarayıcı konumu
// ---------------------------------------------------------------------------
export async function getPosition() {
  const Geo = window.Capacitor?.Plugins?.Geolocation;
  if (Geo) {
    try {
      const perm = await Geo.checkPermissions();
      if (perm.location !== "granted" && perm.coarseLocation !== "granted") {
        const r = await Geo.requestPermissions({ permissions: ["location", "coarseLocation"] });
        if (r.location !== "granted" && r.coarseLocation !== "granted") throw new Error("izin");
      }
    } catch (e) {
      if (String(e.message || e).includes("izin")) throw e;
      // web ortamında checkPermissions desteklenmeyebilir; doğrudan dene
    }
    const p = await Geo.getCurrentPosition({ enableHighAccuracy: false, timeout: 20000, maximumAge: 600000 });
    return { lat: p.coords.latitude, lon: p.coords.longitude };
  }
  if (!navigator.geolocation) throw new Error("konum yok");
  return new Promise((ok, fail) => navigator.geolocation.getCurrentPosition(
    (p) => ok({ lat: p.coords.latitude, lon: p.coords.longitude }),
    (e) => fail(new Error(e.code === 1 ? "izin" : "konum alınamadı")),
    { enableHighAccuracy: false, timeout: 20000, maximumAge: 600000 }));
}

// ---------------------------------------------------------------------------
// Pusula: iOS'ta webkitCompassHeading, Android'de deviceorientationabsolute.
// İkisi de manyetik kuzeye göre; WMM ile manyetik sapma eklenerek gerçek kuzeye çevrilir.
// ---------------------------------------------------------------------------
export async function requestCompassPermission() {
  const D = window.DeviceOrientationEvent;
  if (D && typeof D.requestPermission === "function") {
    try { return (await D.requestPermission()) === "granted"; } catch { return false; }
  }
  return true;
}

export function startCompass(onHeading) {
  let last = null;
  const screenAngle = () => (screen.orientation?.angle ?? window.orientation ?? 0) || 0;
  const push = (h) => {
    h = norm(h + screenAngle());
    // açısal yumuşatma (titremeyi azaltır)
    if (last === null) last = h;
    else { const d = ((h - last + 540) % 360) - 180; last = norm(last + d * 0.25); }
    onHeading(last);
  };
  const ios = (e) => { if (typeof e.webkitCompassHeading === "number" && !Number.isNaN(e.webkitCompassHeading)) push(e.webkitCompassHeading); };
  const abs = (e) => { if (e.absolute !== false && typeof e.alpha === "number") push(360 - e.alpha); };
  window.addEventListener("deviceorientation", ios, true);
  window.addEventListener("deviceorientationabsolute", abs, true);
  return () => {
    window.removeEventListener("deviceorientation", ios, true);
    window.removeEventListener("deviceorientationabsolute", abs, true);
  };
}

export function trueNorthOffset(lat, lon) {
  try { return declination(lat, lon, new Date()); } catch { return 0; }
}
