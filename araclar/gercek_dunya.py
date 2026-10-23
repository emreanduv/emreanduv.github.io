#!/usr/bin/env python3
"""Gerçek Dünya verisi — Champion Battle Manager'ın "Gerçek Dünya" sekmesi için.

Kaynak: TheSportsDB herkese açık ücretsiz anahtarı (https://www.thesportsdb.com).
Süper Lig ve 5 büyük ligin bu sezonki maçlarını hafta hafta çeker; puan durumunu
sonuçlardan kendisi hesaplar. Yalnız gerçek (olgu) veri: takım adı, tarih, skor.
Arma, logo, fotoğraf yok.

Çıktı: veri/gercek-dunya/v1/ligler.json (oyunun okuduğu tek dosya)
       veri/gercek-dunya/v1/maclar-<lig>.json (bütün sezon, iç kayıt)

Kullanım:  python3 araclar/gercek_dunya.py          # yalnız güncel haftalar (sık)
           python3 araclar/gercek_dunya.py --tam    # bütün sezon (günde bir)
Yalnız Python standart kitaplığı.
"""
import json, os, sys, time, urllib.request, urllib.error
from datetime import datetime, timezone

KOK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "veri", "gercek-dunya", "v1")
API = "https://www.thesportsdb.com/api/v1/json/123/"
BEKLE = 3.2  # ücretsiz anahtar: pratikte dakikada ~20 istek

LIGLER = [
    {"kod": "tr", "id": 4339, "ad": "Süper Lig", "ulke": "Türkiye", "hafta": 34},
    {"kod": "en", "id": 4328, "ad": "Premier Lig", "ulke": "İngiltere", "hafta": 38},
    {"kod": "es", "id": 4335, "ad": "LaLiga", "ulke": "İspanya", "hafta": 38},
    {"kod": "it", "id": 4332, "ad": "Serie A", "ulke": "İtalya", "hafta": 38},
    {"kod": "de", "id": 4331, "ad": "Bundesliga", "ulke": "Almanya", "hafta": 34},
    {"kod": "fr", "id": 4334, "ad": "Ligue 1", "ulke": "Fransa", "hafta": 34},
]
BITTI = {"FT", "AET", "PEN", "Match Finished", "AP"}


def sezon_adi(simdi):
    y = simdi.year if simdi.month >= 7 else simdi.year - 1
    return f"{y}-{y + 1}"


_son = [0.0]
_istatistik = {"istek": 0, "429": 0, "hata": 0}
BASLA = time.time()
SURE = 18 * 60  # iş en fazla bu kadar sürsün; kalan ligler bir sonraki çalışmaya kalır


def getir(yol):
    bekle = BEKLE - (time.time() - _son[0])
    if bekle > 0:
        time.sleep(bekle)
    for deneme in range(4):
        _son[0] = time.time()
        _istatistik["istek"] += 1
        try:
            req = urllib.request.Request(API + yol, headers={"User-Agent": "MrAnduv-ChampionBattleManager/1.0 (+https://emreanduv.github.io)"})
            with urllib.request.urlopen(req, timeout=30) as r:
                metin = r.read().decode("utf-8")
            return json.loads(metin) if metin.strip() else {}
        except urllib.error.HTTPError as e:
            if e.code == 429:
                _istatistik["429"] += 1
                time.sleep(30)
                continue
            _istatistik["hata"] += 1
            print(f"::warning::{yol}: HTTP {e.code}")
        except Exception as e:  # ağ hatası
            _istatistik["hata"] += 1
            print(f"::warning::{yol}: {e}")
        time.sleep(5 * (deneme + 1))
    return None


def tamsayi(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def mac(e):
    h, a = tamsayi(e.get("intHomeScore")), tamsayi(e.get("intAwayScore"))
    durum = (e.get("strStatus") or "").strip()
    # Skor ancak maç bittiyse sayılır (canlı maçın ara skoru puan durumuna girmesin)
    bitti = h is not None and a is not None and (durum in BITTI or durum == "")
    ts = e.get("strTimestamp") or ((e.get("dateEvent") or "") + ("T" + e["strTime"] if e.get("strTime") else ""))
    if ts and len(ts) >= 16 and not ts.endswith("Z") and "+" not in ts[10:]:
        ts = ts[:19] + "Z"
    return {
        "id": str(e.get("idEvent")),
        "hafta": tamsayi(e.get("intRound")),
        "zaman": ts or None,
        "ev": (e.get("strHomeTeam") or "").strip(),
        "dep": (e.get("strAwayTeam") or "").strip(),
        "s": [h, a] if bitti else None,
        "durum": "bitti" if bitti else ("ertelendi" if "ostpon" in durum else ("iptal" if "ancel" in durum else ("canli" if h is not None and durum not in ("NS", "Not Started") else "oynanacak"))),
    }


def hafta_getir(lig, sezon, h):
    d = getir(f"eventsround.php?id={lig['id']}&r={h}&s={sezon}")
    if d is None:
        return None
    return [mac(e) for e in (d.get("events") or []) if e.get("idEvent")]


def tablo(maclar):
    T = {}
    oynanan = sorted((m for m in maclar if m["s"]), key=lambda m: (m["zaman"] or "", m["id"]))
    for m in maclar:
        for t in (m["ev"], m["dep"]):
            if t:
                T.setdefault(t, {"takim": t, "o": 0, "g": 0, "b": 0, "m": 0, "a": 0, "y": 0, "p": 0, "form": []})
    for m in oynanan:
        hs, as_ = m["s"]
        H, A = T[m["ev"]], T[m["dep"]]
        for X, at, ye in ((H, hs, as_), (A, as_, hs)):
            X["o"] += 1; X["a"] += at; X["y"] += ye
            if at > ye:
                X["g"] += 1; X["p"] += 3; X["form"].append("G")
            elif at < ye:
                X["m"] += 1; X["form"].append("M")
            else:
                X["b"] += 1; X["p"] += 1; X["form"].append("B")
    sirali = sorted(T.values(), key=lambda r: (-r["p"], -(r["a"] - r["y"]), -r["a"], r["takim"]))
    for i, r in enumerate(sirali, 1):
        r["sira"] = i; r["av"] = r["a"] - r["y"]; r["form"] = "".join(r["form"][-5:])
    return sirali


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


def main():
    tam = "--tam" in sys.argv
    simdi = datetime.now(timezone.utc)
    sezon = sezon_adi(simdi)
    ozet, degisti = [], False
    for lig in LIGLER:
        yol = os.path.join(KOK, f"maclar-{lig['kod']}.json")
        kayit = yukle(yol, {})
        if kayit.get("sezon") != sezon:
            kayit = {"sezon": sezon, "maclar": {}}
            tam_lig = True
        else:
            tam_lig = tam
        maclar = kayit["maclar"]
        if time.time() - BASLA > SURE:
            print(f"::notice::{lig['ad']}: süre doldu, sonraki çalışmaya kaldı")
            continue
        gecen = getir(f"eventspastleague.php?id={lig['id']}") or {}
        gelen = getir(f"eventsnextleague.php?id={lig['id']}") or {}
        hg = tamsayi(((gecen.get("events") or [{}])[0]).get("intRound")) or 1
        hs = tamsayi(((gelen.get("events") or [{}])[0]).get("intRound")) or hg + 1
        bilinen = max((m["hafta"] or 0 for m in maclar.values() if m["s"]), default=0)
        if tam_lig:
            haftalar = list(range(1, lig["hafta"] + 1))  # oynanmamış iki hafta üst üste gelince durur
        else:
            haftalar = sorted({h for h in (hg - 1, hg, hs, hs + 1, bilinen - 1, bilinen, bilinen + 1, bilinen + 2) if 1 <= h <= lig["hafta"]})
        alinan, bos = 0, 0
        istenen = []
        for h in haftalar:
            liste = hafta_getir(lig, sezon, h)
            istenen.append(h)
            if liste is None:
                continue
            for m in liste:
                maclar[m["id"]] = m
            alinan += len(liste)
            if tam_lig and h > max(hs, hg):
                bos = bos + 1 if not any(m["s"] for m in liste) else 0
                if bos >= 2:
                    break
        haftalar = istenen
        hepsi = list(maclar.values())
        print(f"::notice::{lig['ad']}: hafta {hg}/{hs}, {len(list(haftalar))} hafta istendi, {alinan} maç geldi, toplam {len(hepsi)} · istek {_istatistik['istek']}, 429 {_istatistik['429']}, hata {_istatistik['hata']}")
        if not hepsi:
            continue
        degisti |= yaz(yol, kayit)
        oynanan = [m for m in hepsi if m["s"]]
        esik = (simdi.timestamp() - 3 * 3600)
        def ileride(m):
            try:
                return datetime.strptime(m["zaman"][:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc).timestamp() >= esik
            except Exception:
                return False
        gelecek = sorted((m for m in hepsi if not m["s"] and (m["durum"] == "canli" or (m["durum"] == "oynanacak" and ileride(m)))), key=lambda m: m["zaman"] or "9")
        guncel_hafta = max((m["hafta"] or 0 for m in oynanan), default=0)
        sonuclar = sorted(oynanan, key=lambda m: m["zaman"] or "", reverse=True)[:20]
        ozet.append({
            "kod": lig["kod"], "ad": lig["ad"], "ulke": lig["ulke"], "sezon": sezon.replace("-20", "-"),
            "hafta": guncel_hafta, "toplamHafta": lig["hafta"],
            "tablo": tablo(hepsi), "sonuclar": sonuclar, "fikstur": gelecek[:20],
        })
    if not ozet:
        print("Hiç veri gelmedi; dosyalar değişmedi.")
        return
    cikti = os.path.join(KOK, "ligler.json")
    eski = yukle(cikti, {})
    veri = {"surum": 1, "kaynak": "TheSportsDB (thesportsdb.com)", "ligler": ozet,
            "not": "Gerçek maç sonuçları ve puan durumları; oyundaki kulüp ve oyuncular kurmacadır."}
    eski_govde = {k: v for k, v in eski.items() if k != "guncel"}
    if eski_govde != veri:
        veri["guncel"] = simdi.strftime("%Y-%m-%dT%H:%M:%SZ")
        yaz(cikti, veri)
        degisti = True
    print("Değişiklik var." if degisti else "Değişiklik yok.")


if __name__ == "__main__":
    main()
