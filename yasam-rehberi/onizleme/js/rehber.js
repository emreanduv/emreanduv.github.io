// Rehber, Nasıl kullanılır ve Ayarlar eylemleri (test önerileri paketi; Malazgirt Akıncıları 1.6 / Champion Battle Manager 4.4 ile aynı yaklaşım):
// - bir ekran ilk kez açılınca kısa ipucu kartı ("Anladım" ya da "Rehberi kapat"); hangi ipucunun görüldüğü yalnız bu telefonda,
// - her an açılabilen "Nasıl kullanılır" ekranı: bütün ipuçları, görülmeyenler altın çerçeveli, "Rehberi baştan göster",
// - uygulama içinden puan ver (yalnız telefonda, kullanım eşiğinde en çok 2 kez), arkadaşına öner, "Bize yaz" (hazır e-posta), "Verilerimi sil".
// Hiçbir veri toplanmaz: puan ve paylaşım telefonun/mağazanın kendi ekranlarıyla yapılır. Bir Mr. Anduv! yapımıdır.
import { KURAN } from "./ozellik.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const platform = () => { try { const p = window.Capacitor?.getPlatform?.(); if (p && p !== "web") return p; } catch { /* */ } return "web"; };
export const mobil = () => ["ios", "android"].includes(platform());
export const MAGAZA = () => platform() === "ios" ? "https://apps.apple.com/app/id6826874224" : "https://play.google.com/store/apps/details?id=com.anduv.yasamrehberi";

const IPUCU = {
  bugun: ["Bugün", "Sıradaki vakit ve geri sayım en üstte; “Konumumu kullan” ile vakitler bulunduğun yere göre telefonda hesaplanır. Altında kıble, son zikrin ve vakit bildirimleri. Sağ üstteki dişli Ayarlar'ı açar."],
  sor: ["Sor", "Bir soru ya da kelime yaz: ilgili ayetler üç mealde yan yana gelir; kaynak ve sürüm her ayetin altında yazar."],
  sureler: ["Sureler", "114 sure sırayla. Bir sureye dokun, ayetleri meallerle açılsın; ayeti kaydedip paylaşabilirsin. Üstteki Hatim takibi kartında okuduğun cüzleri işaretle, kaldığın yerden devam et."],
  tesbih: ["Tesbih", "Ekrana dokundukça sayar; hedef dolunca sıradaki zikre geçer. Esmâ, serbest zikir ve tesbih atölyesi de burada. Sayın yalnız bu telefonda kalır."],
  saat: ["Saat", "Kadranlar, kadran atölyesi, hatırlatıcılar, zamanlayıcı ve kronometre. Vakit ve konum uygulamadan gelir; hatırlatıcılar telefonun kendi bildirimiyle çalışır."],
  sofra: ["Sofra", "Kalori, su, adım, kilo ve sağlık takibi. Serbest Mod'da hemen başla; Program Modu'nda boyuna, kilona ve hedefine göre kişisel hedef ve diyet listesi. Kayıtlar yalnız bu telefonda ve kendi iCloud'unda."],
  carsi: ["Çarşı", "Reyon reyon markalar ve kaynaklı künyeleri. Barkodu kamerayla okut ya da yaz, markayı listene ekle."],
  miras: ["Miras", "Adım adım ailedekileri gir: feraiz (Hanefî) ve Türk Medeni Kanunu'na göre paylar kesirle ve TL olarak, dayanaklarıyla çıkar."],
  ayarlar: ["Ayarlar", "Nasıl kullanılır, puan verme, arkadaşına önerme, bize yazma ve Verilerimi sil burada."],
};
const SIRA = () => ["bugun", ...(KURAN ? ["sor", "sureler"] : []), "tesbih", "saat", "sofra", "carsi", "miras", "ayarlar"];
const ANAHTAR = "yr.rehber", PUAN = "yr.puan", GUN = "yr.gunler";
const PUAN_ANI = [3, 10];   // farklı kullanım günü eşikleri

let st = null, D = { gor: {}, kapali: false }, P = { n: 0, tamam: false, son: 0 }, gunler = [];
let kartEl = null;

export async function rehberHazirla(store, eskiMi) {
  st = store;
  const d = await store.get(ANAHTAR, null);
  if (d && typeof d === "object") D = { gor: {}, kapali: false, ...d };
  else if (eskiMi) { D.gor.bugun = 1; await store.set(ANAHTAR, D); }   // eski kullanıcıya temel ipucu yeniden gösterilmez
  P = { ...P, ...(await store.get(PUAN, {})) };
  gunler = await store.get(GUN, []);
  const bugun = new Date().toISOString().slice(0, 10);
  if (!gunler.includes(bugun)) { gunler = [...gunler, bugun].slice(-30); await store.set(GUN, gunler); }
}
const kaydet = () => st?.set(ANAHTAR, D);

// ekran açılınca (route sonunda) çağrılır
export function ekranAcildi(ekran) {
  if (kartEl && kartEl.dataset.ekran !== ekran) { kartEl.remove(); kartEl = null; }
  const x = IPUCU[ekran];
  if (!x || D.kapali || D.gor[ekran] || kartEl) return;
  kartEl = document.createElement("div"); kartEl.className = "rh-kart"; kartEl.dataset.ekran = ekran; kartEl.setAttribute("role", "status");
  kartEl.innerHTML = `<div class="rh-h">İpucu · Yaşam Rehberi</div><div class="rh-b"><b>${esc(x[0])}</b><p>${esc(x[1])}</p>
    <div class="rh-d"><button class="btn-go" data-act="rh-tamam">Anladım</button><button class="btn-light" data-act="rh-kapat">Rehberi kapat</button></div></div>`;
  document.body.appendChild(kartEl);
}
export function ipucuTamam(kapat) {
  const k = kartEl?.dataset.ekran;
  if (k) D.gor[k] = 1;
  if (kapat) D.kapali = true;
  kaydet(); kartEl?.remove(); kartEl = null;
}
export function bastan() { D = { gor: {}, kapali: false }; kaydet(); kartEl?.remove(); kartEl = null; }

// Nasıl kullanılır ekranı
export function rehberView(topbar, MAKER) {
  const liste = SIRA().map((k) => `<div class="rh-sat${D.gor[k] ? "" : " yeni"}"><b>${esc(IPUCU[k][0])}</b><p>${esc(IPUCU[k][1])}</p></div>`).join("");
  return `${topbar("Geri")}
  <section class="band"><div class="eyebrow">Rehber</div><h1>Nasıl kullanılır</h1><div class="sub">Altın çerçeveliler henüz görmediğin ipuçları</div></section>
  <main class="content">
    <section class="panel"><div class="panel-h">Yaşam Rehberi</div><div class="panel-b" style="font-size:14px;line-height:1.55">
      ${KURAN ? "Kur'an'da arama ve meal karşılaştırma, " : ""}Namaz vakitleri, kıble, tesbih, saat, çarşı ve miras hesabı tek uygulamada. Hepsi telefonda çalışır; internet ve üyelik gerekmez, hiçbir veri toplanmaz.<br>
      <b>Başlamak için:</b> Bugün ekranında “Konumumu kullan”a dokun; vakitler, geri sayım ve kıble bulunduğun yere göre hesaplanır. Alttaki menüden öbür bölümlere geç.</div></section>
    <section class="panel"><div class="panel-h">Bütün ipuçları</div><div class="panel-b rh-liste">${liste}</div></section>
    <div class="rh-dugmeler"><button class="btn-go" data-act="rh-bastan">↺ Rehberi baştan göster</button><button class="btn-light" data-act="rh-oner">Arkadaşına öner</button><button class="btn-light" data-act="rh-yaz">Bize yaz</button></div>
    <div class="made">${esc(MAKER)}</div>
  </main>`;
}

// Ayarlar'daki ortak bölümler
export function ayarPanelleri(silOnay) {
  const row = (act, ic, title, hint, cls = "") => `<button class="row mn-row rh-row ${cls}" data-act="${act}"><span class="mn-l"><span class="mn-ic">${ic}</span><span><b>${esc(title)}</b><br><span class="mn-hint">${esc(hint)}</span></span></span><span class="meta">›</span></button>`;
  return `
    <section class="panel"><div class="panel-h">Rehber</div><div class="rows">
      <a class="row mn-row" href="#/rehber"><span class="mn-l"><span class="mn-ic">?</span><span><b>Nasıl kullanılır</b><br><span class="mn-hint">Bütün ipuçları, görmediklerin vurgulu</span></span></span><span class="meta">›</span></a>
      ${row("rh-bastan", "↺", "Rehberi baştan göster", "İpucu kartları ekranları ilk açışındaki gibi yeniden çıkar")}</div></section>
    <section class="panel"><div class="panel-h">Paylaş ve puanla</div><div class="rows">
      ${mobil() ? row("rh-puan", "★", "Puan ver", "Mağazanın kendi puan ekranı açılır") : ""}
      ${row("rh-oner", "↗", "Arkadaşına öner", "Telefonun paylaşım menüsüyle")}</div></section>
    <section class="panel"><div class="panel-h">Görüş ve öneri</div><div class="rows">
      ${row("rh-yaz", "✉", "Bize yaz", "emreanduvart@gmail.com · sürüm ve cihaz bilgisi hazır gelir")}</div></section>
    <section class="panel"><div class="panel-h">Verilerin</div><div class="rows">
      ${row("rh-sil", "×", silOnay ? "Emin misin? Bir daha dokun, silinsin" : "Verilerimi sil", "Konum, ayarlar, kayıtlı ayetler, tesbih ve saat verisi, Sofra kayıtları, çarşı listesi, miras girdileri, bildirimler ve rehber bu telefondan silinir. Bizde senin hakkında hiçbir kayıt yok.", "rh-sil" + (silOnay ? " onay" : ""))}</div>
      <div class="panel-b" style="font-size:13px;border-top:1px solid var(--panel-rule)">Uygulama hiçbir kişisel veri toplamaz. <a href="https://emreanduv.github.io/yasam-rehberi/gizlilik.html">Gizlilik politikası</a></div></section>`;
}

// puan: yalnız telefonda; 3. ve 10. farklı kullanım gününde Bugün ekranında; en çok iki kez sorulur
export function puanSorulsunMu() {
  if (!mobil() || P.tamam || P.n >= 2) return false;
  const esik = PUAN_ANI.filter((e) => gunler.length >= e).pop();
  return !!esik && P.son < esik;
}
export function puanKarti() {
  if (kartEl || document.querySelector(".rh-puan")) return;   // açık ipucu kartının üstüne binmesin; bir sonraki Bugün açılışında sorulur
  const esik = PUAN_ANI.filter((e) => gunler.length >= e).pop();
  P.son = esik; P.n++; st?.set(PUAN, P);
  kartEl?.remove(); kartEl = null;
  const el = document.createElement("div"); el.className = "rh-kart rh-puan"; el.setAttribute("role", "status");
  el.innerHTML = `<div class="rh-h">${esik}. gün · teşekkürler</div><div class="rh-b"><b>Yaşam Rehberi işine yarıyor mu?</b><p>Bir puan, başkalarının da bulmasına yardım eder. Öneriniz varsa doğrudan bize yazın.</p>
    <div class="rh-d"><button class="btn-go" data-act="rh-puan">★ Puan ver</button><button class="btn-light" data-act="rh-yaz">Önerim var</button><button class="btn-light" data-act="rh-paylas-kart">Paylaş</button><button class="btn-light" data-act="rh-sonra">Sonra</button></div></div>`;
  document.body.appendChild(el);
}
export function puanKartKapat() { document.querySelector(".rh-puan")?.remove(); }
export async function puanVer() {
  P.tamam = true; await st?.set(PUAN, P); puanKartKapat();
  const R = window.Capacitor?.Plugins?.InAppReview;
  try { if (R?.requestReview) { await R.requestReview(); return; } } catch { /* */ }
  try { window.open(MAGAZA(), "_blank"); } catch { location.href = MAGAZA(); }
}

// paylaş: telefonun paylaşım menüsü, yoksa tarayıcınınki, yoksa panoya kopyala
export async function paylas(toast, metin) {
  metin ||= "Yaşam Rehberi: namaz vakitleri ve geri sayım, kıble, tesbih, saat, çarşı ve miras hesabı. İnternetsiz, reklamsız, ücretsiz.";
  const url = MAGAZA(), S = window.Capacitor?.Plugins?.Share;
  try {
    if (S?.share) { await S.share({ title: "Yaşam Rehberi", text: metin, url, dialogTitle: "Arkadaşına öner" }); return; }
    if (navigator.share) { await navigator.share({ title: "Yaşam Rehberi", text: metin, url }); return; }
  } catch (e) { if (/cancel|abort/i.test(e?.message || e?.name || "")) return; }
  try { await navigator.clipboard.writeText(metin + " " + url); toast?.("Bağlantı kopyalandı, istediğin yere yapıştır"); } catch { toast?.(url); }
}
export function bizeYaz(surum, ilerleme = "") {
  const konu = `Yaşam Rehberi – Görüş ve öneri (${surum}, ${platform()})`;
  const govde = `Merhaba, Yaşam Rehberi ile ilgili görüşüm:\n\n\n— ${surum} · ${platform()} · ${gunler.length}. kullanım günü${ilerleme ? " · " + ilerleme : ""}`;
  location.href = "mailto:emreanduvart@gmail.com?subject=" + encodeURIComponent(konu) + "&body=" + encodeURIComponent(govde);
}

// verilerimi sil: bu telefondaki bütün uygulama verisi (Preferences + yerel depo) ve kurulu bildirimler
export async function verileriSil() {
  const C = window.Capacitor?.Plugins || {};
  try { const LN = C.LocalNotifications; if (LN) { const p = await LN.getPending(); if (p?.notifications?.length) await LN.cancel({ notifications: p.notifications.map((n) => ({ id: n.id })) }); } } catch { /* */ }
  try { if (C.Preferences?.clear) await C.Preferences.clear(); } catch { /* */ }
  try { localStorage.clear(); } catch { /* */ }
  try { sessionStorage.clear(); } catch { /* */ }
  location.hash = "#/"; location.reload();
}
