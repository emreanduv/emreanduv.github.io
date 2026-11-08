#!/usr/bin/env python3
"""Champion Battle Manager · açık kaynak maç verisi (ortak modül).

Kaynaklar (hepsi serbest lisanslı; ticari kullanıma açık):
  - openfootball/football.json  → Premier League, LaLiga, Serie A, Bundesliga, Ligue 1 fikstür ve sonuçları (KAMU MALI, "use as you please")
  - Vikipedi (tr) "Şablon:<sezon> Süper Lig maçları/maçlar" → Süper Lig fikstür ve sonuçları (CC BY-SA; yalnız olgu: tarih, eşleşme, skor)
  - Vikipedi (en) "<sezon> UEFA ... league phase" → Avrupa kupaları lig aşaması (CC BY-SA; yalnız olgu)
  - Wikidata → kulüp kimliği (QID), şehir, renk (CC0)
Maç sonuçları ve fikstürler olgudur; AB'de fikstür listeleri telif ya da veritabanı hakkıyla korunmaz
(ABAD C-604/10 Football Dataco v Yahoo, 2012). Oyuna gerçek kulüp/lig adı gitmez: kulüpler Wikidata kimliğinin
özetiyle (anahtar) anılır, oyun kendi türetilmiş adlarını gösterir.
Yalnız Python standart kitaplığı."""
import json, os, re, time, urllib.request, urllib.parse
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

UA = {"User-Agent": "MrAnduv-ChampionBattleManager/1.0 (+https://emreanduv.github.io; acik veri)"}
KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
ONBELLEK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "onbellek_kulup.json")   # ad → Wikidata QID (yalnız araç önbelleği)

LIGLER = {
    "tr": {"wiki": "Süper Lig", "ad": "Anadolu Ligi", "ulke": "Türkiye", "ulkeQ": "Q43", "hafta": 34, "tz": "Europe/Istanbul", "kaynak": "trwiki"},
    "en": {"wiki": "Premier League", "ad": "Ada Ligi", "ulke": "İngiltere", "ulkeQ": "Q145", "hafta": 38, "tz": "Europe/London", "fj": "en.1"},
    "es": {"wiki": "La Liga", "ad": "İber Ligi", "ulke": "İspanya", "ulkeQ": "Q29", "hafta": 38, "tz": "Europe/Madrid", "fj": "es.1"},
    "it": {"wiki": "Serie A", "ad": "Çizme Ligi", "ulke": "İtalya", "ulkeQ": "Q38", "hafta": 38, "tz": "Europe/Rome", "fj": "it.1"},
    "de": {"wiki": "Bundesliga", "ad": "Ren Ligi", "ulke": "Almanya", "ulkeQ": "Q183", "hafta": 34, "tz": "Europe/Berlin", "fj": "de.1"},
    "fr": {"wiki": "Ligue 1", "ad": "Galya Ligi", "ulke": "Fransa", "ulkeQ": "Q142", "hafta": 34, "tz": "Europe/Paris", "fj": "fr.1"},
    # Amerika kıtası (1. aşama). takvim "yil": sezon takvim yılıyla oynanır (openfootball klasörü "2026"); gercek False: Challenge'a girmez
    "br": {"wiki": "Campeonato Brasileiro Série A", "ad": "Amazon Ligi", "ulke": "Brezilya", "ulkeQ": "Q155", "hafta": 38, "tz": "America/Sao_Paulo", "fj": "br.1", "takvim": "yil", "dil": "pt", "gercek": False},
    "ar": {"wiki": "Argentine Primera División", "ad": "Pampa Ligi", "ulke": "Arjantin", "ulkeQ": "Q414", "hafta": 30, "tz": "America/Argentina/Buenos_Aires", "fj": "ar.1", "takvim": "yil", "dil": "es", "gercek": False},
    "co": {"wiki": "Categoría Primera A", "ad": "And Ligi", "ulke": "Kolombiya", "ulkeQ": "Q739", "hafta": 38, "tz": "America/Bogota", "fj": "co.1", "takvim": "yil", "dil": "es", "gercek": False},
    "us": {"wiki": "Major League Soccer", "ad": "Yeni Dünya Ligi", "ulke": "ABD", "ulkeQ": "Q30", "hafta": 34, "tz": "America/New_York", "fj": "mls", "takvim": "yil", "dil": "en", "gercek": False},
    "mx": {"wiki": "Liga MX", "ad": "Aztek Ligi", "ulke": "Meksika", "ulkeQ": "Q96", "hafta": 34, "tz": "America/Mexico_City", "kaynak": "wd", "dil": "es", "gercek": False},
}
_stat = {"istek": 0}


def http(url, json_mu=True, deneme=4):
    for i in range(deneme):
        try:
            _stat["istek"] += 1
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                b = r.read()
                return json.loads(b) if json_mu else b.decode("utf-8")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            print(f"::warning::{url[:100]}… HTTP {e.code}")
        except Exception as e:
            print(f"::warning::{url[:100]}… {e}")
        time.sleep(4 * (i + 1))
    return None


def fnv(s):
    """Oyundaki rng.js hash() ile aynı (FNV-1a, UTF-16)."""
    h = 2166136261
    b = s.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def anahtar(qid):
    """Kulübün oyundaki anahtarı: Wikidata kimliğinin özeti (gerçek ad yok)."""
    return fnv(qid) if qid else None


def sezon_adi(simdi=None):
    simdi = simdi or datetime.now(timezone.utc)
    y = simdi.year if simdi.month >= 7 else simdi.year - 1
    return f"{y}-{y + 1}"


def utc(tarih, saat, tz):
    """Yerel tarih + saat → UTC ISO (saat yoksa 17:00 yerel)."""
    try:
        y, a, g = (int(x) for x in tarih.split("-"))
        hh, mm = (int(x) for x in (saat or "17:00").replace(".", ":").split(":")[:2])
        d = datetime(y, a, g, hh, mm, tzinfo=ZoneInfo(tz)).astimezone(timezone.utc)
        return d.strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return None


def wikitext(host, baslik):
    d = http(f"https://{host}/w/api.php?" + urllib.parse.urlencode({"action": "parse", "page": baslik, "prop": "wikitext", "format": "json", "redirects": 1}))
    time.sleep(0.5)
    return ((d or {}).get("parse", {}).get("wikitext", {}) or {}).get("*", "")


def link_hedef(s):
    """'[[Galatasaray (futbol takımı)|Galatasaray]] {{fbaicon|GRE}}' → 'Galatasaray (futbol takımı)'"""
    m = re.search(r"\[\[([^\]|#]+)", s or "")
    return m.group(1).strip() if m else None


def sablon_alanlari(govde):
    """'|alan = değer' satırlarını sözlüğe çevirir (iç içe {{...}} ve [[...]] korunur)."""
    out, derin, kume, parca = {}, 0, [], ""
    i = 0
    while i < len(govde):
        c2 = govde[i:i + 2]
        if c2 in ("{{", "[["):
            derin += 1; parca += c2; i += 2; continue
        if c2 in ("}}", "]]"):
            derin -= 1; parca += c2; i += 2; continue
        if govde[i] == "|" and derin == 0:
            kume.append(parca); parca = ""; i += 1; continue
        parca += govde[i]; i += 1
    kume.append(parca)
    for p in kume:
        if "=" in p:
            k, v = p.split("=", 1)
            out[k.strip().lower()] = v.strip()
    return out


def sablonlar(metin, adlar):
    """metindeki {{ad ...}} şablonlarını (iç içe ayraçlara dikkat ederek) döndürür: (başlangıç, gövde).
    Not: metin.lower() kullanılmaz; Türkçe 'İ'.lower() iki karakter olur ve konumları kaydırır."""
    gor = set()
    for ad in adlar:
        for mt in re.finditer(r"\{\{\s*" + re.escape(ad).replace("\\ ", r"[ _]"), metin, re.I):
            i = mt.start()
            if i in gor:
                continue
            gor.add(i)
            d, j = 0, i
            while j < len(metin):
                if metin.startswith("{{", j):
                    d += 1; j += 2; continue
                if metin.startswith("}}", j):
                    d -= 1; j += 2
                    if d == 0:
                        break
                    continue
                j += 1
            yield i, metin[i + 2:j - 2]


def skor(s):
    m = re.search(r"(\d+)\s*[-–—]\s*(\d+)", re.sub(r"\[\[[^\]|]*\|", "", s or ""))
    return [int(m.group(1)), int(m.group(2))] if m else None


# ---------------- kulüp kimliği (Wikidata) ----------------
_onb = None


def onbellek():
    global _onb
    if _onb is None:
        try:
            _onb = json.load(open(ONBELLEK, encoding="utf-8"))
        except Exception:
            _onb = {}
    return _onb


def onbellek_yaz():
    if _onb is not None:
        json.dump(_onb, open(ONBELLEK, "w", encoding="utf-8"), ensure_ascii=False, indent=0, sort_keys=True)


def sparql(q):
    d = http("https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(q))
    time.sleep(1.0)
    return d["results"]["bindings"] if d else []


def qid_baslik(basliklar, site):
    """Vikipedi başlıkları → Wikidata QID (toplu)."""
    o = onbellek(); out, sor = {}, []
    for b in basliklar:
        k = f"{site}:{b}"
        if k in o: out[b] = o[k]
        else: sor.append(b)
    for i in range(0, len(sor), 45):
        parca = sor[i:i + 45]
        d = http("https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "wbgetentities", "sites": site, "titles": "|".join(parca), "props": "sitelinks", "sitefilter": site, "redirects": "yes", "format": "json"}))
        for q, e in ((d or {}).get("entities") or {}).items():
            if q.startswith("Q"):
                t = ((e.get("sitelinks") or {}).get(site) or {}).get("title")
                for b in parca:
                    if t and (b == t or b.replace("_", " ") == t):
                        out[b] = q; o[f"{site}:{b}"] = q
        # yönlendirmeli başlıklar için tek tek dene
        for b in parca:
            if b in out:
                continue
            d = http("https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "wbgetentities", "sites": site, "titles": b, "props": "info", "redirects": "yes", "format": "json"}))
            q = next((k for k in ((d or {}).get("entities") or {}) if k.startswith("Q")), None)
            if q:
                out[b] = q; o[f"{site}:{b}"] = q
    return out


def sade(ad):
    import unicodedata
    a = unicodedata.normalize("NFKD", ad or "").encode("ascii", "ignore").decode().lower().replace(".", "")
    a = re.sub(r"\(.*?\)", " ", a)
    a = re.sub(r"\b(fc|cf|afc|sc|ac|as|ss|ssc|us|fk|sk|ogc|rc|stade|olympique|1\.|vfb|vfl|tsg|rcd|cd|ud|ca|sd|club|football|de|calcio|association|sportive)\b", " ", a)
    return " ".join(re.sub(r"[^a-z0-9 ]", " ", a).split())


ULKE_EK = {"Q142": ["Q235"], "Q30": ["Q16"]}   # Fransa ligi: Monaco; MLS: Kanada kulüpleri


def qid_ad(ad, ulkeQ, dil="en"):
    """Kulüp adı (ör. 'Manchester City FC') → QID: Wikidata araması + futbol kulübü ve ülke süzgeci.
    Etiketi adla birebir örtüşen aday önce gelir (Paris FC ≠ Paris Saint-Germain)."""
    o = onbellek(); k = f"ad:{ulkeQ}:{ad}"
    if k in o:
        return o[k]
    ids = []
    yalin = re.sub(r"\b(FC|CF|AFC|SC|AC|SS|SSC|US|1\. FC|FK|SK)\b\.?", "", ad).strip()
    for arama, lg in [(ad, "en"), (yalin, "en"), (ad, dil), (re.sub(r"\s*\d+$", "", ad).strip(), "en")]:
        d = http("https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "wbsearchentities", "search": arama, "language": lg, "uselang": lg, "type": "item", "limit": 10, "format": "json"}))
        ids += [x["id"] for x in (d or {}).get("search", []) if x["id"] not in ids]
    q = None
    for tur in range(2):
        if tur == 1:                                                 # bulunamadı: tam metin arama, yalnız bu ülkenin futbol kulüpleri
            if q: break
            ids = []
            for arama in dict.fromkeys([yalin, re.sub(r"\s+\S{1,3}$", "", yalin), yalin.split(" de ")[0]]):
                d = http("https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "list": "search", "srlimit": 10, "format": "json",
                         "srsearch": f"{arama} haswbstatement:P31=Q476028 haswbstatement:P17={ulkeQ}"}))
                ids += [x["title"] for x in ((d or {}).get("query") or {}).get("search", []) if x["title"].startswith("Q") and x["title"] not in ids]
                if ids: break
            if not ids: break
        if not ids: continue
        vals = " ".join("wd:" + i for i in ids)
        ulkeler = " ".join("wd:" + u for u in [ulkeQ] + ULKE_EK.get(ulkeQ, []))
        r = sparql(f"""SELECT ?c ?n (GROUP_CONCAT(DISTINCT ?l; separator="|") AS ?ls) WHERE {{ VALUES ?c {{ {vals} }} ?c wdt:P31/wdt:P279* wd:Q476028 . ?c wikibase:sitelinks ?n .
                  OPTIONAL {{ ?c wdt:P17 ?u }} FILTER(!BOUND(?u) || ?u IN ({ulkeler.replace(' ', ', ')}))
                  OPTIONAL {{ ?c rdfs:label|skos:altLabel ?l . FILTER(LANG(?l) IN ("en", "{dil}")) }} }} GROUP BY ?c ?n ORDER BY DESC(?n)""")
        def ham(t):
            return " ".join(re.sub(r"[^a-z0-9 ]", " ", (t or "").lower().replace(".", "")).split())
        etik = lambda x: (x.get("ls", {}).get("value") or "").split("|")
        birebir = [x for x in r if ham(ad) in {ham(l) for l in etik(x)}]
        tam = [x for x in r if sade(ad) in {sade(l) for l in etik(x)}]
        sec = (birebir or tam or r)
        q = sec[0]["c"]["value"].rsplit("/", 1)[1] if sec else None
    if q:
        o[k] = q
    return q


# ---------------- lig maçları ----------------
def fj_maclari(kod, sezon):
    L = LIGLER[kod]
    if L.get("takvim") == "yil":                                     # takvim yılı ligleri: "2026", yoksa bir önceki yıl
        y = int(sezon[:4]); d = None
        for k in (str(y), str(y - 1)):
            d = http(f"https://raw.githubusercontent.com/openfootball/football.json/master/{k}/{L['fj']}.json")
            if d and d.get("matches"):
                print(f"::notice::{kod}: openfootball {k}"); break
    else:
        d = http(f"https://raw.githubusercontent.com/openfootball/football.json/master/{sezon}/{L['fj']}.json")
    if not d:
        return None
    out = []
    for m in d.get("matches", []):
        h = re.search(r"(\d+)", m.get("round", "") or "")
        sc = m.get("score")
        s = sc if isinstance(sc, list) else (sc or {}).get("ft")
        out.append({"hafta": int(h.group(1)) if h else None, "zaman": utc(m.get("date"), m.get("time"), L["tz"]), "ev": m.get("team1"), "dep": m.get("team2"),
                    "s": [int(s[0]), int(s[1])] if s and len(s) == 2 else None})
    return out


def trwiki_maclari(sezon):
    w = wikitext("tr.wikipedia.org", f"Şablon:{sezon} Süper Lig maçları/maçlar")
    if not w:
        return None
    out = []
    for _, govde in sablonlar(w, ["Kapanabilir futbol maçı kutusu"]):
        a = sablon_alanlari(govde)
        t = re.search(r"(\d{4})\|(\d{1,2})\|(\d{1,2})", a.get("tarih", ""))
        tarih = f"{t.group(1)}-{int(t.group(2)):02d}-{int(t.group(3)):02d}" if t else None
        saat = re.search(r"(\d{1,2})[.:](\d{2})", a.get("zaman", ""))
        hafta = re.search(r"(\d+)", a.get("tur", ""))
        out.append({"hafta": int(hafta.group(1)) if hafta else None, "zaman": utc(tarih, f"{saat.group(1)}:{saat.group(2)}" if saat else None, "Europe/Istanbul") if tarih else None,
                    "ev": link_hedef(a.get("takım1")), "dep": link_hedef(a.get("takım2")), "s": skor(a.get("sonuç")), "site": "trwiki"})
    return out


def wiki_matris(kod, sezon):
    """en.wikipedia sonuç matrisi: {(ev başlık, dep başlık): [a, b]}.
    Matris ya sezon maddesinde (Module:Sports results) ya da "<sezon> <lig> table" şablonunda (Module:Sports table, match_ alanları) durur."""
    L = LIGLER[kod]
    kisa = f"{sezon[:4]}–{sezon[-2:]}"
    out = {}
    for baslik in [f"{kisa} {L['wiki']}", f"Template:{kisa} {L['wiki']} table"]:
        w = wikitext("en.wikipedia.org", baslik)
        if not w:
            continue
        for _, govde in sablonlar(w, ["#invoke:sports results", "#invoke:sports table"]):
            a = sablon_alanlari(govde)
            ad = {}
            for k, v in a.items():
                if k.startswith("name_"):
                    ad[k[5:].upper()] = link_hedef(v) or v
            for k, v in a.items():
                if k.startswith("match_"):
                    p = k[6:].upper().split("_")
                    if len(p) == 2 and p[0] in ad and p[1] in ad and skor(v):
                        out[(ad[p[0]], ad[p[1]])] = skor(v)
    return out


def wiki_takimlar(kod, sezon):
    """Sezon maddesindeki puan tablolarından (Module:Sports table / results, name_ alanları) kulüp başlıkları → {başlık: qid}.
    Maddenin içine aldığı "... table" şablonları da okunur (Liga MX gibi Apertura/Clausura ayrı tabloda)."""
    L = LIGLER[kod]
    y = int(sezon[:4])
    for kisa in [f"{y}–{str(y + 1)[-2:]}", f"{y - 1}–{str(y)[-2:]}"]:
        basliklar, bak = [], [f"{kisa} {L['wiki']} season", f"{kisa} {L['wiki']}", f"Template:{kisa} {L['wiki']} table"]
        gorulen = set()
        while bak and len(gorulen) < 8:
            b = bak.pop(0)
            if b in gorulen: continue
            gorulen.add(b)
            w = wikitext("en.wikipedia.org", b)
            if not w: continue
            for _, govde in sablonlar(w, ["#invoke:sports results", "#invoke:sports table"]):
                for k, v in sablon_alanlari(govde).items():
                    if k.startswith("name_"):
                        t = link_hedef(v)
                        if t and t not in basliklar: basliklar.append(t)
            for m in re.finditer(r"\{\{\s*(" + re.escape(kisa) + r" " + re.escape(L["wiki"]) + r"[^}|]*?table)\s*[}|]", w):
                bak.append("Template:" + m.group(1).strip())
        if 12 <= len(basliklar) <= 24:
            q = qid_baslik(basliklar, "enwiki")
            if len(q) >= 12:
                print(f"::notice::{kod}: Vikipedi tablosundan {len(q)} kulüp ({kisa})")
                return {t: q[t] for t in basliklar if t in q}
        elif basliklar:
            print(f"::notice::{kod}: {kisa} tablolarında {len(basliklar)} kulüp, atlandı")
    return {}


def wd_lig_kulupleri(kod):
    """Fikstür kaynağı olmayan lig: kulüp listesi Wikidata'dan (P118 lig = bu lig, bitiş tarihi yok, futbol kulübü). → {etiket: qid}"""
    L = LIGLER[kod]
    d = http("https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "wbsearchentities", "search": L["wiki"], "language": "en", "type": "item", "limit": 8, "format": "json"}))
    adaylar = [x["id"] for x in (d or {}).get("search", [])]
    for lq in adaylar:
        r = sparql(f"""SELECT ?c ?l ?n WHERE {{ ?c p:P118 ?st . ?st ps:P118 wd:{lq} . FILTER NOT EXISTS {{ ?st pq:P582 ?bit }}
                     ?c wdt:P31/wdt:P279* wd:Q476028 ; wdt:P17 wd:{L['ulkeQ']} ; wikibase:sitelinks ?n . FILTER NOT EXISTS {{ ?c wdt:P576 ?kap }}
                     ?c rdfs:label ?l . FILTER(LANG(?l) = "en") }} ORDER BY DESC(?n)""")
        q = {}
        for x in r:
            c = x["c"]["value"].rsplit("/", 1)[1]
            if c not in q.values(): q[x["l"]["value"]] = c
        if 12 <= len(q) <= 24:
            print(f"::notice::{kod}: Wikidata kulüp listesi {len(q)} ({lq})"); return q
        if q: print(f"::notice::{kod}: {lq} için {len(q)} kulüp, atlandı")
    return {}


def lig_maclari(kod, sezon):
    """Lig maçları, kulüpler Wikidata anahtarıyla: [{id, hafta, zaman, evk, depk, s, durum}], adlar → qid"""
    L = LIGLER[kod]
    if L.get("kaynak") == "wd":                                      # fikstür yok: yalnız kulüpler (oyun fikstürü kendi üretir)
        q = wiki_takimlar(kod, sezon) or wd_lig_kulupleri(kod)
        return [{"id": f"{kod}0-{anahtar(v)}", "hafta": None, "zaman": None, "evk": anahtar(v), "depk": anahtar(v), "s": None, "durum": "yok"} for v in q.values()], q
    kisa = f"{sezon[:4]}-{sezon[-2:]}"                                  # "2026-2027" → "2026-27"
    ham = trwiki_maclari(kisa) if L.get("kaynak") == "trwiki" else fj_maclari(kod, sezon if L.get("takvim") == "yil" else kisa)
    if not ham:
        return None, {}
    adlar = sorted({m["ev"] for m in ham if m["ev"]} | {m["dep"] for m in ham if m["dep"]})
    if L.get("kaynak") == "trwiki":
        q = qid_baslik(adlar, "trwiki")
    else:
        q = {a: qid_ad(a, L["ulkeQ"], L.get("dil", kod)) for a in adlar}
    # openfootball ve trwiki şablonu gönüllülerce elle güncellenir, geride kalabilir; eksik skorları en.wiki sonuç matrisinden tamamla
    if L.get("takvim") != "yil":                                     # takvim yılı liglerinde sonuç matrisi başlığı farklı; sıralama için openfootball yeter
        try:
            mat = wiki_matris(kod, sezon)
            if mat:
                mq = qid_baslik(sorted({x for k in mat for x in k}), "enwiki")
                # adı Wikidata aramasında bulunamayan kulüpleri, sonuç matrisindeki madde başlıklarıyla eşle
                hedef = {sade(t): qq for t, qq in mq.items() if qq}
                bilinen = {v for v in q.values() if v}
                for a in adlar:
                    if q.get(a) and q[a] in set(mq.values()):
                        continue
                    sa = sade(a)
                    aday = [qq for t, qq in hedef.items() if qq not in bilinen and t and sa and (t == sa or t in sa or sa in t)]
                    if len(set(aday)) == 1:
                        q[a] = aday[0]; bilinen.add(aday[0]); onbellek()[f"ad:{L['ulkeQ']}:{a}"] = aday[0]
                skor_q = {(mq.get(a), mq.get(b)): s for (a, b), s in mat.items() if mq.get(a) and mq.get(b)}
                for m in ham:
                    x = skor_q.get((q.get(m["ev"]), q.get(m["dep"])))
                    if x:
                        m["s"] = x
        except Exception as e:
            print(f"::warning::{kod}: Vikipedi sonuç matrisi okunamadı: {e}")
    onbellek_yaz()
    from collections import Counter
    for qq, n in Counter(v for v in q.values() if v).items():
        if n > 1:
            print(f"::warning::{kod}: {n} kulüp aynı kimliğe eşlendi ({qq})")
    eksik = [a for a in adlar if not q.get(a)]
    if eksik:
        print(f"::warning::{kod}: kimliği bulunamayan {len(eksik)} kulüp: {', '.join(eksik)}")
    simdi = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    out = []
    for m in ham:
        evk, depk = anahtar(q.get(m["ev"])), anahtar(q.get(m["dep"]))
        if not evk or not depk:
            continue
        durum = "bitti" if m["s"] else ("oynanacak" if (m["zaman"] or "9") > simdi else "ertelendi")
        out.append({"id": f"{kod}{m['hafta'] or 0}-{evk}-{depk}", "hafta": m["hafta"], "zaman": m["zaman"], "evk": evk, "depk": depk, "s": m["s"], "durum": durum})
    return out, q
