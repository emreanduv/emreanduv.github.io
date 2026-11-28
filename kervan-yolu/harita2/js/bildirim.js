// Sahadan acil çağrılar (yerel bildirim, sunucu yok, veri toplanmaz).
// Oyuncu ilk teslimatından sonra kibarca sorulur; izin verirse uygulama kapanınca 1, 3 ve 6 gün sonrası için gerçekçi saha haberleri planlanır:
// "Sivas sahasında türbin durdu, dişli kutusu yedek parçası acil bekleniyor" gibi. Bildirime dokununca o yük tipinde ACİL SEFER açılır (+%25 acil sefer primi).
// Ayarlar'da açılıp kapanır; "Verilerimi sil" planlanmış bildirimleri de iptal eder.
(function(){'use strict';
const LN=()=>window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;
const IDS=[1923,1924,1925];
const MSJ={tr:{
 yedek:['{b} sahasında türbin durdu','Dişli kutusu yedek parçası acil bekleniyor. Santral her saat üretim kaybediyor.'],
 kasa:['{b} şantiyesinde montaj durdu','Vinç ekibi cıvata ve bağlantı malzemesi kasalarını bekliyor.'],
 hub:['{b}: vinç hazır, rüzgâr uygun','Göbek bugün sahaya ulaşırsa kanat montajı yarın başlar.'],
 aktarma:['{b} sahasında jeneratör arızası','Güç aktarma ünitesi acil yola çıkmalı, türbin bekliyor.'],
 ankraj:['{b}: temel betonu dökülecek','Ankraj kafesi gecikirse beton ekibi boşa bekler. Yük seni bekliyor.']},
 en:{
 yedek:['Turbine down at the {b} site','A gearbox spare part is urgently needed. The farm loses output every hour.'],
 kasa:['Assembly stopped at the {b} site','The crane crew is waiting for the bolt and fitting crates.'],
 hub:['{b}: crane ready, wind is calm','If the hub arrives today, blade assembly starts tomorrow.'],
 aktarma:['Generator fault at the {b} site','The drivetrain unit must leave now, the turbine is waiting.'],
 ankraj:['{b}: foundation pour is due','If the anchor cage is late the concrete crew stands idle. The load is waiting.']}};
const TIPLER=Object.keys(MSJ.tr);
const T2={tr:{bilL:'Sahadan acil çağrılar',ac:'Açık',kap:'Kapalı',soruB:'Sahadan haber gelsin mi?',soruT:'Bir türbin durduğunda ya da montaj malzeme beklediğinde sana haber verelim. Acil seferlerde fazladan prim var.',evet:'Evet, haber ver',sonra:'Şimdi değil',acilT:'ACİL SEFER: {t}',k_acil:'Acil sefer primi'},
 en:{bilL:'Urgent site calls',ac:'On',kap:'Off',soruB:'Get calls from the site?',soruT:'We will let you know when a turbine stops or assembly is waiting for parts. Urgent hauls pay an extra bonus.',evet:'Yes, notify me',sonra:'Not now',acilT:'URGENT HAUL: {t}',k_acil:'Urgent haul bonus'}};
for(const k in T2){Object.assign(STR[k],T2[k])}
const regAd=r=>{try{return REGIONS[r].name[L]||REGIONS[r].name.tr}catch(e){return r}};
function acik(){return SAVE.bildirim===1}
async function izinVar(){const p=LN();if(!p)return false;try{const r=await p.checkPermissions();return r.display==='granted'}catch(e){return false}}
async function planla(){const p=LN();if(!p)return;try{await p.cancel({notifications:IDS.map(id=>({id}))})}catch(e){}if(!acik()||!(await izinVar()))return;
 const dil=L==='en'?'en':'tr';const gun=[[1,18,30],[3,12,15],[6,19,0]];const regs=Object.keys(SAVE.done||{}).length?REG_KEYS:['marmara','ege','sivas'];const n=[];
 gun.forEach(([g,h,m],k)=>{const tip=TIPLER[(Math.floor(Date.now()/864e5)+k*2)%TIPLER.length];const reg=regs[(Math.floor(Date.now()/36e5)+k)%regs.length];const[b,t]=MSJ[dil][tip];
  const d=new Date();d.setDate(d.getDate()+g);d.setHours(h,m,0,0);n.push({id:IDS[k],title:b.replace('{b}',regAd(reg)),body:t,schedule:{at:d,allowWhileIdle:true},extra:{acil:tip,reg}})});
 try{await p.schedule({notifications:n})}catch(e){console.log('bildirim',e)}}
async function iptal(){const p=LN();if(p)try{await p.cancel({notifications:IDS.map(id=>({id}))})}catch(e){}}
// Acil sefer: bildirimden gelinince o yük tipindeki ilk açık kariyer seferi +%25 primle başlar
function acilSefer(tip){if(typeof nextSefer!=='function')return;let n0=nextSefer(),n=n0;for(let k=0;k<60;k++){const j=sefer(n0+k);if(j.type===tip&&!(typeof needFull==='function'&&needFull(n0+k))){n=n0+k;break}}
 window._acil=tip;SAVE.tab='career';try{startGame('career',n)}catch(e){console.log(e)}}
const _rg=resetGame;resetGame=function(m,n){_rg(m,n);if(G){G.acil=!!(window._acil&&m==='career');if(G.acil){setTimeout(()=>toast(T('acilT').replace('{t}',(STR[L]['j_'+G.job.type]||G.job.type)),'#ffb36b',4),900)}window._acil=null}};
// santiye.js showReport'u sayfa yüklenince sarar; acil prim ondan sonra, en dışta sarılır
window.addEventListener('load',()=>setTimeout(()=>{const _sr=showReport;showReport=function(){try{if(G&&G.acil&&G.job&&!G.acilOdendi){G.acilOdendi=1;G.ext.push(['k_acil',Math.round(G.job.fee*.25/50)*50])}}catch(e){}_sr();
 try{if(mode==='career'&&!SAVE.bilSor&&LN()){SAVE.bilSor=1;save();setTimeout(sor,1600)}}catch(e){}};},0));
function sor(){const d=document.createElement('div');d.id='bilBox';d.style.cssText='position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55)';
 d.innerHTML=`<div class="panel" style="max-width:360px;margin:16px"><div class="phead"><span>${T('soruB')}</span></div><div class="pbody"><p style="margin:0 0 14px;line-height:1.4">${T('soruT')}</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn sm" id="bilHayir">${T('sonra')}</button><button class="btn sm gold" id="bilEvet">${T('evet')}</button></div></div></div>`;
 document.body.appendChild(d);d.querySelector('#bilHayir').onclick=()=>d.remove();d.querySelector('#bilEvet').onclick=async()=>{d.remove();const p=LN();if(!p)return;try{const r=await p.requestPermissions();SAVE.bildirim=r.display==='granted'?1:0;save()}catch(e){}}}
// Ayarlar satırı
const _fs=fillSettings;fillSettings=function(){_fs();const r=document.getElementById('rowBil');if(!r)return;r.hidden=!LN();document.getElementById('sBilL').textContent=T('bilL');document.getElementById('sBil').textContent=acik()?T('ac'):T('kap')};
document.getElementById('sBil').onclick=async()=>{const p=LN();if(!p)return;if(acik()){SAVE.bildirim=0;save();iptal()}else{try{const r=await p.requestPermissions();SAVE.bildirim=r.display==='granted'?1:0;save()}catch(e){}}fillSettings()};
const _ed=eraseData;eraseData=function(){const arm=eraseArm;_ed();if(arm)iptal()};document.getElementById('setErase').onclick=eraseData;
// uygulama arka plana gidince planla, öne gelince eskileri temizle; bildirime dokununca acil sefer
document.addEventListener('visibilitychange',()=>{if(!document.hidden)iptal()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)planla()});
try{const p=LN();if(p)p.addListener('localNotificationActionPerformed',a=>{const x=a&&a.notification&&a.notification.extra;if(x&&x.acil)setTimeout(()=>acilSefer(x.acil),400)})}catch(e){}
window.BILDIRIM={planla,iptal,acilSefer,MSJ};
})();
