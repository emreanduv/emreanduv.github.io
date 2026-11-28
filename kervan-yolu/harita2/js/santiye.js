// 1.1 "Şantiye": deneme sürüşü seferi, 80 m kanat sınıfı, alçak uç çerçevesi, hemzemin geçit, manevra alanı, vinçle montaj
// Yöntem gerçek bir güzergâh etüdü ve kanat taşıma çiziminden örnek alındı; ad, yer ve kişi bilgisi yok.
(function(){
'use strict';
const TRs={
 dsKart:'GÜZERGÂH DENEME SÜRÜŞÜ',dsTxt:'{r}: boş ve tam boy uzatılmış dorseyle güzergâhı sür, engelleri gördükçe işaretle. Yatırımcı öder; işaretlediğin her engel prim. Yapılınca etüt raporu eksiksiz çıkar.',dsBtn:'DENEME SÜRÜŞÜNE ÇIK',dsTamam:'{r}: deneme sürüşü yapıldı ✓',
 dsBaslik:'Deneme sürüşü',dsIpucu:'Deneme sürüşü: yük yok, dorse tam boy açık. Engeli gördüğünde İŞARETLE düğmesine bas.',a_isaret:'İŞARETLE: {e}',t_isaret:'İşaretlendi: {e}',t_kacti:'Kaçırdın: {e}',k_dsPrim:'Deneme sürüşü primi ({n} engel)',
 cerH:'KANAT UÇ ÇERÇEVESİ',cerStd:'Standart',cerAlc:'Alçak',cerTxt:'Alçak çerçeve kanadı yaklaşık 45 cm indirir: alçak kablo ve hatların altından geçer, ama en çok 40 km/sa ve uyarlama bedeli var.',k_cerceve:'Alçak uç çerçevesi uyarlaması',
 kl80:'Kanat: 80 m sınıfı · 28,5 t · 4,5 m genişlik',kl72:'Kanat: 72 m sınıfı · 24 t',
 hzTz:'Eskort 1: Hemzemin geçit, tren geliyor, bariyerler iniyor. Dur çizgisinde bekle.',t_hzKapi:'Hemzemin geçit! Bariyer iniyor, dur çizgisinde bekle.',t_hzCeza:'Kapalı bariyerden geçtin! Hemzemin geçit cezası.',t_hzKaza:'Trene çok yakın geçtin! Yük sarsıldı.',t_hzAcik:'Bariyer kalktı, geçebilirsin.',k_hemzemin:'Hemzemin geçit cezası',
 manRing:'MANEVRA',a_man:'GERİ MANEVRA (ESKORT YÖNLENDİRİR)',t_manDur:'Manevra alanı: sahaya önce geri geri girilir. Mavi halkada dur.',manTz1:'Eskort 2: Geri gel… geri… direksiyon sola, yavaş.',manTz2:'Eskort 2: Dorse ucu temiz, gelmeye devam… dur!',t_manOk:'Manevra tamam, sahaya düz devam.',
 mtH:'MONTAJ',mtTxt:'Vinç segmenti kaldırıyor. GAZ\'a basılı tut, rüzgâr 12 m/s üstüne çıkarsa bırak.',mtRuz:'Rüzgâr {w} m/s',mtOk:'Montaj tamam: {p}',mtDur:'Rüzgâr sert! Kaldırma durdu, bekle.',mtAtla:'OPERATÖRE BIRAK',pKule:'kule {k}/4',pNasel:'nasel yerinde',pKanat:'kanat {k}/3',pTur:'türbin tamamlandı, rotor dönüyor!',k_montaj:'Montaj primi',mtH2:'VİNÇLE İNDİRME',mtTxtI:'Vinç yükü dorseden alıp istif sahasına indiriyor. GAZ\'a basılı tut, rüzgâr 12 m/s üstüne çıkarsa bırak.',mtTxtA:'Vinç ankraj kafesini temel çukuruna indiriyor. GAZ\'a basılı tut, rüzgâr 12 m/s üstüne çıkarsa bırak.',mtTxtH:'Vinç göbeği nasele kaldırıyor. GAZ\'a basılı tut, rüzgâr 12 m/s üstüne çıkarsa bırak.',mtOkI:'İndirme tamam: {p}',pIndir:'yük istif sahasında',pAnk:'ankraj kafesi temelde',pHub:'göbek nasele takıldı',k_indirme:'Vinçle indirme primi'};
const ENs={
 dsKart:'ROUTE DUMMY RUN',dsTxt:'{r}: drive the route with an empty, fully extended trailer and mark obstacles as you see them. The investor pays; every marked obstacle earns a bonus. Afterwards the route survey is complete.',dsBtn:'START DUMMY RUN',dsTamam:'{r}: dummy run done ✓',
 dsBaslik:'Dummy run',dsIpucu:'Dummy run: no load, trailer fully extended. Press MARK when you see an obstacle.',a_isaret:'MARK: {e}',t_isaret:'Marked: {e}',t_kacti:'Missed: {e}',k_dsPrim:'Dummy run bonus ({n} obstacles)',
 cerH:'BLADE TIP FRAME',cerStd:'Standard',cerAlc:'Low',cerTxt:'The low frame drops the blade about 45 cm: it clears low cables and lines, but max 40 km/h and an adaptation fee.',k_cerceve:'Low tip frame adaptation',
 kl80:'Blade: 80 m class · 28.5 t · 4.5 m wide',kl72:'Blade: 72 m class · 24 t',
 hzTz:'Escort 1: Level crossing, train coming, barriers going down. Wait at the stop line.',t_hzKapi:'Level crossing! Barriers coming down, wait at the stop line.',t_hzCeza:'You crossed with the barriers down! Level crossing fine.',t_hzKaza:'Far too close to the train! The load was shaken.',t_hzAcik:'Barriers up, you can cross.',k_hemzemin:'Level crossing fine',
 manRing:'MANOEUVRE',a_man:'REVERSE IN (ESCORT GUIDES)',t_manDur:'Manoeuvring area: the site is entered in reverse. Stop in the blue ring.',manTz1:'Escort 2: Back… back… steer left, slowly.',manTz2:'Escort 2: Trailer tip is clear, keep coming… stop!',t_manOk:'Manoeuvre done, carry on straight to the site.',
 mtH:'ASSEMBLY',mtTxt:'The crane is lifting the section. Hold GAS, let go if the wind goes above 12 m/s.',mtRuz:'Wind {w} m/s',mtOk:'Assembly done: {p}',mtDur:'Gusts too strong! Lift stopped, wait.',mtAtla:'LEAVE IT TO THE OPERATOR',pKule:'tower {k}/4',pNasel:'nacelle in place',pKanat:'blade {k}/3',pTur:'turbine complete, the rotor is turning!',k_montaj:'Assembly bonus',mtH2:'CRANE OFFLOAD',mtTxtI:'The crane is lifting the load off the trailer onto the laydown area. Hold GAS, let go if the wind goes above 12 m/s.',mtTxtA:'The crane is lowering the anchor cage into the foundation pit. Hold GAS, let go if the wind goes above 12 m/s.',mtTxtH:'The crane is lifting the hub onto the nacelle. Hold GAS, let go if the wind goes above 12 m/s.',mtOkI:'Offload done: {p}',pIndir:'load on the laydown area',pAnk:'anchor cage in the foundation',pHub:'hub fitted to the nacelle',k_indirme:'Crane offload bonus'};
Object.assign(STR.tr,TRs);Object.assign(STR.en,ENs);
HELP.tr.unshift(['Deneme sürüşü, hemzemin geçit, manevra ve montaj','Yeni bir bölgede menüden deneme sürüşü yap: boş, tam boy uzatılmış dorseyle git, engelleri İŞARETLE; etüt raporu eksiksiz çıkar ve prim alırsın. Bazı kanat seferleri 80 m sınıfıdır. Alçak uç çerçevesi kanadı indirir, alçak kabloların altından geçersin ama en çok 40 km/sa. Hemzemin geçitte bariyer inerse dur çizgisinde bekle. Dağ sahalarında son kısma eskort yönlendirmesiyle geri geri girilir. Kule, nasel ve kanat teslim edince vinçle montajı sen yönetirsin; türbin parça parça yükselir.']);
HELP.en.unshift(['Dummy run, level crossing, manoeuvre and assembly','In a new region do a dummy run from the menu: drive with an empty, fully extended trailer and MARK obstacles; the survey becomes complete and you earn a bonus. Some blade jobs are 80 m class. A low tip frame lowers the blade so you pass under low cables, but max 40 km/h. At a level crossing wait at the stop line when the barriers come down. On mountain sites the last stretch is entered in reverse with an escort guiding. After delivering tower, nacelle or blade you run the crane assembly; the turbine rises piece by piece.']);

const HZ_ESIK=28;const RAIL=['marmara','ege','sivas','trakya','hatay','kapadokya'];
const MAN=['ege','karadeniz','kapadokya'];
const DSN=200000;
let HZ=null,MR=null,MT=null;

// ---------- seferler ----------
const _sf=sefer;sefer=function(n){if(n>=DSN&&n<DSN+50){const reg=REG_KEYS[n-DSN];let b=4;for(let k=4;k<900;k++){const j=_sf(k);if(j.reg===reg&&j.type==='kanat'){b=k;break}}const j=Object.assign({},_sf(b));j.n=n;j.dummy=true;j.reg=reg;j.night=false;j.tod='ogle';j.refakat=null;j.rain=false;j.mud=false;j.kl80=false;j.fee=Math.round(j.fee*.4/50)*50;return j}
 const j=_sf(n);if(j&&j.type==='kanat'&&n>12&&n%3===0&&!j.proje){j.kl80=true;j.fee=Math.round(j.fee*1.12/50)*50}return j};

function bladeMesh(){try{return CARGO.kanat.children[0].children[0]}catch(e){return null}}
const _rs=resetGame;resetGame=function(m,n){const dummy=m==='career'&&n>=DSN&&n<DSN+50;const ix=IMPORT.indexOf('kanat');if(dummy&&ix>=0)IMPORT.splice(ix,1);
 try{_rs(m,n)}finally{if(dummy&&ix>=0)IMPORT.splice(ix,0,'kanat')}
 if(!G)return;const j=G.job;G.alcak=false;G.dsIs=new Set();G.dsKac=new Set();G.manOk=false;G.mont=null;
 if(CARGO.kanat){CARGO.kanat.position.y=3.75;CARGO.kanat.children.forEach(c=>{if(c.userData._dsv!==undefined){c.visible=c.userData._dsv;delete c.userData._dsv}})}
 const bm=bladeMesh();if(bm)bm.scale.y=j.kl80?80/72:1;TON.kanat=j.kl80?28.5:24;
 const ix2=BLZ.indexOf(76);if(j.kl80&&ix2<0)BLZ.push(76);if(!j.kl80&&ix2>=0)BLZ.splice(ix2,1);
 if(j.dummy&&CARGO.kanat){CARGO.kanat.visible=true;CARGO.kanat.children.forEach(c=>{c.userData._dsv=c.visible;c.visible=false});setTimeout(()=>toast(T('dsIpucu'),'#bfe4ff',4.5),1200)}
 if(HZ){HZ.st='acik';HZ.tetik=false;HZ.ceza=false;HZ.kaza=false;HZ.s=-999;HZ.train.visible=false;HZ.cars&&HZ.cars.forEach(w=>w.visible=false);HZ.kolA=HZ.kol0;HZ.isik.forEach(l=>l.material.color.setHex(0x3a0c0c))}
 if(MR){MR.ring.visible=false}};

// ---------- menü: deneme sürüşü kartı ----------
function dsBasla(reg){const n=DSN+REG_KEYS.indexOf(reg);if(needFull(nextSefer())&&!SAVE.full){openFull(nextSefer());return}startGame('career',n)}
window.dsBasla=dsBasla;
const _rm=renderMenu;renderMenu=function(){_rm();try{if(SAVE.tab!=='career')return;const b=$('mBody');if(!b)return;const n=nextSefer();const reg=sefer(n).reg;SAVE.ds=SAVE.ds||{};
 const ad=REGIONS[reg]&&REGIONS[reg].name?REGIONS[reg].name[L]||REGIONS[reg].name.tr:reg;const d=document.createElement('div');d.className='card';d.style.cssText='margin-top:10px;text-align:left';
 if(SAVE.ds[reg]){d.innerHTML=`<div class="small" style="color:#8ff0a4">${T('dsTamam').replace('{r}',ad)}</div>`}
 else{d.innerHTML=`<div style="font-weight:800;letter-spacing:.04em">${T('dsKart')}</div><div class="small" style="margin:4px 0 8px;opacity:.85">${T('dsTxt').replace('{r}',ad)}</div><button class="btn" id="dsB" style="width:100%">${T('dsBtn')}</button>`}
 b.appendChild(d);const bt=document.getElementById('dsB');if(bt)bt.onclick=()=>dsBasla(reg)}catch(e){console.log('ds menu',e)}};

// ---------- evrak: uç çerçevesi ve kanat sınıfı ----------
addEventListener('load',()=>{
 const _od=openDocs;openDocs=function(){_od();try{if(typeof mode==='undefined'||mode!=='career'||!G||G.job.type!=='kanat'||G.job.dummy||G.freeDocs)return;const box=document.createElement('div');box.id='cerB';
  box.style.cssText='text-align:left;margin:10px 0 4px;padding:8px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:rgba(0,0,0,.18)';
  const on=!!G.cerSec;box.innerHTML=`<div class="small" style="margin-bottom:6px;font-weight:700">${T(G.job.kl80?'kl80':'kl72')}</div><div style="font-weight:800;letter-spacing:.04em;margin-bottom:4px">${T('cerH')}</div><div class="small" style="margin-bottom:6px;opacity:.85">${T('cerTxt')}</div><div style="display:flex;gap:6px"><button class="btn sm${on?'':' gold'}" data-c="0" style="flex:1">${T('cerStd')}</button><button class="btn sm${on?' gold':''}" data-c="1" style="flex:1">${T('cerAlc')} · −${fmt(2500)}</button></div>`;
  const e=document.getElementById('cerB');if(e)e.remove();$('docsB').appendChild(box);box.querySelectorAll('button[data-c]').forEach(b=>b.onclick=()=>{G.cerSec=b.dataset.c==='1';box.querySelectorAll('button[data-c]').forEach(x=>x.classList.toggle('gold',(x.dataset.c==='1')===G.cerSec))})}catch(e){console.log('cer',e)}
  // deneme sürüşünde etüt raporu çıkmaz
  try{if(G&&G.job&&G.job.dummy){const e=document.getElementById('etutB');if(e)e.remove()}}catch(e){}};
 const _ok=$('docsOk').onclick;$('docsOk').onclick=function(){try{if(G&&G.job&&G.job.type==='kanat'&&G.cerSec&&!G.alcak&&!G.freeDocs&&!G.job.dummy){G.alcak=true;if(CARGO.kanat)CARGO.kanat.position.y=3.3;G.ext.push(['k_cerceve',-2500])}}catch(e){}return _ok.apply(this,arguments)};

 // ---------- sürüş adımı ----------
 const _st=EXT.step;EXT.step=function(dt,run){const r=_st?_st(dt,run):undefined;if(!G||!truck)return r;try{if(HZ)hzAdim(dt,run)}catch(e){console.log('santiye hz',e)}try{if(run&&phase==='drive'){if(G.job.dummy)dsAdim();manAdim(dt)}}catch(e){console.log('santiye ds',e)}try{if(MT)mtAdim(dt)}catch(e){console.log('santiye mt',e)}return r};

 // ---------- rapor: deneme sürüşü primi ve başlık; montaj ----------
 const _sr=showReport;showReport=function(){const j=G&&G.job;
  if(j&&j.dummy){const n=G.dsIs.size;if(n)G.ext.push(['k_dsPrim',n*1500]);SAVE.ds=SAVE.ds||{};SAVE.ds[j.reg]=true}
  if(j&&!j.dummy&&j.type&&j.type!=='donus'&&!G.mont&&KULE){const ind=mode!=='career'||!montajUygun(j.type);montajBasla(j.type,()=>{_sr();sonRapor(j)},ind);return}
  _sr();sonRapor(j)};
 function sonRapor(j){try{if(j&&j.dummy){delete SAVE.done[j.n];save();const ad=REGIONS[j.reg].name[L]||REGIONS[j.reg].name.tr;$('rSefer').textContent=T('dsBaslik')+' · '+ad}}catch(e){}}
});

// ---------- deneme sürüşü: işaretleme ----------
function dsAdim(){const E=window.ETUT&&ETUT.EN();if(!E||!E.length)return;const v=truck.v,ti=roadIdx(v);let yak=null;
 for(const o of E){if(G.dsIs.has(o.id)||G.dsKac.has(o.id))continue;if(ti>o.i+3){G.dsKac.add(o.id);toast(T('t_kacti').replace('{e}',T('e_'+o.tip)),'#ffb36b',2.2);continue}if(ti>=o.i-28&&ti<=o.i+3){yak=o;break}}
 if(yak){const lb=T('a_isaret').replace('{e}',T('e_'+yak.tip));if(!(actFn&&actFn.ds&&$('act').textContent===lb)){const o=yak;const fn=()=>{G.dsIs.add(o.id);setAct(null);blip(880,1320,.12);toast(T('t_isaret').replace('{e}',T('e_'+o.tip)),ETUT.RK[ETUT.TUR[o.tip].c],2)};fn.ds=1;setAct(lb,fn)}}
 else if(actFn&&actFn.ds)setAct(null)}

// ---------- hemzemin geçit ----------
function inst(geo,mat,n){const m=new THREE.InstancedMesh(geo,mat,n);m.count=0;return m}
// hemzemin geçit hattı: yola dik, ±HAT_L m; hattın yolu başka bir yerde kesmemesi, sahaya ve limana girmemesi gerekir
const HAT_L=420;
function hatTemiz(i){for(let s=-HAT_L;s<=HAT_L;s+=6){if(Math.abs(s)<14)continue;const p=sideAt(i,s);if(Math.hypot(p.x-SITE.x,p.z-SITE.z)<110||Math.hypot(p.x,p.z)<160)return false;
  for(let j=2;j<NS-2;j+=2){if(Math.abs(j-i)<22)continue;const r=RS[j];if((r.x-p.x)**2+(r.z-p.z)**2<15*15)return false}}return true}
// hat yüksekliği: geçitte yol düzeyi, dışarıda yumuşatılmış arazi; eğim en çok %2 (demiryolu)
function hatProfil(ri){const P=new Map();const yol=RY[ri]+.2;P.set(0,yol);for(const yon of[1,-1]){let y=yol;for(let s=1.25;s<=HAT_L+60;s+=1.25){const ss=s*yon;let m=0,n=0;for(let k=-16;k<=16;k+=4){const q=sideAt(ri,ss+k);m+=getH(q.x,q.z);n++}let hd=m/n+.12;if(s<7)hd=yol;y=clamp(hd,y-.025,y+.025);P.set(Math.round(ss/1.25),y)}}return P}
function hatY(H,ss){const k=ss/1.25,a=Math.floor(k),b=a+1,f=k-a;const ya=H.prof.get(a),yb=H.prof.get(b);if(ya==null||yb==null)return RY[H.ri]+.2;return ya+(yb-ya)*f}
function hzKur(root){HZ=null;if(!RAIL.includes(REG))return;const E=(window.ETUT&&ETUT.EN())||[];let best=-1,bs=1e9;
 for(let i=Math.round(NS*.09);i<Math.round(NS*.62);i+=2){if(VZ&&i>VZ.v0-60&&i<VZ.wi+10)continue;if(CZ&&CZ.ci&&Math.abs(i-CZ.ci)<25)continue;if(E.some(o=>Math.abs(o.i-i)<16))continue;if(PORTOPS.kantar&&Math.abs(PORTOPS.kantar.ki-i)<25)continue;if(PLAN&&((PLAN.ri&&Math.abs(PLAN.ri-i)<40)||(PLAN.ki&&Math.abs(PLAN.ki-i)<30)))continue;if(PORTOPS.dz&&Math.abs(PORTOPS.dz.i-i)<30)continue;
  const a=sideAt(i-8,0).ang,b=sideAt(i+8,0).ang;let d=Math.abs(angDiff(a,b))*20;for(const off of[-60,-35,-15,15,35,60]){const q=sideAt(i,off);d+=Math.abs(getH(q.x,q.z)-RY[i])}if(d<bs&&hatTemiz(i)){bs=d;best=i}}
 window._hzBs=bs; if(best<0||bs>HZ_ESIK)return;const ri=best,c=sideAt(ri,0),ang=c.ang;const nx=Math.cos(ang),nz=-Math.sin(ang);// yola dik doğrultu
 const g=new THREE.Group();root.add(g);const pt=(s)=>{const p=sideAt(ri,s);return p};
 const prof=hatProfil(ri);const HP={prof,ri};const N=Math.ceil(2*HAT_L/1.25)+4;
 const trav=inst(new THREE.BoxGeometry(2.6,.16,.26),P('#5b4632',{shininess:2}),N),ray=inst(new THREE.BoxGeometry(.09,.14,1.25),P('#8c8f93',{shininess:60}),2*N),bal=inst(new THREE.BoxGeometry(3.4,.3,1.25),P('#77746e',{shininess:2}),2*N);g.add(trav,ray,bal);
 const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),S=new THREE.Vector3(1,1,1),V=new THREE.Vector3();
 for(let s=-HAT_L;s<=HAT_L;s+=1.25){const p=pt(s);const y=hatY(HP,s);const y2=hatY(HP,s+1.25);Q.setFromEuler(new THREE.Euler(0,ang,0));const eg=Math.atan2(y2-y,1.25);Q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-eg));
  V.set(p.x,y,p.z);M.compose(V,Q,S);if(Math.abs(s)>=5.5){bal.setMatrixAt(bal.count++,M);trav.setMatrixAt(trav.count++,M);const gh=getH(p.x,p.z);if(gh<y-.8){V.set(p.x,(y+gh)/2-.1,p.z);M.compose(V,Q,new THREE.Vector3(1.6,(y-gh)/.3,1));bal.setMatrixAt(bal.count++,M)}}
  for(const k of[-.72,.72]){V.set(p.x+Math.sin(ang)*k,y+.12,p.z+Math.cos(ang)*k);M.compose(V,Q,S);ray.setMatrixAt(ray.count++,M)}}
 [trav,ray,bal].forEach(m=>m.instanceMatrix.needsUpdate=true);
 // geçitte yolla aynı düzeyde beton geçit plakaları (raylar plakaların arasında)
 {const pl=P('#a9a7a0',{shininess:6});for(let s=-6;s<=6;s+=2.4){const q=pt(s);const b=addBox(1.2,.12,2.3,pl,0,0,0,g);b.position.set(q.x,hatY(HP,s)+.12,q.z);b.rotation.y=ang;for(const k of[-1.55,1.55]){const e=addBox(.6,.12,2.3,pl,0,0,0,g);e.position.set(q.x+Math.sin(ang)*k,hatY(HP,s)+.12,q.z+Math.cos(ang)*k);e.rotation.y=ang}}}
 // geçitten 150 m önce uyarı levhası (üçgen, buharlı tren simgesi yerine bugünkü lokomotif)
 {const tx=new THREE.CanvasTexture((()=>{const c=document.createElement('canvas');c.width=c.height=128;const q=c.getContext('2d');q.fillStyle='#fff';q.beginPath();q.moveTo(64,6);q.lineTo(124,118);q.lineTo(4,118);q.closePath();q.fill();q.strokeStyle='#d0141a';q.lineWidth=12;q.stroke();q.fillStyle='#111';q.fillRect(36,64,56,26);q.fillRect(44,52,22,14);q.beginPath();q.arc(46,94,7,0,7);q.arc(82,94,7,0,7);q.fill();return c})());
  const dsm=ROADLEN/(NS-1);for(const yon of[-1,1]){const i=Math.max(3,Math.min(NS-3,Math.round(ri-yon*150/dsm)));const q=sideAt(i,yon*6.6);const t=new THREE.Group();t.position.set(q.x,getH(q.x,q.z),q.z);t.rotation.y=q.ang+(yon>0?0:Math.PI);g.add(t);addBox(.1,2.4,.1,MAT.steel,0,1.2,0,t);const m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.2),new THREE.MeshBasicMaterial({map:tx,transparent:true,side:THREE.DoubleSide}));m.position.y=2.8;t.add(m)}}
 // levhalar, bariyer, ışıklar (iki yaklaşım)
 const kol=[],isik=[];const yuk=P('#e9e9e6');
 for(const yon of[-1,1]){const q=sideAt(ri-yon*7,yon*6.4);const t=new THREE.Group();t.position.set(q.x,getH(q.x,q.z),q.z);t.rotation.y=q.ang+(yon>0?0:Math.PI);g.add(t);
  addBox(.14,3.4,.14,MAT.steel,0,1.7,0,t);for(const r of[.62,-.62]){const x=addBox(1.5,.22,.04,yuk,0,3.1,0,t);x.rotation.z=r;const kr=addBox(1.5,.08,.045,P('#c91d1d'),0,3.1,0,t);kr.rotation.z=r}
  for(const dx of[-.35,.35]){const l=new THREE.Mesh(new THREE.CircleGeometry(.16,12),new THREE.MeshBasicMaterial({color:0x3a0c0c}));l.position.set(dx,2.45,.09);t.add(l);isik.push(l)}
  const pv=new THREE.Group();pv.position.set(0,1.05,0);t.add(pv);const arm=new THREE.Group();arm.userData.gecirgen=1;pv.add(arm);/* kol yola doğru uzanır ve kendi şeridini yol eksenine kadar kapatır (yarım bariyer) */for(let k=0;k<10;k++)addBox(.62,.16,.12,k%2?P('#c91d1d'):yuk,.35+k*.62,0,0,arm);{const uc=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),new THREE.MeshBasicMaterial({color:0xff2a1a}));uc.position.set(6.4,.14,0);arm.add(uc);isik.push(uc)}arm.rotation.z=Math.PI/2*.95;kol.push(arm)
  const dl=sideAt(ri-yon*9,yon*LANE);const dur=new THREE.Mesh(new THREE.PlaneGeometry(.35,4.2),new THREE.MeshBasicMaterial({color:0xf4f4f0,polygonOffset:true,polygonOffsetFactor:-6}));dur.rotation.x=-Math.PI/2;dur.rotation.z=dl.ang+Math.PI/2;dur.position.set(dl.x,getH(dl.x,dl.z)+.25,dl.z);g.add(dur)}
 // tren: dizel lokomotif + yük vagonları (kapalı, tanker, konteyner). Her taşıt ayrı katı cisimdir, rayın eğimine göre oturur.
 const tr=new THREE.Group();g.add(tr);tr.visible=false;const kir=P('#b8322a',{shininess:40}),gri=P('#5d6266',{shininess:20}),koyu=P('#2b2e30',{shininess:20}),cam=MAT.glass;const cars=[];
 const boji=(w,z)=>{addBox(2.4,.5,2.6,koyu,0,.55,z,w);for(const dz of[-.8,.8])for(const s2 of[-1,1]){const t=addCyl(.46,.46,.16,14,koyu,s2*.78,.48,z+dz,w);t.rotation.z=Math.PI/2}};
 {const w=new THREE.Group();tr.add(w);rbox(3,3.3,17,.3,kir,0,2.75,0,w);addBox(2.9,.9,17.2,gri,0,1.15,0,w);addBox(2.6,.9,.05,cam,0,3.5,8.52,w);addBox(3.05,.25,17.1,P('#f2f2ee'),0,2.3,0,w);addBox(1.2,.5,4,koyu,0,4.6,-2,w);boji(w,-5.5);boji(w,5.5);
  for(const s2 of[-.9,.9]){const f=new THREE.Mesh(new THREE.CircleGeometry(.18,12),new THREE.MeshBasicMaterial({color:0xfff2c4}));f.position.set(s2,1.9,8.62);w.add(f)}const fa=new THREE.PointLight(0xfff0c8,1.2,60);fa.position.set(0,2,10);w.add(fa);w.userData.boy=17;cars.push(w)}
 const tip=[['kapali','#7b5d45'],['tanker','#c9ccd0'],['konteyner','#3b6ea5'],['kapali','#6a6f4e'],['tanker','#2f3133'],['konteyner','#b04a2e']];
 for(const[tt,c] of tip){const w=new THREE.Group();tr.add(w);addBox(2.8,.5,15,koyu,0,1.05,0,w);boji(w,-5.4);boji(w,5.4);const m=P(c,{shininess:30});
  if(tt==='kapali'){rbox(2.9,2.7,14.4,.15,m,0,2.7,0,w);addBox(.06,2.2,2.4,koyu,1.48,2.6,0,w)}else if(tt==='tanker'){const k=addCyl(1.35,1.35,13.6,18,m,0,2.6,0,w);k.rotation.x=Math.PI/2;addBox(.9,.3,.9,koyu,0,4,0,w)}else{addBox(2.44,2.59,6.06,m,0,2.6,-3.4,w);addBox(2.44,2.59,6.06,P('#8a8f6a',{shininess:30}),0,2.6,3.4,w)}
  w.userData.boy=15.5;cars.push(w)}
 cars.forEach(w=>{w.userData.dinamik=1;window.KATI_EK.push(w)});
 HZ={prof,cars,skor:bs,ri,g,kol,isik,train:tr,ang,nx,nz,st:'acik',s:-999,tetik:false,kol0:Math.PI/2*.95,kolA:Math.PI/2*.95}}
function trenDegiyor(H,hepsi){const AR=hepsi&&window.hareketliAraclar?hareketliAraclar():undefined;return H.cars.some(w=>w.visible&&aracaDegiyor(w,AR))}
window.trenDegiyor=h=>HZ?trenDegiyor(HZ,h):false;
/* geçit kapalı mı: bariyer iniyor ya da inik iken rayın yol indeksi, yoksa null */
window.GECIT=()=>HZ&&(HZ.st==='kapaniyor'||HZ.st==='kapali')?HZ.ri:null;
function hzAdim(dt,run){const H=HZ;const v=truck.v;const tf=(typeof roadF==='function')?roadF(v):roadIdx(v);const ds=ROADLEN/(NS-1);const ileri=(H.ri-tf)*ds;// tıra göre ileride +
 if(run&&phase==='drive'&&!H.tetik&&ileri>0&&ileri<140&&Math.abs(v.speed)>1){H.tetik=true;if(mode==='career'||Math.random()<.6){H.st='kapaniyor';H.t=0;H.s=-HAT_L+20;H.korna=0;toast(T('t_hzKapi'),'#ffb36b',3);if(HEAVY.includes(G.job.type)&&mode==='career')telsiz(T('hzTz'))}}
 if(H.st!=='acik'){H.t+=dt;if(run&&G&&G.deadline&&Math.abs(v.speed)<1&&ileri>0&&ileri<90)G.deadline+=dt;const f=Math.floor(H.t*2.4)%2;H.isik.forEach((l,k)=>l.material.color.setHex((k%2)===f?0xff2a1a:0x3a0c0c));if(H.t%0.84<dt)blip(1100,1100,.05)}
 const hedef=(H.st==='kapaniyor'||H.st==='kapali')?0:H.kol0;H.kolA+=clamp(hedef-H.kolA,-dt*.6,dt*.6);H.kol.forEach(a=>a.rotation.z=H.kolA);
 if(H.st==='kapaniyor'&&H.t>3.5){H.st='kapali'}
 if(H.st==='kapali'){H.train.visible=true;const s0=H.s;
  // tren katı cisimdir: önünde tır varsa içinden geçmez; acil fren yapar, çarpar ve yol açılana kadar bekler
  const koy=ss=>{let z=ss;for(const w of H.cars){const L=w.userData.boy;const zc=z-L/2;const p=sideAt(H.ri,zc),q=sideAt(H.ri,zc+1);const y=hatY(H,zc),y2=hatY(H,zc+1);w.position.set(p.x,y+.08,p.z);w.rotation.set(0,0,0);w.rotation.order='YXZ';w.rotation.y=Math.atan2(q.x-p.x,q.z-p.z);w.rotation.x=-Math.atan2(y2-y,1);w.visible=Math.abs(zc)<HAT_L-10;w.updateMatrixWorld(true);z-=L+.6}};
  H.s+=dt*(H.fren?6:24);koy(H.s);if(trenDegiyor(H,1)){const tirda=trenDegiyor(H);H.s=s0;koy(s0);if(!H.fren){H.fren=true;blip(330,260,.6)}if(tirda&&!H.kaza&&run){H.kaza=true;if(mode==='career')G.dmg=Math.min(100,G.dmg+20);toast(T('t_hzKaza'),'#ff5a5a',3);titre&&titre(2)}}
  else if(H.fren){koy(H.s+3);const hala=trenDegiyor(H,1);koy(H.s);if(!hala)H.fren=false}/* tır raydan çekilene kadar fren bırakılmaz */
  if(!H.korna&&H.s>-230){H.korna=1;blip(196,196,.8);setTimeout(()=>blip(196,196,1.1),1000)}// geçide yaklaşırken iki uzun korna
  if(Math.abs(H.s)<60&&H.s%6<dt*24)blip(140,120,.18);
  const kuy=H.s-H.cars.reduce((a,w)=>a+w.userData.boy+.6,0);if(kuy>16){if(H.st!=='aciliyor'){H.st='aciliyor';H.t2=0}}if(H.s>HAT_L+130){H.train.visible=false;H.cars.forEach(w=>w.visible=false)}}
 if(H.st==='aciliyor'&&H.train.visible&&H.s<=HAT_L+130){H.s+=dt*24;const koy2=ss=>{let z=ss;for(const w of H.cars){const L=w.userData.boy;const zc=z-L/2;const p=sideAt(H.ri,zc),q=sideAt(H.ri,zc+1);const y=hatY(H,zc),y2=hatY(H,zc+1);w.position.set(p.x,y+.08,p.z);w.rotation.order='YXZ';w.rotation.y=Math.atan2(q.x-p.x,q.z-p.z);w.rotation.x=-Math.atan2(y2-y,1);w.visible=Math.abs(zc)<HAT_L-10;w.updateMatrixWorld(true);z-=L+.6}};koy2(H.s);if(H.s>HAT_L+130){H.train.visible=false}}
 if(H.st==='aciliyor'){H.t2+=dt;if(H.t2>3){H.st='acik';H.isik.forEach(l=>l.material.color.setHex(0x3a0c0c));toast(T('t_hzAcik'),'#8ff0a4',1.8)}}
 // kural: kapalıyken dur çizgisini geçme
 if(run&&phase==='drive'&&H.st!=='acik'&&!H.ceza&&ileri<6.5&&ileri>-4&&v.speed>.4){H.ceza=true;if(mode==='career'){G.fines=(G.fines||0)+5000;G.ext.push(['k_hemzemin',-5000])}toast(T('t_hzCeza'),'#ff8a7f',3);titre&&titre(2)}
}

// ---------- manevra alanı ----------
function manKur(root){MR=null;if(!MAN.includes(REG))return;const i=NS-1-64-6;const ring=stopRing(0x3d8bff,T('manRing'));ringAt(ring,i);WOBJ.push(ring);MR={i,ring}}
function manAdim(dt){if(!MR||!G||mode!=='career'||!HEAVY.includes(G.job.type)||G.job.dummy){if(MR)MR.ring.visible=false;return}const v=truck.v,ti=roadIdx(v),sp=Math.abs(v.speed);MR.ring.visible=!G.manOk;
 if(G.manOk||G.manT!==undefined&&G.manT>=0)return;
 if(ti>MR.i+2&&v.speed>0){v.speed=0;if(G.warnT<=0){toast(T('t_manDur'),'#ffb36b',3);G.warnT=3}}
 if(Math.abs(ti-MR.i)<=3&&sp<.6){if(!(actFn&&actFn.man)){const fn=()=>{setAct(null);manBasla()};fn.man=1;fn.blade=1;setAct(T('a_man'),fn)}}
 else if(actFn&&actFn.man)setAct(null)}
function manBasla(){const v=truck.v;G.manT=0;if(G.deadline)G.deadline+=10;G.manX={i0:roadIdx(v)};showCtl&&showCtl(false);telsiz(T('manTz1'));const ds=ROADLEN/(NS-1);
 const bip=setInterval(()=>{if(G.manT<0||G.manT>9)return clearInterval(bip);blip(1250,1250,.08)},700);
 const t0=performance.now();const tick=()=>{if(!G||G.manT<0)return;const k=(performance.now()-t0)/1000;G.manT=k;const geri=k<4.5?k/4.5:k<6?1:1-(k-6)/3;const fi=G.manX.i0-geri*(26/ds);
  const i0=Math.floor(fi),f=fi-i0;const a=sideAt(i0,LANE),b=sideAt(i0+1,LANE);v.x=lerp(a.x,b.x,f);v.z=lerp(a.z,b.z,f);v.speed=0;
  if(k>5&&!G.manX.t2){G.manX.t2=1;telsiz(T('manTz2'))}
  if(k<9)requestAnimationFrame(tick);else{G.manOk=true;G.manT=-1;showCtl&&showCtl(true);MR.ring.visible=false;toast(T('t_manOk'),'#8ff0a4',2.4);blip(523,784,.3);G.bonus=(G.bonus||0)+5}};requestAnimationFrame(tick)}

// ---------- montaj ve türbin ilerlemesi ----------
function mtKayit(){SAVE.mont=SAVE.mont||{};return SAVE.mont[REG]=SAVE.mont[REG]||{k:0,n:0,b:0}}
function montajUygun(t){const m=mtKayit();const hub=m.h||m.b>0;if(t==='kule')return m.k<4;if(t==='nasel')return m.k>=4&&!m.n;if(t==='hub')return m.n&&!hub;if(t==='kanat')return m.n&&hub&&m.b<3;if(t==='ankraj')return !m.a;return false}
let KULE=null;
function kuleKur(){KULE=null;ISTIF.length=0;try{const s=world.site;if(!s)return;const ap=RS[NS-40];let ax=ap.x-SITE.x,az=ap.z-SITE.z;const al=Math.hypot(ax,az);ax/=al;az/=al;const px=-az,pz=ax;
 const u=-46,w=-10;const x=SITE.x+u*ax+w*px,z=SITE.z+u*az+w*pz;const g=new THREE.Group();g.position.set(x,SITE_Y,z);scene.add(g);WOBJ.push(g);
 const seg=[];for(let k=0;k<4;k++){const r0=2.3-k*.22,r1=2.3-(k+1)*.22;const m=addCyl(r1,r0,22,24,MAT.turb,0,25+k*22+11,0,g);m.visible=false;seg.push(m);const fl=addCyl(r1+.08,r1+.08,.3,24,MAT.flange,0,25+(k+1)*22,0,g);fl.visible=false;m.userData.fl=fl}
 const top=25+4*22;const nac=new THREE.Group();nac.position.set(0,top+2,0);g.add(nac);rbox(3.9,3.9,10.4,.6,MAT.turb,0,0,1.5,nac);nac.visible=false;
 const hub=new THREE.Group();hub.position.set(0,top+2,-4.6);g.add(hub);const hb=addCyl(1.6,2.2,3.4,20,MAT.turb,0,0,0,hub);hb.rotation.x=Math.PI/2;hub.visible=false;
 const bls=[];const bg=bladeGeom(56);for(let k=0;k<3;k++){const b=new THREE.Mesh(bg,MAT.turb);b.rotation.z=k*Math.PI*2/3;b.position.z=-1;hub.add(b);b.visible=false;bls.push(b)}
 // bir sonraki türbinin temel çukuru: ankraj kafesi buraya iner, sonra beton dökülmüş temel ve ankraj civataları görünür
 const tg=new THREE.Group();{const tx=x-px*44-ax*14,tz=z-pz*44-az*14;let ym=getH(tx,tz);for(let k=0;k<12;k++){const a=k/12*Math.PI*2;ym=Math.max(ym,getH(tx+Math.cos(a)*10,tz+Math.sin(a)*10))}tg.position.set(tx,ym-.15,tz)};scene.add(tg);WOBJ.push(tg);
 const cuk=new THREE.Group();tg.add(cuk);const toprak=P('#6b5540'),beton=P('#b4b0a6'),demir=P('#5a4a3c');
 addCyl(11,11.4,4,28,toprak,0,-1.85,0,cuk);addCyl(9.6,9.6,.1,28,P('#3b2f24'),0,.2,0,cuk);for(let k=0;k<10;k++){const a=k/10*Math.PI*2;const t=rbox(3.2,1.4,2.2,.4,toprak,Math.cos(a)*12.6,.6,Math.sin(a)*12.6,cuk);t.rotation.y=-a}
 const cit=P('#e8531f');for(let k=0;k<16;k++){const a=k/16*Math.PI*2;addCyl(.05,.05,1.1,5,cit,Math.cos(a)*15,.55,Math.sin(a)*15,cuk)}
 const tem=new THREE.Group();tg.add(tem);addCyl(9.5,10.4,4.2,32,beton,0,-.9,0,tem);addCyl(3,3.2,.9,28,beton,0,1.6,0,tem);for(let k=0;k<36;k++){const a=k/36*Math.PI*2;addCyl(.05,.05,.5,4,demir,Math.cos(a)*2.55,2.3,Math.sin(a)*2.55,tem)}
 KULE={g,seg,nac,hub,bls,top,cuk,tem,tg};kuleGoster()}catch(e){console.log('kule',e)}}
function kuleGoster(){if(!KULE)return;const m=mtKayit();KULE.seg.forEach((s,k)=>{s.visible=k<m.k;s.userData.fl.visible=k<m.k});KULE.nac.visible=!!m.n;KULE.hub.visible=!!(m.n&&(m.h||m.b>0));KULE.bls.forEach((b,k)=>b.visible=k<m.b);if(KULE.cuk){KULE.cuk.visible=!m.a;KULE.tem.visible=!!m.a}}
const ISTIF=[];
// taşıma hattı boyunca (yükün genişliğiyle) en yüksek katı nesnenin tepesi; hedef kule sayılmaz
function yolUstuEngel(a,b,parca,haric){parca.updateMatrixWorld(true);const sz=new THREE.Box3().setFromObject(parca).getSize(new THREE.Vector3());const w=Math.max(sz.x,sz.z)/2;let top=-1e9;const L=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(2,Math.ceil(L/3));
 for(let i=0;i<=n;i++){const t=i/n,x0=a.x+(b.x-a.x)*t,z0=a.z+(b.z-a.z)*t;for(const dx of[-w,0,w])for(const dz of[-w,0,w]){const x=x0+dx,z=z0+dz;const g=getH(x,z);top=Math.max(top,g);for(let y=g+.5;y<g+45;y+=1){const e=katiDunyaVar(x,y,z);if(e&&!(haric&&(()=>{for(let q=e.o;q;q=q.parent)if(q===haric)return true;return false})()))top=Math.max(top,y+1)}}}return top}
function montajBasla(tip,bitti,ind){if(!KULE){bitti();return}const m=mtKayit();phase='montaj';showHud(false);showCtl&&showCtl(true);
 const parca=new THREE.Group();scene.add(parca);let hedefY,hedef=new THREE.Vector3();
 const srcK={kasa:'raf',yedek:'raf'}[tip]||tip,src=CARGO[srcK];const gizle=src&&src.visible&&!['kasa','yedek'].includes(tip);
 const govde=()=>{if(ind&&src&&src.visible){// tırın üstündeki yükün kendisi kaldırılır
   const c=src.clone(true);c.position.set(0,0,0);c.rotation.set(0,0,0);c.scale.copy(src.scale);c.traverse(o=>{o.visible=true});parca.add(c);src.updateWorldMatrix(true,false);const q=new THREE.Quaternion();src.getWorldQuaternion(q);parca.quaternion.copy(q);parca.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(c),cc=b.getCenter(new THREE.Vector3());parca.worldToLocal(cc);c.position.sub(cc);return}
  if(tip==='kule'){const c=addCyl(2.1,2.3,22,24,MAT.turb,0,0,0,parca);if(ind)c.rotation.z=Math.PI/2}else if(tip==='nasel')rbox(3.9,3.9,10.4,.6,MAT.turb,0,0,0,parca);else if(tip==='kanat'){const b=new THREE.Mesh(bladeGeom(56),MAT.turb);b.rotation.x=Math.PI/2;if(ind)b.rotation.set(0,0,Math.PI/2);parca.add(b)}
  else{const src=CARGO[{kasa:'raf',yedek:'raf'}[tip]||tip];if(src){const c=src.clone(true);c.position.set(0,0,0);c.rotation.set(0,0,0);c.traverse(o=>{o.visible=true});parca.add(c)}else rbox(2.4,2.4,6,.1,P('#8a6b3c'),0,1.2,0,parca)}};govde();
 const KP=KULE.g.position;const ax=KP.x-SITE.x,az=KP.z-SITE.z;const al=Math.hypot(ax,az)||1;
 if(ind){const n=ISTIF.length%4;hedef.set(KP.x+(-az/al)*(34+n*7)+(ax/al)*14,KP.y+1.2,KP.z+(ax/al)*(34+n*7)+(az/al)*14)}
 else if(tip==='ankraj'){const t=KULE.tg.position;hedef.set(t.x,t.y-.4,t.z)}
 else{hedefY=tip==='kule'?25+m.k*22+11:KULE.top+2;if(tip==='hub')hedef.set(KP.x,KP.y+hedefY,KP.z-4.6);else hedef.set(KP.x,KP.y+hedefY,KP.z)}let bas=new THREE.Vector3(KULE.g.position.x+18,KULE.g.position.y+3,KULE.g.position.z+10);
 if(src&&src.visible){src.updateWorldMatrix(true,true);bas=new THREE.Box3().setFromObject(src).getCenter(new THREE.Vector3())}parca.position.copy(bas);
 if(gizle)src.visible=false;// yük dorseden kalkar
 parca.updateMatrixWorld(true);const pb=new THREE.Box3().setFromObject(parca),yari=(pb.max.y-pb.min.y)/2;
 if(ind){hedef.y=getH(hedef.x,hedef.z)+yari+.55}// (aşağıda boş yer aranır)
 const yatik=!ind&&tip==='kule';let q0=null,q1=null;
 if(ind){// istif sırasına paralel yatırılır
  q0=parca.quaternion.clone();const ek=new THREE.Vector3(0,0,1).applyQuaternion(q0),ek2=new THREE.Vector3(1,0,0).applyQuaternion(q0);const bz=new THREE.Box3().setFromObject(parca).getSize(new THREE.Vector3());const uz=Math.abs(ek.y)<.7?ek:ek2;const y0=Math.atan2(uz.x,uz.z),y1=Math.atan2(ax,az);q1=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),y1-y0).multiply(q0)}
 if(ind){// istif yeri: katı bir şeye (temel çukuru, toprak yığını, kule, eski istif) değmeyen ilk boş yer
  const pos0=parca.position.clone(),qq=parca.quaternion.clone();parca.quaternion.copy(q1||qq);const v=new THREE.Vector3(),B=new THREE.Box3();
  const dolu=()=>{parca.updateMatrixWorld(true);let d=false;parca.traverse(o=>{if(d||!o.isMesh||!o.geometry)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
    for(const fx of[0,.5,1])for(const fy of[0,.5,1])for(const fz of[0,.5,1]){v.set(b.min.x+(b.max.x-b.min.x)*fx,b.min.y+(b.max.y-b.min.y)*fy,b.min.z+(b.max.z-b.min.z)*fz).applyMatrix4(o.matrixWorld);for(let h=-.3;h<24;h+=1.5)if(katiDunyaVar(v.x,v.y+h,v.z)){d=true;return}/* iniş sütunu da boş olmalı */}});
   if(d)return true;B.setFromObject(parca).expandByScalar(.6);for(const x of ISTIF){if(new THREE.Box3().setFromObject(x).intersectsBox(B))return true}return false};
  let bul=false;for(let n=0;n<16&&!bul;n++){const sira=34+((ISTIF.length+n)%4)*7+Math.floor(n/4)*4,yan=14+Math.floor(n/4)*9*(n%8<4?1:-1);const hx=KP.x+(-az/al)*sira+(ax/al)*yan,hz=KP.z+(ax/al)*sira+(az/al)*yan;
   parca.position.set(hx,getH(hx,hz)+yari+.55,hz);if(!dolu()){hedef.copy(parca.position);bul=true}}
  // sıra doluysa kulenin çevresinde halka halka ara (vinç erişimi içinde)
  for(let r=30;r<=66&&!bul;r+=6)for(let a=0;a<24&&!bul;a++){const an=a/24*Math.PI*2;const hx=KP.x+Math.cos(an)*r,hz=KP.z+Math.sin(an)*r;const V=window.SAHA_VINC;if(V&&Math.hypot(hx-V.cg.getWorldPosition(new THREE.Vector3()).x,hz-V.cg.getWorldPosition(new THREE.Vector3()).z)>70)continue;
   parca.position.set(hx,getH(hx,hz)+yari+.55,hz);if(!dolu()){hedef.copy(parca.position);bul=true}}
  parca.position.copy(pos0);parca.quaternion.copy(qq)}if(yatik)parca.rotation.z=Math.PI/2;
 const hook=null;
 const ov=document.createElement('div');ov.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 70px);transform:translateX(-50%);z-index:40;background:rgba(12,16,14,.86);color:#fff;padding:10px 14px;border-radius:10px;text-align:center;font:600 14px "Barlow Condensed",sans-serif;max-width:88vw';document.body.appendChild(ov);
 MT={tip,ind:!!ind,p:0,parca,bas,hedef,hook,ov,ruz:7,bitti,durT:0,oto:false,yatik,yari,q0,q1,qs:null,qe:null,H:Math.max(bas.y,hedef.y)+(ind?7:5)};
 // taşıma yüksekliği: yol üstündeki her katı nesnenin üstünden
 MT.H=Math.max(MT.H,yolUstuEngel(bas,hedef,parca,KULE.g)+yari+1.5);
 if(!ind&&!yatik&&src&&['kanat','nasel','hub'].includes(tip)){/* montaj parçası dorsedeki yönüyle kalkar, havada montaj yönüne döner */const qy=new THREE.Quaternion();src.getWorldQuaternion(qy);const e2=new THREE.Euler().setFromQuaternion(qy,'YXZ');MT.qe=parca.quaternion.clone();MT.qs=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),e2.y).multiply(MT.qe);parca.quaternion.copy(MT.qs)}const ab=document.createElement('button');ab.className='btn sm';ab.id='mtAtla';ab.textContent=T('mtAtla');ab.style.cssText='position:fixed;left:calc(env(safe-area-inset-left) + 14px);top:calc(env(safe-area-inset-top) + 14px);z-index:41';ab.onclick=()=>{if(MT){MT.oto=true;ab.remove()}};document.body.appendChild(ab);MT.ab=ab;const KCT=window.camTarget;MT.kct=KCT;
 window.camTarget=()=>{const c=MT?MT.parca.position:hedef;return{p:new THREE.Vector3(KULE.g.position.x+70,KULE.g.position.y+60,KULE.g.position.z+70),l:new THREE.Vector3((KULE.g.position.x+c.x)/2,c.y*.6+KULE.g.position.y*.4,(KULE.g.position.z+c.z)/2)}};snapCam&&snapCam()}
function mtAdim(dt){const M=MT;M.ruz=clamp(M.ruz+(Math.random()-.5)*dt*6+Math.sin(G.t*.5)*dt*1.4,4,14.5);const ruzgar=M.ruz>12;
 const bas=input.gas>0||M.oto;if(M.oto)M.p=Math.min(1,M.p+dt*.5);else if(bas&&!ruzgar)M.p=Math.min(1,M.p+dt*(M.ind||M.tip==='ankraj'?.24:.15));if(bas&&ruzgar&&!M.oto){M.durT+=dt;if(M.durT>1.2&&mode==='career'){G.dmg=Math.min(100,G.dmg+dt*4)}}else M.durT=0;
 const k=M.p,e=t=>t<0?0:t>1?1:t*t*(3-2*t);const P2=new THREE.Vector3();
 const a=e(k/.25),b=e((k-.25)/.5),c=e((k-.75)/.25);// kaldır · taşı · indir
 P2.x=M.bas.x+(M.hedef.x-M.bas.x)*b;P2.z=M.bas.z+(M.hedef.z-M.bas.z)*b;P2.y=k<.75?M.bas.y+(M.H-M.bas.y)*a:M.H+(M.hedef.y-M.H)*c;
 const sal=(ruzgar?.09:.035)*M.ruz*Math.min(a,1-c);P2.x+=Math.sin(G.t*1.3)*sal;P2.z+=Math.cos(G.t*1.1)*sal*.6;// rüzgârda yük sallanır
 M.parca.position.copy(P2);if(M.yatik)M.parca.rotation.z=Math.PI/2*(1-e(k/.3));if(M.ind){if(M.q0)M.parca.quaternion.slerpQuaternions(M.q0,M.q1,b)}else if(M.qs&&k<.75)M.parca.quaternion.slerpQuaternions(M.qs,M.qe,e((k-.2)/.5));else M.parca.rotation.y=Math.sin(G.t*.8)*(ruzgar?.12:.04);
 try{vincYonel(P2,dt);const uc=bomUcu();const ust=P2.clone();ust.y+=M.yatik&&k<.3?2.4:M.yari;halatCiz(uc,ust)}catch(e){}
 M.ov.innerHTML=`<b style="letter-spacing:.06em">${T(M.ind?'mtH2':'mtH')}</b> · ${Math.round(k*100)}%<br><span style="opacity:.85">${T(M.ind?'mtTxtI':M.tip==='ankraj'?'mtTxtA':M.tip==='hub'?'mtTxtH':'mtTxt')}</span><br><b style="color:${ruzgar?'#ff8a7f':'#8ff0a4'}">${T('mtRuz').replace('{w}',M.ruz.toFixed(1))}</b>${ruzgar&&bas?'<br><b style="color:#ff8a7f">'+T('mtDur')+'</b>':''}`;
 if(k>=1){const m=mtKayit();let p='';if(M.ind)p=T('pIndir');else if(M.tip==='kule'){m.k++;p=T('pKule').replace('{k}',m.k)}else if(M.tip==='nasel'){m.n=1;p=T('pNasel')}else if(M.tip==='hub'){m.h=1;p=T('pHub')}else if(M.tip==='ankraj'){m.a=1;p=T('pAnk')}else{m.h=1;m.b++;p=m.b>=3?T('pTur'):T('pKanat').replace('{k}',m.b)}if(!M.ind)save();kuleGoster();
  if(mode==='career'&&!M.oto)G.ext.push(M.ind?['k_indirme',1000]:['k_montaj',2500]);if(M.ab)M.ab.remove();blip(392,523,.25);setTimeout(()=>blip(523,784,.3),220);toast(T(M.ind?'mtOkI':'mtOk').replace('{p}',p),'#8ff0a4',3);
  try{sahaVincHal()}catch(e){}
  if(M.ind){M.parca.position.copy(M.hedef);M.parca.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(M.parca),sz=bx.getSize(new THREE.Vector3()),cx=bx.getCenter(new THREE.Vector3());const uzX=sz.x>=sz.z,L2=Math.max(sz.x,sz.z);
   for(const f of[-.3,.3]){const t=addBox(uzX?.6:Math.min(3.2,sz.x+.4),.55,uzX?Math.min(3.2,sz.z+.4):.6,MAT.wood,0,0,0,scene);t.position.set(cx.x+(uzX?f*L2:0),getH(cx.x,cx.z)+.27,cx.z+(uzX?0:f*L2));M.parca.attach(t)}
   WOBJ.push(M.parca);ISTIF.push(M.parca);if(ISTIF.length>4){scene.remove(ISTIF.shift())}}else scene.remove(M.parca);M.ov.remove();window.camTarget=M.kct;const fn=M.bitti;MT=null;G.mont=true;setTimeout(fn,1400)}}
// türbin tamamlanınca rotor döner
const _st2=window.EXT&&EXT.step;

// ---------- bölge kurulumu ----------
const _br=buildRegion;buildRegion=function(r){_br(r);try{const root=new THREE.Group();scene.add(root);WOBJ.push(root);hzKur(root);manKur(root);kuleKur()}catch(e){console.log('santiye kur',e)}};
setInterval(()=>{try{if(KULE&&KULE.hub.visible&&mtKayit().b>=3)KULE.hub.rotation.z+=.012}catch(e){}},33);
window.SANTIYE={montajBasla:(t,f,i)=>montajBasla(t,f,i),mtAdim:(dt)=>mtAdim(dt),hzAdim:(dt,r)=>hzAdim(dt,r),ISTIF:()=>ISTIF,hzSkor:()=>HZ&&HZ.skor,HZ:()=>HZ,MR:()=>MR,KULE:()=>KULE,MT:()=>MT};
})();
