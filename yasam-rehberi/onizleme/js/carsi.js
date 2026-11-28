// Yaşam Rehberi — Çarşı modülü
// Veri: www/data/carsi.json (Wikidata + Türkçe Vikipedi kategorileri; yeniden üretmek için: npm run carsi)
// Kurallar: markaları damgalayan etiket yok; sahiplik bilgisi kaynağıyla birlikte, olduğu gibi gösterilir.

import { BANT, REYON as REYON_IK } from "./cizim.js";
const REYON = [
  ["gida", "Mutfak", "Bisküvi, süt, et, bakliyat, şeker"],
  ["icecek", "İçecek", "Çay, su, maden suyu, gazoz"],
  ["lokanta", "Sofra ve tatlı", "Köfteci, börekçi, pastane, bozacı"],
  ["giyim", "Giyim ve ayakkabı", "Günlük, takım, spor, ayakkabı"],
  ["ev", "Ev ve beyaz eşya", "Beyaz eşya, mobilya, porselen, boya"],
  ["bakim", "Temizlik ve bakım", "Sabun, kolonya, kozmetik, kâğıt"],
  ["saat", "Saat", "Kol saati, duvar saati"],
  ["teknoloji", "Teknoloji", "Telefon, bilgisayar, modem, yazılım"],
  ["hobi", "Kırtasiye ve hobi", "Kalem, oyuncak, müzik aleti"],
  ["market", "Market ve mağaza", "Zincir market, yapı market, elektronik"],
  ["yol", "Yolda", "Otomobil, otobüs, motosiklet, lastik, akaryakıt"],
  ["dijital", "Dijital", "Oyun, dizi-film, mesajlaşma, sipariş"],
  ["yolculuk", "Yolculuk ve kargo", "Havayolu, deniz otobüsü, tur, posta"],
];
const ULKE = {
  Q43: "Türkiye", Q30: "ABD", Q145: "Birleşik Krallık", Q183: "Almanya", Q142: "Fransa", Q55: "Hollanda",
  Q38: "İtalya", Q17: "Japonya", Q155: "Brezilya", Q148: "Çin", Q29: "İspanya", Q884: "Güney Kore",
  Q227: "Azerbaycan", Q851: "Suudi Arabistan", Q159: "Rusya", Q833: "Malezya", Q41: "Yunanistan",
  Q846: "Katar", Q32: "Lüksemburg", Q39: "İsviçre", Q31: "Belçika", Q40: "Avusturya", Q232: "Kazakistan",
};
// Birden fazla reyonda görünecek markalar (ör. teknoloji mağazaları hem "Market ve mağaza"da hem "Teknoloji"de)
const EK_REYON = { Q6559269: ["teknoloji"], Q6048050: ["teknoloji"], Q6017141: ["market"] };
const MAX_LIST = 200;
const ICON_KAMERA = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8v8M10 8v8M13 8v8M16 8v8"/></svg>';

let D = null;            // { meta, items: [{id,n,r,y,m,w,wp,o,src}] } · src: elle kayıtların kaynağı (Wikidata dışı, id "x-…")
let loading = null;
let liste = [];          // kullanıcının listesi (marka kimlikleri)
let ctx = null;          // app.js'ten gelen yardımcılar
const ui = { q: "", barkod: "", barkodTam: false };

// ---------------------------------------------------------------------------
const fold = (s) => String(s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/ı/g, "i").replace(/[^a-z0-9]+/g, " ").trim();
const reyon = (id) => REYON.find((r) => r[0] === id);
const byReyon = (id) => D.items.filter((x) => x.r === id || (EK_REYON[x.id] || []).includes(id)).sort((a, b) => a.n.localeCompare(b.n, "tr"));
const ortakYurtdisi = (x) => (x.o || []).filter((o) => o[1] && o[1] !== "Q43");
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
const wpUrl = (t) => `https://tr.wikipedia.org/wiki/${encodeURIComponent(t)}`;
const wdUrl = (q) => `https://www.wikidata.org/wiki/${q}`;
const isWD = (x) => /^Q\d+$/.test(x.id);   // Wikidata kaydı mı, kaynaklı elle kayıt mı

export async function initCarsi(c) {
  ctx = c;
  liste = await ctx.store.get("carsi-liste", []);
}

function load() {
  if (!loading) {
    loading = fetch("data/carsi.json").then((r) => r.json()).then((j) => {
      D = { meta: j.meta, items: j.items.map(([id, n, r, y, m, w, wp, o, src]) => ({ id, n, r, y, m, w, wp, o, src, k: fold(n) })) };
    });
  }
  return loading;
}

// ---------------------------------------------------------------------------
// Barkod: EAN-13 denetimi + GS1 ülke öneki (868–869 Türkiye'deki GS1 kuruluşunun numaralarıdır)
// ---------------------------------------------------------------------------
export function barkodBilgi(raw, tam = false) {
  let s = String(raw || "").replace(/\D/g, "");
  if (!s) return null;
  if (tam && s.length === 12) s = "0" + s;            // UPC-A → EAN-13
  if (s.length !== 13 && !(tam && s.length === 8)) return { tip: "eksik", msg: `${s.length}/13 hane. Ürünün arkasındaki barkodun altındaki 13 haneyi yaz.` };
  const d = [...s].map(Number), n = d.length;          // EAN-13 ya da EAN-8: sağdan ağırlık 3,1,3,1…
  const sum = d.slice(0, n - 1).reduce((t, x, i) => t + x * ((n - 1 - i) % 2 ? 3 : 1), 0);
  if ((10 - (sum % 10)) % 10 !== d[n - 1]) return { tip: "hata", msg: "Son hane tutmuyor; barkodu bir daha kontrol et." };
  const p = Number(s.slice(0, 3));
  if (p === 868 || p === 869) return { tip: "tr", msg: `${s.slice(0, 3)} öneki: barkod Türkiye'deki GS1 kuruluşu üzerinden alınmış.` };
  return { tip: "diger", msg: `${s.slice(0, 3)} öneki: barkod başka bir ülkedeki GS1 kuruluşundan alınmış.` };
}

// Kamerayla okutma: @capacitor/barcode-scanner (iOS: Apple Vision, Android: ML Kit — cihaz üzerinde, ücretsiz)
const Scanner = () => (window.Capacitor?.isNativePlatform?.() ? window.Capacitor?.Plugins?.CapacitorBarcodeScanner : null);
async function kameraIleOkut() {
  const S = Scanner();
  if (!S) return;
  try {
    const r = await S.scanBarcode({
      hint: 17, scanInstructions: "Barkodu çerçevenin içine hizala", scanButton: false, scanText: " ",
      cameraDirection: 1, scanOrientation: 3, android: { scanningLibrary: "mlkit" },
    });
    const code = String(r?.ScanResult || "").replace(/\D/g, "");
    if (!code) { ctx.toast("Barkod okunamadı"); return; }
    ui.barkod = code.length === 12 ? "0" + code : code;
    ui.barkodTam = true;
    const inp = document.getElementById("cb"); if (inp) inp.value = ui.barkod;
    const out = document.getElementById("c-barkod-out"); if (out) out.innerHTML = barkodHtml(barkodBilgi(ui.barkod, true));
    navigator.vibrate?.(30);
  } catch (err) {
    if (/cancel/i.test(String(err?.message || err))) return;   // kullanıcı vazgeçti
    ctx.toast("Kamera açılamadı. İzin verilmediyse telefonun Ayarlar bölümünden kamera iznini aç.");
  }
}

// ---------------------------------------------------------------------------
// ekranlar
// ---------------------------------------------------------------------------
function band(eyebrow, title, sub = "", cizim = "") {
  return `<section class="band${cizim ? " cizimli" : ""}">${cizim}<div class="eyebrow">${ctx.esc(eyebrow)}</div><h1>${ctx.esc(title)}</h1>${sub ? `<div class="sub">${sub}</div>` : ""}</section>`;
}

function brandRow(x, showReyon = false) {
  const meta = [showReyon ? reyon(x.r)[1] : x.m, x.y].filter(Boolean).join(" · ");
  const yd = ortakYurtdisi(x).length ? `<span class="c-flag" title="Ortaklık yapısında yurt dışı var">Ortaklı</span>` : "";
  const on = liste.includes(x.id) ? `<span class="c-star" aria-label="Listende">★</span>` : "";
  return `<a class="row" href="#/carsi/m/${x.id}"><span class="c-name">${initials(x.n)}<span>${ctx.esc(x.n)}${on}</span></span><span class="meta">${yd}${ctx.esc(meta)} ›</span></a>`;
}

function initials(n) {
  const w = n.replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).filter(Boolean);
  const t = (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || "?").slice(0, 2)).toLocaleUpperCase("tr");
  return `<span class="c-tile" aria-hidden="true">${ctx.esc(t)}</span>`;
}

function credits() {
  return `<div class="credits">Kaynak: <a href="https://www.wikidata.org">Wikidata</a> (CC0), Türkçe Vikipedi kategorileri ve kaynağı belirtilen elle kayıtlar · Güncelleme ${ctx.esc(D.meta.guncelleme.split("-").reverse().join("."))}. Bilgi eksik ya da yanlışsa markanın Wikidata sayfasından herkes düzeltebilir.</div>`;
}

function homeView() {
  const day = Math.floor(Date.now() / 864e5);
  const pick = D.items[day % D.items.length];
  const results = ui.q ? D.items.filter((x) => x.k.includes(fold(ui.q))).sort((a, b) => a.n.localeCompare(b.n, "tr")) : [];
  const b = barkodBilgi(ui.barkod, ui.barkodTam);
  return `${ctx.topbar()}
  ${band("Çarşı", "Ne alacaksın?", `${D.items.length} marka · ${REYON.length} reyon · kaynaklı bilgi`).replace('<section class="band">', `<section class="band cizimli">${BANT.carsi}`)}
  <main class="content">
    <section class="panel">
      <div class="panel-h">Marka ara</div>
      <div class="panel-b search"><label for="cq" class="sr">Marka adı</label>
        <input id="cq" type="search" data-act="c-filter" value="${ctx.esc(ui.q)}" autocomplete="off" enterkeyhint="search" placeholder="Örn. Sütaş, Arçelik">
      </div>
      <div id="c-results" class="rows">${ui.q ? resultsHtml(results) : ""}</div>
    </section>
    <section class="panel">
      <div class="panel-h">Reyonlar</div>
      <div class="rows">${REYON.map(([id, name, hint]) => {
        const n = byReyon(id).length;
        return `<a class="row reyon-row" href="#/carsi/r/${id}"><span class="reyon-sol"><span class="reyon-ik">${REYON_IK[id] || ""}</span><span><b>${ctx.esc(name)}</b><br><span class="c-hint">${ctx.esc(hint)}</span></span></span><span class="meta">${n ? `<span class="count">${n}</span>` : `<span class="c-soon">Yakında</span>`} ›</span></a>`;
      }).join("")}</div>
    </section>
    <section class="panel">
      <div class="panel-h">Gelen kutusu <span class="count">1</span></div>
      <a class="panel-b c-inbox" href="#/carsi/m/${pick.id}">
        <div class="c-inbox-bar"></div>
        <div><div class="c-inbox-t">Günün markası · ${ctx.esc(reyon(pick.r)[1])}</div>
        <div class="c-inbox-n">${ctx.esc(pick.n)}</div>
        <div class="c-hint">${ctx.esc([pick.m, pick.y && `kuruluş ${pick.y}`].filter(Boolean).join(" · ") || "Ayrıntılar için dokun")}</div></div>
      </a>
    </section>
    <section class="panel">
      <div class="panel-h">Barkod bak</div>
      <div class="panel-b">
        <div class="search"><label for="cb" class="sr">Barkod</label>
          <input id="cb" inputmode="numeric" maxlength="13" data-act="c-barkod" value="${ctx.esc(ui.barkod)}" placeholder="13 haneli barkod">
          ${Scanner() ? `<button class="btn-go" data-act="c-kamera" aria-label="Kamerayla okut">${ICON_KAMERA}Okut</button>` : ""}</div>
        <div id="c-barkod-out">${barkodHtml(b)}</div>
        <div class="c-small">Önek, firmanın barkodu hangi ülkede aldığını söyler; ürünün nerede üretildiğini tek başına kanıtlamaz. Emin olmak için ambalajdaki üretim yeri bilgisine bak.</div>
      </div>
    </section>
    <a class="btn-go btn-dark" href="#/carsi/liste">${ctx.ICON.mark} Listem <span class="count">${liste.length}</span></a>
    ${credits()}
    <div class="made">${ctx.esc(ctx.MAKER)}</div>
  </main>`;
}

function resultsHtml(list) {
  if (!list.length) return `<div class="c-empty-row">Bu adla kayıt yok. Reyonlara göz atabilirsin.</div>`;
  return list.slice(0, 30).map((x) => brandRow(x, true)).join("");
}

function barkodHtml(b) {
  if (!b) return "";
  const cls = { tr: "c-ok", diger: "c-info", hata: "c-bad", eksik: "c-info" }[b.tip];
  return `<div class="c-result ${cls}">${ctx.esc(b.msg)}</div>`;
}

function reyonView(id) {
  const r = reyon(id);
  if (!r) return null;
  const list = byReyon(id);
  const atolye = id === "saat" ? `<a class="btn-go btn-dark" href="#/saat">${ctx.ICON.clock}Kendi kadranını tasarla: Saat › Kadran atölyesi</a>` : "";
  const body = list.length
    ? `<section class="panel"><div class="panel-h">${ctx.esc(r[1])} <span class="count">${list.length}</span></div><div class="rows">${list.map((x) => brandRow(x)).join("")}</div></section>${atolye}`
    : id === "saat"
      ? `<div class="warn">${ctx.ICON.warn}<div>Açık kaynaklarda bu reyon için henüz yeterli kayıt yok. Saat markaları Wikidata'ya eklendikçe burada görünecek.</div></div>
         <a class="btn-go btn-dark" href="#/saat">${ctx.ICON.clock}Kendi kadranını tasarla: Saat › Kadran atölyesi</a>`
      : `<div class="empty">Bu reyonda henüz kayıt yok.</div>`;
  return `${ctx.topbar("Çarşı")}
  ${band("Reyon", r[1], ctx.esc(r[2]), (REYON_IK[id] || "").replace('class="ik"', 'class="bant-cizim bant-ik"'))}
  <main class="content">${body}
    <div class="note">“Ortaklı” işareti, Wikidata'ya göre şirketin sahipleri ya da bağlı olduğu yapı arasında yurt dışından bir ortak bulunduğunu gösterir. Karar senin.</div>
    ${credits()}</main>`;
}

function markaView(id) {
  const x = D.items.find((i) => i.id === id);
  if (!x) return null;
  const r = reyon(x.r);
  const owners = (x.o || []).map(([n, c]) => `${ctx.esc(n)}${c ? ` <span class="c-hint">(${ctx.esc(ULKE[c] || "ülke kaydı var")})</span>` : ""}`).join("<br>");
  const yd = ortakYurtdisi(x);
  const inList = liste.includes(x.id);
  const row = (k, v) => `<tr><th>${k}</th><td>${v || '<span class="c-hint">Kayıt yok</span>'}</td></tr>`;
  const others = byReyon(x.r).filter((o) => o.id !== x.id);
  const near = others.slice(0, 6);
  return `${ctx.topbar(r[1])}
  ${band(r[1], x.n, [x.m, x.y && `kuruluş ${x.y}`].filter(Boolean).map(ctx.esc).join(" · "))}
  <main class="content">
    ${yd.length ? `<div class="warn">${ctx.ICON.warn}<div>Wikidata'ya göre ortaklık yapısında yurt dışı var: ${yd.map(([n, c]) => `${ctx.esc(n)} (${ctx.esc(ULKE[c] || c)})`).join(", ")}.</div></div>` : ""}
    <section class="panel">
      <div class="panel-h">Künye</div>
      <table class="src c-kunye"><tbody>
        ${row("Reyon", ctx.esc(r[1]))}
        ${row("Kuruluş", x.y ? String(x.y) : "")}
        ${row("Merkez", ctx.esc(x.m || ""))}
        ${row("Bağlı olduğu", owners)}
        ${row("Web sitesi", x.w ? `<a href="${ctx.esc(x.w)}" rel="noopener">${ctx.esc(host(x.w))}</a>` : "")}
        ${x.src ? row("Kaynak", `<a href="${ctx.esc(x.src)}" rel="noopener">${ctx.esc(host(x.src))}</a>`) : ""}
      </tbody></table>
    </section>
    <div class="actions c-actions">
      <button class="btn-go" data-act="c-liste" data-id="${x.id}">${inList ? ctx.ICON.markOn + "Listende" : ctx.ICON.mark + "Listeme ekle"}</button>
      ${x.wp ? `<a class="btn-go btn-dark" href="${wpUrl(x.wp)}" rel="noopener">${ctx.ICON.book}Vikipedi</a>` : ""}
      ${isWD(x) ? `<a class="btn-go btn-dark" href="${wdUrl(x.id)}" rel="noopener">${ctx.ICON.note}Düzelt</a>` : ""}
    </div>
    ${near.length ? `<section class="panel"><div class="panel-h">Aynı reyonda</div><div class="rows">${near.map((o) => brandRow(o)).join("")}</div>
      ${others.length > near.length ? `<a class="row" href="#/carsi/r/${x.r}"><b>Tümünü gör</b><span class="meta">${others.length + 1} marka ›</span></a>` : ""}</section>` : ""}
    <div class="credits">${isWD(x)
      ? `Bu sayfadaki bilgiler Wikidata kaydı <a href="${wdUrl(x.id)}">${x.id}</a>'den alınmıştır (güncelleme ${ctx.esc(D.meta.guncelleme.split("-").reverse().join("."))}).`
      : `Bu marka Wikidata'da kayıtlı değil; bilgiler <a href="${ctx.esc(x.src || x.w || "")}">${ctx.esc(host(x.src || x.w || ""))}</a> kaynağından elle girildi, bilinmeyen alanlar boş bırakıldı.`}</div>
  </main>`;
}

function listeView() {
  const list = liste.map((id) => D.items.find((x) => x.id === id)).filter(Boolean);
  return `${ctx.topbar("Çarşı")}
  ${band("Senin listen", "Listem", list.length ? `${list.length} marka` : "")}
  <main class="content">${list.length
    ? `<section class="panel"><div class="rows">${list.map((x) => brandRow(x, true)).join("")}</div></section>
       <button class="btn-go btn-dark" data-act="c-paylas">${ctx.ICON.share}Listeyi paylaş</button>`
    : `<div class="empty">Listen boş.<br>Bir markayı açıp “Listeme ekle”ye dokunduğunda burada görünür; alışverişe çıkarken bakarsın.</div>`}
  </main>`;
}

// ---------------------------------------------------------------------------
// app.js'in yönlendiricisi çağırır. Veri yüklü değilse yükleyip yeniden çizdirir.
// ---------------------------------------------------------------------------
export function carsiRoute(parts) {
  if (!D) { load().then(() => ctx.rerender()).catch((e) => ctx.fail(e)); return `${ctx.topbar()}<div class="loading">Çarşı açılıyor…</div>`; }
  if (parts[1] === "r") return reyonView(parts[2]);
  if (parts[1] === "m") return markaView(parts[2]);
  if (parts[1] === "liste") return listeView();
  return homeView();
}

// ---------------------------------------------------------------------------
// olaylar
// ---------------------------------------------------------------------------
if (typeof document !== "undefined") {
document.addEventListener("input", (e) => {
  const act = e.target.dataset.act;
  if (act === "c-filter") {
    ui.q = e.target.value;
    const box = document.getElementById("c-results");
    if (box) box.innerHTML = ui.q.trim() ? resultsHtml(D.items.filter((x) => x.k.includes(fold(ui.q))).sort((a, b) => a.n.localeCompare(b.n, "tr"))) : "";
  } else if (act === "c-barkod") {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 13);
    ui.barkod = e.target.value;
    ui.barkodTam = false;
    const out = document.getElementById("c-barkod-out");
    if (out) out.innerHTML = barkodHtml(barkodBilgi(ui.barkod));
  }
});

document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  if (el.dataset.act === "c-kamera") { kameraIleOkut(); return; }
  if (el.dataset.act === "c-liste") {
    const id = el.dataset.id;
    liste = liste.includes(id) ? liste.filter((x) => x !== id) : [id, ...liste].slice(0, MAX_LIST);
    await ctx.store.set("carsi-liste", liste);
    ctx.toast(liste.includes(id) ? "Listene eklendi" : "Listeden çıkarıldı");
    ctx.rerender();
  } else if (el.dataset.act === "c-paylas") {
    const names = liste.map((id) => D.items.find((x) => x.id === id)).filter(Boolean).map((x) => `• ${x.n} (${reyon(x.r)[1]})`);
    const text = `Alışveriş listem\n\n${names.join("\n")}\n\n${ctx.APP_NAME}`;
    const Share = window.Capacitor?.Plugins?.Share;
    try {
      if (Share) await Share.share({ title: "Alışveriş listem", text });
      else if (navigator.share) await navigator.share({ title: "Alışveriş listem", text });
      else { await navigator.clipboard.writeText(text); ctx.toast("Panoya kopyalandı"); }
    } catch { /* vazgeçti */ }
  }
});
}
