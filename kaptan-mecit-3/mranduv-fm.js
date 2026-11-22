/* Mr. Anduv! FM — ortak oyun içi radyo ve açılış müziği (v1.1, Kasım 2026: art arda 3 hata → dur)
 * Kaynak: emreanduv/kervan-yolu www/muzik/mranduv-fm.js — bütün oyunlara birebir kopyalanır.
 *
 * Kullanım:
 *   MrAnduvFM.kur({ taban:'muzik/', dil:'tr', ekran:fn(durum) })   // liste.json'u okur
 *   MrAnduvFM.acilis()      // menüde açılış teması (yalnız ilk dokunuştan sonra çalar)
 *   MrAnduvFM.ac() / kapat() / degistir() / sonraki() / onceki()
 *   MrAnduvFM.ses(0..1)     // müzik sesi (Ayarlar)
 *   MrAnduvFM.kis(true|false)  // uyarı/anons sırasında sesi alçalt (ducking)
 *   MrAnduvFM.sustur(true|false) // oyunun genel "ses kapalı" ayarı
 *
 * liste.json:
 *   { "acilis": "parca/acilis.m4a",
 *     "uzak": "https://emreanduv.github.io/muzik/",      // isteğe bağlı: çevrimiçiyken çalınacak geniş liste
 *     "parcalar": [ {"d":"parca/ruhunu-bagla.m4a","ad":"Ruhunu Bağla"}, ... ],
 *     "uzakParcalar": [ {"d":"...m4a","ad":"..."} ] }
 *
 * Cihazdan geri gelince ses-kurtarici.js (v3) <audio>'yu kendisi sürdürür; bu modül
 * kullanıcının durdurduğu radyoyu asla kendiliğinden açmaz.
 */
(function () {
  'use strict';
  var KEY = 'mrAnduvFM';
  var st = { acik: false, vol: 0.55, son: -1 };
  try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) for (var k in s) st[k] = s[k]; } catch (e) {}
  function kaydet() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  var cfg = { taban: 'muzik/', dil: 'tr', ekran: null };
  var liste = null, sira = [], idx = -1, mod = 'yok'; // yok | acilis | radyo
  var a = new Audio(); a.preload = 'auto'; a.setAttribute('playsinline', '');
  var duck = 1, muted = false, dokunuldu = false, bekleyen = null, ac = null;

  function hedefSes() { return muted ? 0 : st.vol * duck * (mod === 'acilis' ? 0.8 : 1); }
  function sesUygula(hizli) {
    var h = hedefSes(), b = a.volume, t0 = Date.now(), sure = hizli ? 0 : 350;
    if (!sure) { a.volume = h; return; }
    (function adim() { var p = Math.min(1, (Date.now() - t0) / sure); a.volume = b + (h - b) * p; if (p < 1) requestAnimationFrame(adim); })();
  }
  function url(p) { return /^https?:/.test(p.d) ? p.d : (p.uzak ? liste.uzak + p.d : cfg.taban + p.d); }
  function karistir() {
    var hepsi = (liste.parcalar || []).slice();
    if (liste.uzak && navigator.onLine !== false) (liste.uzakParcalar || []).forEach(function (p) { hepsi.push({ d: p.d, ad: p.ad, uzak: 1 }); });
    for (var i = hepsi.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = hepsi[i]; hepsi[i] = hepsi[j]; hepsi[j] = t; }
    sira = hepsi; idx = -1;
  }
  function bildir() {
    if (!cfg.ekran) return;
    var p = mod === 'radyo' && sira[idx];
    try { cfg.ekran({ acik: st.acik, mod: mod, ad: p ? p.ad : '', var: !!(liste && liste.parcalar && liste.parcalar.length) }); } catch (e) {}
  }

  // Eski radyo istasyon jingle'ı: Farfisa benzeri arpej, bant titremesi, alçak geçiren süzgeç
  function jingle(sonra) {
    try {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return sonra();
      ac = ac || new C(); if (ac.state === 'suspended') ac.resume();
      var t = ac.currentTime + 0.05, out = ac.createGain(), lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2400; out.gain.value = 0.16 * hedefSes() / Math.max(st.vol, 0.01);
      lp.connect(out); out.connect(ac.destination);
      var wow = ac.createOscillator(), wg = ac.createGain(); wow.frequency.value = 5.5; wg.gain.value = 9; wow.connect(wg); wow.start(t); wow.stop(t + 1.6);
      [392, 523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
        var o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), ts = t + i * 0.11;
        o.type = 'square'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f * 1.003;
        wg.connect(o.detune); wg.connect(o2.detune);
        g.gain.setValueAtTime(0, ts); g.gain.linearRampToValueAtTime(0.5, ts + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ts + (i === 4 ? 1.1 : 0.35));
        o.connect(g); o2.connect(g); g.connect(lp); o.start(ts); o2.start(ts); o.stop(ts + 1.2); o2.stop(ts + 1.2);
      });
      setTimeout(sonra, 1250);
    } catch (e) { sonra(); }
  }

  function cal(p, yeniJingle) {
    var basla = function () {
      a.src = url(p); a.loop = mod === 'acilis'; a.volume = 0; sesUygula(true);
      var pr = a.play(); if (pr && pr.catch) pr.catch(function () { bekleyen = function () { a.play(); }; });
      sesUygula(); bildir();
    };
    if (yeniJingle) jingle(basla); else basla();
  }
  function radyoCal(yon, jing) {
    if (!sira.length) karistir();
    if (!sira.length) return;
    idx = (idx + (yon || 1) + sira.length) % sira.length;
    st.son = idx; kaydet(); mod = 'radyo'; cal(sira[idx], jing);
  }

  a.addEventListener('ended', function () { if (mod === 'radyo') radyoCal(1, Math.random() < 0.35); });
  var hataSay = 0;
  a.addEventListener('playing', function () { hataSay = 0; });
  a.addEventListener('error', function () { // çevrimdışı uzak parça ya da bozuk dosya: atla
    if (mod !== 'radyo') return; var p = sira[idx]; if (p && p.uzak) sira = sira.filter(function (x) { return !x.uzak; }), idx = -1;
    if (++hataSay >= 3) { hataSay = 0; mod = 'yok'; a.pause(); bildir(); return; } // v1.1: art arda 3 parça açılmadıysa (bağlantı yok) dur, boşuna dönme
    setTimeout(function () { radyoCal(1, false); }, 400);
  });
  function ilkDokunus() { dokunuldu = true; if (bekleyen) { var f = bekleyen; bekleyen = null; f(); } }
  ['pointerdown', 'touchend', 'keydown'].forEach(function (e) { addEventListener(e, ilkDokunus, { passive: true }); });

  var API = {
    kur: function (o) {
      for (var k in o) cfg[k] = o[k];
      return fetch(cfg.taban + 'liste.json').then(function (r) { return r.json(); })
        .then(function (j) { liste = j; bildir(); return j; })
        .catch(function () { liste = { parcalar: [] }; bildir(); });
    },
    hazir: function () { return !!(liste && ((liste.parcalar && liste.parcalar.length) || liste.acilis)); },
    acilis: function () {
      if (!liste || !liste.acilis || mod === 'acilis') return;
      mod = 'acilis';
      var f = function () { if (mod === 'acilis') cal({ d: liste.acilis, ad: 'Mr. Anduv!' }, false); };
      if (dokunuldu) f(); else bekleyen = f;
    },
    acilisBitir: function () { if (mod !== 'acilis') return; mod = 'yok'; a.pause(); bekleyen = null; if (st.acik) radyoCal(1, true); },
    ac: function () { st.acik = true; kaydet(); if (mod !== 'radyo') radyoCal(1, true); else { a.play(); bildir(); } },
    kapat: function () { st.acik = false; kaydet(); if (mod === 'radyo') { a.pause(); mod = 'yok'; } bildir(); },
    degistir: function () { st.acik && mod === 'radyo' ? API.kapat() : API.ac(); return st.acik; },
    sonraki: function () { st.acik = true; kaydet(); radyoCal(1, false); },
    onceki: function () { st.acik = true; kaydet(); radyoCal(-1, false); },
    oyunBasladi: function () { if (mod === 'acilis') API.acilisBitir(); else if (st.acik && mod !== 'radyo') radyoCal(1, true); },
    oyunBitti: function () { if (mod === 'radyo') { a.pause(); mod = 'yok'; bildir(); } },
    ses: function (v) { if (v == null) return st.vol; st.vol = Math.max(0, Math.min(1, v)); kaydet(); sesUygula(); },
    kis: function (on) { duck = on ? 0.3 : 1; sesUygula(); },
    sustur: function (on) { muted = !!on; sesUygula(true); },
    durum: function () { return { acik: st.acik, mod: mod, ad: sira[idx] ? sira[idx].ad : '', vol: st.vol }; }
  };
  window.MrAnduvFM = API;
})();
