import json, sys, urllib.request, urllib.parse
def q(s):
    u = "https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(s)
    r = urllib.request.Request(u, headers={"User-Agent": "MrAnduv-CBM/1.0 (https://emreanduv.github.io)", "Accept": "application/sparql-results+json"})
    return json.load(urllib.request.urlopen(r, timeout=90))["results"]["bindings"]
LIG = {"en": "Q9448", "es": "Q324867", "it": "Q15804", "de": "Q82595", "fr": "Q13394", "tr": "Q485568"}
for k, l in LIG.items():
    r = q(f"""SELECT ?s ?sLabel ?start (COUNT(?c) AS ?n) WHERE {{ ?s wdt:P3450 wd:{l}; wdt:P580 ?start. FILTER(?start >= "2025-06-01"^^xsd:dateTime) OPTIONAL {{ ?s wdt:P1923 ?c }} SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }} GROUP BY ?s ?sLabel ?start""")
    print(k, [(x["sLabel"]["value"], x["start"]["value"][:10], x["n"]["value"]) for x in r])
# örnek: Galatasaray güncel kadrosu
r = q("""SELECT ?pLabel ?posLabel ?dob WHERE { ?c rdfs:label "Galatasaray S.K."@en . ?p p:P54 ?st . ?st ps:P54 ?c . FILTER NOT EXISTS { ?st pq:P582 ?e } ?p wdt:P106 wd:Q937857 . OPTIONAL { ?p wdt:P413 ?pos } OPTIONAL { ?p wdt:P569 ?dob } SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }""")
print("GS", len(r), [x["pLabel"]["value"] for x in r][:60])
