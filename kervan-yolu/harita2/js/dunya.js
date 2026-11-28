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
 agKur.mat=new THREE.MeshLambertMaterial({vertexColors:true,map:TEX.ground});dunyaAdim(RS[0].x,RS[0].z,1e9,1100)};
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
   const h=getH(x,z);if(h<3.5)continue;const rd=getRD(x,z);if(rd<12)continue;if(yardMask(x,z)>0.01||siteMask(x,z)>0.01||onPad(x,z))continue;if(world.turbines.some(q=>Math.hypot(q.x-x,q.z-z)<12))continue;
   if(fbm(x*.01+9,z*.01,3)<-.05&&rnd()<.8)continue;const s=.7+rnd()*.7;const pine=h>320?rnd()<.8:rnd()<.35;
   if(pine&&c1<N){d.position.set(x,h+2.4*s+3.2*s,z);d.scale.set(s,s,s);d.rotation.set(0,rnd()*6,0);d.updateMatrix();crown.setMatrixAt(c1,d.matrix);col.setHSL(.27+rnd()*.06,.45,.22+rnd()*.08);crown.setColorAt(c1,col);c1++}
   else if(c2<N){d.position.set(x,h+2.4*s+1.8*s,z);d.scale.set(s*.95,s*.85,s*.95);d.rotation.set(0,rnd()*6,0);d.updateMatrix();crown2.setMatrixAt(c2,d.matrix);col.setHSL(.2+rnd()*.08,.5,.24+rnd()*.1);crown2.setColorAt(c2,col);c2++}else continue;
   d.position.set(x,h+1.2*s,z);d.scale.set(s,s,s);d.rotation.set(0,0,0);d.updateMatrix();trunk.setMatrixAt(ct++,d.matrix)}
  crown.count=c1;crown2.count=c2;trunk.count=ct;const g=new THREE.Group();for(const m of[crown,crown2,trunk]){m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;if(m.instanceColor)m.instanceColor.needsUpdate=true;g.add(m)}
  scene.add(g);PARCA.push({i0,i1,g})}};
window.parcaAdim=function(ti){for(const p of PARCA){const v=ti>p.i0-700&&ti<p.i1+700;if(p.g.visible!==v)p.g.visible=v}};
})();
