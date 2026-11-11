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

## Nutuk Salonu (VR)
`nutuk-salonu/` — Nutuk Salonu'nun VR salonu (WebXR). Kaynak: emreanduv/nutuk-akisi deposundaki `docs/salon/`; buraya kopyalanır (Meta Quest paketi bu adrese bağlanır, assetlinks bu alan adında). Gizlilik: https://emreanduv.github.io/nutuk-salonu/gizlilik.html
`kaptan-mecit-vr/` — Kaptan Mecit VR (WebXR, Meta Quest): gerçek boy stadyum + maket, 6 sabit koltuk (mide bulandırmayan kamera). Motor: `kaptanmecit.html` (emreanduv/kaptan-mecit deposundaki `www/index.html`'in kopyası; oyun güncellenince buraya da kopyalanır). Quest paketi: kaptan-mecit deposunda `km-vr-quest.yml` (com.anduv.kaptanmecit.vr). Gizlilik: https://emreanduv.github.io/kaptan-mecit-vr/gizlilik.html

## Sümer Ziguratı (VR)
`sumer-zigurati/` — Sümer Vitrini'nin VR'ı (WebXR, Meta Quest): Ur Ziguratı'nın tepesinde bir gece. Taş levhada kil tabletlerin satırları önce çivi yazısıyla parlar, sonra Türkçeye çözülür; rafta Gılgamış'ın 12 tableti, sunakta en sevilen 10 tablet ve ziyaretçinin adının çivi yazılı tableti; gökte o gecenin gerçek Ay evresi ve gezegenleri (yaklaşık), korkuluklarda Babil göğü, Efsane mi Gerçek mi ve kronoloji panoları.
- Veri: Mac'teki Sumerler klasöründe `python3 araclar/vr_veri.py` → `vr/veri.json` → buraya `sumer-zigurati/veri.json` olarak kopyalanır.
- three.js 0.160 (`sumer-zigurati/vendor/`, MIT) · yazı tipleri DM Sans, Barlow Condensed, Noto Sans Cuneiform (OFL) sayfanın içinde.
- Quest paketi: `.github/workflows/sumer-zigurati-quest.yml` (com.anduv.sumerzigurati) → `quest-sumer` dalı (imzasız) → Mac'te `Sumerler/vr-imzala.sh`.
- Gizlilik: https://emreanduv.github.io/sumer-zigurati/gizlilik.html
