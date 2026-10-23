import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import kadro_turet as k
out = {}
for q, t in [("Q6601875", "Fenerbahçe S.K. (football)"), ("Q495299", "Galatasaray S.K. (football)")]:
    wl, renk = k.wiki_kadro(t)
    out[t] = {"wiki": [o["ad"] for o in wl], "renk": renk}
    oy = k.kadro([q])
    out[t]["wikidata"] = sorted([(o["start"], o["ad"]) for o in oy.values()], reverse=True)
d = k.http("https://en.wikipedia.org/w/api.php?action=parse&page=Fenerbah%C3%A7e_S.K._(football)&prop=wikitext&format=json&redirects=1")
m = ((d or {}).get("parse", {}).get("wikitext", {}) or {}).get("*", "")
i = m.lower().find("fs start"); out["fb_ham"] = m[max(0, i - 3000):i + 6000]
for ad in ["İrfan Can Kahveci", "Mert Hakan Yandaş"]:
    out[ad] = k.sparql(f'''SELECT ?p ?cLabel ?s ?e WHERE {{ ?p rdfs:label "{ad}"@en . ?p p:P54 ?st . ?st ps:P54 ?c . OPTIONAL {{ ?st pq:P580 ?s }} OPTIONAL {{ ?st pq:P582 ?e }} SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}''')
json.dump(out, open("yokla.json", "w"), ensure_ascii=False, indent=1)
