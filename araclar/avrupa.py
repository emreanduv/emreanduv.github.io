#!/usr/bin/env python3
"""Champion Battle Manager · Avrupa kupaları (Şampiyonlar Ligi, Avrupa Ligi, Konferans Ligi) lig aşaması.

TheSportsDB'den bu sezonun lig aşaması eşleşmelerini ve tarihlerini okur. Oyun, Serbest Sezon'un ilk yılında
bu gerçek fikstürle başlar (sonuçlar oyunda serbest). Kulüpler yalnız TheSportsDB adının FNV özetiyle (tsdb) anılır;
bizim 6 ligin dışındaki kulüpler için oyunda türetilmiş ad kurulsun diye şehir, renk ve ülke yazılır. Gerçek kulüp adı yazılmaz.
Çıktı: veri/gercek-dunya/v1/avrupa.json · yalnız standart kitaplık."""
import json, os, sys, time, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gercek_dunya import getir, mac, sezon_adi, yaz, yukle, KOK
from kadro_turet import fnv, renk_adi

KUPALAR = [
    {"kod": "ucl", "id": 4480, "ad": "Şampiyonlar Ligi", "hafta": 8},
    {"kod": "uel", "id": 4481, "ad": "Avrupa Ligi", "hafta": 8},
    {"kod": "uecl", "id": 5071, "ad": "Konferans Ligi", "hafta": 6},
]
ULKE = {"Portugal": "PT", "Netherlands": "NL", "Belgium": "BE", "Scotland": "SC", "Austria": "AT", "Switzerland": "CH", "Czech Republic": "CZ",
        "Czechia": "CZ", "Croatia": "HR", "Serbia": "RS", "Greece": "GR", "Denmark": "DK", "Norway": "NO", "Sweden": "SE", "Poland": "PL",
        "Ukraine": "UA", "Cyprus": "CY", "Israel": "IL", "Hungary": "HU", "Romania": "RO", "Bulgaria": "BG", "Slovakia": "SK", "Slovenia": "SI",
        "Azerbaijan": "AZ", "Kazakhstan": "KZ", "Moldova": "MD", "Bosnia and Herzegovina": "BA", "Bosnia-Herzegovina": "BA", "Ireland": "IE",
        "Republic of Ireland": "IE", "Northern Ireland": "NI", "Wales": "WL", "Iceland": "IS", "Finland": "FI", "Armenia": "AM", "Georgia": "GE",
        "Albania": "AL", "Kosovo": "XK", "North Macedonia": "MK", "Montenegro": "ME", "Latvia": "LV", "Lithuania": "LT", "Estonia": "EE",
        "Belarus": "BY", "Luxembourg": "LU", "Malta": "MT", "Gibraltar": "GI", "Faroe Islands": "FO", "Andorra": "AD", "San Marino": "SM",
        "England": "EN", "Spain": "ES", "Italy": "IT", "Germany": "DE", "France": "FR", "Turkey": "TR", "Türkiye": "TR"}


def main():
    simdi = datetime.datetime.now(datetime.timezone.utc)
    sezon = sezon_adi(simdi)
    yil = int(sezon[:4])
    yol = os.path.join(KOK, "avrupa.json")
    eski = yukle(yol, {})
    kulupler = eski.get("kulupler", {}) if eski.get("sezon") == sezon else {}
    cikti = {"surum": 1, "sezon": sezon, "not": "Kulüpler yalnız özetle (tsdb) anılır; gerçek ad yoktur.", "kupalar": {}, "kulupler": kulupler}
    takim_id = {}
    bas = time.time()
    bizim = set()                                                     # bizim 6 ligin kulüpleri: bilgileri oyunda var, sorgulanmaz
    try:
        dj = json.load(open(os.path.join(KOK, "..", "..", "cbm", "v1", "dunya.json"), encoding="utf-8"))
        bizim = {c.get("tsdb") for l in dj["ligler"].values() for c in l["kulupler"]}
    except Exception as e:
        print(f"::warning::dunya.json okunamadı: {e}")
    for k in KUPALAR:
        maclar = {}
        for r in range(1, k["hafta"] + 1):
            d = getir(f"eventsround.php?id={k['id']}&r={r}&s={sezon}") or {}
            for e in d.get("events") or []:
                m = mac(e)
                if not m["zaman"] or m["zaman"][:10] < f"{yil}-09-01":      # ön elemeler aynı tur numarasını kullanır
                    continue
                takim_id[fnv(m["ev"])] = e.get("idHomeTeam"); takim_id[fnv(m["dep"])] = e.get("idAwayTeam")
                maclar[m["id"]] = {"id": m["id"], "r": r, "zaman": m["zaman"], "ev": fnv(m["ev"]), "dep": fnv(m["dep"]), "s": m["s"]}
        cikti["kupalar"][k["kod"]] = {"ad": k["ad"], "hafta": k["hafta"], "maclar": sorted(maclar.values(), key=lambda m: (m["r"], m["zaman"]))}
        print(f"::notice::{k['ad']}: {len(maclar)} maç, {len({m['ev'] for m in maclar.values()} | {m['dep'] for m in maclar.values()})} kulüp")
    for t, tid in takim_id.items():
        if (str(t) in kulupler and kulupler[str(t)].get("sehir")) or not tid or t in bizim:
            continue
        if time.time() - bas > 15 * 60:
            print("::notice::süre doldu; kalan kulüp bilgileri sonraki çalışmada"); break
        d = getir(f"lookupteam.php?id={tid}") or {}
        x = (d.get("teams") or [{}])[0]
        sehir = (x.get("strLocation") or x.get("strStadiumLocation") or "").split(",")[0].strip()
        renk = [c.upper() for c in (x.get("strColour1"), x.get("strColour2")) if c and c.startswith("#") and len(c) == 7]
        if not sehir and not x:
            continue                                                # sorgu başarısız: sonraki çalışmada yeniden dene
        kulupler[str(t)] = {"sehir": sehir, "ulke": ULKE.get((x.get("strCountry") or "").strip(), ""), "renk": renk, "renkAd": [renk_adi(c) for c in renk]}
    eski_govde = {a: b for a, b in eski.items() if a != "guncel"}
    if eski_govde != cikti:
        cikti["guncel"] = simdi.strftime("%Y-%m-%dT%H:%M:%SZ")
        yaz(yol, cikti)
        print("Değişiklik var.")
    else:
        print("Değişiklik yok.")


if __name__ == "__main__":
    main()
