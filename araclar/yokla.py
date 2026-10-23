"""Geçici yoklama: açık kaynak sayfaların yapısı (çıktı deneme-cikti dalına)."""
import json, urllib.request, urllib.parse, re, sys
UA = {"User-Agent": "MrAnduv-ChampionBattleManager/1.0 (+https://emreanduv.github.io)"}
def wt(host, baslik):
    u = f"https://{host}/w/api.php?" + urllib.parse.urlencode({"action": "parse", "page": baslik, "prop": "wikitext", "format": "json", "redirects": 1})
    d = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read())
    return d.get("parse", {}).get("wikitext", {}).get("*", ""), d.get("error", {}).get("info")
out = {}
for host, b in [("tr.wikipedia.org", "Şablon:2026-27 Süper Lig maçları"), ("tr.wikipedia.org", "Şablon:2026-27 Süper Lig puan durumu"), ("tr.wikipedia.org", "2026-27 Süper Lig maçları"), ("en.wikipedia.org", "2026–27 Süper Lig"), ("tr.wikipedia.org", "2026-27 Süper Lig"), ("tr.wikipedia.org", "2026–27 Süper Lig"),
                ("en.wikipedia.org", "2026–27 UEFA Champions League league phase"), ("en.wikipedia.org", "2026–27 UEFA Europa League league phase"),
                ("en.wikipedia.org", "2026–27 UEFA Conference League league phase"), ("en.wikipedia.org", "2026–27 Turkish Cup"), ("tr.wikipedia.org", "2026-27 Türkiye Kupası")]:
    try:
        w, e = wt(host, b)
    except Exception as ex:
        w, e = "", str(ex)
    keys = ["#invoke:sports results", "match_", "football box", "Football box", "fb r", "Hafta", "hafta", "{{Start date", "team1", "score", "name_", "Maçlar"]
    i = w.find("football box"); i = i if i >= 0 else w.find("Football box"); j = w.find("match_"); k = w.find("Hafta")
    out[f"{host}|{b}"] = {"hata": e, "uzunluk": len(w), "sayim": {x: w.count(x) for x in keys},
                          "ornek_box": w[max(0, i - 50):i + 700] if i >= 0 else "", "ornek_matris": w[max(0, j - 600):j + 400] if j >= 0 else "", "ornek_hafta": w[max(0, k - 100):k + 900] if k >= 0 else "", "bas": w[:2500], "son": w[-1500:]}
json.dump(out, open("yokla.json", "w"), ensure_ascii=False, indent=1)
