/* Harita 2: akan dünya (parça parça yüklenen arazi).
   Gerçek rotalı bölgelerde (REGIONS[r].rota) tek büyük arazi ızgarası yerine 320 m'lik karolar kullanılır:
   - Karo verisi (yükseklik, yola uzaklık) istendiği an hesaplanır ve saklanır; getH/getRD her yerde çalışır.
   - Karo ağı yalnız tırın çevresinde (≈1,5 km, sis sınırı 1,3 km) kurulur; uzaktakiler silinir. Karede en çok 2 karo kurulur.
   - Yükseklik formülü tek ızgaradakiyle aynıdır (önce liman/saha düzlemesi, sonra yol şeridi, sonra tesis zeminleri):
     zemin kuralı (tekerlek getH+0,2) ve sekiz denetim değişmeden geçerli kalır.
   - Normaller komşu karolardan örneklenir: karo sınırında ışık kırığı olmaz.
   - Ağaç ve süsler ≈1,1 km'lik parçalar hâlinde kurulur, tırdan uzak parçalar gizlenir (telefonda kare hızı). */
(function(){
'use strict';
const TS=320,SG=10,NQ=TS/SG+1;const DATA=new Map(),MESH=new Map();let grp=null,BK=null;const BKS=50;
const PARCA=[];let sonT=0;
function bkKur(){BK=new Map();for(let i=0;i<NS;i++){const k=Math.floor(RS[i].x/BKS)+','+Math.floor(RS[i].z/BKS);let a=BK.get(k);if(!a)BK.set(k,a=[]);a.push(i)}}
function yakin(x,z){const cx=Math.floor(x/BKS),cz=Math.floor(z/BKS);let bd=1e18,bk=-1;
 for(let r=1;r<=2;r++){for(let a=cx-r;a<=cx+r;a++)for(let b=cz-r;b<=cz+r;b++){const l=BK.get(a+','+b);if(!l)continue;for(const i of l){const d=(RS[i].x-x)**2+(RS[i].z-z)**2;if(d<bd){bd=d;bk=i}}}if(bk>=0)break}
 return bk<0?{rd:999,k:0}:{rd:Math.sqrt(bd),k:bk}}
/* gerçek arazi: Copernicus DEM (gerçek), üstüne küçük doğal ayrıntı; deniz DEM'de 0 → oyun suyu; liman çevresinde oyunun liman yerleşimi */
window.gercekH=function(x,z,o){const R=RG();const f=window.ROTA&&ROTA.dem(R.rota);let d=f?f(x,z):NaN;
 const dl=Math.hypot(x,z-20);const w=sstep(380,760,dl);if(d!==d)return o;
 const det=fbm(x*.011+3,z*.011-7,3)*4.5*sstep(4,40,d);let h=d>2.5?d+det:lerp(-16,2.5,sstep(0,2.5,d));
 return lerp(o,h,w)};
function hesapla(x,z){const n=yakin(x,z),rd=n.rd;let h=natural(x,z);h=lerp(h,YARD_Y,yardMask(x,z));h=lerp(h,SITE_Y,siteMask(x,z));h=lerp(h,RY[n.k],1-sstep(17,44,rd));
 for(const pd of PADS){const dd=Math.hypot(x-pd.x,z-pd.z);if(dd<pd.r1)h=lerp(h,pd.y,(1-sstep(pd.r0,pd.r1,dd))*sstep(5.5,12,rd))}return[h,rd]}
function veri(ti,tj){const k=ti+','+tj;let t=DATA.get(k);if(t)return t;const H=new Float32Array(NQ*NQ),D=new Float32Array(NQ*NQ);
 for(let j=0;j<NQ;j++)for(let i=0;i<NQ;i++){const r=hesapla(ti*TS+i*SG,tj*TS+j*SG);H[j*NQ+i]=r[0];D[j*NQ+i]=r[1]}t={H,D};DATA.set(k,t);return t}
function ornek(w,x,z){const ti=Math.floor(x/TS),tj=Math.floor(z/TS);const t=veri(ti,tj);const A=t[w];let fx=(x-ti*TS)/SG,fz=(z-tj*TS)/SG;const i=Math.min(NQ-2,fx|0),j=Math.min(NQ-2,fz|0);fx-=i;fz-=j;
 const a=A[j*NQ+i],b=A[j*NQ+i+1],c=A[(j+1)*NQ+i],d=A[(j+1)*NQ+i+1];return lerp(lerp(a,b,fx),lerp(c,d,fx),fz)}
window.tileH=(x,z)=>ornek('H',x,z);window.tileRD=(x,z)=>ornek('D',x,z);
const cG1=new THREE.Color(),cG2=new THREE.Color(),cDry=new THREE.Color(),cRock=new THREE.Color(),cSand=new THREE.Color('#d6c597'),cDirt=new THREE.Color('#97805c'),cCon=new THREE.Color('#8f8d86'),cGrav=new THREE.Color('#a39883'),cUW=new THREE.Color('#5d6b5a'),cHigh=new THREE.Color('#8a8a6a'),tc=new THREE.Color(),hs={};
function agKur(ti,tj){const t=veri(ti,tj);const RC=RG().cols;cG1.set(RC.g1);cG2.set(RC.g2);cDry.set(RC.dry);cRock.set(RC.rock);
 const pos=new Float32Array(NQ*NQ*3),nor=new Float32Array(NQ*NQ*3),col=new Float32Array(NQ*NQ*3),uv=new Float32Array(NQ*NQ*2);
 for(let j=0;j<NQ;j++)for(let i=0;i<NQ;i++){const id=j*NQ+i,x=ti*TS+i*SG,z=tj*TS+j*SG,h=t.H[id],rd=t.D[id];pos[id*3]=x;pos[id*3+1]=h;pos[id*3+2]=z;uv[id*2]=x/7;uv[id*2+1]=z/7;
  const hx=tileH(x+SG,z)-tileH(x-SG,z),hz=tileH(x,z+SG)-tileH(x,z-SG);const nl=Math.hypot(hx,2*SG,hz);nor[id*3]=-hx/nl;nor[id*3+1]=2*SG/nl;nor[id*3+2]=-hz/nl;const sl=Math.hypot(hx,hz)/(2*SG);
  tc.copy(cG1).lerp(cG2,fbm(x*.02,z*.02,3)*.5+.5).lerp(cDry,clamp(fbm(x*.006+40,z*.006,3)*1.2+.15,0,.75));tc.lerp(cHigh,sstep(420,760,h)*.35);tc.lerp(cRock,sstep(.45,.85,sl));
  if(h<2.8)tc.lerp(cSand,sstep(2.8,.6,h));if(h<-1.5)tc.copy(cUW);
  tc.lerp(cDirt,(1-sstep(7,13,rd))*.8);tc.lerp(cCon,sstep(.4,.7,yardMask(x,z)));tc.lerp(cGrav,sstep(.3,.8,siteMask(x,z)));
  tc.getHSL(hs);tc.setHSL(hs.h,Math.min(1,hs.s*1.22),hs.l);const v=.92+hash2(Math.round(x/SG)*7,Math.round(z/SG)*13)*.16;col[id*3]=tc.r*v;col[id*3+1]=tc.g*v;col[id*3+2]=tc.b*v}
 const idx=[];for(let j=0;j<NQ-1;j++)for(let i=0;i<NQ-1;i++){const a=j*NQ+i,b=a+1,c=a+NQ,d=c+1;idx.push(a,c,b,b,c,d)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();
 const m=new THREE.Mesh(g,agKur.mat);m.receiveShadow=true;m.userData.zemin=1;grp.add(m);MESH.set(ti+','+tj,m)}
window.dunyaKur=function(){DATA.clear();MESH.clear();PARCA.length=0;bkKur();grp=new THREE.Group();grp.userData.zemin=1;scene.add(grp);world.terrain=grp;
 agKur.mat=new THREE.MeshLambertMaterial({vertexColors:true,map:TEX.ground});dunyaAdim(RS[0].x,RS[0].z,1e9,1100);try{yapiKur()}catch(e){console.log('yapi',e)}};
/* tırın çevresindeki karoları kur, uzaktakileri sil */
window.dunyaAdim=function(px,pz,butce,R){if(!grp)return;R=R||(MOBILE?1250:1500);butce=butce==null?(MOBILE?1:2):butce;const ci=Math.floor(px/TS),cj=Math.floor(pz/TS),n=Math.ceil(R/TS)+1;const ist=[];
 for(let a=ci-n;a<=ci+n;a++)for(let b=cj-n;b<=cj+n;b++){const k=a+','+b;if(MESH.has(k))continue;const d=Math.hypot((a+.5)*TS-px,(b+.5)*TS-pz);if(d<R)ist.push([d,a,b])}
 ist.sort((p,q)=>p[0]-q[0]);for(let q=0;q<ist.length&&q<butce;q++)agKur(ist[q][1],ist[q][2]);
 for(const [k,m] of MESH){const [a,b]=k.split(',').map(Number);if(Math.hypot((a+.5)*TS-px,(b+.5)*TS-pz)>R+500){grp.remove(m);m.geometry.dispose();MESH.delete(k)}}
 if(DATA.size>2500){for(const k of DATA.keys()){if(DATA.size<=1800)break;if(!MESH.has(k))DATA.delete(k)}}};
window.dunyaKaroSay=()=>({ag:MESH.size,veri:DATA.size});
/* parçalı ağaçlar: ≈500 örnekte (≈1,1 km) bir parça, her parçanın kendi örnekli ağları */
window.agacParca=function(){const N0=MOBILE?320:520,AD=500;const d=new THREE.Object3D(),col=new THREE.Color();const pg=pineGeo(),lg=leafGeo(),tg=new THREE.CylinderGeometry(.22,.32,2.4,5);
 const m1=P('#2f5a2c',{shininess:8}),m2=P('#3f6b30',{shininess:8}),m3=P('#5a4128');
 for(let i0=0;i0<NS;i0+=AD){const i1=Math.min(NS,i0+AD);const N=Math.max(60,Math.round(N0*(i1-i0)/AD));
  const crown=new THREE.InstancedMesh(pg,m1,N),crown2=new THREE.InstancedMesh(lg,m2,N),trunk=new THREE.InstancedMesh(tg,m3,N*2);let c1=0,c2=0,ct=0,tries=0;
  while(c1+c2<N&&tries<N*10){tries++;const i=i0+Math.floor(rnd()*(i1-i0));const off=(rnd()<.5?-1:1)*(12+Math.pow(rnd(),1.6)*380);const p=sideAt(i,off);const x=p.x+(rnd()-.5)*30,z=p.z+(rnd()-.5)*30;
   const h=getH(x,z);if(h<3.5)continue;const rd=getRD(x,z);if(rd<12)continue;if(yardMask(x,z)>0.01||siteMask(x,z)>0.01||onPad(x,z))continue;if(world.turbines.some(q=>Math.hypot(q.x-x,q.z-z)<12))continue;if(DOLU.has(dk(x,z))||(window.KENT&&KENT[i]&&Math.abs(off)<120&&rnd()<.85))continue;
   if(fbm(x*.01+9,z*.01,3)<-.05&&rnd()<.8)continue;const s=.7+rnd()*.7;const pine=h>320?rnd()<.8:rnd()<.35;
   if(pine&&c1<N){d.position.set(x,h+2.4*s+3.2*s,z);d.scale.set(s,s,s);d.rotation.set(0,rnd()*6,0);d.updateMatrix();crown.setMatrixAt(c1,d.matrix);col.setHSL(.27+rnd()*.06,.45,.22+rnd()*.08);crown.setColorAt(c1,col);c1++}
   else if(c2<N){d.position.set(x,h+2.4*s+1.8*s,z);d.scale.set(s*.95,s*.85,s*.95);d.rotation.set(0,rnd()*6,0);d.updateMatrix();crown2.setMatrixAt(c2,d.matrix);col.setHSL(.2+rnd()*.08,.5,.24+rnd()*.1);crown2.setColorAt(c2,col);c2++}else continue;
   d.position.set(x,h+1.2*s,z);d.scale.set(s,s,s);d.rotation.set(0,0,0);d.updateMatrix();trunk.setMatrixAt(ct++,d.matrix)}
  crown.count=c1;crown2.count=c2;trunk.count=ct;const g=new THREE.Group();for(const m of[crown,crown2,trunk]){m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;if(m.instanceColor)m.instanceColor.needsUpdate=true;g.add(m)}
  scene.add(g);PARCA.push({i0,i1,g})}};

/* ---------- Yerleşim (gerçek veri: OSM bina dokusu) ----------
   80 m'lik hücrelerdeki gerçek bina sayısı, taban alanı ve yönüyle binalar kurulur. Kat sayısı yoğunluktan:
   sık hücre (kent) 4-7 kat apartman, orta 2-4 kat, seyrek 1-2 kat ev; 800 m²'yi aşan taban sanayi/depo (8-10 m).
   Yol zarfına ve kameraya yer (yoldan 12 m + yarım köşegen) ve liman/saha/tesis zeminlerine bina konmaz. Binalar katıdır (js/kati.js kendiliğinden tarar).
   KENT[i]: yolun o noktasında gerçekten kurulan binalara göre (yoldan 90 m, yol boyunca ±150 m'de 8+ bina) varsa hız sınırı 50. */
window.KENT=null;const DOLU=new Set();const dk=(x,z)=>Math.floor(x/20)+','+Math.floor(z/20);
let facTex=null;function cephe(){if(facTex)return facTex;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,64,64);
 g.fillStyle='#e6e2da';g.fillRect(0,58,64,6);g.fillStyle='#3d4a57';g.fillRect(8,16,18,26);g.fillRect(38,16,18,26);g.fillStyle='#8fa3b4';g.fillRect(9,17,8,12);g.fillRect(39,17,8,12);
 g.fillStyle='#c9c4ba';g.fillRect(4,42,26,4);g.fillRect(34,42,26,4);facTex=new THREE.CanvasTexture(c);facTex.wrapS=facTex.wrapT=THREE.RepeatWrapping;return facTex}
function kutuGeo(kat,yatay){const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);const uv=g.attributes.uv,n=g.attributes.normal;
 for(let k=0;k<uv.count;k++){if(Math.abs(n.getY(k))>.5){uv.setXY(k,.02,.95);continue}uv.setXY(k,uv.getX(k)*yatay,uv.getY(k)*kat)}uv.needsUpdate=true;return g}
const RENK=['#f1e6cf','#efe2c8','#f4efe6','#e9d3b5','#f0d9c4','#e7e0d2','#ddd3c0','#f2e0cf','#e8d9b8'];
window.yapiKur=function(){DOLU.clear();window.KENT=new Uint8Array(NS);const GR=ROTA.yol(RG().rota);if(!GR||!GR.bina)return;const Bv=GR.bina;
 const p0=GR.ileri(0,0),p1=GR.ileri(1,0);const rot=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]);
 const grup={},ekle=(key,x,z,w,d,h,ang,col)=>{(grup[key]=grup[key]||[]).push([x,z,w,d,h,ang,col])};let sn=0;
 const rh=(a,b)=>hash2(a*13+b*7+(sn++),a-b*3);
 for(const s of Bv.H.split(';')){const [i,j,n,a10,ad]=s.split(',').map(Number);const A=a10*10;const kat0=n>=10?4:n>=4?2:1,kat1=n>=10?7:n>=4?4:2;
  for(let q=0;q<n;q++){const e=(i+rh(i,j))*80,nn=(j+rh(j,i))*80;const p=GR.ileri(e,nn);const x=p[0],z=p[1];
   const big=A>800;const asp=1+rh(i+q,j)*.8;const w=Math.min(60,Math.sqrt(A*asp)),d=Math.min(60,A/w);
   const rd=getRD(x,z);if(rd<12+Math.hypot(w,d)/2)continue;if(yardMask(x,z)>.01||siteMask(x,z)>.01||onPad(x,z))continue;if(getH(x,z)<1)continue;if(DOLU.has(dk(x,z)))continue;
   const ang=-(ad*Math.PI/180+rot)+(rh(q,i)<.5?0:Math.PI/2);const kat=big?0:Math.round(kat0+rh(q,j)*(kat1-kat0));const h=big?8+rh(i,q)*2:kat*3+.6;
   DOLU.add(dk(x,z));ekle(big?'s':'k'+kat,x,z,w,d,h,ang,big?'#c9ccc8':RENK[Math.floor(rh(i*3,q)*RENK.length)])}}
 /* parça: yol örneğine göre 500'lük gruplar */const mat={};const dm=new THREE.Object3D(),col=new THREE.Color();const parc={};
 for(const key in grup)for(const b of grup[key]){const k=Math.floor(yakinIdx(b[0],b[1])/500);((parc[k]=parc[k]||{})[key]=parc[k][key]||[]).push(b)}
 for(const k in parc){const g=new THREE.Group();for(const key in parc[k]){const L=parc[k][key];const kat=key==='s'?3:+key.slice(1);
   const m=mat[key]||(mat[key]=new THREE.MeshLambertMaterial({map:key==='s'?null:cephe()}));const im=new THREE.InstancedMesh(kutuGeo(Math.max(1,kat),key==='s'?1:3),m,L.length);
   L.forEach((b,ii)=>{const y=Math.min(getH(b[0]-b[2]/2,b[1]),getH(b[0]+b[2]/2,b[1]),getH(b[0],b[1]-b[3]/2),getH(b[0],b[1]+b[3]/2))-.6;dm.position.set(b[0],y,b[1]);dm.rotation.set(0,b[5],0);dm.scale.set(b[2],b[4]+.6,b[3]);dm.updateMatrix();im.setMatrixAt(ii,dm.matrix);col.set(b[6]);im.setColorAt(ii,col)});
   im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;if(im.instanceColor)im.instanceColor.needsUpdate=true;g.add(im)}
  scene.add(g);PARCA.push({i0:+k*500,i1:+k*500+500,g})}
 /* camiler: gerçek konum; ışıkla değil yapı olarak (saygı kuralı: yalnız durağan yapı, etkileşim yok) */
 const tas=P('#ebe6dc',{shininess:12}),kur=P('#8d969c',{shininess:40});
 for(const s of Bv.C.split(';')){const [e,nn,A]=s.split(',').map(Number);const p=GR.ileri(e,nn);const x=p[0],z=p[1];const r=Math.sqrt(A)/2;if(getRD(x,z)<12+r*1.5)continue;
  const y=getH(x,z)-.4;const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=-rot;const b=new THREE.Mesh(new THREE.BoxGeometry(r*2,r*1.1,r*2),tas);b.position.y=r*.55;g.add(b);
  const k=new THREE.Mesh(new THREE.SphereGeometry(r*.78,18,10,0,Math.PI*2,0,Math.PI/2),kur);k.position.y=r*1.1;g.add(k);
  const mh=r*3.2;const mn=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.1,mh,10),tas);mn.position.set(r*1.25,mh/2,-r*1.25);g.add(mn);const sr=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,.6,10),tas);sr.position.set(r*1.25,mh*.78,-r*1.25);g.add(sr);
  const kl=new THREE.Mesh(new THREE.ConeGeometry(1,3.4,10),kur);kl.position.set(r*1.25,mh+1.7,-r*1.25);g.add(kl);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});scene.add(g);DOLU.add(dk(x,z))}
 /* kent kesimi: gerçekten kurulan binalardan; yoldan 90 m içinde, yol boyunca ±150 m'de en az 8 bina varsa hız sınırı 50 */
 const say=new Uint16Array(NS);for(const key in grup)for(const b of grup[key]){const n=yakin(b[0],b[1]);if(n.rd<90)say[n.k]++}
 const W=Math.round(150/2.2);let acc=0;const pre=new Uint32Array(NS+1);for(let i=0;i<NS;i++)pre[i+1]=pre[i]+say[i];
 for(let i=0;i<NS;i++){const a=Math.max(0,i-W),b=Math.min(NS,i+W);if(pre[b]-pre[a]>=8)KENT[i]=1}
 /* 300 m'den kısa açıklıklar kapanır (tabela sık sık değişmesin) */let son=-1;for(let i=0;i<NS;i++)if(KENT[i]){if(son>=0&&i-son>1&&i-son<136)for(let q=son;q<i;q++)KENT[q]=1;son=i}};
function yakinIdx(x,z){return yakin(x,z).rd<999?yakin(x,z).k:(()=>{let bi=0,bd=1e18;for(let i=0;i<NS;i+=8){const d=(RS[i].x-x)**2+(RS[i].z-z)**2;if(d<bd){bd=d;bi=i}}return bi})()}
const _bl=baseLimit;baseLimit=function(i){const b=_bl(i);return TILED&&window.KENT&&KENT[i]&&b>50?50:b};
window.yakinIdxG=(x,z)=>yakinIdx(x,z);window.parcaAdim=function(ti){for(const p of PARCA){const v=ti>p.i0-700&&ti<p.i1+700;if(p.g.visible!==v)p.g.visible=v}};
})();
