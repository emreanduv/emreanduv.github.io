import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import kadro_turet as k
out = {}
out["rel"] = k.sparql('''SELECT ?pr ?v ?vLabel WHERE { wd:Q20473364 ?pr ?v . FILTER(STRSTARTS(STR(?v), "http://www.wikidata.org/entity/Q")) SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }''')
out["ters"] = k.sparql('''SELECT ?s ?pr ?sLabel WHERE { ?s ?pr wd:Q20473364 . FILTER(?pr != schema:about) SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } LIMIT 40''')
out["en"] = k.sparql('''SELECT ?c ?a WHERE { ?a schema:about ?c ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?n . FILTER(STRSTARTS(?n, "Gençlerbirliği")) }''')
json.dump(out, open("yokla.json", "w"), ensure_ascii=False, indent=1)
