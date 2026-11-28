// Yerel bildirimler (Capacitor LocalNotifications). Bildirimler telefonun kendisine kurulur;
// sunucu yok, uygulama kapalıyken ve internetsiz de çalar.
import { ID_BASE } from "./vakit.js";

const LN = () => window.Capacitor?.Plugins?.LocalNotifications;
const KANAL = "vakit";
const SES = "dit.wav";
// Bildirim sesleri: "dit" kısa ses · "ezan" vakit girince ezan (30 sn; Wikimedia Commons, CC0) · "sistem" telefonun sesi.
// Android'de ses kanala bağlıdır: her ses için ayrı kanal.
const IOS_SES = { dit: "dit.wav", ezan: "ezan.caf", sistem: undefined };
const KANALLAR = { dit: [KANAL, "dit.wav", "Vakit girdiğinde kısa bir ses"], ezan: ["vakit-ezan", "ezan.ogg", "Vakit girince ezan sesi"], sistem: ["vakit-sistem", undefined, "Telefonun bildirim sesi"] };
const sesBilgi = (ses) => ({ sound: android() ? KANALLAR[ses][1] : IOS_SES[ses], channelId: KANALLAR[ses][0] });

export const destekli = () => !!LN();
const android = () => window.Capacitor?.getPlatform?.() === "android";

export async function izinIste() {
  const ln = LN();
  if (!ln) return false;
  let p = await ln.checkPermissions();
  if (p.display !== "granted") p = await ln.requestPermissions();
  if (p.display !== "granted") return false;
  if (android()) {
    try {
      for (const [ses, [id, sound, description]] of Object.entries(KANALLAR))
        await ln.createChannel({ id, name: ses === "dit" ? "Namaz vakitleri" : ses === "ezan" ? "Namaz vakitleri · ezan" : "Namaz vakitleri · telefon sesi",
          description, importance: 5, ...(sound ? { sound } : {}), vibration: true, visibility: 1 });
    } catch { /* kanal zaten var */ }
  }
  return true;
}

// Android 12+: dakikası dakikasına bildirim için "alarm ve hatırlatıcı" izni
export async function tamZamanli() {
  const ln = LN();
  if (!ln || !android() || !ln.checkExactNotificationSetting) return true;
  try { return (await ln.checkExactNotificationSetting()).exact_alarm === "granted"; } catch { return true; }
}
export async function tamZamanliAyar() {
  try { await LN()?.changeExactNotificationSetting(); } catch { /* yoksay */ }
}

// Kimlik aralıkları: 1000–1999 namaz vakitleri, 2000–2999 Saat hatırlatıcıları, 3000–3999 tesbihat hatırlatması.
// Her modül yalnız kendi aralığını siler ve kurar.
async function bizimBekleyenler(base) {
  const ln = LN();
  const { notifications } = await ln.getPending();
  return notifications.filter((n) => n.id >= base && n.id < base + 1000);
}

export async function iptal(base = ID_BASE) {
  const ln = LN();
  if (!ln) return;
  const list = await bizimBekleyenler(base);
  if (list.length) await ln.cancel({ notifications: list.map((n) => ({ id: n.id })) });
}

export async function kur(list, base = ID_BASE, ses = "dit") {
  const ln = LN();
  if (!ln) return 0;
  await iptal(base);
  if (!list.length) return 0;
  await ln.schedule({
    notifications: list.map((n) => ({
      id: n.id, title: n.title, body: n.body,
      schedule: { at: n.at, allowWhileIdle: true },
      ...sesBilgi(ses === "ezan" && !n.ezan ? "dit" : (KANALLAR[ses] ? ses : "dit")),
    })),
  });
  return list.length;
}

export async function deneme(ses = "dit") {
  const ln = LN();
  if (!ln) return false;
  await ln.schedule({ notifications: [{ id: ID_BASE + 999, title: "Deneme · Yaşam Rehberi", body: "Vakit bildirimleri böyle gelecek.",
    schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true }, ...sesBilgi(KANALLAR[ses] ? ses : "dit") }] });
  return true;
}
