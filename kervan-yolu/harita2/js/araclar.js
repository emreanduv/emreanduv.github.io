/* Kervan Yolu trafik araçları: yan profilden çıkarılmış gövdeler (sedan, hatchback, SUV, dolmuş, şehirlerarası otobüs, çift kabin pikap, traktör, tır),
   camlar, çamurluk boşlukları, aynalar, Türk plakaları; fren lambası, gece farı, dörtlü, ön teker dönüşü, frenle öne yatma. makeVeh'in yerine geçer. */
(function(){
'use strict';
let GLS=null;const PALET=['#f3f3f0','#f3f3f0','#f3f3f0','#c7cacd','#9aa0a6','#4b4f54','#1c1d20','#1f3a66','#8e1d1d','#e5dcc4','#2c5a3c'];
const SEHIR=['34','06','35','16','01','07','42','58','10','17','59','22','55','45','31','27'];
const HARF='ABCDEFGHJKLMNPRSTUVYZ';
function plaka(){const rnd=n=>Math.floor(Math.random()*n);const s=SEHIR[rnd(SEHIR.length)]+' '+HARF[rnd(21)]+HARF[rnd(21)]+' '+(100+rnd(900));
 return ctex(256,56,(q,w,h)=>{q.fillStyle='#fbfbf7';q.fillRect(0,0,w,h);q.fillStyle='#1d4fa3';q.fillRect(0,0,30,h);q.fillStyle='#fff';q.font='700 18px sans-serif';q.textAlign='center';q.fillText('TR',15,38);q.strokeStyle='#111';q.lineWidth=3;q.strokeRect(1.5,1.5,w-3,h-3);q.fillStyle='#111';q.font='700 36px "DIN Alternate","Barlow Condensed",sans-serif';q.fillText(s,143,41)})}
// yan profil (z ileri negatif, y yukarı) → genişlik boyunca çıkarılmış gövde
function prof(pts,w,mat,par,bev,x0){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(-p[0],p[1]):s.moveTo(-p[0],p[1]));const b=bev==null?.06:bev;
 const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.01,w-b*2),bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:4});g.rotateY(Math.PI/2);g.translate(-(w-b*2)/2+(x0||0),0,0);
 const m=new THREE.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;par.add(m);return m}
function arch(par,x,z,r,side){const m=new THREE.Mesh(new THREE.CylinderGeometry(r*1.12,r*1.12,.08,16,1,false,0,Math.PI),MAT.dark);m.rotation.z=Math.PI/2;m.rotation.y=Math.PI/2*0;m.position.set(x+side*.005,r*.98,z);m.rotation.x=0;m.rotation.order='ZXY';par.add(m);return m}
function aynalar(g,x,y,z,pm){for(const s of[1,-1]){const a=addBox(.06,.06,.18,MAT.dark,s*(x+.05),y,z,g);const k=addBox(.08,.16,.22,pm,s*(x+.14),y+.02,z+.02,g);k.userData.paint=true}}
function isiklar(V,g,zf,zr,w,y,yr,big){const H=[],T=[],I=[];for(const s of[1,-1]){const h=addBox(big?.42:.34,big?.2:.15,.06,new THREE.MeshStandardMaterial({color:0xf4f6f2,emissive:0x000000,roughness:.2,metalness:.2}),s*w,y,zf,g);H.push(h);
  const t=addBox(big?.36:.3,big?.22:.14,.06,new THREE.MeshStandardMaterial({color:0x8a1111,emissive:0x220000,roughness:.4}),s*w,yr==null?y:yr,zr,g);T.push(t);
  const i1=addBox(.12,.1,.06,new THREE.MeshBasicMaterial({color:0x5a3a08}),s*(w+(big?.26:.2)),y,zf,g),i2=addBox(.1,.1,.06,new THREE.MeshBasicMaterial({color:0x5a3a08}),s*(w-(big?.26:.22)),yr==null?y:yr,zr+.001,g);I.push([s,i1],[s,i2])}
 V.H=H;V.T=T;V.I=I}
function plakaTak(g,zf,zr,y,yr){const t=plaka();for(const [z,yy,ry] of[[zf,y,Math.PI],[zr,yr==null?y:yr,0]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(.52,.115),new THREE.MeshBasicMaterial({map:t}));p.position.set(0,yy,z+(ry?-.01:.01));p.rotation.y=ry;g.add(p)}}


// ön/arka cam: profil kenarına paralel, dışa 2 cm itilmiş düzlem
function camP(g,a,b,w,mat,out){const dz=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dz,dy);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,L),mat);const nz=-dy/L*(out||1),ny=dz/L*(out||1);m.position.set(0,(a[1]+b[1])/2+ny*.025,(a[0]+b[0])/2+nz*.025);m.rotation.x=-Math.atan2(dy,dz)+Math.PI/2*(out||1)*0;m.lookAt(m.position.x,m.position.y+ny,m.position.z+nz);g.add(m);m.material.side=THREE.DoubleSide;return m}
function makeVeh2(type){const g=new THREE.Group();g.rotation.order='YXZ';const W=[];const col=PALET[Math.floor(Math.random()*PALET.length)];const pm=P(col,{shininess:95,specular:0x777777});
 const V={g,W,type,len:4.4,wid:1.8,spd0:19,spd:19,i:0,dir:1,off:0,on:false,brake:false,honk:0,crashT:0,FW:[],pitch:0};const paint=m=>{m.userData.paint=true;return m};const glass=GLS||(GLS=new THREE.MeshStandardMaterial({color:0x18222a,roughness:.12,metalness:.35,envMapIntensity:.55}));
 let sub=type;if(type==='oto'){const r=Math.random();sub=r<.45?'sedan':r<.8?'hatch':'suv'}
 if(sub==='sedan'){const w=1.78;
  paint(prof([[-2.3,.38],[-2.32,.7],[-2.2,.82],[-1.25,.95],[-.55,1.42],[.65,1.44],[1.4,1.02],[2.25,.96],[2.32,.72],[2.28,.38]],w,pm,g));
  prof([[-1.18,.97],[-.55,1.38],[.62,1.4],[1.32,1.0]],w+.02,glass,g,.02);camP(g,[-1.25,.95],[-.55,1.42],w*.9,glass);camP(g,[.65,1.44],[1.4,1.02],w*.9,glass);addBox(.05,.42,.06,MAT.dark,w/2+.005,1.17,.05,g);addBox(.05,.42,.06,MAT.dark,-w/2-.005,1.17,.05,g);
  addBox(w+.02,.18,.1,MAT.dark2,0,.42,-2.33,g);addBox(w+.02,.18,.1,MAT.dark2,0,.42,2.3,g);addBox(.9,.18,.05,MAT.dark,0,.62,-2.33,g);
  for(const z of[-1.42,1.38])for(const x of[-.8,.8]){const wh=wheel(.33,.22,x,.33,z,g,W);if(z<0)V.FW.push(W[W.length-1])}
  isiklar(V,g,-2.33,2.31,.62,.72,.8);plakaTak(g,-2.37,2.36,.42,.44);aynalar(g,.88,1.0,-.62,pm);V.len=4.6;V.wid=1.8;V.spd0=V.spd=19+Math.random()*3}
 else if(sub==='hatch'){const w=1.74;
  paint(prof([[-1.95,.38],[-1.98,.72],[-1.8,.84],[-1.0,.97],[-.35,1.45],[1.05,1.47],[1.9,1.2],[1.98,.72],[1.95,.38]],w,pm,g));
  prof([[-.95,.99],[-.35,1.41],[1.02,1.43],[1.82,1.18],[1.86,1.0]],w+.02,glass,g,.02);camP(g,[-1.0,.97],[-.35,1.45],w*.9,glass);camP(g,[1.05,1.47],[1.9,1.2],w*.86,glass);addBox(.05,.4,.06,MAT.dark,w/2+.005,1.18,.3,g);addBox(.05,.4,.06,MAT.dark,-w/2-.005,1.18,.3,g);
  addBox(w+.02,.18,.1,MAT.dark2,0,.42,-1.98,g);addBox(w+.02,.18,.1,MAT.dark2,0,.42,1.96,g);
  for(const z of[-1.25,1.25])for(const x of[-.78,.78]){wheel(.32,.21,x,.32,z,g,W);if(z<0)V.FW.push(W[W.length-1])}
  isiklar(V,g,-1.99,1.99,.6,.74,.95);plakaTak(g,-2.03,2.02,.42,.5);aynalar(g,.86,1.02,-.4,pm);V.len=4;V.wid=1.76;V.spd0=V.spd=18+Math.random()*3}
 else if(sub==='suv'){const w=1.88;
  paint(prof([[-2.3,.5],[-2.33,.9],[-2.15,1.04],[-1.35,1.15],[-.75,1.68],[1.75,1.7],[2.3,1.55],[2.33,.9],[2.3,.5]],w,pm,g));
  prof([[-1.28,1.17],[-.75,1.64],[1.72,1.66],[2.2,1.5],[2.22,1.2]],w+.02,glass,g,.02);camP(g,[-1.35,1.15],[-.75,1.68],w*.9,glass);for(const z of[.25,1.25])for(const s of[1,-1])addBox(.05,.45,.07,MAT.dark,s*(w/2+.005),1.4,z,g);
  addBox(w+.04,.3,.12,MAT.dark2,0,.55,-2.34,g);addBox(w+.04,.3,.12,MAT.dark2,0,.55,2.33,g);for(const s of[1,-1])addBox(.06,.08,3.2,MAT.dark,s*.7,1.74,.5,g);
  for(const z of[-1.45,1.45])for(const x of[-.85,.85]){wheel(.38,.25,x,.38,z,g,W);if(z<0)V.FW.push(W[W.length-1])}
  isiklar(V,g,-2.34,2.34,.66,.92,1.1);plakaTak(g,-2.4,2.4,.55,.6);aynalar(g,.95,1.2,-.85,pm);V.len=4.7;V.wid=1.9;V.spd0=V.spd=19+Math.random()*3}
 else if(type==='dolmus'){const w=2.0,cm=P('#f1ead2',{shininess:80});
  paint(prof([[-2.95,.42],[-3.0,1.0],[-2.75,1.25],[-2.2,1.55],[-1.75,2.55],[2.9,2.6],[2.98,2.4],[2.98,.42]],w,cm,g));
  prof([[-2.15,1.58],[-1.75,2.48],[-1.2,2.5],[-1.2,1.6]],w+.02,glass,g,.02);camP(g,[-2.2,1.55],[-1.75,2.55],w*.92,glass);for(let k=0;k<4;k++)addBox(w+.02,.62,.92,glass,0,2.02,-.5+k*.95,g);addBox(w-.3,.7,.05,glass,0,1.95,2.99,g);
  addBox(w+.02,.22,5.9,P('#d9a21b'),0,.95,0,g);addBox(w+.04,.22,.1,MAT.dark2,0,.5,-3.0,g);addBox(w+.04,.22,.1,MAT.dark2,0,.5,2.99,g);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.3),new THREE.MeshBasicMaterial({map:ctex(256,64,(q,ww,h)=>{q.fillStyle='#f2c230';q.fillRect(0,0,ww,h);q.fillStyle='#111';q.font='800 40px "Barlow Condensed",sans-serif';q.textAlign='center';q.fillText(L==='tr'?'DOLMUŞ':'MINIBUS',ww/2,48)})}));sg.position.set(0,2.72,-1.6);sg.rotation.y=Math.PI;g.add(sg);addBox(1.24,.34,.08,MAT.dark,0,2.72,-1.55,g);
  for(const z of[-1.95,2.0])for(const x of[-.92,.92]){wheel(.37,.24,x,.37,z,g,W);if(z<0)V.FW.push(W[W.length-1])}
  isiklar(V,g,-3.01,3.0,.72,.95,1.0);plakaTak(g,-3.05,3.04,.5,.55);aynalar(g,1.02,1.75,-2.1,cm);V.len=6;V.wid=2;V.spd0=V.spd=17}
 else if(type==='otobus'){const w=2.52,bm=P('#f4f5f3',{shininess:85});
  paint(prof([[-6.0,.55],[-6.05,2.2],[-5.85,3.25],[-5.4,3.55],[5.8,3.55],[6.05,3.3],[6.05,.55]],w,bm,g,.1));
  prof([[-6.02,1.55],[-5.88,3.15],[-5.5,3.4],[-5.3,1.55]],w+.02,glass,g,.03);addBox(w+.03,1.05,10.4,glass,0,2.55,.55,g);for(let k=0;k<7;k++)addBox(w+.04,1.06,.08,MAT.dark,0,2.55,-4.2+k*1.6,g);
  addBox(w+.03,.3,12.1,P('#b3202a'),0,1.55,0,g);addBox(w+.03,.12,12.1,P('#20304a'),0,1.32,0,g);addBox(.04,2.2,1.0,glass,w/2+.01,1.55,-4.9,g);
  addBox(w+.03,.4,.14,MAT.dark2,0,.75,-6.07,g);addBox(w+.03,.4,.14,MAT.dark2,0,.75,6.07,g);addBox(w-.4,.5,.05,MAT.dark,0,3.25,6.07,g);
  const ds=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.3),new THREE.MeshBasicMaterial({map:ctex(512,80,(q,ww,h)=>{q.fillStyle='#0b0d0c';q.fillRect(0,0,ww,h);q.fillStyle='#ffb21a';q.font='700 46px monospace';q.textAlign='center';q.fillText(L==='tr'?'ŞEHİRLERARASI':'INTERCITY',ww/2,58)})}));ds.position.set(0,3.32,-6.07);ds.rotation.y=Math.PI;g.add(ds);
  for(const z of[-4.1,3.1,4.5])for(const x of[-1.1,1.1]){wheel(.52,.3,x,.52,z,g,W);if(z<0)V.FW.push(W[W.length-1])}
  isiklar(V,g,-6.08,6.08,1.0,1.0,1.2,true);plakaTak(g,-6.12,6.12,.75,.95);aynalar(g,1.32,2.6,-5.75,bm);V.len=12.1;V.wid=2.55;V.spd0=V.spd=21}
 else if(type==='pikap'){const w=1.86;
  paint(prof([[-2.7,.5],[-2.72,.98],[-2.5,1.12],[-1.75,1.2],[-1.15,1.82],[.55,1.84],[.65,1.18],[2.7,1.18],[2.72,.5]],w,pm,g));
  prof([[-1.7,1.22],[-1.15,1.78],[.52,1.8],[.56,1.25]],w+.02,glass,g,.02);camP(g,[-1.75,1.2],[-1.15,1.82],w*.9,glass);for(const s of[1,-1])addBox(.05,.5,.07,MAT.dark,s*(w/2+.005),1.5,-.35,g);
  addBox(w-.16,.06,1.95,MAT.dark,0,1.12,1.65,g);addBox(w,.4,.06,pm,0,1.0,2.7,g).userData.paint=true;addBox(.05,.36,2.0,MAT.dark2,w/2-.02,1.36,1.65,g);addBox(.05,.36,2.0,MAT.dark2,-w/2+.02,1.36,1.65,g);
  addBox(w+.04,.26,.12,MAT.dark2,0,.55,-2.74,g);addBox(w+.04,.2,.12,MAT.chrome,0,.55,2.74,g);
  for(const z of[-1.7,1.6])for(const x of[-.88,.88]){wheel(.4,.27,x,.4,z,g,W);if(z<0)V.FW.push(W[W.length-1])}
  isiklar(V,g,-2.74,2.73,.68,.95,1.0);plakaTak(g,-2.78,2.78,.55,.56);aynalar(g,.96,1.4,-1.5,pm);V.len=5.4;V.wid=1.9;V.spd0=V.spd=18}
 else if(type==='tir'){const cab=P(['#f3f3f0','#2a5ea8','#b51f1f','#e7e7e2'][Math.floor(Math.random()*4)],{shininess:80});const w=2.5;
  paint(prof([[-8.3,.75],[-8.36,2.4],[-8.2,3.55],[-7.7,3.85],[-6.2,3.85],[-6.1,.75]],w,cab,g,.12));prof([[-8.33,2.55],[-8.2,3.45],[-7.7,3.72],[-7.6,2.55]],w+.02,glass,g,.03);camP(g,[-8.36,2.5],[-8.22,3.5],w*.9,glass);
  addBox(w+.02,.5,.14,MAT.dark2,0,1.0,-8.4,g);addBox(1.5,.6,.06,MAT.chrome,0,1.85,-8.39,g);addBox(.06,.4,1.6,MAT.dark,w/2+.02,1.0,-7.2,g);
  const tm=P(['#e6e6e2','#d9d9d3','#3a5f8a','#8a8f94'][Math.floor(Math.random()*4)],{shininess:30});const tr=rbox(2.52,3.0,13.4,.06,tm,0,2.55,1.0,g);tr.userData.paint=false;addBox(2.3,.22,13.2,MAT.dark2,0,.95,1.0,g);
  for(let k=0;k<14;k++)addBox(2.54,2.9,.04,P('#c9cbcd',{shininess:40}),0,2.55,-5.6+k*.98,g);
  for(const z of[-7.4,-5.2,-4.0,5.0,6.3,7.6])for(const x of[-1.05,1.05]){wheel(.52,.36,x,.52,z,g,W);if(z<-7)V.FW.push(W[W.length-1])}
  isiklar(V,g,-8.42,7.72,.95,1.0,1.05,true);plakaTak(g,-8.46,7.74,.85,.9);aynalar(g,1.32,2.8,-7.9,cab);V.len=16.5;V.wid=2.55;V.spd0=V.spd=17}
 else{ // traktör (kırmızı, arkası römorklu değil)
  const rd=P('#b52417',{shininess:55});prof([[-2.05,.85],[-2.1,1.45],[-1.9,1.62],[-.3,1.66],[-.2,1.0],[-.6,.85]],1.0,rd,g,.06).userData.paint=false;addBox(.9,.5,.08,MAT.dark,0,1.25,-2.11,g);for(let k=0;k<6;k++)addBox(.92,.04,.09,MAT.chrome,0,1.05+k*.08,-2.12,g);
  const kb=new THREE.Group();kb.position.set(0,1.55,.35);g.add(kb);for(const x of[-.62,.62])for(const z of[-.55,.55])addBox(.06,1.3,.06,MAT.dark,x,.75,z,kb);addBox(1.38,.08,1.28,rd,0,1.42,0,kb);addBox(1.2,.9,.04,glass,0,.85,-.56,kb);addBox(.4,.1,.4,MAT.dark,0,.2,.15,kb);
  for(const s of[1,-1]){const f=addBox(.55,.08,1.3,rd,s*.96,1.98,.65,g);f.rotation.z=s*.1}addCyl(.07,.07,1.2,8,MAT.dark,.35,2.25,-1.25,g);
  wheel(.85,.48,.95,.85,.7,g,W);wheel(.85,.48,-.95,.85,.7,g,W);wheel(.48,.26,.72,.48,-1.45,g,W);V.FW.push(W[W.length-1]);wheel(.48,.26,-.72,.48,-1.45,g,W);V.FW.push(W[W.length-1]);
  isiklar(V,g,-2.13,1.35,.32,1.45,1.2);V.len=3.6;V.wid=2.1;V.spd0=V.spd=7.5}
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.visible=false;scene.add(g);return V}
makeVeh=makeVeh2;
// tekerlek: yuvarlatılmış lastik (lathe) + jant kapağı dokusu (5 kollu), geometri önbellekli
const WG={};let JT=null,JM=null,TM=null;
function wheel2(r,w,x,y,z,parent,arr){const k=r.toFixed(2)+'_'+w.toFixed(2);if(!WG[k]){const pts=[];const n=8;for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI;pts.push(new THREE.Vector2(r*.62+Math.cos(a)*r*.38*(i===0||i===n?.9:1)+ (Math.abs(Math.sin(a))<.98?r*.0:0),Math.sin(a)*w/2))}
  const tg=new THREE.LatheGeometry(pts,22);tg.rotateZ(Math.PI/2);WG[k]={tg,rg:new THREE.CylinderGeometry(r*.6,r*.6,w*.92,18)};WG[k].rg.rotateZ(Math.PI/2)}
 if(!JT){JT=ctex(128,128,(q,ww,h)=>{q.fillStyle='#b9bec2';q.fillRect(0,0,ww,h);const c=ww/2;q.fillStyle='#2a2d30';for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.3;q.beginPath();q.ellipse(c+Math.cos(a)*34,c+Math.sin(a)*34,14,20,a,0,7);q.fill()}q.fillStyle='#8e9499';q.beginPath();q.arc(c,c,14,0,7);q.fill();q.strokeStyle='#6f757a';q.lineWidth=6;q.beginPath();q.arc(c,c,60,0,7);q.stroke()});
  JM=[new THREE.MeshStandardMaterial({color:0x9aa0a5,roughness:.35,metalness:.6}),new THREE.MeshStandardMaterial({map:JT,roughness:.35,metalness:.5}),new THREE.MeshStandardMaterial({map:JT,roughness:.35,metalness:.5})];TM=new THREE.MeshStandardMaterial({color:0x1b1c1e,roughness:.9})}
 const g=new THREE.Group();g.rotation.order='YXZ';g.position.set(x,y,z);const ty=new THREE.Mesh(WG[k].tg,TM);ty.castShadow=true;g.add(ty);const rim=new THREE.Mesh(WG[k].rg,JM);g.add(rim);parent.add(g);arr&&arr.push({g,r});return g}
wheel=wheel2;


// davranış: fren lambası, gece farı, sinyal/dörtlü, ön teker dönüşü, frenle yunuslama
window.vehAnim=function(c,dt,h){const night=CUR_TOD==='gece'||CUR_TOD==='aksam';const prev=c._v==null?c.cur:c._v;const dec=(prev-(c.cur||0))/Math.max(dt,1e-3);c._v=c.cur;
 const br=c.brake||dec>1.2;if(c.T)for(const t of c.T){t.material.emissive.setHex(br?0xff1a1a:night?0x661010:0x220000);t.material.emissiveIntensity=br?1.6:1}
 if(c.H)for(const t of c.H){t.material.emissive.setHex(night?0xfff1c8:0x000000);t.material.emissiveIntensity=night?1.3:0}
 const tt=(G&&G.t)||0;const haz=c.yield&&(c.cur||0)<2;const on=Math.floor(tt*2.6)%2===0;if(c.I)for(const[s,m]of c.I)m.material.color.setHex(haz&&on?0xffa31a:0x5a3a08);
 const ph=h-(c._h==null?h:c._h);c._h=h;let st=Math.max(-.45,Math.min(.45,(Math.abs(ph)<1?ph:0)/Math.max(dt,1e-3)*.35));c._st=(c._st||0)+(st-(c._st||0))*.2;for(const w of c.FW||[])w.g.rotation.y=c._st;
 c.pitch+=((br?.03:dec<-0.8?-.012:0)-c.pitch)*Math.min(1,dt*6);c.g.rotation.x=c.pitch};

// eskort ve polis: gerçek LED tepe lambası (gövde + mercekler + gece ışığı), direkli GENİŞ YÜK levhası
function ledBar(g,y,z,w,cols){const h=new THREE.Group();h.position.set(0,y,z);g.add(h);
 const base=new THREE.Mesh(new THREE.BoxGeometry(w,.09,.34),new THREE.MeshStandardMaterial({color:0x1a1c1f,roughness:.5,metalness:.4}));h.add(base);
 for(const s of[1,-1]){const ft=new THREE.Mesh(new THREE.BoxGeometry(.08,.09,.24),base.material);ft.position.set(s*(w/2-.18),-.08,0);h.add(ft)}
 const out=[];const n=cols.length;const lw=(w-.06)/n;
 cols.forEach((c,i)=>{const x=-w/2+.03+lw*(i+.5);const dim=new THREE.Mesh(new THREE.BoxGeometry(lw-.03,.13,.3),new THREE.MeshStandardMaterial({color:c,roughness:.15,metalness:.1,transparent:true,opacity:.55}));dim.position.set(x,.1,0);h.add(dim);
  const lit=new THREE.Mesh(new THREE.BoxGeometry(lw-.02,.135,.305),new THREE.MeshBasicMaterial({color:c}));lit.position.copy(dim.position);h.add(lit);out.push(lit)});
 return out}
mkEsc=function(){const E=makeVeh('pikap');E.g.children.forEach(o=>{if(o.userData.paint)o.material=P('#f4f4f0',{shininess:80})});
 const L1=ledBar(E.g,1.94,-.35,1.5,[0xff9a1a,0xff9a1a,0xff9a1a,0xff9a1a]);E.beac=[{set visible(v){L1[0].visible=L1[2].visible=v}},{set visible(v){L1[1].visible=L1[3].visible=v}}];
 // kasada direkli levha çerçevesi (arkaya ve öne okunur)
 const pm=new THREE.MeshStandardMaterial({color:0x2a2d30,roughness:.6,metalness:.5});for(const x of[-.78,.78])addBox(.06,1.0,.06,pm,x,1.65,2.45,E.g);addBox(1.62,.06,.06,pm,0,2.13,2.45,E.g);
 const tx=ctex(256,88,(q,w,h)=>{q.fillStyle='#f2c230';q.fillRect(0,0,w,h);q.fillStyle='#d0141a';for(let i=-2;i<12;i++){q.beginPath();q.moveTo(i*28,0);q.lineTo(i*28+14,0);q.lineTo(i*28-6,h);q.lineTo(i*28-20,h);q.fill()}q.fillStyle='#f2c230';q.fillRect(10,10,w-20,h-20);q.fillStyle='#111';q.font='800 34px "Barlow Condensed",sans-serif';q.textAlign='center';q.fillText(L==='tr'?'DİKKAT GENİŞ YÜK':'WIDE LOAD',w/2,58)});
 const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.55),new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide}));sg.position.set(0,1.8,2.47);E.g.add(sg);
 const sf=sg.clone();sf.position.set(0,2.44,-.35);sf.scale.set(.9,.8,1);sf.rotation.y=Math.PI;E.g.add(sf);signBacks([E.g]);
 E.g.visible=false;return E};
mkPol=function(){const R0=Math.random;Math.random=()=>.1;let P2;try{P2=makeVeh('oto')}finally{Math.random=R0}P2.g.children.forEach(o=>{if(o.userData.paint)o.material=P('#f4f5f6',{shininess:90})});
 let top=1.44;P2.g.traverse(o=>{if(o.isMesh&&o.geometry){o.geometry.computeBoundingBox&&o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;if(b&&o.position.y+b.max.y>top&&o.position.y+b.max.y<2.2)top=o.position.y+b.max.y}});
 P2.band=[];for(const s of[1,-1]){const b=addBox(.03,.26,3.9,P('#1d4fa3'),s*.905,.72,0,P2.g);P2.band.push(b)}
 const L2=ledBar(P2.g,top+.06,.1,1.25,[0x1e5bff,0x1e5bff,0xff2a2a,0xff2a2a]);P2.lb=[{set visible(v){L2[0].visible=L2[1].visible=v}},{set visible(v){L2[2].visible=L2[3].visible=v}}];
 const mk=(txt,bg)=>ctex(256,64,(q,w,hh)=>{q.fillStyle=bg;q.fillRect(0,0,w,hh);q.fillStyle='#fff';q.font='800 44px "Barlow Condensed",sans-serif';q.textAlign='center';q.fillText(txt,w/2,48)});P2.tx={polis:mk('POLİS','#1d4fa3'),jandarma:mk('JANDARMA','#2f5a37')};P2.sides=[];for(const s of[1,-1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.4),new THREE.MeshBasicMaterial({map:P2.tx.polis,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}));m.position.set(s*.912,.95,.1);m.rotation.y=s*Math.PI/2;P2.g.add(m);P2.sides.push(m)}
 P2.g.visible=false;return P2};
})();
