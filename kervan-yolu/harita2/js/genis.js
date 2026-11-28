/* Kervan Yolu genişletmeleri (1.0 sonu, 1.2): yağmur ve silecek, stabilize saha yolu ve çamur (dozer çekmesi).
   Ana betikteki global işlevlere bağlanır: sefer, setTOD, resetGame, renderMenu, vehStep kancası (EXT.wet), kare döngüsü (EXT.step). */
(function(){
'use strict';
const TRx={rain:'Yağmurlu',clear:'Açık',hava:'Hava',t_yagmur:'Yağmur başladı: fren mesafesi uzar, silecekler çalışıyor.',lYagmur:'Hava',
 t_camurHint:'Saha yolu stabilize ve yağmurdan çamur olmuş: yavaş gir, durma.',t_saplandi:'Çamura saplandın! Dozer çağır.',a_dozer:'DOZER ÇAĞIR',t_dozerGel:'Dozer geliyor, halat bağlanıyor…',t_dozerOk:'Dozer seni çamurdan çıkardı.',k_dozer:'Dozer çekme (saha yolu)',k_cekici:'Çekici (yolun zor kısmı)',t_cekici:'Çekici geldi, tırı zor kısımdan çekip ileride yola bıraktı.',
 lSaha:'Saha yolu',sahaKuru:'stabilize, kuru',sahaCamur:'stabilize, çamurlu'};
const ENx={rain:'Rainy',clear:'Clear',hava:'Weather',t_yagmur:'Rain started: longer braking, wipers on.',lYagmur:'Weather',
 t_camurHint:'The site road is gravel and the rain turned it to mud: go in slow, keep moving.',t_saplandi:'Stuck in the mud! Call the dozer.',a_dozer:'CALL DOZER',t_dozerGel:'Dozer on its way, hooking up the cable…',t_dozerOk:'The dozer pulled you out of the mud.',k_dozer:'Dozer tow (site road)',k_cekici:'Tow truck (hard section)',t_cekici:'A tow truck pulled you past the hard section and left you on the road ahead.',
 lSaha:'Site road',sahaKuru:'gravel, dry',sahaCamur:'gravel, muddy'};
Object.assign(STR.tr,TRx);Object.assign(STR.en,ENx);

// ---------- iş üretimi: yağmur ve çamur ----------
const _sefer=sefer;
sefer=function(n){const j=_sefer(n);if(n>6&&!REGIONS[j.reg].snow){const r=hash2(n,413);j.rain=r<.18;j.mud=j.rain||hash2(n,419)<.12}return j};
if(SAVE.wx==null)SAVE.wx='clear';

// ---------- yağmur görseli ----------
let RAIN=null,rainOn=false,wipe=0,rainSnd=null;
function rainBuild(){const N=2200,pos=new Float32Array(N*6),vel=new Float32Array(N);for(let i=0;i<N;i++){const x=(Math.random()-.5)*80,y=Math.random()*40,z=(Math.random()-.5)*80;pos.set([x,y,z,x+.05,y-.9,z],i*6);vel[i]=24+Math.random()*10}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.LineBasicMaterial({color:0xaab8c8,transparent:true,opacity:.6,depthWrite:false});const l=new THREE.LineSegments(g,m);l.frustumCulled=false;l.visible=false;scene.add(l);RAIN={l,pos,vel,N}}
function wipersBuild(){const c=truck&&truck.cab&&truck.cab.g;if(!c||c.userData.wip)return;const arms=[];const M=new THREE.MeshBasicMaterial({color:0x111214});
 for(const x of[-.62,.38]){const p=new THREE.Group();p.position.set(x,3.06,-5.12);p.rotation.x=-.32;const a=new THREE.Mesh(new THREE.BoxGeometry(.035,.95,.02),M);a.position.y=.47;p.add(a);const b=new THREE.Mesh(new THREE.BoxGeometry(.05,.82,.03),M);b.position.set(.03,.52,.01);p.add(b);c.add(p);arms.push(p)}c.userData.wip=arms}
function rainNoise(on){try{if(!AC)return;if(on&&!rainSnd&&!SAVE.muted){const n=AC.createBufferSource(),b=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;n.buffer=b;n.loop=true;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=2400;const g=AC.createGain();g.gain.value=.035;n.connect(f);f.connect(g);g.connect(AC.destination);n.start();rainSnd={n,g}}
 if((!on||SAVE.muted)&&rainSnd){rainSnd.n.stop();rainSnd=null}}catch(e){}}
function setRain(on){if(!RAIN)rainBuild();rainOn=!!on;RAIN.l.visible=rainOn;
 const rm=world&&world.roadMesh&&world.roadMesh.material;if(rm){if(rm.userData.c0==null){rm.userData.c0=rm.color.getHex();rm.userData.r0=rm.roughness}rm.color.setHex(rainOn?0x8a8f96:rm.userData.c0);if(rm.roughness!=null)rm.roughness=rainOn?.28:rm.userData.r0;rm.needsUpdate=true}
 rainNoise(rainOn)}
const _setTOD=setTOD;
setTOD=function(k){_setTOD(k);if(rainOn){const gr=new THREE.Color(k==='gece'?0x1c2129:0x8a939c);HOR.lerp(gr,.7);TOP.lerp(gr.clone().multiplyScalar(.85),.7);if(typeof updEnv==='function')updEnv();sun.intensity*=.4;hemi.intensity*=.62;renderer.toneMappingExposure*=.82;if(scene.fog){scene.fog.color.lerp(new THREE.Color(0x7d8690),.55);scene.fog.near*=.35;scene.fog.far*=.45}if(scene.background&&scene.background.isColor)scene.background.lerp(new THREE.Color(0x7d8690),.55)}};

// ---------- saha yolu: stabilize şerit ve çamur ----------
let SAHA=null;const SAHA_N=64;
function sahaBuild(){if(SAHA&&SAHA.rs===RS)return;if(SAHA){scene.remove(SAHA.g)}const g=new THREE.Group();const a=NS-1-SAHA_N,b=NS-1;const pos=[],uv=[],idx=[];
 for(let i=a;i<=b;i++){const l=sideAt(i,-4.6),r=sideAt(i,4.6);pos.push(l.x,getH(l.x,l.z)+.27,l.z,r.x,getH(r.x,r.z)+.27,r.z);const v=(i-a)/4;uv.push(0,v,1,v);if(i<b){const k=(i-a)*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
 const mk=(mud)=>ctex(256,256,(q,w,h)=>{q.fillStyle=mud?'#5e4a35':'#8c7a60';q.fillRect(0,0,w,h);for(let k=0;k<2600;k++){const s=Math.random();q.fillStyle=mud?`rgba(${40+s*50|0},${30+s*35|0},${20+s*20|0},.55)`:`rgba(${120+s*90|0},${112+s*80|0},${98+s*70|0},.6)`;q.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*3)}
  q.fillStyle=mud?'rgba(70,48,28,.5)':'rgba(132,104,74,.38)';q.fillRect(w*.43,0,w*.14,h);q.fillStyle=mud?'rgba(0,0,0,0)':'rgba(190,182,168,.35)';q.fillRect(0,0,w*.1,h);q.fillRect(w*.9,0,w*.1,h);q.strokeStyle=mud?'rgba(30,22,14,.55)':'rgba(90,80,66,.4)';q.lineWidth=16;for(const x of[w*.3,w*.7]){q.beginPath();q.moveTo(x,0);for(let y=0;y<=h;y+=16)q.lineTo(x+Math.sin(y*.05)*4,y);q.stroke()}
  if(mud){for(let k=0;k<6;k++){const x=Math.random()*w,y=Math.random()*h;const gr=q.createRadialGradient(x,y,2,x,y,26);gr.addColorStop(0,'rgba(120,130,140,.55)');gr.addColorStop(1,'rgba(60,50,40,0)');q.fillStyle=gr;q.beginPath();q.ellipse(x,y,28,14,0,0,7);q.fill()}}},true);
 const t0=mk(false),t1=mk(true);[t0,t1].forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping});
 const m=new THREE.MeshStandardMaterial({map:t0,roughness:.95,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});const mesh=new THREE.Mesh(geo,m);mesh.receiveShadow=true;g.add(mesh);
 // levha
 const sp=sideAt(a-6,6.5),sg=new THREE.Group();sg.position.set(sp.x,getH(sp.x,sp.z),sp.z);sg.rotation.y=sp.ang+Math.PI;addBox(.1,2.6,.1,MAT.steel,0,1.3,0,sg);const pn=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.1),new THREE.MeshBasicMaterial({side:THREE.DoubleSide,map:ctex(256,118,(q,w,h)=>{q.fillStyle='#f2c230';q.fillRect(0,0,w,h);q.strokeStyle='#111';q.lineWidth=6;q.strokeRect(4,4,w-8,h-8);q.fillStyle='#111';q.textAlign='center';q.font='800 40px "Barlow Condensed",sans-serif';q.fillText(L==='tr'?'STABİLİZE YOL':'GRAVEL ROAD',w/2,52);q.font='700 30px "Barlow Condensed",sans-serif';q.fillText(L==='tr'?'AZAMİ 20 km/sa':'MAX 20 km/h',w/2,94)})}));pn.position.set(0,2.9,.07);sg.add(pn);g.add(sg);
 scene.add(g);SAHA={g,m,t0,t1,a,b,rs:RS,dozer:null}}
function dozerBuild(){const g=new THREE.Group();const Y=P('#e8b318',{shininess:50}),D=P('#2a2c2e',{shininess:30});
 rbox(2.6,1.5,4.2,.2,Y,0,1.5,0,g);rbox(1.7,1.6,1.6,.15,Y,0,3,.6,g);addBox(1.5,1.1,.05,MAT.glass,0,3.1,-.22,g);addBox(.05,1.1,1.3,MAT.glass,.86,3.1,.6,g);addBox(.05,1.1,1.3,MAT.glass,-.86,3.1,.6,g);
 for(const s of[-1,1]){addBox(.7,1,4.8,D,s*1.45,.55,0,g);for(let k=-2;k<=2;k++)addBox(.72,.08,.18,MAT.dark,s*1.45,1.08,k*.95,g)}
 const bl=addBox(3.6,1.3,.25,Y,0,.8,-2.9,g);bl.rotation.x=.15;for(const s of[-1,1]){const arm=addBox(.18,.18,1.6,D,s*1.2,1.1,-2.1,g);arm.rotation.x=-.2}
 addCyl(.08,.08,1.2,8,MAT.dark,.7,4.1,.9,g);addBox(.5,.25,.06,MAT.amber,0,3.9,.2,g);g.visible=false;scene.add(g);return g}
function cable(){if(!SAHA)return null;if(SAHA.cab)return SAHA.cab;const m=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1,6),new THREE.MeshBasicMaterial({color:0x1a1a1a}));m.visible=false;scene.add(m);SAHA.cab=m;return m}

// ---------- adım ----------
const _reset=resetGame;
resetGame=function(m,n){_reset(m,n);if(!G)return;const j=G.job||{};G.rain=m==='career'?!!j.rain:(SAVE.wx==='rain'&&!RG().snow);G.mud=m==='career'?!!j.mud:G.rain;G.mudS=0;G.dozT=null;G.camurH=0;G.yagH=0;G.ext=[];
 sahaBuild();SAHA.m.map=G.mud?SAHA.t1:SAHA.t0;SAHA.m.needsUpdate=true;if(SAHA.dozer)SAHA.dozer.visible=false;if(SAHA.cab)SAHA.cab.visible=false;wipersBuild();setRain(G.rain);setTOD(CUR_TOD)};
/* TAKILMA YOK: aynı yerde ikinci kez 'Aracı yola çıkar' gerekirse çekici gelir, tırı 100 m ileri, yolun zor kısmının ötesine çeker (kariyerde bedeli var) */
const _resc=rescue;rescue=function(){const v=truck.v;const i=roadIdx(v);const now=G?G.t:0;const R=G&&G.rsc;
 if(G&&R&&Math.abs(R.i-i)<30&&now-R.t<150){const back=mode==='career'&&G.job.type==='donus';const j=clamp(i+(back?-45:45),3,NS-4);const p=sideAt(j,(back?-1:1)*LANE);v.x=p.x;v.z=p.z;
  const k=clamp(j+(back?-1:1),0,NS-1);v.h=Math.atan2(-(RS[k].x-RS[j].x),-(RS[k].z-RS[j].z));v.speed=0;v.steer=0;trailer.th=v.h;G.stuckT=0;G.mudS=0;setAct(null);snapCam();if(mode==='career')G.ext.push(['k_cekici',-2500]);toast(T('t_cekici'),'#8ff0a4',3.2);G.rsc=null;return}
 _resc();if(G)G.rsc={i,t:now}};
window.EXT={
 wet(){return rainOn?.7:1},
 inMud(v){return G&&G.mud&&SAHA&&roadIdx(v)>=SAHA.a-2},
 step(dt,run){if(!G)return;
  // yağmur
  if(RAIN&&rainOn){const P=RAIN.pos,c=camera.position;for(let i=0;i<RAIN.N;i++){const o=i*6;let y=P[o+1]-RAIN.vel[i]*dt;let x=P[o],z=P[o+2];if(y<c.y-14||Math.abs(x-c.x)>40||Math.abs(z-c.z)>40){x=c.x+(Math.random()-.5)*80;z=c.z+(Math.random()-.5)*80;y=c.y+12+Math.random()*24}P[o]=x;P[o+1]=y;P[o+2]=z;P[o+3]=x+.06;P[o+4]=y-1.3;P[o+5]=z}RAIN.l.geometry.attributes.position.needsUpdate=true;
   if(run&&!G.yagH&&phase==='drive'){G.yagH=1;toast(T('t_yagmur'),'#bfe4ff',3)}}
  const wa=truck&&truck.cab&&truck.cab.g.userData.wip;if(wa){if(rainOn){wipe+=dt*2.6}const a=rainOn?Math.sin(wipe)*.85+.85:0;wa.forEach(p=>p.rotation.z=a)}
  if(!run||phase!=='drive'||!SAHA)return;
  // çamur ve dozer
  const v=truck.v,i=roadIdx(v),sp=Math.abs(v.speed);
  if(G.mud&&!G.camurH&&i>SAHA.a-50&&i<SAHA.a){G.camurH=1;toast(T('t_camurHint'),'#ffd08a',3.6)}
  if(G.dozT!=null){G.dozT+=dt;const D=SAHA.dozer;const k=G.dozT;
   const di=Math.min(NS-1,Math.round(G.dozI+8+Math.max(0,k-4)*1.1));const dp=sideAt(Math.min(NS-1,di+6),0);D.visible=true;D.position.set(dp.x,getH(dp.x,dp.z),dp.z);const t2=RS[Math.min(NS-1,di+7)],t1=RS[Math.min(NS-1,di+5)];D.rotation.y=Math.atan2(-(t2.x-t1.x),-(t2.z-t1.z))+Math.PI;
   if(k>4){const ti=Math.min(NS-2,G.dozI+(k-4)*1.1);const i0=Math.floor(ti),f=ti-i0;const a=RS[i0],b=RS[i0+1];v.x=a.x+(b.x-a.x)*f;v.z=a.z+(b.z-a.z)*f;v.h=Math.atan2(-(b.x-a.x),-(b.z-a.z));v.speed=1.1}else v.speed=0;
   const C=cable();const A=new THREE.Vector3(v.x-Math.sin(v.h)*5.4,getH(v.x,v.z)+1.1,v.z-Math.cos(v.h)*5.4),B=D.position.clone().add(new THREE.Vector3(0,1.1,0));const L2=A.distanceTo(B);C.visible=true;C.scale.set(1,L2,1);C.position.copy(A).add(B).multiplyScalar(.5);C.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize());
   const end=Math.min(NS-6,SAHA.b-6);if(roadIdx(v)>=end||k>40){G.dozT=null;C.visible=false;D.visible=false;G.mud=false;SAHA.m.map=SAHA.t0;SAHA.m.needsUpdate=true;v.speed=0;toast(T('t_dozerOk'),'#8ff0a4',3);blip(523,784,.3)}
   return true}
  /* çamur: yavaşlatma çamurun başladığı yerden (inMud ile aynı: SAHA.a-2), saplanınca dozer her yükte; eskiden dozer 8 örnek sonra başlıyordu, arada tır kalıyordu */
  if(G.mud&&i>=SAHA.a-2&&i<SAHA.b-10){const lim=8/3.6*1.6;if(HEAVY.includes(G.job.type)&&sp>lim)v.speed*=.985;
   if(sp<.9&&input.gas){G.mudS+=dt}else if(sp>1.5)G.mudS=Math.max(0,G.mudS-dt);
   if(G.mudS>1.6&&!(actFn&&actFn.dozer)){toast(T('t_saplandi'),'#ff8a5c',3);const fn=()=>{setAct(null);G.dozT=0;G.dozI=roadIdx(v);if(!SAHA.dozer)SAHA.dozer=dozerBuild();if(mode==='career')G.ext.push(['k_dozer',-3500]);toast(T('t_dozerGel'),'#bfe4ff',3);blip(200,160,.4)};fn.dozer=1;fn.blade=1;setAct(T('a_dozer'),fn)}
   if(G.mudS>1.6)v.speed=Math.min(v.speed,.15)}
  return false}
};
})();
/* Menü: serbest modda hava seçimi; seferde hava ve saha yolu satırları */
(function(){const _rm=renderMenu;renderMenu=function(){_rm();try{const b=$('mBody');if(!b)return;
 if(SAVE.tab==='free'){const d=document.createElement('div');d.innerHTML=`<div style="margin-top:10px;font-family:'Barlow Condensed';letter-spacing:.1em;color:var(--mut);font-size:13px">${T('hava').toUpperCase()}</div><div class="chips">${['clear','rain'].map(k=>`<div class="chip ${SAVE.wx===k?'on':''}" data-wx="${k}">${T(k)}</div>`).join('')}</div>`;b.appendChild(d);d.querySelectorAll('[data-wx]').forEach(c=>c.onclick=()=>{SAVE.wx=c.dataset.wx;save();renderMenu()})}
 else{const jc=b.querySelector('.jobcard');if(!jc)return;const j=sefer(nextSefer());const kv=(a,v)=>{const e=document.createElement('div');e.className='kv';e.innerHTML=`<span>${a}</span><b>${v}</b>`;return e};const ref=jc.querySelector('.kv:last-of-type');
  const add=[];if(j.rain)add.push(kv(T('lYagmur'),'🌧︎ '+T('rain')));if(j.type!=='donus'&&j.mud)add.push(kv(T('lSaha'),T('sahaCamur')));add.forEach(e=>jc.insertBefore(e,ref?ref.nextSibling:null))}}catch(e){}}})();
/* Drone ile güzergâh keşfi: sefer evrakı ekranından; kamera yolu baştan sona uçar, viraj, köy, enerji hattı, kantar, akaryakıt, zincir alanı ve çamur işaretlenir; işaretler mini haritada kalır */
(function(){
const TRk={kesif:'🛰︎ GÜZERGÂHI DRONE İLE KEŞFET',kesifOk:'Keşif tamam: {n} nokta haritada.',p_viraj:'KESKİN VİRAJ',p_koy:'KÖY · DAR SOKAK',p_tel:'ENERJİ HATTI',p_kantar:'KANTAR',p_yakit:'AKARYAKIT',p_zincir:'ZİNCİR TAK',p_camur:'ÇAMURLU SAHA YOLU',p_saha:'SAHA',kesifAtla:'Atla'};
const ENk={kesif:'🛰︎ SURVEY THE ROUTE BY DRONE',kesifOk:'Survey done: {n} points on the map.',p_viraj:'SHARP BEND',p_koy:'VILLAGE · NARROW STREET',p_tel:'POWER LINE',p_kantar:'WEIGH STATION',p_yakit:'FUEL',p_zincir:'FIT CHAINS',p_camur:'MUDDY SITE ROAD',p_saha:'SITE',kesifAtla:'Skip'};
Object.assign(STR.tr,TRk);Object.assign(STR.en,ENk);
const RENK={p_viraj:'#ffb21a',p_koy:'#ff7a3d',p_tel:'#ff3b2f',p_kantar:'#3d8bff',p_yakit:'#ff9a1f',p_zincir:'#7fd4ff',p_camur:'#a0703c',p_saha:'#6dff8c'};
function noktalar(){const P=[];if(typeof bendsKur==='function'&&BENDS._rs!==RS){bendsKur();BENDS._rs=RS}(BENDS||[]).forEach(i=>P.push(['p_viraj',i]));
 if(VZ&&VZ.v0)P.push(['p_koy',VZ.v0]);const tels=(typeof HOBS!=='undefined'?HOBS:[]).filter(o=>o.k==='tel');if(tels.length){const o=tels[Math.floor(tels.length/2)];let bi=0,bd=1e9;for(let i=0;i<NS;i+=2){const d=(RS[i].x-o.x)**2+(RS[i].z-o.z)**2;if(d<bd){bd=d;bi=i}}P.push(['p_tel',bi])}
 if(PORTOPS.kantar&&G&&HEAVY.includes(G.job.type))P.push(['p_kantar',PORTOPS.kantar.ki]);if(PORTOPS.mola)P.push(['p_yakit',PORTOPS.mola.ri]);
 if(RG().snow&&CZ&&CZ.ci)P.push(['p_zincir',CZ.ci]);if(G&&G.mud)P.push(['p_camur',NS-1-64]);P.push(['p_saha',NS-1]);return P.sort((a,b)=>a[1]-b[1])}
let SPR=[],KES=null;
function spr(txt,col){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:ctex(512,128,(q,w,h)=>{q.fillStyle='rgba(12,16,14,.85)';q.fillRect(0,20,w,88);q.fillStyle=col;q.fillRect(0,20,14,88);q.fillStyle='#fff';q.font='800 54px "Barlow Condensed",sans-serif';q.fillText(txt,32,84)}),depthTest:false,sizeAttenuation:false}));m.scale.set(.32,.08,1);m.renderOrder=999;scene.add(m);return m}
function temizle(){SPR.forEach(s=>scene.remove(s));SPR=[]}
EXT.kesif=function(){if(!G||KES)return;const P=noktalar();temizle();$('docs').classList.remove('on');
 for(const[k,i]of P){const p=RS[Math.max(0,Math.min(NS-1,i))];const s=spr(T(k),RENK[k]);s.position.set(p.x,(RY[i]||getH(p.x,p.z))+14,p.z);s.userData.i=i;SPR.push(s)}
 const btn=document.createElement('button');btn.className='btn';btn.textContent=T('kesifAtla');btn.style.cssText='position:fixed;right:calc(env(safe-area-inset-right) + 14px);bottom:calc(env(safe-area-inset-bottom) + 16px);z-index:41';document.body.appendChild(btn);
 const t0=performance.now(),DUR=15000;KES={P,btn,said:{}};showHud(false);
 const bit=()=>{if(!KES)return;KES.btn.remove();temizle();G.kesif=P.map(x=>[x[0],x[1]]);KES=null;window.camTarget=KCT;showHud(true);snapCam&&snapCam();toast(T('kesifOk').replace('{n}',P.length),'#8ff0a4',3);if(!G.docs&&(G.pst==='kapiBekle'||G.pst==='evrak'))setTimeout(()=>{if(!G.docs&&typeof openDocs==='function')openDocs()},300)};btn.onclick=bit;
 const KCT=window.camTarget;window.camTarget=()=>{if(!KES)return KCT();const k=Math.min(1,(performance.now()-t0)/DUR);const f=k*(NS-1),i=Math.floor(f);const a=RS[Math.min(NS-1,i)],b=RS[Math.min(NS-1,i+12)];const y=(RY[i]||0)+48;
  for(const[kk,ii]of KES.P){if(!KES.said[ii+kk]&&ii<=i+30){KES.said[ii+kk]=1;blip(880,1320,.08)}}if(k>=1)setTimeout(bit,600);
  const back=RS[Math.max(0,i-30)];return{p:new THREE.Vector3(back.x,y,back.z),l:new THREE.Vector3(b.x,(RY[Math.min(NS-1,i+12)]||0)+4,b.z)}};
 cizirti&&cizirti()};
// mini harita işaretleri
EXT.mini=function(c,v,sc,S){if(!G||!G.kesif)return;for(const[k,i]of G.kesif){const p=RS[Math.max(0,Math.min(NS-1,i))];let x=(p.x-v.x)*sc,z=(p.z-v.z)*sc;if(Math.hypot(x,z)>S/2-6)continue;c.save();c.translate(x,z);c.rotate(-v.h);c.fillStyle=RENK[k];c.beginPath();c.moveTo(0,-6);c.lineTo(5.5,4);c.lineTo(-5.5,4);c.closePath();c.fill();c.strokeStyle='#000';c.lineWidth=1;c.stroke();c.restore()}};
// evrak ekranına düğme
const _od=openDocs;openDocs=function(){if(KES)return;_od();if(G&&!G.freeDocs&&!G.kesif){const bt=document.querySelector('#docs .btns');if(bt&&!bt.querySelector('#kesB')){const b=document.createElement('button');b.className='btn';b.id='kesB';b.textContent=T('kesif');b.style.marginTop='8px';b.onclick=()=>EXT.kesif();bt.appendChild(b)}}else{const e=document.getElementById('kesB');if(e)e.remove()}};
})();
/* Köy hayatı: köy evlerinin önünde köylüler (kasketli dede, yazmalı nine, çocuklar, çay ocağında oturanlar); tır geçerken dönüp el sallarlar */
(function(){
let KOY=[];
function insan(par,x,z,o){const g=new THREE.Group();g.position.set(x,0,z);par.add(g);const sk=P(o.ten||'#c99a74',{shininess:10});const ust=P(o.ust,{shininess:15}),alt=P(o.alt,{shininess:10});const s=o.boy||1;
 const oturan=o.otur;const legY=oturan?.25:.45;for(const lx of[-.11,.11]){const l=addBox(.12,oturan?.45:.85,.14,alt,lx*s,legY*s,oturan?.2*s:0,g);if(oturan){l.rotation.x=-1.2}}
 const govde=rbox(.44*s,.62*s,.26*s,.08*s,ust,0,(oturan?.78:1.17)*s,0,g);const bas=new THREE.Mesh(new THREE.SphereGeometry(.13*s,12,10),sk);bas.position.y=(oturan?1.24:1.62)*s;g.add(bas);
 if(o.kasket){const k=new THREE.Mesh(new THREE.CylinderGeometry(.14*s,.15*s,.07*s,12),P('#3b3a38'));k.position.y=bas.position.y+.1*s;g.add(k);addBox(.16*s,.02*s,.1*s,P('#3b3a38'),0,bas.position.y+.075*s,-.12*s,g)}
 if(o.yazma){const y=new THREE.Mesh(new THREE.SphereGeometry(.145*s,12,10,0,Math.PI*2,0,Math.PI*.62),P(o.yazma));y.position.y=bas.position.y+.01;g.add(y);addBox(.3*s,.25*s,.06*s,P(o.yazma),0,bas.position.y-.12*s,.09*s,g)}
 const kollar=[];for(const sx of[-1,1]){const a=new THREE.Group();a.position.set(sx*.27*s,(oturan?1.04:1.43)*s,0);g.add(a);const k=addBox(.1*s,.55*s,.11*s,ust,0,-.27*s,0,a);const el=new THREE.Mesh(new THREE.SphereGeometry(.055*s,8,6),sk);el.position.y=-.56*s;a.add(el);kollar.push(a)}
 return{g,kollar,faz:Math.random()*6,sallar:o.sallar!==false}}
function koyKur(){KOY=[];if(!RG().village||typeof HOBS==='undefined')return;const evler=HOBS.filter(o=>o.k==='ev');if(!evler.length)return;const root=new THREE.Group();scene.add(root);if(typeof WOBJ!=='undefined')WOBJ.push(root);
 const TIP=[{ust:'#5b5f66',alt:'#3a3d44',kasket:1},{ust:'#7a3b3b',alt:'#2f2c33',yazma:'#e9e2d0'},{ust:'#2f6db3',alt:'#3a4a6a',boy:.72},{ust:'#c9a227',alt:'#3a3d44',boy:.66},{ust:'#4d6b4f',alt:'#2e2e2e',kasket:1},{ust:'#6b4a7a',alt:'#3a2f3a',yazma:'#d8c27a'}];
 evler.slice(0,9).forEach((e,k)=>{let bi=0,bd=1e9;for(let i=0;i<NS;i+=2){const d=(RS[i].x-e.x)**2+(RS[i].z-e.z)**2;if(d<bd){bd=d;bi=i}}const r=RS[bi];const dx=r.x-e.x,dz=r.z-e.z,L=Math.hypot(dx,dz)||1;const t=Math.min(.75,(L-5.5)/L);const x=e.x+dx*t,z=e.z+dz*t;
  const o=Object.assign({},TIP[k%TIP.length]);const h=insan(root,x,z,o);h.g.position.y=getH(x,z);h.g.rotation.y=Math.atan2(dx,dz)+Math.PI;KOY.push(h)});
 // çay ocağı: masa, iki oturan dede
 const e=evler[Math.floor(evler.length/2)];if(e){let bi=0,bd=1e9;for(let i=0;i<NS;i+=2){const d=(RS[i].x-e.x)**2+(RS[i].z-e.z)**2;if(d<bd){bd=d;bi=i}}const p=sideAt(bi,-7.5);const gy=getH(p.x,p.z);const m=new THREE.Group();m.position.set(p.x,gy,p.z);m.rotation.y=p.ang;root.add(m);
  addCyl(.45,.45,.05,14,P('#8a6a44'),0,.72,0,m);addCyl(.05,.05,.72,6,MAT.dark,0,.36,0,m);for(const s of[-1,1]){addBox(.4,.05,.4,P('#6b4a2a'),s*.75,.42,0,m);const h=insan(m,s*.75,0,{ust:s>0?'#5b5f66':'#4a4f3f',alt:'#333',kasket:1,otur:1});h.g.rotation.y=s>0?-Math.PI/2:Math.PI/2;h.g.position.y=.05;KOY.push(h)}
  for(const s of[-1,1]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.035,.03,.09,8),new THREE.MeshStandardMaterial({color:0xb2381a,transparent:true,opacity:.85,roughness:.1}));b.position.set(s*.18,.79,.05);m.add(b)}}}
const _br=buildRegion;buildRegion=function(r){_br(r);try{koyKur()}catch(e){}};
const _st=EXT.step;EXT.step=function(dt,run){const r=_st(dt,run);if(KOY.length&&truck&&G){const v=truck.v;const tt=G.t||0;for(const h of KOY){const p=h.g.getWorldPosition(_kv);const d=Math.hypot(v.x-p.x,v.z-p.z);
  if(d<45&&h.sallar){const want=Math.atan2(v.x-p.x,v.z-p.z)-(h.g.parent.rotation?h.g.parent.rotation.y:0);let dy=want-h.g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));h.g.rotation.y+=dy*Math.min(1,dt*3);h.kollar[1].rotation.z=-2.6+Math.sin(tt*9+h.faz)*.45}
  else h.kollar[1].rotation.z+=(0-h.kollar[1].rotation.z)*Math.min(1,dt*4)}}return r};
const _kv=new THREE.Vector3();
})();
