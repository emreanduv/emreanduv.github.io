import json, sys, urllib.request, urllib.parse
def q(s):
    u = "https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(s)
    r = urllib.request.Request(u, headers={"User-Agent": "MrAnduv-CBM/1.0 (https://emreanduv.github.io)", "Accept": "application/sparql-results+json"})
    return json.load(urllib.request.urlopen(r, timeout=90))["results"]["bindings"]
for ad in ["Galatasaray S.K.", "Arsenal F.C.", "Juventus FC", "Kasımpaşa S.K."]:
    r = q(f"""SELECT ?pLabel ?start ?dob WHERE {{ ?c rdfs:label "{ad}"@en . ?p p:P54 ?st . ?st ps:P54 ?c . FILTER NOT EXISTS {{ ?st pq:P582 ?e }} ?st pq:P580 ?start . ?p wdt:P569 ?dob . FILTER(?dob > "1986-01-01"^^xsd:dateTime) FILTER(?start > "2019-01-01"^^xsd:dateTime) SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }} }}""")
    print(ad, len(r), sorted(set(x["pLabel"]["value"] + " " + x["start"]["value"][:7] for x in r)))
