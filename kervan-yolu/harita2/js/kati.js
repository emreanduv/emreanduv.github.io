// Katı dünya: bölge (ve bütün modüllerin eklediği nesneler) kurulduktan sonra sahne taranır; her fiziksel nesne katı olur.
// Bu dosya en son yüklenir ki bütün buildRegion sarmalayıcılarının nesneleri ızgaraya girsin.
(function(){'use strict';
const _br=buildRegion;buildRegion=function(r){_br(r);try{window._zarfN=yolZarfiTemizle()}catch(e){console.log('zarf',e)}try{const n=katiDunyaKur();window._katiN=n}catch(e){console.log('kati kur',e)}};
// Kamera örtüsü: kamerayla tır arasına giren yapı (kanopi, çatı, tabela, ağaç) yarı saydam olur, tır hiç kaybolmaz.
// Her bölgede sahneden aday ağlar toplanır (arazi/yol/gök gibi dev ağlar ve araçlar hariç); saniyede ~10 kez ışın atılır.
const ORTU=[];const _rc=new THREE.Raycaster();const _sol=new Map();let _oT=0;
function ortuKur(){ORTU.length=0;_sol.forEach((m,o)=>{o.material=m});_sol.clear();const B=new THREE.Box3(),S=new THREE.Vector3();
 scene.updateMatrixWorld(true);scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry)return;for(let q=o;q;q=q.parent){const u=q.userData||{};if(u.dinamik||(typeof truck!=='undefined'&&truck&&q===truck.g)||(typeof trailer!=='undefined'&&trailer&&q===trailer.g))return}
  if(o.material&&(Array.isArray(o.material)||o.material.transparent))return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();B.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);B.getSize(S);if(Math.max(S.x,S.z)>70||S.y<.8&&Math.max(S.x,S.z)>30)return;ORTU.push(o)})}
function ortuGuncelle(dt){_oT-=dt;if(_oT>0)return;_oT=.1;if(typeof truck==='undefined'||!truck||!truck.g||phase==='montaj'||(typeof FOTO!=='undefined'&&FOTO.on))return;
 const hedefler=[truck.g.position.clone().add(new THREE.Vector3(0,3,0))];if(trailer&&trailer.g)hedefler.push(trailer.g.position.clone().add(new THREE.Vector3(0,3,0)));
 const vur=new Set();for(const h of hedefler){const d=h.clone().sub(camera.position);const L=d.length();if(L<4)continue;_rc.set(camera.position,d.normalize());_rc.far=L-2;for(const x of _rc.intersectObjects(ORTU,false))vur.add(x.object)}
 vur.forEach(o=>{if(!_sol.has(o)){_sol.set(o,o.material);const m=o.material.clone();m.transparent=true;m.opacity=.22;m.depthWrite=false;o.material=m}});
 _sol.forEach((m,o)=>{if(!vur.has(o)){o.material.dispose&&o.material.dispose();o.material=m;_sol.delete(o)}})}
// Hedef ışık sütunları (teslim, yükleme, zincir) uzaktan yer göstermek içindir; tır 70 m'ye yaklaşınca sütun söner, yerdeki halka kalır.
// Yoksa yakında 26 m'lik saydam sütun kulenin, kanopinin önüne biniyor ve bir hata gibi görünüyor. 'visible'a dokunmaz, yalnız kamera katmanını değiştirir.
function sutunSondur(){if(typeof truck==='undefined'||!truck||!truck.g)return;const t=truck.g.position;for(const b of[typeof ringBeam!=='undefined'&&ringBeam,typeof pickBeam!=='undefined'&&pickBeam,typeof CZ!=='undefined'&&CZ&&CZ.beam]){if(!b)continue;const d=Math.hypot(b.position.x-t.x,b.position.z-t.z);b.layers.set(d<70?31:0)}}
const _uc=updCamera;updCamera=function(dt){_uc(dt);try{ortuGuncelle(dt||.016)}catch(e){}try{sutunSondur()}catch(e){}};
const _br2=buildRegion;buildRegion=function(r){_br2(r);try{ortuKur()}catch(e){console.log('ortu',e)}};
window.ORTU_SAY=()=>ORTU.length;window.ORTU_TEST=(c)=>{camera.position.copy(c);_oT=0;ortuGuncelle(.1);return _sol.size};
})();
