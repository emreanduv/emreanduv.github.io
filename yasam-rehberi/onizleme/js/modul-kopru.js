// Modül sayfaları (Tesbih, Saat) ile Yaşam Rehberi arasındaki köprü.
// Uygulama içinde açılınca (iframe, aynı köken) window.parent.YR kullanılır:
//   konum, namaz vakitleri ve kıble uygulamanın kendi hesabından gelir; veri telefonun kalıcı deposuna yazılır;
//   hatırlatmalar telefonun bildirimi olarak kurulur. Tek başına açılırsa tarayıcı deposuyla çalışır.
(function () {
  var P = null;
  try { if (window.parent && window.parent !== window && window.parent.YR) P = window.parent.YR; } catch (e) { P = null; }
  var mem = {};
  window.YRK = {
    gomulu: !!P,
    kuran: P ? P.kuran !== false : true,      // Kur'an içeriği açık mı (uygulamanın yayın anahtarı)
    oku: function (k) { if (P) return P.oku(k); try { return localStorage.getItem(k); } catch (e) { return mem[k] || null; } },
    yaz: function (k, v) { if (P) { P.yaz(k, v); return; } try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } },
    konum: function () { return P ? P.konum() : null; },          // { lat, lon, ad } ya da null
    vakit: function (d) { return P ? P.vakit(d) : null; },         // { imsak, gunes, ogle, ikindi, aksam, yatsi } (Date)
    hicri: function (d) { return P && P.hicri ? P.hicri(d) : null; }, // { gun, ay, yil, ayAdi, ramazan }
    git: function (h) { if (P) P.git(h); },
    saatPlan: function (list) { if (P) P.saatPlan(list); },
    tesbihAyar: function (on, after) { return P ? P.tesbihAyar(on, after) : Promise.resolve(true); }
  };
  if (P) document.documentElement.className += " gomulu";
})();
