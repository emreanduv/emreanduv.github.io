#!/usr/bin/env python3
"""Champion Battle Manager · türetilmiş dünya verisi.

Gerçek 6 ligin (Süper Lig, Premier Lig, LaLiga, Serie A, Bundesliga, Ligue 1) güncel kulüp ve kadrolarını
açık kaynaktan (Wikidata, CC0) okur; Winning Eleven usulü TÜRETİLMİŞ bir dünya yazar:
  - oyuncu adları çağrıştıran ama farklı (Lukaku → Lakaka), kulüp adları şehir + renk (Londra Kırmızı-Beyaz)
  - yaş, uyruk, mevki, boy ve "ünlülük" (Wikipedia dil sayısı) gibi olgular; yetenek puanlarını oyun kendisi hesaplar
Gerçek isimler depoya YAZILMAZ; çıktıda yalnız türetilmiş isimler bulunur.
Kulüp listesi: veri/gercek-dunya/v1/ligler.json (bu sezonun takımları).
Çıktı: veri/cbm/v1/dunya.json
Yalnız Python standart kitaplığı."""
import json, os, sys, time, math, urllib.request, urllib.parse, datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from isim_turet import turet, sozcuk
from fifa_kod import FIFA
import re

KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "veri")
GD = os.path.join(KOK, "gercek-dunya", "v1", "ligler.json")
CIKTI = os.path.join(KOK, "cbm", "v1", "dunya.json")
UA = {"User-Agent": "MrAnduv-ChampionBattleManager/1.0 (+https://emreanduv.github.io)"}

LIG = {  # kod: (oyundaki ad, ülke, wikidata ülke)
    "tr": ("Anadolu Ligi", "Türkiye", "Q43"), "en": ("Ada Ligi", "İngiltere", "Q145"), "es": ("İber Ligi", "İspanya", "Q29"),
    "it": ("Çizme Ligi", "İtalya", "Q38"), "de": ("Ren Ligi", "Almanya", "Q183"), "fr": ("Galya Ligi", "Fransa", "Q142"),
}
# Kaptan Mecit'ten bilinen kulüpler (aynı kod, aynı ad ve renk korunur). Anahtar: TheSportsDB takım adı.
KM = {
    "tr": {"Galatasaray": "gs", "Fenerbahçe": "fb", "Beşiktaş": "bjk", "Trabzonspor": "ts", "İstanbul Başakşehir": "ibfk", "Konyaspor": "kon",
           "Alanyaspor": "aly", "Kasımpaşa": "ksp", "Gaziantep": "gfk", "Samsunspor": "sam", "Rizespor": "riz", "Göztepe": "goz", "Eyüpspor": "eyp"},
    "en": {"Manchester City": "mnm", "Liverpool": "lvk", "Arsenal": "lkb", "Chelsea": "lnm", "Manchester United": "mnk", "Tottenham Hotspur": "llb",
           "Newcastle United": "nsb", "Aston Villa": "bbm", "Brighton and Hove Albion": "bmb", "Everton": "lvm", "Nottingham Forest": "ntk",
           "Crystal Palace": "lkm", "Bournemouth": "bks", "Brentford": "lar", "Fulham": "lsb", "Leeds United": "ldb", "Ipswich Town": "ipm"},
    "es": {"Real Madrid": "mdb", "Barcelona": "bbm", "Atlético Madrid": "mkb", "Athletic Bilbao": "bkb", "Real Sociedad": "ssm", "Villarreal": "vsr",
           "Sevilla": "sev", "Real Betis": "syb", "Valencia": "vbs", "Celta Vigo": "vgm", "Osasuna": "pkl", "Getafe": "gtm", "Rayo Vallecano": "vks",
           "Deportivo Alavés": "vtm", "Espanyol": "bmb", "Levante": "vbm", "Elche": "eyb"},
    "it": {"Inter Milan": "msm", "Juventus": "tsb", "AC Milan": "mks", "Napoli": "npm", "Roma": "rsk", "Lazio": "rgm", "Atalanta": "bsm",
           "Fiorentina": "flm", "Bologna": "bkl", "Torino": "tbo", "Udinese": "ubs", "Genoa": "ckm", "Como": "cmv", "Sassuolo": "sys",
           "Cagliari": "skm", "Lecce": "lsk", "Parma": "psm"},
    "de": {"Bayern Munich": "mnk", "Borussia Dortmund": "dss", "Bayer Leverkusen": "lks", "RB Leipzig": "lpk", "Eintracht Frankfurt": "fsk",
           "Stuttgart": "sbk", "Freiburg": "fko", "Borussia Mönchengladbach": "gys", "Werder Bremen": "byb", "Mainz": "mkb", "Hoffenheim": "hfm",
           "Union Berlin": "bdm", "Augsburg": "aky", "Hamburg": "hmb", "Köln": "kkb", "Schalke 04": "gkm"},
    "fr": {"Paris Saint-Germain": "plk", "Marseille": "mbm", "Monaco": "mkb", "Lille": "lkl", "Lyon": "olm", "Nice": "nks", "Lens": "lsk",
           "Rennes": "rks", "Strasbourg": "smb", "Brest": "bkb", "Toulouse": "tmr", "Auxerre": "abm", "Angers": "asb", "Le Havre": "hgl",
           "Lorient": "lts", "Paris FC": "pgm"},
}
ELLE = {}  # gerekirse: "TheSportsDB adı": "Wikidata Q kimliği"
ARAMA = {"Amed": "Amed Sportif Faaliyetler", "Çorum": "Çorum FK", "Göztepe": "Göztepe S.K.", "Valencia": "Valencia CF", "Roma": "AS Roma",
         "Stuttgart": "VfB Stuttgart", "Köln": "1. FC Köln", "Lorient": "FC Lorient", "Brest": "Stade Brestois 29", "Nice": "OGC Nice",
         "Freiburg": "SC Freiburg", "Torino": "Torino FC", "Lens": "RC Lens"}
RENK = {"red": ("Kırmızı", "#C8102E"), "white": ("Beyaz", "#F2F2F2"), "blue": ("Mavi", "#1F5FB4"), "black": ("Siyah", "#141414"),
        "yellow": ("Sarı", "#F5C400"), "green": ("Yeşil", "#0B7A3B"), "navy blue": ("Lacivert", "#0B2A6B"), "dark blue": ("Lacivert", "#0B2A6B"),
        "sky blue": ("Gök Mavi", "#6CADDF"), "light blue": ("Gök Mavi", "#6CADDF"), "claret": ("Bordo", "#7A1F3D"), "maroon": ("Bordo", "#7A1F3D"),
        "burgundy": ("Bordo", "#7A1F3D"), "orange": ("Turuncu", "#E35205"), "purple": ("Mor", "#5B2A86"), "violet": ("Mor", "#5B2A86"),
        "gold": ("Altın", "#C9A227"), "grey": ("Gri", "#8A8D91"), "gray": ("Gri", "#8A8D91"), "amber": ("Kehribar", "#F2A900"), "garnet": ("Bordo", "#7A1F3D")}

_stat = {"istek": 0}


def http(url, deneme=4):
    for i in range(deneme):
        try:
            _stat["istek"] += 1
            with urllib.request.urlopen(urllib.request.Request(url, headers={**UA, "Accept": "application/json"}), timeout=120) as r:
                return json.load(r)
        except Exception as e:
            print(f"::warning::{url[:90]}… {e}")
            time.sleep(5 * (i + 1))
    return None


def sparql(q):
    d = http("https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(q))
    time.sleep(1.2)
    return d["results"]["bindings"] if d else []


def kulup_bul(ad, ulke):
    if ad in ELLE:
        return ELLE[ad]
    ids = []
    for arama in ([ARAMA[ad]] if ad in ARAMA else []) + [ad, ad + " FK", ad + " S.K.", ad + " F.C.", ad + "spor"]:
        d = http("https://www.wikidata.org/w/api.php?" + urllib.parse.urlencode({"action": "wbsearchentities", "search": arama, "language": "en", "type": "item", "limit": 10, "format": "json"}))
        ids += [x["id"] for x in (d or {}).get("search", []) if x["id"] not in ids]
        if len(ids) >= 10:
            break
    if not ids:
        return None
    vals = " ".join("wd:" + i for i in ids)
    r = sparql(f"""SELECT ?c ?n WHERE {{ VALUES ?c {{ {vals} }} ?c wdt:P31/wdt:P279* wd:Q476028 . ?c wikibase:sitelinks ?n .
              OPTIONAL {{ ?c wdt:P17 ?u }} FILTER(!BOUND(?u) || ?u = wd:{ulke} || ?u = wd:Q235) }} ORDER BY DESC(?n)""")
    return r[0]["c"]["value"].rsplit("/", 1)[1] if r else None


def kulup_bilgi(qids):
    vals = " ".join("wd:" + q for q in qids)
    r = sparql(f"""SELECT ?c ?sehirLabel ?stadLabel ?kap ?renkLabel WHERE {{ VALUES ?c {{ {vals} }}
      OPTIONAL {{ ?c wdt:P159 ?sehir }} OPTIONAL {{ ?c wdt:P115 ?stad . OPTIONAL {{ ?stad wdt:P1083 ?kap }} }} OPTIONAL {{ ?c wdt:P6364 ?renk }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "tr,en". }} }}""")
    out = {}
    for x in r:
        q = x["c"]["value"].rsplit("/", 1)[1]
        o = out.setdefault(q, {"sehir": None, "kap": 0, "renk": []})
        if x.get("sehirLabel") and not o["sehir"]:
            o["sehir"] = x["sehirLabel"]["value"]
        if x.get("kap"):
            try:
                o["kap"] = max(o["kap"], int(float(x["kap"]["value"])))
            except ValueError:
                pass
        if x.get("renkLabel"):
            rn = x["renkLabel"]["value"].lower()
            if rn not in o["renk"]:
                o["renk"].append(rn)
    return out


MEVKI = [("goalkeeper", "KL"), ("left-back", "SLB"), ("left back", "SLB"), ("right-back", "SĞB"), ("right back", "SĞB"), ("wing-back", "B"), ("full-back", "B"),
         ("full back", "B"), ("centre-back", "STP"), ("center back", "STP"), ("sweeper", "STP"), ("defender", "D"), ("defensive midfielder", "DOS"),
         ("attacking midfielder", "OOS"), ("left midfielder", "SLO"), ("right midfielder", "SĞO"), ("central midfielder", "MOS"), ("midfielder", "MOS"),
         ("wing half", "MOS"), ("left winger", "SLK"), ("right winger", "SĞK"), ("winger", "K"), ("second striker", "SF"), ("centre-forward", "SF"),
         ("striker", "SF"), ("forward", "SF")]


def mevki_coz(etiketler):
    for anahtar, kod in MEVKI:
        for e in etiketler:
            if anahtar in e:
                return kod
    return None


def kadro(qids):
    vals = " ".join("wd:" + q for q in qids)
    r = sparql(f"""SELECT ?c ?p ?pLabel ?start ?dob ?boy ?n ?posLabel ?ulke ?ulke2 ?milli WHERE {{ VALUES ?c {{ {vals} }}
      ?p p:P54 ?st . ?st ps:P54 ?c . FILTER NOT EXISTS {{ ?st pq:P582 ?e }} ?st pq:P580 ?start . FILTER(?start > "2019-01-01"^^xsd:dateTime)
      ?p wdt:P569 ?dob . FILTER(?dob > "1985-01-01"^^xsd:dateTime) ?p wikibase:sitelinks ?n .
      OPTIONAL {{ ?p wdt:P413 ?pos }} OPTIONAL {{ ?p wdt:P2048 ?boy }}
      OPTIONAL {{ ?p wdt:P1532 ?u2 . ?u2 wdt:P297 ?ulke2 }} OPTIONAL {{ ?p wdt:P27 ?u . ?u wdt:P297 ?ulke }} OPTIONAL {{ ?p wdt:P1532 ?eng . FILTER(?eng IN (wd:Q21, wd:Q22, wd:Q25, wd:Q26)) BIND(STRAFTER(STR(?eng), "entity/") AS ?milli) }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}""")
    oy = {}
    for x in r:
        c = x["c"]["value"].rsplit("/", 1)[1]
        pid = x["p"]["value"].rsplit("/", 1)[1]
        o = oy.setdefault((c, pid), {"ad": x["pLabel"]["value"], "start": x["start"]["value"][:10], "dob": x["dob"]["value"][:10], "n": int(x["n"]["value"]),
                                    "boy": None, "pos": [], "ulke": None, "ev": None})
        if x.get("boy"):
            try:
                b = float(x["boy"]["value"]); o["boy"] = round(b * 100) if b < 3 else round(b)
            except ValueError:
                pass
        if x.get("posLabel") and x["posLabel"]["value"] not in o["pos"]:
            o["pos"].append(x["posLabel"]["value"].lower())
        if x.get("milli"):
            o["ev"] = {"Q21": "EN", "Q22": "SC", "Q25": "WL", "Q26": "NI"}[x["milli"]["value"]]
        u = (x.get("ulke2") or x.get("ulke") or {}).get("value")
        if u and not o["ulke"]:
            o["ulke"] = u
    return oy


def enwiki(qids):
    vals = " ".join("wd:" + q for q in qids)
    r = sparql(f"""SELECT ?c ?a WHERE {{ VALUES ?c {{ {vals} }} ?a schema:about ?c ; schema:isPartOf <https://en.wikipedia.org/> . }}""")
    return {x["c"]["value"].rsplit("/", 1)[1]: urllib.parse.unquote(x["a"]["value"].rsplit("/wiki/", 1)[1]).replace("_", " ") for x in r}


def sablonlar(metin, adlar):
    """{{ad|...}} şablonlarını iç içe süslü parantezlere dikkat ederek bul."""
    out, i, low = [], 0, metin.lower()
    while True:
        j = -1
        for a in adlar:
            k = low.find("{{" + a, i)
            if k != -1 and (j == -1 or k < j):
                j = k
        if j == -1:
            return out
        d, k = 0, j
        while k < len(metin) - 1:
            if metin[k:k + 2] == "{{": d += 1; k += 2; continue
            if metin[k:k + 2] == "}}":
                d -= 1; k += 2
                if d == 0: break
                continue
            k += 1
        out.append((j, metin[j + 2:k - 2]))
        i = k


def parametreler(govde):
    p, d, buf, parts = {}, 0, "", []
    for ch in govde:
        if ch in "{[": d += 1
        if ch in "}]": d -= 1
        if ch == "|" and d == 0: parts.append(buf); buf = ""; continue
        buf += ch
    parts.append(buf)
    for x in parts[1:]:
        if "=" in x:
            k, v = x.split("=", 1); p[k.strip().lower()] = v.strip()
    return p


def wiki_kadro(baslik):
    d = http("https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({"action": "parse", "page": baslik, "prop": "wikitext", "format": "json", "redirects": 1}))
    time.sleep(0.4)
    metin = ((d or {}).get("parse", {}).get("wikitext", {}) or {}).get("*", "")
    if not metin:
        return [], []
    renk = []
    for k in ("body1", "shorts1", "socks1"):
        m = re.search(r"\|\s*" + k + r"\s*=\s*#?([0-9A-Fa-f]{6})", metin)
        if m:
            renk.append("#" + m.group(1).upper())
    low = metin.lower()
    bas = low.find("{{fs start"); son = low.find("{{fs end", bas) if bas != -1 else -1
    if bas == -1 or son == -1:
        return [], renk
    blok = metin[bas:son]
    oy = []
    for _, g in sablonlar(blok, ["fs player", "football squad player"]):
        p = parametreler(g)
        ad = p.get("name", "")
        m = re.search(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", ad)
        baslik_o = m.group(1).strip() if m else re.sub(r"\{\{.*?\}\}|<.*?>", "", ad).strip()
        gorunen = (m.group(2) or m.group(1)).strip() if m else baslik_o
        gorunen = re.sub(r"\s*\(.*?\)", "", gorunen)
        if not gorunen:
            continue
        oy.append({"baslik": baslik_o if m else None, "ad": gorunen, "no": p.get("no", "").strip(), "nat": p.get("nat", "").strip().upper(), "pos": p.get("pos", "").strip().upper()})
    return oy, renk


def renk_adi(hx):
    r, g, b = int(hx[1:3], 16), int(hx[3:5], 16), int(hx[5:7], 16)
    en, ed = None, 1e9
    for ad, h in {"Kırmızı": "#C8102E", "Beyaz": "#F2F2F2", "Mavi": "#1F5FB4", "Siyah": "#141414", "Sarı": "#F5C400", "Yeşil": "#0B7A3B", "Lacivert": "#0B2A6B",
                  "Gök Mavi": "#6CADDF", "Bordo": "#7A1F3D", "Turuncu": "#E35205", "Mor": "#5B2A86", "Gri": "#8A8D91"}.items():
        d = (r - int(h[1:3], 16)) ** 2 + (g - int(h[3:5], 16)) ** 2 + (b - int(h[5:7], 16)) ** 2
        if d < ed:
            ed, en = d, ad
    return en


def zenginlestir(basliklar):
    """Wikipedia başlıklarından doğum, boy, mevki ve ünlülük (Wikidata)."""
    out = {}
    basliklar = [b for b in basliklar if b]
    for i in range(0, len(basliklar), 40):
        parca = basliklar[i:i + 40]
        vals = " ".join("<https://en.wikipedia.org/wiki/" + urllib.parse.quote(b.replace(" ", "_"), safe="()_,'-.") + ">" for b in parca)
        r = sparql(f"""SELECT ?a ?dob ?boy ?n ?posLabel WHERE {{ VALUES ?a {{ {vals} }} ?a schema:about ?p . ?p wikibase:sitelinks ?n .
          OPTIONAL {{ ?p wdt:P569 ?dob }} OPTIONAL {{ ?p wdt:P2048 ?boy }} OPTIONAL {{ ?p wdt:P413 ?pos }}
          SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}""")
        for x in r:
            b = urllib.parse.unquote(x["a"]["value"].rsplit("/wiki/", 1)[1]).replace("_", " ")
            o = out.setdefault(b, {"dob": None, "boy": None, "n": int(x["n"]["value"]), "pos": []})
            if x.get("dob") and not o["dob"]:
                o["dob"] = x["dob"]["value"][:10]
            if x.get("boy") and not o["boy"]:
                try:
                    v = float(x["boy"]["value"]); o["boy"] = round(v * 100) if v < 3 else round(v)
                except ValueError:
                    pass
            if x.get("posLabel") and x["posLabel"]["value"].lower() not in o["pos"]:
                o["pos"].append(x["posLabel"]["value"].lower())
    return out


GENEL = {"GK": "KL", "DF": "D", "MF": "MOS", "FW": "SF"}


def kisa_ad(ad, kullanilan):
    harf = [w[0] for w in ad.replace("-", " ").split() if w[:1].isalpha()]
    k = ("".join(harf) + "XXX")[:3].upper()
    i = 0
    while k in kullanilan:
        i += 1; k = k[:2] + "ABCDEFGHJKLMNPRSTUVYZ"[i % 21]
    kullanilan.add(k)
    return k


def main():
    gd = json.load(open(GD, encoding="utf-8"))
    eski = {}
    try:
        eski = json.load(open(CIKTI, encoding="utf-8"))
    except Exception:
        pass
    sezon = gd["ligler"][0]["sezon"]
    cikti = {"surum": 1, "sezon": sezon, "kaynak": "Türetilmiş veri · olgular: Wikidata (CC0) · kulüp listesi: TheSportsDB",
             "not": "Oyuncu ve kulüp adları kurmacadır; gerçek kişi ve kulüplerle bağlantısı yoktur.", "ligler": {}}
    for kod, (ladi, ulkeAd, ulkeQ) in LIG.items():
        L = next((l for l in gd["ligler"] if l["kod"] == kod), None)
        if not L:
            print(f"::warning::{kod}: takım listesi yok"); continue
        takimlar = [r["takim"] for r in L["tablo"]]
        sira = {t: i + 1 for i, t in enumerate(takimlar)}
        qmap = {}
        for t in takimlar:
            q = kulup_bul(t, ulkeQ)
            if not q:
                print(f"::warning::{kod}: {t} bulunamadı"); continue
            qmap[t] = q
        bilgi = kulup_bilgi(list(qmap.values()))
        wk = enwiki(list(qmap.values()))
        oy = None
        kul = []
        kisalar = set()
        for t in takimlar:
            if t not in qmap:
                continue
            q = qmap[t]; b = bilgi.get(q, {})
            wl, wrenk = wiki_kadro(wk[q]) if q in wk else ([], [])
            print(f"ESLEME {kod} {t} -> {q} · {wk.get(q)} · vikipedi {len(wl)}")
            if len(wl) >= 15:
                zen = zenginlestir([o["baslik"] for o in wl])
                oyuncular = []
                for o in wl:
                    z = zen.get(o["baslik"] or "", {})
                    oyuncular.append({"ad": o["ad"], "dob": z.get("dob"), "boy": z.get("boy"), "n": z.get("n", 3), "no": o["no"],
                                      "pos": z.get("pos", []), "genel": GENEL.get(o["pos"]), "ev": None, "ulke": FIFA.get(o["nat"])})
            else:
                if oy is None:
                    oy = kadro(list(qmap.values()))
                oyuncular = [o for (c, _), o in oy.items() if c == q]
                oyuncular.sort(key=lambda o: (o["start"], o["n"]), reverse=True)
                oyuncular = oyuncular[:30]
            renkler = [RENK[r] for r in b.get("renk", []) if r in RENK]
            if len(renkler) < 2 and wrenk:
                renkler = []
                for h in wrenk:
                    a = renk_adi(h)
                    if a not in [x[0] for x in renkler]:
                        renkler.append((a, h))
            sehir = b.get("sehir") or t
            kulup = {"id": KM[kod].get(t) or f"y{len(kul) + 1:02d}", "km": t in KM[kod], "sira": sira[t],
                     "sehir": sehir, "kapasite": b.get("kap") or 0,
                     "renk": [r[1] for r in renkler[:2]], "renkAd": [r[0] for r in renkler[:2]], "oyuncular": []}
            for o in oyuncular:
                ad = turet(o["ad"])
                parca = ad.split()
                mev = mevki_coz(o["pos"])
                if o.get("genel") and (not mev or (o["genel"] == "KL") != (mev == "KL")):
                    mev = o["genel"]
                no = o.get("no") or ""
                kulup["oyuncular"].append({"ad": " ".join(parca[:-1]) if len(parca) > 1 else "", "soyad": parca[-1],
                                           "dogum": o["dob"], "uyruk": o["ev"] or o["ulke"] or "", "mevki": mev,
                                           "boy": o["boy"], "un": o["n"], "no": int(no) if no.isdigit() else None})
            kul.append(kulup)
            print(f"{kod} {t}: {len(kulup['oyuncular'])} oyuncu")
        cikti["ligler"][kod] = {"ad": ladi, "ulke": ulkeAd, "kulupler": kul}
    # ünlülük → 0..1 (log ölçek, tüm veri içinde)
    hepsi = [o["un"] for l in cikti["ligler"].values() for k in l["kulupler"] for o in k["oyuncular"]]
    m = max(hepsi or [1])
    for l in cikti["ligler"].values():
        for k in l["kulupler"]:
            for o in k["oyuncular"]:
                o["un"] = round(math.log1p(o["un"]) / math.log1p(m), 3)
    toplam = sum(len(k["oyuncular"]) for l in cikti["ligler"].values() for k in l["kulupler"])
    if toplam < 1500:
        print(f"::error::Yalnız {toplam} oyuncu geldi; eski veri korunuyor."); sys.exit(1)
    eski_govde = {k: v for k, v in eski.items() if k != "guncel"}
    if eski_govde != cikti:
        cikti["guncel"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        os.makedirs(os.path.dirname(CIKTI), exist_ok=True)
        json.dump(cikti, open(CIKTI, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"), sort_keys=True)
        print(f"::notice::Yazıldı: {toplam} oyuncu, {_stat['istek']} istek")
    else:
        print("::notice::Değişiklik yok")


if __name__ == "__main__":
    main()
