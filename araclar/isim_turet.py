"""Winning Eleven usulü isim türetici: gerçek ismi çağrıştıran ama ondan farklı kurgusal isim.
Örnek: Lukaku → Lakaka. Aynı girdi her zaman aynı sonucu verir (sezonlar arası tutarlılık).
Kurallar: ilk harf ve uzunluk/ritim korunur; bir ünlü harf tüm sözcükte başka bir ünlüyle değişir,
gerekirse bir ünsüz benzeriyle değişir; sonuç gerçek isimden en az 2 harf (kısa sözcükte 1) farklıdır."""
import hashlib, unicodedata

UNLU_ESI = {  # ünlü → aday ünlüler (kulağa yakın, ama farklı)
    "a": "oe", "e": "ai", "i": "eo", "o": "au", "u": "oa",
    "á": "oe", "à": "oe", "â": "oe", "ã": "oe", "ä": "oe", "é": "ai", "è": "ai", "ê": "ai", "ë": "ai",
    "í": "eo", "ì": "eo", "î": "eo", "ï": "eo", "ı": "eu", "ó": "au", "ò": "au", "ô": "au", "õ": "au", "ö": "uo",
    "ú": "oa", "ù": "oa", "û": "oa", "ü": "ou", "y": "i",
}
UNSUZ_ESI = {  # benzer sesli ünsüzler
    "k": "c", "c": "k", "q": "k", "v": "b", "b": "v", "w": "v", "s": "z", "z": "s", "d": "t", "t": "d",
    "p": "b", "g": "k", "m": "n", "n": "m", "l": "r", "r": "l", "f": "v", "x": "ks", "ç": "c", "ş": "s",
    "ğ": "g", "ñ": "n", "ć": "c", "č": "c", "š": "s", "ž": "z", "ł": "l", "ø": "o", "æ": "e", "ß": "s",
}
UNLU = set(UNLU_ESI) - {"y"}


def _r(tohum, n):
    h = hashlib.sha256(tohum.encode("utf-8")).digest()
    return [b / 255 for b in h[:n]]


def _fark(a, b):
    if len(a) != len(b):
        return abs(len(a) - len(b)) + sum(x != y for x, y in zip(a, b))
    return sum(x != y for x, y in zip(a, b))


def _buyuk(orj, yeni):
    return yeni[:1].upper() + yeni[1:] if orj[:1].isupper() else yeni


def sozcuk(s, tohum, hafif=False):
    """Tek sözcüğü dönüştür."""
    if len(s) <= 2 or not any(ch.isalpha() for ch in s):
        return s
    r = _r(tohum + s, 12)
    k = s.lower()
    bas, govde = k[0], k[1:]
    unluler = [ch for ch in govde if ch in UNLU]
    sonuc = govde
    if unluler:
        # en sık geçen ünlülerden birini seç, sözcük boyunca değiştir (Lukaku → Lakaka)
        sayi = {}
        for ch in unluler:
            sayi[ch] = sayi.get(ch, 0) + 1
        adaylar = sorted(sayi, key=lambda c: (-sayi[c], c))
        hedef = adaylar[0] if r[0] < 0.7 or len(adaylar) == 1 else adaylar[1]
        yeni = UNLU_ESI[hedef][0 if r[1] < 0.6 else -1]
        sonuc = govde.replace(hedef, yeni)
    gereken = 1 if len(k) <= 4 or hafif else 2
    if _fark(govde, sonuc) < gereken:
        # bir ünsüzü benzeriyle değiştir (ilk harf hariç, sondan başa doğru)
        konumlar = [i for i, ch in enumerate(sonuc) if ch in UNSUZ_ESI]
        if konumlar:
            i = konumlar[int(r[2] * len(konumlar)) % len(konumlar)]
            ch, y = sonuc[i], UNSUZ_ESI[sonuc[i]]
            j = i
            while j + 1 < len(sonuc) and sonuc[j + 1] == ch:   # çift ünsüz birlikte değişsin (Messi → Mezzi)
                j += 1
            while i > 0 and sonuc[i - 1] == ch:
                i -= 1
            sonuc = sonuc[:i] + y * (j - i + 1) + sonuc[j + 1:]
    if _fark(govde, sonuc) < gereken and unluler:
        # ikinci bir ünlüyü de değiştir
        for i, ch in enumerate(sonuc):
            if ch in UNLU and govde[i] == ch:
                sonuc = sonuc[:i] + UNLU_ESI[ch][-1] + sonuc[i + 1:]
                break
    return _buyuk(s, bas + sonuc)


def turet(tam_ad):
    """'Romelu Lukaku' → 'Romalu Lakaka' gibi. Soyad daha belirgin, ad hafif değişir."""
    parcalar = tam_ad.replace("-", " - ").split()
    if not parcalar:
        return tam_ad
    son = len(parcalar) - 1
    cikti = []
    for i, p in enumerate(parcalar):
        if p == "-" or p.lower() in {"de", "da", "di", "van", "von", "der", "den", "dos", "das", "del", "la", "le", "el", "al", "bin", "ben", "mc"}:
            cikti.append(p)
            continue
        cikti.append(sozcuk(p, tam_ad + str(i), hafif=(i != son)))
    return " ".join(cikti).replace(" - ", "-")


def ascii_anahtar(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s.lower()) if c.isalnum())


if __name__ == "__main__":
    import sys
    ornek = sys.argv[1:] or ["Romelu Lukaku", "Victor Osimhen", "Mauro Icardi", "Leroy Sané", "Lionel Messi", "Kylian Mbappé", "Erling Haaland",
                             "Arda Güler", "Kenan Yıldız", "Edin Džeko", "Mohamed Salah", "Martin Ødegaard", "Bremer", "Neto", "Marquinhos",
                             "Barış Alper Yılmaz", "İlkay Gündoğan", "Hakan Çalhanoğlu", "Ferdi Kadıoğlu", "Vinícius Júnior", "Jude Bellingham",
                             "Kevin De Bruyne", "Virgil van Dijk", "Harry Kane", "Lamine Yamal", "Rafael Leão", "Dušan Vlahović", "Son Heung-min"]
    for a in ornek:
        print(f"{a:28s} → {turet(a)}")
