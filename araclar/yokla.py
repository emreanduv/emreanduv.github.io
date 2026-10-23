import json, sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
import acik_kaynak as a
out = {}
sezon = a.sezon_adi()
for kod in ["en", "es", "it", "de", "fr"]:
    L = a.LIGLER[kod]; kisa = f"{sezon[:4]}–{sezon[-2:]}"
    for t in [f"Template:{kisa} {L['wiki']} results", f"Template:{kisa} {L['wiki']} result table", f"Module:Sports results/{kisa} {L['wiki']}", f"Template:{kisa} {L['wiki']} table", f"{kisa} {L['wiki']} results"]:
        w = a.wikitext("en.wikipedia.org", t) or ""
        out[f"{kod}|{t}"] = {"uzunluk": len(w), "results": w.lower().count("sports results"), "match_": len(re.findall(r"\|\s*match_[a-z]{2,4}_[a-z]{2,4}\s*=", w, re.I)), "bas": w[:300]}
json.dump(out, open("yokla.json", "w"), ensure_ascii=False, indent=1)
