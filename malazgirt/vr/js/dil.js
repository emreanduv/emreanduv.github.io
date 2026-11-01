/* Malazgirt Akıncıları: dil (Türkçe / English), platform ve ayarlar yardımcıları.
   mantik.js'ten sonra, oyun.js'ten önce yüklenir. İçerik çevirileri icerik-en.js'te. */
(function () {
'use strict';
const M = window.MANTIK;
const SKEY = 'malazgirt-akincilari-v1';
const HOST = window.MalazgirtHost || null;          // masaüstü (Steam) kabuğu: electron/preload.js
const CAP = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform() ? window.Capacitor : null;

/* ---------- arayüz sözlüğü (Türkçe anahtar → İngilizce) ---------- */
const UI = {
  'Bölüm {n}': 'Level {n}', 'Bölüm {a} / {b}': 'Level {a} / {b}', '← Kaydır →': '← Swipe →', 'akçe': 'coins', '{a} / {b} yıldız': '{a} / {b} stars',
  'SEFERE ÇIK': 'MARCH OUT', 'Bölümler': 'Levels', 'Ordugâh': 'Camp', 'Sefer Haritası': 'Campaign Map',
  'Akçe her zaferle gelir. İlk zafer tam ödül, tekrar oynadığın bölümler üçte bir ödül verir. Takıldığın yerde eski bölümleri yıldızlamak da iyi gelir.':
    'Coins come with every victory. A first win pays in full; replayed levels pay a third. When you get stuck, earning stars on old levels helps too.',
  'Önce Ordugâh: geliştirme hazır': 'Camp first: an upgrade is ready', 'SAVAŞA BAŞLA': 'TO BATTLE', 'Mola': 'Paused', 'DEVAM': 'CONTINUE', 'Yeniden': 'Restart', 'Menü': 'Menu',
  'ZAFER!': 'VICTORY!', 'Tekrar': 'Replay', 'GERİ ÇEKİL!': 'RETREAT!', 'TEKRAR DENE': 'TRY AGAIN', 'Sesi kapat': 'Mute', 'Sesi aç': 'Unmute',
  'KÖPRÜ': 'BRIDGE', 'DAR GEÇİT · {n} kişi sığar': 'NARROW PASS · fits {n}', '+{n} akçe': '+{n} coins', 'Altın Alp katıldı!': 'A Golden Alp joins!', '+{n} akıncı': '+{n} raiders',
  'Sıkıştı −': 'Squeezed −', 'Hendek −': 'Ditch −', 'Gülle −': 'Cannonball −', '{a} geçildi.': '{a} cleared.', 'Sağ kalan akıncı': 'Raiders left', 'Altın Alp': 'Golden Alp',
  'Dağıtılan düşman askeri': 'Enemy soldiers scattered', 'Kervan ganimeti': 'Caravan loot', 'Ordugâh\'ta yeni geliştirme alabilirsin!': 'You can buy a new upgrade in the Camp!',
  ' Sıradaki sefer: {a}!': ' Next campaign: {a}!', ' Yeni seferler pek yakında: hedef 1923 bölüm.': ' New campaigns coming soon: next goal, 1923 levels.',
  'SEFER HARİTASI': 'CAMPAIGN MAP', 'YENİ SEFER': 'NEW CAMPAIGN',
  'Kaideleri okla sıfırla: daha güçlü bir yay, ordunun gücünü katlar.': 'Shoot the pedestals down to zero: a stronger bow multiplies your army\'s power.',
  'Kapılarda doğru tarafı seç. Ordun büyük olmadan bölüm sonuna varma.': 'Pick the right side at the gates. Don\'t reach the end of the level without a big army.',
  'Dev, ok gücünle eriyor. Ordugâh\'ta Ok Ucu ve Kemankeşhane\'yi geliştir.': 'Giants melt under your arrow power. Upgrade Arrowheads and the Archery School in the Camp.',
  'Ordugâh\'ta akıncılarını güçlendir ya da eski bölümleri yıldızlayıp akçe topla.': 'Strengthen your raiders in the Camp, or earn stars on old levels to collect coins.',
  'Sıradaki sefer': 'Next campaign', 'Pek yakında': 'Coming soon',
  'Bin dört yüz elli üç bölümün hepsini bitirdin! Yeni seferler güncellemelerle geliyor: hedef 1923 bölüm. Bu arada eski bölümleri yıldızla, Ordugâh\'ı güçlendir.':
    'You have finished all one thousand four hundred and fifty-three levels! New campaigns are coming with updates: next goal, 1923 levels. Meanwhile, earn stars on old levels and strengthen your Camp.',
  '{n}. Sefer: {a}': 'Campaign {n}: {a}', 'Kilitli': 'Locked', 'kilitli': 'locked', 'SEVİYE {a} / {b}': 'LEVEL {a} / {b}', 'Sonraki: ': 'Next: ',
  'YENİ SEFERDE AÇILIR': 'UNLOCKS NEXT CAMPAIGN', 'EN ÜST SEVİYE': 'MAX LEVEL', '{a} geliştir, {b} akçe': 'Upgrade {a}, {b} coins',
  'Geri': 'Back', 'Önceki sefer': 'Previous campaign', 'Sonraki sefer': 'Next campaign', 'Duraklat': 'Pause', 'Oyun alanı': 'Game area',
  'Ayarlar': 'Settings', 'Dil': 'Language', 'Ses efektleri': 'Sound effects', 'Mehter (müzik)': 'Mehter (music)', 'Grafik kalitesi': 'Graphics quality',
  'Düşük': 'Low', 'Orta': 'Medium', 'Yüksek': 'High', 'Tam ekran': 'Fullscreen', 'Açık': 'On', 'Kapalı': 'Off', 'Oyundan çık': 'Quit game', 'Tamam': 'Done',
  'Tam Sürüm': 'Full Version', 'TAM SÜRÜMÜ AL': 'GET THE FULL VERSION', 'Satın alımları geri yükle': 'Restore purchases', 'Şimdi değil': 'Not now',
  'İlk iki sefer, yani 100 bölüm ücretsiz. Tam sürümle 1453 bölümün, 30 seferin hepsi tek seferlik ödemeyle açılır. Reklam yok, abonelik yok.':
    'The first two campaigns, 100 levels, are free. The Full Version unlocks all 1453 levels and 30 campaigns with a single payment. No ads, no subscription.',
  'Satın alma tamamlanamadı. Bağlantını kontrol edip yeniden dene.': 'The purchase could not be completed. Check your connection and try again.',
  'Tam sürüm açıldı. Hayırlı seferler!': 'Full Version unlocked. Good campaigning!', 'Geri yüklenecek satın alım bulunamadı.': 'No purchases to restore.',
  'Bir Mr. Anduv! yapımıdır.': 'Bir Mr. Anduv! yapımıdır.',
  'Bu ücretsiz demo ilk iki seferi, yani 100 bölümü içerir. Tam sürümde 1453 bölüm ve 30 sefer seni bekliyor. İlerlemen tam sürüme aktarılır.':
    'This free demo includes the first two campaigns, 100 levels. The full game has 1453 levels and 30 campaigns waiting for you. Your progress carries over to the full game.',
  'İlk {n} bölüm ücretsiz. Tam sürümle 1453 bölümün, 30 seferin hepsi tek seferlik ödemeyle açılır. Reklam yok, abonelik yok.':
    'The first {n} levels are free. The Full Version unlocks all 1453 levels and 30 campaigns with a single payment. No ads, no subscription.',
  "STEAM'DE TAM SÜRÜM": 'FULL GAME ON STEAM',
  'Satın al': 'Buy',
  'Harp Masası': 'War Table', 'Harp Masasına Gir': 'Enter the War Table', 'Tetiğe bas · Oturarak oyna': 'Pull the trigger · Play seated', 'Tetik: başla / sürükle': 'Trigger: start / drag', 'Çubuk: yönlendir': 'Stick: steer', 'Çubuk ↕: masa yüksekliği': 'Stick ↕: table height', 'Tetiğe bas: sefere çık · Çubukla yönlendir': 'Trigger: march out · Stick: steer', 'Harp Masası (VR)': 'War Table (VR)', 'Tetiğe bas: sefere çık': 'Pull the trigger: march out', 'Tetiğe bas: devam': 'Pull the trigger: continue',
  'Tetiğe bas: yeniden dene': 'Pull the trigger: try again', 'Tam Sürüm gerekli: ana menüden alabilirsin': 'Full Version needed: get it from the main menu', 'Masa yüksekliği sıfırlandı': 'Table height reset', 'Masa önüne alındı': 'Table re-centred', 'Ana menü': 'Main menu', 'Duraklatıldı': 'Paused', 'DEVAM': 'CONTINUE', 'YENİDEN DENE': 'TRY AGAIN', 'Yeniden oyna': 'Play again', 'Bölümü yeniden başlat': 'Restart level', 'Ses': 'Sound', 'Açık': 'On', 'Kapalı': 'Off', 'Harp masası': 'War table', 'At sırtı': 'Horseback', 'Yan tuş: duraklat': 'Grip: pause', 'Tetik: seç / sürükle': 'Trigger: select / drag', 'At sırtında: savur, vur!': 'On horseback: swing to strike!', 'Menüden seç': 'Choose from the menu', 'YENİ SEFERDE': 'NEXT CAMPAIGN', 'EN ÜST': 'MAX', 'Görüş': 'View', 'Kuşbakışı': 'Bird\'s-eye', 'Sipahi Gözü': 'Sipahi\'s Eye', 'Kuşbakışı görüş': 'Bird\'s-eye view', 'A / X: at sırtı ⇄ harp masası': 'A / X: horseback ⇄ war table', 'X: at sırtı ⇄ masa': 'X: horseback ⇄ table', 'A: at sırtı ⇄ masa': 'A: horseback ⇄ table', 'At sırtı: sipahinin gözünden': 'Horseback: through the sipahi\'s eyes', 'Harp masasına dönüldü': 'Back at the war table', 'Tam Sürüm: ödeme ekranı açılıyor…': 'Full Version: opening checkout…', 'Tam Sürüm\'ü Quest\'te Meta Horizon Store uygulamasından alabilirsin.': 'You can get the Full Version from the Meta Horizon Store app on Quest.', 'Y: masayı önüne al': 'Y: re-centre the table', 'B: masayı önüne al': 'B: re-centre the table',
  'Oyun kolu bağlandı': 'Controller connected', '← → ya da A / D ile yönlendir': 'Steer with ← → or A / D'
};
const SPECIAL_TR = {};

/* ---------- dil durumu ---------- */
let lang = 'tr';
try { const s = JSON.parse(localStorage.getItem(SKEY)); if (s && s.lang) lang = s.lang; else lang = /^tr/i.test(navigator.language || 'tr') ? 'tr' : 'en'; } catch (e) {}
if (HOST && HOST.lang && !hasSavedLang()) lang = HOST.lang === 'turkish' ? 'tr' : HOST.lang ? 'en' : lang;
function hasSavedLang() { try { const s = JSON.parse(localStorage.getItem(SKEY)); return !!(s && s.lang); } catch (e) { return false; } }

function fill(str, p) { return p ? str.replace(/\{(\w+)\}/g, (m, k) => p[k] !== undefined ? p[k] : m) : str; }
function t(tr, p) { return fill(lang === 'en' && UI[tr] !== undefined ? UI[tr] : tr, p); }

/* ---------- içerik (sefer, bölge, dev, birlik adları) ---------- */
let TR = null;
function snapshot() {
  TR = {
    seferler: M.SEFERLER.map(S => [S.ad, S.alt, S.zafer, S.epilog]), soon: [M.SOON.ad, M.SOON.alt],
    regions: M.REGIONS.map(R => [R.ad, R.alt, R.names.slice(), R.lines.slice()]),
    bosses: Object.fromEntries(Object.entries(M.BOSSES).map(([k, B]) => [k, B.ad])),
    foes: Object.fromEntries(Object.entries(M.FOES).map(([k, F]) => [k, F.ad])),
    weapons: M.WEAPONS.map(W => W.ad), upg: M.UPG.map(u => [u.ad, u.desc]),
    levels: M.LEVELS.map(L => [L.ad, L.brief])
  };
}
const UPG_EN_VAL = { start: l => 3 + 2 * l, dmg: l => (1 + 0.15 * l).toFixed(2), rate: l => (1 + 0.1 * l).toFixed(1), zirh: l => Math.round(100 * (M.stats({ zirh: l }).zirh)) };
function applyContent() {
  if (!TR) snapshot();
  const E = window.ICERIK_EN, en = lang === 'en' && E;
  M.SEFERLER.forEach((S, i) => { const v = en ? E.seferler[i] : TR.seferler[i]; [S.ad, S.alt, S.zafer, S.epilog] = v; });
  [M.SOON.ad, M.SOON.alt] = en ? E.soon : TR.soon;
  M.REGIONS.forEach((R, r) => { const v = en ? E.regions[r] : TR.regions[r]; R.ad = v[0]; R.alt = v[1]; R.names = v[2].slice(); R.lines = v[3].slice(); });
  for (const k in M.BOSSES) M.BOSSES[k].ad = en ? E.bosses[k] : TR.bosses[k];
  for (const k in M.FOES) M.FOES[k].ad = en ? E.foes[k] : TR.foes[k];
  M.WEAPONS.forEach((W, i) => W.ad = en ? E.weapons[i] : TR.weapons[i]);
  M.UPG.forEach((u, i) => { if (en) { const e = E.upg[u.k]; u.ad = e[0]; u.desc = l => fill(e[1], { n: UPG_EN_VAL[u.k](l) }); } else { u.ad = TR.upg[i][0]; u.desc = TR.upg[i][1]; } });
  M.LEVELS.forEach((L, i) => {
    if (!en) { L.ad = TR.levels[i][0]; L.brief = TR.levels[i][1]; return; }
    const R = M.REGIONS[L.reg]; L.ad = R.names[L.k];
    const boss = L.objs.find(o => o.t === 'boss');
    let b = (E.lane[i] ? E.lane[i] + ' ' : '') + (E.unlock[i] || '');
    if (boss) b = (b ? b + ' ' : '') + E.bossTxt[boss.id];
    if (!b) b = R.lines[L.k % 3];
    if (E.special[i]) b = E.special[i];
    L.brief = b;
  });
}

/* ---------- sabit metinler: data-t (metin) ve data-ta (aria-label) ---------- */
const orig = new WeakMap();
function applyStatic(root) {
  (root || document).querySelectorAll('[data-t]').forEach(el => {
    let node = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    if (!node) { node = document.createTextNode(''); el.insertBefore(node, el.firstChild); }
    if (!orig.has(node)) orig.set(node, el.getAttribute('data-t') || node.textContent.trim());
    node.textContent = t(orig.get(node));
  });
  (root || document).querySelectorAll('[data-ta]').forEach(el => el.setAttribute('aria-label', t(el.getAttribute('data-ta'))));
  document.documentElement.lang = lang;
}
function setLang(l) { lang = l === 'en' ? 'en' : 'tr'; applyContent(); applyStatic(); }

window.DIL = {
  get lang() { return lang; }, t, setLang, applyStatic, applyContent, HOST, CAP,
  platform: HOST ? 'steam' : CAP ? (CAP.getPlatform ? CAP.getPlatform() : 'native') : window.QUEST_SURUM ? 'quest' : 'web',   // quest: Meta Horizon Store sürümü (Bubblewrap ile paketlenen PWA)
  dec: n => lang === 'en' ? String(n) : String(n).replace('.', ',')
};
applyContent();
document.addEventListener('DOMContentLoaded', () => applyStatic());
if (document.readyState !== 'loading') applyStatic();
})();
