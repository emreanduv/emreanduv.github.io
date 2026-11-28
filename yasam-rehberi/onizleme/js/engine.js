// Arama motoru: kelime araması + kavram sözlüğü + temel ayetler.
// kuran-terminal/kuran/engine.py ile aynı algoritma; tamamen cihaz üzerinde çalışır.
import { fold, queryTerms, termKey, tokens, variants } from "./text.js";

const QUERY_WEIGHT = 1.0;
const WEAK_WEIGHT = 0.3;
const CONCEPT_WEIGHT = 0.35;
const ANCHOR_BONUS = 0.9;

// İngilizce soru kalıplarındaki dolgu kelimeleri (Türkçe STOPWORDS'ün karşılığı)
const EN_STOP = new Set(("a an the and or of to in on at for from by with about is are was were be been am do does did can could should would may might must " +
  "what which who whom whose when where why how i me my we our you your he she it they them their this that these those there here " +
  "not no yes if so as into than then too very just also any some all quran koran verse verses surah say says said allowed permitted forbidden").split(" "));

const WORD_RE = /[\p{L}\p{N}_']+/gu;
const REF_RE = /^\s*(\d{1,3})\s*[:/.\s]\s*(\d{1,3})\s*$/;
const NAMED_REF_RE = /^\s*([^\d:]+?)\s*[:\s]\s*(\d{1,3})\s*$/;

function matches(term, word) {
  if (word.length < 3) return term === word;
  return term.startsWith(word) || (term.length >= 4 && word.startsWith(term));
}

export class Engine {
  constructor(core, index) {
    this.core = core;
    this.surahs = core.surahs;                 // [{no, name, count}]
    this.refs = core.refs;                     // [[sure, ayet], ...]
    this.sources = core.sources;               // [{id, name, role, version, credit}]
    this.meals = this.sources.filter((s) => s.role === "meal").map((s) => s.id);
    this.tefsirs = this.sources.filter((s) => s.role === "tefsir").map((s) => s.id);
    this.pos = new Map(this.refs.map((r, i) => [r[0] * 1000 + r[1], i]));
    this.vocab = index.vocab;
    this.postings = index.postings;
    this.tidOrder = index.tids;                // kaynak sırası (dizin kodları için)
    this.surahLookup = this.surahs.map((s) => [fold(s.name).replace(/[\s-]/g, ""), s.no]);
  }

  // ---------- İngilizce kip (dil English): telifsiz İngilizce mealler + kendi kelime dizini ----------
  // en: data/en.json · kavram: data/en-kavram.js'deki İngilizce tetikleyiciler (anahtar → {label, triggers, keywords, note})
  ingilizce(en, kavram) {
    this.lang = "en";
    this.core.meta = { ...this.core.meta, arabic_credit: "Arabic text: Tanzil.net (CC BY 3.0) — http://tanzil.net" };
    for (const s of en.sources) { this.sources.push(s); this.core.texts[s.id] = en.texts[s.id]; this.core.footnotes[s.id] = {}; }
    this.meals = en.sources.map((s) => s.id);
    this.surahs = this.core.surahs.map((s, i) => ({ ...s, name: en.surahs[i].name, en: en.surahs[i].en }));
    // dil.js: sure adları özel ad sayılır ("Kaldığın yerden devam · Al-Faatiha 1" kalıbı çevrilsin)
    const ozel = en.surahs.map((x) => x.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).concat(Object.values(kavram).map((k) => k.label.replace(/[()]/g, "\\$&")));
    window.DIL_OZEL = new RegExp("^(" + ozel.join("|") + ")( \\d+(:\\d+)?)?$");
    this.surahLookup = this.surahs.map((s) => [fold(s.name).replace(/[\s-]/g, ""), s.no]).concat(this.core.surahs.map((s) => [fold(s.name).replace(/[\s-]/g, ""), s.no]));
    // kelime dizini: sıralı kelime listesi + her kelimenin geçtiği (ayet << 3 | kaynak) kodları
    const harita = new Map();
    this.meals.forEach((t, k) => en.texts[t].forEach((metin, i) => {
      for (const w of new Set(tokens(metin))) { if (!harita.has(w)) harita.set(w, []); harita.get(w).push((i << 3) | k); }
    }));
    this.vocab = [...harita.keys()].sort();
    this.postings = this.vocab.map((w) => harita.get(w));
    this.tidOrder = [...this.meals];
    this.tefsirs = [];
    this.core.concepts = this.core.concepts.filter((c) => kavram[c.key]).map((c) => ({ ...c, ...kavram[c.key], modern: [] }));
  }

  // ---------- yardımcılar ----------
  source(tid) { return this.sources.find((s) => s.id === tid); }
  surahName(no) { return this.surahs[no - 1].name; }
  indexOf(surah, ayah) { return this.pos.get(surah * 1000 + ayah); }

  credits(tids) {
    const out = tids.map((t) => this.source(t)).filter(Boolean).map((s) => s.credit);
    if (this.core.meta.arabic_credit) out.push(this.core.meta.arabic_credit);
    return out;
  }

  verse(i, tids) {
    if (i === undefined || i < 0 || i >= this.refs.length) return null;
    const [surah, ayah] = this.refs[i];
    const want = (tids && tids.length ? tids : this.meals).filter((t) => this.meals.includes(t));
    const texts = {}, footnotes = {}, tafsir = {};
    for (const t of want) {
      texts[t] = this.core.texts[t][i];
      const fn = this.core.footnotes[t][String(i)];
      if (fn) footnotes[t] = fn;
    }
    for (const t of this.tefsirs) tafsir[t] = this.core.texts[t][i];
    return { index: i, surah, ayah, surahName: this.surahName(surah), ref: `${surah}:${ayah}`,
      title: `${this.surahName(surah)} ${surah}:${ayah}`, arabic: this.core.arabic[i],
      texts, footnotes, tafsir, score: 0, matched: [], anchorOf: [] };
  }

  parseRef(text) {
    let m = REF_RE.exec(text);
    if (m) return [Number(m[1]), Number(m[2])];
    m = NAMED_REF_RE.exec(text);
    if (m) {
      const key = fold(m[1]).replace(/[\s-]/g, "");
      for (const [name, no] of this.surahLookup) {
        if (name === key || (key.length >= 3 && name.startsWith(key))) return [no, Number(m[2])];
      }
    }
    return null;
  }

  // Sıralı kelime listesinde önek aralığı (ikili arama)
  _prefixRange(prefix) {
    let lo = 0, hi = this.vocab.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (this.vocab[mid] < prefix) lo = mid + 1; else hi = mid; }
    const start = lo;
    while (lo < this.vocab.length && this.vocab[lo].startsWith(prefix)) lo++;
    return [start, lo];
  }

  _exact(word) {
    const [s] = this._prefixRange(word);
    return this.vocab[s] === word ? [s, s + 1] : [s, s];
  }

  // Bir anahtarın geçtiği ayetler → Map(ayet_index → {n: kaç mealde, tf: tefsirde mi})
  _termHits(key) {
    const codes = new Set();
    const ranges = key.length >= 4 ? variants(key).map((v) => this._prefixRange(v)) : [this._exact(key)];
    for (const [a, b] of ranges) for (let w = a; w < b; w++) for (const c of this.postings[w]) codes.add(c);
    // Python sürümündeki ekleme sırasını koru: önce kaynak sırası, sonra ayet sırası
    const sorted = [...codes].sort((x, y) => (x & 7) - (y & 7) || (x >> 3) - (y >> 3));
    const out = new Map();
    for (const c of sorted) {
      const i = c >> 3, tid = this.tidOrder[c & 7];
      const cur = out.get(i) || { n: 0, tf: false };
      if (this.tefsirs.includes(tid)) cur.tf = true; else cur.n += 1;
      out.set(i, cur);
    }
    return out;
  }

  _detectConcepts(terms) {
    const found = [];
    for (const c of this.core.concepts) {
      const hits = (words) => terms.filter((t) => words.some((w) => matches(t, w)));
      const th = hits(c.triggers);
      const mh = [...new Set(terms.flatMap((t) => c.modern.filter((w) => matches(t, w)).map(() => t)))].sort();
      const mw = [...new Set(terms.flatMap((t) => c.modern.filter((w) => matches(t, w))))];
      if (th.length || mh.length) found.push({ key: c.key, label: c.label, keywords: c.keywords,
        anchors: c.anchors, modernHit: mh, modernWords: mw, triggerHit: th.length > 0, note: c.note || "", diyanet: c.diyanet || c.label });
    }
    return found;
  }

  // ---------- ana arama ----------
  search(query, topK = 8, tids = null) {
    const ref = this.parseRef(query);
    if (this.lang === "en" && !ref) query = query.split(/\s+/).filter((w) => !EN_STOP.has(w.toLowerCase().replace(/[^a-z']/g, ""))).join(" ");
    if (ref) {
      const v = this.verse(this.indexOf(ref[0], ref[1]), tids);
      return { query, terms: [], missing: [], missingKeys: [], concepts: [], verses: v ? [v] : [], isRef: true };
    }
    let qterms = queryTerms(query);
    const terms = qterms.map((q) => q.key);
    const originals = new Map();
    for (const m of query.matchAll(WORD_RE)) {
      for (const tok of tokens(m[0])) {
        const k = termKey(tok);
        if (!originals.has(k)) originals.set(k, m[0].replace(/^['’]+|['’]+$/g, ""));
      }
    }
    const concepts = this._detectConcepts(terms);
    // Kur'an'da geçmeyen modern bir şey soruluyorsa (oje, sigara, dövme…) sorudaki diğer
    // fiiller ("içmek", "yaptırmak", "engel") yalnızca soru biçimidir: konuya ait olmayan
    // kelimeler zayıf sayılır
    if (concepts.some((c) => c.modernHit.length)) {
      const keys = new Set(concepts.map((c) => c.key));
      const topic = this.core.concepts.filter((c) => keys.has(c.key)).flatMap((c) => [...c.triggers, ...c.modern, ...c.keywords]);
      qterms = qterms.map((q) => ({ key: q.key, weak: q.weak || !topic.some((w) => matches(q.key, w)) }));
    }
    const scores = new Map();
    const matched = new Map();
    const missing = [];
    const missingKeys = [];
    const support = new Set(); // güçlü kelime, kavram kelimesi veya temel ayetle gelenler
    const ckHits = new Map();  // ayette geçen farklı kavram kelimeleri

    const weighted = qterms.map((q) => [q.key, q.weak ? WEAK_WEIGHT : QUERY_WEIGHT]);
    for (const c of concepts) for (const k of c.keywords) if (!terms.includes(k)) weighted.push([k, CONCEPT_WEIGHT]);

    const nTr = Math.max(this.meals.length, 1);
    const N = this.refs.length;
    for (const [term, w] of weighted) {
      const hits = this._termHits(term);
      if (!hits.size) {
        if (w === QUERY_WEIGHT) { missing.push(originals.get(term) || term); missingKeys.push(term); }
        continue;
      }
      const idf = Math.log(1 + N / hits.size);
      for (const [i, { n, tf }] of hits) {
        let part = n ? 0.5 + 0.5 * n / nTr : 0;
        if (tf) part += n ? 0.25 : 0.3;
        scores.set(i, (scores.get(i) || 0) + w * idf * part);
        if (w === QUERY_WEIGHT) support.add(i);
        else if (w === CONCEPT_WEIGHT) { if (!ckHits.has(i)) ckHits.set(i, new Set()); ckHits.get(i).add(term); }
        if (w === QUERY_WEIGHT && n) {
          if (!matched.has(i)) matched.set(i, new Set());
          matched.get(i).add(term);
        }
      }
    }
    for (const [i, ms] of matched) if (ms.size > 1) scores.set(i, scores.get(i) * (1 + 0.35 * (ms.size - 1)));

    const anchorOf = new Map();
    const topBase = scores.size ? Math.max(...scores.values()) : 1.0;
    for (const c of concepts) {
      for (const a of c.anchors) {
        const [s, y] = a.split(":").map(Number);
        const i = this.indexOf(s, y);
        if (i === undefined) continue;
        if (!anchorOf.has(i)) anchorOf.set(i, []);
        anchorOf.get(i).push(c.label);
        scores.set(i, (scores.get(i) || 0) + ANCHOR_BONUS * topBase);
        support.add(i);
      }
    }
    // Kavram kelimelerinden tek biri ("ayak", "ay") yetmez; en az üçü birlikte geçmeli
    for (const [i, ws] of ckHits) if (ws.size >= 3) support.add(i);
    // Yalnızca zayıf kelimelerle ("almak", "kabul", "bozar"…) gelen ayetler gürültüdür;
    // yeterince güçlü sonuç varsa bunları ele
    if ([...scores.keys()].filter((i) => support.has(i)).length >= 3) {
      for (const i of [...scores.keys()]) if (!support.has(i)) scores.delete(i);
    }

    const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
    const chosen = ranked.slice(0, topK).map(([i]) => i);
    for (const i of anchorOf.keys()) if (!chosen.includes(i) && chosen.length < topK + 4) chosen.push(i);

    const verses = chosen.map((i) => {
      const v = this.verse(i, tids);
      v.score = Math.round(scores.get(i) * 1000) / 1000;
      v.matched = [...(matched.get(i) || [])].sort();
      v.anchorOf = anchorOf.get(i) || [];
      return v;
    });
    verses.sort((a, b) => b.score - a.score || a.surah - b.surah || a.ayah - b.ayah);
    return { query, terms, missing, missingKeys, concepts, verses, isRef: false };
  }
}

// Metinde sorgu köküyle başlayan kelimelerin [başlangıç, bitiş] konumları
export function highlightSpans(text, terms) {
  const spans = [];
  if (!terms.length) return spans;
  for (const m of text.matchAll(WORD_RE)) {
    for (const tok of tokens(m[0])) {
      if (terms.some((t) => (t.length >= 4 ? tok.startsWith(t) : tok === t))) {
        spans.push([m.index, m.index + m[0].length]);
        break;
      }
    }
  }
  return spans;
}
