#!/usr/bin/env python3
"""Gerçek Dünya verisi — Champion Battle Manager'ın "Gerçek Dünya" sekmesi ve Challenge Modu için.

Kaynak: açık ve serbest lisanslı veriler (bkz. acik_kaynak.py): openfootball (kamu malı) ve Vikipedi (CC BY-SA, yalnız olgu).
Çıktıda gerçek kulüp ya da lig adı yoktur: kulüpler Wikidata kimliğinin özetiyle (k) anılır; oyun kendi türetilmiş adlarını gösterir.

Çıktı: veri/gercek-dunya/v1/ligler.json       (puan durumu, son sonuçlar, fikstür)
       veri/gercek-dunya/v1/maclar-<lig>.json (bütün sezon)
Yalnız Python standart kitaplığı."""
import json, os, sys
from datetime import datetime, timezone
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from acik_kaynak import LIGLER, lig_maclari, sezon_adi, _stat

KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "veri", "gercek-dunya", "v1")


def yukle(yol, varsayilan):
    try:
        with open(yol, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return varsayilan


def yaz(yol, veri):
    """Yalnız içerik değiştiyse yazar; değişti mi döner."""
    yeni = json.dumps(veri, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    try:
        with open(yol, encoding="utf-8") as f:
            if f.read() == yeni:
                return False
    except FileNotFoundError:
        pass
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    with open(yol, "w", encoding="utf-8") as f:
        f.write(yeni)
    return True


def tablo(maclar):
    T = {}
    for m in maclar:
        for k in (m["evk"], m["depk"]):
            T.setdefault(k, {"k": k, "o": 0, "g": 0, "b": 0, "m": 0, "a": 0, "y": 0, "p": 0, "form": []})
    for m in sorted((m for m in maclar if m["s"]), key=lambda m: (m["zaman"] or "", m["id"])):
        hs, as_ = m["s"]
        for X, at, ye in ((T[m["evk"]], hs, as_), (T[m["depk"]], as_, hs)):
            X["o"] += 1; X["a"] += at; X["y"] += ye
            if at > ye: X["g"] += 1; X["p"] += 3; X["form"].append("G")
            elif at < ye: X["m"] += 1; X["form"].append("M")
            else: X["b"] += 1; X["p"] += 1; X["form"].append("B")
    sirali = sorted(T.values(), key=lambda r: (-r["p"], -(r["a"] - r["y"]), -r["a"], r["k"]))
    for i, r in enumerate(sirali, 1):
        r["sira"] = i; r["av"] = r["a"] - r["y"]; r["form"] = "".join(r["form"][-5:])
    return sirali


def lig_ozet(kod, hepsi, sezon, simdi):
    L = LIGLER[kod]
    oynanan = [m for m in hepsi if m["s"]]
    esik = simdi.strftime("%Y-%m-%dT%H:%M:%SZ")
    gelecek = sorted((m for m in hepsi if not m["s"] and (m["zaman"] or "") >= esik), key=lambda m: m["zaman"] or "9")
    return {"kod": kod, "sezon": sezon.replace("-20", "-"), "hafta": max((m["hafta"] or 0 for m in oynanan), default=0), "toplamHafta": L["hafta"],
            "tablo": tablo(hepsi), "sonuclar": sorted(oynanan, key=lambda m: m["zaman"] or "", reverse=True)[:20], "fikstur": gelecek[:20]}


def main():
    simdi = datetime.now(timezone.utc)
    sezon = sezon_adi(simdi)
    ozet, degisti = [], False
    for kod in LIGLER:
        yol = os.path.join(KOK, f"maclar-{kod}.json")
        maclar, _ = lig_maclari(kod, sezon)
        if not maclar:
            eski = yukle(yol, {})
            print(f"::warning::{kod}: kaynak okunamadı, kayıtlı veri kullanılıyor")
            maclar = list(eski.get("maclar", {}).values()) if eski.get("sezon") == sezon else []
            if not maclar:
                continue
        else:
            degisti |= yaz(yol, {"sezon": sezon, "kaynak": "openfootball (kamu malı) / Vikipedi (CC BY-SA)", "maclar": {m["id"]: m for m in maclar}})
        print(f"::notice::{kod}: {len(maclar)} maç, {sum(1 for m in maclar if m['s'])} sonuçlu")
        ozet.append(lig_ozet(kod, maclar, sezon, simdi))
    if not ozet:
        print("Hiç veri gelmedi; dosyalar değişmedi."); return
    cikti = os.path.join(KOK, "ligler.json")
    eski = yukle(cikti, {})
    veri = {"surum": 2, "kaynak": "openfootball (kamu malı) · Vikipedi (CC BY-SA) · Wikidata (CC0)", "ligler": ozet,
            "not": "Gerçek maç sonuçları ve puan durumları (olgu). Kulüpler yalnız anahtarla anılır; oyundaki kulüp ve oyuncular kurmacadır."}
    if {k: v for k, v in eski.items() if k != "guncel"} != veri:
        veri["guncel"] = simdi.strftime("%Y-%m-%dT%H:%M:%SZ")
        yaz(cikti, veri); degisti = True
    print(f"{'Değişiklik var' if degisti else 'Değişiklik yok'} · istek {_stat['istek']}")


if __name__ == "__main__":
    main()
