/* Mr. Anduv! çizimli afiş panoları (Çizim Planı F3) — ortak dosya.
   Kaynak: emreanduv/kaptan-mecit `www/pano.js`; veri `km3/veri/takimlar.json` → "afisler"
   ([ad, söz TR, söz EN, zemin1, zemin2, yazı, vurgu, simge]). Bu dosya her oyuna birebir kopyalanır.
   Her afişin solunda oyunun küçük bir sahnesi (ortak kalem dili: koyu kontur, hacim, kenar ışığı, hale),
   sağda ad ve söz, köşede küçük imza. Afiş bir kez ekran çözünürlüğünde ayrı tuvale çizilir (önbellek);
   karede yalnız hazır görüntü konur, ışık süpürmesi/kıpırtıyı oyun üstüne çizer.
   Simgeler marka logosu değildir: sosyal medya panolarında yalnız genel işaret (oynat, kamera, nota).
   Saygı kuralı: kutsal varlık/kişi çizilmez; panolarda 1923 yazılmaz. */
(function(G){
'use strict';
const KON='#1e130b';
const TAU=Math.PI*2;

/* ---------- küçük kalem ---------- */
function yol(c,p,kapa){c.beginPath();for(let i=0;i<p.length;i++){const q=p[i];i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);}if(kapa!==false)c.closePath();}
function egri(c,p){ // yumuşak kapalı eğri (orta noktalardan quadratic)
  c.beginPath();const n=p.length;const m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  let s=m(p[n-1],p[0]);c.moveTo(s[0],s[1]);
  for(let i=0;i<n;i++){const a=p[i],b=m(p[i],p[(i+1)%n]);c.quadraticCurveTo(a[0],a[1],b[0],b[1]);}
  c.closePath();
}
function dol(c,f,lw){c.fillStyle=f;c.fill();if(lw){c.lineWidth=lw;c.strokeStyle=KON;c.lineJoin='round';c.lineCap='round';c.stroke();}}
function cizgi(c,p,col,lw){yol(c,p,false);c.strokeStyle=col;c.lineWidth=lw;c.lineCap='round';c.lineJoin='round';c.stroke();}
function dg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach((s,i)=>g.addColorStop(s[0],s[1]));return g;}
function rg(c,x,y,r0,r1,st){const g=c.createRadialGradient(x,y,r0,x,y,r1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g;}
function rgba(h,a){h=h.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}
function hale(c,x,y,r,col,a){c.fillStyle=rg(c,x,y,0,r,[[0,rgba(col,a)],[0.45,rgba(col,a*0.45)],[1,rgba(col,0)]]);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function elips(c,x,y,rx,ry,r){c.beginPath();c.ellipse(x,y,rx,ry,r||0,0,TAU);}
function daire(c,x,y,r){c.beginPath();c.arc(x,y,r,0,TAU);}
function golge(c,x,y,rx){c.fillStyle='rgba(0,0,0,0.32)';elips(c,x,y,rx,rx*0.22);c.fill();}
function kivilcim(c,x,y,r,col){c.fillStyle=col;c.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,q=k%2?r*0.28:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();c.fill();}
function yildiz(c,x,y,r,ic,n){c.beginPath();n=n||5;for(let k=0;k<n*2;k++){const a=-Math.PI/2+k*Math.PI/n,q=k%2?r*ic:r;c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.closePath();}
function hilal(c,x,y,r,col,yon){ // dış daire − iç daire (alttaki zemini silmeden)
  c.save();c.beginPath();c.rect(x-r*3,y-r*3,r*6,r*6);c.arc(x+r*0.42*(yon||1),y-r*0.12,r*0.86,0,TAU,true);c.clip('evenodd');
  c.fillStyle=col;daire(c,x,y,r);c.fill();c.restore();}

/* ---------- sahneler (birim kutu: y −1..1, x −1.5..1.5; kontur L) ---------- */
const L=0.075;
const SAHNE={
top(c,A){ // Kaptan Mecit: çimde uçan top, hız çizgileri
  hale(c,0.1,-0.1,1.25,A[6],0.55);
  c.fillStyle=dg(c,0,0.45,0,1,[[0,'#3f9a3a'],[1,'#1d5a1e']]);elips(c,0,1.05,1.6,0.55);c.fill();
  for(let i=-14;i<=14;i++){const x=i*0.1;cizgi(c,[[x,0.62],[x+0.03,0.5+((i*7)%3)*0.03]],'#5cc24f',0.04);}
  for(let k=0;k<3;k++)cizgi(c,[[-1.45,-0.35+k*0.28],[-0.75-k*0.08,-0.35+k*0.28]],rgba(A[6],0.85-k*0.2),0.09-k*0.015);
  golge(c,0.15,0.62,0.45);
  const x=0.15,y=-0.1,r=0.62;
  c.save();daire(c,x,y,r);c.fillStyle=rg(c,x-0.25,y-0.3,0.05,r*1.2,[[0,'#ffffff'],[0.6,'#e9edf2'],[1,'#9aa3ad']]);c.fill();c.clip();
  c.fillStyle='#1d2228';yildiz(c,x+0.04,y+0.02,0.25,0.81,5);c.fill();
  for(let k=0;k<5;k++){const a=-Math.PI/2+k*TAU/5+0.3;yildiz(c,x+Math.cos(a)*0.66,y+Math.sin(a)*0.66,0.24,0.81,5);c.fill();}
  c.strokeStyle='rgba(29,34,40,0.55)';c.lineWidth=0.035;for(let k=0;k<5;k++){const a=-Math.PI/2+k*TAU/5;cizgi(c,[[x+Math.cos(a)*0.25,y+Math.sin(a)*0.25],[x+Math.cos(a)*0.46,y+Math.sin(a)*0.46]],'rgba(29,34,40,0.6)',0.035);}
  c.fillStyle='rgba(0,0,0,0.22)';daire(c,x+0.22,y+0.22,r);c.fill();
  c.restore();
  daire(c,x,y,r);c.lineWidth=L;c.strokeStyle=KON;c.stroke();
  c.fillStyle='rgba(255,255,255,0.85)';elips(c,x-0.24,y-0.32,0.16,0.09,-0.6);c.fill();
  kivilcim(c,0.95,-0.7,0.16,A[6]);kivilcim(c,-0.55,0.3,0.1,'#ffffff');
},
kupa(c,A){ // CBM: altın kupa, ışık ve konfeti
  hale(c,0,-0.15,1.3,A[6],0.6);
  for(let k=0;k<12;k++){const a=k*TAU/12;cizgi(c,[[Math.cos(a)*0.55,-0.25+Math.sin(a)*0.55],[Math.cos(a)*1.15,-0.25+Math.sin(a)*1.15]],rgba(A[6],0.25),0.08);}
  const altin=dg(c,-0.5,0,0.5,0,[[0,'#8a5a10'],[0.3,'#ffe48a'],[0.55,'#e0a92a'],[1,'#7a4a08']]);
  // kulplar
  c.lineWidth=0.16;c.strokeStyle=KON;c.beginPath();c.arc(-0.52,-0.42,0.24,1.2,4.6);c.stroke();c.beginPath();c.arc(0.52,-0.42,0.24,-1.5,1.9);c.stroke();
  c.lineWidth=0.08;c.strokeStyle='#e7b43a';c.beginPath();c.arc(-0.52,-0.42,0.24,1.2,4.6);c.stroke();c.beginPath();c.arc(0.52,-0.42,0.24,-1.5,1.9);c.stroke();
  c.beginPath();c.moveTo(-0.6,-0.78);c.lineTo(0.6,-0.78);c.bezierCurveTo(0.6,-0.1,0.3,0.12,0.12,0.18);c.lineTo(-0.12,0.18);c.bezierCurveTo(-0.3,0.12,-0.6,-0.1,-0.6,-0.78);c.closePath();dol(c,altin,L);
  elips(c,0,-0.78,0.6,0.1);dol(c,'#6a420a',L*0.7);
  yol(c,[[-0.1,0.18],[0.1,0.18],[0.14,0.48],[-0.14,0.48]]);dol(c,altin,L);
  yol(c,[[-0.42,0.48],[0.42,0.48],[0.48,0.66],[-0.48,0.66]]);dol(c,altin,L);
  yol(c,[[-0.56,0.66],[0.56,0.66],[0.56,0.92],[-0.56,0.92]]);dol(c,dg(c,0,0.66,0,0.92,[[0,'#5a3016'],[1,'#2e170a']]),L);
  c.fillStyle='#e0b048';c.fillRect(-0.3,0.74,0.6,0.08);
  yildiz(c,0,-0.38,0.17,0.45,5);dol(c,'#fff6c8',0.035);
  c.fillStyle='rgba(255,255,255,0.75)';yol(c,[[-0.42,-0.7],[-0.3,-0.7],[-0.28,-0.2],[-0.36,-0.15]]);c.fill();
  const kc=['#e63946','#ffffff','#2ec4b6',A[6],'#4361ee'];
  for(let k=0;k<14;k++){const x=-1.4+((k*0.613)%1)*2.8,y=-0.95+((k*0.377)%1)*1.6;if(Math.abs(x)<0.75&&y>-0.9)continue;c.save();c.translate(x,y);c.rotate(k);c.fillStyle=kc[k%5];c.fillRect(-0.05,-0.025,0.1,0.05);c.restore();}
  kivilcim(c,0.82,-0.82,0.18,'#ffffff');kivilcim(c,-0.9,0.1,0.12,'#fff6c8');
},
kafa(c,A){ // Legend Heads: koca kafalı oyuncu kafa vuruşunda
  hale(c,0,-0.1,1.3,A[6],0.5);
  golge(c,-0.25,0.92,0.55);
  // gövde (forma)
  yol(c,[[-0.62,0.95],[-0.55,0.45],[-0.25,0.35],[0.05,0.45],[0.12,0.95]]);dol(c,dg(c,-0.6,0,0.1,0,[[0,'#2b6cd6'],[1,'#173d84']]),L);
  c.fillStyle='#ffffff';c.fillRect(-0.3,0.55,0.08,0.4);
  // kafa
  const hx=-0.25,hy=-0.15;
  daire(c,hx,hy,0.6);dol(c,rg(c,hx-0.2,hy-0.25,0.05,0.75,[[0,'#ffd9b0'],[0.7,'#e8a874'],[1,'#b8703e']]),L);
  // saç
  yol(c,[[hx-0.6,hy-0.05],[hx-0.55,hy-0.45],[hx-0.35,hy-0.62],[hx-0.25,hy-0.8],[hx-0.05,hy-0.66],[hx+0.12,hy-0.84],[hx+0.25,hy-0.62],[hx+0.5,hy-0.68],[hx+0.5,hy-0.4],[hx+0.2,hy-0.42],[hx-0.2,hy-0.35],[hx-0.45,hy-0.15]]);dol(c,dg(c,0,hy-0.8,0,hy-0.1,[[0,'#3a2414'],[1,'#1a0f08']]),L*0.8);
  // göz
  elips(c,hx+0.22,hy-0.02,0.17,0.2);dol(c,'#ffffff',L*0.6);daire(c,hx+0.3,hy-0.03,0.085);c.fillStyle='#22160c';c.fill();daire(c,hx+0.33,hy-0.07,0.03);c.fillStyle='#fff';c.fill();
  cizgi(c,[[hx+0.05,hy-0.28],[hx+0.38,hy-0.24]],KON,0.07);
  // ağız (kararlı)
  c.beginPath();c.moveTo(hx+0.05,hy+0.3);c.quadraticCurveTo(hx+0.28,hy+0.4,hx+0.45,hy+0.22);c.lineWidth=0.06;c.strokeStyle=KON;c.stroke();
  elips(c,hx-0.55,hy+0.05,0.09,0.14);dol(c,'#e8a874',L*0.6);
  c.fillStyle='rgba(255,255,255,0.35)';elips(c,hx-0.18,hy-0.32,0.2,0.1,-0.4);c.fill();
  // top ve vuruş izi
  c.beginPath();c.arc(0.45,-0.45,0.5,-2.6,-0.9);c.strokeStyle=rgba(A[6],0.8);c.lineWidth=0.06;c.stroke();
  const bx=0.95,by=-0.62;daire(c,bx,by,0.28);dol(c,rg(c,bx-0.1,by-0.1,0.02,0.32,[[0,'#ffffff'],[1,'#b9c0c8']]),L*0.8);
  c.fillStyle='#1d2228';yildiz(c,bx,by,0.1,0.81,5);c.fill();
  kivilcim(c,0.55,-0.95,0.14,'#ffffff');kivilcim(c,1.3,-0.2,0.1,A[6]);
},
kanat(c,A){ // Tulpar: kanatlı at, gün batımı bulutları
  hale(c,0.2,-0.2,1.3,A[6],0.55);
  c.fillStyle='rgba(255,236,210,0.55)';egri(c,[[-1.5,0.75],[-1.1,0.5],[-0.6,0.62],[-0.2,0.45],[0.3,0.62],[0.8,0.48],[1.3,0.65],[1.5,0.95],[-1.5,0.95]]);c.fill();
  const ten=dg(c,0,-0.5,0,0.6,[[0,'#ffffff'],[1,'#e2d2bc']]);
  // arka kanat
  c.save();c.translate(-0.05,-0.12);c.rotate(-0.2);
  for(let k=3;k>=0;k--){egri(c,[[0,0],[-0.3-k*0.12,-0.45-k*0.12],[-0.75-k*0.1,-0.8+k*0.05],[-0.55+k*0.1,-0.3],[-0.15,0.05]]);dol(c,k%2?'#f2c66a':'#e0a040',L*0.6);}
  c.restore();
  // bacaklar (dörtnala)
  const bacak=(p)=>{cizgi(c,p,KON,0.17);cizgi(c,p,'#e9dcc8',0.1);};
  bacak([[-0.42,0.2],[-0.7,0.42],[-0.95,0.42]]);bacak([[-0.3,0.25],[-0.42,0.55],[-0.62,0.66]]);
  bacak([[0.35,0.22],[0.6,0.4],[0.85,0.28]]);bacak([[0.25,0.24],[0.35,0.55],[0.55,0.62]]);
  // kuyruk
  c.beginPath();c.moveTo(-0.6,0.0);c.bezierCurveTo(-0.95,-0.1,-1.1,0.2,-1.35,0.05);c.bezierCurveTo(-1.1,0.35,-0.85,0.2,-0.6,0.12);c.closePath();dol(c,'#e07a2a',L*0.7);
  // gövde, boyun, baş
  elips(c,-0.05,0.08,0.62,0.26);dol(c,ten,L);
  yol(c,[[0.35,-0.05],[0.55,-0.45],[0.72,-0.5],[0.62,0.0],[0.5,0.15]]);dol(c,ten,L);
  c.save();c.translate(0.78,-0.52);c.rotate(0.55);elips(c,0.08,0,0.28,0.13);dol(c,ten,L);c.restore();
  yol(c,[[0.66,-0.66],[0.7,-0.82],[0.76,-0.64]]);dol(c,'#e9dcc8',L*0.6);
  daire(c,0.8,-0.56,0.035);c.fillStyle=KON;c.fill();
  // yele
  c.beginPath();c.moveTo(0.66,-0.62);c.bezierCurveTo(0.5,-0.55,0.42,-0.35,0.3,-0.1);c.bezierCurveTo(0.42,-0.25,0.48,-0.3,0.58,-0.42);c.bezierCurveTo(0.5,-0.3,0.48,-0.2,0.44,-0.05);c.bezierCurveTo(0.6,-0.3,0.66,-0.45,0.72,-0.6);c.closePath();dol(c,'#e07a2a',L*0.6);
  // ön kanat
  c.save();c.translate(0.05,-0.08);c.rotate(-0.35);
  for(let k=3;k>=0;k--){egri(c,[[0,0],[-0.2-k*0.15,-0.55-k*0.12],[-0.55-k*0.12,-0.95+k*0.04],[-0.35+k*0.1,-0.35],[0.05,0.05]]);dol(c,k%2?'#ffe7a8':'#f5c45a',L*0.7);}
  c.restore();
  c.fillStyle='rgba(255,255,255,0.6)';elips(c,-0.1,-0.04,0.35,0.07);c.fill();
  kivilcim(c,1.15,-0.85,0.14,'#ffffff');kivilcim(c,-1.2,-0.6,0.1,A[6]);
},
kurt(c,A){ // Kurt Yolu: aya uluyan bozkurt, karlı dağlar
  c.fillStyle=rg(c,0.95,-0.55,0,1,[[0,rgba('#fff6d8',0.5)],[1,rgba('#fff6d8',0)]]);daire(c,0.95,-0.55,1);c.fill();
  hilal(c,0.95,-0.55,0.3,'#fff3c8',-1);
  for(let k=0;k<7;k++){c.fillStyle='rgba(255,255,255,0.8)';daire(c,-1.4+k*0.31,-0.85+((k*0.47)%1)*0.4,0.025);c.fill();}
  yol(c,[[-1.9,0.95],[-1.3,0.15],[-0.95,0.45],[-0.45,-0.1],[0.1,0.4],[0.7,0.0],[1.2,0.45],[1.9,0.15],[1.9,0.95]]);c.fillStyle=dg(c,0,-0.1,0,0.95,[[0,'#5a7088'],[1,'#2a3a4c']]);c.fill();
  c.fillStyle='#e8eef4';yol(c,[[-0.45,-0.1],[-0.3,0.06],[-0.45,0.03],[-0.58,0.06]]);c.fill();yol(c,[[0.7,0.0],[0.84,0.15],[0.7,0.12],[0.58,0.15]]);c.fill();
  c.save();c.translate(-0.2,0);
  const gri=dg(c,-0.5,-0.9,0.4,0.9,[[0,'#b8c0c8'],[0.5,'#7d8893'],[1,'#454f59']]);
  // kuyruk
  c.beginPath();c.moveTo(-0.55,0.75);c.bezierCurveTo(-0.95,0.85,-1.0,0.55,-0.85,0.4);c.bezierCurveTo(-0.8,0.62,-0.7,0.68,-0.5,0.62);c.closePath();dol(c,'#6c7680',L*0.8);
  // gövde + baş (oturmuş, burun göğe)
  yol(c,[[-0.15,-0.2],[-0.45,0.15],[-0.65,0.55],[-0.62,0.9],[0.28,0.9],[0.22,0.45],[0.18,0.05],[0.22,-0.28],[0.42,-0.58],[0.6,-0.8],[0.66,-0.9],[0.52,-0.92],[0.3,-0.78],[0.16,-0.76],[0.08,-0.98],[-0.08,-0.72],[-0.2,-0.52]]);dol(c,gri,L);
  // ağız aralığı
  yol(c,[[0.42,-0.58],[0.6,-0.8],[0.5,-0.7]]);c.fillStyle='#3a1a12';c.fill();
  // göğüs ve ağız altı açık
  yol(c,[[0.22,-0.28],[0.4,-0.56],[0.3,-0.5],[0.12,-0.2],[0.08,0.3],[0.16,0.6],[0.2,0.3]]);c.fillStyle='rgba(236,240,244,0.85)';c.fill();
  // kulak içi, göz, burun
  yol(c,[[0.06,-0.9],[0.0,-0.76],[0.1,-0.78]]);c.fillStyle='#4a4048';c.fill();
  cizgi(c,[[0.26,-0.74],[0.36,-0.77]],KON,0.045);
  daire(c,0.64,-0.9,0.04);c.fillStyle=KON;c.fill();
  // ön bacak ve kalça çizgisi
  cizgi(c,[[0.02,0.3],[0.0,0.88]],'rgba(30,19,11,0.55)',0.04);
  c.beginPath();c.arc(-0.35,0.6,0.28,-2.2,-0.2);c.strokeStyle='rgba(30,19,11,0.45)';c.lineWidth=0.04;c.stroke();
  // ay yanı kenar ışığı
  c.beginPath();c.moveTo(0.22,-0.28);c.lineTo(0.42,-0.58);c.lineTo(0.6,-0.8);c.strokeStyle='rgba(255,243,200,0.8)';c.lineWidth=0.035;c.stroke();
  c.restore();
  for(let k=1;k<=3;k++){c.beginPath();c.arc(0.45,-0.92,0.16*k,-1.3,-0.2);c.strokeStyle=rgba('#fff3c8',0.6-k*0.14);c.lineWidth=0.04;c.stroke();}
},
tamga(c,A){ // Tamga Yolu: Temür ve Bozbörü, doğan güneşte tamga
  hale(c,0.35,-0.25,1.25,A[6],0.6);
  daire(c,0.35,-0.25,0.48);c.fillStyle=rg(c,0.35,-0.3,0.05,0.5,[[0,'#fff3c4'],[1,'#f0a640']]);c.fill();
  c.strokeStyle='#8a4a14';c.lineWidth=0.07;c.lineCap='round';c.beginPath();c.moveTo(0.35,-0.02);c.lineTo(0.35,-0.28);c.lineTo(0.18,-0.5);c.moveTo(0.35,-0.28);c.lineTo(0.52,-0.5);c.moveTo(0.22,-0.1);c.lineTo(0.48,-0.1);c.stroke();
  // tepe ve yol basamakları
  c.beginPath();c.moveTo(-1.6,0.95);c.quadraticCurveTo(-0.4,0.25,1.6,0.55);c.lineTo(1.6,0.95);c.closePath();c.fillStyle=dg(c,0,0.3,0,0.95,[[0,'#b88a4a'],[1,'#6a4520']]);c.fill();
  for(let k=0;k<4;k++){c.fillStyle='rgba(255,230,180,0.45)';c.fillRect(0.55+k*0.22,0.62-k*0.06,0.18,0.04);}
  // Temür
  golge(c,-0.55,0.68,0.32);
  yol(c,[[-0.82,0.68],[-0.76,0.05],[-0.34,0.05],[-0.28,0.68]]);dol(c,dg(c,-0.8,0,-0.3,0,[[0,'#a43a22'],[1,'#6e2412']]),L);
  c.fillStyle='#e8b04a';c.fillRect(-0.78,0.3,0.48,0.08);
  cizgi(c,[[-0.55,0.05],[-0.55,0.68]],'rgba(0,0,0,0.25)',0.03);
  daire(c,-0.55,-0.2,0.24);dol(c,rg(c,-0.62,-0.27,0.02,0.3,[[0,'#ffd9b0'],[1,'#d89a66']]),L);
  yol(c,[[-0.8,-0.26],[-0.72,-0.62],[-0.5,-0.78],[-0.34,-0.55],[-0.3,-0.26]]);dol(c,'#f4ecdc',L*0.8);
  elips(c,-0.55,-0.27,0.27,0.07);dol(c,'#7a4a24',L*0.6);
  daire(c,-0.47,-0.17,0.03);c.fillStyle=KON;c.fill();cizgi(c,[[-0.5,-0.06],[-0.42,-0.07]],KON,0.03);
  // Bozbörü (oturan yavru)
  golge(c,-0.02,0.7,0.28);
  yol(c,[[-0.22,0.68],[-0.2,0.25],[-0.05,0.0],[0.14,0.05],[0.2,0.4],[0.18,0.68]]);dol(c,dg(c,-0.2,0,0.2,0.7,[[0,'#b8c0c8'],[1,'#6c7680']]),L);
  yol(c,[[-0.12,0.05],[-0.1,-0.25],[0.0,-0.36],[0.2,-0.3],[0.34,-0.18],[0.3,-0.08],[0.12,-0.04]]);dol(c,'#a9b2bb',L);
  yol(c,[[-0.08,-0.24],[-0.06,-0.48],[0.05,-0.32]]);dol(c,'#8d98a2',L*0.7);
  yol(c,[[0.06,-0.32],[0.12,-0.52],[0.18,-0.32]]);dol(c,'#8d98a2',L*0.7);
  daire(c,0.13,-0.2,0.03);c.fillStyle='#2a1a0a';c.fill();daire(c,0.33,-0.15,0.035);c.fill();
  yol(c,[[-0.08,0.1],[0.08,0.1],[0.0,0.5]]);c.fillStyle='rgba(240,244,248,0.8)';c.fill();
  c.beginPath();c.moveTo(-0.2,0.6);c.quadraticCurveTo(-0.5,0.7,-0.4,0.5);c.lineWidth=0.09;c.strokeStyle=KON;c.stroke();c.lineWidth=0.05;c.strokeStyle='#8d98a2';c.stroke();
  kivilcim(c,1.1,-0.75,0.14,'#fff6d8');kivilcim(c,-1.1,-0.55,0.1,A[6]);
},
kale(c,A){ // Hisar: ay ışığında hisar, meşaleler
  daire(c,-0.9,-0.6,0.9);c.fillStyle=rg(c,-0.9,-0.6,0,0.9,[[0,rgba('#e8e0ff',0.35)],[1,rgba('#e8e0ff',0)]]);c.fill();
  hilal(c,-0.9,-0.6,0.26,'#f6efd6',1);
  for(let k=0;k<9;k++){c.fillStyle='rgba(255,255,255,0.8)';daire(c,-1.3+k*0.33,-0.92+((k*0.53)%1)*0.5,0.02);c.fill();}
  const tas=dg(c,-1,0,1,0,[[0,'#9a8f9e'],[0.5,'#6c6276'],[1,'#3e3648']]);
  const mazgal=(x0,x1,y)=>{const n=Math.round((x1-x0)/0.16);const p=[[x0,y]];for(let i=0;i<n;i++){const a=x0+i*(x1-x0)/n,b=a+(x1-x0)/n;p.push([a,y-0.1],[a+(b-a)*0.5,y-0.1],[a+(b-a)*0.5,y],[b,y]);}return p;};
  // sur
  yol(c,[[-1.1,0.95]].concat(mazgal(-1.1,1.1,0.05)).concat([[1.1,0.95]]));dol(c,tas,L);
  // kuleler
  yol(c,[[-0.95,0.95]].concat(mazgal(-0.95,-0.45,-0.35)).concat([[-0.45,0.95]]));dol(c,tas,L);
  yol(c,[[0.45,0.95]].concat(mazgal(0.45,0.95,-0.35)).concat([[0.95,0.95]]));dol(c,tas,L);
  yol(c,[[-0.22,0.95]].concat(mazgal(-0.22,0.22,-0.6)).concat([[0.22,0.95]]));dol(c,tas,L);
  c.strokeStyle='rgba(30,19,11,0.3)';c.lineWidth=0.025;for(let y=-0.4;y<0.95;y+=0.16){c.beginPath();c.moveTo(-1.08,y);c.lineTo(1.08,y);c.stroke();}
  // kapı
  c.beginPath();c.moveTo(-0.14,0.95);c.lineTo(-0.14,0.55);c.arc(0,0.55,0.14,Math.PI,0);c.lineTo(0.14,0.95);c.closePath();dol(c,'#2a1a10',L*0.8);
  // ışıklı pencereler
  [[-0.7,-0.12],[0.7,-0.12],[0,-0.35]].forEach(p=>{hale(c,p[0],p[1],0.2,'#ffb84a',0.6);c.beginPath();c.moveTo(p[0]-0.05,p[1]+0.08);c.lineTo(p[0]-0.05,p[1]);c.arc(p[0],p[1],0.05,Math.PI,0);c.lineTo(p[0]+0.05,p[1]+0.08);c.closePath();dol(c,'#ffd27a',0.03);});
  // meşaleler
  [[-0.32,0.35],[0.32,0.35]].forEach(p=>{hale(c,p[0],p[1]-0.06,0.35,'#ff9a3a',0.55);c.fillStyle='#5a3a1e';c.fillRect(p[0]-0.02,p[1],0.04,0.14);egri(c,[[p[0],p[1]-0.2],[p[0]+0.07,p[1]-0.04],[p[0],p[1]+0.02],[p[0]-0.07,p[1]-0.04]]);c.fillStyle='#ffc04a';c.fill();});
  // sancak
  cizgi(c,[[0,-0.7],[0,-1.0]],KON,0.04);
  c.beginPath();c.moveTo(0.02,-1.0);c.quadraticCurveTo(0.25,-0.92,0.42,-0.98);c.lineTo(0.38,-0.8);c.quadraticCurveTo(0.22,-0.76,0.02,-0.82);c.closePath();dol(c,'#c8102e',0.035);
  hilal(c,0.18,-0.9,0.05,'#ffffff',1);
  c.fillStyle='rgba(232,224,255,0.25)';c.fillRect(-1.1,0.05,0.25,0.9);c.fillRect(-0.95,-0.35,0.12,0.4);
},
ok(c,A){ // Malazgirt: akıncı atlı, sancak ve oklar
  hale(c,0.1,-0.1,1.3,A[6],0.45);
  c.fillStyle='rgba(120,70,40,0.55)';egri(c,[[-1.6,0.95],[-1.2,0.6],[-0.4,0.75],[0.6,0.6],[1.6,0.8],[1.6,0.95]]);c.fill();
  for(let k=0;k<3;k++){const y=-0.85+k*0.2,x=0.55+k*0.15;cizgi(c,[[x,y],[x+0.6,y-0.05]],'#6a4a2a',0.035);yol(c,[[x+0.6,y-0.1],[x+0.72,y-0.06],[x+0.6,y]]);c.fillStyle='#c0c4c8';c.fill();cizgi(c,[[x,y],[x-0.06,y-0.05]],'#e8e0d0',0.05);}
  const at=dg(c,-0.6,-0.4,0.6,0.6,[[0,'#a8683a'],[1,'#5a3018']]);
  const bacak=(p)=>{cizgi(c,p,KON,0.15);cizgi(c,p,'#7a4626',0.09);};
  bacak([[-0.45,0.35],[-0.75,0.6],[-0.95,0.58]]);bacak([[0.35,0.35],[0.62,0.58],[0.82,0.45]]);bacak([[-0.3,0.4],[-0.38,0.72]]);bacak([[0.22,0.4],[0.3,0.75]]);
  c.beginPath();c.moveTo(-0.62,0.15);c.bezierCurveTo(-0.95,0.1,-1.1,0.4,-1.3,0.3);c.bezierCurveTo(-1.05,0.5,-0.85,0.35,-0.6,0.28);c.closePath();dol(c,'#2a160a',L*0.6);
  elips(c,-0.05,0.22,0.6,0.24);dol(c,at,L);
  yol(c,[[0.35,0.1],[0.6,-0.25],[0.8,-0.28],[0.62,0.2]]);dol(c,at,L);
  c.save();c.translate(0.86,-0.24);c.rotate(0.7);elips(c,0.06,0,0.24,0.11);dol(c,at,L);c.restore();
  yol(c,[[0.74,-0.38],[0.78,-0.52],[0.84,-0.36]]);dol(c,'#7a4626',L*0.5);
  daire(c,0.88,-0.26,0.028);c.fillStyle=KON;c.fill();
  c.beginPath();c.moveTo(0.72,-0.34);c.bezierCurveTo(0.55,-0.25,0.45,-0.05,0.38,0.1);c.lineTo(0.48,0.08);c.bezierCurveTo(0.55,-0.08,0.62,-0.2,0.78,-0.3);c.closePath();dol(c,'#2a160a',L*0.5);
  // eyer örtüsü
  yol(c,[[-0.35,0.0],[0.15,0.0],[0.2,0.32],[-0.4,0.32]]);dol(c,'#8a1c2c',L*0.7);c.fillStyle='#f2c230';c.fillRect(-0.37,0.24,0.55,0.05);
  // akıncı
  yol(c,[[-0.25,0.05],[-0.22,-0.42],[0.08,-0.42],[0.12,0.05]]);dol(c,dg(c,-0.2,0,0.1,0,[[0,'#3a5a8a'],[1,'#1e3456']]),L);
  c.fillStyle='#d8a040';c.fillRect(-0.24,-0.12,0.34,0.06);
  daire(c,-0.07,-0.56,0.15);dol(c,rg(c,-0.12,-0.6,0.01,0.2,[[0,'#ffd9b0'],[1,'#c88a56']]),L*0.8);
  yol(c,[[-0.24,-0.6],[-0.07,-0.95],[0.1,-0.6]]);dol(c,dg(c,-0.2,0,0.1,0,[[0,'#e0e4e8'],[1,'#8a929a']]),L*0.8);
  elips(c,-0.07,-0.6,0.18,0.04);dol(c,'#6a7078',L*0.5);
  cizgi(c,[[-0.02,-0.48],[0.06,-0.47]],KON,0.03);
  // sancak
  cizgi(c,[[0.12,-0.25],[-0.15,-1.0]],'#5a3a1e',0.05);
  c.beginPath();c.moveTo(-0.13,-0.98);c.quadraticCurveTo(-0.45,-1.0,-0.72,-0.86);c.lineTo(-0.62,-0.7);c.quadraticCurveTo(-0.38,-0.78,-0.07,-0.76);c.closePath();dol(c,'#b0182c',0.035);
  hilal(c,-0.35,-0.85,0.06,'#f2c230',1);
},
gulle(c,A){ // Topçular: tunç top, ağız alevi, duman, gülle
  hale(c,0.5,-0.2,1.1,'#ffb040',0.55);
  c.fillStyle='rgba(120,90,60,0.6)';elips(c,0,0.98,1.6,0.3);c.fill();
  // duman
  [[0.75,-0.35,0.3],[1.05,-0.55,0.26],[1.0,-0.15,0.22],[1.3,-0.4,0.2]].forEach(p=>{daire(c,p[0],p[1],p[2]);c.fillStyle=rg(c,p[0]-p[2]*0.3,p[1]-p[2]*0.3,0.01,p[2],[[0,'#fff7ea'],[1,'#b8aca0']]);c.fill();});
  // ağız alevi
  yildiz(c,0.58,-0.22,0.38,0.4,7);c.fillStyle=rg(c,0.58,-0.22,0,0.38,[[0,'#ffffff'],[0.4,'#ffd84a'],[1,'#ff6a1a']]);c.fill();
  // namlu
  c.save();c.translate(-0.15,0.12);c.rotate(-0.38);
  c.beginPath();c.moveTo(-0.7,-0.18);c.lineTo(0.7,-0.13);c.lineTo(0.75,-0.17);c.lineTo(0.75,0.17);c.lineTo(0.7,0.13);c.lineTo(-0.7,0.2);c.quadraticCurveTo(-0.92,0,-0.7,-0.18);c.closePath();
  dol(c,dg(c,0,-0.2,0,0.2,[[0,'#f2c26a'],[0.35,'#c88a2a'],[1,'#6a4210']]),L);
  [-0.45,0.05,0.5].forEach(x=>{c.fillStyle='#8a5a14';c.fillRect(x,-0.18,0.06,0.37);});
  c.fillStyle='rgba(255,255,255,0.55)';c.fillRect(-0.6,-0.11,1.2,0.04);
  c.restore();
  // kundak ve teker
  yol(c,[[-0.85,0.55],[0.05,0.25],[0.15,0.45],[-0.75,0.72]]);dol(c,dg(c,0,0.25,0,0.7,[[0,'#8a5a30'],[1,'#4a2a12']]),L);
  daire(c,-0.2,0.55,0.34);dol(c,'#6a3e1a',L);daire(c,-0.2,0.55,0.25);c.lineWidth=0.04;c.strokeStyle='#3a2210';c.stroke();
  for(let k=0;k<6;k++){const a=k*Math.PI/3;cizgi(c,[[-0.2,0.55],[-0.2+Math.cos(a)*0.27,0.55+Math.sin(a)*0.27]],'#3a2210',0.05);}
  daire(c,-0.2,0.55,0.07);dol(c,'#c8a050',0.03);
  // uçan gülle
  daire(c,1.25,-0.85,0.12);dol(c,rg(c,1.21,-0.89,0.01,0.14,[[0,'#8a8a8a'],[1,'#1a1a1a']]),L*0.6);
  cizgi(c,[[0.95,-0.7],[1.12,-0.8]],'rgba(255,255,255,0.6)',0.04);
  kivilcim(c,0.25,-0.6,0.12,'#ffe08a');kivilcim(c,0.95,0.05,0.1,'#ffe08a');
},
yali(c,A){ // Kırmızı Yalı: Boğaz'da gece, ışıklı yalı ve yansıması
  daire(c,1.1,-0.7,0.18);c.fillStyle='#fff3d6';c.fill();hale(c,1.1,-0.7,0.6,'#fff3d6',0.35);
  c.fillStyle='rgba(20,30,60,0.55)';yol(c,[[-1.6,0.1],[-1.2,-0.05],[-0.8,0.02],[-1.6,0.02]]);c.fill();
  c.fillStyle=dg(c,0,0.35,0,1,[[0,'#1a3050'],[1,'#0a1428']]);c.fillRect(-1.6,0.35,3.2,0.65);
  // yalı
  const kir=dg(c,-0.8,0,0.8,0,[[0,'#d23a2a'],[0.5,'#a81c1c'],[1,'#6a0e0e']]);
  yol(c,[[-0.85,0.35],[-0.85,-0.25],[0.85,-0.25],[0.85,0.35]]);dol(c,kir,L);
  yol(c,[[-0.7,-0.25],[-0.7,-0.6],[0.7,-0.6],[0.7,-0.25]]);dol(c,kir,L);
  yol(c,[[-0.98,-0.25],[0,-0.42],[0.98,-0.25]]);dol(c,'#4a2014',L*0.7);
  yol(c,[[-0.82,-0.6],[0,-0.92],[0.82,-0.6]]);dol(c,dg(c,0,-0.92,0,-0.6,[[0,'#6a2a18'],[1,'#3a160c']]),L);
  // cumba
  yol(c,[[-0.2,-0.25],[-0.25,-0.62],[0.25,-0.62],[0.2,-0.25]]);dol(c,'#b82a22',L*0.7);
  c.strokeStyle='rgba(255,220,180,0.35)';c.lineWidth=0.025;for(let x=-0.8;x<0.85;x+=0.1){c.beginPath();c.moveTo(x,-0.22);c.lineTo(x,0.33);c.stroke();}
  const pencere=(x,y,yan)=>{if(yan)hale(c,x,y,0.22,'#ffc870',0.55);c.beginPath();c.moveTo(x-0.06,y+0.1);c.lineTo(x-0.06,y-0.02);c.arc(x,y-0.02,0.06,Math.PI,0);c.lineTo(x+0.06,y+0.1);c.closePath();dol(c,yan?'#ffd890':'#2a1a28',0.025);};
  [-0.55,-0.35,0.35,0.55].forEach((x,i)=>pencere(x,-0.45,i!==1));[-0.08,0.08].forEach(x=>pencere(x,-0.46,true));
  [-0.6,-0.3,0.3,0.6].forEach((x,i)=>pencere(x,0.05,i===2));
  c.beginPath();c.moveTo(-0.1,0.35);c.lineTo(-0.1,0.12);c.arc(0,0.12,0.1,Math.PI,0);c.lineTo(0.1,0.35);c.closePath();dol(c,'#3a160c',0.025);
  // rıhtım ve yansıma
  c.fillStyle='#8a7a6a';c.fillRect(-0.95,0.35,1.9,0.06);
  c.save();c.globalAlpha=0.35;for(let k=0;k<7;k++){const y=0.48+k*0.07;c.fillStyle=k%2?'#ffc870':'#c8382a';c.fillRect(-0.7+((k*0.37)%1)*0.4,y,0.9-((k*0.53)%1)*0.3,0.025);}c.restore();
  cizgi(c,[[0.95,0.55],[1.45,0.55]],'rgba(255,243,214,0.5)',0.03);cizgi(c,[[1.0,0.66],[1.3,0.66]],'rgba(255,243,214,0.4)',0.03);
  // fener
  cizgi(c,[[-1.15,0.4],[-1.15,-0.1]],'#2a2a2a',0.04);hale(c,-1.15,-0.16,0.4,'#ffcc66',0.6);yol(c,[[-1.22,-0.08],[-1.08,-0.08],[-1.1,-0.26],[-1.2,-0.26]]);dol(c,'#ffe2a0',0.03);
},
kursu(c,A){ // Nutuk Salonu: kürsüde açık kitap, ışık huzmesi
  c.fillStyle=dg(c,0,-1,0,0.6,[[0,rgba(A[6],0.45)],[1,rgba(A[6],0)]]);yol(c,[[-0.2,-1.05],[0.2,-1.05],[0.9,0.6],[-0.9,0.6]]);c.fill();
  yol(c,[[-0.4,0.95],[-0.28,-0.05],[0.28,-0.05],[0.4,0.95]]);dol(c,dg(c,-0.4,0,0.4,0,[[0,'#7a4a24'],[0.5,'#a8683a'],[1,'#4a2810']]),L);
  c.fillStyle='rgba(255,220,160,0.25)';c.fillRect(-0.2,0.1,0.06,0.8);
  yol(c,[[-0.7,-0.05],[-0.55,-0.32],[0.55,-0.32],[0.7,-0.05]]);dol(c,'#5a3418',L);
  // açık kitap
  c.beginPath();c.moveTo(0,-0.36);c.quadraticCurveTo(-0.3,-0.48,-0.58,-0.4);c.lineTo(-0.6,-0.18);c.quadraticCurveTo(-0.3,-0.26,0,-0.16);c.quadraticCurveTo(0.3,-0.26,0.6,-0.18);c.lineTo(0.58,-0.4);c.quadraticCurveTo(0.3,-0.48,0,-0.36);c.closePath();dol(c,'#fbf3dc',L*0.8);
  cizgi(c,[[0,-0.36],[0,-0.16]],'rgba(30,19,11,0.5)',0.03);
  for(let k=0;k<3;k++){cizgi(c,[[-0.5,-0.36+k*0.06],[-0.1,-0.33+k*0.06]],'rgba(60,40,20,0.45)',0.02);cizgi(c,[[0.1,-0.33+k*0.06],[0.5,-0.36+k*0.06]],'rgba(60,40,20,0.45)',0.02);}
  hale(c,0,-0.4,0.6,'#fff3c8',0.5);
  for(let k=0;k<5;k++)kivilcim(c,-0.9+k*0.45,-0.75+((k*0.61)%1)*0.4,0.08,'#fff3c8');
},
kitap(c,A){ // Yaşam Rehberi: açık sayfa, yaprak ayraç, sabah ışığı
  hale(c,0,-0.15,1.2,A[6],0.45);
  c.beginPath();c.moveTo(0,-0.45);c.quadraticCurveTo(-0.55,-0.68,-1.05,-0.52);c.lineTo(-1.08,0.5);c.quadraticCurveTo(-0.55,0.35,0,0.6);c.quadraticCurveTo(0.55,0.35,1.08,0.5);c.lineTo(1.05,-0.52);c.quadraticCurveTo(0.55,-0.68,0,-0.45);c.closePath();dol(c,dg(c,-1,0,1,0,[[0,'#e9dcc0'],[0.5,'#fffaf0'],[1,'#e2d4b6']]),L);
  cizgi(c,[[0,-0.45],[0,0.6]],'rgba(30,19,11,0.45)',0.035);
  for(let k=0;k<6;k++){cizgi(c,[[-0.9,-0.38+k*0.14],[-0.15,-0.32+k*0.14]],'rgba(80,60,30,0.35)',0.025);cizgi(c,[[0.15,-0.32+k*0.14],[0.9,-0.38+k*0.14]],'rgba(80,60,30,0.35)',0.025);}
  yol(c,[[0.55,-0.6],[0.68,-0.6],[0.68,-0.15],[0.615,-0.24],[0.55,-0.15]]);dol(c,'#4a7a3a',L*0.5);
  c.save();c.translate(-0.62,0.7);c.rotate(-0.5);egri(c,[[0,-0.2],[0.12,0],[0,0.2],[-0.12,0]]);dol(c,'#6a9a4a',L*0.5);c.restore();
  kivilcim(c,1.2,-0.75,0.12,'#fff3c8');
},
pusula(c,A){ // Gezi Pasaportu: pusula gülü ve mühür
  hale(c,0,0,1.2,A[6],0.45);
  daire(c,0.6,0.2,0.55);c.lineWidth=0.06;c.strokeStyle=rgba(A[6],0.7);c.setLineDash([0.08,0.06]);c.stroke();c.setLineDash([]);
  daire(c,0.6,0.2,0.42);c.lineWidth=0.03;c.stroke();
  daire(c,-0.25,-0.05,0.68);dol(c,dg(c,0,-0.7,0,0.6,[[0,'#f2c26a'],[1,'#8a5a14']]),L);
  daire(c,-0.25,-0.05,0.56);dol(c,rg(c,-0.35,-0.2,0.02,0.7,[[0,'#fffaf0'],[1,'#d8ccb0']]),L*0.6);
  for(let k=0;k<16;k++){const a=k*TAU/16,q=k%4?0.47:0.42;cizgi(c,[[-0.25+Math.cos(a)*q,-0.05+Math.sin(a)*q],[-0.25+Math.cos(a)*0.53,-0.05+Math.sin(a)*0.53]],'#5a3a1e',0.02);}
  yol(c,[[-0.25,-0.5],[-0.16,-0.05],[-0.34,-0.05]]);dol(c,'#c8102e',0.03);
  yol(c,[[-0.25,0.4],[-0.16,-0.05],[-0.34,-0.05]]);dol(c,'#e8e8e8',0.03);
  yol(c,[[-0.7,-0.05],[-0.25,0.04],[-0.25,-0.14]]);dol(c,'#3a5a7a',0.03);yol(c,[[0.2,-0.05],[-0.25,0.04],[-0.25,-0.14]]);dol(c,'#3a5a7a',0.03);
  daire(c,-0.25,-0.05,0.05);dol(c,'#f2c26a',0.02);
  c.fillStyle='rgba(255,255,255,0.5)';elips(c,-0.45,-0.35,0.18,0.07,-0.6);c.fill();
},
saat(c,A){ // Saat Vitrini: kol saati, kadran ve parıltı
  hale(c,0,0,1.2,A[6],0.5);
  yol(c,[[-0.28,-1.0],[0.28,-1.0],[0.24,-0.5],[-0.24,-0.5]]);dol(c,'#4a2a14',L);
  yol(c,[[-0.24,0.5],[0.24,0.5],[0.28,1.0],[-0.28,1.0]]);dol(c,'#4a2a14',L);
  c.fillStyle='rgba(255,255,255,0.15)';c.fillRect(-0.04,-0.98,0.08,0.45);c.fillRect(-0.04,0.52,0.08,0.45);
  daire(c,0,0,0.62);dol(c,dg(c,-0.6,-0.6,0.6,0.6,[[0,'#fff0b0'],[0.5,'#e0a92a'],[1,'#6a4210']]),L);
  yol(c,[[0.6,-0.08],[0.72,-0.08],[0.72,0.08],[0.6,0.08]]);dol(c,'#c88a2a',L*0.6);
  daire(c,0,0,0.5);dol(c,rg(c,-0.15,-0.2,0.02,0.6,[[0,'#ffffff'],[1,'#d8dce2']]),L*0.6);
  for(let k=0;k<12;k++){const a=k*TAU/12,q=k%3?0.42:0.36;cizgi(c,[[Math.cos(a)*q,Math.sin(a)*q],[Math.cos(a)*0.45,Math.sin(a)*0.45]],'#2a2a2a',k%3?0.025:0.045);}
  cizgi(c,[[0,0],[0.18,-0.22]],'#1a1a1a',0.06);cizgi(c,[[0,0],[-0.05,-0.38]],'#1a1a1a',0.04);cizgi(c,[[0,0.08],[0.3,0.22]],'#c8102e',0.02);
  daire(c,0,0,0.04);c.fillStyle=A[6];c.fill();
  c.fillStyle='rgba(255,255,255,0.55)';c.beginPath();c.moveTo(-0.4,-0.2);c.quadraticCurveTo(-0.3,-0.42,-0.05,-0.47);c.lineTo(-0.1,-0.38);c.quadraticCurveTo(-0.28,-0.33,-0.34,-0.15);c.closePath();c.fill();
  kivilcim(c,0.55,-0.6,0.18,'#ffffff');kivilcim(c,-0.75,0.45,0.1,A[6]);
},
vitrin(c,A){ // Vitrinler: tenteli dükkân camı, ışıklı raf
  hale(c,0,0,1.2,A[6],0.4);
  yol(c,[[-1.0,0.95],[-1.0,-0.45],[1.0,-0.45],[1.0,0.95]]);dol(c,dg(c,0,-0.4,0,0.95,[[0,'#3a3a44'],[1,'#22222a']]),L);
  yol(c,[[-0.85,0.8],[-0.85,-0.3],[0.85,-0.3],[0.85,0.8]]);dol(c,rg(c,0,0.1,0.05,1,[[0,rgba(A[6],0.9)],[1,rgba(A[6],0.35)]]),L*0.6);
  c.fillStyle='rgba(30,19,11,0.6)';c.fillRect(-0.85,0.3,1.7,0.05);
  [[-0.55,0.3,0.18,'#ffffff'],[-0.1,0.3,0.24,'#2e2e3a'],[0.42,0.3,0.2,'#ffffff']].forEach(p=>{yol(c,[[p[0]-p[2],p[1]],[p[0]-p[2]*0.8,p[1]-p[2]*1.4],[p[0]+p[2]*0.8,p[1]-p[2]*1.4],[p[0]+p[2],p[1]]]);dol(c,p[3],L*0.5);});
  c.fillStyle='rgba(255,255,255,0.35)';yol(c,[[-0.8,-0.25],[-0.5,-0.25],[-0.85,0.4]]);c.fill();
  // tente
  const n=7,w=2.3/n;for(let i=0;i<n;i++){const x=-1.15+i*w;c.beginPath();c.moveTo(x,-0.75);c.lineTo(x+w,-0.75);c.lineTo(x+w,-0.45);c.arc(x+w/2,-0.45,w/2,0,Math.PI);c.closePath();dol(c,i%2?'#ffffff':A[3],L*0.6);}
  c.fillStyle='rgba(0,0,0,0.2)';c.fillRect(-1.15,-0.75,2.3,0.08);
},
oynat(c,A){ // YouTube: ışıklı ekran ve oynat işareti (genel işaret)
  hale(c,0,0,1.25,A[6],0.45);
  c.beginPath();c.roundRect?c.roundRect(-0.95,-0.62,1.9,1.24,0.3):c.rect(-0.95,-0.62,1.9,1.24);dol(c,dg(c,0,-0.6,0,0.6,[[0,'#ff4a3a'],[1,'#a01810']]),L);
  yol(c,[[-0.25,-0.32],[0.38,0],[-0.25,0.32]]);dol(c,'#ffffff',L*0.6);
  c.fillStyle='rgba(255,255,255,0.3)';c.beginPath();c.roundRect?c.roundRect(-0.85,-0.55,1.7,0.3,0.15):c.rect(-0.85,-0.55,1.7,0.3);c.fill();
  kivilcim(c,1.1,-0.75,0.14,'#ffffff');
},
kamera(c,A){ // Instagram: fotoğraf makinesi (genel işaret), flaş
  hale(c,0,0,1.25,A[6],0.45);
  c.beginPath();c.roundRect?c.roundRect(-0.85,-0.55,1.7,1.25,0.32):c.rect(-0.85,-0.55,1.7,1.25);dol(c,dg(c,-0.8,0.7,0.8,-0.5,[[0,'#f5a623'],[0.45,'#d6249f'],[1,'#5b3ac0']]),L);
  daire(c,0,0.08,0.4);dol(c,'#2a1a3a',L*0.8);daire(c,0,0.08,0.28);c.fillStyle=rg(c,-0.08,0,0.02,0.3,[[0,'#8ad0ff'],[1,'#1a2a5a']]);c.fill();
  daire(c,-0.1,-0.02,0.07);c.fillStyle='rgba(255,255,255,0.85)';c.fill();
  daire(c,0.58,-0.32,0.08);c.fillStyle='#ffffff';c.fill();
  hale(c,0.95,-0.85,0.45,'#ffffff',0.6);kivilcim(c,0.95,-0.85,0.2,'#ffffff');
},
nota(c,A){ // Müzik: bağlı iki nota, ses dalgaları
  hale(c,0,0,1.25,A[6],0.45);
  for(let k=1;k<=3;k++){c.beginPath();c.arc(0.55,0.0,0.25*k,-0.8,0.8);c.strokeStyle=rgba(A[6],0.7-k*0.15);c.lineWidth=0.05;c.stroke();}
  const bas=(x,y)=>{c.save();c.translate(x,y);c.rotate(-0.4);elips(c,0,0,0.22,0.15);c.restore();dol(c,A[5]==='#0b0b0b'?'#0b0b0b':'#ffffff',L);};
  yol(c,[[-0.5,-0.7],[0.3,-0.85],[0.3,-0.65],[-0.5,-0.5]]);dol(c,A[5]==='#0b0b0b'?'#0b0b0b':'#ffffff',L*0.8);
  cizgi(c,[[-0.5,-0.6],[-0.5,0.45]],KON,0.11);cizgi(c,[[0.3,-0.75],[0.3,0.3]],KON,0.11);
  cizgi(c,[[-0.5,-0.6],[-0.5,0.45]],A[5]==='#0b0b0b'?'#0b0b0b':'#ffffff',0.06);cizgi(c,[[0.3,-0.75],[0.3,0.3]],A[5]==='#0b0b0b'?'#0b0b0b':'#ffffff',0.06);
  bas(-0.68,0.48);bas(0.12,0.33);
  kivilcim(c,-1.05,-0.6,0.13,A[6]);kivilcim(c,1.15,0.6,0.1,'#ffffff');
},
imza(c,A){ // Mr. Anduv!: altın yıldız, ışınlar
  for(let k=0;k<16;k++){const a=k*TAU/16;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a-0.08)*1.4,Math.sin(a-0.08)*1.4);c.lineTo(Math.cos(a+0.08)*1.4,Math.sin(a+0.08)*1.4);c.closePath();c.fillStyle=rgba(A[6],k%2?0.12:0.22);c.fill();}
  hale(c,0,0,1.0,A[6],0.6);
  yildiz(c,0,0.05,0.82,0.45,5);dol(c,dg(c,-0.6,-0.8,0.6,0.8,[[0,'#fff3b0'],[0.5,'#e8b43a'],[1,'#8a5a10']]),L);
  yildiz(c,0,0.05,0.5,0.45,5);c.fillStyle='rgba(255,255,255,0.25)';c.fill();
  c.fillStyle='rgba(255,255,255,0.6)';yol(c,[[0,-0.77],[0.1,-0.3],[0,-0.25]]);c.fill();
  kivilcim(c,0.95,-0.7,0.16,'#ffffff');kivilcim(c,-1.0,0.55,0.12,'#ffffff');kivilcim(c,-0.9,-0.75,0.08,A[6]);
},
gokalp(c,A){ // Gökalp: sivri miğferli alp, göktaşı kılıcı, mekanik güvercin
  for(let k=0;k<10;k++){c.fillStyle='rgba(255,255,255,0.85)';daire(c,-1.4+k*0.3,-0.95+((k*0.41)%1)*0.9,0.022);c.fill();}
  hale(c,-0.1,-0.2,1.2,A[6],0.45);
  c.fillStyle=dg(c,0,0.5,0,1,[[0,'#6a5a8a'],[1,'#2a2040']]);egri(c,[[-1.6,0.95],[-1.6,0.6],[-0.6,0.5],[0.4,0.62],[1.6,0.5],[1.6,0.95]]);c.fill();
  golge(c,-0.25,0.7,0.35);
  // gövde (kırmızı kaftan, altın kuşak)
  yol(c,[[-0.55,0.7],[-0.45,0.0],[-0.05,0.0],[0.05,0.7]]);dol(c,dg(c,-0.5,0,0,0,[[0,'#d8342a'],[1,'#8a1410']]),L);
  c.fillStyle='#e8b43a';c.fillRect(-0.5,0.25,0.52,0.08);
  // kılıç kolu yukarı
  cizgi(c,[[-0.1,0.08],[0.18,-0.25]],KON,0.15);cizgi(c,[[-0.1,0.08],[0.18,-0.25]],'#c82a20',0.09);
  hale(c,0.45,-0.65,0.5,'#9ad0ff',0.55);
  c.save();c.translate(0.2,-0.28);c.rotate(-0.85);yol(c,[[-0.03,0],[0.03,0],[0.04,-0.7],[0,-0.8],[-0.04,-0.7]]);dol(c,dg(c,-0.04,0,0.04,0,[[0,'#e8f4ff'],[1,'#6a8aa8']]),L*0.6);c.fillStyle='#e8b43a';c.fillRect(-0.12,-0.02,0.24,0.05);c.restore();
  // baş ve sivri miğfer
  daire(c,-0.25,-0.22,0.2);dol(c,rg(c,-0.3,-0.28,0.02,0.25,[[0,'#ffd9b0'],[1,'#c88a56']]),L*0.8);
  yol(c,[[-0.46,-0.24],[-0.25,-0.75],[-0.04,-0.24]]);dol(c,dg(c,-0.4,0,-0.1,0,[[0,'#e0e4e8'],[1,'#7a828a']]),L*0.8);
  elips(c,-0.25,-0.26,0.23,0.05);dol(c,'#e8b43a',L*0.5);
  daire(c,-0.18,-0.17,0.025);c.fillStyle=KON;c.fill();
  // mekanik güvercin
  c.save();c.translate(0.85,0.05);
  elips(c,0,0,0.25,0.14);dol(c,dg(c,0,-0.14,0,0.14,[[0,'#e8c27a'],[1,'#8a6020']]),L*0.7);
  daire(c,0.24,-0.08,0.1);dol(c,'#d8b06a',L*0.6);yol(c,[[0.33,-0.08],[0.42,-0.05],[0.33,-0.03]]);dol(c,'#6a4a1a',0.02);
  daire(c,0.27,-0.1,0.025);c.fillStyle='#4ad0ff';c.fill();
  yol(c,[[-0.05,-0.05],[-0.3,-0.45],[-0.05,-0.38],[0.1,-0.08]]);dol(c,'#c8a060',L*0.6);
  daire(c,0,0,0.05);c.strokeStyle='#5a3a10';c.lineWidth=0.02;c.stroke();
  yol(c,[[-0.22,0.02],[-0.42,-0.04],[-0.42,0.1]]);dol(c,'#b89050',L*0.5);
  c.restore();
  kivilcim(c,1.2,-0.7,0.14,'#ffffff');
},
kagni(c,A){ // Demir Kağnı: öküz, demir çemberli tekerli kağnı, yük
  hale(c,0,-0.2,1.2,A[6],0.4);
  c.fillStyle=dg(c,0,0.55,0,1,[[0,'#8a6a40'],[1,'#4a3218']]);c.fillRect(-1.6,0.62,3.2,0.4);
  for(let k=0;k<6;k++)cizgi(c,[[-1.5+k*0.55,0.75],[-1.2+k*0.55,0.75]],'rgba(255,230,180,0.25)',0.03);
  // yük ve kasa
  yol(c,[[-1.3,0.25],[-1.25,-0.25],[-0.15,-0.25],[-0.1,0.25]]);dol(c,dg(c,0,-0.25,0,0.25,[[0,'#a87840'],[1,'#6a4420']]),L);
  [[-1.1,-0.5,0.32],[-0.65,-0.5,0.3],[-0.85,-0.75,0.3]].forEach(p=>{yol(c,[[p[0]-p[2]/2,p[1]+0.25],[p[0]-p[2]/2,p[1]],[p[0]+p[2]/2,p[1]],[p[0]+p[2]/2,p[1]+0.25]]);dol(c,'#8a5a2a',L*0.6);cizgi(c,[[p[0]-p[2]/2,p[1]+0.12],[p[0]+p[2]/2,p[1]+0.12]],'#5a3a1a',0.03);});
  cizgi(c,[[-0.1,0.1],[0.45,0.05]],KON,0.08);cizgi(c,[[-0.1,0.1],[0.45,0.05]],'#8a5a2a',0.04);
  // teker (masif, demir çember)
  daire(c,-0.7,0.42,0.32);dol(c,dg(c,-1,0,-0.4,0,[[0,'#8a5a2a'],[1,'#5a3418']]),L);
  daire(c,-0.7,0.42,0.32);c.lineWidth=0.07;c.strokeStyle='#6a7078';c.stroke();
  cizgi(c,[[-0.92,0.42],[-0.48,0.42]],'#4a2a10',0.05);daire(c,-0.7,0.42,0.07);dol(c,'#3a3e44',0.02);
  for(let k=0;k<8;k++){const a=k*TAU/8;daire(c,-0.7+Math.cos(a)*0.3,0.42+Math.sin(a)*0.3,0.02);c.fillStyle='#c8ccd2';c.fill();}
  // öküz
  golge(c,0.75,0.66,0.45);
  const ok=dg(c,0.3,-0.3,1.1,0.5,[[0,'#b07a4a'],[1,'#5a3418']]);
  [[0.45,0.2,0.4,0.66],[0.62,0.2,0.62,0.66],[0.98,0.2,1.0,0.66],[1.12,0.2,1.15,0.66]].forEach(p=>{cizgi(c,[[p[0],p[1]],[p[2],p[3]]],KON,0.13);cizgi(c,[[p[0],p[1]],[p[2],p[3]]],'#7a4a24',0.08);});
  elips(c,0.8,0.12,0.45,0.25);dol(c,ok,L);
  yol(c,[[1.15,-0.05],[1.35,-0.12],[1.48,0.1],[1.42,0.22],[1.2,0.18]]);dol(c,ok,L);
  c.beginPath();c.moveTo(1.3,-0.1);c.quadraticCurveTo(1.25,-0.35,1.12,-0.38);c.lineWidth=0.09;c.strokeStyle=KON;c.stroke();c.lineWidth=0.05;c.strokeStyle='#efe4cc';c.stroke();
  c.beginPath();c.moveTo(1.38,-0.1);c.quadraticCurveTo(1.5,-0.32,1.6,-0.3);c.lineWidth=0.09;c.strokeStyle=KON;c.stroke();c.lineWidth=0.05;c.strokeStyle='#efe4cc';c.stroke();
  daire(c,1.36,0.02,0.03);c.fillStyle=KON;c.fill();
  yol(c,[[1.1,-0.12],[1.18,-0.02],[1.1,0.08],[1.02,-0.02]]);dol(c,'#c8102e',0.025);
  c.fillStyle='rgba(255,230,190,0.35)';elips(c,0.75,0.0,0.3,0.07);c.fill();
}
};

/* ---------- afiş ---------- */
const onbellek=new Map();
let fontDamga=0;
if(G.document&&document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',()=>{fontDamga++;onbellek.clear();});

function sigdir(c,t,boy,maxW,font,kal){let fs=boy;do{c.font=(kal||'')+fs+'px '+font;}while(c.measureText(t).width>maxW&&(fs-=0.25)>Math.min(4,boy*0.34));return fs;}   // dar tabelada (Tulpar) söz 4 pikselin altına da iner

/* A: [ad, sözTR, sözEN, zemin1, zemin2, yazı, vurgu, simge]; w,h: mantıksal ölçü; o.olcek: piksel/mantıksal; o.en: İngilizce
   o.yaziFont / o.sozFont: oyunun yazı tipleri; o.yaziKalin / o.sozKalin: kalınlık ön eki (ör. '900 '; sistem yazısında); o.imza: köşede "MR. ANDUV!" (varsayılan açık) */
function afisTuval(A,w,h,o){
  o=o||{};const olcek=o.olcek||1,en=!!o.en;
  const pw=Math.max(1,Math.round(w*olcek)),ph=Math.max(1,Math.round(h*olcek));
  const k=A[0]+'|'+pw+'x'+ph+'|'+(en?1:0)+'|'+fontDamga+'|'+(o.yaziFont||'')+(o.yaziKalin||'');
  let cv=onbellek.get(k);if(cv)return cv;
  cv=document.createElement('canvas');cv.width=pw;cv.height=ph;
  const c=cv.getContext('2d');c.scale(pw/w,ph/h);
  const yf=o.yaziFont||'Bungee, Impact, sans-serif',sf=o.sozFont||'"Baloo 2", "Trebuchet MS", sans-serif',yk=o.yaziKalin||'',sk=o.sozKalin||'';
  // zemin
  c.fillStyle=dg(c,0,0,w,h,[[0,A[3]],[1,A[4]]]);c.fillRect(0,0,w,h);
  const sh=Math.min(h*1.75,w*0.36);       // sahne kutusu
  c.fillStyle=rg(c,sh*0.5,h*0.5,0,sh*0.9,[[0,rgba(A[6],0.28)],[1,rgba(A[6],0)]]);c.fillRect(0,0,sh*1.4,h);
  // sahne
  c.save();c.beginPath();c.rect(0,0,sh,h);c.clip();
  c.translate(sh/2,h/2);c.scale(h/2*0.92,h/2*0.92);
  (SAHNE[A[7]]||SAHNE.imza)(c,A);
  c.restore();
  cizgi(c,[[sh+h*0.05,h*0.16],[sh+h*0.05,h*0.84]],rgba(A[6],0.45),Math.max(0.6,h*0.03));
  // yazılar
  const tx=sh+h*0.2,tw=w-tx-h*0.25;
  const ad=A[0],soz=en?A[2]:A[1],imzali=o.imza!==false&&A[7]!=='imza'&&A[0].indexOf('MR. ANDUV')<0;
  c.textBaseline='alphabetic';c.textAlign='left';
  const dar=w/h<5;   // dar tabela (Tulpar 3:1): imza küçülür ve adın satırından çekilir, ad öne çıkar
  const iB=dar?h*0.11:h*0.17,adY=dar?h*0.56:h*0.5;
  let iw=0;if(imzali&&!dar){c.font=yk+iB+'px '+yf;iw=c.measureText('MR. ANDUV!').width+h*0.25;}
  let fs=sigdir(c,ad,dar?h*0.36:h*0.42,tw-iw,yf,yk);const adFs=fs;
  const koyu=parseInt(A[5].slice(1,3),16)<90;   // koyu yazıya açık gölge
  c.fillStyle=koyu?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.45)';c.fillText(ad,tx+h*0.022,adY+h*0.022);
  c.fillStyle=A[5];c.fillText(ad,tx,adY);
  fs=sigdir(c,soz,Math.min(h*0.32,adFs*(dar?0.8:1.2)),tw,sf,sk);
  c.globalAlpha=0.95;c.fillStyle=A[6];c.fillText(soz,tx,h*0.86);c.globalAlpha=1;
  if(imzali){c.font=yk+iB+'px '+yf;c.textAlign='right';c.fillStyle='rgba(255,255,255,0.55)';c.fillText('MR. ANDUV!',w-h*0.12,dar?h*0.16:h*0.22);}
  // LED dokusu ve parlaklık
  c.fillStyle='rgba(255,255,255,0.10)';c.fillRect(0,0,w,h*0.08);
  c.fillStyle='rgba(0,0,0,0.25)';c.fillRect(0,h*0.93,w,h*0.07);
  const ad2=Math.max(1.2,h/14);c.fillStyle='rgba(0,0,0,0.10)';for(let y=0;y<h;y+=ad2)c.fillRect(0,y,w,ad2*0.3);
  if(onbellek.size>80)onbellek.clear();
  onbellek.set(k,cv);return cv;
}
function ciz(ctx,A,x,y,w,h,o){const cv=afisTuval(A,w,h,o);ctx.drawImage(cv,x,y,w,h);}

G.MrPano={afisTuval,ciz,SAHNE,simgeler:Object.keys(SAHNE)};
})(typeof window!=='undefined'?window:globalThis);
