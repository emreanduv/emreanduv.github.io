#!/usr/bin/env python3
"""Champion Battle Manager · Avrupa kupaları (Şampiyonlar Ligi, Avrupa Ligi, Konferans Ligi) lig aşaması.

Kaynak: İngilizce Vikipedi "<sezon> UEFA ... league phase" maddelerindeki maç kutuları (CC BY-SA; yalnız olgu: tarih, eşleşme, skor)
ve Wikidata (CC0: kulüp kimliği, şehir, renk). Kulüpler Wikidata kimliğinin özetiyle (k) anılır; gerçek ad yazılmaz.
Bizim 6 ligin dışındaki kulüpler için oyunda türetilmiş ad kurulsun diye yalnız şehir, ülke ve renk yazılır.
Çıktı: veri/gercek-dunya/v1/avrupa.json · yalnız standart kitaplık."""
import json, os, re, sys
from datetime import datetime, timezone
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from acik_kaynak import wikitext, sablonlar, sablon_alanlari, link_hedef, skor, qid_baslik, anahtar, sparql, onbellek_yaz, sezon_adi, _stat
from fifa_kod import FIFA
from kadro_turet import renk_adi

KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "veri", "gercek-dunya", "v1")
KUPALAR = [("ucl", "UEFA Champions League", 8), ("uel", "UEFA Europa League", 8), ("uecl", "UEFA Conference League", 6)]
RENK = {"red": "#C8102E", "white": "#F2F2F2", "blue": "#1F5FB4", "black": "#141414", "yellow": "#F5C400", "green": "#0B7A3B", "navy blue": "#0B2A6B",
        "dark blue": "#0B2A6B", "sky blue": "#6CADDF", "light blue": "#6CADDF", "claret": "#7A1F3D", "maroon": "#7A1F3D", "burgundy": "#7A1F3D",
        "orange": "#E35205", "purple": "#5B2A86", "violet": "#5B2A86", "gold": "#C9A227", "grey": "#8A8D91", "gray": "#8A8D91"}


def kutular(w):
    """Maç kutuları: (maç günü, alanlar)"""
    out = []
    basliklar = [(m.start(), int(m.group(1))) for m in re.finditer(r"===\s*Matchday\s*(\d+)\s*===", w)]
    for i, govde in sablonlar(w, ["#invoke:Football box", "#invoke:football box", "Football box"]):
        md = max([b for b in basliklar if b[0] < i], default=(0, None))[1]
        out.append((md, sablon_alanlari(govde)))
    return out


def tarih_saat(a):
    t = re.search(r"\|(\d{4})\|(\d{1,2})\|(\d{1,2})", a.get("date", ""))
    if not t:
        return None
    y, ay, g = int(t.group(1)), int(t.group(2)), int(t.group(3))
    tr = re.search(r"\((\d{1,2}):(\d{2})\s*\[\[UTC\+03", a.get("time", ""))          # parantezdeki TSİ saati
    if tr:
        return datetime(y, ay, g, int(tr.group(1)), int(tr.group(2)), tzinfo=timezone.utc).replace(tzinfo=timezone.utc).timestamp() - 3 * 3600
    cet = re.search(r"(\d{1,2}):(\d{2})", a.get("time", ""))
    hh, mm = (int(cet.group(1)), int(cet.group(2))) if cet else (21, 0)
    return datetime(y, ay, g, hh, mm, tzinfo=timezone.utc).timestamp() - (2 if ay in (4, 5, 6, 7, 8, 9, 10) else 1) * 3600


def main():
    simdi = datetime.now(timezone.utc)
    sezon = sezon_adi(simdi)
    yol = os.path.join(KOK, "avrupa.json")
    cikti = {"surum": 2, "sezon": sezon, "kaynak": "Vikipedi (CC BY-SA) · Wikidata (CC0)", "not": "Kulüpler yalnız anahtarla anılır; gerçek ad yoktur.", "kupalar": {}, "kulupler": {}}
    ulke, basliklar = {}, set()
    ham = {}
    for kod, ad, md in KUPALAR:
        w = wikitext("en.wikipedia.org", f"{sezon[:4]}–{sezon[-2:]} {ad} league phase")
        K = kutular(w) if w else []
        ham[kod] = K
        for _, a in K:
            for t in ("team1", "team2"):
                b = link_hedef(a.get(t))
                if b:
                    basliklar.add(b)
                    f = re.search(r"\{\{fbaicon\|([A-Z]{3})", a.get(t, ""))
                    if f: ulke[b] = FIFA.get(f.group(1), "")
                    st = a.get("stadium", "")
                    if t == "team1" and "," in st:
                        ulke.setdefault(b + "|sehir", link_hedef(st.split(",", 1)[1]) or "")
    q = qid_baslik(sorted(basliklar), "enwiki")
    onbellek_yaz()
    for kod, ad, md in KUPALAR:
        maclar = []
        for g, a in ham[kod]:
            e, d = link_hedef(a.get("team1")), link_hedef(a.get("team2"))
            ts = tarih_saat(a)
            if not e or not d or not q.get(e) or not q.get(d) or ts is None:
                continue
            z = datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            ek, dk = anahtar(q[e]), anahtar(q[d])
            maclar.append({"id": f"{kod}{g}-{ek}-{dk}", "r": g, "zaman": z, "ev": ek, "dep": dk, "s": skor(a.get("score")) if "–" in a.get("score", "") or "-" in a.get("score", "") else None})
        cikti["kupalar"][kod] = {"hafta": md, "maclar": sorted(maclar, key=lambda m: (m["r"] or 0, m["zaman"]))}
        print(f"::notice::{kod}: {len(maclar)} maç")
    # kulüp bilgisi (şehir, renk) Wikidata'dan: yalnız anahtar → şehir, ülke, renk
    qids = sorted({q[b] for b in basliklar if q.get(b)})
    bilgi = {}
    for i in range(0, len(qids), 60):
        vals = " ".join("wd:" + x for x in qids[i:i + 60])
        for x in sparql(f"""SELECT ?c ?sehirLabel ?renkAdi WHERE {{ VALUES ?c {{ {vals} }} OPTIONAL {{ ?c wdt:P159 ?sehir }} OPTIONAL {{ ?c wdt:P6364 ?renk . ?renk rdfs:label ?renkAdi . FILTER(LANG(?renkAdi) = "en") }}
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "tr,en". }} }}"""):
            c = x["c"]["value"].rsplit("/", 1)[1]; o = bilgi.setdefault(c, {"sehir": "", "renk": []})
            sl = (x.get("sehirLabel") or {}).get("value", "")
            if sl and not re.fullmatch(r"Q\d+", sl) and not o["sehir"]: o["sehir"] = sl
            r = (x.get("renkAdi") or {}).get("value", "").lower()
            if r in RENK and RENK[r] not in o["renk"]: o["renk"].append(RENK[r])
    for b in basliklar:
        if not q.get(b):
            continue
        o = bilgi.get(q[b], {})
        renk = o.get("renk", [])[:2]
        cikti["kulupler"][str(anahtar(q[b]))] = {"sehir": o.get("sehir") or ulke.get(b + "|sehir", ""), "ulke": ulke.get(b, ""), "renk": renk, "renkAd": [renk_adi(c) for c in renk]}
    eski = {}
    try:
        eski = json.load(open(yol, encoding="utf-8"))
    except Exception:
        pass
    if {k: v for k, v in eski.items() if k != "guncel"} != cikti and any(v["maclar"] for v in cikti["kupalar"].values()):
        cikti["guncel"] = simdi.strftime("%Y-%m-%dT%H:%M:%SZ")
        json.dump(cikti, open(yol, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        print("Değişiklik var.")
    print(f"istek {_stat['istek']}")


if __name__ == "__main__":
    main()
