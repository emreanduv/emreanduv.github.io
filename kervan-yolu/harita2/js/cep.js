// 1.1: yol kenarı cepleri. Akaryakıt, kantar ve zincir takma ana yolun ortasında değil,
// sağdaki cebe girilip yapılır; iş bitince tır cepten ana yola geri çıkar.
(function(){
'use strict';
const EDGE=4.5;
// ceplerin zemini düzlensin diye stPlan'a düz alan ekle (arazi bundan sonra kurulur)
function dsmRS(i){return RS[Math.max(1,Math.min(NS-1,i))].distanceTo(RS[Math.max(0,Math.min(NS-2,i-1))])||2}
function serPad(c,ilk,son,off,r0){const d=dsmRS(c);for(let i=Math.round(c-ilk/d);i<=Math.round(c+son/d);i+=Math.max(1,Math.round(4/d))){if(i<1||i>=NS-1)continue;const q=sideAt(i,off);PADS.push({x:q.x,z:q.z,y:RY[i]+.02,r0,r1:r0+5})}}
const _sp=stPlan;stPlan=function(){_sp();try{
 if(PLAN&&PLAN.ri)serPad(PLAN.ri,66,66,7.6,3.4);
 if(PLAN&&PLAN.ki)serPad(PLAN.ki,46,46,6,2.4);
 if(RG().snow){const sl=RG().snowLine;let ci=NS-1;for(let i=40;i<NS;i++){if(RY[i]>sl-4){ci=i;break}}serPad(Math.min(NS-90,Math.max(60,ci-18)),58,58,8.2,4.2)}}catch(e){console.log('cep pad',e)}};
let TX=null;
function tex(){if(TX)return TX;const a=ctex(256,256,(q,w,h)=>{q.fillStyle='#45474a';q.fillRect(0,0,w,h);for(let k=0;k<3800;k++){const l=50+Math.random()*60|0;q.fillStyle=`rgba(${l},${l},${l+3},.5)`;q.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2)}
  for(let k=0;k<5;k++){q.strokeStyle='rgba(28,28,30,.35)';q.lineWidth=1+Math.random()*2;q.beginPath();let x=Math.random()*w,y=Math.random()*h;q.moveTo(x,y);for(let j=0;j<6;j++){x+=(Math.random()-.5)*50;y+=Math.random()*40;q.lineTo(x,y)}q.stroke()}},true);
 a.wrapS=a.wrapT=THREE.RepeatWrapping;
 const d=ctex(32,256,(q,w,h)=>{q.clearRect(0,0,w,h);q.fillStyle='#eeeadc';q.fillRect(0,0,w,h*.5)},true);d.wrapS=d.wrapT=THREE.RepeatWrapping;
 const s=ctex(16,16,(q,w,h)=>{q.fillStyle='#eeeadc';q.fillRect(0,0,w,h)},true);
 TX={a,d,s};return TX}
// genişlik profili: giriş rampası (taper) → tam genişlik → çıkış rampası
function prof(i,a,b,t,W){if(i<a-t||i>b+t)return 0;if(i<a){const k=(i-(a-t))/t;return W*k*k*(3-2*k)}if(i>b){const k=((b+t)-i)/t;return W*k*k*(3-2*k)}return W}
function serit(root,i0,i1,fIn,fOut,mat,dy,vScale){const pos=[],uv=[],idx=[];let acc=0,n=0;
 for(let i=i0;i<=i1;i++){if(i<1||i>=NS-1)continue;const oi=fIn(i),oo=fOut(i);const p=sideAt(i,oi),r=sideAt(i,oo);if(n>0)acc+=RS[i].distanceTo(RS[i-1]);
  pos.push(p.x,getH(p.x,p.z)+dy,p.z,r.x,getH(r.x,r.z)+dy,r.z);uv.push(0,acc/vScale,(oo-oi)/6,acc/vScale);if(n>0){const k=(n-1)*2;idx.push(k,k+2,k+1,k+1,k+2,k+3)}n++}
 if(n<2)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,mat);m.receiveShadow=true;root.add(m);return m}
const CEPS=[];
function cep(root,a,b,t,W,outerLine){CEPS.push({a,b,t,W});const T=tex();const dsm=ROADLEN/(NS-1);
 const asf=new THREE.MeshLambertMaterial({map:T.a,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6,side:THREE.DoubleSide});
 const lnD=new THREE.MeshBasicMaterial({map:T.d,transparent:true,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-10,side:THREE.DoubleSide,depthWrite:false});
 const lnS=new THREE.MeshBasicMaterial({map:T.s,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-10,side:THREE.DoubleSide,depthWrite:false});
 const w=i=>prof(i,a,b,t,W);
 serit(root,a-t,b+t,i=>EDGE-.1,i=>EDGE+Math.max(.05,w(i)),asf,.2,8);
 // ana yolla cep arasında kesikli çizgi, cebin dış kenarında düz çizgi
 serit(root,a-t+2,b+t-2,i=>EDGE+.05,i=>EDGE+.22,lnD,.215,6/dsm*dsm);
 if(outerLine)serit(root,a-t,b+t,i=>EDGE+Math.max(0,w(i)-.4),i=>EDGE+Math.max(.17,w(i)-.23),lnS,.215,8);
 // girişte cep levhası (mavi, yol kenarında)
 return {a,b}}
// cebin içinde kalan küçük yol kenarı eşyalarını (direk, levha, kazık) ve çarpışmalarını kaldır
function icinde(x,z){for(const c of CEPS){for(let i=c.a-c.t;i<=c.b+c.t;i++){if(i<1||i>=NS-1)continue;const w=prof(i,c.a,c.b,c.t,c.W);if(w<.6)continue;const a=RS[i-1],b=RS[i+1];let tx=b.x-a.x,tz=b.z-a.z;const l=Math.hypot(tx,tz);tx/=l;tz/=l;const dx=x-RS[i].x,dz=z-RS[i].z;const al=dx*tx+dz*tz,la=-dx*tz+dz*tx;if(Math.abs(al)<=dsmRS(i)*.6+.3&&la>EDGE+.2&&la<EDGE+w+.3)return true}}return false}
function temizle(root){const keep=new Set([root,world.terrain,world.roadMesh,world.water,world.sky]);for(const k in PORTOPS){const o=PORTOPS[k];if(o&&o.g)keep.add(o.g);if(o&&o.ring)keep.add(o.ring)}
 const bx=new THREE.Box3(),sz=new THREE.Vector3();let n=0;
 for(const o of scene.children.slice()){if(keep.has(o)||o.isLight||o.isCamera||o.isInstancedMesh||o.isSprite)continue;if(!o.visible||(o.position.x===0&&o.position.z===0))continue;if(!icinde(o.position.x,o.position.z))continue;bx.setFromObject(o);bx.getSize(sz);if(Math.max(sz.x,sz.z)>6)continue;o.visible=false;n++}
 const m4=new THREE.Matrix4(),v3=new THREE.Vector3(),z4=new THREE.Matrix4().makeScale(0,0,0);
 for(const o of scene.children){if(!o.isInstancedMesh||keep.has(o))continue;let ch=false;for(let k=0;k<o.count;k++){o.getMatrixAt(k,m4);v3.setFromMatrixPosition(m4);if(icinde(v3.x,v3.z)){o.setMatrixAt(k,z4);ch=true;n++}}if(ch)o.instanceMatrix.needsUpdate=true}
 if(typeof OBS!=='undefined')for(let k=OBS.length-1;k>=0;k--){const b=OBS[k];if(b&&b.c&&b.r<2.5&&icinde(b.x,b.z))OBS.splice(k,1)}
 return n}
// cepten önce yol kenarında mavi bilgi levhası (KGM tipi): beyaz çerçeve, P işareti ve tesis adı, altında mesafe
const LV={yakit:['AKARYAKIT','FUEL'],kantar:['KANTAR','WEIGH STATION'],zincir:['ZİNCİR TAKMA','CHAIN-UP AREA']};
function levha(root,i,tip,m){if(i<2||i>=NS-2)return;const tr=(typeof L==='undefined'||L==='tr');const ad=LV[tip][tr?0:1];
 const tx=ctex(256,192,(q,w,h)=>{q.fillStyle='#1d4f9c';q.fillRect(0,0,w,h);q.strokeStyle='#fff';q.lineWidth=7;q.strokeRect(8,8,w-16,h-16);
  q.fillStyle='#fff';q.font='bold 92px "Barlow Condensed",Arial,sans-serif';q.textAlign='center';q.textBaseline='middle';q.fillText('P',58,78);
  q.strokeStyle='#fff';q.lineWidth=5;q.beginPath();q.moveTo(110,128);q.lineTo(150,96);q.lineTo(236,96);q.stroke();
  let fs=34;do{q.font='bold '+fs+'px "Barlow Condensed",Arial,sans-serif';fs--}while(q.measureText(ad).width>132&&fs>14);q.textAlign='left';q.fillText(ad,110,56);q.font='bold 34px "Barlow Condensed",Arial,sans-serif';q.textAlign='center';q.fillText((Math.round(m/50)*50)+' m',128,158)});
 const p=sideAt(i,EDGE+2.6);const y=getH(p.x,p.z);const g=new THREE.Group();g.position.set(p.x,y,p.z);g.rotation.y=p.ang+Math.PI;root.add(g);
 const dir=P('#8f969c');addCyl(.06,.06,3.2,6,dir,-.75,1.6,0,g);addCyl(.06,.06,3.2,6,dir,.75,1.6,0,g);
 const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.65),new THREE.MeshLambertMaterial({map:tx,side:THREE.DoubleSide}));pl.position.set(0,2.75,.08);g.add(pl);
 const ar=new THREE.Mesh(new THREE.PlaneGeometry(2.25,1.7),new THREE.MeshLambertMaterial({color:0x6c7378}));ar.position.set(0,2.75,.04);g.add(ar)}
function kur(){CEPS.length=0;const root=new THREE.Group();scene.add(root);WOBJ.push(root);const dsm=ROADLEN/(NS-1);const n=m=>Math.max(2,Math.round(m/dsm));
 const LVL=[];
 if(PLAN&&PLAN.ri){const ri=PLAN.ri;cep(root,ri-n(30),ri+n(30),n(36),6.2,false);LVL.push([ri-n(30)-n(36),'yakit'])}
 if(PLAN&&PLAN.ki){const ki=PLAN.ki;cep(root,ki-n(16),ki+n(16),n(30),2.2,false);LVL.push([ki-n(16)-n(30),'kantar'])}
 if(typeof CZ!=='undefined'&&CZ&&CZ.ci){const c=CZ.ci;cep(root,c-n(24),c+n(24),n(34),7.2,true);LVL.push([c-n(24)-n(34),'zincir'])}
 // levha cebin ağzından 150 m önce; başka bir cebin içine ya da liman kapısının gerisine düşerse öne kaydırılır, sığmazsa konmaz
 const gi=(PORTOPS&&PORTOPS.gi||30)+8;const icCep=i=>CEPS.some(c=>i>=c.a-c.t-2&&i<=c.b+c.t+2);
 for(const[ag,tip]of LVL){let i=ag-n(150);while(i<ag-n(40)&&(icCep(i)||i<gi))i++;if(i>=ag-n(40)||icCep(i)||i<gi)continue;levha(root,i,tip,(ag-i)*dsm)}
 window._cepTemiz=temizle(root)}
const _br=buildRegion;buildRegion=function(r){_br(r);try{kur()}catch(e){console.log('cep kur',e)}};
})();
