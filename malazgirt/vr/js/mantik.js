/* Malazgirt Akıncıları — oyun mantığı (çizimden bağımsız).
   Tarayıcıda window.MANTIK olarak, Node'da require() ile kullanılır (denge testi: araclar/denge-testi.js). */
(function (root) {
'use strict';

/* ---------- yardımcılar ---------- */
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- sabitler ---------- */
const ROAD = 6;            // 2 şeritli yolun yarı genişliği (şerit sayısı arttıkça genişler: roadOf)
const SPEED = 9;           // ilk bölümdeki ileri yürüyüş hızı (speedOf ile bölüm bölüm artar)
const ARROW_V = 44, ARROW_LIFE = 0.75;   // ok menzili ≈ 33
const HERO_POW = 20, HERO_HP = 15, MAX_HERO = 3;
const MAX_COUNT = 999;
const crowdR = n => 0.34 * Math.sqrt(clamp(n, 1, 220));

const WEAPONS = [
  { ad: 'Sade Yay', m: 1, c: 0xf4ead2 },
  { ad: 'Kemankeş Yayı', m: 1.6, c: 0x8ff0f3 },
  { ad: 'Çifte Yay', m: 2.4, c: 0xa8d8ff },
  { ad: 'Ateşli Ok', m: 3.4, c: 0xff9a3c },
  { ad: 'Gök Tuğ Yayı', m: 4.6, c: 0xffe066 },
  { ad: 'Çelik Kirişli Yay', m: 6.2, c: 0xc9f2ff },
  { ad: 'Sultan Yayı', m: 8.2, c: 0xff7ad9 },
  { ad: 'Akkiriş Yayı', m: 10.8, c: 0xffffff },
  { ad: 'Gazi Yayı', m: 14, c: 0x7dffb0 },
  { ad: 'Yıldırım Yayı', m: 18, c: 0xfff15a },
  { ad: 'Fatih Yayı', m: 23, c: 0xffb04a },
  { ad: 'Kanuni Yayı', m: 29, c: 0xb8f0ff },
  { ad: 'Köprülü Yayı', m: 36, c: 0xff8a5a },
  { ad: 'Alparslan Yayı', m: 45, c: 0xfff6c8 },
  { ad: 'Mehter Yayı', m: 56, c: 0xffd27a },
  { ad: 'Cihan Yayı', m: 70, c: 0x9effff }
];
const TIER_CAP = [4, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 11, 11, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 15, 15, 15, 15];
const maxTier = i => TIER_CAP[Math.min(TIER_CAP.length - 1, seferOf(i))];

/* Düşman birlikleri. p = çatışmada bir erin kaç akıncı götürdüğü, hp = kaç ok gücüyle düştüğü, atli = süvari */
const FOES = {
  piyade:    { ad: 'Bizans Piyadesi',     hp: 1.0, p: 1.0, v: 4.2 },
  okcu:      { ad: 'Bizans Okçusu',       hp: 0.8, p: 0.6, v: 0,   ates: 0.05 },
  katafrakt: { ad: 'Katafrakt',           hp: 2.6, p: 2.4, v: 7.5, atli: 1 },
  varang:    { ad: 'Varang Muhafızı',     hp: 2.0, p: 1.9, v: 3.2 },
  akrit:     { ad: 'Akrit Süvarisi',      hp: 1.5, p: 1.4, v: 10,  atli: 1 },
  frank:     { ad: 'Haçlı Piyadesi',      hp: 1.2, p: 1.1, v: 4.0 },
  arbalet:   { ad: 'Arbaletçi',           hp: 1.0, p: 0.7, v: 0,   ates: 0.065 },
  sovalye:   { ad: 'Şövalye',             hp: 3.2, p: 3.0, v: 6.5, atli: 1 },
  kalkanli:  { ad: 'Kalkanlı Ağır Piyade', hp: 3.0, p: 1.5, v: 3.0 },
  latin:     { ad: 'Latin Paralı Askeri', hp: 1.4, p: 1.3, v: 4.2 },
  alan:      { ad: 'Alan Süvarisi',       hp: 2.0, p: 1.8, v: 9,   atli: 1 },
  katalan:   { ad: 'Katalan Paralı Askeri', hp: 2.2, p: 2.0, v: 4.5 },
  sirppiyade:{ ad: 'Sırp Piyadesi',       hp: 1.5, p: 1.3, v: 4.0 },
  sirpsovalye:{ ad: 'Sırp Ağır Süvarisi',  hp: 3.4, p: 3.2, v: 6.5, atli: 1 },
  macar:     { ad: 'Macar Süvarisi',      hp: 2.6, p: 2.4, v: 8,   atli: 1 },
  tufekci:   { ad: 'Araba Tüfekçisi',     hp: 1.2, p: 0.8, v: 0,   ates: 0.08 },
  ceneviz:   { ad: 'Ceneviz Zırhlısı',    hp: 2.4, p: 2.1, v: 3.6 },
  venedik:   { ad: 'Venedik Piyadesi',    hp: 1.8, p: 1.6, v: 4.2 },
  arkebuz:   { ad: 'Arkebüzcü',           hp: 1.3, p: 0.8, v: 0,   ates: 0.09 },
  hirvat:    { ad: 'Hırvat Piyadesi',     hp: 2.0, p: 1.8, v: 4.0 },
  zirhli:    { ad: 'Zırhlı Macar Şövalyesi', hp: 4.2, p: 3.8, v: 6.5, atli: 1 },
  rodos:     { ad: 'Rodos Şövalyesi',     hp: 3.8, p: 3.2, v: 3.0 },
  husar:     { ad: 'Macar Hafif Süvarisi', hp: 2.4, p: 2.2, v: 10.5, atli: 1 },
  landsknecht:{ ad: 'Alman Paralı Askeri', hp: 2.6, p: 2.3, v: 4.2 },
  kirasiyer: { ad: 'Habsburg Kürasiyeri',  hp: 4.6, p: 4.0, v: 7,   atli: 1 },
  muskeci:   { ad: 'Tüfekçi',             hp: 1.4, p: 0.9, v: 0,   ates: 0.1 },
  stradiot:  { ad: 'Stradiot Süvarisi',   hp: 2.4, p: 2.2, v: 11,  atli: 1 },
  kanatlihusar:{ ad: 'Kanatlı Süvari',    hp: 5.0, p: 4.4, v: 8,   atli: 1 },
  kazak:     { ad: 'Kazak Süvarisi',      hp: 2.2, p: 2.0, v: 11.5, atli: 1 },
  rusasker:  { ad: 'Rus Piyadesi',        hp: 2.6, p: 2.2, v: 4.2 },
  grenadiyer:{ ad: 'Rus Grenadiyeri',     hp: 3.4, p: 3.0, v: 4.0 },
  avusturyapiyade:{ ad: 'Avusturya Piyadesi', hp: 3.2, p: 2.8, v: 4.4 },
  fransizpiyade:{ ad: 'Fransız Piyadesi',  hp: 3.6, p: 3.0, v: 4.8 },
  fransizsuvari:{ ad: 'Fransız Ejder Süvarisi', hp: 4.8, p: 4.2, v: 9.5, atli: 1 },
  nisanci:   { ad: 'Nişancı',             hp: 1.6, p: 1.0, v: 0,   ates: 0.12 },
  yunanpiyade:{ ad: 'Yunan Piyadesi',     hp: 3.4, p: 2.8, v: 4.4 }
};
/* her seferde sahaya çıkan birlikler: [birlik, ilk bölüm (genel sıra)] */
const POOLS = [
  [['piyade', 0], ['katafrakt', 19], ['varang', 31]],
  [['piyade', 50], ['katafrakt', 50], ['varang', 50], ['akrit', 50]],
  [['frank', 100], ['sovalye', 103]],
  [['piyade', 150], ['katafrakt', 150], ['varang', 150], ['kalkanli', 150]],
  [['latin', 200], ['katafrakt', 200], ['akrit', 200], ['kalkanli', 205]],
  [['piyade', 250], ['katafrakt', 250], ['kalkanli', 250], ['varang', 250], ['alan', 250]],
  [['piyade', 300], ['kalkanli', 300], ['varang', 300], ['katalan', 300], ['alan', 300]],
  [['sirppiyade', 350], ['sirpsovalye', 353], ['kalkanli', 350]],
  [['frank', 400], ['sovalye', 400], ['macar', 400]],
  [['frank', 450], ['sovalye', 450], ['macar', 450]],
  [['piyade', 500], ['ceneviz', 500], ['kalkanli', 500], ['venedik', 510]],
  [['venedik', 550], ['sirppiyade', 550], ['macar', 550], ['ceneviz', 550], ['sirpsovalye', 555]],
  [['hirvat', 600], ['macar', 600], ['zirhli', 603], ['rodos', 630]],
  [['hirvat', 650], ['husar', 650], ['zirhli', 650], ['landsknecht', 655]],
  [['landsknecht', 700], ['husar', 700], ['zirhli', 700], ['hirvat', 700]],
  [['hirvat', 750], ['landsknecht', 750], ['kirasiyer', 753]],
  [['venedik', 800], ['ceneviz', 800], ['stradiot', 803]],
  [['landsknecht', 850], ['kirasiyer', 850], ['hirvat', 850], ['husar', 850]],
  [['venedik', 900], ['ceneviz', 900], ['stradiot', 900], ['landsknecht', 930]],
  [['landsknecht', 950], ['kirasiyer', 950, 970], ['hirvat', 950, 970], ['kazak', 970], ['kanatlihusar', 973]],
  [['rusasker', 1000], ['kazak', 1000], ['grenadiyer', 1005]],
  [['piyade', 1050], ['katafrakt', 1050], ['varang', 1050], ['sovalye', 1052], ['zirhli', 1054], ['kirasiyer', 1056], ['kanatlihusar', 1058], ['grenadiyer', 1060]],
  [['venedik', 1071], ['ceneviz', 1071], ['stradiot', 1071]],
  [['avusturyapiyade', 1121], ['kirasiyer', 1121], ['husar', 1124]],
  [['avusturyapiyade', 1171], ['kirasiyer', 1171], ['husar', 1171], ['hirvat', 1171]],
  [['fransizpiyade', 1221], ['fransizsuvari', 1224]],
  [['rusasker', 1271], ['kazak', 1271], ['grenadiyer', 1271]],
  [['rusasker', 1321], ['grenadiyer', 1321], ['kazak', 1321]],
  [['yunanpiyade', 1371]],
  [['venedik', 1421], ['avusturyapiyade', 1422], ['fransizpiyade', 1424], ['rusasker', 1426], ['yunanpiyade', 1428], ['piyade', 1431], ['ceneviz', 1431], ['varang', 1431], ['kalkanli', 1431]]
];
const ARCHER = ['okcu', 'okcu', 'arbalet', 'okcu', 'arbalet', 'okcu', 'okcu', 'okcu', 'arbalet', 'tufekci', 'arbalet', 'arbalet', 'arkebuz', 'arkebuz', 'arkebuz',
  'muskeci', 'muskeci', 'muskeci', 'muskeci', 'muskeci', 'muskeci', 'okcu', 'muskeci', 'muskeci', 'muskeci', 'nisanci', 'nisanci', 'nisanci', 'nisanci', 'arbalet'];
const BASE_FOE = ['piyade', 'akrit', 'frank', 'kalkanli', 'latin', 'piyade', 'piyade', 'sirppiyade', 'frank', 'frank', 'piyade', 'venedik', 'hirvat', 'hirvat', 'landsknecht',
  'hirvat', 'venedik', 'landsknecht', 'venedik', 'landsknecht', 'rusasker', 'piyade', 'venedik', 'avusturyapiyade', 'avusturyapiyade', 'fransizpiyade', 'rusasker', 'rusasker', 'yunanpiyade', 'piyade'];

const UPG = [
  { k: 'start', ad: 'Akıncı Ocağı',  base: 45, desc: l => (3 + 2 * l) + ' akıncıyla yola çık' },
  { k: 'dmg',   ad: 'Ok Ucu',        base: 55, desc: l => 'Ok gücü ×' + (1 + 0.15 * l).toFixed(2) },
  { k: 'rate',  ad: 'Kemankeşhane',  base: 65, desc: l => 'Atış hızı ×' + (1 + 0.1 * l).toFixed(1) },
  { k: 'zirh',  ad: 'Zırhçı Ocağı',  base: 75, desc: l => 'Çatışma kaybı −%' + Math.round(100 * zirhOf(l)) }
];
const UPMAX = 60;
const upCap = sefer => Math.min(UPMAX, 10 + 5 * sefer);   // her yeni sefer Ordugâh'ı 5 basamak açar
function zirhOf(l) { return l <= 10 ? 0.045 * l : l <= 30 ? 0.45 + 0.01 * (l - 10) : Math.min(0.75, 0.65 + 0.004 * (l - 30)); }
function upCost(u, l) { return Math.round(u.base * Math.pow(1.42, Math.min(l, 10)) * Math.pow(1.16, Math.min(20, Math.max(0, l - 10))) * Math.pow(1.07, Math.max(0, l - 30))); }
function stats(up) {
  return { start: 3 + 2 * (up.start || 0), dmg: 1 + 0.15 * (up.dmg || 0), rate: 1 + 0.1 * (up.rate || 0), zirh: zirhOf(up.zirh || 0) };
}

/* ---------- seferler: her sefer 5 bölge × 10 bölüm ---------- */
const SEFERLER = [
  { ad: 'Malazgirt', yil: '1071', alt: 'Sultan Alparslan\'ın seferi', zafer: 'MALAZGİRT!',
    epilog: '26 Ağustos 1071. Bizans ordusu dağıldı, İmparator Romen Diyojen esir düştü. Sultan Alparslan onu bağışlayıp serbest bıraktı. Anadolu\'nun kapıları açıldı.' },
  { ad: 'Anadolu\'ya Akın', yil: '1072–1075', alt: 'Süleyman Şah ile batıya', zafer: 'İZNİK!',
    epilog: '1075. Süleyman Şah İznik\'e girdi ve şehri Anadolu Selçuklu Devleti\'nin ilk başkenti yaptı. Akıncılar Marmara\'nın kıyısına vardı.' },
  { ad: 'Haçlılara Karşı', yil: '1096–1101', alt: 'Sultan Kılıç Arslan\'ın savunması', zafer: 'EREĞLİ!',
    epilog: '1101. Üç büyük Haçlı ordusu Anadolu bozkırında dağıldı. Kılıç Arslan başkentini Konya\'ya taşıdı; Türkmenler Anadolu\'da kök saldı.' },
  { ad: 'Miryokefalon', yil: '1176', alt: 'II. Kılıç Arslan\'ın zaferi', zafer: 'MİRYOKEFALON!',
    epilog: '17 Eylül 1176. Bizans ordusu dağ geçidinde dağıldı. İmparator Manuel barış istedi. Artık Anadolu, Türk yurdudur.' },
  { ad: 'Selçuklu\'nun Zirvesi', yil: '1207–1225', alt: 'İki denize açılan sultanlık', zafer: 'SUĞDAK!',
    epilog: '1225. Antalya, Sinop ve Alanya\'dan sonra Selçuklu akıncıları Karadeniz\'i aşıp Kırım\'a çıktı. Kervansaraylar yolları, tersaneler denizleri tutuyor.' },
  { ad: 'Uç Beylikleri', yil: '1261–1302', alt: 'Söğüt\'ten doğan beylik', zafer: 'KOYUNHİSAR!',
    epilog: '27 Temmuz 1302. Osman Gazi Koyunhisar\'da Bizans ordusunu dağıttı. Uçtaki küçük beylik artık bir devletin kapısını aralıyor.' },
  { ad: 'Rumeli\'ye Geçiş', yil: '1326–1361', alt: 'Orhan Gazi ve Süleyman Paşa', zafer: 'EDİRNE!',
    epilog: 'Bursa başkent oldu, akıncılar sallarla Çanakkale\'yi geçti. Edirne alındı; Rumeli\'nin kapısı ardına kadar açıldı.' },
  { ad: 'Kosova', yil: '1364–1389', alt: 'Sultan I. Murad\'ın seferi', zafer: 'KOSOVA!',
    epilog: '15 Haziran 1389. Kosova Ovası\'nda Balkan ittifakı dağıldı. Sultan Murad şehit düştü; Yıldırım Bayezid ordunun başına geçti.' },
  { ad: 'Niğbolu', yil: '1395–1396', alt: 'Yıldırım Bayezid\'in seferi', zafer: 'NİĞBOLU!',
    epilog: '25 Eylül 1396. Avrupa\'nın en kalabalık Haçlı ordusu Tuna kıyısında dağıldı. Yıldırım Bayezid\'in adı Avrupa\'da duyuldu.' },
  { ad: 'Varna', yil: '1443–1444', alt: 'Sultan II. Murad\'ın seferi', zafer: 'VARNA!',
    epilog: '10 Kasım 1444. Varna\'da son büyük Haçlı ordusu dağıldı. Balkanlar\'ın yolu açıldı; sırada İstanbul var.' },
  { ad: 'İstanbul\'un Fethi', yil: '1452–1453', alt: 'Sultan II. Mehmed\'in seferi', zafer: 'FETİH!',
    epilog: '29 Mayıs 1453. Surlarda açılan gedikten giren ordu şehre girdi. Sultan II. Mehmed artık Fatih; İstanbul yeni başkent oldu. Bir çağ kapandı, yenisi açıldı.' },
  { ad: 'Fatih\'in Seferleri', yil: '1459–1480', alt: 'Mora\'dan Trabzon\'a, Bosna\'dan Otranto\'ya', zafer: 'OTRANTO!',
    epilog: '1480. Gedik Ahmed Paşa İtalya kıyısında Otranto\'ya çıktı. Semendire, Mora, Trabzon, Bosna ve Eğriboz\'dan sonra Fatih\'in sancağı iki denizin kıyısında dalgalanıyor.' },
  { ad: 'Belgrad ve Rodos', yil: '1521–1522', alt: 'Sultan Süleyman\'ın ilk seferleri', zafer: 'RODOS!',
    epilog: 'Aralık 1522. Altı ay süren kuşatmadan sonra Rodos Şövalyeleri adayı bırakıp gitti. Belgrad ve Rodos\'la Tuna\'nın ve Ege\'nin kapıları açıldı.' },
  { ad: 'Mohaç', yil: '1526', alt: 'Kanuni\'nin Macaristan seferi', zafer: 'MOHAÇ!',
    epilog: '29 Ağustos 1526. Mohaç Ovası\'nda Macar ordusu iki saat içinde dağıldı. Kral kaçarken bataklıkta can verdi; Budin\'in kapıları açıldı.' },
  { ad: 'Budin', yil: '1529–1541', alt: 'Tuna boyunda on beş yıl', zafer: 'BUDİN!',
    epilog: '29 Ağustos 1541. Mohaç\'tan tam on beş yıl sonra Sultan Süleyman Budin\'e girdi. Budin artık bir eyaletin merkezi; Tuna boyu Türk sancaklarıyla doldu.' },
  { ad: 'Zigetvar', yil: '1566', alt: 'Kanuni\'nin son seferi', zafer: 'ZİGETVAR!',
    epilog: '7 Eylül 1566. Zigetvar Kalesi düştü. Sultan Süleyman zaferi göremeden, kuşatmanın son gecesi ordugâhında vefat etti; ölümü günlerce ordudan gizlendi.' },
  { ad: 'Kıbrıs', yil: '1570–1571', alt: 'Lala Mustafa Paşa\'nın seferi', zafer: 'MAĞUSA!',
    epilog: '1 Ağustos 1571. Aylarca süren kuşatmadan sonra Mağusa teslim oldu. Kıbrıs adası artık bir Osmanlı eyaleti.' },
  { ad: 'Haçova', yil: '1596', alt: 'Sultan III. Mehmed\'in seferi', zafer: 'HAÇOVA!',
    epilog: '26 Ekim 1596. Haçova bataklığında Habsburg ordusu dağıldı. Eğri Kalesi\'nden sonra kazanılan bu meydan savaşı Tuna boyunda dengeyi yeniden kurdu.' },
  { ad: 'Girit', yil: '1645–1669', alt: 'Kandiye\'nin uzun kuşatması', zafer: 'KANDİYE!',
    epilog: '6 Eylül 1669. Yirmi dört yıl süren kuşatmanın sonunda Kandiye teslim oldu. Girit adası Osmanlı topraklarına katıldı.' },
  { ad: 'Uyvar ve Kamaniçe', yil: '1663–1672', alt: 'Köprülüler devri', zafer: 'KAMANİÇE!',
    epilog: '27 Ağustos 1672. Kayalık bir burnun üstündeki Kamaniçe Kalesi teslim oldu. Uyvar\'dan sonra Lehistan seferi de zaferle bitti; devlet en geniş sınırlarına ulaştı.' },
  { ad: 'Prut', yil: '1711', alt: 'Baltacı Mehmed Paşa\'nın seferi', zafer: 'PRUT!',
    epilog: '22 Temmuz 1711. Prut kıyısında kuşatılan Rus ordusu barış istemek zorunda kaldı. Azak geri alındı.' },
  { ad: 'Malazgirt\'e Dönüş', yil: '1071', alt: 'Her şeyin başladığı ova', zafer: 'MALAZGİRT!', nb: 3,
    epilog: '26 Ağustos 1071\'de bir avuç akıncıyla başlayan yol, 1071 bölüm sonra yine Malazgirt Ovası\'nda tamamlandı. Asırlar boyu taşınan sancak artık senin elinde, Akıncı Bey.' },
  { ad: 'Mora', yil: '1715', alt: 'Damat Ali Paşa\'nın seferi', zafer: 'MORA!',
    epilog: '1715. Yüz gün içinde Mora yarımadasının bütün kaleleri geri alındı. Venedik Mora\'dan çekildi.' },
  { ad: 'Belgrad', yil: '1737–1739', alt: 'Hisarcık ve Belgrad', zafer: 'BELGRAD!',
    epilog: '18 Eylül 1739. Hisarcık zaferinin ardından kuşatılan Belgrad, Belgrad Antlaşması ile yeniden Osmanlı topraklarına katıldı.' },
  { ad: 'Şebeş', yil: '1788', alt: 'Koca Yusuf Paşa\'nın seferi', zafer: 'ŞEBEŞ!',
    epilog: 'Eylül 1788. Şebeş\'te gece paniğe kapılan Habsburg ordusu kendi kendini dağıttı. Osmanlı ordusu Banat\'a girdi.' },
  { ad: 'Akka', yil: '1799', alt: 'Cezzar Ahmed Paşa\'nın savunması', zafer: 'AKKA!',
    epilog: '20 Mayıs 1799. Altmış iki gün süren kuşatmanın sonunda Napolyon Akka önlerinden çekilmek zorunda kaldı. Doğu seferi Akka surlarında bitti.' },
  { ad: 'Silistre', yil: '1853–1854', alt: 'Tuna\'da Kırım Savaşı', zafer: 'SİLİSTRE!',
    epilog: 'Haziran 1854. Kırk günlük kuşatmanın sonunda Rus ordusu Silistre önlerinden çekildi. Arap Tabya\'nın savunması destan oldu.' },
  { ad: 'Plevne', yil: '1877', alt: 'Gazi Osman Paşa\'nın savunması', zafer: 'PLEVNE!',
    epilog: '11 Eylül 1877. Üçüncü büyük hücum da tabyaların önünde dağıldı. Gazi Osman Paşa\'nın aylarca süren savunması bütün dünyaya destan oldu.' },
  { ad: 'Dömeke', yil: '1897', alt: 'Ethem Paşa\'nın seferi', zafer: 'DÖMEKE!',
    epilog: '17 Mayıs 1897. Dömeke sırtlarında kazanılan zaferle Teselya yolu açıldı; Otuz Gün Savaşı Osmanlı zaferiyle sona erdi.' },
  { ad: 'Fetih Yolu', yil: '1453', alt: 'Bin dört yüz elli üçüncü bölüme', zafer: 'FETİH!', nb: 3,
    epilog: '29 Mayıs 1453\'te açılan gedikten bir çağ geçmişti. 1453 bölüm sonra sancak yine İstanbul surlarında. Şehir senin, Akıncı Bey.' }
];
const SOON = { ad: 'Yeni Seferler', alt: 'Pek yakında' };

const REGIONS = [
  { ad: 'Fırat Boyları', alt: 'Halep\'ten kuzeye',
    names: ['Halep Kapısı', 'Menbiç Yolu', 'Fırat Geçidi', 'Urfa Ovası', 'Harran Surları', 'Siverek Tepeleri', 'Karacadağ', 'Diyarbekir Önleri', 'Silvan Yolu', 'Hasankeyf Köprüsü'],
    bosses: ['kumandan', 'duka'],
    lines: ['Sultan Alparslan Halep kuşatmasını kaldırdı. Akıncılar kuzeye, Bizans ordusunun önüne gönderildi.',
            'Fırat\'ın suyu bulanık, yollar uzun. Sancağı yüksek tut, akıncıları dağıtma.',
            'Keşif kolu ileride Bizans öncülerini gördü. Önce okla karşıla, sonra dal.'] },
  { ad: 'Azerbaycan Yaylaları', alt: 'Hoy\'da ordu toplanıyor',
    names: ['Hoy Ordugâhı', 'Selmas Geçidi', 'Urmiye Kıyısı', 'Maku Boğazı', 'Ağrı Eteği', 'Diyadin Sıcak Suları', 'Doğubeyazıt Yaylası', 'Patnos Düzü', 'Tendürek Yamacı', 'Erciş Kalesi'],
    bosses: ['kumandan', 'strategos'],
    lines: ['Yaylalardan Türkmen boyları katılıyor. Her kapıdan doğru tarafı seç, ordu büyüsün.',
            'Rüzgâr sert, oklar sapmasın. Kemankeşlere iyi yay bul.',
            'Bizans okçuları tepelere dizilmiş. Menzillerine girmeden önce oklarını konuştur.'] },
  { ad: 'Van Gölü Kıyısı', alt: 'Ahlat\'tan batıya',
    names: ['Ahlat Kümbetleri', 'Adilcevaz Limanı', 'Süphan Eteği', 'Tatvan Yolu', 'Nemrut Kalderası', 'Gevaş Bahçeleri', 'Van Kalesi Önü', 'Muradiye Şelalesi', 'Ercek Gölü', 'Çaldıran Ovası'],
    bosses: ['strategos', 'katafraktbasi'],
    lines: ['Göl kıyısında ağır zırhlı Katafraktlar görüldü. Atlarına ok yağdır, yakına gelmesinler.',
            'Ahlat\'ın taş ustaları sancağımızı bekliyor. Yolu aç, Akıncı Bey.',
            'Düşman kazıklı barikatlar dikmiş. Okla kır ya da öbür yandan dolaş.'] },
  { ad: 'Murat Vadisi', alt: 'Malazgirt\'e son konaklar',
    names: ['Bulanık Köprüsü', 'Hınıs Geçidi', 'Varto Sırtları', 'Murat Kıyısı', 'Muş Ovası', 'Karlıova', 'Tekman Yaylası', 'Liz Ormanı', 'Zernak Tepesi', 'Çökek Pınarı'],
    bosses: ['katafraktbasi', 'varangbasi'],
    lines: ['İmparatorun Varang Muhafızları vadiye indi. Baltaları ağır, sabırlı ol.',
            'Murat\'ın suyu soğuk, akıncının yüreği sıcak. Kapıları akıllı seç.',
            'Bizans ordusu bölündü. Önündeki kolu dağıt, ana orduya yol aç.'] },
  { ad: 'Malazgirt Ovası', alt: '26 Ağustos 1071',
    names: ['Malazgirt Kalesi', 'Ahlat Yolu', 'Rahva Düzü', 'Cuma Namazı', 'Hilal Tuzağı', 'Geri Çekiliş', 'Kanatlar Kapanıyor', 'Karargâh Çadırları', 'Varang Hattı', 'İmparatorun Sancağı'],
    bosses: ['varangbasi', 'imparator'],
    lines: ['Sultan beyaz giydi: "Bugün ya zafer ya şehadet." Akıncılar hilal düzenine geçiyor.',
            'Geri çekilir gibi yap, düşmanı içeri çek, sonra kanatlardan kapan.',
            'Ova toz duman. Sancağı düşürme, Anadolu\'nun kapısı bu ovada açılacak.'] },
  /* ---- 2. sefer: Anadolu'ya Akın ---- */
  { ad: 'Kapadokya', alt: 'Kayseri\'den batıya',
    names: ['Kayseri Ovası', 'Erciyes Eteği', 'Talas Bağları', 'Ürgüp Vadisi', 'Göreme Bacaları', 'Nevşehir Yolu', 'Hasandağı', 'Aksaray Hanı', 'Niğde Kalesi', 'Ihlara Kanyonu'],
    bosses: ['akritbeyi', 'kumandan'],
    lines: ['Malazgirt\'ten sonra Anadolu açıldı. Süleyman Şah akıncıları batıya, peri bacalarının arasından geçiriyor.',
            'Bizans sınır boylarını Akrit süvarileri tutuyor. Hızlı gelirler, okla erken karşıla.',
            'Kapadokya\'nın vadileri dar ve kıvrımlı. Kapılarda acele etme, doğru tarafı seç.'] },
  { ad: 'Konya Ovası', alt: 'Bozkırın kalbi',
    names: ['Ereğli Pınarı', 'Karapınar Kumları', 'Çumra Tarlaları', 'Çatalhöyük', 'Konya Önleri', 'Meram Bağları', 'Sille Vadisi', 'Kadınhanı', 'Ilgın Kaplıcası', 'Akşehir Gölü'],
    bosses: ['sinirdukasi', 'strategos'],
    lines: ['Bozkırda Bizans kervanları dolaşıyor. Kervanı okla durdur, ganimet akçe olarak hazineye gelsin.',
            'Ova geniş, rüzgâr serin. Konya yakında Türk yurdu olacak.',
            'Sınır Dukası ovaya asker yığmış. Önce okçuları sustur, sonra dal.'] },
  { ad: 'Frigya Yaylası', alt: 'Afyon\'dan kuzeye',
    names: ['Bolvadin Köprüsü', 'Afyon Kayası', 'İhsaniye Yaylası', 'Frig Vadisi', 'Midas Anıtı', 'Seyitgazi', 'Kütahya Yolu', 'Tavşanlı Geçidi', 'Domaniç Ormanı', 'İnegöl Ovası'],
    bosses: ['akritbeyi', 'katafraktbasi'],
    lines: ['Eski Frig kayaları sessiz tanık. Akıncılar yaylayı tozla dumana katıyor.',
            'Katafraktlar yaylaya çıktı. Ateşli Ok bulursan sakın bırakma.',
            'Kuzeye, denize doğru. Her kapı orduna yeni bir yiğit katabilir.'] },
  { ad: 'Bitinya Ormanları', alt: 'Sakarya\'yı geçerken',
    names: ['Bilecik Sırtları', 'Söğüt Yaylası', 'Osmaneli Köprüsü', 'Sakarya Kıyısı', 'Geyve Boğazı', 'Pamukova', 'Mekece Geçidi', 'Yenişehir Ovası', 'Orhangazi Yolu', 'Gemlik Körfezi'],
    bosses: ['sinirdukasi', 'varangbasi'],
    lines: ['Sakarya\'nın kıyısı ormanlık. Pusuya dikkat, Varanglar ağaçların arasında.',
            'Bir gün bu topraklardan büyük bir devlet doğacak. Bugün yolu akıncılar açıyor.',
            'Gemlik\'ten deniz kokusu geliyor. İznik çok yakın.'] },
  { ad: 'İznik', alt: '1075 · Süleyman Şah\'ın başkenti',
    names: ['İznik Gölü', 'Lefke Kapısı', 'Yenişehir Kapısı', 'Göl Kapısı', 'İstanbul Kapısı', 'Surlar Önü', 'Kule Baskını', 'Su Kemerleri', 'Saray Yolu', 'Başkent İznik'],
    bosses: ['katafraktbasi', 'iznikdukasi'],
    lines: ['İznik\'in surları gölün kıyısında yükseliyor. Kapılar birer birer açılacak.',
            'Süleyman Şah İznik\'i başkent yapmak istiyor. Akıncılar öncü.',
            'Surların üstünde Bizans okçuları. Önce sen vur, sonra yaklaş.'] },
  /* ---- 3. sefer: Haçlılara Karşı ---- */
  { ad: 'Marmara Kıyısı', alt: '1096 · Haçlılar geliyor',
    names: ['Kibotos Kıyısı', 'Civetot Ordugâhı', 'Drakon Deresi', 'Halkalı Yokuş', 'Hersek Burnu', 'Karamürsel Yolu', 'Haçlı Öncüleri', 'İznik Ovası', 'Surlara Dönüş', 'Gece Çıkışı'],
    bosses: ['sovalyebasi', 'frankkontu'],
    lines: ['Avrupa\'dan Haçlı orduları geldi. Sultan Kılıç Arslan akıncılarını sahile gönderdi.',
            'Haçlı piyadeleri kalabalık ama dağınık. Kapılardan büyük çık, sonra okla karşıla.',
            'Arbaletçilerin okları sert. Menzile girmeden önce sayılarını erit.'] },
  { ad: 'Sakarya Vadisi', alt: 'Kılıç Arslan geri çekiliyor',
    names: ['Lefke Boğazı', 'Vezirhan', 'Sakarya Ormanı', 'Bozüyük Yolu', 'Karaköy Sırtı', 'Sarıcakaya', 'Gölpazarı', 'Pazaryeri', 'Kovalıca Tepesi', 'Çukurhisar'],
    bosses: ['sovalyebasi', 'katafraktbasi'],
    lines: ['Haçlılar mancınık kurdu. Yolda gölgesi düşen yere taş iner: o halkadan uzak dur.',
            'Geri çekil, düşmanı vadiye çek. Sonra tepelerden ok yağdır.',
            'Şövalyeler demir zırhlı. Yaklaşmadan önce en güçlü yayını bul.'] },
  { ad: 'Dorylaion', alt: '1 Temmuz 1097',
    names: ['Eskişehir Ovası', 'Porsuk Kıyısı', 'Bozdağ Sırtları', 'Sabah Baskını', 'Haçlı Ordugâhı', 'Atlı Okçular', 'Bataklık Kenarı', 'Öğle Sıcağı', 'İkinci Haçlı Kolu', 'Dorylaion Meydanı'],
    bosses: ['frankkontu', 'normandukasi'],
    lines: ['Şafak vakti Türk atlı okçuları Haçlı ordugâhını sardı. Yay çek, dağılma.',
            'Haçlı ordusu ikiye bölünmüş. Önündekini dağıt, ikinci kol gelmeden.',
            'Temmuz sıcağı zırhlıları yoruyor. Hızlı ol, Akıncı Bey.'] },
  { ad: 'Orta Anadolu', alt: 'Susuz yollar',
    names: ['Akşehir Yaylası', 'Philomelion', 'Sultandağı Eteği', 'Ilgın Yolu', 'Kuyular Kurudu', 'Konya Surları', 'Karaman Ovası', 'Toros Yolu', 'Kızılırmak Geçidi', 'Merzifon Düzlüğü'],
    bosses: ['sovalyebasi', 'frankkontu'],
    lines: ['Sultan kuyuları kurutup Haçlıları susuz bıraktı. Yollar uzun, zırhlar ağır.',
            'Mancınık taşları yine yağıyor. Halkanın gölgesine dikkat.',
            'Toros\'a doğru çekilen Haçlıları kovala. Yolu kapat.'] },
  { ad: 'Ereğli', alt: '1101 · Son Haçlı dalgası',
    names: ['Ereğli Pınarları', 'Merzifon Ovası', 'Lombard Kolu', 'Nevers Kolu', 'Akarsu Başı', 'Pusu Vadisi', 'Kuru Dere', 'Toros Kapısı', 'Sancak Tepesi', 'Ereğli Zaferi'],
    bosses: ['normandukasi', 'haclibasi'],
    lines: ['1101 yazı: üç Haçlı ordusu birbiri ardına Anadolu\'ya girdi. Hepsini karşıla.',
            'Kılıç Arslan ve Danişmend Gazi omuz omuza. Akıncılar öncü.',
            'Ereğli pınarlarında son hesaplaşma. Haçlı sancağını düşür.'] },
  /* ---- 4. sefer: Miryokefalon ---- */
  { ad: 'Konya Savunması', alt: '1176 · Bizans geri döndü',
    names: ['Konya Kalesi', 'Alaeddin Tepesi', 'Meram Çayı', 'Kızılören Hanı', 'Beyşehir Yolu', 'Seydişehir', 'Kubadabad', 'Bozkır Yaylası', 'Suğla Gölü', 'Akkaya'],
    bosses: ['kalkanbasi', 'strategos'],
    lines: ['İmparator Manuel büyük bir orduyla Konya\'ya yürüyor. Sultan II. Kılıç Arslan akıncılarını çağırdı.',
            'Kalkanlı ağır piyadeler yavaş ama sağlam. Okun gücü yetmezse yanlarından dolaş.',
            'Konya Selçuklu\'nun başkenti. Bir adım geri yok.'] },
  { ad: 'Göller Bölgesi', alt: 'Eğirdir\'den Burdur\'a',
    names: ['Eğirdir Gölü', 'Can Ada', 'Yalvaç Harabeleri', 'Gelendost', 'Barla Dağı', 'Isparta Bağları', 'Ağlasun', 'Sagalassos Yolu', 'Burdur Gölü', 'Keçiborlu'],
    bosses: ['mancinikustasi', 'katafraktbasi'],
    lines: ['Göllerin arasından Bizans ağırlıkları ilerliyor. Kuşatma makineleri de yanlarında.',
            'Mancınık Ustası taş yağdırıyor. Gölgeler düşmeden yolunu değiştir.',
            'Gölün suyu berrak, ordunun yolu çetin.'] },
  { ad: 'Sultan Dağları', alt: 'Dağ yolları',
    names: ['Sultandağı Zirvesi', 'Çay Ovası', 'Bolvadin Gölü', 'Şuhut Yaylası', 'Dinar Pınarı', 'Çivril Ovası', 'Homa Geçidi', 'Menderes Kaynağı', 'Işıklı Gölü', 'Dağlar Arası'],
    bosses: ['kalkanbasi', 'varangbasi'],
    lines: ['Dağ yolları daralıyor. Dar geçitte kalabalık ordu sıkışır, bir kısmı geride kalır.',
            'Bizans ordusu dağlara girdi. Pusu kurmanın tam zamanı.',
            'Menderes\'in kaynağından batıya. Varanglar yine imparatorun yanında.'] },
  { ad: 'Tzivritze Geçidi', alt: 'Pusu hazırlanıyor',
    names: ['Geçit Ağzı', 'Kartal Kayalıkları', 'Dar Boğaz', 'Toz Bulutu', 'Bizans Kervanı', 'Ağırlık Arabaları', 'Yamaçtaki Okçular', 'Kayalar Yuvarlanıyor', 'Dağ Rüzgârı', 'Pusu Kapanıyor'],
    bosses: ['mancinikustasi', 'kalkanbasi'],
    lines: ['Bizans ordusu kilometrelerce uzayan bir kol halinde geçide girdi. Akıncılar tepelerde bekliyor.',
            'Geçit dar: ordunu büyütürken boğaza dikkat et.',
            'Ağırlık arabaları ganimet dolu. Kervanları durdur, hazine dolsun.'] },
  { ad: 'Miryokefalon', alt: '17 Eylül 1176',
    names: ['Miryokefalon Kalesi', 'İmparator Çadırı', 'Kuşatma Kulesi', 'Ağır Piyade Hattı', 'Sancak Muhafızları', 'Son Hücum', 'Toz Duman', 'Barış Elçileri', 'Bizans Dağılıyor', 'Anadolu Türk Yurdu'],
    bosses: ['varangbasi', 'manuel'],
    lines: ['Pusu kapandı. Bizans ordusu geçitte sıkıştı, akıncılar dört bir yandan iniyor.',
            'İmparatorun sancağı tepede. Muhafızlarını dağıt.',
            'Bu zaferden sonra Anadolu bir daha geri alınamayacak.'] },
  /* ---- 5. sefer: Selçuklu'nun Zirvesi ---- */
  { ad: 'Antalya', alt: '1207 · Akdeniz\'e iniş',
    names: ['Isparta Geçidi', 'Bucak Yaylası', 'Döşemealtı', 'Düden Şelalesi', 'Antalya Surları', 'Kaleiçi', 'Hadrian Kapısı', 'Konyaaltı Kıyısı', 'Liman Kulesi', 'Antalya Fethi'],
    bosses: ['latinkomutani', 'kalkanbasi'],
    lines: ['Sultan Keyhüsrev Akdeniz\'e iniyor. Antalya\'yı tutan Latin paralı askerleri surların önünde.',
            'Toroslar\'dan sahile yol uzun. Ordunu yolda büyüt, surlara güçlü var.',
            'Limanı tutan kule düşerse Akdeniz\'in kapısı açılır.'] },
  { ad: 'Sinop', alt: '1214 · Karadeniz\'e açılış',
    names: ['Kastamonu Yolu', 'Ilgaz Dağları', 'Boyabat Kalesi', 'Gerze Kıyısı', 'Sinop Burnu', 'Sinop Surları', 'İskele Kulesi', 'Hamsilos Koyu', 'Tersane Önü', 'Sinop Fethi'],
    bosses: ['trabzondukasi', 'strategos'],
    lines: ['Karadeniz\'in en güvenli limanı Sinop. Trabzon Dukası\'nın askerleri yolu kesti.',
            'Ilgaz\'ın ormanları serin, yollar dar. Mancınıklara dikkat.',
            'Denize iki taraftan açılan sultanlık doğuyor.'] },
  { ad: 'Alanya', alt: '1221 · Alaiye',
    names: ['Manavgat Şelalesi', 'Side Harabeleri', 'Kalonoros Yolu', 'Alara Çayı', 'Kızıl Kule', 'Alanya Kalesi', 'Tersane', 'Damlataş', 'İç Kale', 'Alaiye'],
    bosses: ['latinkomutani', 'katafraktbasi'],
    lines: ['Sultan Alaeddin Keykubad sarp kayalıktaki kaleyi istiyor. Kalonoros\'un kapıları sıkı.',
            'Kıyı yolu dar; kalabalık ordu kayalıklarda sıkışabilir.',
            'Kızıl Kule\'yi tutan Latin askerleri inatçı. Ok yağmurunu kesme.'] },
  { ad: 'Kervan Yolları', alt: 'Sultanhanı\'ndan Kayseri\'ye',
    names: ['Sultanhanı', 'Aksaray Yolu', 'Ağzıkarahan', 'Zazadin Hanı', 'Obruk Hanı', 'Kızılırmak Köprüsü', 'Sarıhan', 'Kayseri Yolu', 'Karatay Hanı', 'Kervan Kafilesi'],
    bosses: ['akritbeyi', 'kalkanbasi'],
    lines: ['Kervansaraylar yolları güvenli kılıyor. Haydutlaşan sınır atlıları kervanları vuruyor.',
            'Yol boyu ganimet kervanları var. Okla durdur, hazine dolsun.',
            'Selçuklu\'nun kervan yolu dünyanın ticaretini taşıyor. Yolu açık tut.'] },
  { ad: 'Suğdak', alt: '1225 · Kırım seferi',
    names: ['Sinop İskelesi', 'Karadeniz Geçişi', 'Suğdak Limanı', 'Kırım Kıyısı', 'Kıpçak Bozkırı', 'Rus Öncüleri', 'Suğdak Kalesi', 'Ceneviz Kulesi', 'Kale Kapısı', 'Suğdak Zaferi'],
    bosses: ['rusknezi', 'cenevizkaptani'],
    lines: ['Akıncılar gemilerle Karadeniz\'i aşıp Kırım\'a çıktı. Kıyıda Rus ve Kıpçak atlıları bekliyor.',
            'Bozkır geniş, atlılar hızlı. Okla erken karşıla.',
            'Suğdak limanı alınırsa Karadeniz ticareti Selçuklu\'nun olur.'] },
  /* ---- 6. sefer: Uç Beylikleri ---- */
  { ad: 'Söğüt', alt: 'Ertuğrul Gazi\'nin yurdu',
    names: ['Söğüt Yaylası', 'Domaniç Kışlağı', 'Ertuğrul Obası', 'Karacahisar Yolu', 'Karacahisar', 'Bilecik Pazarı', 'İnegöl Yolu', 'Kulaca Hisar', 'Eskişehir Ovası', 'Uç Sancağı'],
    bosses: ['tekfur', 'kumandan'],
    lines: ['Söğüt\'te küçük bir oba büyüyor. Uç boyunda tekfurların askerleri yolu kesiyor.',
            'Yaylada kışlak, ovada pazar. Akıncılar her gün biraz daha batıya.',
            'Tekfurun hisarı tepede. Önce okçularını sustur.'] },
  { ad: 'Sakarya Boyları', alt: 'Uçtan batıya',
    names: ['Sakarya Geçidi', 'Lefke Hisarı', 'Osmaneli', 'Geyve Boğazı', 'Akhisar', 'Karatekin', 'Taraklı', 'Göynük', 'Mudurnu Yolu', 'Sakarya Kıyısı'],
    bosses: ['tekfur', 'strategos'],
    lines: ['Sakarya\'nın kıyısındaki hisarlar birer birer düşüyor.',
            'Boğazlar dar, dağ yolları sarp. Geçitte sıkışma.',
            'Bizans sınır muhafızları geri çekiliyor. Peşlerini bırakma.'] },
  { ad: 'Bursa Ovası', alt: 'Uludağ\'ın eteği',
    names: ['Yenişehir', 'Yarhisar', 'Bilecik Hisarı', 'İnegöl', 'Ulubat Gölü', 'Uludağ Eteği', 'Kestel', 'Kaplıcalar', 'Bursa Önleri', 'Çekirge'],
    bosses: ['tekfur', 'katafraktbasi'],
    lines: ['Bursa ovası yemyeşil. Tekfurlar şehri kuşatmadan korumak istiyor.',
            'Uludağ\'dan inen sular soğuk, akıncının yüreği sıcak.',
            'Bursa\'yı saran hisarlar düşerse şehir yalnız kalır.'] },
  { ad: 'İznik Yolu', alt: 'Marmara kıyıları',
    names: ['Köprühisar', 'İznik Gölü', 'Yalakova', 'Karamürsel', 'Hersek', 'Dil İskelesi', 'Yalova Kıyısı', 'Armutlu', 'Gemlik', 'Sapanca Gölü'],
    bosses: ['alanbeyi', 'kalkanbasi'],
    lines: ['İmparator Alan süvarilerini paralı tuttu. Hızlı ve sert gelirler.',
            'Marmara\'nın kıyısında Bizans\'ın son kaleleri.',
            'Göl kıyısında pusu kur, düşmanı içeri çek.'] },
  { ad: 'Koyunhisar', alt: '27 Temmuz 1302',
    names: ['İzmit Yolu', 'Bafeus Ovası', 'Koyunhisar', 'Sabah Pususu', 'Bizans Alayı', 'Alan Kanadı', 'Ağır Piyade Hattı', 'Son Hücum', 'Ovada Zafer', 'Osman Gazi\'nin Sancağı'],
    bosses: ['alanbeyi', 'bizansbaskomutani'],
    lines: ['Bizans büyük bir ordu gönderdi. Osman Gazi\'nin akıncıları Koyunhisar\'da karşılıyor.',
            'Ova geniş, düşman kalabalık. Kapılardan büyük çık.',
            'Bu zafer küçük beyliği devlete dönüştürecek.'] },
  /* ---- 7. sefer: Rumeli'ye Geçiş ---- */
  { ad: 'Bursa', alt: '1326 · Yeni başkent',
    names: ['Bursa Kuşatması', 'Balabancık Kulesi', 'Hisar Kapısı', 'Pınarbaşı', 'Kaplıca Kapısı', 'Bursa Teslim', 'Çarşı Yolu', 'Yeni Başkent', 'Tophane Sırtı', 'Bursa Zaferi'],
    bosses: ['tekfur', 'kalkanbasi'],
    lines: ['Yıllar süren kuşatma bitmek üzere. Orhan Gazi Bursa\'nın kapılarında.',
            'Hendekler kazılmış. Köprüyü bul, ordunu karşıya geçir.',
            'Bursa düşerse beylik bir başkente kavuşur.'] },
  { ad: 'Pelekanon', alt: '1329 · İmparatora karşı',
    names: ['Eskihisar', 'Darıca', 'Pelekanon', 'Maltepe Sırtları', 'Kartal Kıyısı', 'Gece Baskını', 'İmparator Çekiliyor', 'Gebze Yolu', 'Dil Burnu', 'Pelekanon Zaferi'],
    bosses: ['katalanbasi', 'varangbasi'],
    lines: ['İmparator ordusuyla İznik\'i kurtarmaya geliyor. Katalan paralı askerleri de yanında.',
            'Sırtlardan ok yağdır, ovada çarpışmaya girme.',
            'Gece baskınında Bizans ordusu dağılıyor. Peşlerini bırakma.'] },
  { ad: 'İznik ve İzmit', alt: '1331–1337',
    names: ['İznik Surları', 'Göl Kapısı', 'İznik Teslim', 'İzmit Körfezi', 'Hereke', 'Karamürsel Tersanesi', 'İzmit Kalesi', 'Kocaeli', 'Kandıra', 'Kocaeli Sancağı'],
    bosses: ['tekfur', 'strategos'],
    lines: ['İznik yeniden Türk şehri oluyor. Sırada İzmit var.',
            'Karamürsel\'de ilk tersane kuruluyor. Kıyıyı tut.',
            'Hendekli yollar zorlu. Köprüyü kaçırma.'] },
  { ad: 'Gelibolu', alt: '1354 · Rumeli yakası',
    names: ['Çanakkale Boğazı', 'Sallar Üstünde', 'Çimpe Kalesi', 'Bolayır', 'Gelibolu Yarımadası', 'Deprem Gecesi', 'Gelibolu Surları', 'Rumeli Yakası', 'Tekirdağ Yolu', 'Gelibolu Fethi'],
    bosses: ['katalanbasi', 'kalkanbasi'],
    lines: ['Süleyman Paşa akıncıları sallarla boğazı geçirdi. Çimpe Kalesi ilk durak.',
            'Deprem surları yıktı; Gelibolu\'nun kapısı açık.',
            'Rumeli yakasında ilk adım. Geri dönüş yok.'] },
  { ad: 'Edirne', alt: '1361 · Rumeli\'nin kalbi',
    names: ['Malkara', 'Keşan', 'Sazlıdere', 'İpsala', 'Meriç Kıyısı', 'Dimetoka', 'Edirne Ovası', 'Tunca Köprüsü', 'Edirne Surları', 'Edirne Fethi'],
    bosses: ['tekfur', 'edirnekomutani'],
    lines: ['Trakya ovası açıldı. Edirne\'nin tekfuru kaleyi bırakmak istemiyor.',
            'Meriç\'in kıyısında Bizans\'ın son alayları.',
            'Edirne alınırsa Rumeli\'nin kalbi bizim olur.'] },
  /* ---- 8. sefer: Kosova ---- */
  { ad: 'Trakya', alt: '1364 · Sırp Sındığı',
    names: ['Filibe Yolu', 'Meriç Vadisi', 'Çirmen', 'Sırp Sındığı', 'Hasköy', 'Eski Zağra', 'Yeni Zağra', 'Balkan Eteği', 'Kızanlık', 'Trakya Sancağı'],
    bosses: ['sirpvoyvoda', 'kumandan'],
    lines: ['Balkan ittifakı Edirne\'ye yürüyor. Akıncılar gece baskınına hazır.',
            'Sırp piyadeleri kalabalık. Kapılardan büyük çık.',
            'Meriç\'in sisi ordunu gizlesin, okun düşmanı bulsun.'] },
  { ad: 'Balkan Dağları', alt: 'Sofya\'ya',
    names: ['Şıpka Geçidi', 'Tırnova Yolu', 'Balkan Ormanı', 'Karlova', 'Sofya Ovası', 'Vitoşa Eteği', 'Sofya Kalesi', 'Şehirköy', 'Niş Yolu', 'Niş Kalesi'],
    bosses: ['bulgarboyari', 'kalkanbasi'],
    lines: ['Balkan dağlarının geçitleri dar. Kalabalık ordu sıkışır.',
            'Bulgar boyarları kalelerini tutuyor. Okla aç yolunu.',
            'Sofya ovası açılırsa Sırp toprakları yakın.'] },
  { ad: 'Makedonya', alt: 'Vardar\'dan Ohri\'ye',
    names: ['Ustrumca', 'Vardar Vadisi', 'Köprülü', 'Üsküp', 'Kalkandelen', 'Manastır', 'Pirlepe', 'Ohri Gölü', 'İştip', 'Makedonya Sancağı'],
    bosses: ['sirpvoyvoda', 'katafraktbasi'],
    lines: ['Vardar vadisi boyunca kaleler. Sırp voyvodaları direniyor.',
            'Ohri Gölü\'nün kıyısı serin, yollar uzun.',
            'Hendek kazılmış yollar var. Köprüyü kaçırma.'] },
  { ad: 'Sırp Toprakları', alt: 'Morava boyunca',
    names: ['İbar Vadisi', 'Kruşevaç Yolu', 'Morava Kıyısı', 'Toplica', 'Prokuplye', 'Kurşumlu', 'Sırp Ordugâhı', 'Lab Deresi', 'Sitnica Kıyısı', 'Kosova Yolu'],
    bosses: ['bulgarboyari', 'sirpvoyvoda'],
    lines: ['Sırp ağır süvarileri ovada. Demir zırhlı atlılara en güçlü yayınla karşı dur.',
            'Morava\'nın kıyısında Balkan ordusu toplanıyor.',
            'Kosova\'ya giden yol açılıyor.'] },
  { ad: 'Kosova Ovası', alt: '15 Haziran 1389',
    names: ['Kosova Ovası', 'Sabah Saflaşması', 'Okçular Hattı', 'Ağır Süvari Hücumu', 'Sol Kanat', 'Sağ Kanat', 'Yıldırım Hücumu', 'Merkez Çöküyor', 'Kral Sancağı', 'Kosova Zaferi'],
    bosses: ['agirsuvaribasi', 'sirpkralsancagi'],
    lines: ['Kosova ovasında Balkan ittifakı saf tuttu. Sultan Murad akıncıları öne sürdü.',
            'Ağır süvari hücumunu okla durdur, sonra kanatlardan kapan.',
            'Bu ovada Balkanlar\'ın kaderi yazılacak.'] },
  /* ---- 9. sefer: Niğbolu ---- */
  { ad: 'Tuna Boyu', alt: 'Vidin\'den Silistre\'ye',
    names: ['Vidin Yolu', 'Tuna Kıyısı', 'Rahova', 'Lom Kalesi', 'Tuna Adaları', 'Silistre', 'Ziştovi', 'Tırnova', 'Tuna Gemileri', 'Tuna Sancağı'],
    bosses: ['eflakbeyi', 'kalkanbasi'],
    lines: ['Yıldırım Bayezid Tuna\'yı sınır yapıyor. Kıyı kaleleri birer birer alınmalı.',
            'Tuna geniş ve hızlı. Kıyı yolunda pusulara dikkat.',
            'Eflak beyinin atlıları nehrin öbür yakasından geliyor.'] },
  { ad: 'Eflak', alt: '1395 · Argeş kıyısı',
    names: ['Karaova', 'Argeş Kıyısı', 'Eflak Ormanı', 'Rovine Bataklığı', 'Craiova', 'Olt Nehri', 'Eflak Ordugâhı', 'Turnu', 'Yerköy', 'Eflak Dönüşü'],
    bosses: ['eflakbeyi', 'macarbaronu'],
    lines: ['Eflak ormanları sık, bataklıklar derin. Dar geçitte ordun sıkışmasın.',
            'Macar baronları Eflak beyine yardıma geldi.',
            'Rovine\'de çamur dizlere kadar. Hızlı ol, Akıncı Bey.'] },
  { ad: 'Haçlı Ordusu', alt: '1396 · Avrupa ayakta',
    names: ['Budin Haberi', 'Demirkapı', 'Orsova', 'Haçlı Öncüleri', 'Vidin Kuşatması', 'Rahova Baskını', 'Fransız Şövalyeleri', 'Macar Atlıları', 'Kazıklı Hat', 'Niğbolu Önleri'],
    bosses: ['sovalyebasi', 'macarbaronu'],
    lines: ['Avrupa\'nın dört bir yanından şövalyeler Tuna\'ya indi. Kalabalıklar, gururlular.',
            'Fransız şövalyeleri hücuma acele ediyor. Bırak gelsinler, okla karşıla.',
            'Kazıklı hattı aşamayan şövalye attan iner.'] },
  { ad: 'Niğbolu Kuşatması', alt: 'Kale direniyor',
    names: ['Niğbolu Kalesi', 'Tuna Kapısı', 'Kuşatma Kuleleri', 'Hendek Başı', 'Sur Dibi', 'Kale Muhafızları', 'Yıldırım Yetişiyor', 'Gece Yürüyüşü', 'Tepe Ordugâhı', 'Sabah Sisi'],
    bosses: ['frankkontu', 'fransizkontu'],
    lines: ['Niğbolu Kalesi\'nin muhafızları teslim olmuyor. Haçlılar kuşatma kuleleri kurdu.',
            'Yıldırım Bayezid yıldırım gibi yetişiyor. Kuşatmayı yar.',
            'Hendekler kazılmış. Köprüyü bul.'] },
  { ad: 'Niğbolu Meydanı', alt: '25 Eylül 1396',
    names: ['Kazıklı Saflar', 'Akıncılar Öncü', 'Şövalye Hücumu', 'Yokuş Yukarı', 'Sipahiler Kapanıyor', 'Macar Merkezi', 'Haçlı Ricatı', 'Tuna Kıyısında', 'Haçlı Sancağı', 'Niğbolu Zaferi'],
    bosses: ['macarbaronu', 'haclikral'],
    lines: ['Şövalyeler yokuş yukarı hücum ediyor. Akıncılar önde, sipahiler tepede.',
            'Kazıklar şövalyeleri yavaşlatır. Ok yağmurunu kesme.',
            'Haçlı sancağı düşerse Avrupa\'nın büyük ordusu dağılır.'] },
  /* ---- 10. sefer: Varna ---- */
  { ad: 'İzladi', alt: '1443 · Kış seferi',
    names: ['Sofya Yolu', 'Zlatitsa Geçidi', 'Karlı Dağ', 'İzladi Derbendi', 'Dağda Kış', 'Kuşatılmış Geçit', 'Kunoviça', 'Sisli Vadi', 'Filibe Yolu', 'Edirne Savunması'],
    bosses: ['erdelvoyvoda', 'sovalyebasi'],
    lines: ['Haçlı ordusu kışın Balkan geçitlerine dayandı. Derbendi tut.',
            'Kar dizlere kadar, geçit dar. Kalabalık ordu sıkışır.',
            'Erdel Voyvodası\'nın atlıları geçidi zorluyor.'] },
  { ad: 'Barış Bozuluyor', alt: '1444 · Haçlı yeniden yolda',
    names: ['Edirne Sarayı', 'Elçiler', 'Tuna Kenarı', 'Ahitname', 'Haçlı Ordusu Yolda', 'Vidin Geçidi', 'Niğbolu Yanıyor', 'Şumnu', 'Provadiya', 'Haçlı Ordugâhı'],
    bosses: ['macarbaronu', 'lehsovalye'],
    lines: ['Barış yemini bozuldu. Haçlı ordusu Tuna\'yı geçip Karadeniz\'e iniyor.',
            'Araba tabyaları ve tüfekçiler ilk kez sahada. Barut kokusu var.',
            'Kaleleri yakarak ilerliyorlar. Önlerini kes.'] },
  { ad: 'Boğazlar', alt: 'Sultan geçiyor',
    names: ['Gelibolu Boğazı', 'Venedik Donanması', 'Anadolu Hisarı', 'Ceneviz Gemileri', 'Boğaz Geçişi', 'Rumeli Kıyısı', 'Hayrabolu', 'Kırklareli', 'Aydos', 'Karnobat'],
    bosses: ['venedikkaptani', 'kalkanbasi'],
    lines: ['Venedik donanması boğazı kapattı. Sultan Murad ordusunu Boğaziçi\'nden geçiriyor.',
            'Ceneviz gemileri yardım ediyor. Kıyıya çık, hızlı yürü.',
            'Ordu Rumeli yakasında. Varna\'ya zorlu yürüyüş başlıyor.'] },
  { ad: 'Karadeniz Kıyısı', alt: 'Varna\'ya',
    names: ['Burgaz', 'Süzebolu', 'Aydos Geçidi', 'Emine Burnu', 'Galata Burnu', 'Varna Gölü', 'Franga Platosu', 'Araba Tabyası', 'Macar Atlıları', 'Varna Önleri'],
    bosses: ['erdelvoyvoda', 'tabyakomutani'],
    lines: ['Haçlılar Varna\'da araba tabyası kurdu. Arabaların ardından tüfekler patlıyor.',
            'Tabyayı okla kır ya da yanından dolaş.',
            'Göl ile deniz arasında dar bir ova. Savaş burada olacak.'] },
  { ad: 'Varna', alt: '10 Kasım 1444',
    names: ['Sabah Saflaşması', 'Sağ Kanat', 'Sol Kanat', 'Yeniçeri Hattı', 'Kral Hücumu', 'Kalkan Duvarı', 'Araba Kalesi', 'Haçlı Ricatı', 'Haçlı Sancağı', 'Varna Zaferi'],
    bosses: ['lehsovalye', 'haclikral'],
    lines: ['Haçlı kralı ağır süvarisiyle merkeze hücum ediyor. Yeniçeriler sabit, akıncılar kanatlarda.',
            'Kanatlar sallanıyor; sancağı yüksek tut.',
            'Bu zaferden sonra İstanbul\'un yolu açık.'] },
  /* ---- 11. sefer: İstanbul'un Fethi ---- */
  { ad: 'Boğazkesen', alt: '1452 · Rumeli Hisarı',
    names: ['Edirne Ordugâhı', 'Çorlu Yolu', 'Silivri Önleri', 'Boğaziçi Kıyısı', 'Hisarın Temeli', 'Sarıca Paşa Kulesi', 'Halil Paşa Kulesi', 'Zağanos Paşa Kulesi', 'Boğazkesen', 'Hisar Tamam'],
    bosses: ['tekfur', 'cenevizkaptani'],
    lines: ['Sultan II. Mehmed Boğaz\'ın en dar yerine bir hisar yaptırıyor. Akıncılar kıyıyı tutuyor.',
            'Dört ayda yükselecek bir hisar: işçileri koru, yolu açık tut.',
            'Ceneviz gemileri Boğaz\'dan geçmek istiyor. Kıyıdan ok yağdır.'] },
  { ad: 'Şahi Toplar', alt: 'Edirne\'den İstanbul\'a',
    names: ['Edirne Dökümhanesi', 'Top Arabaları', 'Çatalca Yolu', 'Büyükçekmece Köprüsü', 'Küçükçekmece', 'Ayastefanos', 'Ordugâh Kuruluyor', 'Lykos Sırtları', 'Top Mevzileri', 'İlk Atış'],
    bosses: ['kumandan', 'surkomutani'],
    lines: ['Dev toplar yüzlerce öküzle Edirne\'den yola çıktı. Önlerindeki yolu temizle.',
            'Şehrin önünde ordugâh kuruluyor. Bizans öncülerini surlara geri püskürt.',
            'İlk sur duvarları yolu kesiyor. Okla yık, yoksa çarparsın.'] },
  { ad: 'Kara Surları', alt: 'Nisan 1453',
    names: ['Altın Kapı', 'Yedikule', 'Silivri Kapısı', 'Mevlevihane Kapısı', 'Topkapı', 'Edirnekapı', 'Eğrikapı', 'Hendek Başı', 'Lykos Vadisi', 'İlk Gedik'],
    bosses: ['surkomutani', 'kalkanbasi'],
    lines: ['Üç kat sur, önünde derin hendek. Bin yıldır kimse aşamadı.',
            'Toplar gece gündüz surları dövüyor. Sen de oklarını konuştur.',
            'Ceneviz zırhlıları gediği tutuyor. Ağır ama yavaşlar.'] },
  { ad: 'Haliç', alt: 'Gemiler karadan yürüyor',
    names: ['Dolmabahçe Kıyısı', 'Kızaklar Yağlanıyor', 'Gemiler Tepede', 'Kasımpaşa Deresi', 'Haliç Kıyısı', 'Galata Önleri', 'Zincirin Ardı', 'Ayvansaray', 'Fener Kıyısı', 'Haliç Bizim'],
    bosses: ['cenevizkaptani', 'venedikkaptani'],
    lines: ['Haliç\'in ağzı zincirle kapalı. Sultan gemileri bir gecede tepelerin üstünden yürütüyor.',
            'Sabah Bizans uyandığında gemiler Haliç\'te. Kıyıyı tut.',
            'Venedik ve Ceneviz gemicileri surların arkasından ok atıyor.'] },
  { ad: 'Son Hücum', alt: '29 Mayıs 1453',
    names: ['Şafak Vakti', 'İlk Dalga', 'İkinci Dalga', 'Yeniçeri Hücumu', 'Ulubatlı Hasan', 'Burcun Üstünde', 'Kerkoporta', 'Surlar Aşıldı', 'Şehrin İçinde', 'Fetih'],
    bosses: ['cenevizkomutani', 'sonsancak'],
    lines: ['Elli üç günlük kuşatmanın son sabahı. Bütün ordu aynı anda hücuma kalkıyor.',
            'Ulubatlı Hasan sancağı burca dikti. Arkasından yetiş.',
            'Gedik açıldı. Bu kapıdan bir çağ geçecek.'] },
  /* ---- 12. sefer: Fatih'in Seferleri ---- */
  { ad: 'Semendire', alt: '1459 · Tuna kıyısı',
    names: ['Tuna Kıyısı', 'Morava Ağzı', 'Semendire Önleri', 'Despot Sarayı', 'Golubaç Yolu', 'Golubaç Kalesi', 'Kuçevo', 'Braniçevo', 'Kale Teslim', 'Semendire Fethi'],
    bosses: ['sirpvoyvoda', 'kalkanbasi'],
    lines: ['Tuna\'nın kıyısındaki Semendire, Sırp despotluğunun son kalesi.',
            'Sırp süvarileri yeniden sahada. Demir zırhlıları okla karşıla.',
            'Kale düşerse Tuna boyu bir uçtan bir uca bizim.'] },
  { ad: 'Mora', alt: '1460 · Despotluklar',
    names: ['Korint Berzahı', 'Altı Mil Suru', 'Korint Kalesi', 'Arkadya Yaylası', 'Tripoliçe Yolu', 'Mistra', 'Kalavrita', 'Patras', 'Anavarin Kıyısı', 'Mora Fethi'],
    bosses: ['moradespotu', 'venedikkomutani'],
    lines: ['Mora despotları birbirine düştü. Venedik kıyıdaki kaleleri tutuyor.',
            'Berzahı kesen surları aş, yarımadaya gir.',
            'Arkadya\'nın dağları sarp. Kalabalık ordu geçitte sıkışır.'] },
  { ad: 'Trabzon', alt: '1461 · Karadeniz\'in doğusu',
    names: ['Sinop Teslim', 'Koyulhisar', 'Zigana Geçidi', 'Gümüşhane Yolu', 'Maçka Vadisi', 'Değirmendere', 'Trabzon Surları', 'Kale Kapısı', 'Trabzon Limanı', 'Trabzon Fethi'],
    bosses: ['trabzondukasi', 'trabzonmuhafizi'],
    lines: ['Ordu Zigana\'nın sarp geçitlerinden Karadeniz\'e iniyor. Yağmur dinmiyor.',
            'Dağ yolları dar ve kaygan. Geçide hazırlıklı gir.',
            'Trabzon\'un surları denize kadar iniyor. Kapıyı zorla.'] },
  { ad: 'Bosna', alt: '1463 · Dağların ardında',
    names: ['Saraybosna Ovası', 'Bobovaç Kalesi', 'Vranduk', 'Travnik', 'Yayçe Yolu', 'Yayçe Kalesi', 'Kreşevo', 'Neretva Kıyısı', 'Dağ Hisarları', 'Bosna Fethi'],
    bosses: ['bosnakrali', 'macarbaronu'],
    lines: ['Bosna kralı dağ kalelerine çekildi. Macar baronları yardıma geliyor.',
            'Ormanlık vadilerde pusu var. Kapıları akıllı seç.',
            'Yayçe Kalesi kayalığın tepesinde. Önce okçularını sustur.'] },
  { ad: 'Eğriboz ve Otranto', alt: '1470–1480',
    names: ['Eğriboz Köprüsü', 'Eğriboz Surları', 'Venedik Kalesi', 'Ege Kıyısı', 'Avlonya Limanı', 'Adriyatik Geçişi', 'Otranto Kıyısı', 'Otranto Surları', 'Kale Burcu', 'Otranto Fethi'],
    bosses: ['venedikkomutani', 'otrantokomutani'],
    lines: ['Venedik\'in Ege\'deki en büyük kalesi Eğriboz. Gemilerden köprü kuruldu.',
            'Gedik Ahmed Paşa Avlonya\'dan denize açıldı. Sırada İtalya kıyısı var.',
            'Otranto\'nun surları yüksek. Okla yık, gediği aç.'] },
  /* ---- 13. sefer: Belgrad ve Rodos ---- */
  { ad: 'Sava Kıyısı', alt: '1521 · Belgrad yolu',
    names: ['Sofya Ordugâhı', 'Niş Konağı', 'Morava Köprüsü', 'Sava Kıyısı', 'Bögürdelen', 'Zemun', 'Kulpenik', 'Salankamen', 'Sava Geçişi', 'Belgrad Önleri'],
    bosses: ['hirvatbani', 'macarbaronu'],
    lines: ['Sultan Süleyman ilk seferine çıktı. Hedef, Tuna\'nın kilidi Belgrad.',
            'Hırvat piyadeleri sınır boyunu tutuyor. Kapılardan büyük çık.',
            'Arkebüzcülerin namluları uzaktan ateş açar. Menzile girmeden erit.'] },
  { ad: 'Belgrad', alt: 'Ağustos 1521',
    names: ['Belgrad Surları', 'Tuna Kulesi', 'Su Kapısı', 'Varoş', 'Kale Hendeği', 'Top Mevzileri', 'Nebojşa Kulesi', 'İç Kale', 'Kale Teslim', 'Belgrad Fethi'],
    bosses: ['belgradkomutani', 'zirhlibasi'],
    lines: ['Yetmiş yıldır alınamayan Belgrad\'ın önündeyiz. Surlar kat kat.',
            'Hendekleri köprüden geç, surları okla yık.',
            'Zırhlı Macar şövalyeleri kaleden çıkış yapıyor.'] },
  { ad: 'Ege Yolu', alt: '1522 · Donanma yolda',
    names: ['İstanbul Tersanesi', 'Gelibolu Limanı', 'Çanakkale', 'Midilli Açıkları', 'Sakız Kıyısı', 'Bodrum Önleri', 'Marmaris Ordugâhı', 'Kıyı Konağı', 'Karaya Çıkış', 'Rodos Kıyısı'],
    bosses: ['venedikkaptani', 'rodoskulesi'],
    lines: ['Donanma ve ordu Marmaris\'te buluştu. Karşıda Rodos görünüyor.',
            'Kıyıyı tutan şövalyeler gemileri durdurmak istiyor.',
            'Karaya çıktık. Şimdi surlara doğru.'] },
  { ad: 'Rodos Surları', alt: 'Kuşatma başlıyor',
    names: ['İngiliz Burcu', 'Aragon Burcu', 'İtalyan Burcu', 'Lağımcılar', 'Hendek Doluyor', 'Aziz Nikola Kulesi', 'Liman Kulesi', 'Burç Gediği', 'Kış Geliyor', 'Surlar Sarsılıyor'],
    bosses: ['rodoskulesi', 'kalkanbasi'],
    lines: ['Rodos\'un surları Akdeniz\'in en kalınları. Her burcu bir ayrı millet tutuyor.',
            'Lağımcılar surların altına iniyor. Sen yukarıdan ok yağdır.',
            'Rodos Şövalyeleri ağır zırhlı ve inatçı. Sabırlı ol.'] },
  { ad: 'Rodos', alt: 'Aralık 1522',
    names: ['Son Hücum', 'Kale İçi', 'Şövalyeler Sokağı', 'İç Liman', 'Üstadın Sarayı', 'Teslim Görüşmesi', 'Liman Kapısı', 'Şövalyeler Ayrılıyor', 'Sancak Burçta', 'Rodos Fethi'],
    bosses: ['rodoskulesi', 'rodosustadi'],
    lines: ['Altı aylık kuşatmanın sonu yaklaştı. Şövalyelerin üstadı son direnişte.',
            'Kış rüzgârı sert, ama ordu dimdik.',
            'Teslim olurlarsa canlarına dokunulmayacak. Önce son burcu al.'] },
  /* ---- 14. sefer: Mohaç ---- */
  { ad: 'Tuna Boyunca', alt: '1526 · Belgrad\'dan kuzeye',
    names: ['Belgrad Ordugâhı', 'Zemun Köprüsü', 'Salankamen', 'Tuna Gemileri', 'Varadin Yolu', 'Petervaradin', 'Varadin Kalesi', 'İlok', 'Vukovar', 'Srem Ovası'],
    bosses: ['hirvatbani', 'husarbasi'],
    lines: ['Sultan Süleyman ordusuyla Tuna boyunca kuzeye yürüyor. Önde akıncılar.',
            'Macar hafif süvarileri hızlı gelir. Okla erken karşıla.',
            'Petervaradin\'in surları yolu kesiyor. Gediği aç.'] },
  { ad: 'Drava Köprüsü', alt: 'Ösek',
    names: ['Ösek Ovası', 'Drava Kıyısı', 'Köprü Kuruluyor', 'Ösek Köprüsü', 'Karşıya Geçiş', 'Köprünün Ardı', 'Baranya', 'Darda', 'Bataklık Yolu', 'Mohaç Yolu'],
    bosses: ['zirhlibasi', 'macarbaronu'],
    lines: ['Drava\'nın üstüne beş günde köprü kuruldu. Ordu karşıya geçiyor.',
            'Köprüden geçmeyen hendekte kalır. Ordunu topla.',
            'Bataklık yolları dar. Kalabalık ordu sıkışabilir.'] },
  { ad: 'Macar Ordugâhı', alt: 'Kral ordusunu topluyor',
    names: ['Tolna', 'Paks Yolu', 'Kral Ordugâhı', 'Hırvat Alayları', 'Paralı Askerler', 'Macar Topları', 'Arabalar Diziliyor', 'Ova Kenarı', 'Gece Nöbeti', 'Sabah Saflaşması'],
    bosses: ['landsknechtbasi', 'topcubasi'],
    lines: ['Macar kralı ovada ordusunu topladı. Alman paralı askerleri de yanında.',
            'Macar topları ovaya bakıyor. Kırmızı şeritten çekil.',
            'Araba tabyaları yeniden kuruldu. Kır ya da dolaş.'] },
  { ad: 'Mohaç Ovası', alt: 'Öğle vakti',
    names: ['Bataklık Kenarı', 'Ovaya İniş', 'Sağ Kanat', 'Sol Kanat', 'Macar Hücumu', 'Geri Çekilir Gibi', 'Top Ateşi', 'Yeniçeri Hattı', 'Kanatlar Kapanıyor', 'Bataklığa Doğru'],
    bosses: ['husarbasi', 'zirhlibasi'],
    lines: ['Macar ağır süvarisi merkeze hücum ediyor. Akıncılar geri çekilir gibi yapıp kanatlara açılıyor.',
            'Malazgirt\'in hilal düzeni Mohaç\'ta yeniden kuruldu.',
            'Toplar ve tüfekler hücumu durdurdu. Şimdi kanatlardan kapan.'] },
  { ad: 'Mohaç', alt: '29 Ağustos 1526',
    names: ['Kral Muhafızları', 'Zırhlı Süvari', 'Son Hücum', 'Macar Merkezi', 'Paralılar Dağılıyor', 'Kral Kaçıyor', 'Ova Bizim', 'Budin Yolu', 'Budin Kapısı', 'Mohaç Zaferi'],
    bosses: ['zirhlibasi', 'macarkral'],
    lines: ['Savaş iki saat sürmedi. Macar ordusu dağılıyor.',
            'Kralın muhafızları sancağın etrafında son direnişte.',
            'Budin\'in yolu açık. Ama Tuna boyunda hesap henüz bitmedi.'] },
  /* ---- 15. sefer: Budin ---- */
  { ad: 'Viyana Yolu', alt: '1529 · Avusturya\'ya akın',
    names: ['Budin Önü', 'Tata', 'Yanıkkale', 'Györ Ovası', 'Moson', 'Avusturya Sınırı', 'Akıncılar İleride', 'Viyana Önleri', 'Kış Yaklaşıyor', 'Dönüş Yolu'],
    bosses: ['avusturyakomutani', 'landsknechtbasi'],
    lines: ['Akıncılar ordunun önünde Avusturya içlerine akın ediyor.',
            'Alman paralı askerleri uzun mızraklarıyla yolu kesiyor.',
            'Kış erken geldi. Ordu Budin\'e dönüyor; akıncılar artçıda.'] },
  { ad: 'Güns', alt: '1532 · Alman seferi',
    names: ['Esztergom Yolu', 'Güns Kalesi', 'Kale Burcu', 'Steyr Akını', 'Graz Yolu', 'Mura Kıyısı', 'Maribor', 'Drava Boyu', 'Dönüş Konağı', 'Sınır Boyu'],
    bosses: ['avusturyakomutani', 'husarbasi'],
    lines: ['Küçük Güns kalesi ordunun önünü kesti. Surları okla yık.',
            'Kasım Bey\'in akıncıları Tuna\'nın yukarılarına kadar uzanıyor.',
            'Dağ yollarından dönüş zorlu. Geçitlere dikkat.'] },
  { ad: 'Slavonya', alt: 'Sınır boyunda',
    names: ['Ösek Kalesi', 'Pojega', 'Velika', 'Drava Kıyısı', 'Kopriniça Yolu', 'Viroviçe', 'Hırvat Sınırı', 'Sava Boyu', 'Sınır Hisarları', 'Slavonya Sancağı'],
    bosses: ['hirvatbani', 'zirhlibasi'],
    lines: ['Drava ile Sava arasında hisarlar birer birer düşüyor.',
            'Hırvat banının askerleri ormanlarda pusu kuruyor.',
            'Hendekli yollar yine karşımızda. Köprüyü kaçırma.'] },
  { ad: 'Peşte', alt: '1541 · Tuna\'nın karşı kıyısı',
    names: ['Peşte Ovası', 'Avusturya Ordugâhı', 'Tuna Adası', 'Peşte Surları', 'Gece Baskını', 'Kuşatma Yarıldı', 'Avusturya Ricatı', 'Toplar Bırakıldı', 'Tuna Köprüsü', 'Peşte Önleri'],
    bosses: ['landsknechtbasi', 'topcubasi'],
    lines: ['Avusturya ordusu Budin\'i kuşattı. Sultan Süleyman yardıma yetişiyor.',
            'Gece baskınıyla kuşatma yarıldı. Kaçanların peşini bırakma.',
            'Avusturya topları ovada kaldı, ama son güllelerini atıyorlar.'] },
  { ad: 'Budin', alt: '29 Ağustos 1541',
    names: ['Budin Kalesi', 'Viyana Kapısı', 'Kale Yokuşu', 'Kral Sarayı', 'Gellért Tepesi', 'Tuna Kıyısı', 'Kaplıcalar', 'Kale Muhafızları', 'Sancak Kalede', 'Budin Eyaleti'],
    bosses: ['budinkomutani', 'avusturyakomutani'],
    lines: ['Mohaç\'ın yıl dönümü. Ordu Budin\'in kapısında.',
            'Kale yokuşu dik, surlar kalın. Gediği okla aç.',
            'Budin alınırsa Tuna boyu yüz elli yıl Türk sancağı taşıyacak.'] },
  /* ---- 16. sefer: Zigetvar ---- */
  { ad: 'Sefere Çıkış', alt: '1566 · İstanbul\'dan Belgrad\'a',
    names: ['Davutpaşa Ordugâhı', 'Edirne Konağı', 'Filibe', 'Sofya', 'Niş', 'Belgrad Ordugâhı', 'Zemun Köprüsü', 'Sava Geçişi', 'Tuna Kıyısı', 'Sefer Yolu'],
    bosses: ['hirvatbani', 'kirasiyerbasi'],
    lines: ['Yetmiş iki yaşındaki Sultan Süleyman on üçüncü seferine çıktı. Akıncılar yine ordunun önünde.',
            'Habsburg kürasiyerleri baştan aşağı zırhlı. Okun gücü yetmezse çarpışmaya girme.',
            'Tüfekçiler uzaktan ateş açar. Menzile girmeden sayılarını erit.'] },
  { ad: 'Drava Boyu', alt: 'Siklós ve Peçuy',
    names: ['Ösek Köprüsü', 'Drava Kıyısı', 'Siklós Kalesi', 'Harsány Dağı', 'Peçuy Ovası', 'Peçuy Çarşısı', 'Mohaç Hatırası', 'Baranya Bağları', 'Bataklık Kenarı', 'Zigetvar Yolu'],
    bosses: ['landsknechtbasi', 'muskecibasi'],
    lines: ['Drava\'nın kıyısında yol uzun. Ordu kırk yıl önceki Mohaç ovasından geçiyor.',
            'Peçuy\'un çarşısından geçen ordu bataklıklara yaklaşıyor. Tüfekçilere dikkat.',
            'Bataklık yaklaşıyor. Hendeklerde köprüyü kaçırma.'] },
  { ad: 'Zigetvar Bataklıkları', alt: 'Kale gölün ortasında',
    names: ['Almás Deresi', 'Saz Bataklığı', 'Yeni Şehir', 'Eski Şehir', 'Bent Yıkılıyor', 'Su Çekiliyor', 'Hendek Doluyor', 'Lağım Kazılıyor', 'Top Mevzileri', 'Dış Kale'],
    bosses: ['kirasiyerbasi', 'hirvatbani'],
    lines: ['Zigetvar bataklıkların ortasında bir ada gibi. Bentler yıkılınca sular çekiliyor.',
            'Yeni şehir düştü, sırada eski şehir var.',
            'Hendekleri doldurmadan surlara ulaşılmaz. Köprüyü bul.'] },
  { ad: 'Zigetvar Surları', alt: 'Ağustos 1566',
    names: ['İç Kale Önü', 'Burç Gediği', 'Kale Kapısı', 'Hırvat Muhafızlar', 'Barut Kulesi', 'Gece Hücumu', 'Ateş Yağmuru', 'Surlar Yanıyor', 'Son Burç', 'Kuşatma Sürüyor'],
    bosses: ['muskecibasi', 'avusturyakomutani'],
    lines: ['Hırvat komutan iç kaleye çekildi. Surların üstünden tüfekler patlıyor.',
            'Gece hücumu başladı. Meşalelerin ışığında yolunu bul.',
            'Sur duvarlarını okla yık, gediği aç.'] },
  { ad: 'Zigetvar', alt: '7 Eylül 1566',
    names: ['Son Gece', 'Sultanın Çadırı', 'Sessiz Ordugâh', 'Sabah Hücumu', 'Komutan Çıkıyor', 'Son Çıkış', 'İç Kale Düşüyor', 'Barut Patlıyor', 'Sancak Burçta', 'Zigetvar Fethi'],
    bosses: ['kirasiyerbasi', 'zigetvarkomutani'],
    lines: ['Ordugâh sessiz. Sultanın çadırından haber yok, ama hücum emri verildi.',
            'Kale komutanı son çıkışı yapıyor. Ok yağmurunu kesme.',
            'Zigetvar düştüğünde ordu yasını tutacak, ama önce zafer.'] },
  /* ---- 17. sefer: Kıbrıs ---- */
  { ad: 'Donanma Yolda', alt: '1570 · Akdeniz',
    names: ['Haliç Tersanesi', 'Çanakkale Boğazı', 'Ege Adaları', 'Rodos Limanı', 'Finike Açıkları', 'Kıbrıs Ufukta', 'Tuzla Kıyısı', 'Karaya Çıkış', 'Tuzla Gölü', 'Ordugâh Kuruluyor'],
    bosses: ['venedikkaptani', 'stradiotbasi'],
    lines: ['Donanma ve ordu birlikte Kıbrıs\'a yelken açtı. Tuzla kıyısına çıkılacak.',
            'Venedik\'in Stradiot süvarileri kıyıyı kolluyor. Hızlı gelirler.',
            'Kıyıya çıktık. Ordugâhı kurmadan önce öncüleri dağıt.'] },
  { ad: 'Lefkoşa', alt: 'Eylül 1570',
    names: ['Lefkoşa Ovası', 'Yeni Surlar', 'On Bir Burç', 'Podocataro Burcu', 'Hendek Başı', 'Top Atışı', 'Burç Gediği', 'Şehir Kapısı', 'Kale İçi', 'Lefkoşa Fethi'],
    bosses: ['venedikkomutani', 'muskecibasi'],
    lines: ['Lefkoşa\'nın yepyeni surları on bir burçla çevrili.',
            'Venedik tüfekçileri burçlarda. Menzile girmeden erit.',
            'Gedik açıldı. Şehre giren yol bu kapıdan geçiyor.'] },
  { ad: 'Girne ve Beşparmak', alt: 'Kuzey kıyısı',
    names: ['Beşparmak Dağları', 'Dağ Geçidi', 'Girne Kalesi', 'Liman Önü', 'Kıyı Yolu', 'Mesarya Ovası', 'Köy Yolları', 'Pınar Başı', 'Ova Konağı', 'Mağusa Yolu'],
    bosses: ['stradiotbasi', 'cenevizkomutani'],
    lines: ['Lefkoşa düşünce Girne savaşmadan kapılarını açtı. Ordu doğuya dönüyor.',
            'Beşparmak\'ın geçitleri dar. Kalabalık ordu sıkışır.',
            'Mesarya ovası sıcak ve tozlu. Mağusa ufukta.'] },
  { ad: 'Mağusa Kuşatması', alt: 'Kış 1570–1571',
    names: ['Mağusa Surları', 'Tersane Burcu', 'Kara Kapısı', 'Martinengo Burcu', 'Lağımlar', 'Hendek Doluyor', 'Top Bataryaları', 'Kış Geçiyor', 'Bahar Hücumu', 'Gedik Açıldı'],
    bosses: ['muskecibasi', 'venedikkomutani'],
    lines: ['Mağusa\'nın surları adanın en sağlamları. Kuşatma kışa uzadı.',
            'Lağımcılar surların altına iniyor. Yukarıdan ok yağdır.',
            'Bahar geldi, toplar susmuyor. Gedik her gün biraz daha genişliyor.'] },
  { ad: 'Mağusa', alt: '1 Ağustos 1571',
    names: ['Son Hücum', 'Ravelin', 'Deniz Kapısı', 'Kale Muhafızları', 'Venedik Sancağı', 'Barut Bitti', 'Teslim Görüşmesi', 'Kapı Açılıyor', 'Liman Bizim', 'Kıbrıs Fethi'],
    bosses: ['stradiotbasi', 'magusakomutani'],
    lines: ['Kalede barut da ekmek de bitti. Son direniş başlıyor.',
            'Venedik sancağı burçta dalgalanıyor. İndirmek sana düşüyor.',
            'Mağusa düşerse bütün ada bizim.'] },
  /* ---- 18. sefer: Haçova ---- */
  { ad: 'Belgrad\'dan Kuzeye', alt: '1596',
    names: ['Belgrad Ordugâhı', 'Tuna Köprüsü', 'Varadin', 'Segedin Yolu', 'Tisza Kıyısı', 'Solnok', 'Macar Ovası', 'Sınır Hisarları', 'Akıncı Öncüleri', 'Eğri Yolu'],
    bosses: ['erdelprensi', 'landsknechtbasi'],
    lines: ['Sultan III. Mehmed ordusunun başında. Hedef, Eğri Kalesi.',
            'Erdel prensinin süvarileri yolu kesiyor. Okla erken karşıla.',
            'Tisza\'nın kıyısı düz ve geniş. Kapılarda acele etme.'] },
  { ad: 'Eğri', alt: 'Ekim 1596',
    names: ['Eğri Kalesi', 'Burç Önü', 'Top Mevzileri', 'Kale Hendeği', 'Kale Kapısı', 'İç Kale', 'Eğri Teslim', 'Bükk Dağları', 'Orman Yolu', 'Haçova Kenarı'],
    bosses: ['muskecibasi', 'kirasiyerbasi'],
    lines: ['Kırk dört yıl önce alınamayan Eğri Kalesi bu kez düşecek.',
            'Surları yık, hendeği köprüden geç.',
            'Eğri düştü, ama Habsburg ordusu yardıma geliyor.'] },
  { ad: 'Haçova Bataklığı', alt: 'Habsburg ordusu geliyor',
    names: ['Bataklık Yolu', 'Saz Kıyısı', 'Köprü Başı', 'Habsburg Öncüleri', 'Tüfekçi Hattı', 'Top Arabaları', 'Sol Kanat', 'Sağ Kanat', 'Sis İçinde', 'Ordu Saflaşıyor'],
    bosses: ['landsknechtbasi', 'erdelprensi'],
    lines: ['Habsburg ve Erdel orduları bataklığın öbür yakasında saf tuttu.',
            'Sis ovayı kapladı. Kapılara dikkat et.',
            'Toplar ve tüfekler ateşte. Gülle şeritlerinden çekil.'] },
  { ad: 'İlk Gün', alt: '24–25 Ekim 1596',
    names: ['Sabah Çatışması', 'Bataklık Geçidi', 'Ateş Hattı', 'Geri Çekiliş', 'Habsburg Ordugâhı', 'Ganimet Arabaları', 'Ordu Dağıldı Sanılıyor', 'Aşçılar ve Seyisler', 'Karşı Hücum', 'Gece Bekleyişi'],
    bosses: ['kirasiyerbasi', 'muskecibasi'],
    lines: ['Düşman ordugâha girdi, savaş bitti sanıp yağmaya daldı.',
            'Aşçılar ve seyisler ellerindeki baltalarla ordugâhı savunuyor.',
            'Karşı hücum zamanı. Ganimet arabalarını okla durdur.'] },
  { ad: 'Haçova', alt: '26 Ekim 1596',
    names: ['Son Gün', 'Sultanın Sancağı', 'Cığalazade Hücumu', 'Kanatlar Kapanıyor', 'Bataklığa Sürülüyor', 'Kürasiyerler Dağılıyor', 'Habsburg Merkezi', 'Toplar Bırakıldı', 'Ova Bizim', 'Haçova Zaferi'],
    bosses: ['erdelprensi', 'habsburgkomutani'],
    lines: ['Cığalazade Sinan Paşa\'nın süvarileri düşmanın arkasından çıktı.',
            'Habsburg ordusu bataklığa sürülüyor. Kanatları kapat.',
            'Kürasiyerler dağılırsa ova bizim.'] },
  /* ---- 19. sefer: Girit ---- */
  { ad: 'Hanya', alt: '1645',
    names: ['Donanma Çıkıyor', 'Ege Geçişi', 'Girit Ufukta', 'Kıyıya Çıkış', 'Hanya Surları', 'Liman Kulesi', 'Hanya Fethi', 'Resmo Yolu', 'Resmo Kalesi', 'Kıyı Boyu'],
    bosses: ['venedikkaptani', 'venedikkomutani'],
    lines: ['Donanma Girit\'e çıktı. İlk hedef Hanya.',
            'Venedik Girit\'i dört yüz yıldır elinde tutuyor. Kıyı kaleleri sağlam.',
            'Hanya alındı. Sırada Resmo var.'] },
  { ad: 'Girit Dağları', alt: 'İda\'nın eteği',
    names: ['İda Dağı', 'Zeytinlikler', 'Dağ Köyleri', 'Vadi Yolu', 'Venedik Öncüleri', 'Kayalık Geçit', 'Pınar Başı', 'Ova Konağı', 'Kandiye Ovası', 'Kandiye Önleri'],
    bosses: ['stradiotbasi', 'muskecibasi'],
    lines: ['İda Dağı\'nın eteklerinde zeytinlikler. Yollar dar ve kayalık.',
            'Stradiot süvarileri dağ yollarında pusu kuruyor.',
            'Kandiye\'nin surları ovanın ucunda yükseliyor.'] },
  { ad: 'Kandiye Surları', alt: 'Yıllar süren kuşatma',
    names: ['Martinengo Burcu', 'Pantokrator Burcu', 'Sabionera Burcu', 'Hendek Başı', 'Lağımcılar', 'Karşı Lağım', 'Top Düellosu', 'Kış Mevzisi', 'Venedik Yardımı', 'Surlar Sarsılıyor'],
    bosses: ['venedikkomutani', 'muskecibasi'],
    lines: ['Kandiye\'nin burçları birbirini koruyor. Kuşatma yıllardır sürüyor.',
            'Lağımcılar yerin altında savaşıyor. Sen yukarıda dimdik dur.',
            'Sur duvarlarını okla yık, gülle şeritlerinden çekil.'] },
  { ad: 'Avrupa\'dan Yardım', alt: '1669 · Fransız gemileri',
    names: ['Fransız Çıkarması', 'Gece Baskını', 'Barut Deposu', 'Çıkarma Dağıldı', 'Gemiler Çekiliyor', 'Liman Ablukası', 'Son Yardım', 'Venedik Yalnız', 'Sur Dibi', 'Teslim Yakın'],
    bosses: ['fransizgeneral', 'venedikkaptani'],
    lines: ['Fransız gemileri yardım getirdi. Gece çıkarma yaptılar.',
            'Barut deposu havaya uçunca çıkarma dağıldı. Peşlerini bırakma.',
            'Venedik yalnız kaldı. Sur dibine yaklaş.'] },
  { ad: 'Kandiye', alt: '6 Eylül 1669',
    names: ['Son Hücum', 'Sabionera Gediği', 'İç Hendek', 'Kale Kapısı', 'Teslim Görüşmesi', 'Venedik Çekiliyor', 'Liman Kapısı', 'Şehre Giriş', 'Sancak Burçta', 'Girit Fethi'],
    bosses: ['fransizgeneral', 'kandiyekomutani'],
    lines: ['Yirmi dört yıllık kuşatmanın son günleri. Köprülüzade Fazıl Ahmed Paşa surların önünde.',
            'Kandiye komutanı teslim görüşmesine razı. Önce son burcu al.',
            'Girit düşerse Ege\'de son büyük Venedik kalesi de bizim.'] },
  /* ---- 20. sefer: Uyvar ve Kamaniçe ---- */
  { ad: 'Uyvar Yolu', alt: '1663 · Köprülüzade Fazıl Ahmed Paşa',
    names: ['Budin Ordugâhı', 'Estergon', 'Tuna Köprüsü', 'Ciğerdelen', 'Nitra Ovası', 'Vag Kıyısı', 'Habsburg Öncüleri', 'Bataklık Yolu', 'Uyvar Önleri', 'Ordugâh Kuruluyor'],
    bosses: ['landsknechtbasi', 'kirasiyerbasi'],
    lines: ['Sadrazam ordusunu Tuna\'nın kuzeyine, Uyvar\'a yürütüyor.',
            'Nitra ovası geniş. Kapılarda dört seçenek var; en iyisini bul.',
            'Habsburg öncüleri bataklıkta pusu kurmuş.'] },
  { ad: 'Uyvar', alt: 'Eylül 1663',
    names: ['Uyvar Kalesi', 'Altı Burç', 'Kale Hendeği', 'Top Bataryaları', 'Lağımlar', 'Gedik', 'Kale Muhafızları', 'Teslim Çağrısı', 'Kale Kapısı', 'Uyvar Fethi'],
    bosses: ['muskecibasi', 'uyvarkomutani'],
    lines: ['Uyvar altı burçlu yıldız biçimli bir kale. Her burç ötekini koruyor.',
            'Toplar surları dövüyor. Gediği okla genişlet.',
            'Uyvar düşerse Viyana\'nın yolu yeniden açılır.'] },
  { ad: 'Podolya', alt: '1672 · Lehistan seferi',
    names: ['Tuna Geçişi', 'İsakçı Köprüsü', 'Turla Kıyısı', 'Hotin Kalesi', 'Podolya Ovası', 'Buğday Tarlaları', 'Kazak Öncüleri', 'Leh Süvarisi', 'Ladijin', 'Kamaniçe Yolu'],
    bosses: ['kazakatamani', 'lehhatmani'],
    lines: ['Sultan IV. Mehmed Lehistan seferinde. Kazak atlıları ordunun yanında.',
            'Podolya\'nın buğday tarlaları uçsuz bucaksız. Ova geniş, yol uzun.',
            'Kanatlı Leh süvarileri ağır ve hızlı. En güçlü yayını hazırla.'] },
  { ad: 'Kamaniçe Kuşatması', alt: 'Ağustos 1672',
    names: ['Smotriç Vadisi', 'Kayalık Burun', 'Yeni Kale', 'Eski Kale', 'Köprü Başı', 'Lağımlar', 'Top Atışı', 'Kale Kulesi', 'Leh Muhafızları', 'Gedik Açıldı'],
    bosses: ['muskecibasi', 'lehhatmani'],
    lines: ['Kamaniçe derin bir vadinin kıvrımında, kayalık bir burnun üstünde.',
            'Tek yol köprüden geçiyor. Köprüyü kaçırma.',
            'Lağımlar patladı, gedik açıldı.'] },
  { ad: 'Kamaniçe', alt: '27 Ağustos 1672',
    names: ['Son Hücum', 'Kanatlı Süvari', 'Kale Kapısı', 'Kale Muhafızları', 'Barut Kulesi', 'Teslim', 'Sancak Burçta', 'Bucaş Yolu', 'Bucaş Antlaşması', 'Kamaniçe Fethi'],
    bosses: ['lehhatmani', 'kamanicekomutani'],
    lines: ['Leh muhafızları kalenin son kapısında. Hücum!',
            'Kanatlı süvarilerin son hücumunu okla karşıla.',
            'Kamaniçe düşünce Podolya bizim.'] },
  /* ---- 21. sefer: Prut ---- */
  { ad: 'Tuna\'dan Kuzeye', alt: '1711',
    names: ['Edirne Ordugâhı', 'Babadağ', 'İsakçı', 'Tuna Köprüsü', 'Kartal', 'Buğdan Yolu', 'Yaş Yolu', 'Tatar Atlıları', 'Bozkır', 'Prut Kıyısı'],
    bosses: ['kazakatamani', 'ruskomutani'],
    lines: ['Rus Çarı ordusuyla Buğdan\'a girdi. Baltacı Mehmed Paşa karşılamaya yürüyor.',
            'Kırım Tatarlarının atlıları ordunun öncüsü.',
            'Bozkır geniş, Rus piyadesi kalabalık. Kapılardan büyük çık.'] },
  { ad: 'Buğdan', alt: 'Rus ordusu Yaş\'ta',
    names: ['Yaş', 'Buğdan Ormanı', 'Kazak Öncüleri', 'Rus Öncüleri', 'Köy Yolları', 'Prut Vadisi', 'Falçi', 'Bataklık Kıyısı', 'Köprü Kuruluyor', 'Prut\'u Geçiş'],
    bosses: ['ruskomutani', 'kazakatamani'],
    lines: ['Rus ordusu Yaş\'ta. Kazak atlıları ormanlardan çıkıyor.',
            'Prut\'un üstüne köprü kuruldu. Ordu karşıya geçiyor.',
            'Bataklık kıyısında yol dar. Hendeklerde köprüyü bul.'] },
  { ad: 'Prut Kıyısı', alt: 'Temmuz 1711',
    names: ['Stanileşti', 'Rus Ordugâhı', 'Arabalar Diziliyor', 'Tüfekçi Hattı', 'Grenadiyer Hücumu', 'Yeniçeri Hattı', 'Top Bataryaları', 'Kuşatma Kapanıyor', 'Su Yolu Kesildi', 'Rus Ordusu Sıkıştı'],
    bosses: ['muskecibasi', 'ruskomutani'],
    lines: ['Rus ordusu nehrin kıvrımında araba tabyası kurdu.',
            'Grenadiyerler el bombası atar gibi sert gelir. Okla erken karşıla.',
            'Su yolu kesildi. Kuşatma kapanıyor.'] },
  { ad: 'Kuşatma', alt: 'Üç gün üç gece',
    names: ['Gece Ateşi', 'Rus Çıkışı', 'Karşı Hücum', 'Tatar Süvarisi', 'Nehir Kıyısı', 'Barut Azalıyor', 'İkinci Gece', 'Son Çıkış', 'Elçi Geliyor', 'Barış Çadırı'],
    bosses: ['kazakatamani', 'carmuhafizi'],
    lines: ['Rus ordusu gece gündüz çıkış deniyor. Hattı tut.',
            'Çar\'ın muhafızları kuşatmayı yarmak istiyor.',
            'Barış elçisi geliyor. Ama önce son çıkışı geri püskürt.'] },
  { ad: 'Prut', alt: '22 Temmuz 1711',
    names: ['Antlaşma Sabahı', 'Rus Muhafızları', 'Çar\'ın Sancağı', 'Son Hat', 'Ordu Çekiliyor', 'Azak Geri Alındı', 'Dönüş Yolu', 'Tuna Kıyısı', 'Zafer Alayı', 'Prut Zaferi'],
    bosses: ['ruskomutani', 'carmuhafizi'],
    lines: ['Çar barış istedi. Azak geri verilecek.',
            'Rus muhafızları sancaklarıyla çekiliyor. Son hattı dağıt.',
            'Zafer alayı Tuna\'ya dönüyor.'] },
  /* ---- 22. sefer: Malazgirt'e Dönüş (21 bölüm) ---- */
  { ad: 'Akıncı Yolu', alt: 'Asırların hatırası',
    names: ['Söğüt', 'Bursa', 'Edirne', 'Kosova', 'İstanbul', 'Mohaç', 'Rodos', 'Zigetvar', 'Kandiye', 'Prut'],
    bosses: ['sonsancak', 'carmuhafizi'],
    lines: ['Asırlar boyu açılan yol bir kez daha önünde. Her konakta eski bir zaferin hatırası.',
            'Bütün ordular yeniden karşında: Bizans\'tan Rus\'a, Haçlı\'dan Habsburg\'a.',
            'Sancak doğuya, her şeyin başladığı ovaya dönüyor.'] },
  { ad: 'Doğuya Dönüş', alt: 'Fırat\'tan Van\'a',
    names: ['Halep Kapısı', 'Fırat Geçidi', 'Urfa Ovası', 'Diyarbekir Önleri', 'Ahlat Kümbetleri', 'Van Kalesi Önü', 'Süphan Eteği', 'Murat Kıyısı', 'Muş Ovası', 'Malazgirt Kalesi'],
    bosses: ['duka', 'varangbasi'],
    lines: ['Fırat\'ın suyu yine bulanık, yollar yine uzun. Ama artık arkanda koca bir ordu var.',
            'Ahlat\'ın kümbetleri, Van\'ın kalesi: her şey ilk günkü gibi.',
            'Malazgirt Kalesi ufukta. Ova seni bekliyor.'] },
  { ad: 'Malazgirt Ovası', alt: '26 Ağustos 1071', n: 1,
    names: ['Malazgirt'],
    bosses: ['imparator', 'malazgirtfinal'],
    lines: ['Sultan beyaz giydi. Bin yetmiş birinci bölüm: bu ovada her şey başladı, bu ovada tamamlanacak.'] },
  /* ---- 23. sefer: Mora ---- */
  { ad: 'Korint', alt: '1715 · Berzah',
    names: ['Atina Yolu', 'Megara', 'Berzah Önü', 'Korint Kalesi', 'Akrokorint', 'Kale Teslim', 'Argos Yolu', 'Argolis Ovası', 'Anabolu Önleri', 'Ordugâh'],
    bosses: ['venedikkomutani', 'proveditor'],
    lines: ['Sadrazam Damat Ali Paşa Mora\'yı Venedik\'ten geri almaya yürüyor.',
            'Akrokorint kayalığın tepesinde. Önce okçularını sustur.',
            'Berzah aşıldı; yarımadanın kapısı açık.'] },
  { ad: 'Anabolu', alt: 'Venedik\'in Mora kalesi',
    names: ['Anabolu Limanı', 'Palamidi Tepesi', 'Burç Yolu', 'Sur Önü', 'Lağımlar', 'Palamidi Hücumu', 'Kale Kapısı', 'Liman Kulesi', 'Şehre Giriş', 'Anabolu Fethi'],
    bosses: ['muskecibasi', 'proveditor'],
    lines: ['Palamidi\'nin burçları yeni yapılmış, Venedik onlara çok güveniyor.',
            'Sur duvarlarını okla yık, gediği aç.',
            'Anabolu düşerse Mora\'nın başkenti bizim.'] },
  { ad: 'Mora Dağları', alt: 'Arkadya\'dan güneye',
    names: ['Tripoliçe', 'Arkadya Yaylası', 'Megalopolis', 'Dağ Köyleri', 'Kayalık Geçit', 'Zeytinlik Vadi', 'Kalamata', 'Mesenya Ovası', 'Kıyı Yolu', 'Koron Önleri'],
    bosses: ['stradiotbasi', 'venedikkomutani'],
    lines: ['Arkadya\'nın dağ yolları dar. Kalabalık ordu geçitte sıkışır.',
            'Stradiot süvarileri vadilerde pusu kuruyor.',
            'Güneyde Koron ve Moton bekliyor.'] },
  { ad: 'Koron ve Moton', alt: 'Güney kaleleri',
    names: ['Koron Kalesi', 'Liman Burcu', 'Moton Yolu', 'Moton Kalesi', 'Deniz Kapısı', 'Anavarin Limanı', 'Navarin Kalesi', 'Kıyı Hisarları', 'Venedik Gemileri', 'Güney Bizim'],
    bosses: ['venedikkaptani', 'muskecibasi'],
    lines: ['Kıyı kaleleri denizden destek alıyor. Gemiler gelmeden surları aş.',
            'Gülle şeritlerinden çekil, kıyı topları ateşte.',
            'Güneydeki kaleler bir bir düşüyor.'] },
  { ad: 'Mora', alt: 'Eylül 1715',
    names: ['Monemvasia Yolu', 'Kayalık Ada', 'Kale Köprüsü', 'Monemvasia', 'Son Venedik Kalesi', 'Teslim Görüşmesi', 'Mora Kıyısı', 'Zafer Alayı', 'Sancak Burçta', 'Mora Fethi'],
    bosses: ['stradiotbasi', 'proveditor'],
    lines: ['Monemvasia denizden yükselen bir kaya. Tek yol köprüden geçiyor.',
            'Venedik\'in son kalesi de teslim olmak üzere.',
            'Mora yüz günde yeniden bizim.'] },
  /* ---- 24. sefer: Belgrad ---- */
  { ad: 'Niş Yolu', alt: '1737 · Habsburg yürüyüşü',
    names: ['Sofya Ordugâhı', 'Şehirköy', 'Niş Önleri', 'Niş Kalesi', 'Morava Vadisi', 'Paraçin', 'Yagodina', 'Ormanlı Tepeler', 'Semendire Yolu', 'Tuna Yakını'],
    bosses: ['kirasiyerbasi', 'avusturyamaresal'],
    lines: ['Habsburg ordusu Niş\'i aldı. Ordu Sofya\'dan karşılamaya çıktı.',
            'Beyaz üniformalı Avusturya piyadesi düzenli ve sabırlı.',
            'Morava vadisi boyunca kuzeye. Tuna yakın.'] },
  { ad: 'Hisarcık', alt: '22 Temmuz 1739',
    names: ['Hisarcık Sırtları', 'Bağlar Arası', 'Dar Yol', 'Habsburg Öncüleri', 'Kürasiyer Hücumu', 'Tepe Mevzisi', 'Sabah Savaşı', 'Öğle Sıcağı', 'Habsburg Ricatı', 'Hisarcık Zaferi'],
    bosses: ['husarbasi', 'avusturyamaresal'],
    lines: ['Habsburg ordusu bağların arasındaki dar yoldan geliyor. Sırtları tut.',
            'Kürasiyerler dar yolda sıkıştı. Ok yağmurunu kesme.',
            'Hisarcık\'ta kazanılırsa Belgrad\'ın yolu açılır.'] },
  { ad: 'Belgrad Önleri', alt: 'Kuşatma',
    names: ['Tuna Kıyısı', 'Sava Köprüsü', 'Zemun', 'Belgrad Surları', 'Top Bataryaları', 'Kale Hendeği', 'Lağımlar', 'Kale Kapısı', 'Varoş', 'Kuşatma Kapanıyor'],
    bosses: ['muskecibasi', 'kirasiyerbasi'],
    lines: ['Belgrad yirmi bir yıldır Habsburg\'un elinde. Surlar yeniden sarılıyor.',
            'Hendekleri köprüden geç, surları okla yık.',
            'Kuşatma kapanıyor. Kaleden çıkışlara dikkat.'] },
  { ad: 'Tuna Adaları', alt: 'Ada Kale ve Orsova',
    names: ['Demirkapı', 'Orsova', 'Ada Kale', 'Tuna Gemileri', 'Mehadia Yolu', 'Kıyı Hisarı', 'Ada Kuşatması', 'Kale Teslim', 'Kıyı Boyu', 'Belgrad\'a Dönüş'],
    bosses: ['husarbasi', 'muskecibasi'],
    lines: ['Tuna\'nın ortasındaki Ada Kale nehri tutuyor.',
            'Demirkapı boğazı dar ve kayalık.',
            'Adalar düşünce Belgrad yalnız kalır.'] },
  { ad: 'Belgrad', alt: '18 Eylül 1739',
    names: ['Son Kuşatma', 'İç Kale', 'Nebojşa Kulesi', 'Kale Muhafızları', 'Antlaşma Çadırı', 'Kale Teslim', 'Kale Kapısı', 'Şehre Giriş', 'Sancak Burçta', 'Belgrad Yeniden Bizim'],
    bosses: ['kirasiyerbasi', 'belgradmuhafizi'],
    lines: ['Antlaşma çadırı kuruldu ama kale muhafızları hâlâ burçlarda.',
            'Son direnişi kır, Belgrad\'ın kapıları açılsın.',
            'Tuna\'nın kilidi yeniden bizim.'] },
  /* ---- 25. sefer: Şebeş ---- */
  { ad: 'Vidin\'den Kuzeye', alt: '1788',
    names: ['Vidin Ordugâhı', 'Tuna Köprüsü', 'Fethülislam', 'Demirkapı Boğazı', 'Orsova Kıyısı', 'Kladova', 'Dağ Yolları', 'Habsburg Öncüleri', 'Sınır Karakolu', 'Banat Yolu'],
    bosses: ['husarbasi', 'avusturyamaresal'],
    lines: ['Habsburg ve Rusya birlikte savaş açtı. Sadrazam ordusunu Tuna\'nın kuzeyine geçiriyor.',
            'Sınır karakollarını birer birer temizle.',
            'Banat\'ın yolu dağlardan geçiyor.'] },
  { ad: 'Mehadia', alt: 'Dağ geçitleri',
    names: ['Mehadia Kalesi', 'Kaplıcalar', 'Çerna Vadisi', 'Dar Boğaz', 'Topçu Mevzisi', 'Orman Yolu', 'Kayalık Sırt', 'Geçit Tutuldu', 'Habsburg Çekiliyor', 'Mehadia Zaferi'],
    bosses: ['muskecibasi', 'kirasiyerbasi'],
    lines: ['Çerna vadisi dar ve ormanlık. Geçide hazırlıklı gir.',
            'Habsburg topları vadiyi tutuyor. Gülle şeritlerinden çekil.',
            'Mehadia düşerse Banat ovası açılır.'] },
  { ad: 'Banat Ovası', alt: 'Ova genişliyor',
    names: ['Lugoş Yolu', 'Banat Köyleri', 'Mısır Tarlaları', 'Timiş Kıyısı', 'Ova Konağı', 'Süvari Çatışması', 'Akıncı Öncüleri', 'Gece Yürüyüşü', 'Bataklık Kenarı', 'Şebeş Yolu'],
    bosses: ['husarbasi', 'kirasiyerbasi'],
    lines: ['Banat ovası mısır tarlalarıyla kaplı. Süvariler hızlı gelir.',
            'Habsburg ordusu Şebeş\'e çekiliyor. Peşlerini bırakma.',
            'Gece yürüyüşü başladı. Meşalelerin ışığında yolunu bul.'] },
  { ad: 'Şebeş Gecesi', alt: '21 Eylül 1788',
    names: ['Gece Ordugâhı', 'Köprü Başı', 'Karanlıkta Çığlık', 'Panik', 'Kendi Saflarına Ateş', 'Ordu Dağılıyor', 'Arabalar Devrildi', 'Kaçan Süvari', 'Sabah Sisi', 'Ova Bomboş'],
    bosses: ['muskecibasi', 'avusturyamaresal'],
    lines: ['Gece karanlığında Habsburg ordusunda bir çığlık yükseldi: "Türkler geliyor!"',
            'Panik saf saf yayılıyor; birlikler birbirine ateş açıyor.',
            'Sabah olduğunda ova bomboş. Kaçanların peşine düş.'] },
  { ad: 'Şebeş', alt: 'Eylül 1788',
    names: ['Şebeş Kasabası', 'Habsburg Artçısı', 'Son Hat', 'İmparator Çekiliyor', 'Ganimet Arabaları', 'Banat Bizim', 'Kale Kapısı', 'Zafer Alayı', 'Sancak Burçta', 'Şebeş Zaferi'],
    bosses: ['kirasiyerbasi', 'habsburgsancagi'],
    lines: ['İmparator ordusunun kalıntılarıyla çekiliyor. Artçıyı dağıt.',
            'Ganimet arabalarını okla durdur, hazine dolsun.',
            'Banat ovası bir kez daha Türk atlılarının.'] },
  /* ---- 26. sefer: Akka ---- */
  { ad: 'Gazze Yolu', alt: '1799 · Fransızlar geliyor',
    names: ['Ariş', 'Sina Kumları', 'Gazze', 'Hanyunus', 'Kıyı Yolu', 'Yafa Önleri', 'Remle', 'Yafa Surları', 'Portakal Bahçeleri', 'Kuzeye Yürüyüş'],
    bosses: ['fransizsuvaribasi', 'fransizgeneral2'],
    lines: ['Napolyon Mısır\'dan çıkıp Suriye kıyısına yürüyor. Önünde Akka var.',
            'Fransız piyadesi disiplinli ve sert. Kapılardan büyük çık.',
            'Kumlu kıyı yolu sıcak. Hızlı ol, Akıncı Bey.'] },
  { ad: 'Karmel', alt: 'Hayfa ve Karmel Dağı',
    names: ['Hayfa Limanı', 'Karmel Dağı', 'Dağ Yamacı', 'Kişon Vadisi', 'Kıyı Geçidi', 'Fransız Öncüleri', 'Tabor Yolu', 'Celile Tepeleri', 'Ova Kenarı', 'Akka Ufukta'],
    bosses: ['fransizsuvaribasi', 'nisancibasi'],
    lines: ['Karmel Dağı denize iniyor. Kıyı geçidi dar.',
            'Fransız ejder süvarileri ovada. Okla erken karşıla.',
            'Akka\'nın surları körfezin öbür ucunda.'] },
  { ad: 'Akka Surları', alt: 'Mart 1799',
    names: ['Kara Surları', 'Lanetli Kule', 'Kale Hendeği', 'Fransız Mevzileri', 'Lağım', 'Karşı Lağım', 'İngiliz Gemileri', 'Toplar Denizden', 'Gedik', 'İlk Hücum Püskürtüldü'],
    bosses: ['nisancibasi', 'fransizgeneral2'],
    lines: ['Cezzar Ahmed Paşa surları onarıp hendekleri derinleştirdi.',
            'Denizden gelen gemiler surlara top taşıyor.',
            'Gedik açıldı ama ilk hücum geri püskürtüldü.'] },
  { ad: 'Kuşatma', alt: 'Nisan–Mayıs 1799',
    names: ['Gece Çıkışı', 'Hendek Savaşı', 'Fransız Topları', 'Kuşatma Uzuyor', 'Yeni Gedik', 'Burç Savaşı', 'Rodos\'tan Yardım', 'Kıyıya Çıkarma', 'Sur Dibinde', 'Son Hücum Geliyor'],
    bosses: ['fransizsuvaribasi', 'fransizgeneral2'],
    lines: ['Kuşatma iki ayı geçti. Fransız topları gece gündüz susmuyor.',
            'Rodos\'tan yardım gemileri geldi. Kıyıya çıkarmayı koru.',
            'Son büyük hücum yaklaşıyor. Gedikte dimdik dur.'] },
  { ad: 'Akka', alt: '20 Mayıs 1799',
    names: ['Son Hücum', 'Gedikte Savaş', 'Fransız Muhafızları', 'Kule Önü', 'Fransız Ricatı', 'Toplar Bırakıldı', 'Kıyı Yolu', 'Peşlerinde', 'Sur Üstünde Zafer', 'Akka Savunması'],
    bosses: ['fransizgeneral2', 'fransizmuhafiz'],
    lines: ['Fransız muhafızları gediğe yükleniyor. Bu son hücum.',
            'Napolyon kuşatmayı kaldırıyor. Toplarını geride bırakıyor.',
            'Akka\'nın surlarında bir imparatorluk hayali sona erdi.'] },
  /* ---- 27. sefer: Silistre ---- */
  { ad: 'Kalafat', alt: '1853 · Tuna\'nın öbür yakası',
    names: ['Vidin', 'Kalafat Ordugâhı', 'Tuna Kıyısı', 'Çatana Köyü', 'Rus Öncüleri', 'Kar Altında', 'Çatana Baskını', 'Rus Ricatı', 'Eflak Ovası', 'Kalafat Zaferi'],
    bosses: ['kazakatamani', 'ruskomutani'],
    lines: ['Kış ortası. Ordu Tuna\'nın öbür yakasında, Kalafat\'ta mevzi kurdu.',
            'Çatana köyünde Rus kolu kar altında. Baskın zamanı.',
            'Nişancılar uzaktan isabetle ateş eder. Menzile girmeden erit.'] },
  { ad: 'Tuna Boyu', alt: 'Ruscuk\'tan Silistre\'ye',
    names: ['Ruscuk', 'Tutrakan', 'Kıyı Tabyaları', 'Tuna Adaları', 'Rus Gemileri', 'Kıyı Yolu', 'Silistre Yakını', 'Tabyalar Kuruluyor', 'Gece Nöbeti', 'Rus Ordusu Geçiyor'],
    bosses: ['nisancibasi', 'ruskomutani'],
    lines: ['Rus ordusu Tuna\'yı geçti. Silistre\'ye yürüyor.',
            'Kıyı tabyaları toprak ve kütükten. Hızla tahkim et.',
            'Gece nöbetinde gözünü dört aç.'] },
  { ad: 'Arap Tabya', alt: 'Mayıs 1854',
    names: ['Arap Tabya', 'Toprak Sur', 'Tabya Hendeği', 'Rus Lağımı', 'Gece Hücumu', 'Tabya Savunması', 'Top Ateşi', 'Nişancılar', 'Karşı Hücum', 'Tabya Ayakta'],
    bosses: ['carmuhafizi', 'nisancibasi'],
    lines: ['Küçük bir toprak tabya Rus ordusunun önünü kesiyor.',
            'Rus lağımcıları tabyanın altına iniyor. Yukarıdan ok yağdır.',
            'Gece hücumu püskürtüldü. Tabya ayakta.'] },
  { ad: 'Silistre Kuşatması', alt: 'Kırk gün',
    names: ['Silistre Surları', 'Tabyalar Hattı', 'Rus Bataryaları', 'Bombardıman', 'Çıkış Hücumu', 'Ekmek Azalıyor', 'Kale Kulesi', 'Yardım Yolda', 'Son Lağım', 'Kuşatma Uzuyor'],
    bosses: ['ruskomutani', 'carmuhafizi'],
    lines: ['Rus bataryaları şehri günlerdir dövüyor.',
            'Çıkış hücumuyla bataryaları sustur.',
            'Yardım yolda. Biraz daha dayan.'] },
  { ad: 'Silistre', alt: 'Haziran 1854',
    names: ['Son Hücum', 'Tabya Önü', 'Rus Muhafızları', 'Kuşatma Kalkıyor', 'Rus Ricatı', 'Tuna Kıyısı', 'Kaçan Ordu', 'Silistre Kurtuldu', 'Sancak Burçta', 'Silistre Zaferi'],
    bosses: ['kazakatamani', 'rusmaresal'],
    lines: ['Rus mareşali son hücumu emretti. Tabyaları tut!',
            'Kuşatma kalkıyor. Rus ordusu Tuna\'ya çekiliyor.',
            'Silistre kurtuldu.'] },
  /* ---- 28. sefer: Plevne ---- */
  { ad: 'Vidin\'den Plevne\'ye', alt: 'Temmuz 1877',
    names: ['Vidin Ordugâhı', 'Zorlu Yürüyüş', 'Lom Kıyısı', 'Vit Vadisi', 'Plevne Ovası', 'Tabyalar Kazılıyor', 'Gece Çalışması', 'Grivitsa Tepesi', 'Rus Öncüleri', 'Birinci Plevne'],
    bosses: ['kazakatamani', 'ruskomutani'],
    lines: ['Gazi Osman Paşa ordusunu Vidin\'den Plevne\'ye yetiştirdi.',
            'Tepelere toprak tabyalar kazılıyor. Gece gündüz çalış.',
            'Rus öncüleri geldi. İlk hücumu karşıla.'] },
  { ad: 'Tabyalar', alt: 'Toprak surlar',
    names: ['Grivitsa Tabyası', 'Kanlı Tabya', 'Yeşil Tepeler', 'Toprak Siperler', 'Nişancı Hattı', 'Rus Bataryası', 'Gece Baskını', 'Tabyalar Arası', 'İkinci Plevne', 'Siperler Ayakta'],
    bosses: ['nisancibasi', 'carmuhafizi'],
    lines: ['Tabyalar birbirini koruyor. Siperlerden nişancılar ateş ediyor.',
            'Rus bataryaları tepeleri dövüyor. Gülle şeritlerinden çekil.',
            'İkinci büyük hücum da püskürtüldü.'] },
  { ad: 'Lofça', alt: 'Eylül 1877',
    names: ['Lofça Yolu', 'Lofça Kasabası', 'Rus Kolordusu', 'Dağ Sırtı', 'Kasabada Savaş', 'Geri Çekiliş', 'Yolu Açık Tut', 'Erzak Arabaları', 'Plevne\'ye Dönüş', 'Tabya Hattı'],
    bosses: ['kazakatamani', 'ruskomutani'],
    lines: ['Lofça Plevne\'nin erzak yolunu tutuyor. Rus kolordusu kasabaya yüklendi.',
            'Erzak arabalarını koru. Yol açık kalmalı.',
            'Plevne\'ye dön. Büyük hücum yaklaşıyor.'] },
  { ad: 'Üçüncü Plevne', alt: '11 Eylül 1877',
    names: ['Sabah Sisi', 'Rus Bataryaları', 'Grivitsa Hücumu', 'Sol Kanat', 'Yeşil Tepeler Hücumu', 'Tabyada Göğüs Göğüse', 'Karşı Hücum', 'Siperler Geri Alındı', 'Akşam Karanlığı', 'Üçüncü Plevne'],
    bosses: ['carmuhafizi', 'rusmaresal'],
    lines: ['Dört gün süren bombardımanın ardından en büyük hücum başladı.',
            'Tabyalarda göğüs göğüse savaş. Siperleri geri al.',
            'Akşam karanlığında hücum dağıldı.'] },
  { ad: 'Plevne', alt: 'Destan',
    names: ['Kuşatma Sıkılaşıyor', 'Kış Geliyor', 'Erzak Azalıyor', 'Vit Köprüsü', 'Son Çıkış', 'Yarma Hareketi', 'Rus Hattı', 'Gazi\'nin Sancağı', 'Tabyalar Ayakta', 'Plevne Destanı'],
    bosses: ['nisancibasi', 'grandukmuhafizi'],
    lines: ['Kış geldi, erzak azaldı. Gazi Osman Paşa son çıkışa hazırlanıyor.',
            'Vit köprüsünden Rus hattına yüklen.',
            'Plevne\'nin destanı dillerde.'] },
  /* ---- 29. sefer: Dömeke ---- */
  { ad: 'Alasonya', alt: 'Nisan 1897',
    names: ['Alasonya Ordugâhı', 'Sınır Karakolları', 'Olimpos Eteği', 'Melona Geçidi', 'Dağ Sırtları', 'Gece Yürüyüşü', 'Geçit Savaşı', 'Sis İçinde', 'Geçit Tutuldu', 'Teselya Ovası'],
    bosses: ['yunankomutani', 'nisancibasi'],
    lines: ['Ethem Paşa ordusunu Alasonya\'da topladı. Önünde dağ geçitleri var.',
            'Melona geçidi dar ve sisli. Kalabalık ordu sıkışır.',
            'Geçit tutuldu; Teselya ovası ayaklarının altında.'] },
  { ad: 'Tırnova', alt: 'Teselya\'ya iniş',
    names: ['Tırnova', 'Ova Köyleri', 'Nehir Kıyısı', 'Süvari Öncüleri', 'Yenişehir Yolu', 'Yenişehir', 'Şehre Giriş', 'Teselya Ovası', 'Buğday Tarlaları', 'Fersala Yolu'],
    bosses: ['nisancibasi', 'yunankomutani'],
    lines: ['Ordu ovaya indi. Yenişehir savaşmadan boşaltıldı.',
            'Nehir kıyısında hendekleri köprüden geç.',
            'Fersala yolunda düşman yeniden saf tutuyor.'] },
  { ad: 'Velestin', alt: 'Dağ yolu',
    names: ['Velestin Geçidi', 'Demiryolu Hattı', 'Tepe Mevzileri', 'Nişancılar', 'Dar Yol', 'Süvari Hücumu', 'Geçit Savaşı', 'Kayalık Sırt', 'Velestin', 'Golos Yolu'],
    bosses: ['yunankomutani', 'nisancibasi'],
    lines: ['Velestin geçidi Golos limanına iniyor. Tepeler nişancılarla dolu.',
            'Dar yolda süvari hücumu: okla erken karşıla.',
            'Geçit açılınca Golos\'un yolu da açılır.'] },
  { ad: 'Fersala', alt: 'Mayıs 1897',
    names: ['Fersala Ovası', 'Tepe Hattı', 'Top Bataryaları', 'Sol Kanat', 'Sağ Kanat', 'Akşam Hücumu', 'Gece Ricatı', 'Dömeke Yolu', 'Dağ Eteği', 'Dömeke Önleri'],
    bosses: ['nisancibasi', 'yunankomutani'],
    lines: ['Fersala tepelerinde düşman hattı kuruldu.',
            'Akşam hücumuyla hat yarıldı; düşman gece çekiliyor.',
            'Son mevzi Dömeke sırtları.'] },
  { ad: 'Dömeke', alt: '17 Mayıs 1897',
    names: ['Dömeke Sırtları', 'Siperler', 'Nişancı Hattı', 'Sabah Topçusu', 'Öğle Hücumu', 'Sırta Tırmanış', 'Siperler Düştü', 'Akşam Zaferi', 'Ateşkes', 'Dömeke Zaferi'],
    bosses: ['yunankomutani', 'yunanbaskomutani'],
    lines: ['Dömeke sırtları siperlerle kaplı. Yokuş yukarı hücum zorlu.',
            'Siperler birer birer düşüyor. Sancağı yüksek tut.',
            'Akşama doğru sırtlar alındı. Savaş bitiyor.'] },
  /* ---- 30. sefer: Fetih Yolu (32 bölüm) ---- */
  { ad: 'Asırların Sancağı', alt: 'Mora\'dan Dömeke\'ye',
    names: ['Korint', 'Hisarcık', 'Mehadia', 'Şebeş', 'Akka', 'Silistre', 'Arap Tabya', 'Plevne', 'Velestin', 'Dömeke'],
    bosses: ['fransizmuhafiz', 'yunanbaskomutani'],
    lines: ['Son iki asrın zaferleri bir kez daha önünde.',
            'Venedik\'ten Fransa\'ya, Habsburg\'dan Rusya\'ya: bütün ordular yeniden karşında.',
            'Sancak İstanbul\'a, her şeyin değiştiği şehre dönüyor.'] },
  { ad: 'Boğaziçi', alt: 'Rumeli Hisarı\'ndan surlara',
    names: ['Edirne Ordugâhı', 'Çorlu', 'Silivri', 'Boğazkesen', 'Rumeli Hisarı', 'Şahi Toplar', 'Ordugâh Kuruluyor', 'Gemiler Karadan', 'Haliç', 'Surların Önü'],
    bosses: ['cenevizkaptani', 'surkomutani'],
    lines: ['Rumeli Hisarı yine Boğaz\'ın en dar yerinde yükseliyor.',
            'Şahi toplar yolda. Önlerindeki yolu temizle.',
            'Gemiler tepelerin üstünden Haliç\'e iniyor.'] },
  { ad: 'İstanbul Surları', alt: '29 Mayıs 1453', n: 12,
    names: ['Altın Kapı', 'Yedikule', 'Topkapı', 'Edirnekapı', 'Lykos Vadisi', 'Kara Hendeği', 'Gedik', 'Ulubatlı Hasan', 'Burçta Sancak', 'Kerkoporta', 'Şehrin İçinde', 'Fetih'],
    bosses: ['cenevizkomutani', 'fetihfinal'],
    lines: ['Üç kat sur, önünde derin hendek. Elli üç günlük kuşatmanın son günleri.',
            'Ulubatlı Hasan sancağı burca dikti. Arkasından yetiş.',
            'Gedik açıldı. Bu kapıdan bir çağ geçecek.'] }
];
const BOSSES = {
  kumandan:      { ad: 'Öncü Kumandanı',     tip: 'piyade',    renk: 0xb8323a },
  duka:          { ad: 'Urfa Dukası',          tip: 'piyade',    renk: 0x8e1f5c },
  strategos:     { ad: 'Strategos',            tip: 'piyade',    renk: 0x6d2b8f },
  katafraktbasi: { ad: 'Katafrakt Başbuğu',    tip: 'katafrakt', renk: 0x5a6470 },
  varangbasi:    { ad: 'Varang Başı',          tip: 'varang',    renk: 0x3b4a5e },
  imparator:     { ad: 'İmparator Muhafızı',   tip: 'varang',    renk: 0x6a1b7a },
  akritbeyi:     { ad: 'Akrit Beyi',           tip: 'akrit',     renk: 0x9a4a2a },
  sinirdukasi:   { ad: 'Sınır Dukası',         tip: 'piyade',    renk: 0x7a2a6e },
  iznikdukasi:   { ad: 'İznik Dukası',         tip: 'varang',    renk: 0x5a2a8a },
  sovalyebasi:   { ad: 'Şövalye Başı',         tip: 'sovalye',   renk: 0x2c4f8f },
  frankkontu:    { ad: 'Frank Kontu',          tip: 'frank',     renk: 0x2a6a4a },
  normandukasi:  { ad: 'Norman Dükü',          tip: 'sovalye',   renk: 0x8a2a2a },
  haclibasi:     { ad: 'Haçlı Başkomutanı',    tip: 'sovalye',   renk: 0xd8d0c0 },
  kalkanbasi:    { ad: 'Kalkan Başı',          tip: 'kalkanli',  renk: 0x8e3a2a },
  mancinikustasi:{ ad: 'Mancınık Ustası',      tip: 'piyade',    renk: 0x6a5a3a },
  manuel:        { ad: 'İmparatorun Sancağı',  tip: 'varang',    renk: 0x7a1b6a },
  latinkomutani: { ad: 'Latin Komutanı',       tip: 'latin',     renk: 0x8a2a2a },
  trabzondukasi: { ad: 'Trabzon Dukası',       tip: 'piyade',    renk: 0x6a2a7a },
  rusknezi:      { ad: 'Rus Knezi',            tip: 'akrit',     renk: 0x5a4a2a },
  cenevizkaptani:{ ad: 'Ceneviz Kaptanı',      tip: 'arbalet',   renk: 0xb02a3a },
  tekfur:        { ad: 'Tekfur',               tip: 'piyade',    renk: 0x8e1f5c },
  alanbeyi:      { ad: 'Alan Beyi',            tip: 'alan',      renk: 0x4a5a3a },
  bizansbaskomutani: { ad: 'Bizans Başkumandanı', tip: 'varang', renk: 0x6a1b7a },
  katalanbasi:   { ad: 'Katalan Başı',         tip: 'katalan',   renk: 0xc8a02a },
  edirnekomutani:{ ad: 'Edirne Komutanı',      tip: 'kalkanli',  renk: 0x7a2a2a },
  sirpvoyvoda:   { ad: 'Sırp Voyvodası',       tip: 'sirpsovalye', renk: 0x9a2a2a },
  bulgarboyari:  { ad: 'Bulgar Boyarı',        tip: 'sirppiyade', renk: 0x2a6a4a },
  agirsuvaribasi:{ ad: 'Ağır Süvari Başı',     tip: 'sirpsovalye', renk: 0x5a5a6a },
  sirpkralsancagi:{ ad: 'Sırp Kralının Sancağı', tip: 'sirpsovalye', renk: 0xa02a2a },
  eflakbeyi:     { ad: 'Eflak Beyi',           tip: 'akrit',     renk: 0x3a4a8a },
  macarbaronu:   { ad: 'Macar Baronu',         tip: 'macar',     renk: 0x2a7a3a },
  fransizkontu:  { ad: 'Fransız Kontu',        tip: 'sovalye',   renk: 0x2a3a9a },
  haclikral:     { ad: 'Haçlı Kralı',          tip: 'sovalye',   renk: 0xd8b040 },
  erdelvoyvoda:  { ad: 'Erdel Voyvodası',      tip: 'macar',     renk: 0x8a2a2a },
  lehsovalye:    { ad: 'Leh Şövalyesi',        tip: 'sovalye',   renk: 0xb02030 },
  venedikkaptani:{ ad: 'Venedik Kaptanı',      tip: 'arbalet',   renk: 0xa0202a },
  tabyakomutani: { ad: 'Tabya Komutanı',       tip: 'tufekci',   renk: 0x4a3a2a },
  surkomutani:   { ad: 'Sur Komutanı',         tip: 'kalkanli',  renk: 0x7a1b2a },
  cenevizkomutani:{ ad: 'Ceneviz Komutanı',    tip: 'ceneviz',   renk: 0xb02a3a },
  sonsancak:     { ad: 'Son İmparatorun Sancağı', tip: 'varang', renk: 0x6a1b7a },
  moradespotu:   { ad: 'Mora Despotu',         tip: 'piyade',    renk: 0x6a2a7a },
  venedikkomutani:{ ad: 'Venedik Komutanı',    tip: 'venedik',   renk: 0xa0202a },
  trabzonmuhafizi:{ ad: 'Trabzon Muhafızı',    tip: 'varang',    renk: 0x5a2a8a },
  bosnakrali:    { ad: 'Bosna Kralı',          tip: 'sirpsovalye', renk: 0x2a4a9a },
  otrantokomutani:{ ad: 'Otranto Komutanı',    tip: 'ceneviz',   renk: 0x2a6a4a },
  hirvatbani:    { ad: 'Hırvat Banı',          tip: 'hirvat',    renk: 0xb02030 },
  belgradkomutani:{ ad: 'Belgrad Komutanı',    tip: 'hirvat',    renk: 0x2a7a3a },
  zirhlibasi:    { ad: 'Zırhlı Süvari Başı',   tip: 'zirhli',    renk: 0x5a5a6a },
  rodoskulesi:   { ad: 'Burç Muhafızı',        tip: 'rodos',     renk: 0x8a1a24 },
  rodosustadi:   { ad: 'Şövalyelerin Üstadı',  tip: 'rodos',     renk: 0x1a1a1a },
  husarbasi:     { ad: 'Hafif Süvari Başı',    tip: 'husar',     renk: 0x2a7a3a },
  landsknechtbasi:{ ad: 'Paralı Asker Yüzbaşısı', tip: 'landsknecht', renk: 0xd8b040 },
  topcubasi:     { ad: 'Topçu Başı',           tip: 'arkebuz',   renk: 0x3a3a40 },
  macarkral:     { ad: 'Macar Kralının Sancağı', tip: 'zirhli',  renk: 0xb02030 },
  avusturyakomutani:{ ad: 'Avusturya Kumandanı', tip: 'zirhli',  renk: 0xd8b040 },
  budinkomutani: { ad: 'Budin Kale Komutanı',  tip: 'landsknecht', renk: 0x1a1a1a },
  zigetvarkomutani:{ ad: 'Zigetvar Kale Komutanı', tip: 'hirvat', renk: 0x8a1a24 },
  kirasiyerbasi: { ad: 'Kürasiyer Başı',       tip: 'kirasiyer', renk: 0x3a3a40 },
  muskecibasi:   { ad: 'Tüfekçi Başı',         tip: 'muskeci',   renk: 0x2a3a5a },
  avusturyakomutani2: { ad: 'Avusturya Kumandanı', tip: 'kirasiyer', renk: 0xd8b040 },
  stradiotbasi:  { ad: 'Stradiot Başı',        tip: 'stradiot',  renk: 0xa0202a },
  magusakomutani:{ ad: 'Mağusa Komutanı',      tip: 'venedik',   renk: 0x7a1a24 },
  erdelprensi:   { ad: 'Erdel Prensi',         tip: 'husar',     renk: 0x2a4a8a },
  habsburgkomutani:{ ad: 'Habsburg Başkomutanı', tip: 'kirasiyer', renk: 0xe0c040 },
  fransizgeneral:{ ad: 'Fransız Komutanı',     tip: 'landsknecht', renk: 0x2a3a9a },
  kandiyekomutani:{ ad: 'Kandiye Komutanı',    tip: 'venedik',   renk: 0xa0202a },
  uyvarkomutani: { ad: 'Uyvar Komutanı',       tip: 'landsknecht', renk: 0x1a1a1a },
  kazakatamani:  { ad: 'Kazak Atamanı',        tip: 'kazak',     renk: 0x2a4a8a },
  lehhatmani:    { ad: 'Leh Hatmanı',          tip: 'kanatlihusar', renk: 0xa02a2a },
  kamanicekomutani:{ ad: 'Kamaniçe Komutanı',  tip: 'landsknecht', renk: 0xb02030 },
  ruskomutani:   { ad: 'Rus Generali',         tip: 'rusasker',  renk: 0x2a5a3a },
  carmuhafizi:   { ad: 'Çar Muhafızı',         tip: 'grenadiyer', renk: 0x2a4a2a },
  malazgirtfinal:{ ad: 'Bizans İmparatorluk Ordusu', tip: 'katafrakt', renk: 0x6a1b7a },
  proveditor:    { ad: 'Venedik Proveditörü',  tip: 'venedik',   renk: 0xa0202a },
  avusturyamaresal:{ ad: 'Avusturya Mareşali', tip: 'avusturyapiyade', renk: 0xece6d6 },
  belgradmuhafizi:{ ad: 'Belgrad Kale Muhafızı', tip: 'avusturyapiyade', renk: 0xe0c040 },
  habsburgsancagi:{ ad: 'Habsburg İmparatorunun Sancağı', tip: 'kirasiyer', renk: 0xe0c040 },
  fransizsuvaribasi:{ ad: 'Fransız Süvari Başı', tip: 'fransizsuvari', renk: 0x2a3a9a },
  fransizgeneral2:{ ad: 'Fransız Generali',    tip: 'fransizpiyade', renk: 0x2a3a9a },
  fransizmuhafiz:{ ad: 'Fransız Muhafız Alayı', tip: 'fransizpiyade', renk: 0x1a1a3a },
  nisancibasi:   { ad: 'Nişancı Başı',         tip: 'nisanci',   renk: 0x3a4a3a },
  rusmaresal:    { ad: 'Rus Mareşali',         tip: 'grenadiyer', renk: 0x2a5a3a },
  grandukmuhafizi:{ ad: 'Grandükün Muhafızları', tip: 'grenadiyer', renk: 0x1a3a2a },
  yunankomutani: { ad: 'Yunan Komutanı',       tip: 'yunanpiyade', renk: 0x2a5aa8 },
  yunanbaskomutani:{ ad: 'Yunan Başkomutanı',  tip: 'yunanpiyade', renk: 0x1a3a7a },
  fetihfinal:    { ad: 'Son İmparatorun Ordusu', tip: 'varang',  renk: 0x6a1b7a }
};
const BOSS_TXT = {
  kumandan: 'Bölümün sonunda Öncü Kumandanı bekliyor. Dev gibi; ok yağmuruyla erit.',
  duka: 'Urfa Dukası kendi alayıyla yolu kesti. Kapılardan büyük çıkman gerek.',
  strategos: 'Bizans Strategos\'u ordusunun başında. Silahını güçlendirmeden yaklaşma.',
  katafraktbasi: 'Katafrakt Başbuğu demir zırhlı atıyla geliyor. Ateşli Ok bulursan çok işe yarar.',
  varangbasi: 'Varang Başı, imparatorun baltalı muhafızı. Çatışmaya girmeden önce yarısını düşür.',
  imparator: 'İmparator Romen Diyojen\'in Muhafız Alayı karşında. Bu son hamle, Akıncı Bey.',
  akritbeyi: 'Akrit Beyi sınır süvarileriyle yolu tuttu. Hızlı gelir; okun önünde erisin.',
  sinirdukasi: 'Sınır Dukası kalesinden çıktı. Alayını dağıtmadan ona ulaşamazsın.',
  iznikdukasi: 'İznik Dukası surların önünde son direnişte. Şehrin kapıları onun arkasında.',
  sovalyebasi: 'Şövalye Başı demir zırhlı atıyla hücuma kalktı. En güçlü yayını hazırla.',
  frankkontu: 'Frank Kontu piyadelerini sıraya dizdi. Önce kalabalığı erit.',
  normandukasi: 'Norman Dükü Haçlıların en çetin komutanı. Ok yağmurunu kesme.',
  haclibasi: 'Haçlı ordusunun başkomutanı sancağıyla karşında. Bu seferin son hamlesi.',
  kalkanbasi: 'Kalkan Başı ağır piyadenin önünde. Kalkanları delmek için güçlü yay gerek.',
  mancinikustasi: 'Mancınık Ustası taş yağdırıyor. Gölgelerden kaç, ustaya ok yağdır.',
  manuel: 'İmparator Manuel\'in sancağı ve muhafızları karşında. Miryokefalon\'un son hamlesi.',
  latinkomutani: 'Latin Komutanı paralı askerlerinin başında. Kalabalığı erit, sonra ona ulaş.',
  trabzondukasi: 'Trabzon Dukası Sinop\'u bırakmak istemiyor. Muhafızlarını dağıt.',
  rusknezi: 'Rus Knezi atlılarıyla kıyıya indi. Hızlı gelir, okla karşıla.',
  cenevizkaptani: 'Ceneviz Kaptanı kuleyi arbaletçileriyle tutuyor. Menzile girmeden erit.',
  tekfur: 'Hisarın Tekfuru kapıların önünde. Askerlerini dağıt, hisar senin.',
  alanbeyi: 'Alan Beyi paralı süvarilerinin başında. Hızlı ve sert gelir.',
  bizansbaskomutani: 'Bizans Başkumandanı ordusunun merkezinde. Koyunhisar\'ın son hamlesi.',
  katalanbasi: 'Katalan Başı, imparatorun paralı askerlerinin en çetini. Ok yağmurunu kesme.',
  edirnekomutani: 'Edirne Komutanı surların önünde son direnişte. Rumeli\'nin kalbi arkasında.',
  sirpvoyvoda: 'Sırp Voyvodası ağır süvarisiyle geliyor. En güçlü yayını hazırla.',
  bulgarboyari: 'Bulgar Boyarı kalesinin önünde. Piyadesini erit, kapı açılsın.',
  agirsuvaribasi: 'Ağır Süvari Başı hücuma kalktı. Yaklaşmadan önce sayılarını düşür.',
  sirpkralsancagi: 'Sırp Kralının Sancağı ve muhafızları karşında. Kosova\'nın son hamlesi.',
  eflakbeyi: 'Eflak Beyi atlılarıyla ormandan çıktı. Okla erken karşıla.',
  macarbaronu: 'Macar Baronu süvarilerinin başında. Hızlı gelir, sert vurur.',
  fransizkontu: 'Fransız Kontu şövalyelerini sıraya dizdi. Gururlu ve sabırsız; okla karşıla.',
  haclikral: 'Haçlı Kralı sancağıyla karşında. Bu seferin son hamlesi.',
  erdelvoyvoda: 'Erdel Voyvodası süvarileriyle geçidi zorluyor. Derbendi tut.',
  lehsovalye: 'Leh Şövalyesi kralın muhafızı. Zırhı ağır, okun güçlü olmalı.',
  venedikkaptani: 'Venedik Kaptanı kıyıyı arbaletçileriyle tutuyor. Menzile girmeden erit.',
  tabyakomutani: 'Tabya Komutanı arabaların ardında tüfekçilerini diziyor. Tabyayı kır ya da dolaş.',
  surkomutani: 'Sur Komutanı gediği tutuyor. Kalkanlıların arkasından çıkmadan erit.',
  cenevizkomutani: 'Ceneviz Komutanı surların en zayıf yerini savunuyor. Zırhı ağır, ok yağmurunu kesme.',
  sonsancak: 'Son imparatorun sancağı ve muhafızları karşında. Fethin son hamlesi.',
  moradespotu: 'Mora Despotu muhafızlarıyla kalesinin önünde. Askerlerini dağıt.',
  venedikkomutani: 'Venedik Komutanı kıyı kalesini bırakmak istemiyor. Kalabalığı erit.',
  trabzonmuhafizi: 'Trabzon\'un muhafız alayı surların önünde son direnişte.',
  bosnakrali: 'Bosna Kralı ağır süvarisiyle dağ kalesinden indi. En güçlü yayını hazırla.',
  otrantokomutani: 'Otranto Komutanı burcun başında. Bu seferin son hamlesi.',
  hirvatbani: 'Hırvat Banı sınır askerlerinin başında. Önce kalabalığı erit.',
  belgradkomutani: 'Belgrad Komutanı iç kalede son direnişte. Kapı onun arkasında.',
  zirhlibasi: 'Zırhlı Süvari Başı demir zırhlı atıyla hücuma kalktı. Yaklaşmadan önce sayılarını düşür.',
  rodoskulesi: 'Burç Muhafızı şövalyeleriyle surun başında. Zırhları kalın, sabırlı ol.',
  rodosustadi: 'Şövalyelerin Üstadı son burçta. Rodos\'un son hamlesi.',
  husarbasi: 'Hafif Süvari Başı rüzgâr gibi geliyor. Okla erken karşıla.',
  landsknechtbasi: 'Paralı Asker Yüzbaşısı uzun mızraklı askerlerini diziyor. Ok yağmurunu kesme.',
  topcubasi: 'Topçu Başı topların ve arkebüzcülerin başında. Menzile girmeden erit.',
  macarkral: 'Macar Kralının Sancağı ve muhafızları karşında. Mohaç\'ın son hamlesi.',
  avusturyakomutani: 'Avusturya Kumandanı zırhlı süvarisiyle karşında. En güçlü yayını hazırla.',
  budinkomutani: 'Budin Kale Komutanı son burçta. Budin\'in son hamlesi.',
  zigetvarkomutani: 'Zigetvar\'ın komutanı muhafızlarıyla son çıkışı yapıyor. Zigetvar\'ın son hamlesi.',
  kirasiyerbasi: 'Kürasiyer Başı baştan aşağı zırhlı süvarisiyle geliyor. En güçlü yayını hazırla.',
  muskecibasi: 'Tüfekçi Başı tüfekçilerini sıraya dizdi. Menzile girmeden erit.',
  avusturyakomutani2: 'Avusturya Kumandanı kürasiyerlerinin başında.',
  stradiotbasi: 'Stradiot Başı hafif süvarisiyle rüzgâr gibi geliyor. Okla erken karşıla.',
  magusakomutani: 'Mağusa Komutanı son burçta. Kıbrıs\'ın son hamlesi.',
  erdelprensi: 'Erdel Prensi süvarilerinin başında. Hızlı gelir, okla karşıla.',
  habsburgkomutani: 'Habsburg Başkomutanı kürasiyerleriyle merkezde. Haçova\'nın son hamlesi.',
  fransizgeneral: 'Fransız Komutanı çıkarma askerlerinin başında. Kalabalığı erit.',
  kandiyekomutani: 'Kandiye Komutanı son burçta. Girit\'in son hamlesi.',
  uyvarkomutani: 'Uyvar Komutanı kalesinin kapısında. Askerlerini dağıt.',
  kazakatamani: 'Kazak Atamanı atlılarıyla bozkırdan çıktı. Hızlı gelir.',
  lehhatmani: 'Leh Hatmanı kanatlı süvarilerinin başında. Ağır ve hızlı; en güçlü yayını hazırla.',
  kamanicekomutani: 'Kamaniçe Komutanı son kapıda. Lehistan seferinin son hamlesi.',
  ruskomutani: 'Rus Generali piyadesini sıraya dizdi. Önce kalabalığı erit.',
  carmuhafizi: 'Çar Muhafızı grenadiyerleriyle karşında. Prut\'un son hamlesi.',
  malazgirtfinal: 'Bizans İmparatorluk Ordusu bütün görkemiyle karşında. Bin yetmiş bir bölümün son hamlesi, Akıncı Bey.',
  proveditor: 'Venedik Proveditörü kalesinin burcunda. Askerlerini dağıt.',
  avusturyamaresal: 'Avusturya Mareşali beyaz üniformalı piyadesini sıraya dizdi. Kalabalığı erit.',
  belgradmuhafizi: 'Belgrad Kale Muhafızı son burçta. Belgrad seferinin son hamlesi.',
  habsburgsancagi: 'Habsburg İmparatorunun Sancağı artçının ortasında. Şebeş\'in son hamlesi.',
  fransizsuvaribasi: 'Fransız Süvari Başı ejderleriyle geliyor. Ağır ve hızlı; okla erken karşıla.',
  fransizgeneral2: 'Fransız Generali piyadesini hücum düzenine soktu. Ok yağmurunu kesme.',
  fransizmuhafiz: 'Fransız Muhafız Alayı gediğe yükleniyor. Akka\'nın son hamlesi.',
  nisancibasi: 'Nişancı Başı tüfekçilerini siperlere dizdi. Menzile girmeden erit.',
  rusmaresal: 'Rus Mareşali grenadiyerleriyle karşında. En güçlü yayını hazırla.',
  grandukmuhafizi: 'Grandükün Muhafızları son hattı tutuyor. Plevne\'nin son hamlesi.',
  yunankomutani: 'Yunan Komutanı piyadesini sırtlara dizdi. Önce kalabalığı erit.',
  yunanbaskomutani: 'Yunan Başkomutanı son mevzide. Dömeke\'nin son hamlesi.',
  fetihfinal: 'Son imparatorun ordusu surların önünde. Bin dört yüz elli üç bölümün son hamlesi, Akıncı Bey.'
};
const UNLOCK_TXT = {
  2: 'Kaidelerin üstündeki sayıyı okla sıfırla: yeni yay, tuğ ya da Altın Alp senin olur.',
  5: 'Altın Alp kaideleri çıktı. Alp\'ler ordunun önünde yürür, tek başına yirmi akıncı gücünde ok atar.',
  8: 'Kazıklı barikatlar başladı. Çarparsan akıncı kaybedersin; okla kır ya da yanından geç.',
  11: 'Bizans okçuları ilk kez sahada. Yerinden kıpırdamaz, menzile girince ok atar. Önce sen vur.',
  14: 'Bazı kapılarda iki yol da kötü. Az zararlı olanı seç.',
  19: 'Katafraktlar geldi: ağır zırhlı, hızlı süvari. Okla erken karşıla.',
  31: 'Varang Muhafızları sahada: imparatorun baltalı seçkin askerleri.',
  50: 'Yeni sefer: Anadolu\'ya Akın! Akrit süvarileri sahada: Bizans\'ın hızlı sınır atlıları. Ordugâh\'ta 5 yeni basamak açıldı, Çelik Kirişli Yay kaidelerde.',
  52: 'Bizans kervanları yolda. Kervanı okla durdur: ganimeti akçe olarak hazineye eklenir.',
  100: 'Yeni sefer: Haçlılara Karşı! Haçlı piyadeleri ve arbaletçiler geldi. Ordugâh\'ta 5 yeni basamak, kaidelerde Sultan Yayı.',
  103: 'Şövalyeler sahada: Haçlıların demir zırhlı atlıları. Okun gücü yetmezse çarpışmaya girme.',
  105: 'Haçlılar mancınık kurdu. Yolda kırmızı halka beliren yere taş düşer: halkadan uzak dur.',
  150: 'Yeni sefer: Miryokefalon! Kalkanlı ağır piyade sahada. Ordugâh\'ta 5 yeni basamak açıldı.',
  153: 'Dağ geçitleri başladı. Dar boğazda kalabalık ordu sıkışır, bir kısmı geride kalır. Geçide hazırlıklı gir.',
  200: 'Yeni sefer: Selçuklu\'nun Zirvesi! Latin paralı askerleri sahada. Ordugâh\'ta 5 yeni basamak açıldı, kaidelerde Akkiriş Yayı.',
  250: 'Yeni sefer: Uç Beylikleri! Söğüt\'ten batıya akın. Alan süvarileri sahada, Ordugâh\'ta 5 yeni basamak.',
  300: 'Yeni sefer: Rumeli\'ye Geçiş! Katalan paralı askerleri sahada. Ordugâh\'ta 5 yeni basamak, kaidelerde Gazi Yayı.',
  303: 'Yollara hendek kazılmış. Ordunu köprüden geçir: köprüye sığmayan akıncılar hendekte kalır.',
  350: 'Yeni sefer: Kosova! Sırp piyadeleri sahada. Ordugâh\'ta 5 yeni basamak açıldı.',
  353: 'Sırp ağır süvarisi sahada: Balkanlar\'ın demir zırhlı atlıları.',
  400: 'Yeni sefer: Niğbolu! Macar süvarileri ve Haçlı şövalyeleri sahada. Ordugâh\'ta 5 yeni basamak, kaidelerde Yıldırım Yayı.',
  450: 'Yeni sefer: Varna! Ordugâh\'ta 5 yeni basamak açıldı.',
  453: 'Araba tabyaları sahada: zincirle bağlı arabaların ardından tüfekçiler ateş eder. Tabyayı okla kır ya da öbür yandan dolaş.',
  500: 'Yeni sefer: İstanbul\'un Fethi! Ceneviz zırhlıları sahada. Ordugâh\'ta 5 yeni basamak açıldı, kaidelerde Fatih Yayı.',
  502: 'Sur duvarları başladı: yolu baştan başa kapatır. Okla yık; yıkamazsan çarparsın ve akıncı kaybedersin.',
  510: 'Venedik piyadeleri sahada: Haliç\'i savunmaya gelen gemicilerin askerleri.',
  550: 'Yeni sefer: Fatih\'in Seferleri! Venedik piyadeleri ve Sırp süvarileri sahada.',
  600: 'Yeni sefer: Belgrad ve Rodos! Hırvat piyadeleri ve arkebüzcüler sahada, kaidelerde Kanuni Yayı.',
  603: 'Zırhlı Macar şövalyeleri sahada: bugüne kadarki en ağır süvari. Okun gücü yetmezse çarpışmaya girme.',
  630: 'Rodos Şövalyeleri sahada: ağır zırhlı, yavaş ve inatçı piyade.',
  650: 'Yeni sefer: Mohaç! Macar hafif süvarileri sahada.',
  652: 'Toplar ateşte! Yolda kırmızı şerit beliren hattan gülle yuvarlanır: şeritten çekil.',
  655: 'Alman paralı askerleri sahada: uzun mızraklı, kalabalık ve sert.',
  700: 'Yeni sefer: Budin! Tuna boyunda son hesaplaşma.',
  750: 'Yeni sefer: Zigetvar! Habsburg kürasiyerleri ve tüfekçileri sahada.',
  800: 'Yeni sefer: Kıbrıs! Venedik\'in Stradiot süvarileri sahada, kaidelerde Köprülü Yayı.',
  850: 'Yeni sefer: Haçova! Habsburg ve Erdel orduları karşında.',
  900: 'Yeni sefer: Girit! Venedik\'in en sağlam kalesi Kandiye\'ye yürüyoruz.',
  950: 'Yeni sefer: Uyvar ve Kamaniçe! Kaidelerde Alparslan Yayı.',
  970: 'Lehistan seferi başladı: Kazak süvarileri sahada.',
  973: 'Kanatlı süvariler sahada: Lehistan\'ın en ağır atlıları.',
  1000: 'Yeni sefer: Prut! Rus piyadeleri ve Kazak atlıları sahada.',
  1005: 'Rus grenadiyerleri sahada: ağır ve inatçı piyade.',
  1050: 'Malazgirt\'e Dönüş! Asırlar boyu karşılaştığın bütün ordular yeniden karşında.',
  1071: 'Yeni sefer: Mora! Venedik\'in Mora kaleleri seni bekliyor.',
  1121: 'Yeni sefer: Belgrad! Avusturya piyadesi sahada, kaidelerde Mehter Yayı.',
  1171: 'Yeni sefer: Şebeş! Habsburg ordusu Banat\'ta.',
  1221: 'Yeni sefer: Akka! Fransız piyadesi sahada: disiplinli ve sert.',
  1224: 'Fransız ejder süvarileri sahada: ağır ve hızlı.',
  1271: 'Yeni sefer: Silistre! Nişancılar sahada: uzaktan isabetle ateş ederler. Kaidelerde Cihan Yayı.',
  1321: 'Yeni sefer: Plevne! Tabyaları tut, Rus hücumlarını püskürt.',
  1371: 'Yeni sefer: Dömeke! Yunan piyadesi Teselya sırtlarında.',
  1421: 'Son sefer: Fetih Yolu! Bin dört yüz elli üçüncü bölüme son otuz iki adım.'
};
const LANE_TXT = {
  300: 'Yol genişledi: artık üç şerit var. Kapılarda üç seçenek çıkar; hepsine bak, en iyisini seç.',
  700: 'Yol dört şeride genişledi. Dev ordular için geniş meydan, ama kapılarda dört seçenek var.'
};

/* ---------- bölüm üretimi ---------- */
/* seferler 5 bölgeden (nb), bölgeler 10 bölümden (n) oluşur; son sefer daha kısa olabilir */
const SEF0 = [], SEFR0 = [], REG0 = [], LV_SF = [], LV_REG = [];
(function () {
  let lv = 0, rg = 0;
  SEFERLER.forEach((S, s) => {
    SEF0.push(lv); SEFR0.push(rg);
    for (let q = 0; q < (S.nb || 5); q++, rg++) { REG0.push(lv); const n = REGIONS[rg].n || 10; for (let k = 0; k < n; k++, lv++) { LV_SF.push(s); LV_REG.push(rg); } }
    S.n = lv - SEF0[s]; S.nb = S.nb || 5;
  });
})();
const NL = LV_SF.length;
const seferOf = i => LV_SF[clamp(i, 0, NL - 1)];
const regionOf = i => LV_REG[clamp(i, 0, NL - 1)];
const regLen = r => REGIONS[r].n || 10;
// bölümün yeri: sefer içi sıra (li), bölge içi sıra (k)
function levelPos(i) { const sf = seferOf(i), reg = regionOf(i); return { sf, reg, li: i - SEF0[sf], slen: SEFERLER[sf].n, k: i - REG0[reg], rlen: regLen(reg), lastReg: reg === SEFR0[sf] + SEFERLER[sf].nb - 1 }; }
// yol: 1–300 iki şerit, 301–700 üç şerit, 701+ dört şerit; hız 1923. bölüme kadar %50 artar
const lanesOf = i => i < 300 ? 2 : i < 700 ? 3 : 4;
const roadOf = i => [0, 0, 6, 8.6, 11.2][lanesOf(i)];
const speedOf = i => SPEED * (1 + 0.5 * Math.min(1, i / 1922));
// bölüme kadar beklenen Ordugâh seviyesi (düşman dayanıklılığı buna göre büyür)
function nominalUp(i) {
  const u = i < 50 ? i * 0.2 : Math.min(upCap(seferOf(i)), i < 500 ? 10 + (i - 50) * 0.09 : 50.5 + (i - 500) * 0.03);
  return { start: u, dmg: u, rate: u, zirh: u * 0.8 };
}

function foeTypeAt(i, r) {
  const pool = POOLS[seferOf(i)].filter(p => p[1] <= i && (p[2] === undefined || i < p[2])).map(p => p[0]);
  const base = BASE_FOE[seferOf(i)], li = levelPos(i).li;
  const w = pool.map(id => id === base ? Math.max(0.35, 1 - li / 60) : FOES[id].atli ? 0.8 : 0.9);
  let s = w.reduce((a, b) => a + b, 0), x = r * s;
  for (let k = 0; k < pool.length; k++) { x -= w[k]; if (x <= 0) return pool[k]; }
  return pool[0];
}

function buildLevel(i, f) {
  if (f === undefined) f = CAL[i] || 1;
  const rnd = rng(i * 7919 + 71);
  const P = levelPos(i), sf = P.sf, li = P.li, reg = P.reg, k = P.k, R = REGIONS[reg];
  const d = Math.min(1, li / Math.max(1, Math.min(49, P.slen - 1)));
  const lanes = lanesOf(i), road = roadOf(i), S = road / ROAD;   // S: yatay ölçek
  const st = stats(nominalUp(i));
  const base = (0.78 + 0.62 * d) * Math.min(1, f);   // yapılar (blok, kaide, barikat)
  const hard = base * f;                  // düşmanlar: her bölüm bir tık daha zor (f: araclar/kalibre.js)
  let e = st.start, t = 0, h = 0;
  const dps = () => (e + h * HERO_POW) * st.dmg * WEAPONS[t].m * st.rate;
  const hm = () => +(st.dmg * WEAPONS[t].m * st.rate).toFixed(2);   // düşman erinin ok direnci, oyuncunun beklenen gücüyle büyür
  const objs = [], gates = [];
  const nSeg = Math.min(16 + Math.min(sf, 4), 7 + 2 * Math.min(sf, 5) + Math.floor(li / 4));
  const archer = ARCHER[sf];
  let z = -30, last = '', badLeft = li >= 40 || sf > 0 ? 2 : 1, lastGateBad = false;
  for (let s = 0; s < nSeg; s++) {
    let type;
    if (s === 0) type = 'blocks';
    else if (s % 2 === 1) type = rnd() < 0.85 ? 'gate' : 'blocks';
    else {
      const opts = [['gate', 0.6], ['blocks', 2], ['squad', i >= 1 ? 2.2 + d : 0], ['pedestal', i >= 2 ? 1.6 : 0],
        ['barricade', i >= 8 ? 1 + d : 0], ['archers', i >= 11 && (sf !== 2 || i >= 101) ? 1 + d : 0],
        ['kervan', i >= 52 ? 0.9 : 0], ['tas', i >= 105 ? 1.1 : 0], ['gecit', i >= 153 ? 1.0 : 0],
        ['hendek', i >= 303 ? 1.0 : 0], ['tabur', i >= 453 ? 1.3 : 0],
        ['sur', i >= 502 ? (sf === 10 ? 1.6 : 0.8) : 0], ['gulle', i >= 652 ? 1.3 : 0]];
      let sum = opts.reduce((a, o) => a + o[1], 0), x = rnd() * sum;
      type = 'gate';
      for (const o of opts) { x -= o[1]; if (x <= 0) { type = o[0]; break; } }
      if (type === last && type !== 'gate') type = 'gate';
    }
    last = type;
    if (type === 'blocks') {
      const side = rnd() < 0.5 ? -1 : 1, x = side * 3.6 * S, n = 5 + Math.floor(rnd() * 4);
      const reward = Math.max(1, Math.round(e * 0.06)), hp = Math.max(1, Math.round(dps() * 0.3 * base));
      for (let j = 0; j < n; j++) objs.push({ t: 'block', x, z: z - j * 2.3, hp, reward });
      e += n * reward * 0.8;
      if (s > 1 && rnd() < 0.5 && i >= 2) {
        const pd = pedestalFor(i, rnd, t, h, e, dps(), base); pd.x = -side * 2.6 * S; pd.z = z - 8; objs.push(pd);
        ({ t, h, e } = applyPed(pd, t, h, e));
      }
    } else if (type === 'gate') {
      const plus = { op: '+', v: Math.round(3 + e * 0.35) }, mul = { op: 'x', v: e < 15 ? 3 : 2 };
      const minus = { op: '-', v: Math.max(2, Math.round(e * 0.3)) }, div = { op: '/', v: 2 };
      let pair;
      const r = rnd();
      if (i >= 14 && badLeft > 0 && lastGateBad === false && s > 2 && r < 0.3) { pair = [minus, div]; badLeft--; } // ikisi de kötü
      else if (r < 0.62) pair = [rnd() < 0.5 ? plus : mul, rnd() < 0.5 ? minus : div];
      else pair = [plus, mul];
      const allBad = pair.every(o => o.op === '-' || o.op === '/');
      lastGateBad = allBad;
      if (rnd() < 0.5) pair.reverse();
      for (let j = 2; j < lanes; j++) {      // geniş yolda fazladan kapılar: çoğu tuzak, biri bazen küçük bir artı
        const r2 = rnd(); let o;
        if (allBad || r2 < 0.45) o = rnd() < 0.5 ? { op: '-', v: Math.max(2, Math.round(e * (0.15 + 0.25 * rnd()))) } : div;
        else if (r2 < 0.8) o = { op: '+', v: Math.round(2 + e * (0.1 + 0.15 * rnd())) };
        else o = mul;
        pair.splice(Math.floor(rnd() * (pair.length + 1)), 0, o);
      }
      gates.push({ z, opts: pair });
      e = Math.min(MAX_COUNT, Math.max(...pair.map(o => applyOp(e, o))));
    } else if (type === 'squad') {
      const ft = foeTypeAt(i, rnd()), F = FOES[ft];
      const n = Math.max(3, Math.round(e * 2.2 * hard / F.p));
      objs.push({ t: 'squad', ft, x: (rnd() - 0.5) * 5 * S, z, n, hm: hm() });
      const shot = dps() * 2.5 / F.hp / hm();
      e = Math.max(1, e - Math.max(0, n - shot) * F.p * (1 - st.zirh));
    } else if (type === 'pedestal') {
      const pd = pedestalFor(i, rnd, t, h, e, dps(), base); pd.x = (rnd() < 0.5 ? -1 : 1) * (2 + rnd() * 1.4) * S; pd.z = z; objs.push(pd);
      ({ t, h, e } = applyPed(pd, t, h, e));
    } else if (type === 'barricade') {
      const side = rnd() < 0.5 ? -1 : 1;
      objs.push({ t: 'barricade', x: side * 3 * S, z, w: 6 * S, hp: Math.round(dps() * 0.7 * base * S) });
      if (i >= 24 && rnd() < 0.6) {                                       // öbür yanda küçük kol
        const ft = foeTypeAt(i, rnd()), F = FOES[ft], n = Math.max(3, Math.round(e * 1.2 * hard / F.p));
        objs.push({ t: 'squad', ft, x: -side * 3 * S, z: z - 3, n, hm: hm() });
        e = Math.max(1, e - Math.max(0, n - dps() * 1.5 / F.hp / hm()) * F.p * (1 - st.zirh));
      }
    } else if (type === 'archers') {
      const n = Math.max(4, Math.round(e * 1.4 * hard));
      objs.push({ t: 'squad', ft: archer, x: (rnd() < 0.5 ? -1 : 1) * (1.5 + rnd() * 2.5) * S, z: z - 6, n, hm: hm() });
      e = Math.max(1, e - n * 0.22 * (1 - st.zirh));
    } else if (type === 'kervan') {        // ganimet arabası: okla durdurulursa akçe verir
      const coins = Math.round((20 + 2 * i) * (0.8 + rnd() * 0.5));
      objs.push({ t: 'kervan', x: (rnd() - 0.5) * 6 * S, amp: 3.2 * S, lim: road - 1.8, z: z - 4, hp: Math.max(4, Math.round(dps() * 0.9 * base)), coins, ph: rnd() * 6 });
    } else if (type === 'tas') {           // mancınık taşları: kırmızı halkadan uzak dur
      const n = 2 + Math.floor(rnd() * 2);
      for (let j = 0; j < n; j++) objs.push({ t: 'tas', x: (rnd() < 0.5 ? -1 : 1) * (2.5 + rnd() * 2) * S, z: z - j * 7, r: 2.1 });
      e *= 0.96;
    } else if (type === 'hendek') {        // hendek: yalnız köprüden kayıpsız geçilir
      const bw = 1.7 + rnd() * 0.6, bx = (rnd() - 0.5) * 6 * S;
      objs.push({ t: 'hendek', x: 0, z, bx, bw });
      const R = crowdR(e) * 0.85 + 0.3;
      e = Math.max(1, e * (1 - 0.5 * Math.max(0, R - bw) / (2 * R)));
    } else if (type === 'tabur') {         // araba tabyası: tüfekçili araba duvarı
      const side = rnd() < 0.5 ? -1 : 1;
      objs.push({ t: 'barricade', araba: 1, x: side * 3 * S, z, w: 6 * S, hp: Math.round(dps() * 0.9 * base * S) });
      const n = Math.max(4, Math.round(e * 1.1 * hard));
      objs.push({ t: 'squad', ft: sf >= 15 ? 'muskeci' : 'tufekci', x: side * 3 * S, z: z - 3, n, hm: hm() });
      e = Math.max(1, e - n * 0.25 * (1 - st.zirh));
    } else if (type === 'sur') {           // sur duvarı: yolu baştan başa kapatır, okla yıkılır
      objs.push({ t: 'sur', x: 0, z, w: road * 2, hp: Math.round(dps() * 1.6 * base) });
      e *= 0.97;
    } else if (type === 'gulle') {         // top güllesi: kırmızı şeritten yuvarlanır
      const n = 2 + Math.floor(rnd() * 2);
      for (let j = 0; j < n; j++) objs.push({ t: 'gulle', x: (rnd() < 0.5 ? -1 : 1) * (1 + rnd() * 3.5) * S, z: z - j * 9, r: 0.9 });
      e *= 0.95;
    } else if (type === 'gecit') {         // dar geçit: kalabalık ordu sıkışır
      const w = 3.3 + rnd() * 0.8;
      objs.push({ t: 'gecit', x: 0, z, len: 16, w });
      e = Math.max(1, e - Math.max(0, e - gecitCap(w)) * GECIT_LOSS);
    }
    z -= 26;
  }
  let boss = null, finalSquad;
  const bossZ = z - 6;
  const midBoss = k === 4 && P.rlen > 5, endBoss = k === P.rlen - 1;
  if (midBoss || endBoss) {
    const id = R.bosses[midBoss ? 0 : 1], tip = BOSSES[id].tip;
    const guard = Math.max(4, Math.round(e * 1.8 * hard / FOES[tip].p));
    objs.push({ t: 'squad', ft: tip, x: 0, z: bossZ + 14, n: guard, hm: hm() });
    e = Math.max(1, e - Math.max(0, guard - dps() * 2 / FOES[tip].hp / hm()) * FOES[tip].p * (1 - st.zirh));
    const hp = Math.round(dps() * (3 + 3 * d) * hard * (i === NL - 1 || i === 1070 ? 2 : endBoss && P.lastReg ? 1.4 : 1));
    boss = { t: 'boss', id, x: 0, z: bossZ, hp, kill: Math.max(3, e * 0.07 * hard) };
    objs.push(boss);
  } else {
    const ft = li < 6 ? BASE_FOE[sf] : foeTypeAt(i, rnd());
    const n = Math.max(5, Math.round(e * (2.8 + 0.8 * d) * hard / FOES[ft].p + li));
    finalSquad = { t: 'squad', ft, x: 0, z: bossZ, n, final: true, hm: hm() };
    objs.push(finalSquad);
  }
  let brief = (LANE_TXT[i] ? LANE_TXT[i] + ' ' : '') + (UNLOCK_TXT[i] || '');
  if (boss) brief = (brief ? brief + ' ' : '') + BOSS_TXT[boss.id];
  if (!brief) brief = R.lines[k % 3];
  if (i === 1452) brief = 'Bin dört yüz elli üçüncü bölüm. 29 Mayıs 1453, şafak vakti. Asırlar boyu büyüttüğün ordu İstanbul surlarının önünde. Gedik açıldı, Akıncı Bey: şehir seni bekliyor.';
  if (i === 1070) brief = 'Bin yetmiş birinci bölüm. Her şeyin başladığı ova: Malazgirt. Asırlar boyu büyüttüğün ordunla Bizans İmparatorluk Ordusu\'nun karşısındasın. Sancağı yüksek tut, Akıncı Bey.';
  if (i === 0) brief = 'Sultan Alparslan\'ın akıncıları yola çıktı. Parmağını kaydır, artı kapılardan geç, mavi blokları okla kır. Sondaki Bizans öncülerini dağıt.';
  return { i, sf, reg, k, ad: R.names[k], brief, objs, gates, endZ: bossZ, len: -bossZ + 40, boss: !!boss, reward: 60 + 10 * i, lanes, road, speed: speedOf(i) };
}
const GECIT_LOSS = 0.3, GULLE_V = 13;
const gecitCap = w => Math.floor(Math.pow((w - 0.3) / (0.34 * 0.85), 2));   // bu genişliğe sığan akıncı sayısı
function pedestalFor(i, rnd, t, h, e, dps, hard) {
  let kind = 'troops';
  if (t < maxTier(i) && (rnd() < 0.62 || i < 5)) kind = 'weapon';
  else if (i >= 5 && h < MAX_HERO) kind = 'hero';
  const hp = Math.round(dps * (kind === 'hero' ? 1.3 : 1.0) * hard);
  return { t: 'pedestal', kind, val: kind === 'weapon' ? t + 1 : Math.round(e * 0.4), hp };
}
function applyPed(pd, t, h, e) {
  if (pd.kind === 'weapon') t = Math.max(t, pd.val); else if (pd.kind === 'hero') h = Math.min(MAX_HERO, h + 1); else e = Math.min(MAX_COUNT, e + pd.val);
  return { t, h, e };
}
function applyOp(c, o) {
  const r = o.op === '+' ? c + o.v : o.op === 'x' ? c * o.v : o.op === '-' ? c - o.v : Math.ceil(c / o.v);
  return clamp(Math.round(r), 0, MAX_COUNT);
}

/* Kalibrasyon katsayıları: araclar/kalibre.js üretir */
const CAL = [0.796,0.857,2.237,0.868,0.874,0.815,0.812,0.946,1.159,0.837,0.907,1.117,0.9,5.577,5.785,2.23,5.633,2.26,4.803,2.059,0.916,0.857,0.937,0.773,0.556,0.693,0.629,0.679,0.476,0.88,0.786,0.633,0.67,0.51,3.719,0.591,0.589,0.666,0.735,0.69,0.562,0.704,0.531,0.587,0.591,0.366,0.402,0.796,0.4,0.598,0.735,0.807,0.985,0.794,0.613,3.311,0.913,1.67,0.799,0.815,1.895,0.686,0.726,0.51,0.573,0.602,0.843,0.591,0.723,0.602,0.663,0.892,0.544,0.577,0.448,0.637,0.791,0.886,0.907,0.602,0.6,0.67,0.623,0.524,0.693,0.29,0.661,0.67,0.672,0.631,0.84,0.457,0.448,0.522,0.542,0.371,0.535,0.404,0.554,0.377,1.005,0.585,0.962,0.679,0.877,0.81,0.67,0.937,0.988,0.81,0.555,0.829,0.94,0.94,0.589,0.812,0.86,0.566,0.704,0.735,0.934,0.796,0.598,0.593,0.84,0.794,0.75,0.753,0.684,0.611,0.289,0.704,0.514,0.438,0.509,0.631,0.462,0.36,0.7,0.376,0.494,0.329,0.535,0.512,0.451,0.341,0.467,0.783,0.526,0.581,0.631,0.966,0.854,0.781,0.437,1.268,0.619,0.829,0.778,0.663,1.462,0.554,0.67,0.791,0.657,0.583,0.631,0.442,0.585,0.566,0.697,0.497,0.75,0.677,0.481,0.445,0.679,0.684,0.684,0.693,0.773,0.765,0.428,0.519,0.522,0.487,0.566,0.391,0.695,0.583,0.512,0.515,0.438,0.497,0.625,0.646,0.242,0.657,0.504,0.355,0.65,0.617,0.913,0.663,0.5,0.558,0.758,0.686,0.521,0.64,0.778,0.531,0.821,0.646,0.604,0.709,0.735,0.562,0.818,0.69,0.391,0.726,0.587,0.786,0.625,0.796,0.642,0.619,0.564,0.579,0.348,0.359,0.473,0.64,0.64,0.661,0.619,0.485,0.655,0.482,0.49,0.589,0.602,0.538,0.637,0.549,0.365,0.545,0.519,0.263,1.103,0.655,1.132,0.726,0.646,0.74,0.451,0.646,0.497,0.637,0.728,0.556,0.69,0.494,0.788,0.707,0.693,0.583,0.868,0.467,0.504,0.88,0.381,0.47,0.663,0.558,0.542,0.67,0.566,0.652,0.562,0.597,0.666,0.5,0.755,0.646,0.435,0.222,0.533,0.479,0.47,0.509,0.542,0.485,0.512,0.6,0.648,0.373,0.589,0.606,0.704,0.829,0.583,0.663,0.657,0.526,0.391,0.726,0.666,0.775,0.627,0.533,0.602,0.569,0.495,0.463,0.709,1.012,0.775,0.569,0.978,0.407,0.818,0.629,0.517,0.621,0.471,0.589,0.606,0.535,0.598,0.602,0.564,0.463,0.655,0.598,0.454,0.505,0.587,0.529,0.573,0.554,0.382,0.465,0.566,0.45,0.593,0.479,0.47,0.348,0.54,0.644,0.711,0.77,0.556,0.589,0.77,0.672,0.556,0.919,0.851,0.644,0.86,0.778,0.441,0.635,0.679,0.325,0.931,0.481,0.865,0.566,0.6,0.642,0.504,0.609,0.482,0.47,0.637,0.646,0.575,0.64,0.54,0.529,0.463,0.506,0.753,0.663,0.668,0.414,0.373,0.304,0.31,0.507,0.445,0.413,0.745,0.558,0.404,0.504,0.672,1.088,0.545,0.703,0.69,0.753,0.88,0.633,0.631,0.702,0.591,0.686,1.053,0.435,0.522,0.959,0.514,0.467,0.937,0.49,0.675,0.646,0.583,0.67,0.33,0.675,0.377,0.702,0.714,0.594,0.857,0.465,0.611,0.535,0.684,0.536,0.617,0.441,0.597,0.781,0.457,0.623,0.521,0.407,0.378,0.609,0.581,0.595,0.613,0.529,0.721,0.593,0.73,0.593,0.668,0.686,0.589,0.586,0.509,0.714,0.666,0.544,0.604,0.545,0.606,0.495,0.606,1.015,0.946,0.695,0.551,0.625,0.742,0.834,0.799,0.564,0.684,0.543,0.402,0.679,0.675,0.526,0.497,0.512,0.549,0.542,0.359,0.465,0.728,0.418,0.6,0.49,0.67,0.668,0.684,0.268,0.686,0.598,0.297,0.697,0.975,0.615,0.625,0.959,0.68,0.606,0.513,0.995,0.648,0.778,0.733,0.462,0.564,0.775,0.738,0.536,0.515,0.395,0.619,0.499,0.512,0.467,0.721,0.376,0.528,0.922,0.504,0.681,0.515,0.477,0.465,0.595,0.635,0.656,0.407,0.535,0.666,0.604,0.528,0.535,0.733,0.681,0.504,0.602,0.292,0.473,0.391,0.517,0.533,0.517,0.595,0.535,0.377,1.049,0.397,1.046,0.815,0.609,0.711,0.704,0.621,0.497,0.593,0.553,0.806,0.895,0.439,0.583,0.726,0.485,0.538,0.492,0.528,0.566,0.733,0.699,0.763,0.848,0.937,0.627,0.617,0.602,0.684,0.77,0.6,0.728,0.188,0.484,0.794,0.77,0.544,0.595,0.526,0.45,0.417,0.595,0.514,0.418,0.398,0.465,0.595,0.633,0.397,0.526,0.628,1.477,0.815,0.637,0.953,0.417,0.88,0.73,0.379,0.386,0.73,0.642,0.962,0.969,0.462,0.459,0.886,0.718,0.85,0.925,0.542,0.714,0.531,0.376,0.65,0.419,0.681,0.364,0.579,0.495,0.468,0.268,0.577,0.748,0.783,0.492,0.502,0.545,0.485,0.621,0.591,0.617,0.511,0.695,0.504,0.46,0.978,0.684,0.69,0.65,0.837,0.681,0.69,0.794,0.589,0.522,0.765,0.783,0.613,0.788,0.619,0.615,0.538,1.032,0.533,0.342,0.818,0.439,0.802,0.597,0.544,0.679,0.962,0.684,0.46,0.633,0.799,0.506,0.569,0.877,0.611,0.5,0.595,0.786,0.508,0.513,0.419,0.428,0.621,0.666,0.41,0.416,0.635,0.519,0.285,0.438,0.463,0.718,1.039,0.613,0.677,0.617,0.677,0.726,0.796,0.6,0.569,0.595,0.619,0.497,0.549,0.326,0.67,0.848,0.617,0.593,0.575,0.972,0.335,0.992,0.473,0.758,0.504,0.595,0.538,0.666,0.476,0.659,0.898,0.602,0.596,0.659,0.561,0.502,0.625,0.415,0.693,0.467,0.545,0.562,0.702,0.679,0.633,0.619,0.385,0.551,1.085,0.642,0.783,0.886,0.597,0.907,0.985,0.613,0.753,0.892,0.585,0.514,0.413,0.768,0.655,0.597,0.711,1.114,0.851,0.673,0.602,0.675,0.356,0.427,0.655,0.765,0.316,0.572,0.704,0.505,0.602,0.702,0.238,0.505,0.441,0.623,0.55,0.306,0.479,0.621,0.521,0.465,0.467,0.794,0.355,0.514,0.794,0.421,0.214,0.538,0.69,0.652,0.422,0.609,0.937,0.611,0.508,0.439,0.883,0.587,0.571,0.693,0.615,0.734,0.579,0.482,0.668,0.72,0.778,0.358,0.768,0.401,0.919,0.74,0.735,0.644,0.688,0.559,0.592,0.709,0.551,0.504,0.843,0.672,0.547,0.422,0.755,0.485,0.889,0.646,0.525,0.619,0.857,0.353,0.406,0.457,0.735,0.733,0.602,0.494,0.675,0.925,0.666,0.663,0.818,0.666,0.903,0.778,0.483,0.448,0.907,1.085,0.564,0.453,0.556,0.962,1.11,0.9,0.605,0.465,0.832,0.714,0.718,0.49,0.629,0.7,0.796,0.547,0.617,0.421,0.75,0.675,0.721,0.775,0.512,0.922,0.625,0.583,0.65,0.67,0.554,0.733,0.636,0.526,0.399,0.823,0.551,0.541,0.564,0.39,0.422,1.744,0.982,0.969,0.738,0.659,0.753,0.437,0.791,0.76,0.801,0.625,0.484,0.611,0.818,0.627,0.591,0.465,0.294,0.499,1.008,0.312,0.937,0.47,0.591,0.865,0.86,0.438,0.702,0.512,0.845,0.704,0.458,0.702,0.403,0.549,0.533,0.5,0.54,0.617,0.448,0.479,0.554,0.471,0.273,0.467,0.378,0.613,0.502,0.474,0.791,0.637,1.487,0.754,0.775,0.988,0.367,1.099,0.609,0.812,0.583,0.663,0.666,0.985,0.711,1.182,0.84,0.655,0.533,0.461,0.573,0.566,0.489,0.73,0.802,0.56,0.382,0.928,0.769,0.499,0.591,0.343,0.49,0.862,0.716,0.931,0.587,0.459,0.672,0.617,0.577,0.369,0.554,0.507,0.579,0.367,0.434,0.449,0.349,0.373,0.76,1.21,0.663,1.6,0.571,0.457,0.718,0.982,0.679,0.611,0.677,0.494,0.693,0.654,0.65,0.56,0.558,0.292,0.753,0.919,0.91,0.394,0.615,0.695,0.554,0.714,0.567,0.721,0.657,0.64,0.868,0.49,0.88,0.689,0.391,0.642,0.763,0.679,0.528,0.47,0.566,0.635,0.611,0.533,0.625,0.484,0.726,0.743,0.492,0.507,0.794,0.815,1.38,0.73,0.843,0.724,0.78,0.422,0.446,0.495,0.589,0.505,0.693,0.623,0.515,0.515,0.595,0.67,0.384,0.768,0.456,1.167,0.821,1.6,0.783,0.966,1.243,0.829,0.775,0.7,0.686,0.877,0.54,0.48,0.769,0.69,0.448,0.429,0.653,0.644,0.497,0.613,0.45,0.635,0.925,0.728,0.95,0.63,0.6,0.972,0.587,0.753,0.655,0.663,0.568,0.587,0.39,0.684,0.74,0.937,0.69,0.381,0.589,0.502,0.631,0.477,0.728,0.583,0.485,0.558,0.606,0.733,0.693,0.934,1.659,1.035,0.598,0.634,0.721,1.11,0.7,0.567,0.84,0.862,0.857,0.577,1.155,0.931,0.77,0.886,0.644,0.546,0.474,0.544,0.998,0.596,0.65,0.637,0.64,0.644,0.69,0.775,0.77,0.528,0.625,0.663,0.645,0.75,0.46,0.562,0.695,0.916,0.562,0.483,0.491,0.7,0.818,0.67,0.487,0.528,0.536,1.226,0.579,0.931,0.525,0.644,1.502,0.781,0.77,0.726,0.94,0.593,0.857,0.758,0.799,0.633,0.834,0.648,1.015,0.707,0.585,0.693,0.697,0.735,0.709,0.76,0.733,0.598,0.456,0.583,0.621,0.883,0.799,0.733,0.637,0.6,0.975,0.664,0.455,0.843,0.76,0.656,0.714,0.681,0.562,0.661,0.697,0.837,0.75,0.577,0.396,0.871,0.799,0.848,0.6,0.722,0.794,0.606,0.743,0.94,0.716,0.655,0.86,0.679,0.574,0.812,0.677,0.799,0.595,0.686,0.775,0.684,0.65,0.681,0.802,0.396,0.778,0.615,0.536,0.728,0.629,0.73,0.326,0.745,0.657,0.593,0.625,0.615,0.621,0.595,0.427,0.693,0.573,0.504,0.625,0.49,0.687,0.535,0.768,0.519,0.615,0.733,0.781,0.72,0.645,0.496,0.623,0.982,0.907,0.399,0.802,0.521,1.373,0.546,0.726,0.778,0.27,0.575,0.514,0.672,0.837,0.73,0.568,0.721,0.925,0.837,0.421,0.898,0.481,0.877,0.721,0.775,0.765,0.837,0.716,0.621,0.76,0.533,0.362,0.799,0.562,0.585,0.815,0.497,0.675,0.432,0.84,0.716,0.619,0.606,0.51,0.946,0.679,0.786,0.802,1.046,0.925,1.012,0.524,0.821,0.538,0.693,0.615,0.738,0.579,0.675,1.074,0.556,0.692,0.551,0.714,0.919,0.758,0.716,0.711,0.583,0.531,0.724,0.66,0.609,0.558,1.063,0.91,0.629,0.604,0.55,0.564,0.435,0.733,0.868,0.484,0.845,0.666,0.49,0.602,0.417,0.34,0.826,0.281,0.606,0.538,0.553,0.768,1.773,0.94,0.874,1.293,0.44,0.784,0.598,0.476,0.528,0.438,0.677,0.962,0.735,0.956,0.851,0.799,1.129,1.012,0.812,0.492,0.728,0.697,0.84,0.992,0.644,1.206,0.857,0.621,0.934,0.597,1.103,0.768,0.625,0.672,0.637,0.745,0.461,0.619,0.76,0.428,0.697,0.598,0.417,0.672,0.627,0.815,0.38,0.587,1.492,0.907,1.018,0.596,0.934,0.86,1.467,1.405,0.616,0.577,0.522,0.773,0.755,0.554,0.86,0.697,0.723,0.351,0.796,0.728,0.637,0.61,0.609,0.672,0.659,0.621,0.659,0.508,0.871,0.735,0.786,0.56];
const LEVELS = [];
for (let i = 0; i < NL; i++) LEVELS.push(buildLevel(i));

/* ---------- oyun durumu ve adım fonksiyonu ---------- */
function newGame(i, up) {
  const L = LEVELS[i], st = stats(up), r = rng(i * 31 + 7);
  const G = {
    L, st, rnd: r, i, state: 'play', t: 0, z: 0, x: 0, tx: 0, count: st.start, peak: st.start, heroes: 0, heroHp: 0, wTier: 0,
    fireT: 0, arrows: [], foeShots: [], objs: [], gates: [], events: [], kills: 0, loot: 0, lost: 0, clash: false, march: 0, Rx: 0.5, Rz: 0.5,
    road: L.road, lanes: L.lanes, speed: L.speed
  };
  for (const o of L.objs) {
    const c = Object.assign({}, o, { alive: true, max: o.hp || o.n, acc: 0, flash: 0 });
    if (c.t === 'block') { c.w = 1.7; c.d = 1.1; }
    if (c.t === 'pedestal') { c.w = 2.5; c.d = 1.5; }
    if (c.t === 'barricade') { c.d = 1.0; }
    if (c.t === 'sur') { c.d = 1.6; }
    if (c.t === 'gulle') { c.z0 = c.z; }
    if (c.t === 'boss') { c.w = 3.4; c.d = 2.4; }
    if (c.t === 'kervan') { c.w = 2.4; c.d = 3.2; c.x0 = c.x; }
    if (c.t === 'squad') { c.start = c.n; c.fireAcc = 0; }
    G.objs.push(c);
  }
  for (const g of L.gates) G.gates.push(Object.assign({ passed: false, side: 0 }, g));
  return G;
}
function totalPow(G) { return (G.count + G.heroes * HERO_POW) * G.st.dmg * WEAPONS[G.wTier].m; }
function ev(G, type, data) { G.events.push(Object.assign({ type }, data)); }

function loseSoldiers(G, k) {
  if (k <= 0) return;
  const c = Math.min(k, G.count); G.count -= c; k -= c; G.lost += c;
  if (k > 0 && G.heroes > 0) { G.heroHp -= k; G.heroes = Math.max(0, Math.ceil(G.heroHp / HERO_HP)); if (G.heroes === 0) G.heroHp = 0; }
}
function foeDims(o) {
  const atli = FOES[o.ft].atli, m = Math.min(o.n, atli ? 90 : 160);
  const sx = atli ? 0.8 : 0.55, sz = atli ? 1.1 : 0.6;
  o.cols = Math.max(1, Math.min(atli ? 8 : 12, Math.ceil(Math.sqrt(m * 1.3))));
  o.rows = Math.ceil(m / o.cols); o.w = o.cols * sx + 0.5; o.d = o.rows * sz + 0.5;
}

function fire(G, dt) {
  const total = G.count + G.heroes; if (total <= 0) return;
  const iv = 0.12 / G.st.rate; G.fireT += dt;
  while (G.fireT >= iv) {
    G.fireT -= iv;
    const n = Math.min(total, 10), each = totalPow(G) * 0.12 / n, shown = Math.min(G.count, 220);
    for (let k = 0; k < n; k++) {
      let x, y, z;
      if (G.heroes > 0 && (k < G.heroes || shown === 0)) { const j = k % G.heroes; x = G.x + (j - (G.heroes - 1) / 2) * 1.4; y = 2.2; z = G.z - G.Rz - 1.2; }
      else { const j = Math.floor(G.rnd() * Math.max(shown, 1)), a = j * 2.39996, r = 0.34 * Math.sqrt(j); x = G.x + Math.cos(a) * r * 0.85; y = 0.95; z = G.z + Math.sin(a) * r * 1.15 - 0.3; }
      G.arrows.push({ x, y, z, pz: z, dmg: each, life: ARROW_LIFE });
    }
  }
}
function hitObj(G, o, dmg) {
  if (o.t === 'block' || o.t === 'pedestal' || o.t === 'barricade' || o.t === 'sur' || o.t === 'boss' || o.t === 'kervan') {
    o.hp -= dmg; o.flash = 0.1;
    if (o.hp <= 0) killObj(G, o, true);
  } else {
    o.acc += dmg; const F = FOES[o.ft], uh = F.hp * (o.hm || 1), k = Math.floor(o.acc / uh);
    if (k > 0) { o.acc -= k * uh; const kk = Math.min(k, o.n); o.n -= kk; G.kills += kk; ev(G, 'hit', { x: o.x, z: o.z + o.d / 2 }); if (o.n <= 0) killObj(G, o, false); }
  }
}
function killObj(G, o, give) {
  o.alive = false; o.hp = 0;
  ev(G, 'break', { o });
  if (!give) return;
  if (o.t === 'block') { G.count = Math.min(MAX_COUNT, G.count + o.reward); ev(G, 'gain', { x: o.x, z: o.z, v: o.reward }); }
  else if (o.t === 'kervan') { G.loot += o.coins; ev(G, 'loot', { x: o.x, z: o.z, v: o.coins }); }
  else if (o.t === 'pedestal') {
    if (o.kind === 'weapon') { G.wTier = Math.min(WEAPONS.length - 1, Math.max(G.wTier, o.val)); ev(G, 'weapon', { x: o.x, z: o.z, w: G.wTier }); }
    else if (o.kind === 'hero') { if (G.heroes < MAX_HERO) { G.heroes++; G.heroHp = G.heroes * HERO_HP; } ev(G, 'hero', { x: o.x, z: o.z }); }
    else { G.count = Math.min(MAX_COUNT, G.count + o.val); ev(G, 'troops', { x: o.x, z: o.z, v: o.val }); }
  }
}

function step(G, dt) {
  G.events.length = 0;
  if (G.state === 'win' || G.state === 'lose') return;
  G.t += dt;
  G.Rz = crowdR(G.count) * 1.15 + 0.3; G.Rx = crowdR(G.count) * 0.85 + 0.3;
  if (G.state === 'march') {
    G.z -= 7 * dt; G.x += (0 - G.x) * Math.min(1, dt * 3); G.march += dt; G.arrows.length = 0;
    if (G.march > 1.8) G.state = 'win';
    return;
  }
  let speed = G.speed; if (G.clash) speed = 2.2; if (G.atBoss) speed = 0.4;
  G.clash = false; G.atBoss = false;
  G.z -= speed * dt;
  let lim = Math.max(0, G.road - 0.4 - G.Rx);
  for (const o of G.objs) if (o.t === 'gecit' && G.z - G.Rz * 0.5 <= o.z && G.z + G.Rz * 0.5 >= o.z - o.len) lim = Math.min(lim, Math.max(0, o.w - 0.3 - Math.min(G.Rx, o.w - 0.6)));
  G.tx = clamp(G.tx, -lim, lim);
  G.x += (G.tx - G.x) * Math.min(1, dt * 10); G.x = clamp(G.x, -lim, lim);
  if (G.z < G.L.endZ + G.Rz + 1) G.z = G.L.endZ + G.Rz + 1;

  fire(G, dt);
  // oklar
  const near = G.objs.filter(o => o.alive && o.t !== 'tas' && o.t !== 'gecit' && o.t !== 'hendek' && o.t !== 'gulle' && o.z < G.z + 2 && o.z > G.z - 40);
  for (const o of near) if (o.t === 'squad') foeDims(o);
  for (let a = G.arrows.length - 1; a >= 0; a--) {
    const A = G.arrows[a]; A.pz = A.z; A.z -= ARROW_V * dt; A.life -= dt;
    let dead = A.life <= 0;
    if (!dead) for (const o of near) {
      if (!o.alive || Math.abs(A.x - o.x) > o.w / 2) continue;
      const zf = o.z + o.d / 2, zb = o.z - o.d / 2;
      if (A.z > zf || A.pz < zb) continue;
      hitObj(G, o, A.dmg); dead = true; break;
    }
    if (dead) G.arrows.splice(a, 1);
  }
  // nesneler
  for (const o of G.objs) {
    if (!o.alive) continue;
    o.flash = Math.max(0, o.flash - dt);
    const dist = G.z - o.z;
    if (o.t === 'kervan') {
      o.x = clamp(o.x0 + Math.sin(G.t * 0.9 + o.ph) * (o.amp || 3.2), -(o.lim || 4.2), o.lim || 4.2);
      if (Math.abs(o.x - G.x) < o.w / 2 + G.Rx * 0.7 && Math.abs(o.z - G.z) < o.d / 2 + G.Rz * 0.7) killObj(G, o, false);
      continue;
    }
    if (o.t === 'tas') {
      if (dist < 26 && !o.warn) { o.warn = true; ev(G, 'tasWarn', { o }); }
      if (G.z <= o.z + 0.3) {
        o.alive = false;
        const hit = Math.abs(G.x - o.x) < o.r + G.Rx * 0.35;
        const loss = hit ? Math.ceil(G.count * 0.15) + 2 : 0;
        if (loss) loseSoldiers(G, loss);
        ev(G, 'tas', { o, v: loss });
      }
      continue;
    }
    if (o.t === 'gulle') {
      if (dist < 34) { if (!o.warn) { o.warn = true; ev(G, 'gulleWarn', { o }); } o.z += GULLE_V * dt; }
      if (!o.done && o.z >= G.z - G.Rz * 0.4) {
        o.done = true;
        if (Math.abs(G.x - o.x) < o.r + G.Rx * 0.5) { const loss = Math.ceil(G.count * 0.12) + 2; loseSoldiers(G, loss); ev(G, 'crash', { x: G.x, z: G.z, v: loss, gulle: true }); }
      }
      if (o.z > G.z + 6) o.alive = false;
      continue;
    }
    if (o.t === 'hendek') {
      if (G.z - G.Rz * 0.2 <= o.z) {
        o.alive = false;
        const f = clamp((G.Rx - (o.bw - Math.abs(G.x - o.bx))) / (2 * G.Rx), 0, 1), loss = Math.ceil(G.count * f * 0.5);
        if (loss > 0) { loseSoldiers(G, loss); ev(G, 'crash', { x: G.x, z: G.z, v: loss, hendek: true }); }
      }
      continue;
    }
    if (o.t === 'gecit') {
      if (!o.done && G.z - G.Rz <= o.z) {
        o.done = true; const loss = Math.ceil(Math.max(0, G.count - gecitCap(o.w)) * GECIT_LOSS);
        if (loss > 0) { loseSoldiers(G, loss); ev(G, 'crash', { x: G.x, z: G.z, v: loss, gecit: true }); }
      }
      if (G.z < o.z - o.len - 4) o.alive = false;
      continue;
    }
    if (o.t === 'block' || o.t === 'pedestal' || o.t === 'barricade' || o.t === 'sur') {
      if (Math.abs(o.x - G.x) < o.w / 2 + G.Rx * 0.7 && Math.abs(o.z - G.z) < o.d / 2 + G.Rz * 0.7) {
        const per = 2 * G.st.dmg * WEAPONS[G.wTier].m;
        let loss = Math.ceil(o.hp / per); loss = Math.max(1, Math.min(loss, Math.ceil(G.count * 0.25) + 2));
        if (o.t === 'block') loss = Math.min(loss, 3);
        loseSoldiers(G, loss); ev(G, 'crash', { x: G.x, z: G.z, v: loss });
        killObj(G, o, false);
      }
      continue;
    }
    if (o.t === 'boss') {
      const touching = (G.z - G.Rz) <= o.z + o.d / 2 + 0.2;
      if (dist < 32 && !touching) o.z += 2 * dt;
      if (touching) {
        G.atBoss = true; o.acc += o.kill * (1 - G.st.zirh) * dt;
        const k = Math.floor(o.acc); if (k > 0) { o.acc -= k; loseSoldiers(G, k); ev(G, 'bossHit', { x: G.x, z: G.z - G.Rz }); }
      }
      continue;
    }
    // birlik
    const F = FOES[o.ft];
    foeDims(o);
    const touching = (G.z - G.Rz) <= o.z + o.d / 2 + 0.2 && (G.z + G.Rz) >= o.z - o.d / 2 && Math.abs(o.x - G.x) < o.w / 2 + G.Rx;
    if (F.v > 0 && dist < 42 && !touching && dist > -2) { o.z += F.v * dt; o.x += (G.x - o.x) * 0.3 * dt; }
    if (F.ates && dist > 0 && dist < 30) {
      o.fireAcc += o.n * F.ates * (1 - G.st.zirh) * dt;
      const k = Math.floor(o.fireAcc); if (k > 0) { o.fireAcc -= k; loseSoldiers(G, k); ev(G, 'shot', { from: o, v: k }); }
      if (G.rnd() < dt * Math.min(8, o.n * 0.4)) G.foeShots.push({ x: o.x + (G.rnd() - 0.5) * o.w, z: o.z, tx: G.x + (G.rnd() - 0.5) * G.Rx * 2, tz: G.z, t: 0 });
    }
    if (touching) {
      G.clash = true; if (o.final) G.atBoss = true;
      const rate = Math.max(14, (G.count + o.n) * 1.4);
      o.acc += rate * dt; const k = Math.floor(o.acc);
      if (k > 0) {
        o.acc -= k; const kk = Math.min(k, o.n); o.n -= kk; G.kills += kk;
        o.lossAcc = (o.lossAcc || 0) + kk * F.p * (1 - G.st.zirh);
        const l = Math.floor(o.lossAcc); o.lossAcc -= l; loseSoldiers(G, l);
        ev(G, 'clash', { x: (o.x + G.x) / 2, z: G.z - G.Rz });
      }
      if (o.n <= 0) killObj(G, o, false);
    }
    if (dist < -14 && F.v === 0) o.alive = false;   // geride kalan okçular
  }
  for (let s = G.foeShots.length - 1; s >= 0; s--) { G.foeShots[s].t += dt * 1.6; if (G.foeShots[s].t >= 1) G.foeShots.splice(s, 1); }
  // kapılar
  for (const g of G.gates) {
    if (g.passed || G.z - G.Rz * 0.3 > g.z) continue;
    g.passed = true; g.idx = laneAt(G, G.x, g.opts.length);
    const o = g.opts[g.idx], before = G.count;
    G.count = applyOp(G.count, o);
    ev(G, 'gate', { g, d: G.count - before, x: G.x, z: G.z });
  }
  G.peak = Math.max(G.peak, G.count);
  if (G.count <= 0 && G.heroes <= 0) { G.state = 'lose'; ev(G, 'lose', {}); return; }
  const last = G.objs.find(o => o.t === 'boss' || o.final);
  if (last && !last.alive) { G.state = 'march'; G.march = 0; ev(G, 'win', {}); }
}

// x konumundan kapı sırası ve kapının orta noktası
function laneAt(G, x, n) { return clamp(Math.floor((x + G.road) / (2 * G.road / n)), 0, n - 1); }
function laneX(G, idx, n) { return -G.road + (idx + 0.5) * 2 * G.road / n; }
function progress(G) { return clamp(G.z / G.L.endZ, 0, 1); }
function starsOf(G) { const r = G.count / Math.max(1, G.peak); return r >= 0.45 ? 3 : r >= 0.2 ? 2 : 1; }
function rewardOf(G, win, firstClear) {
  const L = G.L;
  const loot = G.loot || 0;
  if (win) return Math.round(L.reward * (firstClear ? 1 : 0.35)) + Math.min(80, Math.floor(G.count / 3)) + loot;
  return Math.min(Math.round(L.reward * 0.3), 4 + Math.floor(G.kills / 6)) + loot;
}

const API = { buildLevel, CAL, ROAD, levelPos, regionOf, regLen, SEF0, SEFR0, REG0, lanesOf, roadOf, speedOf, laneAt, laneX, WEAPONS, FOES, UPG, UPMAX, upCap, upCost, stats, REGIONS, SEFERLER, SOON, NL, seferOf, BOSSES, LEVELS, newGame, step, progress, starsOf, rewardOf, applyOp, crowdR, gecitCap, HERO_POW, MAX_HERO };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.MANTIK = API;
})(typeof window !== 'undefined' ? window : globalThis);
