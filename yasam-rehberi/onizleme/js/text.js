// Türkçe metin normalizasyonu ve hafif kök bulma.
// kuran-terminal/kuran/text.py ile BİREBİR aynı kurallar (test/parity.mjs doğrular).

const FOLD = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u",
  "â": "a", "î": "i", "û": "u", "ê": "e", "ô": "o" };

const SUFFIXES = [
  "lerinden", "larindan", "lerinde", "larinda", "lerine", "larina",
  "lerini", "larini", "lerin", "larin", "leri", "lari", "ler", "lar",
  "sinden", "sindan", "sinde", "sinda", "sine", "sina", "sini", "sinin",
  "inden", "indan", "inde", "inda", "ine", "ina", "ini", "inin",
  "dan", "den", "tan", "ten", "da", "de", "ta", "te",
  "nin", "nun", "in", "un",
  "imiz", "umuz", "iniz", "unuz", "niz", "nuz",
  "yla", "yle", "la", "le",
  "dir", "dur", "tir", "tur",
  "mak", "mek", "mis", "mus", "yor", "yken", "ken",
  "lik", "luk", "li", "lu", "siz", "suz",
  "si", "su", "yi", "yu", "ya", "ye", "na", "ne", "ni", "nu",
  "i", "u", "a", "e",
].sort((a, b) => b.length - a.length);

export const STOPWORDS = new Set([
  "ve", "ile", "bir", "bu", "su", "o", "da", "de", "mi", "mu", "midir",
  "mudur", "ne", "neden", "nasil", "icin", "gibi", "ama", "fakat", "ki",
  "ya", "veya", "hem", "her", "cok", "daha", "en", "olan", "olarak",
  "olur", "olmaz", "var", "yok", "mi?", "kuran", "kurana", "kuranda",
  "gore", "hakkinda", "ayet", "ayetler", "ayetleri", "sure", "nedir",
  "nelerdir", "neler", "acaba", "allah", "tanri", "kadar",
  "zaman", "sey", "seyler", "olmak",
]);

export const WEAK = new Set(["boz", "bozar", "bozmak", "bozul", "yap", "yapmak", "etmek", "olmak",
  "caiz", "farz", "haram", "helal", "gunah", "sevap", "yasak", "mubah",
  "serbest", "dogru", "yanlis", "izin", "uygun", "lazim", "gerek",
  "mecbur", "sart", "kural", "hukum", "emir", "emr",
  // soru kalıpları ("abdest almak kabul olur mu", "geçerli mi"): konu değil, soru biçimi
  "kabul", "almak", "alinir", "alir", "alabilir", "alinmasi", "gecerli",
  "sahih", "mumkun", "sakinca", "sakincali"]);

const SOFT = { b: "p", p: "b", d: "t", t: "d", g: "k", k: "g" };

export function fold(text) {
  let t = text.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase().normalize("NFC");
  t = t.replace(/[çğıöşüâîûêô]/g, (c) => FOLD[c]);
  t = t.normalize("NFD").replace(/\p{Mn}/gu, "");
  return t.replace(/['’]/g, " ");
}

export function stem(word) {
  for (let pass = 0; pass < 3; pass++) {
    let cut = false;
    for (const suf of SUFFIXES) {
      if (word.endsWith(suf) && word.length - suf.length >= 4) {
        word = word.slice(0, -suf.length);
        cut = true;
        break;
      }
    }
    if (!cut) break;
  }
  return word;
}

export function tokens(text) {
  return fold(text).match(/[a-z0-9]+/g) || [];
}

export function termKey(token) {
  const s = stem(token);
  return s.length >= 4 ? s : token;
}

export function variants(key) {
  const out = [key];
  const last = key[key.length - 1];
  if (key.length >= 4 && SOFT[last]) out.push(key.slice(0, -1) + SOFT[last]);
  return out;
}

export function queryTerms(text) {
  const out = [];
  const seen = new Set();
  for (const t of tokens(text)) {
    if (STOPWORDS.has(t) || t.length < 2) continue;
    const k = termKey(t);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ key: k, weak: WEAK.has(t) || WEAK.has(k) || WEAK.has(stem(t)) });
  }
  return out;
}
