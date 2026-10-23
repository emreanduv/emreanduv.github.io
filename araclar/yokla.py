import json, sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
import acik_kaynak as a
out = {}
for kod in ["en", "tr", "de"]:
    L = a.LIGLER[kod]; sezon = a.sezon_adi(); t = f"{sezon[:4]}–{sezon[-2:]} {L['wiki']}"
    w = a.wikitext("en.wikipedia.org", t) or ""
    i = w.lower().find("sports results")
    out[kod] = {"baslik": t, "uzunluk": len(w), "konum": i, "parca": w[max(0, i - 300):i + 1500] if i >= 0 else w[:600],
                "sablonlar": sorted(set(re.findall(r"\{\{\s*([^|}\n]{3,60})", w)))[:80]}
    try: out[kod]["matris"] = len(a.wiki_matris(kod, sezon))
    except Exception as e: out[kod]["matris"] = "HATA " + str(e)
json.dump(out, open("yokla.json", "w"), ensure_ascii=False, indent=1)
