/* Yeni bölgeler (gerçek liman → gerçek RES bölgesi): Çanakkale (Karabiga Limanı → Biga Tepeleri), Hatay (İskenderun Limanı → Belen Geçidi),
   Karadeniz (Trabzon Limanı → Çaykara Yaylası), Kapadokya (Mersin Limanı → Niğde-Kayseri Yaylası). Yatırımcı adları isim bozma yöntemiyle. */
(function(){
'use strict';
Object.assign(REGIONS,{
 canakkale:{name:{tr:'Çanakkale',en:'Çanakkale'},from:{tr:'Karabiga Limanı',en:'Karabiga Port'},to:{tr:'Biga Tepeleri',en:'Biga Hills'},
  rp:[[0,40],[0,-70],[34,-190],[110,-280],[150,-400],[120,-520],[170,-640],[262,-710],[330,-820],[310,-950],[360,-1070],[452,-1150],[520,-1270],[540,-1400]],
  amp:70,rid:14,climb:.04,coastW:24,sea:0x1d6c8c,fee:1.08,olive:1,cols:{g1:'#8a9a4e',g2:'#5d7036',dry:'#b9a66a',rock:'#9a8f7c'}},
 hatay:{name:{tr:'Hatay',en:'Hatay'},from:{tr:'İskenderun Limanı',en:'İskenderun Port'},to:{tr:'Belen Geçidi',en:'Belen Pass'},
  rp:[[0,40],[0,-60],[40,-160],[120,-220],[190,-300],[180,-410],[110,-500],[150,-610],[250,-660],[330,-760],[300,-880],[360,-990],[470,-1040],[540,-1160],[560,-1300]],
  rota:'hatay',amp:120,rid:24,climb:.075,coastW:26,sea:0x1b6f93,fee:1.16,citrus:1,cols:{g1:'#7f9448',g2:'#506a30',dry:'#b49c63',rock:'#8f8576'}},
 karadeniz:{name:{tr:'Karadeniz',en:'Black Sea'},from:{tr:'Trabzon Limanı',en:'Trabzon Port'},to:{tr:'Çaykara Yaylası',en:'Çaykara Plateau'},
  rp:[[0,40],[0,-70],[30,-180],[-20,-300],[40,-410],[140,-460],[200,-560],[150,-680],[200,-800],[300,-860],[360,-980],[320,-1100],[400,-1200],[500,-1260],[540,-1400]],
  amp:130,rid:22,climb:.08,coastW:20,sea:0x1d4c66,fee:1.22,snow:1,snowLine:115,tea:1,fog:1,cols:{g1:'#4f7d3a',g2:'#2f5a26',dry:'#7d8a55',rock:'#6f6d68'}},
 kapadokya:{name:{tr:'Kapadokya',en:'Cappadocia'},from:{tr:'Mersin Limanı',en:'Mersin Port'},to:{tr:'Niğde-Kayseri Yaylası',en:'Niğde-Kayseri Plateau'},
  rp:[[0,40],[0,-80],[60,-210],[170,-290],[300,-330],[400,-430],[430,-570],[380,-700],[430,-830],[540,-890],[620,-1010],[600,-1150],[660,-1280],[700,-1420]],
  amp:50,rid:10,climb:.06,coastW:18,sea:0x1f6d8a,fee:1.2,snow:1,snowLine:62,peri:1,cols:{g1:'#9a9a5c',g2:'#78794a',dry:'#c7b383',rock:'#c9b08a'}}});
REG_KEYS.push('canakkale','hatay','karadeniz','kapadokya');
Object.assign(RES,{canakkale:{tr:'Biga RES',en:'Biga Wind Farm'},hatay:{tr:'Belen RES',en:'Belen Wind Farm'},karadeniz:{tr:'Çaykara RES',en:'Çaykara Wind Farm'},kapadokya:{tr:'Niğde-Kayseri RES',en:'Niğde-Kayseri Wind Farm'}});
Object.assign(INV,{canakkale:['Daşiç Enerji','Konsa Enerji'],hatay:['Rişgü Enerji','Nafi Enerji'],karadeniz:['Yonkal Enerji','Danor Enerji'],kapadokya:['Jisanerya','Göçesen Enerji']});
if(typeof REAL_KM!=='undefined')Object.assign(REAL_KM,{canakkale:35,hatay:23,karadeniz:95,kapadokya:260});
if(typeof DUZ_REG!=='undefined')Object.assign(DUZ_REG,{hatay:.6,karadeniz:.7});
// Belen geçidi meşhur rüzgârı: kanatta limanda bekleme olasılığı yüksek
const _wh=windHoldOf;windHoldOf=function(j){if(j.type==='kanat'&&j.reg==='hatay'){const h=hash2(j.n,913);return h<.4?Math.round(16+hash2(j.n,57)*5):0}return _wh(j)};

// ---------- bölgeye özgü süsler ----------
function peri(root){const tuff=P('#d8c19a',{shininess:6}),cap=P('#7a6a58',{shininess:6});for(let k=0;k<90;k++){const i=40+Math.floor(Math.random()*(NS-80));const off=(Math.random()<.5?-1:1)*(26+Math.random()*120);const p=sideAt(i,off);if(onPad&&onPad(p.x,p.z))continue;const y=getH(p.x,p.z);
  const n=1+Math.floor(Math.random()*3);for(let m=0;m<n;m++){const h=6+Math.random()*12,r=1.6+Math.random()*1.8;const dx=(Math.random()-.5)*7,dz=(Math.random()-.5)*7;const c=new THREE.Mesh(new THREE.ConeGeometry(r,h,9),tuff);c.position.set(p.x+dx,y+h/2-.5,p.z+dz);c.castShadow=true;root.add(c);
   const s=new THREE.Mesh(new THREE.ConeGeometry(r*.75,r*.9,9),cap);s.position.set(c.position.x,y+h-.2,c.position.z);root.add(s)}}
 const er=new THREE.Mesh(new THREE.ConeGeometry(520,420,24),P('#8c8a86',{shininess:2}));const sp=RS[NS-1];er.position.set(sp.x+900,-20,sp.z-1400);root.add(er);const kar=new THREE.Mesh(new THREE.ConeGeometry(190,155,24),P('#f4f6f8',{shininess:20}));kar.position.set(er.position.x,er.position.y+210-72,er.position.z);root.add(kar)}
function cay(root){const bush=P('#2f6b2c',{shininess:8});const geo=new THREE.SphereGeometry(.9,8,6);const N=900;const im=new THREE.InstancedMesh(geo,bush,N);let c=0;const M=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(1.3,.7,1.3);
 for(let i=60;i<NS*.55&&c<N;i+=7){for(const side of[-1,1]){for(let row=0;row<6&&c<N;row++){const off=side*(16+row*3.2);const p=sideAt(i,off);const y=getH(p.x,p.z);if(onPad&&onPad(p.x,p.z))continue;M.compose(new THREE.Vector3(p.x,y+.45,p.z),q,s);im.setMatrixAt(c++,M)}}}im.count=c;im.receiveShadow=true;root.add(im);
 // yayla evleri (serender biçimli ahşap)
 const ah=P('#7a5232',{shininess:10}),cat=P('#4a4f55',{shininess:20});for(let k=0;k<7;k++){const i=Math.floor(NS*.62)+k*28;const p=sideAt(i,(k%2?1:-1)*(18+k%3*5));const y=getH(p.x,p.z);const g=new THREE.Group();g.position.set(p.x,y,p.z);g.rotation.y=p.ang+k;root.add(g);
  for(const x of[-1.6,1.6])for(const z of[-1.6,1.6])addBox(.3,1.4,.3,ah,x,.7,z,g);addBox(4,2.4,4,ah,0,2.6,0,g);const r=new THREE.Mesh(new THREE.ConeGeometry(3.4,1.8,4),cat);r.rotation.y=Math.PI/4;r.position.y=4.7;g.add(r)}}
function narenciye(root){const yap=P('#2e5a24',{shininess:20}),por=new THREE.MeshStandardMaterial({color:0xf08a1a,roughness:.5});const geo=new THREE.SphereGeometry(1.5,8,7),og=new THREE.SphereGeometry(.16,6,5);const N=420;const im=new THREE.InstancedMesh(geo,yap,N),io=new THREE.InstancedMesh(og,por,N*4);let c=0,co=0;const M=new THREE.Matrix4(),q=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1);
 for(let i=50;i<NS*.4&&c<N;i+=6){for(const side of[-1,1])for(let row=0;row<4&&c<N;row++){const p=sideAt(i,side*(14+row*6));const y=getH(p.x,p.z);if(onPad&&onPad(p.x,p.z))continue;M.compose(new THREE.Vector3(p.x,y+1.7,p.z),q,one);im.setMatrixAt(c++,M);for(let o=0;o<4;o++){const a=Math.random()*6.28,b=Math.random()*1.2-.2;M.compose(new THREE.Vector3(p.x+Math.cos(a)*1.4,y+1.7+b,p.z+Math.sin(a)*1.4),q,one);io.setMatrixAt(co++,M)}}}
 im.count=c;io.count=co;root.add(im);root.add(io)}
const _br=buildRegion;buildRegion=function(r){_br(r);try{const R=REGIONS[r];if(!R||!(R.peri||R.tea||R.citrus))return;const root=new THREE.Group();scene.add(root);if(typeof WOBJ!=='undefined')WOBJ.push(root);if(R.peri)peri(root);if(R.tea)cay(root);if(R.citrus)narenciye(root)}catch(e){console.log(e)}};
// Karadeniz sisi
const _sT=setTOD;setTOD=function(k){_sT(k);if(REGIONS[REG]&&REGIONS[REG].fog&&scene.fog){scene.fog.near*=.6;scene.fog.far*=.62;scene.fog.color.lerp(new THREE.Color(0xb9c4c8),.35)}};

// Malaklı (Aksaray-Niğde çoban köpeği): yol kenarında koyun sürüsü; tır geçerken bir süre yanında koşar (evren G81)
let MK=null;window._MK=()=>MK;
function malakli(root){const i0=Math.floor(NS*.45),side=1;const ap=sideAt(i0,side*30);const ay=getH(ap.x,ap.z);const ag=new THREE.Group();ag.position.set(ap.x,ay,ap.z);ag.rotation.y=ap.ang;root.add(ag);
 const wool=P('#e9e2d4',{shininess:4}),dark=P('#2b2622');for(let k=0;k<16;k++){const sh=new THREE.Group();sh.position.set((Math.random()-.5)*20,0,(Math.random()-.5)*16);sh.rotation.y=Math.random()*6;ag.add(sh);
  const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.72,1),wool);b.scale.set(1.25,.85,.9);b.position.y=.92;b.castShadow=true;sh.add(b);addBox(.34,.38,.44,dark,.92,1.06,0,sh);for(const[a,c]of[[.5,.3],[.5,-.3],[-.5,.3],[-.5,-.3]])addBox(.12,.52,.12,dark,a,.27,c,sh)}
 const kurk=P('#a8824f',{shininess:8}),mask=P('#1f1a16'),dg=new THREE.Group();scene.add(dg);if(typeof WOBJ!=='undefined')WOBJ.push(dg);
 const gv=new THREE.Mesh(new THREE.CylinderGeometry(.42,.4,1.4,10),kurk);gv.rotation.z=Math.PI/2;gv.position.y=.98;gv.castShadow=true;dg.add(gv);const kc=new THREE.Mesh(new THREE.SphereGeometry(.41,10,8),kurk);kc.position.set(-.7,.98,0);dg.add(kc);
 const gs=new THREE.Mesh(new THREE.SphereGeometry(.4,10,8),kurk);gs.scale.set(1,.95,1.05);gs.position.set(.9,1.12,0);dg.add(gs);// göğüs
 const bas=new THREE.Group();bas.position.set(1.22,1.38,0);dg.add(bas);const kf=new THREE.Mesh(new THREE.SphereGeometry(.33,10,8),kurk);kf.scale.set(1.05,.95,1.05);bas.add(kf);
 const ag2=new THREE.Mesh(new THREE.BoxGeometry(.36,.3,.34),mask);ag2.position.set(.3,-.1,0);bas.add(ag2);const bu=new THREE.Mesh(new THREE.SphereGeometry(.07,6,5),mask);bu.position.set(.5,-.04,0);bas.add(bu);
 for(const z of[.28,-.28]){const k=new THREE.Mesh(new THREE.BoxGeometry(.12,.32,.2),mask);k.position.set(-.02,-.06,z);k.rotation.x=z>0?.25:-.25;bas.add(k)}// sarkık kulak
 const sb=new THREE.Mesh(new THREE.CylinderGeometry(.07,.04,.6,6),kurk);sb.position.set(-1.0,1.15,0);sb.rotation.z=-1.0;dg.add(sb);
 const legs=[];for(const[a,c]of[[.62,.24],[.62,-.24],[-.6,.24],[-.6,-.24]]){const l=new THREE.Group();l.position.set(a,.8,c);dg.add(l);const m=new THREE.Mesh(new THREE.CylinderGeometry(.12,.1,.78,6),kurk);m.position.y=-.39;l.add(m);const pa=new THREE.Mesh(new THREE.BoxGeometry(.18,.08,.16),mask);pa.position.set(.03,-.78,0);l.add(pa);legs.push(l)}
 dg.scale.setScalar(1.08);dg.userData.dinamik=1;const p0=sideAt(i0,side*9);dg.position.set(p0.x,getH(p0.x,p0.z),p0.z);dg.rotation.y=p0.ang;
 MK={dg,legs,i0,side,ci:i0,run:false,done:false,ph:0}}
const _br2=buildRegion;buildRegion=function(r){MK=null;_br2(r);try{if(r==='kapadokya'){const root=new THREE.Group();scene.add(root);if(typeof WOBJ!=='undefined')WOBJ.push(root);malakli(root)}}catch(e){console.log(e)}};
addEventListener('load',()=>{if(!window.EXT)return;const _st=EXT.step;EXT.step=function(dt,run){const r=_st?_st(dt,run):false;try{if(MK&&truck&&G&&run){const v=truck.v,ti=roadIdx(v);
 if(!MK.run&&!MK.done&&Math.abs(ti-MK.i0)<10&&Math.abs(v.speed)>1.5){MK.run=true;MK.ci=MK.i0;blip(260,200,.12);setTimeout(()=>blip(240,190,.12),180);if(G.warnT<=0){toast(L==='tr'?'Malaklı çoban köpeği bir süre tırın yanında koşuyor':'A Malaklı shepherd dog runs alongside for a while','#ffe08a',2.4);G.warnT=2.5}}
 if(MK.run){const sp=Math.min(Math.abs(v.speed),9);const tgt=(typeof roadF==='function'?roadF(v):ti);const di=dt*sp/(ROADLEN/(NS-1));MK.ci+=clamp(tgt+1-MK.ci,-di,di);const dir=ti>=MK.i0?1:-1;
  const ci=clamp(MK.ci,1,NS-3),i=Math.floor(ci),f=ci-i,a=sideAt(i,MK.side*7.5),b=sideAt(i+1,MK.side*7.5),px=lerp(a.x,b.x,f),pz=lerp(a.z,b.z,f);MK.dg.position.set(px,getH(px,pz),pz);let hh=Math.atan2((b.x-a.x)*dir,(b.z-a.z)*dir)-Math.PI/2;let dh=hh-(MK.hh===undefined?hh:MK.hh);dh=Math.atan2(Math.sin(dh),Math.cos(dh));MK.hh=(MK.hh===undefined?hh:MK.hh)+dh*Math.min(1,dt*6);MK.dg.rotation.y=MK.hh;
  MK.ph+=dt*(4+sp*1.2);MK.legs.forEach((l,k)=>l.rotation.z=Math.sin(MK.ph+(k<2?0:Math.PI)+(k%2?.6:0))*.55);MK.dg.position.y+=Math.abs(Math.sin(MK.ph))*.12;
  if(Math.abs(MK.ci-MK.i0)>45||Math.abs(ti-MK.ci)>12){MK.run=false;MK.done=true;MK.legs.forEach(l=>l.rotation.z=0)}}}}catch(e){}return r}});
})();
