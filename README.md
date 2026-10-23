# Mr. Anduv! — Oyun vitrini ve gizlilik sayfaları

Ana sayfa (https://emreanduv.github.io/) oyunların tanıtım vitrinidir; görseller `img/` klasöründe.

Mağaza (App Store / Google Play) formlarında kullanılan herkese açık gizlilik politikaları.

- https://emreanduv.github.io/topcular/
- https://emreanduv.github.io/hisar/
- https://emreanduv.github.io/malazgirt/

Yeni oyun eklemek: `oyun-adi/index.html` klasörü ekle, ana sayfadaki listeye bir satır ekle.

## Gerçek Dünya verisi
`veri/gercek-dunya/v1/ligler.json` — Champion Battle Manager'ın "Gerçek Dünya" sekmesi okur. Süper Lig + 5 büyük lig; sonuçlar, fikstür ve sonuçlardan hesaplanan puan durumu.
Kaynak: yalnız serbest lisanslı açık veri — openfootball/football.json (kamu malı), Vikipedi (CC BY-SA; yalnız olgu: tarih, eşleşme, skor) ve Wikidata (CC0). Çıktıda gerçek kulüp ya da lig adı yoktur; kulüpler Wikidata kimliğinin özetiyle anılır. Ücretli ya da kısıtlı lisanslı API kullanılmaz. GitHub iş akışı `gercek-dunya.yml` saatte bir günceller.

## CBM türetilmiş kadrolar
`veri/cbm/v1/dunya.json` — Champion Battle Manager'ın kurmaca dünyası, Winning Eleven usulü gerçekten **türetilmiştir**: kulüp ve kadrolar bu sezonun gerçek liglerinden gelir, ama oyuncu adları değiştirilir (Lukaku → Lakaka) ve kulüpler şehir + renk adıyla anılır. Yaş, uyruk, mevki, boy ve "ünlülük" gibi olgular açık kaynaklardan (Vikipedi kadro şablonları, Wikidata CC0) okunur; yetenek puanlarını oyun kendisi hesaplar. Gerçek isimler depoya yazılmaz. `araclar/kadro_turet.py` (isim türetici: `araclar/isim_turet.py`), iş akışı `cbm-kadro.yml` haftada bir.
