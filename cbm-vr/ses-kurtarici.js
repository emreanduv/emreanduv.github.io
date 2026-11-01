/*
 * ses-kurtarici.js — Mr. Anduv! oyunları için ortak ses düzeltmesi (v2)
 *
 * Sorun: Oyundan WhatsApp vb. bir uygulamaya geçip dönünce telefon, oyunun ses
 * motorunu (AudioContext) "suspended" ya da iOS'ta "interrupted" bırakıyor.
 * Oyunlar yalnızca "suspended" durumuna bakıyordu, "interrupted" hiç açılmıyordu.
 * iOS bazen motoru "çalışıyor" gösterip sessiz de bırakabiliyor (zombi motor).
 *
 * Bu dosya:
 *  - Oyundaki her ses motorunu kendiliğinden takip eder.
 *  - Arka plana gidince sesi düzgünce durdurur, dönünce ve ilk dokunuşta açar.
 *  - iOS'un ses oturumunu sessiz bir "dürtme" sesiyle yeniden uyandırır.
 *  - Motor yine açılmazsa, oyunun bildirdiği "yeniden kur" fonksiyonunu çağırır.
 *  - <audio> müziklerini ve Howler.js'i de kapsar.
 *
 * Kullanım: HTML'de <head> içine, diğer tüm script'lerden ÖNCE:
 *   <script src="ses-kurtarici.js"></script>
 * Oyunun ses motoru sıfırdan kurulabiliyorsa (önerilir):
 *   window.SesKurtarici && SesKurtarici.yenidenKur(() => { AC = null; });
 */
(function () {
  'use strict';
  if (window.SesKurtarici) return;
  var contexts = [];
  var pausedMedia = [];
  var rebuildFns = [];
  var broken = false;
  var kick = null;

  // 1) Oyunun oluşturduğu her AudioContext'i otomatik kaydet
  ['AudioContext', 'webkitAudioContext'].forEach(function (name) {
    var Orig = window[name];
    if (!Orig || Orig.__sesKurtarici) return;
    var Wrapped = function (opts) {
      var ctx = opts ? new Orig(opts) : new Orig();
      contexts.push(ctx);
      return ctx;
    };
    Wrapped.prototype = Orig.prototype;
    Wrapped.__sesKurtarici = true;
    window[name] = Wrapped;
  });

  // iOS 17+: ses oturumunu oyun sesi olarak işaretle
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}

  // 2) Sessiz dürtme sesi: iOS'ta askıda kalan ses oturumunu yeniden başlatır
  function makeKick() {
    try {
      var n = 800, sr = 8000, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
      var w = function (o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
      v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
      w(36, 'data'); v.setUint32(40, n * 2, true);
      kick = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
      kick.setAttribute('playsinline', '');
      kick.preload = 'auto';
    } catch (e) { kick = null; }
  }

  function alive() { return contexts.filter(function (c) { return c.state !== 'closed'; }); }
  function allContexts() {
    var list = alive();
    if (window.Howler && Howler.ctx && list.indexOf(Howler.ctx) < 0) list.push(Howler.ctx);
    return list;
  }

  // Açtıktan yarım saniye sonra motor gerçekten çalışıyor mu? (saat ilerliyor mu)
  function checkLater() {
    var snaps = allContexts().map(function (c) { return [c, c.currentTime]; });
    setTimeout(function () {
      if (document.hidden) return;
      snaps.forEach(function (s) {
        if (s[0].state === 'closed') return;
        if (s[0].state !== 'running' || s[0].currentTime - s[1] < 0.1) broken = true;
      });
    }, 500);
  }

  function wake() {
    if (document.hidden) return;
    if (broken && rebuildFns.length) {
      broken = false;
      alive().forEach(function (c) { try { c.close(); } catch (e) {} });
      rebuildFns.forEach(function (fn) { try { fn(); } catch (e) {} });
    }
    if (!kick) makeKick();
    if (kick) { try { kick.currentTime = 0; var p = kick.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
    allContexts().forEach(function (c) {
      if (c.state !== 'running') c.resume().catch(function () { broken = true; });
      try { // boş bir ses parçası çalarak motoru dürt
        var b = c.createBuffer(1, 1, 22050), s = c.createBufferSource();
        s.buffer = b; s.connect(c.destination); s.start(0);
      } catch (e) {}
    });
    pausedMedia.forEach(function (m) { var p = m.play(); if (p && p.catch) p.catch(function () {}); });
    pausedMedia = [];
    checkLater();
  }

  function sleep() {
    allContexts().forEach(function (c) { if (c.state === 'running') c.suspend().catch(function () {}); });
    document.querySelectorAll('audio,video').forEach(function (m) {
      if (!m.paused) { m.pause(); pausedMedia.push(m); }
    });
  }

  // 3) Her dokunuşta: ses kapalı ya da bozuksa aç (tarayıcı yalnızca dokunuşla izin verir)
  ['pointerdown', 'touchend', 'mousedown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () {
      var needs = broken || pausedMedia.length ||
        allContexts().some(function (c) { return c.state !== 'running'; });
      if (needs) wake();
    }, { capture: true, passive: true });
  });

  // 4) Arka plana gidiş / dönüş
  document.addEventListener('visibilitychange', function () { document.hidden ? sleep() : wake(); });
  window.addEventListener('pagehide', sleep);
  window.addEventListener('pageshow', wake);

  // 5) Capacitor (mağaza sürümleri) yerel "uygulama döndü" olayları
  document.addEventListener('pause', sleep, false);
  document.addEventListener('resume', wake, false);
  function hookCapacitor() {
    try {
      var App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
      if (App && App.addListener) { App.addListener('appStateChange', function (s) { s.isActive ? wake() : sleep(); }); return true; }
    } catch (e) {}
    return false;
  }
  if (!hookCapacitor()) window.addEventListener('load', hookCapacitor);

  window.SesKurtarici = {
    yenidenKur: function (fn) { if (typeof fn === 'function') rebuildFns.push(fn); },
    uyandir: wake,
    durum: function () { return allContexts().map(function (c) { return c.state; }); }
  };
})();
