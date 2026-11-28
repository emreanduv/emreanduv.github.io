// Güzergâh etüdü ve deneme sürüşü (dummy run) + saha yolu gerçekçiliği (1.1 "Şantiye")
// Engeller dört renk koduyla: yeşil geçer, sarı küçük düzenleme, turuncu orta düzey, kırmızı büyük iş.
// Gerçek bir taşıma etüdünün yöntemi örnek alındı; ad, yer ve kişi bilgisi yok.
(function(){
'use strict';
const TRe={
 etH:'GÜZERGÂH ETÜDÜ · DENEME SÜRÜŞÜ',
 etTxt:'Pilot araç güzergâhı taradı. Engeller renk koduyla işaretlendi; işaretli olanlar yükten önce düzenlenir. Yol işlerini yatırımcı öder, sen yüzde 10 koordinasyon payı verirsin. Hazırlanan yol bu bölgede kalıcıdır.',
 etLej:'<b style="color:#6fd38a">Yeşil</b> geçer · <b style="color:#f2c230">Sarı</b> küçük düzenleme · <b style="color:#ff8a3c">Turuncu</b> orta düzey · <b style="color:#ff4a4a">Kırmızı</b> büyük iş',
 etHazir:'hazır',etTop:'Senin payın (yüzde 10)',etHep:'Yol bu bölgede hazır: bütün engeller daha önce düzenlendi.',
 e_dal:'Ağaç dalı yola sarkıyor',a_dal:'dal budama',
 e_levha:'Viraj içinde trafik levhası',a_levha:'levhayı geri al',
 e_tel:'Alçak telefon kablosu',a_tel:'kabloyu yükselt',
 e_genis:'Dar viraj, iç kenarda şev',a_genis:'yol genişletme ve dolgu',
 e_og:'Viraj içinde OG elektrik direği',a_og:'direği deplase et',
 e_tarama:'Kanat ucu tarama alanında çalı ve şev',a_tarama:'kazı ve budama, son yükseklik en çok 1,5 m',e_yanal:'Virajda yanal eğim',a_yanal:'yanal eğimi gider, tesviye',e_bom:'Tümsek: dorse bomu zemine sürtebilir',a_bom:'tümseği tıraşla, bom yüksekliğini ayarla',e_durak:'Otobüs durağı ve çardak',a_durak:'durağı ve çardağı kaldır',e_koykablo:'Köy içinde alçak kablolar',a_koykablo:'geçişte kabloları aparatla kaldıran ekip',e_elektrik:'Yolun üstünden geçen OG hattı',a_elektrik:'geçiş sırasında elektrik kesintisi (yatırımcı organize eder)',
 e_dolgu:'Dolgu alanı sıkıştırılmamış, girişte kot farkı',a_dolgu:'dolguyu sıkıştır, kot farkını düzelt',e_toprak:'Yol kenarında toprak birikintisi',a_toprak:'birikintiyi temizle',t_dolgu:'Sıkıştırılmamış dolguda dorse sarsıldı!',t_toprak:'Dorse toprak birikintisine sürttü!',
 etGizli:'Deneme sürüşü yapılmadı: masa başı etüt bazı engelleri kaçırmış olabilir. Menüden bu bölge için deneme sürüşü yapabilirsin.',etDS:'Deneme sürüşünde doğrulandı.',t_bilinmeyen:'Etütte görünmeyen bir engel! ',
 t_tarama:'Kanat ucu yol kenarındaki çalılara çarptı!',t_bom:'Dorse bomu tümseğe sürttü!',t_durak:'Yük otobüs durağının çatısına sürttü!',t_koykablo:'Yük köydeki alçak kabloları kopardı!',
 t_dal:'Kanat sarkan dala sürttü! Etütte budanmalıydı.',t_levha:'Yük viraj içindeki levhayı devirdi!',t_tel:'Yük alçak telefon kablosuna takıldı!',
 t_dur:'Dur! Önünde düzenlenmemiş engel var: {e}. Geçemezsin.',a_acil:'ACİL EKİP ÇAĞIR (−{p})',a_acil0:'ACİL EKİP ÇAĞIR (yatırımcı öder)',t_acilGel:'Ekip geldi, çalışıyor…',t_acilOk:'Engel giderildi, yol açık.',
 k_etut:'Yol düzenleme (güzergâh etüdü)',k_etutAcil:'Acil yol düzenleme',
 km:'km'};
const ENe={
 etH:'ROUTE SURVEY · DUMMY RUN',
 etTxt:'A pilot vehicle surveyed the route. Obstacles are colour-coded; the ticked ones are fixed before the load moves. The investor pays for road works; you pay a 10 percent coordination share. A prepared road stays prepared in this region.',
 etLej:'<b style="color:#6fd38a">Green</b> passable · <b style="color:#f2c230">Yellow</b> minor work · <b style="color:#ff8a3c">Orange</b> moderate work · <b style="color:#ff4a4a">Red</b> major work',
 etHazir:'ready',etTop:'Your share (10 percent)',etHep:'This road is ready: every obstacle was fixed earlier.',
 e_dal:'Tree branch over the road',a_dal:'trim branch',
 e_levha:'Traffic sign inside the bend',a_levha:'move the sign back',
 e_tel:'Low telephone cable',a_tel:'raise the cable',
 e_genis:'Narrow bend with a bank inside',a_genis:'widen and backfill',
 e_og:'MV power pole inside the bend',a_og:'relocate the pole',
 e_tarama:'Bushes and bank in the blade-tip sweep zone',a_tarama:'excavate and trim, final height at most 1.5 m',e_yanal:'Cross slope in the bend',a_yanal:'remove the cross slope, grade',e_bom:'Crest: the trailer boom may scrape',a_bom:'shave the crest, adjust boom height',e_durak:'Bus stop and shelter',a_durak:'remove the stop and shelter',e_koykablo:'Low cables in the village',a_koykablo:'crew lifts cables with a pole during the pass',e_elektrik:'MV line crossing the road',a_elektrik:'power cut during the pass (arranged by the investor)',
 e_dolgu:'Uncompacted fill, level step at the entry',a_dolgu:'compact the fill, fix the level step',e_toprak:'Soil heap at the roadside',a_toprak:'clear the heap',t_dolgu:'The trailer jolted on uncompacted fill!',t_toprak:'The trailer scraped a soil heap!',
 etGizli:'No dummy run yet: the desk survey may have missed some obstacles. You can do a dummy run for this region from the menu.',etDS:'Confirmed on the dummy run.',t_bilinmeyen:'An obstacle the survey missed! ',
 t_tarama:'The blade tip hit roadside bushes!',t_bom:'The trailer boom scraped the crest!',t_durak:'The load scraped the bus stop roof!',t_koykablo:'The load tore the low village cables!',
 t_dal:'The blade scraped an overhanging branch! It should have been trimmed.',t_levha:'The load knocked down the sign in the bend!',t_tel:'The load snagged a low telephone cable!',
 t_dur:'Stop! An unfixed obstacle ahead: {e}. You cannot pass.',a_acil:'CALL EMERGENCY CREW (−{p})',a_acil0:'CALL EMERGENCY CREW (investor pays)',t_acilGel:'Crew on site, working…',t_acilOk:'Obstacle cleared, the road is open.',
 k_etut:'Road works (route survey)',k_etutAcil:'Emergency road works',
 km:'km'};
Object.assign(STR.tr,TRe);Object.assign(STR.en,ENe);
HELP.tr.unshift(['Güzergâh etüdü ve deneme sürüşü','Kanat, kule ve nasel seferinde evrak ekranında etüt raporu çıkar. Pilot aracın bulduğu engeller dört renkle işaretlenir: yeşil geçer; sarı küçük iş (dal budama, levha taşıma, telefon kablosunu yükseltme); turuncu orta düzey iş (yol genişletme, dolgu, OG direği deplase); kırmızı büyük iş. İşaretli engeller yükten önce düzenlenir ve yol o bölgede hazır kalır. Yol işlerini yatırımcı öder, sen yüzde 10 pay verirsin. Düzenlenmeyen sarı engel yüke zarar verir; turuncu engelde durursun ve bedelin yüzde 30unu ödeyerek acil ekip çağırırsın.']);
HELP.en.unshift(['Route survey and dummy run','On blade, tower and nacelle jobs the papers screen shows a route survey. Obstacles found by the pilot vehicle are colour-coded: green passes; yellow is minor work (trim branches, move signs, raise phone cables); orange is moderate work (widen the road, backfill, relocate an MV pole); red is major work. Ticked obstacles are fixed before the load moves and the road stays ready in that region. An unfixed yellow obstacle damages the load; the investor pays for road works and you pay a 10 percent share; at an orange one you stop and pay 30 percent for an emergency crew.']);

// tür: renk, maliyet, hasar, durdurur mu
const TUR={dal:{c:'sari',p:4000,d:4},levha:{c:'sari',p:3000,d:3},tel:{c:'sari',p:6000,d:6},bom:{c:'sari',p:5000,d:5},durak:{c:'sari',p:7000,d:5},koykablo:{c:'sari',p:8000,d:7},dolgu:{c:'sari',p:9000,d:5},toprak:{c:'sari',p:2500,d:3},genis:{c:'turuncu',p:45000,dur:1},og:{c:'turuncu',p:60000,dur:1},tarama:{c:'turuncu',p:30000,dur:1},yanal:{c:'turuncu',p:35000,dur:1},elektrik:{c:'turuncu',p:12000,dur:1}};
const RK={sari:'#f2c230',turuncu:'#ff8a3c',kirmizi:'#ff4a4a',yesil:'#6fd38a'};
const AGIR=['kanat','kule','nasel'];const PAY=.1,ACIL=.3;// bedeller seferin navlununa oranlanır: planlı düzenleme payı en çok navlunun %12'si, acil ekip tek seferde en çok %5'i, toplamda %12'si (fazlasını yatırımcı üstlenir)
const navlun=()=>(G&&G.job&&G.job.fee)||60000;
const olcek=()=>{const top=EN.reduce((a,o)=>a+TUR[o.tip].p*PAY,0);return top>0?Math.min(1,navlun()*.12/top):1};
const pay=o=>Math.max(100,Math.round(TUR[o.tip].p*PAY*olcek()/100)*100);
const acilBedel=t=>{const harc=(G.ext||[]).filter(c=>c[0]==='k_etutAcil').reduce((a,c)=>a-c[1],0);const kalan=Math.max(0,navlun()*.12-harc);return Math.round(Math.min(t.p*ACIL,navlun()*.05,kalan)/100)*100};
let EN=[],DEK=null;

function rng(s){let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return(h>>>0)/4294967296}}
function egri(i){const a=RS[Math.max(0,i-6)],b=RS[i],c=RS[Math.min(NS-1,i+6)];const ux=b.x-a.x,uz=b.z-a.z,vx=c.x-b.x,vz=c.z-b.z;const an=Math.atan2(ux*vz-uz*vx,ux*vx+uz*vz);
 const mx=(a.x+c.x)/2-b.x,mz=(a.z+c.z)/2-b.z;const s=sideAt(i,1);const ic=((s.x-b.x)*mx+(s.z-b.z)*mz)>0?1:-1;return{k:Math.abs(an),ic}}
function yasak(i){if(VZ&&i>VZ.v0-80&&i<VZ.wi+10)return true;if(CZ&&CZ.ci&&Math.abs(i-CZ.ci)<20)return true;// cep (yakıt, kantar) giriş-çıkışına engel konmaz
 if(typeof PORTOPS!=='undefined'&&PORTOPS.mola&&Math.abs(i-PORTOPS.mola.ri)<25)return true;if(typeof PLAN!=='undefined'&&PLAN&&PLAN.ki&&Math.abs(i-PLAN.ki)<25)return true;return false}
function dsYapildi(){return !!(SAVE.ds&&SAVE.ds[REG])}
function gizli(o){if(dsYapildi()||TUR[o.tip].c!=='sari')return false;let h=0;for(const ch of o.id+REG)h=(h*31+ch.charCodeAt(0))>>>0;return h%4===0}
function hazir(){const s=(SAVE.etut&&SAVE.etut[REG])||[];return new Set(s)}

function agacG(g,x,z,ang,side,uzan){const k=P('#5a4330',{shininess:4}),y=P('#3f6b33',{shininess:6});const t=new THREE.Group();t.position.set(x,getH(x,z),z);t.rotation.y=ang;g.add(t);
 addCyl(.28,.42,5,7,k,0,2.5,0,t);const cr=new THREE.Mesh(new THREE.IcosahedronGeometry(3.2,1),y);cr.position.set(0,6.4,0);cr.castShadow=true;t.add(cr);
 const dal=new THREE.Group();t.add(dal);const L=uzan;const b=addCyl(.12,.2,L,6,k,0,0,0,dal);b.rotation.z=Math.PI/2;b.position.set(-side*L/2,5.6,0);
 const yp=new THREE.Mesh(new THREE.IcosahedronGeometry(1.7,1),y);yp.position.set(-side*(L-.6),5.3,0);yp.scale.set(1.3,.7,1);dal.add(yp);
 const kut=new THREE.Group();t.add(kut);for(let n=0;n<3;n++){const l=addCyl(.13,.13,2.2,6,k,0,.15+n*.24,0,kut);l.rotation.z=Math.PI/2;l.position.set(1.3*side,.15+n*.22,(n-1)*.3)}
 return{bad:dal,ok:kut}}
function levhaG(g,p,ang){const t=new THREE.Group();t.position.set(p.x,getH(p.x,p.z),p.z);t.rotation.y=ang;g.add(t);addBox(.08,2.4,.08,MAT.steel,0,1.2,0,t);
 const tx=ctex(128,128,(q,w,h)=>{q.fillStyle='#fff';q.beginPath();q.moveTo(64,8);q.lineTo(122,116);q.lineTo(6,116);q.closePath();q.fill();q.strokeStyle='#d0141a';q.lineWidth=12;q.stroke();q.fillStyle='#111';q.font='900 54px sans-serif';q.textAlign='center';q.fillText('!',64,104)});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.9),new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide,transparent:true}));m.position.y=2.5;t.add(m);return t}
function direk(g,p,h,mat,kol){const t=new THREE.Group();t.position.set(p.x,getH(p.x,p.z),p.z);t.rotation.y=p.ang;g.add(t);addCyl(.14,.2,h,7,mat,0,h/2,0,t);if(kol)addBox(2.2,.12,.12,MAT.steel,0,h-.4,0,t);return t}
// yuk = telin yol üstündeki en alçak noktasının şeridin en yüksek yerine göre yüksekliği (sarkma dahil)
function telG(g,i,yuk){const a=sideAt(i,-8.5),b=sideAt(i,8.5);const ah=getH(a.x,a.z),bh=getH(b.x,b.z);const md=P('#6b5236',{shininess:4});
 const SAG=.6,alt=yolTepe(i)+yuk,HY=Math.max(alt+SAG,ah+1.5,bh+1.5);
 const grp=new THREE.Group();g.add(grp);direk(grp,a,HY-ah+.8,md);direk(grp,b,HY-bh+.8,md);grp.userData.alt=alt;
 const pts=[];for(let k=0;k<=12;k++){const f=k/12;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*f,HY-Math.sin(f*Math.PI)*SAG,a.z+(b.z-a.z)*f))}
 const tb=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.025,4,false),new THREE.MeshBasicMaterial({color:0x111111}));grp.add(tb);return grp}
function sevG(g,i,ic,off){const t=new THREE.Group();g.add(t);const m=P('#7d6a52',{shininess:3});for(let k=-3;k<=3;k++){const p=sideAt(clamp(i+k,1,NS-2),ic*(off+Math.abs(k)*.35));const r=new THREE.Mesh(new THREE.DodecahedronGeometry(1.6+Math.random()*.6,0),m);r.position.set(p.x,getH(p.x,p.z)+.6,p.z);r.scale.y=.7;r.castShadow=true;t.add(r)}return t}
function cakilG(g,i,ic){const t=new THREE.Group();g.add(t);const m=new THREE.MeshStandardMaterial({color:0x9b8f7c,roughness:1,polygonOffset:true,polygonOffsetFactor:-3});
 const pos=[],idx=[];for(let k=-6;k<=6;k++){const j=clamp(i+k,1,NS-2);const w=4.6+(1-Math.abs(k)/6)*3.2;const a=sideAt(j,ic*4.2),b=sideAt(j,ic*w);pos.push(a.x,getH(a.x,a.z)+.24,a.z,b.x,getH(b.x,b.z)+.16,b.z);if(k<6){const n=(k+6)*2;idx.push(n,n+1,n+2,n+1,n+3,n+2)}}
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setIndex(idx);ge.computeVertexNormals();const me=new THREE.Mesh(ge,m);me.receiveShadow=true;t.add(me);return t}

function kur(){EN=[];const g=new THREE.Group();scene.add(g);WOBJ.push(g);const R=rng('etut-'+REG);const lo=70,hi=NS-1-64-14;
 const egr=[];for(let i=lo;i<hi;i+=3){if(yasak(i))continue;const e=egri(i);egr.push([i,e.k,e.ic])}egr.sort((a,b)=>b[1]-a[1]);
 const al=(n,uz)=>{const out=[];for(const e of egr){if(out.length>=n)break;if(EN.some(o=>Math.abs(o.i-e[0])<uz)||out.some(o=>Math.abs(o[0]-e[0])<uz))continue;out.push(e)}return out};
 let id=0;const ekle=(tip,i,ic)=>{const o={id:tip+'-'+(id++),tip,i,ic,km:(i/(NS-1)*ROADLENS[REG]/1000)};EN.push(o);return o};
 for(const e of al(2,30))ekle('genis',e[0],e[2]);
 for(const e of al(2,30))ekle('tarama',e[0],e[2]);
 for(const e of al(1,30))ekle('og',e[0],e[2]);
 for(const e of al(1,30))ekle('yanal',e[0],e[2]);
 for(const e of al(1,25))ekle('levha',e[0],e[2]);
 const rast=(tip,n)=>{for(let k=0;k<n;k++)for(let t=0;t<60;t++){const i=Math.floor(lo+R()*(hi-lo));if(yasak(i)||EN.some(o=>Math.abs(o.i-i)<20))continue;ekle(tip,i,R()<.5?1:-1);break}};
 rast('dal',2);rast('tel',1);rast('bom',1);rast('durak',1);rast('elektrik',1);rast('dolgu',1);rast('toprak',1);
 if(VZ){const i=clamp(VZ.v0-90,lo,hi);if(!EN.some(o=>Math.abs(o.i-i)<12))ekle('koykablo',i,1)}
 EN.sort((a,b)=>a.i-b.i);
 for(const o of EN){const p=sideAt(o.i,o.ic*7.6),ic=o.ic;
  if(o.tip==='dal'){const q=sideAt(o.i,ic*9.4);const r=agacG(g,q.x,q.z,q.ang,ic,6.2);o.bad=r.bad;o.ok=r.ok}
  else if(o.tip==='levha'){o.bad=levhaG(g,sideAt(o.i,ic*5.1),p.ang);o.ok=levhaG(g,sideAt(o.i,ic*9.5),p.ang)}
  else if(o.tip==='tel'){o.bad=telG(g,o.i,6.0);o.ok=telG(g,o.i,8.6)}
  else if(o.tip==='genis'){o.bad=sevG(g,o.i,ic,5.4);o.ok=new THREE.Group();g.add(o.ok);o.ok.add(cakilG(g,o.i,ic));o.ok.add(sevG(g,o.i,ic,9.2))}
  else if(o.tip==='tarama'){const ca=P('#4f6b34',{shininess:4});const mk=(h)=>{const t=new THREE.Group();g.add(t);for(let k=-4;k<=4;k++){const q=sideAt(clamp(o.i+k,1,NS-2),ic*(6.4+Math.abs(k)*.2));const b=new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),ca);b.scale.set(1.4,h,1.4);b.position.set(q.x,getH(q.x,q.z)+h*.6,q.z);t.add(b)}return t};o.bad=mk(2.6);o.ok=mk(.6)}
  else if(o.tip==='durak'){const mk=(off)=>{const q=sideAt(o.i,ic*off);const t=new THREE.Group();t.position.set(q.x,getH(q.x,q.z),q.z);t.rotation.y=q.ang;g.add(t);const m=P('#3a6fb0',{shininess:30}),gl=MAT.glass;for(const x of[-1.4,1.4])addBox(.08,2.5,.08,MAT.steel,x,1.25,0,t);addBox(3.1,.1,1.5,m,0,2.55,.2,t);addBox(2.8,1.6,.04,gl,0,1.4,-.5,t);addBox(2.4,.08,.4,P('#7a5a3a'),0,.5,-.25,t);return t};o.bad=mk(5.7);o.ok=new THREE.Group();g.add(o.ok)}
  else if(o.tip==='koykablo'){o.bad=telG(g,o.i,5.85);o.ok=telG(g,o.i,7.4)}
  else if(o.tip==='elektrik'){const grp=telG(g,o.i,9.5);o.bad=null;o.ok=grp}
  else if(o.tip==='dolgu'){const mk=(c,h)=>{const t=new THREE.Group();g.add(t);const m=P(c,{shininess:2});for(let k=-3;k<=3;k++){const q=sideAt(clamp(o.i+k,1,NS-2),ic*6.4);addBox(4.4,h,3.6,m,0,0,0,t).position.set(q.x,getH(q.x,q.z)+h/2-.1,q.z)}return t};o.bad=mk('#a08462',.7);o.ok=mk('#8f7f6a',.25)}
  else if(o.tip==='toprak'){const mk=()=>{const t=new THREE.Group();g.add(t);const m=P('#7a6248',{shininess:2});for(let k=-1;k<=1;k++){const q=sideAt(clamp(o.i+k*2,1,NS-2),ic*5.0);const r=new THREE.Mesh(new THREE.DodecahedronGeometry(1.3,0),m);r.scale.set(1.4,.6,1.8);r.position.set(q.x,getH(q.x,q.z)+.3,q.z);t.add(r)}return t};o.bad=mk();o.ok=null}
  else if(o.tip==='bom'||o.tip==='yanal'){o.bad=null;o.ok=null}
  else if(o.tip==='og'){const c=P('#b8b6ae',{shininess:6});o.bad=direk(g,sideAt(o.i,ic*5),9,c,1);o.ok=direk(g,sideAt(o.i,ic*10.5),9,c,1)}
  if(o.bad)o.bad.userData.etutKotu=1}
 gecirgenYap();gorsel();dekor(g)}
function gecirgenYap(){}// etüt engelleri de katı: yalnız havadaki teller (yükseklik kuralıyla) ve kanadın taşan ucu (etüt hasar kuralıyla) ayrı işlenir
function gorsel(){const H=hazir();const free=typeof mode!=='undefined'&&mode!=='career';for(const o of EN){const f=free||H.has(o.id)||(G&&G.etutSec&&G.etutSec.has(o.id)&&G.docs)||o.acil;if(o.bad)o.bad.visible=!f;if(o.ok)o.ok.visible=!!f||o.bad===null}}

// ---------- saha yolu ve yayla dekoru ----------
function pilon(g,x,z,ang,h){const t=new THREE.Group();t.position.set(x,getH(x,z),z);t.rotation.y=ang;g.add(t);const m=P('#9aa0a4',{shininess:20});
 for(const[a,b]of[[1,1],[1,-1],[-1,1],[-1,-1]]){const l=addBox(.14,h,.14,m,a*1.4,h/2,b*1.4,t);l.rotation.z=-a*.07;l.rotation.x=b*.07}
 for(let k=1;k<6;k++){const y=k*h/6,w=1.4*(1-y/h*.75)*2;addBox(w,.07,.07,m,0,y,1.4*(1-y/h*.75),t);addBox(w,.07,.07,m,0,y,-1.4*(1-y/h*.75),t);addBox(.07,.07,w,m,1.4*(1-y/h*.75),y,0,t);addBox(.07,.07,w,m,-1.4*(1-y/h*.75),y,0,t)}
 addBox(7,.18,.18,m,0,h*.82,0,t);addBox(5,.18,.18,m,0,h*.95,0,t);return{x,z,y:getH(x,z)+h*.82,ang}}
function kablo(g,a,b,dx){const m=new THREE.MeshBasicMaterial({color:0x2b2b2b});for(const s of dx){const c=Math.cos(a.ang),sn=Math.sin(a.ang),c2=Math.cos(b.ang),s2=Math.sin(b.ang);
 const A=new THREE.Vector3(a.x+s*c,a.y,a.z-s*sn),B=new THREE.Vector3(b.x+s*c2,b.y,b.z-s*s2);const pts=[];for(let k=0;k<=10;k++){const f=k/10;pts.push(new THREE.Vector3(A.x+(B.x-A.x)*f,A.y+(B.y-A.y)*f-Math.sin(f*Math.PI)*3,A.z+(B.z-A.z)*f))}
 g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),12,.04,3,false),m))}}
function gsm(g,x,z,h){const t=new THREE.Group();t.position.set(x,getH(x,z),z);g.add(t);const m=P('#c9ccd0',{shininess:30});
 for(const[a,b]of[[1,1],[1,-1],[-1,1],[-1,-1]])addBox(.1,h,.1,m,a*.45,h/2,b*.45,t);for(let y=1.5;y<h;y+=1.6){const d=addBox(1.27,.05,.05,m,0,y,.45,t);d.rotation.z=.9;const e=addBox(1.27,.05,.05,m,0,y,-.45,t);e.rotation.z=-.9}
 for(let k=0;k<3;k++){const a=k*2.1;addBox(.35,1.3,.1,P('#eeeeee'),Math.cos(a)*.7,h-.8,Math.sin(a)*.7,t).rotation.y=-a}}
function sogut(g,x,z){const k=P('#6e5a48',{shininess:3});const t=new THREE.Group();t.position.set(x,getH(x,z),z);g.add(t);addCyl(.22,.3,1.6,6,k,0,.8,0,t);
 for(let n=0;n<14;n++){const a=n/14*6.28,l=1.8+Math.random()*1.4;const d=addCyl(.03,.06,l,4,k,0,0,0,t);d.position.set(Math.cos(a)*.35,1.6+l*.42,Math.sin(a)*.35);d.rotation.z=Math.cos(a)*.55;d.rotation.x=-Math.sin(a)*.55}}
function levhaT(g,p,ang,ciz){const t=new THREE.Group();t.position.set(p.x,getH(p.x,p.z),p.z);t.rotation.y=ang;g.add(t);addBox(.07,2.3,.07,MAT.steel,0,1.15,0,t);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(.85,.85),new THREE.MeshBasicMaterial({map:ctex(128,128,ciz),side:THREE.DoubleSide,transparent:true}));m.position.y=2.35;t.add(m);return t}
const UCGEN=(ters,ic)=>(q,w,h)=>{q.fillStyle='#fff';q.beginPath();if(ters){q.moveTo(6,12);q.lineTo(122,12);q.lineTo(64,120)}else{q.moveTo(64,8);q.lineTo(122,116);q.lineTo(6,116)}q.closePath();q.fill();q.strokeStyle='#d0141a';q.lineWidth=13;q.stroke();if(ic)ic(q)};
const KAYGAN=q=>{q.strokeStyle='#111';q.lineWidth=4;q.fillStyle='#111';q.fillRect(48,60,32,16);q.beginPath();q.moveTo(44,96);q.bezierCurveTo(54,84,70,108,84,92);q.stroke();q.beginPath();q.moveTo(50,104);q.bezierCurveTo(60,92,74,114,88,100);q.stroke()};
const OK=(sag)=>(q,w,h)=>{q.fillStyle='#1d3f8a';q.fillRect(0,0,w,h);q.fillStyle='#fff';q.beginPath();if(sag){q.moveTo(34,24);q.lineTo(92,64);q.lineTo(34,104);q.lineTo(52,64)}else{q.moveTo(94,24);q.lineTo(36,64);q.lineTo(94,104);q.lineTo(76,64)}q.closePath();q.fill()};
const KOYLER={marmara:'Yeniköy',ege:'Kızılcaköy',sivas:'Gökçeyurt Köyü',trakya:'Karaağaç Köyü',canakkale:'Akpınar Köyü',hatay:'Yeşilova Köyü',karadeniz:'Çamlıca Köyü',kapadokya:'Kayabaşı Köyü'};
function koyLevha(g,p,ang,ad){const t=new THREE.Group();t.position.set(p.x,getH(p.x,p.z),p.z);t.rotation.y=ang;g.add(t);for(const x of[-.7,.7])addBox(.07,2.1,.07,MAT.steel,x,1.05,0,t);
 const tx=ctex(512,112,(q,w,h)=>{q.fillStyle='#f4f4f2';q.fillRect(0,0,w,h);q.strokeStyle='#111';q.lineWidth=6;q.strokeRect(6,6,w-12,h-12);q.fillStyle='#111';q.font='800 52px "Barlow Condensed",sans-serif';q.textAlign='left';q.fillText(ad.toLocaleUpperCase('tr-TR'),26,74);q.beginPath();q.moveTo(w-70,30);q.lineTo(w-22,56);q.lineTo(w-70,82);q.closePath();q.fill()});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.48),new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide}));m.position.y=2.0;t.add(m)}
function karYigin(g,i,s){const m=P('#f2f5f7',{shininess:10});const p=sideAt(i,s*5.4);const r=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),m);r.scale.set(.9+Math.random()*.6,.28+Math.random()*.18,2.6+Math.random()*1.8);r.position.set(p.x,getH(p.x,p.z)+.05,p.z);r.rotation.y=p.ang;g.add(r)}
function menfez(g,i){const p=sideAt(i,5.6);const t=new THREE.Group();t.position.set(p.x,getH(p.x,p.z)-.2,p.z);t.rotation.y=p.ang;g.add(t);const c=P('#a7a59d',{shininess:5});addBox(.35,.9,2.2,c,0,.45,0,t);const b=addCyl(.45,.45,.4,10,P('#2a2a28'),.1,.45,0,t);b.rotation.z=Math.PI/2}

function dekor(g){const R=rng('dek-'+REG);const a=NS-1-64,b=NS-1;const kar=!!(RG().snow);
 // saha yolu: kar yığınları (karlı bölgede), menfez, levhalar
 for(let i=a+2;i<b-2;i+=3){if(kar&&R()<.7)karYigin(g,i,R()<.5?1:-1)}
 menfez(g,a+Math.floor((b-a)*.4));
 const gi=sideAt(a-4,6.4);levhaT(g,gi,gi.ang+Math.PI,UCGEN(true));
 const ki=sideAt(a+8,-6.4);levhaT(g,ki,ki.ang+Math.PI,UCGEN(false,KAYGAN));
 for(let i=a+6;i<b-6;i+=2){const e=egri(i);if(e.k>.32){for(let k=0;k<3;k++){const p=sideAt(i+k*2,-e.ic*6.2);levhaT(g,p,p.ang+Math.PI,OK(e.ic<0))}i+=14}}
 // köy yön levhası (saha yoluna sapmadan önce)
 const kp=sideAt(a-14,-7);koyLevha(g,kp,kp.ang+Math.PI/2,KOYLER[REG]||'Yeniköy');
 // söğüt kümeleri
 for(let n=0;n<5;n++){const i=Math.floor(a-120+R()*150);const s=R()<.5?1:-1;const p=sideAt(clamp(i,2,NS-2),s*(14+R()*10));for(let m=0;m<3;m++)sogut(g,p.x+(R()-.5)*5,p.z+(R()-.5)*5)}
 // iletim hattı: yola koşut pilon dizisi
 const PL=[];for(let i=Math.max(4,a-200);i<b-4;i+=22){const p=sideAt(i,-46);PL.push(pilon(g,p.x,p.z,p.ang,24))}
 for(let k=0;k+1<PL.length;k++)kablo(g,PL[k],PL[k+1],[-3.2,0,3.2]);
 // GSM direkleri: sahanın yanındaki tepede
 const gp=sideAt(b-20,60);gsm(g,gp.x,gp.z,26);gsm(g,gp.x+9,gp.z+4,22)}

// ---------- kur / adım ----------
const _br=buildRegion;buildRegion=function(r){_br(r);try{kur()}catch(e){console.log('etut',e)}};
const _rs=resetGame;resetGame=function(m,n){_rs(m,n);if(!G)return;G.etutSec=null;EN.forEach(o=>{o.vur=0;o.acil=0});gorsel()};

function agirIs(){return G&&G.job&&typeof mode!=='undefined'&&mode==='career'&&AGIR.includes(G.job.type)&&!G.job.dummy}
function acik(o){const H=hazir();return !(H.has(o.id)||o.acil)}
addEventListener('load',()=>{
 // evrak ekranı: etüt raporu
 const _od=openDocs;openDocs=function(){_od();try{if(!agirIs()||!EN.length||G.freeDocs)return;const H=hazir();if(!G.etutSec)G.etutSec=new Set(EN.filter(o=>!H.has(o.id)&&!gizli(o)).map(o=>o.id));
  const rows=EN.filter(o=>!gizli(o)||H.has(o.id)).map(o=>{const t=TUR[o.tip],h=H.has(o.id);return`<label class="kv" style="align-items:center;gap:6px;cursor:pointer"><span style="display:flex;align-items:center;gap:7px;text-align:left"><i style="width:11px;height:11px;border-radius:50%;flex:none;background:${h?RK.yesil:RK[t.c]}"></i><span>${T('e_'+o.tip)} <small style="opacity:.7">· ${o.km.toFixed(1)} ${T('km')} · ${h?T('etHazir'):T('a_'+o.tip)}</small></span></span>${h?'<b style="color:#8ff0a4">✓</b>':`<span style="display:flex;align-items:center;gap:6px;white-space:nowrap"><b class="neg">−${fmt(pay(o))}</b><input type="checkbox" data-et="${o.id}" ${G.etutSec.has(o.id)?'checked':''} style="width:18px;height:18px"></span>`}</label>`}).join('');
  const hep=EN.every(o=>H.has(o.id));
  const box=document.createElement('div');box.id='etutB';box.style.cssText='text-align:left;margin:10px 0 4px;padding:8px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:rgba(0,0,0,.18)';
  box.innerHTML=`<div style="font-weight:800;letter-spacing:.04em;margin-bottom:4px">${T('etH')}</div><div class="small" style="margin-bottom:6px;opacity:.85">${hep?T('etHep'):T('etTxt')}</div>${!hep&&!dsYapildi()?`<div class="small" style="margin-bottom:6px;color:#ffb36b">${T('etGizli')}</div>`:(dsYapildi()&&!hep?`<div class="small" style="margin-bottom:6px;color:#8ff0a4">${T('etDS')}</div>`:'')}<div class="small" style="margin-bottom:6px">${T('etLej')}</div>${rows}<div class="kv" id="etTopR"><span>${T('etTop')}</span><b id="etTop"></b></div>`;
  const db=$('docsB');const eski=document.getElementById('etutB');if(eski)eski.remove();db.appendChild(box);
  const top=()=>{let s=0;G.etutSec.forEach(id=>{const o=EN.find(x=>x.id===id);if(o&&!H.has(id))s+=pay(o)});$('etTop').textContent=s?'−'+fmt(s):fmt(0)};top();
  box.querySelectorAll('input[data-et]').forEach(c=>c.onchange=()=>{if(c.checked)G.etutSec.add(c.dataset.et);else G.etutSec.delete(c.dataset.et);top()})}catch(e){console.log('etut docs',e)}};
 const _ok=$('docsOk').onclick;$('docsOk').onclick=function(){try{if(agirIs()&&G.etutSec&&!G.freeDocs){const H=hazir();let s=0;const yeni=[];G.etutSec.forEach(id=>{const o=EN.find(x=>x.id===id);if(o&&!H.has(id)){s+=pay(o);yeni.push(id)}});
   if(s){G.ext.push(['k_etut',-s]);SAVE.etut=SAVE.etut||{};SAVE.etut[REG]=[...H,...yeni];save()}gorsel()}}catch(e){console.log(e)}return _ok.apply(this,arguments)};
 // sürüş: düzenlenmemiş engel
 const _st=EXT.step;EXT.step=function(dt,run){const r=_st?_st(dt,run):undefined;try{if(!run||phase!=='drive'||!agirIs()||!EN.length)return r;const v=truck.v,ti=roadIdx(v);
  for(const o of EN){if(!acik(o))continue;const t=TUR[o.tip];
   if(t.dur){if(ti>=o.i-6&&ti<=o.i&&!o.acil){if(v.speed>0)v.speed=0;if(G.deadline)G.deadline+=dt;if(!o.vur){o.vur=1;titre(1);toast((gizli(o)?T('t_bilinmeyen'):'')+T('t_dur').replace('{e}',T('e_'+o.tip)),'#ff8a3c',3.2);}
     if(!(actFn&&actFn.etut)){const p=acilBedel(t);const fn=()=>{setAct(null);if(p>0)G.ext.push(['k_etutAcil',-p]);toast(T('t_acilGel'),'#ffe08a',2.4);blip(300,420,.3);setTimeout(()=>{o.acil=1;gorsel();toast(T('t_acilOk'),'#8ff0a4',2.4);blip(523,784,.3)},4500)};fn.etut=1;setAct(p>0?T('a_acil').replace('{p}',fmt(p)):T('a_acil0'),fn)}}}
   else if(!o.vur&&Math.abs(ti-o.i)<=2&&Math.abs(v.speed)>.5){if((o.tip==='tel'||o.tip==='koykablo')&&o.bad&&o.bad.userData.alt!=null&&aracTepe()<o.bad.userData.alt-.05)continue;o.vur=1;G.dmg=Math.min(100,G.dmg+t.d);titre(1);toast((gizli(o)?T('t_bilinmeyen'):'')+T('t_'+o.tip),'#ff8a7f',3);if(o.tip==='levha'&&o.bad)o.bad.rotation.z=1.2}}}catch(e){}return r};
 // mini harita: keşiften sonra açık engeller
 const _mn=EXT.mini;EXT.mini=function(c,v,sc,S){if(_mn)_mn(c,v,sc,S);try{if(!G||!G.kesif||!agirIs())return;for(const o of EN){if(!acik(o))continue;const p=RS[o.i];const x=(p.x-v.x)*sc,z=(p.z-v.z)*sc;if(Math.hypot(x,z)>S/2-6)continue;c.fillStyle=RK[TUR[o.tip].c];c.beginPath();c.arc(x,z,4.5,0,7);c.fill();c.strokeStyle='#000';c.lineWidth=1;c.stroke()}}catch(e){}};
});
window._ETUT=()=>EN;window.ETUT={EN:()=>EN,TUR,RK,gizli,hazir,gorsel};
})();
