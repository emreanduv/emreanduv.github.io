// Miras hesabı: (1) Kur'an'daki paylara göre feraiz — Hanefî mezhebi, Diyanet'in anlatımı esas;
// (2) Türk Medeni Kanunu (TMK md. 495–501). Bilgi amaçlıdır; fetva veya hukuki görüş değildir.
// Kesirlerle KESİN hesap yapılır (yuvarlama yalnız ekranda).

// ---------------------------------------------------------------------------
// Kesir
// ---------------------------------------------------------------------------
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export const F = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const cmp = (a, b) => a.n * b.d - b.n * a.d;
const ZERO = F(0), ONE = F(1);
const sum = (arr) => arr.reduce((s, x) => add(s, x), ZERO);
export const kesir = (f) => (f.n === 0 ? "0" : f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);
export const yuzde = (f) => (100 * f.n / f.d);

// ---------------------------------------------------------------------------
// Girdi (ölüm anında HAYATTA olanlar)
//   olen: "erkek" | "kadin"
//   es: kocası (0/1) ya da hanımları (0–4)
//   ogul, kiz: hayattaki çocuklar
//   olmus: [{ cins: "erkek"|"kadin", ogul, kiz }]  ölenden ÖNCE vefat etmiş çocuklar ve onların hayattaki çocukları
//   anne, baba, dede (babanın babası), anneDede (annenin babası), babaAnne (babanın annesi), anneAnne (annenin annesi)
//   tamE, tamK (ana-baba bir), babaE, babaK (baba bir), anaE, anaK (ana bir) kardeşler
//   uzakAsabe: amca, yeğen (erkek kardeş oğlu), amca oğlu gibi baba tarafından erkek akraba var mı
// ---------------------------------------------------------------------------
export const BOS = { olen: "erkek", es: 0, ogul: 0, kiz: 0, olmus: [], anne: false, baba: false, dede: false, anneDede: false,
  babaAnne: false, anneAnne: false, tamE: 0, tamK: 0, babaE: 0, babaK: 0, anaE: 0, anaK: 0, uzakAsabe: false };

const AYET = { es: "Nisâ 4:12", cocuk: "Nisâ 4:11", ebeveyn: "Nisâ 4:11", kardesAna: "Nisâ 4:12", kardes: "Nisâ 4:176" };

// ---------------------------------------------------------------------------
// FERAİZ (Hanefî)
// ---------------------------------------------------------------------------
export function feraiz(g0) {
  const g = { ...BOS, ...g0 };
  const notlar = [];
  const ogulOgul = g.olmus.filter((c) => c.cins === "erkek").reduce((s, c) => s + (c.ogul || 0), 0);
  const ogulKiz = g.olmus.filter((c) => c.cins === "erkek").reduce((s, c) => s + (c.kiz || 0), 0);
  const kizCocuk = g.olmus.filter((c) => c.cins === "kadin").reduce((s, c) => s + (c.ogul || 0) + (c.kiz || 0), 0);
  const erkekFuru = g.ogul > 0 || ogulOgul > 0;               // mirasçı erkek alt soy
  const furu = erkekFuru || g.kiz > 0 || ogulKiz > 0;          // mirasçı alt soy
  const dedeEtkin = !g.baba && g.dede;
  const kardesSay = g.tamE + g.tamK + g.babaE + g.babaK + g.anaE + g.anaK;
  const esPay = g.es > 0 ? (g.olen === "kadin" ? (furu ? F(1, 4) : F(1, 2)) : (furu ? F(1, 8) : F(1, 4))) : null;

  const fix = [];   // { key, ad, kisi, pay, dayanak }
  const asabe = []; // öncelik sırasıyla: { key, ad, erkek, kadin, dayanak, ekler?: [fix key] }
  const mahrum = []; // { ad, neden }

  if (esPay) fix.push({ key: "es", ad: g.olen === "kadin" ? "Kocası" : (g.es > 1 ? "Hanımları" : "Hanımı"), kisi: g.olen === "kadin" ? 1 : g.es, pay: esPay,
    dayanak: `${AYET.es} · ${furu ? "çocuk/torun varken" : "çocuk/torun yokken"} ${kesir(esPay)}` });

  // Anne (Ömeriyyeteyn: yalnız eş + anne + baba → anne, eşten kalanın 1/3'ü)
  if (g.anne) {
    let p = furu || kardesSay >= 2 ? F(1, 6) : F(1, 3);
    let d = `${AYET.ebeveyn} · ${furu ? "çocuk/torun varken 1/6" : kardesSay >= 2 ? "iki ya da daha çok kardeş varken 1/6" : "1/3"}`;
    if (!furu && kardesSay < 2 && g.baba && esPay) { p = mul(F(1, 3), sub(ONE, esPay)); d = "Ömeriyyeteyn: eşten kalanın 1/3'ü (Hz. Ömer'in hükmü, Hanefî)"; }
    fix.push({ key: "anne", ad: "Annesi", kisi: 1, pay: p, dayanak: d });
  }
  // Baba / dede
  for (const [var_, key, ad] of [[g.baba, "baba", "Babası"], [dedeEtkin, "dede", "Dedesi (babasının babası)"]]) {
    if (!var_) continue;
    if (erkekFuru) fix.push({ key, ad, kisi: 1, pay: F(1, 6), dayanak: `${AYET.ebeveyn} · erkek çocuk/torun varken 1/6` });
    else if (furu) { fix.push({ key, ad, kisi: 1, pay: F(1, 6), dayanak: `${AYET.ebeveyn} · 1/6 + kalan (asabe)` }); asabe.push({ key, ad, erkek: 1, kadin: 0, ekle: true }); }
    else asabe.push({ key, ad, erkek: 1, kadin: 0, dayanak: "Asabe: farz paylardan kalanın tamamı" });
  }
  if (g.dede && g.baba) mahrum.push({ ad: "Dedesi", neden: "baba varken mirasçı olmaz" });
  if (dedeEtkin && (g.tamE + g.tamK + g.babaE + g.babaK)) notlar.push("Dede ile kardeşler birlikte: Ebû Hanîfe'ye göre dede kardeşleri mirastan düşürür (hesap buna göre). İmameyn ve diğer mezhepler kardeşlere de pay verir; bu durumda bir din görevlisine danışın.");
  // Nineler
  const nine = [];
  if (g.anneAnne) { if (g.anne) mahrum.push({ ad: "Annesinin annesi", neden: "anne varken mirasçı olmaz" }); else nine.push("anneAnne"); }
  if (g.babaAnne) { if (g.anne || g.baba) mahrum.push({ ad: "Babasının annesi", neden: g.anne ? "anne varken mirasçı olmaz" : "baba varken mirasçı olmaz" }); else nine.push("babaAnne"); }
  if (nine.length) fix.push({ key: "nine", ad: nine.length > 1 ? "Nineleri" : (nine[0] === "anneAnne" ? "Annesinin annesi" : "Babasının annesi"), kisi: nine.length, pay: F(1, 6), dayanak: "Sünnet ve icma · anne yokken 1/6" });

  // Kızlar / oğullar
  if (g.ogul > 0) asabe.push({ key: "cocuk", ad: "Çocukları", erkek: g.ogul, kadin: g.kiz, dayanak: `${AYET.cocuk} · erkeğe iki kadın payı kadar` });
  else if (g.kiz > 0) fix.push({ key: "kiz", ad: g.kiz > 1 ? "Kızları" : "Kızı", kisi: g.kiz, pay: g.kiz === 1 ? F(1, 2) : F(2, 3), dayanak: `${AYET.cocuk} · ${g.kiz === 1 ? "tek kız 1/2" : "iki ve daha çok kız 2/3"}` });
  // Oğlun çocukları
  if (ogulOgul + ogulKiz > 0) {
    if (g.ogul > 0) mahrum.push({ ad: "Oğlunun çocukları (torunlar)", neden: "hayatta oğul varken mirasçı olmaz" });
    else if (ogulOgul > 0) asabe.push({ key: "torun", ad: "Oğlunun çocukları (torunlar)", erkek: ogulOgul, kadin: ogulKiz, dayanak: "Oğul yerine asabe · erkeğe iki kadın payı kadar" });
    else if (g.kiz === 0) fix.push({ key: "torunK", ad: ogulKiz === 1 ? "Oğlunun kızı" : "Oğlunun kızları", kisi: ogulKiz, pay: ogulKiz === 1 ? F(1, 2) : F(2, 3), dayanak: "Kız yokken kız gibi: 1/2 ya da 2/3" });
    else if (g.kiz === 1) fix.push({ key: "torunK", ad: ogulKiz === 1 ? "Oğlunun kızı" : "Oğlunun kızları", kisi: ogulKiz, pay: F(1, 6), dayanak: "Tek kızla birlikte 2/3'ü tamamlamak için 1/6 (hadis)" });
    else mahrum.push({ ad: "Oğlunun kızları", neden: "iki kız 2/3'ü aldığında, yanlarında erkek torun yoksa mirasçı olmaz" });
  }
  if (kizCocuk) notlar.push("Kızının çocukları feraizde 'zevi'l-erhâm' sayılır: eş dışında bir farz sahibi ya da asabe varken mirasçı olmaz.");

  // Ana bir kardeşler
  const anaN = g.anaE + g.anaK;
  if (anaN) {
    if (furu || g.baba || dedeEtkin) mahrum.push({ ad: "Ana bir kardeşleri", neden: furu ? "çocuk/torun varken mirasçı olmaz" : "baba/dede varken mirasçı olmaz" });
    else fix.push({ key: "anaK", ad: "Ana bir kardeşleri", kisi: anaN, pay: anaN === 1 ? F(1, 6) : F(1, 3), dayanak: `${AYET.kardesAna} · ${anaN === 1 ? "tek ise 1/6" : "birden çoksa 1/3, kadın erkek eşit"}` });
  }
  // Ana-baba bir ve baba bir kardeşler
  const kardesEngel = erkekFuru || g.baba || dedeEtkin;
  const kizlarVar = g.kiz > 0 || ogulKiz > 0;
  let tamKizAsabe = false;
  if (g.tamE + g.tamK) {
    if (kardesEngel) mahrum.push({ ad: "Ana-baba bir kardeşleri", neden: erkekFuru ? "erkek çocuk/torun varken mirasçı olmaz" : "baba/dede varken mirasçı olmaz" });
    else if (g.tamE > 0) asabe.push({ key: "tam", ad: "Ana-baba bir kardeşleri", erkek: g.tamE, kadin: g.tamK, dayanak: `${AYET.kardes} · erkeğe iki kadın payı kadar` });
    else if (kizlarVar) { tamKizAsabe = true; asabe.push({ key: "tamK", ad: "Ana-baba bir kız kardeşleri", erkek: 0, kadin: g.tamK, dayanak: "Kızlarla birlikte asabe (maa'l-gayr): kalanı alır" }); }
    else fix.push({ key: "tamK", ad: "Ana-baba bir kız kardeşleri", kisi: g.tamK, pay: g.tamK === 1 ? F(1, 2) : F(2, 3), dayanak: `${AYET.kardes} · ${g.tamK === 1 ? "tek ise 1/2" : "iki ve daha çoksa 2/3"}` });
  }
  if (g.babaE + g.babaK) {
    if (kardesEngel || g.tamE > 0 || tamKizAsabe) mahrum.push({ ad: "Baba bir kardeşleri", neden: kardesEngel ? "erkek çocuk/torun, baba ya da dede varken mirasçı olmaz" : "ana-baba bir kardeş varken mirasçı olmaz" });
    else if (g.babaE > 0) asabe.push({ key: "baba1", ad: "Baba bir kardeşleri", erkek: g.babaE, kadin: g.babaK, dayanak: `${AYET.kardes} · erkeğe iki kadın payı kadar` });
    else if (kizlarVar) asabe.push({ key: "baba1K", ad: "Baba bir kız kardeşleri", erkek: 0, kadin: g.babaK, dayanak: "Kızlarla birlikte asabe (maa'l-gayr)" });
    else if (g.tamK === 0) fix.push({ key: "baba1K", ad: "Baba bir kız kardeşleri", kisi: g.babaK, pay: g.babaK === 1 ? F(1, 2) : F(2, 3), dayanak: `${AYET.kardes} · ana-baba bir kız kardeş yokken onlar gibi` });
    else if (g.tamK === 1) fix.push({ key: "baba1K", ad: "Baba bir kız kardeşleri", kisi: g.babaK, pay: F(1, 6), dayanak: "Tek ana-baba bir kız kardeşle 2/3'ü tamamlamak için 1/6" });
    else mahrum.push({ ad: "Baba bir kız kardeşleri", neden: "iki ana-baba bir kız kardeş 2/3'ü aldığında mirasçı olmaz" });
  }

  // Avl (farzlar toplamı 1'i aşarsa orantılı indirim)
  let toplam = sum(fix.map((x) => x.pay));
  const sonuc = fix.map((x) => ({ ...x }));
  let avl = false;
  if (cmp(toplam, ONE) > 0) {
    avl = true;
    for (const x of sonuc) x.pay = div(x.pay, toplam);
    notlar.push(`Avl: farz paylar toplamı ${kesir(toplam)} olduğundan herkesin payı orantılı olarak küçültüldü.`);
    toplam = ONE;
  }
  let kalan = sub(ONE, toplam);
  const satirlar = [];
  if (cmp(kalan, ZERO) === 0) for (const x of sonuc) if ((x.key === "baba" || x.key === "dede") && x.dayanak.includes("+ kalan")) x.dayanak = `${AYET.ebeveyn} · 1/6${avl ? " (avl ile küçüldü; kalan yok)" : " (kalan yok)"}`;
  // Asabe
  // Asabe önceliği: çocuklar > oğlun çocukları > baba > dede > ana-baba bir kardeş > baba bir kardeş
  const SIRA = ["cocuk", "torun", "baba", "dede", "tam", "tamK", "baba1", "baba1K"];
  asabe.sort((x, y) => SIRA.indexOf(x.key) - SIRA.indexOf(y.key));
  const a = asabe[0];
  if (cmp(kalan, ZERO) > 0 && a) {
    if (a.ekle) {
      const x = sonuc.find((s) => s.key === a.key);
      x.pay = add(x.pay, kalan); x.dayanak = `${AYET.ebeveyn} · 1/6 + kalan (asabe)`; kalan = ZERO;
    } else {
      const birim = a.erkek * 2 + a.kadin;
      if (a.erkek) satirlar.push({ key: a.key + "E", ad: a.erkek === 1 && !a.kadin && a.key !== "cocuk" ? a.ad : `${a.ad} — erkek`, kisi: a.erkek, pay: mul(kalan, F(a.erkek * 2, birim)), dayanak: a.dayanak || "Asabe" });
      if (a.kadin) satirlar.push({ key: a.key + "K", ad: a.erkek ? `${a.ad} — kız` : a.ad, kisi: a.kadin, pay: mul(kalan, F(a.kadin, birim)), dayanak: a.dayanak || "Asabe" });
      kalan = ZERO;
    }
    for (const b of asabe.slice(1)) if (!b.ekle) mahrum.push({ ad: b.ad, neden: "daha yakın asabe varken mirasçı olmaz" });
  } else if (a && cmp(kalan, ZERO) === 0 && !a.ekle) {
    for (const b of asabe) mahrum.push({ ad: b.ad, neden: "farz paylar mirasın tamamını aldığından kalan yok (asabeye bir şey kalmadı)" });
  }
  // Redd (asabe yoksa artan, eş hariç farz sahiplerine orantılı döner)
  let durum = "tam";
  if (cmp(kalan, ZERO) > 0) {
    const reddSahibi = sonuc.filter((x) => x.key !== "es");
    if (g.uzakAsabe) {
      satirlar.push({ key: "uzak", ad: "Baba tarafından en yakın erkek akraba (amca, yeğen…)", kisi: 1, pay: kalan, dayanak: "Uzak asabe — kim olduğu için danışın" });
      kalan = ZERO; durum = "kismi";
    } else if (reddSahibi.length) {
      const t = sum(reddSahibi.map((x) => x.pay));
      for (const x of reddSahibi) { x.pay = add(x.pay, mul(kalan, div(x.pay, t))); x.dayanak += " + redd"; }
      notlar.push(`Redd: asabe olmadığından artan ${kesir(kalan)}, eş dışındaki farz sahiplerine payları oranında geri döndü.`);
      kalan = ZERO;
    } else if (kizCocuk || g.anneDede) {
      satirlar.push({ key: "zevi", ad: "Zevi'l-erhâm (kızının çocukları, annesinin babası…)", kisi: 1, pay: kalan, dayanak: "Farz sahibi ve asabe yokken" });
      notlar.push("Zevi'l-erhâm arasındaki paylaşım ayrıntılıdır; bir din görevlisine danışın.");
      kalan = ZERO; durum = "kismi";
    } else if (sonuc.length) {
      const x = sonuc[0];
      x.pay = add(x.pay, kalan); x.dayanak += " + redd (başka mirasçı yokken eşe)";
      notlar.push("Girilen başka mirasçı olmadığından artan pay, sonraki Hanefî âlimlerinin görüşüyle eşe döndü. Hala, teyze, kız kardeş çocukları gibi zevi'l-erhâm akraba varsa artanı önce onlar alır; bu durumda danışın.");
      kalan = ZERO;
    } else { durum = "yok"; notlar.push("Hiç mirasçı yok: klasik fıkıhta miras beytülmâle (kamuya) kalır."); }
  }
  const hepsi = [...sonuc, ...satirlar].filter((x) => x.pay.n > 0).map((x) => ({ ...x, kisiBasi: div(x.pay, F(x.kisi)) }));
  return { satirlar: hepsi, mahrum, notlar, avl, durum, toplam: sum(hepsi.map((x) => x.pay)) };
}

// ---------------------------------------------------------------------------
// TÜRK MEDENİ KANUNU (md. 495–501) — kadın erkek eşit; halefiyet
// ---------------------------------------------------------------------------
export function tmk(g0) {
  const g = { ...BOS, ...g0 };
  const notlar = [];
  const out = [];
  const esVar = g.es > 0;
  if (g.olen === "erkek" && g.es > 1) notlar.push("Türk hukukunda yalnızca resmî nikâhlı eş mirasçıdır; hesap tek eş üzerinden yapıldı.");
  const esAd = g.olen === "kadin" ? "Kocası" : "Hanımı (resmî nikâhlı eş)";
  // 1. zümre: alt soy (md. 495)
  const kollar = [];
  for (let i = 0; i < g.ogul; i++) kollar.push({ ad: "Oğlu", kisi: 1 });
  for (let i = 0; i < g.kiz; i++) kollar.push({ ad: "Kızı", kisi: 1 });
  for (const c of g.olmus) { const n = (c.ogul || 0) + (c.kiz || 0); if (n) kollar.push({ ad: `Vefat etmiş ${c.cins === "erkek" ? "oğlunun" : "kızının"} çocukları`, kisi: n, torun: true }); }
  if (kollar.length) {
    const esPay = esVar ? F(1, 4) : ZERO;
    if (esVar) out.push({ ad: esAd, kisi: 1, pay: esPay, dayanak: "TMK md. 499/1 · alt soyla birlikte 1/4" });
    const kol = div(sub(ONE, esPay), F(kollar.length));
    const grup = new Map();
    for (const [i, k] of kollar.entries()) {
      const key = k.torun ? `olmus${i}` : k.ad;
      const prev = grup.get(key);
      if (prev) { prev.kisi += 1; prev.pay = add(prev.pay, kol); }
      else grup.set(key, { ad: k.ad, kisi: k.kisi, pay: kol, dayanak: k.torun ? "TMK md. 495 · ölen çocuğun payı onun çocuklarına eşit geçer (halefiyet)" : "TMK md. 495 · çocuklar eşit pay alır" });
    }
    for (const v of grup.values()) if (v.kisi > 1 && (v.ad === "Oğlu" || v.ad === "Kızı")) v.ad = v.ad === "Oğlu" ? "Oğulları" : "Kızları";
    out.push(...grup.values());
    return bitir(out, notlar);
  }
  // 2. zümre: ana-baba ve onların alt soyu (md. 496)
  const babaTaraf = g.baba ? [{ ad: "Babası", kisi: 1 }] : (g.tamE + g.tamK + g.babaE + g.babaK) ? [{ ad: "Ana-baba bir kardeşleri", kisi: g.tamE + g.tamK, kardes: true }, { ad: "Baba bir kardeşleri", kisi: g.babaE + g.babaK, kardes: true }].filter((x) => x.kisi) : [];
  const anneTaraf = g.anne ? [{ ad: "Annesi", kisi: 1 }] : (g.tamE + g.tamK + g.anaE + g.anaK) ? [{ ad: "Ana-baba bir kardeşleri", kisi: g.tamE + g.tamK, kardes: true }, { ad: "Ana bir kardeşleri", kisi: g.anaE + g.anaK, kardes: true }].filter((x) => x.kisi) : [];
  if (babaTaraf.length || anneTaraf.length) {
    const esPay = esVar ? F(1, 2) : ZERO;
    if (esVar) out.push({ ad: esAd, kisi: 1, pay: esPay, dayanak: "TMK md. 499/2 · ana-baba zümresiyle 1/2" });
    const kalan = sub(ONE, esPay);
    const taraflar = [babaTaraf, anneTaraf].filter((t) => t.length);
    const tarafPay = div(kalan, F(taraflar.length));
    if (taraflar.length === 1) notlar.push("Bir tarafta mirasçı olmadığından o tarafın payı diğer tarafa geçti (TMK md. 496).");
    const grup = new Map();
    for (const t of taraflar) {
      const kisi = t.reduce((s, x) => s + x.kisi, 0);
      for (const x of t) {
        const p = mul(tarafPay, F(x.kisi, kisi));
        const prev = grup.get(x.ad);
        if (prev) { prev.pay = add(prev.pay, p); prev.ikiTaraf = true; }
        else grup.set(x.ad, { ad: x.ad, kisi: x.kisi, pay: p, dayanak: x.kardes ? "TMK md. 496 · ölmüş ana/babanın payı onun çocuklarına eşit geçer" : "TMK md. 496 · ana ve baba eşit pay alır" });
      }
    }
    for (const v of grup.values()) if (v.ikiTaraf) v.dayanak = "TMK md. 496 · hem baba hem anne tarafının payından alır";
    if (taraflar.length === 1) for (const v of grup.values()) if (v.ad === "Annesi" || v.ad === "Babası") v.dayanak = "TMK md. 496 · öteki tarafta mirasçı olmadığından o tarafın payını da alır";
    out.push(...grup.values());
    return bitir(out, notlar);
  }
  // Yeğen (2. zümre) ya da amca/hala/dayı/teyze (3. zümre) bu hesapta tek tek girilmiyor
  if (g.uzakAsabe) {
    notlar.push("Türk Medeni Kanunu'na göre vefat etmiş kardeşlerin çocukları (yeğenler, md. 496) ve amca, hala, dayı, teyze (md. 497) de mirasçı olabilir; bu hesap onları içermiyor. Kesin paylar için avukata danışın.");
    if (esVar) out.push({ ad: esAd, kisi: 1, pay: F(1, 2), dayanak: "TMK md. 499 · yeğenlerle 1/2, amca/hala/dayı/teyze ile 3/4" });
    out.push({ ad: "Yeğenler ya da amca, hala, dayı, teyze", kisi: 1, pay: esVar ? F(1, 2) : ONE, dayanak: "Paylar akrabalığa göre değişir — danışın" });
    return bitir(out, notlar);
  }
  // 3. zümre: büyük ana ve büyük babalar (md. 497)
  const buyuk = [["Babasının babası", g.dede, "baba"], ["Babasının annesi", g.babaAnne, "baba"], ["Annesinin babası", g.anneDede, "anne"], ["Annesinin annesi", g.anneAnne, "anne"]].filter((x) => x[1]);
  if (buyuk.length) {
    const esPay = esVar ? F(3, 4) : ZERO;
    if (esVar) out.push({ ad: esAd, kisi: 1, pay: esPay, dayanak: "TMK md. 499/3 · büyük ana-babalarla 3/4" });
    const kalan = sub(ONE, esPay);
    const taraflar = ["baba", "anne"].map((t) => buyuk.filter((x) => x[2] === t)).filter((t) => t.length);
    for (const t of taraflar) for (const x of t) out.push({ ad: x[0], kisi: 1, pay: div(kalan, F(taraflar.length * t.length)), dayanak: "TMK md. 497 · her taraf yarı, taraf içinde eşit" });
    notlar.push("Vefat etmiş büyük ana/babaların payı onların çocuklarına (amca, hala, dayı, teyze) geçer; bu hesapta onların olmadığı varsayıldı. Varsa avukata danışın.");
    return bitir(out, notlar);
  }
  if (esVar) { out.push({ ad: esAd, kisi: 1, pay: ONE, dayanak: "TMK md. 499/3 · başka yasal mirasçı yoksa tamamı" }); return bitir(out, notlar); }
  notlar.push("Yasal mirasçı yoksa miras Devlete kalır (TMK md. 501).");
  return bitir(out, notlar);
}

function bitir(out, notlar) {
  const satirlar = out.filter((x) => x.pay.n > 0).map((x) => ({ ...x, kisiBasi: div(x.pay, F(x.kisi)) }));
  return { satirlar, notlar, toplam: sum(satirlar.map((x) => x.pay)) };
}

// Bu motorun güvenle hesaplayamadığı durumlar (ekranda "danışın" uyarısı)
export function uyarilar(g0) {
  const g = { ...BOS, ...g0 };
  const u = [];
  if (g.olmus.some((c) => !(c.ogul || c.kiz))) u.push("Çocuğu olmadan vefat eden çocuklar hesaba katılmaz.");
  return u;
}
